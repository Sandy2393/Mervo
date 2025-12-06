# Native Setup Notes

## iOS
- Add `GoogleService-Info.plist` to `mobile/expo-app/ios` after running `npx expo prebuild` (TODO: download from Firebase).
- Enable capabilities: Background fetch, Remote notifications, Push notifications, Keychain sharing if using secure storage.
- Update `Info.plist` strings for camera/location rationale (already in app.json but double-check after prebuild).

## Android
- Add `google-services.json` under `mobile/expo-app/android/app` (TODO: download from Firebase project).
- Update `android/app/build.gradle` with applicationId matching `app.json` package.
- Provide signing keystore (do not commit) and configure in EAS/Gradle.
- Ensure permissions include camera, fine/coarse location, notifications.

## Keys and secrets
- Never commit service-role keys. Use EAS secrets or CI environment variables.
- Push tokens must be verified server-side before use.

## Ejecting
- Default is Expo-managed. If you need custom native modules, run `npx expo prebuild` then apply the above steps. Keep `app.json` in sync.
