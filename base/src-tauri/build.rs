#[path = "src/public_config.rs"]
mod public_config;

fn main() {
    for name in ["GITHUB_CLIENT_ID", "GOOGLE_CLIENT_ID"] {
        println!("cargo:rerun-if-env-changed={name}");
        if let Ok(value) = std::env::var(name)
            && let Some(value) = public_config::oauth_client_id(Some(&value), None)
        {
            println!("cargo:rustc-env={name}={value}");
        }
    }
    tauri_build::build()
}
