# CS CRM Integration

## Providers
- HubSpot: contacts, companies, engagements. Auth via API key or OAuth (TODO).
- Zendesk: tickets. Auth via API token (TODO OAuth).
- Intercom: in-app messaging stub.

## Secrets
- HUBSPOT_API_KEY / HUBSPOT_OAUTH_TOKEN
- ZENDESK_API_TOKEN / ZENDESK_EMAIL / ZENDESK_SUBDOMAIN
- INTERCOM_ACCESS_TOKEN
- Store in secret manager; never in client.

## Mapping
- Company: name, domain, primary_contact_email
- Contact: email, first/last, companyId
- Tickets: subject, message, urgency, provider_ticket_id stored in DB

## Logs
- Store raw webhook payloads in `external_webhooks` table with event id and provider.
- Use idempotency keys for outbound actions.
