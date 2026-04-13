# Verification Matrix

## Scope

This checklist validates the TV app behavior after modular rework.

## Automated Gate

1. Run `npm run verify`.
2. Confirm both lint and build pass.

## Functional Parity

1. Token bootstrap:
- Open `/token`, enter valid token, submit.
- Expect redirect to `/` and promotion loading.

2. Saved token restore:
- Reload app after successful save.
- Expect automatic login from local storage.

3. Invalid token handling:
- Use an invalid token.
- Expect error path and redirect back to `/token`.

4. Promotions rotation:
- With multiple promotions, verify auto rotation across cards.
- With large details list, verify detail page rotation inside a promotion.

## Resilience and Offline Policy

1. Warm-cache transient outage:
- Load live data once.
- Simulate API/network failure.
- Expect stale banner and stale status in metadata strip.

2. Offline lock threshold:
- Simulate stale age greater than 12 hours.
- Expect full-screen offline state.

3. Recovery from offline:
- Restore API/network.
- Expect transition back to live success state and updated sync metadata.

## Contract Safety

1. Malformed payload:
- Return response with `success=true` but malformed `data` fields.
- Expect controlled error/stale fallback behavior without runtime crash.

## UI and Accessibility

1. Readability and density:
- Validate on 1920x1080, 3840x2160, and desktop fallback.
- Check headline, row data, and pills are readable from typical TV distance.

2. Reduced motion:
- Enable `prefers-reduced-motion` in browser settings.
- Expect no animated transitions.

3. Screen state announcements:
- Validate status states (`loading`, `error`, `offline`) include live/alert semantics.

## Telemetry Smoke Check

1. Set `VITE_TV_LOG_LEVEL=info` and run dev.
2. Verify logs appear for:
- `promotions.fetch.start`
- `promotions.fetch.success` or `promotions.sync.failed`
- `promotions.stale.fallback` and `promotions.offline.entered` when applicable
