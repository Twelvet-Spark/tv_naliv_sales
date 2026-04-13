# Release Notes Template

## Version

- Release: `<tag-or-version>`
- Date: `<YYYY-MM-DD>`
- Environment: `<staging|production>`

## Summary

- Briefly describe what changed for TV clients.

## Included Changes

1. Functional updates
- ...

2. Reliability and resilience
- ...

3. UI/UX updates
- ...

4. Operational updates
- ...

## Verification Evidence

- `npm run verify`: `<pass|fail>`
- Verification matrix run: `<yes|no>`
- Devices tested:
  - 1080p TV: `<pass|fail>`
  - 4K TV: `<pass|fail>`
  - Desktop fallback: `<pass|fail>`

## Risk and Mitigation

- Known risks:
  - ...
- Mitigations:
  - ...

## Rollback

- Previous stable image/tag: `<value>`
- Rollback command/steps:
  1. ...
  2. ...

## Notes for Operations

- Required env vars:
  - `VITE_TV_API_URL`
  - `VITE_TV_BUSINESS_TOKEN` (optional bootstrap)
  - `VITE_TV_LOG_LEVEL` (optional)
  - `VITE_TV_RICH_UI` (optional staged rollout)
