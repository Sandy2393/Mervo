# Detox Config (placeholder)

Detox not fully wired; use as starting point.

## Sample `.detoxrc.json`
```json
{
  "testRunner": "jest",
  "runnerConfig": "e2e/config.json",
  "apps": {
    "ios.sim.debug": {
      "type": "ios.app",
      "binaryPath": "bin/Mervo.app",
      "build": "echo 'TODO build iOS debug binary'"
    }
  },
  "devices": {
    "simulator": {
      "type": "ios.simulator",
      "device": { "type": "iPhone 15" }
    }
  },
  "configurations": {
    "ios.sim.debug": {
      "device": "simulator",
      "app": "ios.sim.debug"
    }
  }
}
```

## Notes
- Do not enable real builds in CI until signing is configured.
- For Android, add analogous block with apk/aab path.
- Alternative: Playwright-mobile/Web for simple flows if Detox infra unavailable.
