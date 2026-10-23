use std::collections::BTreeMap;
use std::io::Write;
use std::path::{Path, PathBuf};
use std::sync::Mutex;

use serde::{Deserialize, Serialize};
use serde_json::Value;
use tauri::{AppHandle, Manager};

use crate::error::{AppError, AppResult};

const MAX_DOCUMENT_BYTES: usize = 1024 * 1024;
const MAX_STORE_BYTES: u64 = 64 * 1024 * 1024;

#[derive(Default)]
pub struct DocumentState(Mutex<()>);

#[derive(Clone, Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct LocalDocument {
    pub schema_version: u32,
    pub revision: u32,
    pub data: Value,
}

#[derive(Clone, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
struct StoreFile {
    format_version: u32,
    next_revision: u32,
    documents: BTreeMap<String, LocalDocument>,
}

struct Repository {
    path: PathBuf,
    store: StoreFile,
}

fn invalid(message: &str) -> AppError {
    AppError::Other(message.to_owned())
}

fn validate_name(name: &str) -> AppResult<()> {
    if name.is_empty()
        || name.len() > 64
        || !name
            .bytes()
            .all(|byte| byte.is_ascii_alphanumeric() || b"_-".contains(&byte))
    {
        return Err(invalid(
            "Document names must contain 1–64 ASCII letters, numbers, underscores, or hyphens",
        ));
    }
    Ok(())
}

impl Repository {
    fn open(directory: &Path) -> AppResult<Self> {
        let path = directory.join("documents.json");
        let store = match std::fs::metadata(&path) {
            Ok(metadata) => {
                if metadata.len() > MAX_STORE_BYTES {
                    return Err(invalid("Local data exceeds the storage limit"));
                }
                let store: StoreFile =
                    serde_json::from_slice(&std::fs::read(&path)?).map_err(|_| {
                        invalid("Local data is damaged; restore a backup before continuing")
                    })?;
                if store.format_version != 1
                    || store.next_revision == 0
                    || store.documents.values().any(|document| {
                        document.schema_version != 1
                            || document.revision == 0
                            || document.revision >= store.next_revision
                    })
                {
                    return Err(invalid("Local data needs a compatible application version"));
                }
                store
            }
            Err(error) if error.kind() == std::io::ErrorKind::NotFound => StoreFile {
                format_version: 1,
                next_revision: 1,
                documents: BTreeMap::new(),
            },
            Err(error) => return Err(error.into()),
        };
        Ok(Self { path, store })
    }

    fn get(&self, name: &str) -> AppResult<Option<LocalDocument>> {
        validate_name(name)?;
        Ok(self.store.documents.get(name).cloned())
    }

    fn put(
        &mut self,
        name: &str,
        expected_revision: Option<u32>,
        data: Value,
    ) -> AppResult<LocalDocument> {
        validate_name(name)?;
        let current = self.store.documents.get(name);
        if current.map(|document| document.revision) != expected_revision {
            return Err(invalid(
                "Document changed since it was loaded; reload before saving",
            ));
        }
        if serde_json::to_vec(&data)
            .map_err(|error| invalid(&error.to_string()))?
            .len()
            > MAX_DOCUMENT_BYTES
        {
            return Err(invalid("A document cannot exceed 1 MiB"));
        }
        if current.is_none() && self.store.documents.len() >= 1024 {
            return Err(invalid("The local document limit has been reached"));
        }
        let document = LocalDocument {
            schema_version: 1,
            revision: self.store.next_revision,
            data,
        };
        let mut next = self.store.clone();
        next.next_revision = next
            .next_revision
            .checked_add(1)
            .ok_or_else(|| invalid("Document revision limit reached"))?;
        next.documents.insert(name.to_owned(), document.clone());
        self.commit(next)?;
        Ok(document)
    }

    fn delete(&mut self, name: &str, expected_revision: u32) -> AppResult<()> {
        validate_name(name)?;
        if self
            .store
            .documents
            .get(name)
            .map(|document| document.revision)
            != Some(expected_revision)
        {
            return Err(invalid(
                "Document changed or was removed; reload before deleting",
            ));
        }
        let mut next = self.store.clone();
        next.documents.remove(name);
        self.commit(next)
    }

    fn commit(&mut self, next: StoreFile) -> AppResult<()> {
        let data = serde_json::to_vec(&next).map_err(|error| invalid(&error.to_string()))?;
        if data.len() as u64 > MAX_STORE_BYTES {
            return Err(invalid("Local data exceeds the storage limit"));
        }
        let directory = self
            .path
            .parent()
            .ok_or_else(|| invalid("Invalid local data path"))?;
        std::fs::create_dir_all(directory)?;
        let nonce = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .map_err(|error| invalid(&error.to_string()))?
            .as_nanos();
        let temporary = directory.join(format!(".documents-{}-{nonce}.tmp", std::process::id()));
        let result = (|| -> AppResult<()> {
            let mut file = std::fs::OpenOptions::new()
                .write(true)
                .create_new(true)
                .open(&temporary)?;
            file.write_all(&data)?;
            file.sync_all()?;
            drop(file);
            std::fs::rename(&temporary, &self.path)?;
            Ok(())
        })();
        if result.is_err() {
            let _ = std::fs::remove_file(&temporary);
        }
        result?;
        self.store = next;
        Ok(())
    }
}

