# Reports

Generated markdown reports live here.

## Files
- `weekly_health_<date>.md`: from `scripts/weekly_health_check.sh`
- `feedback_digest_<date>.md`: from `scripts/send_feedback_digest.sh`
- `nightly_<date>.md`: from `scripts/nightly_report.sh`

## Rotation
- Keep 90 days of reports; archive older if needed. TODO: add cron cleanup.

## Scheduling Examples
- Cron (Linux): `0 2 * * * BASE_URL=... API_TOKEN=... /path/scripts/nightly_report.sh`
- Cloud Scheduler (placeholder): trigger HTTP endpoint that runs these scripts.

## Notes
- Scripts use placeholders and require env vars; they do not send data externally unless `--confirm` is used (where applicable).
