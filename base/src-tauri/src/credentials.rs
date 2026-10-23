use keyring::{Entry, Error as KeyringError};
use serde::{Deserialize, Serialize};
use std::path::Path;
use tauri::{AppHandle, Manager};

use crate::error::{AppError, AppResult};

#[derive(Serialize, Deserialize)]
struct Tokens {
    access_token: String,
    refresh_token: Option<String>,
}

trait SecretEntry {
    fn read(&self) -> keyring::Result<String>;
    fn write(&self, value: &str) -> keyring::Result<()>;
    fn delete(&self) -> keyring::Result<()>;
}

impl SecretEntry for Entry {
    fn read(&self) -> keyring::Result<String> {
        self.get_password()
    }

    fn write(&self, value: &str) -> keyring::Result<()> {
        self.set_password(value)
    }

    fn delete(&self) -> keyring::Result<()> {
        self.delete_credential()
    }
}

fn storage_error(operation: &str, error: impl std::fmt::Display) -> AppError {
    AppError::CredentialStore(format!("Could not {operation} credentials: {error}"))
}

fn clear_legacy_file(path: &Path) -> AppResult<()> {
    match std::fs::remove_file(path) {
        Ok(()) => Ok(()),
        Err(error) if error.kind() == std::io::ErrorKind::NotFound => Ok(()),
        Err(error) => Err(storage_error("remove the legacy credential file", error)),
    }
}

fn entry(app: &AppHandle, provider: &str) -> AppResult<Entry> {
    let directory = app
        .path()
        .app_data_dir()
        .map_err(|error| storage_error("locate", error))?;
    clear_legacy_file(&directory.join("auth.json"))?;
    Entry::new(&app.config().identifier, &format!("oauth/{provider}"))
        .map_err(|error| storage_error("open the operating system vault for", error))
}

fn read_tokens(entry: &impl SecretEntry) -> AppResult<Option<Tokens>> {
    let value = match entry.read() {
        Ok(value) => value,
        Err(KeyringError::NoEntry) => return Ok(None),
        Err(error) => return Err(storage_error("read", error)),
    };
    let tokens: Tokens = serde_json::from_str(&value).map_err(|_| {
        storage_error(
            "read",
            "the vault entry is invalid; sign out and sign in again",
        )
    })?;
    if tokens.access_token.is_empty() {
        return Err(storage_error("read", "the vault entry has no access token"));
    }
    Ok(Some(tokens))
}

fn write_tokens(
    entry: &impl SecretEntry,
    access_token: String,
    refresh_token: Option<String>,
) -> AppResult<()> {
    if access_token.is_empty() || refresh_token.as_ref().is_some_and(String::is_empty) {
        return Err(storage_error("save", "empty tokens are not allowed"));
    }
    let refresh_token = match refresh_token {
        Some(token) => Some(token),
        None => read_tokens(entry)?.and_then(|tokens| tokens.refresh_token),
    };
    let value = serde_json::to_string(&Tokens {
        access_token,
        refresh_token,
    })
    .map_err(|error| storage_error("encode", error))?;
    entry
        .write(&value)
        .map_err(|error| storage_error("save", error))
}

fn delete_tokens(entry: &impl SecretEntry) -> AppResult<()> {
    match entry.delete() {
        Ok(()) | Err(KeyringError::NoEntry) => Ok(()),
        Err(error) => Err(storage_error("delete", error)),
    }
}

pub async fn save(
    app: &AppHandle,
    provider: &'static str,
    access_token: &str,
    refresh_token: Option<&str>,
) -> AppResult<()> {
    let app = app.clone();
    let access_token = access_token.to_owned();
    let refresh_token = refresh_token.map(str::to_owned);
    tauri::async_runtime::spawn_blocking(move || {
        write_tokens(&entry(&app, provider)?, access_token, refresh_token)
    })
    .await
    .map_err(|error| storage_error("save", error))?
}

