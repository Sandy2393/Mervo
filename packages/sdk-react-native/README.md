# @app-id/sdk-react-native

React Native wrapper around `@app-id/sdk-js` with device helpers (device id, push registration, photo upload helper, offline queue sync).

## Install
```
npm install @app-id/sdk-js @app-id/sdk-react-native
```

## Usage
```ts
import { getDeviceId, registerDevice, syncOfflineQueue, uploadPhotoFromLocalPath } from "@app-id/sdk-react-native";

const id = getDeviceId();
await registerDevice({ pushToken: "expo-abc" });
await syncOfflineQueue({ queue, token: authToken, baseUrl: process.env.MOBILE_API_BASE });
```

## Permissions
- Camera + media library for photo upload
- Notifications for push tokens
- Location for job presence checks

## Native setup
- Add GoogleService-Info.plist / google-services.json for push (see `mobile/docs/NOTES_NATIVE_SETUP.md`)
- Enable background fetch + remote notifications entitlements (iOS)

## Publishing
- TODO: update package name and versioning
- Publish via npm with org token after CI passes; see `mobile/docs/SDK_PUBLISH.md`
