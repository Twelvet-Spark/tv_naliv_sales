# Release Rollout Checklist

## Pre-Release

1. Confirm `npm run verify` is green.
2. Confirm verification matrix was executed:
- See `docs/verification-matrix.md`.
3. Confirm deployment env values are set:
- `VITE_TV_API_URL`
- `VITE_TV_BUSINESS_TOKEN` (optional bootstrap)
- `VITE_TV_LOG_LEVEL` (optional)

## Deployment

1. Build and publish container image.
2. Roll out to staging domain first.
3. Validate `/token` flow on at least one real TV device.
4. Promote to production domain after staging signoff.

## Post-Release Monitoring

1. Watch telemetry logs for first 30-60 minutes.
2. Track frequency of:
- `promotions.sync.failed`
- `promotions.token.invalid`
- `promotions.offline.entered`
3. Confirm no crash logs (`app.crashed`).

## Rollback Strategy

1. Keep previous stable container image tag.
2. If critical issues occur:
- Roll back service to previous tag.
- Purge CDN/cache if required.
- Re-check token login path.
3. Log incident details and affected timeframe.

## Signoff

1. Product signoff: UX/readability and terminology (Акции).
2. Technical signoff: stability and performance.
3. Operations signoff: deployment and rollback readiness.
