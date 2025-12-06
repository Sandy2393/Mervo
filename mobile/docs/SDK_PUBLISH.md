# SDK Publish Guide

Packages: `@app-id/sdk-js`, `@app-id/sdk-react-native`.

## Versioning
- Semantic versioning; align mobile app with SDK minor versions
- Tag releases: `sdk-js-vX.Y.Z`, `sdk-rn-vX.Y.Z`

## Steps
1) Update changelog and package versions
2) Run tests: `yarn mobile:test` and any SDK-specific suites
3) Build SDKs (tsc) and ensure types emit
4) Login to npm (manual) with org token (do not commit token)
5) `npm publish --access public` per package (or private if required)
6) Create Git tag and release notes

## Notes
- Keep API types consistent with backend schema; update `packages/sdk-js/src/types.ts` when web types change
- Consider generating clients from OpenAPI once available