pub async fn load(app: &AppHandle, provider: &'static str) -> AppResult<Option<String>> {
    let app = app.clone();
    tauri::async_runtime::spawn_blocking(move || {
        read_tokens(&entry(&app, provider)?).map(|tokens| tokens.map(|tokens| tokens.access_token))
    })
    .await
    .map_err(|error| storage_error("read", error))?
}

pub async fn remove(app: &AppHandle, provider: &'static str) -> AppResult<()> {
    let app = app.clone();
    tauri::async_runtime::spawn_blocking(move || delete_tokens(&entry(&app, provider)?))
        .await
        .map_err(|error| storage_error("delete", error))?
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::cell::RefCell;

    #[derive(Default)]
    struct MemoryEntry {
        value: RefCell<Option<String>>,
        fail: bool,
    }

    impl SecretEntry for MemoryEntry {
        fn read(&self) -> keyring::Result<String> {
            if self.fail {
                return Err(KeyringError::NoDefaultStore);
            }
            self.value.borrow().clone().ok_or(KeyringError::NoEntry)
        }

        fn write(&self, value: &str) -> keyring::Result<()> {
            if self.fail {
                return Err(KeyringError::NoDefaultStore);
            }
            *self.value.borrow_mut() = Some(value.to_owned());
            Ok(())
        }

        fn delete(&self) -> keyring::Result<()> {
            if self.fail {
                return Err(KeyringError::NoDefaultStore);
            }
            self.value
                .borrow_mut()
                .take()
                .map(|_| ())
                .ok_or(KeyringError::NoEntry)
        }
    }

    #[test]
    fn credentials_round_trip_and_logout_is_idempotent() {
        let entry = MemoryEntry::default();
        assert!(read_tokens(&entry).unwrap().is_none());
        write_tokens(&entry, "access".into(), None).unwrap();
        assert_eq!(read_tokens(&entry).unwrap().unwrap().access_token, "access");
        delete_tokens(&entry).unwrap();
        delete_tokens(&entry).unwrap();
        assert!(read_tokens(&entry).unwrap().is_none());
    }

    #[test]
    fn absent_refresh_token_preserves_existing_refresh_token() {
        let entry = MemoryEntry::default();
        write_tokens(&entry, "access".into(), Some("refresh".into())).unwrap();
        write_tokens(&entry, "new-access".into(), None).unwrap();
        let tokens = read_tokens(&entry).unwrap().unwrap();
        assert_eq!(tokens.access_token, "new-access");
        assert_eq!(tokens.refresh_token.as_deref(), Some("refresh"));
        write_tokens(&entry, "next-access".into(), Some("next-refresh".into())).unwrap();
        assert_eq!(
            read_tokens(&entry)
                .unwrap()
                .unwrap()
                .refresh_token
                .as_deref(),
            Some("next-refresh")
        );
    }

    #[test]
    fn unavailable_vault_fails_closed() {
        let entry = MemoryEntry {
            fail: true,
            ..MemoryEntry::default()
        };
        assert!(read_tokens(&entry).is_err());
        assert!(write_tokens(&entry, "access".into(), Some("refresh".into())).is_err());
        assert!(delete_tokens(&entry).is_err());
        assert!(entry.value.borrow().is_none());
    }

    #[test]
    fn malformed_or_empty_credentials_never_authenticate() {
        let entry = MemoryEntry::default();
        *entry.value.borrow_mut() = Some("private-invalid-value".into());
        let error = read_tokens(&entry).err().unwrap().to_string();
        assert!(!error.contains("private-invalid-value"));
        *entry.value.borrow_mut() = None;
        assert!(write_tokens(&entry, String::new(), None).is_err());
        assert!(entry.value.borrow().is_none());
    }

    #[test]
    fn legacy_credentials_are_deleted_without_parsing_or_importing() {
        let path = std::env::temp_dir().join(format!(
            "crabyard-legacy-auth-{}-{}.json",
            std::process::id(),
            std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .unwrap()
                .as_nanos()
        ));
        std::fs::write(&path, [0xff, 0xfe, 0x00]).unwrap();
        clear_legacy_file(&path).unwrap();
        assert!(!path.exists());
        clear_legacy_file(&path).unwrap();
    }
}
