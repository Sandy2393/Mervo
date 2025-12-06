# @app-id/sdk-js

Lightweight JS SDK for Mervo APIs (auth, jobs, reports, timesheets, earnings). Typed, promise-based, optional fetch override.

## Install
```
npm install @app-id/sdk-js
```

## Usage
```ts
import { login, listJobs } from "@app-id/sdk-js";

const auth = await login({ email: "worker@example.com", password: "pass" });
const jobs = await listJobs({ token: auth.token, baseUrl: process.env.MOBILE_API_BASE });
```

## Config
- `baseUrl` (optional): override API base; defaults to `MOBILE_API_BASE`
- `fetchFn` (optional): inject test/durable fetch

## Publishing
- TODO: set real package name and visibility
- Bump version, run build, publish with npm token (manual)
- Keep changelog and tags in sync; see `mobile/docs/SDK_PUBLISH.md`
