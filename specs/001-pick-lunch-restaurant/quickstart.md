# Quickstart: Lunch Restaurant Picker (v1)

## Overview
This feature provides a one-tap lunch pick flow:
- Frontend page with one primary button labeled `Pick a Restaurant`
- Backend endpoint `GET /api/pick?lat=...&lng=...&radius=1000`
- Server-side OpenRice fetching/parsing through a provider interface

## Prerequisites
- Runtime: Node.js 20+ (or equivalent runtime chosen in implementation)
- Internet access for OpenRice source fetches
- Location permission in browser (or manual fallback input)

## Run (Example)
1. Start backend and frontend.
2. Open the app in browser.
3. Grant location permission, or deny and use manual location fallback.
4. Press `Pick a Restaurant`.
5. Verify a single result card appears with:
   - name
   - address
   - cuisine
   - price range
   - photos (or `Not available`)

## API Smoke Test
Example request:

```bash
curl "http://localhost:3000/api/pick?lat=22.3193&lng=114.1694&radius=1000"
```

Expected success payload shape:

```json
{
  "id": "openrice:some-id",
  "name": "Restaurant Name",
  "address": "Address",
  "cuisine": ["Hong Kong", "Cafe"],
  "priceRange": "$101-200",
  "photos": ["https://..."],
  "sourceUrl": "https://www.openrice.com/...",
  "distanceMeters": 623
}
```

## Required Validation Cases
- Permission denied -> manual fallback works
- No restaurants within 1000m -> clear no-results message
- Source unavailable/parsing failure -> clear retryable error message
- Missing fields -> frontend shows `Not available`

## Unit Test Targets
- Distance calculation
- Radius filter (inclusive <=1000m)
- Deduplication by canonical URL
- Uniform random selection with deterministic seed injection

## Compliance Notes
- Max 3 OpenRice origin requests per click
- Cache TTL 10 minutes with normalized URL cache key
- Rate limit 30 req/min with 5 per 10s burst
- No persistent storage/logging of precise coordinates
