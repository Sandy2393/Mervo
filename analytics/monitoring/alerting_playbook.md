# Alerting Playbook

1) Identify failing check and affected table/date.
2) Pause downstream DAGs to avoid propagating bad data.
3) Re-run ingestion for impacted partitions with `--confirm` after validation.
4) Notify owners via Slack/email (data team + domain owner).
5) Document incident and resolution.
