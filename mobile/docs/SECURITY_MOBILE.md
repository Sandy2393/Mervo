# Mobile Security Notes

- Store auth tokens in secure storage (Expo SecureStore or Keychain/Keystore) — TODO: wire into AuthContext.
- Avoid embedding service-role or admin keys; use short-lived tokens issued by backend.
- Validate push tokens server-side before sending notifications.
- Use HTTPS everywhere; pin if required by customers.
- Wipe local cached photos after successful upload and after retentionDays window.
- Obfuscate release builds (ProGuard/Minify) and strip logs for production.
