# Mervo Mobile (Expo)

Expo-managed React Native app for Contractors. Implements login, jobs, job execution, offline queue, photo capture/compression, push notifications, and earnings. Parity with web API types via SDK packages.

## Prereqs
- Node 18+
- Yarn or npm
- Expo CLI (`npm i -g expo`)
- Xcode (iOS) / Android Studio + SDKs

## Getting started
```bash
yarn install
yarn mobile:start
```

## Env
Copy `.env.example` to `.env` and set values:
- `MOBILE_API_BASE` – API base URL
- `MOBILE_SUPABASE_URL` / `MOBILE_SUPABASE_ANON_KEY` – placeholder until wired
- `MOBILE_SENTRY_DSN` – optional error reporting
- `APP_TAG` – channel tag (e.g., `staging`)

## Scripts
- `yarn mobile:start` – expo start
- `yarn mobile:android` / `yarn mobile:ios` – run on device/simulator
- `yarn mobile:build` – EAS build (guarded by secrets)
- `yarn mobile:test` – Jest unit tests

## Offline + storage
- AsyncStorage-backed queue with retry/backoff and GC by age/retentionDays
- Photo capture via `expo-image-picker` with JS compression fallback
- Pending items are synced on resume + background fetch hooks (stub)

## Push notifications
- Uses `expo-notifications` to request permissions and register device tokens
- TODO: Configure provider keys in Expo dashboard / native Google/Apple configs

## Native workflow
- Default: Expo-managed. Eject with `npx expo prebuild` if you need custom native modules
- Native keys: add GoogleService-Info.plist (iOS) / google-services.json (Android), update entitlements for background fetch/notifications (see `mobile/docs/NOTES_NATIVE_SETUP.md`)

## Known limitations
- API calls are stubbed; wire to backend once ready
- Offline queue uses simple JSON records; migrate to WatermelonDB if you need conflict resolution
- Background fetch scheduling is outlined but not enabled by default

## Store readiness
See `mobile/docs/APP_STORE_PREP.md` and `mobile/docs/PLAY_STORE_PREP.md` for metadata, screenshots, and privacy justifications.
