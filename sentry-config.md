# Sentry Integration (instructions only)

This project supports Sentry for error monitoring. DO NOT store DSNs in source.

Steps to enable Sentry:

1. Create a Sentry project for your application (https://sentry.io).
2. Obtain the DSN (client) and optionally an auth token (server-side) and store them in your deployment platform secrets as `SENTRY_DSN`.
3. Add the `SENTRY_DSN` to your environment for client-side error reporting when appropriate.
4. On the server, store monitoring API keys or auth tokens in your secret manager and use them for releasing, performance traces, or server-side reporting.

Example minimal snippet to initialize Sentry (client-side) — add to `src/main.tsx` or similar entry point:

```ts
// import * as Sentry from '@sentry/react';
// Sentry.init({dsn: process.env.SENTRY_DSN, tracesSampleRate: 0.1});
```

Security Note: It is recommended to keep performance and server-side monitoring keys in server secrets and protect them. Do not log secrets.
