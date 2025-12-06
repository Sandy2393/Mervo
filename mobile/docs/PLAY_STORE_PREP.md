# Play Store Prep (Android)

## Metadata
- Title: Mervo Contractor
- Short description: View jobs, clock time, upload photos
- Full description: Contractors can see today’s assignments, clock in/out, capture proof-of-work photos, and sync offline.
- Contact email/URL: support@example.com / https://example.com/support
- Privacy Policy URL: https://example.com/privacy

## Assets
- Feature graphic 1024x500
- Screenshots: phone (portrait) for dashboard, job, photo capture, offline queue, earnings
- App icon 512x512

## Release tracks
- Internal testing -> Closed testing -> Production
- Use app signing by Google Play (recommended)
- Bundle target: AAB; minSdk per Expo default

## Permissions justification
- Camera for photos
- Location (coarse/fine) for job presence
- Notifications for assignments
- Background sync (optional) for queued actions

## Manual steps (TODO)
- Upload `google-services.json` for push (Firebase) under Android app id
- Configure Play Console Data safety form with collection/usage notes
- Add testers and opt-in URL for closed testing
