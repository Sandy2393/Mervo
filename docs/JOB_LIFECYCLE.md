# Job Lifecycle

1) Create job (draft) with schedule, geofence, payment, recurrence
2) Publish job -> generate instances across date range
3) Assign instances (direct) or publish to marketplace
4) Contractor accepts/declines instance
5) Clock-in with geofence check; clock-out records duration
6) Upload before/after photos, fill checklist, submit report
7) Admin reviews report, accepts/rejects with comment
8) On approval: generate PDF, store path, trigger payment/approval
9) Bulk PDFs: generate for date range -> zip + manifest

Timestamps: store event_time and server_received_at (UTC). Audit all transitions.
