# Google Drive Export Connector (example)

- Flow: OAuth 2.0 (Drive file scope) -> store refresh token in secure store (TODO)
- Supported events: job.completed -> upload report JSON/PDF to a folder
- Manifest example:
```json
{
  "id": "google-drive",
  "name": "Google Drive Export",
  "description": "Export job reports to Drive",
  "required_permissions": ["job.completed"],
  "required_oauth_scopes": ["https://www.googleapis.com/auth/drive.file"],
  "supported_events": ["job.completed"]
}
```
- Handler sketch:
```ts
import { createHandler, httpPost } from "@app-id/connectors-sdk";
export default createHandler({
  async onEvent(event, payload) {
    // TODO: refresh access token using stored secret
    // TODO: upload file to Drive via drive.files.create
    return { ok: true };
  }
});
```
- TODO: Implement OAuth redirect Edge Function and store tokens in Secret Manager.
