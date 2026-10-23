pub fn oauth_client_id(runtime: Option<&str>, embedded: Option<&str>) -> Option<String> {
    runtime
        .into_iter()
        .chain(embedded)
        .map(str::trim)
        .find(|value| {
            !value.is_empty()
                && !value.to_ascii_lowercase().starts_with("your_")
                && !value.to_ascii_lowercase().contains("placeholder")
                && value
                    .bytes()
                    .all(|byte| byte.is_ascii_alphanumeric() || b"._-".contains(&byte))
        })
        .map(str::to_owned)
}

#[cfg(test)]
mod tests {
    use super::oauth_client_id;

    #[test]
    fn installed_apps_use_the_embedded_public_id() {
        assert_eq!(
            oauth_client_id(None, Some("123.apps.googleusercontent.com")).as_deref(),
            Some("123.apps.googleusercontent.com")
        );
    }

    #[test]
    fn valid_runtime_configuration_takes_precedence() {
        assert_eq!(
            oauth_client_id(Some(" runtime-id "), Some("embedded-id")).as_deref(),
            Some("runtime-id")
        );
    }

    #[test]
    fn placeholders_and_invalid_values_never_configure_authentication() {
        for value in [
            "",
            "your_github_client_id_here",
            "PLACEHOLDER",
            "invalid\nvalue",
        ] {
            assert!(oauth_client_id(Some(value), None).is_none());
            assert_eq!(
                oauth_client_id(Some(value), Some("embedded-id")).as_deref(),
                Some("embedded-id")
            );
        }
    }
}
