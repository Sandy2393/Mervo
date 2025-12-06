# Connector Manifest Schema

Fields:
- `id`: string
- `name`: string
- `description`: string
- `required_permissions`: array of event types
- `required_oauth_scopes`: optional array
- `supported_events`: array of event keys
- `ui_settings`: optional metadata for marketplace cards/screenshots

Example:
```json
{
  "id": "slack-notifier",
  "name": "Slack Notifier",
  "description": "Send job updates to Slack",
  "required_permissions": ["job.created", "job.completed"],
  "required_oauth_scopes": [],
  "supported_events": ["job.created", "job.completed"],
  "ui_settings": { "rating": 4.8 }
}
```
