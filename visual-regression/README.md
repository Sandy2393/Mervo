# Visual Regression Testing

This directory contains placeholders and instructions for setting up visual regression testing.

## Tools

We recommend one of the following tools for visual regression:

1. **Percy** (https://percy.io) — AI-powered visual testing
2. **Chromatic** (https://chromatic.com) — Built for Storybook
3. **Pixelmatch** — Local visual diff tool

## Setup Instructions

### Percy

1. Install the CLI:
   ```bash
   npm install --save-dev @percy/cli
   ```

2. Create `.percyrc` in the project root:
   ```json
   {
     "version": 2,
     "discovery": {
       "enabled": true
     }
   }
   ```

3. Run Percy with Cypress:
   ```bash
   percy exec -- npm run test:e2e
   ```

### Chromatic

1. Install Storybook and Chromatic:
   ```bash
   npm install --save-dev @storybook/react chromatic
   ```

2. Deploy to Chromatic:
   ```bash
   npx chromatic --project-token YOUR_TOKEN
   ```

### Local Pixelmatch (Light-weight)

1. Install pixelmatch:
   ```bash
   npm install --save-dev pixelmatch
   ```

2. Create baseline screenshots:
   ```bash
   npm run screenshot:baseline
   ```

3. Compare on each test run:
   ```bash
   npm run screenshot:diff
   ```

## CI Integration

Add to `.github/workflows/visual-regression.yml`:

```yaml
name: Visual Regression
on: [pull_request]

jobs:
  visual-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - run: npx percy exec -- npm run test:e2e
```

## Screenshots

Store baseline screenshots in `/visual-regression/baseline/` and diffs in `/visual-regression/diffs/`.

## Guidelines

- Test critical user flows: login, dashboard, job creation, contractor views
- Run on multiple viewport sizes (mobile, tablet, desktop)
- Review visual changes before approving PRs
- Keep baseline images version controlled