fn with_repository<T>(
    app: &AppHandle,
    operation: impl FnOnce(&mut Repository) -> AppResult<T>,
) -> AppResult<T> {
    let state = app.state::<DocumentState>();
    let _guard = state
        .0
        .lock()
        .map_err(|_| invalid("Local data lock is unavailable"))?;
    let directory = app
        .path()
        .app_data_dir()
        .map_err(|error| invalid(&error.to_string()))?;
    operation(&mut Repository::open(&directory)?)
}

#[tauri::command]
pub async fn get_local_document(app: AppHandle, name: String) -> AppResult<Option<LocalDocument>> {
    tauri::async_runtime::spawn_blocking(move || {
        with_repository(&app, |repository| repository.get(&name))
    })
    .await
    .map_err(|error| invalid(&error.to_string()))?
}

#[tauri::command]
pub async fn put_local_document(
    app: AppHandle,
    name: String,
    expected_revision: Option<u32>,
    data: Value,
) -> AppResult<LocalDocument> {
    tauri::async_runtime::spawn_blocking(move || {
        with_repository(&app, |repository| {
            repository.put(&name, expected_revision, data)
        })
    })
    .await
    .map_err(|error| invalid(&error.to_string()))?
}

#[tauri::command]
pub async fn delete_local_document(
    app: AppHandle,
    name: String,
    expected_revision: u32,
) -> AppResult<()> {
    tauri::async_runtime::spawn_blocking(move || {
        with_repository(&app, |repository| {
            repository.delete(&name, expected_revision)
        })
    })
    .await
    .map_err(|error| invalid(&error.to_string()))?
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::json;

    struct TestDirectory(PathBuf);

    impl TestDirectory {
        fn new() -> Self {
            let nonce = std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .unwrap()
                .as_nanos();
            let path = std::env::temp_dir()
                .join(format!("crabyard-documents-{}-{nonce}", std::process::id()));
            std::fs::create_dir(&path).unwrap();
            Self(path)
        }
    }

    impl Drop for TestDirectory {
        fn drop(&mut self) {
            let _ = std::fs::remove_file(self.0.join("documents.json"));
            let _ = std::fs::remove_dir(&self.0);
        }
    }

    #[test]
    fn documents_survive_restart_and_delete() {
        let directory = TestDirectory::new();
        let first = Repository::open(&directory.0)
            .unwrap()
            .put("project", None, json!({"name":"First"}))
            .unwrap();
        let mut reopened = Repository::open(&directory.0).unwrap();
        assert_eq!(
            reopened.get("project").unwrap().unwrap().data["name"],
            "First"
        );
        let second = reopened
            .put("project", Some(first.revision), json!({"name":"Second"}))
            .unwrap();
        assert_eq!(second.revision, 2);
        reopened.delete("project", second.revision).unwrap();
        assert!(
            Repository::open(&directory.0)
                .unwrap()
                .get("project")
                .unwrap()
                .is_none()
        );
    }

    #[test]
    fn stale_writers_cannot_overwrite_or_delete_newer_data() {
        let directory = TestDirectory::new();
        let mut repository = Repository::open(&directory.0).unwrap();
        repository.put("project", None, json!("newer")).unwrap();
        assert!(repository.put("project", None, json!("stale")).is_err());
        assert!(repository.delete("project", 0).is_err());
        assert_eq!(
            Repository::open(&directory.0)
                .unwrap()
                .get("project")
                .unwrap()
                .unwrap()
                .data,
            "newer"
        );
    }

    #[test]
    fn invalid_names_and_oversized_documents_are_rejected() {
        let directory = TestDirectory::new();
        let mut repository = Repository::open(&directory.0).unwrap();
        assert!(repository.put("../outside", None, json!({})).is_err());
        assert!(
            repository
                .put("large", None, json!("x".repeat(MAX_DOCUMENT_BYTES)))
                .is_err()
        );
        assert!(!repository.path.exists());
    }

    #[test]
    fn recreating_a_document_does_not_reuse_an_old_revision() {
        let directory = TestDirectory::new();
        let mut repository = Repository::open(&directory.0).unwrap();
        let first = repository.put("project", None, json!("first")).unwrap();
        repository.delete("project", first.revision).unwrap();
        let replacement = repository
            .put("project", None, json!("replacement"))
            .unwrap();
        assert!(replacement.revision > first.revision);
        assert!(
            repository
                .put("project", Some(first.revision), json!("stale"))
                .is_err()
        );
    }

    #[test]
    fn damaged_or_newer_files_are_never_reset() {
        let directory = TestDirectory::new();
        let path = directory.0.join("documents.json");
        for contents in ["invalid", r#"{"formatVersion":2,"documents":{}}"#] {
            std::fs::write(&path, contents).unwrap();
            assert!(Repository::open(&directory.0).is_err());
            assert_eq!(std::fs::read_to_string(&path).unwrap(), contents);
        }
    }

    #[test]
    fn failed_disk_write_preserves_the_current_document() {
        let directory = TestDirectory::new();
        let mut repository = Repository::open(&directory.0).unwrap();
        repository.put("project", None, json!("saved")).unwrap();
        repository.path = directory.0.clone();
        assert!(
            repository
                .put("project", Some(1), json!("unsaved"))
                .is_err()
        );
        assert_eq!(repository.get("project").unwrap().unwrap().data, "saved");
        assert_eq!(
            Repository::open(&directory.0)
                .unwrap()
                .get("project")
                .unwrap()
                .unwrap()
                .data,
            "saved"
        );
    }
}
