# JobExecution E2E Plan (Detox/Playwright-mobile placeholder)

Goal: Happy path for Contractor clock in, upload photo, submit report while offline and sync when back online.

## Preconditions
- Test build installed on simulator/emulator
- Test user credentials available (no secrets in repo)
- API base pointed to staging sandbox

## Steps
1) Launch app -> login screen -> enter test creds -> land on Dashboard
2) Toggle network offline (simulator setting)
3) Open first job -> tap "Clock In" (expect local queue increment)
4) Capture photo -> see preview -> ensure queued upload
5) Tap "Submit Report" -> expect queue increment
6) Toggle network online
7) Trigger sync (background or via Settings "Sync now" if added) -> expect queue drains
8) Verify server shows clock in/out and photo received (manual API check)
9) Assert app shows status updated and no pending offline items

## Notes
- Automation: use Detox `device.setURLBlacklist` or similar for offline simulation
- Keep builds unsigned; do not hit production keys
- Logs: capture device logs for sync failures
