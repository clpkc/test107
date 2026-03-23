# Implementation Plan: Lunch Restaurant Picker

**Branch**: `001-pick-lunch-restaurant` | **Date**: 2026-03-23 | **Spec**: [/workspaces/test107/specs/001-pick-lunch-restaurant/spec.md](spec.md)
**Input**: Feature specification from `/specs/001-pick-lunch-restaurant/spec.md`

## Summary

Build a web app with a thin server that fetches and parses OpenRice HTML server-side,
exposes `GET /api/pick?lat=...&lng=...&radius=1000`, and returns exactly one uniformly
random nearby restaurant result (<=1000m). The frontend is a single page with one
primary button labeled `Pick a Restaurant` and a result card. Server design includes a
`RestaurantProvider` abstraction, caching, rate limiting, and bounded retries.

## Technical Context

**Language/Version**: TypeScript 5.x on Node.js 20 LTS  
**Primary Dependencies**: Express (or Fastify), Cheerio, Zod, pino, Vitest, Supertest, node-cache (or Redis adapter-ready cache wrapper)  
**Storage**: In-memory cache for v1; no persistent DB required  
**Testing**: Vitest + coverage, plus endpoint integration tests with Supertest  
**Target Platform**: Linux container/server with modern evergreen browsers
**Project Type**: Web application (frontend + backend)  
**Performance Goals**: p95 API response <= 3s under normal source availability; one-result response per click  
**Constraints**: Inclusive radius <=1000m, max 3 OpenRice origin requests/click, cache TTL 10m, 30 req/min and burst 5/10s, no precise coordinate persistence  
**Scale/Scope**: v1 single-feature app, low-to-moderate traffic, one primary user journey

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- Single-feature scope: PASS
  - One primary button labeled `Pick a Restaurant`, one result per action.
- Session-only location privacy: PASS
  - Coordinates are request/session scoped and excluded from persistent logs/storage.
- Responsible OpenRice access: PASS
  - Server-side request cap, cache, limiter, and bounded retries included.
- Testable core selection logic: PASS
  - Unit tests for distance, radius filtering, dedupe, and randomization planned.
- Complete result display with fallback: PASS
  - Contract and frontend explicitly require `Not available` fallback behavior.

Post-design re-check: PASS (design artifacts preserve all gates).

## Project Structure

### Documentation (this feature)

```text
specs/001-pick-lunch-restaurant/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── pick-api.yaml
└── tasks.md
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── api/
│   │   └── pickRoute.ts
│   ├── providers/
│   │   ├── RestaurantProvider.ts
│   │   └── OpenRiceRestaurantProvider.ts
│   ├── services/
│   │   ├── pickService.ts
│   │   ├── distanceService.ts
│   │   ├── dedupeService.ts
│   │   ├── randomService.ts
│   │   ├── cacheService.ts
│   │   └── rateLimitService.ts
│   ├── parsers/
│   │   └── openRiceParser.ts
│   ├── models/
│   │   └── restaurant.ts
│   └── app.ts
└── tests/
    ├── unit/
    │   ├── distanceService.test.ts
    │   ├── radiusFilter.test.ts
    │   ├── dedupeService.test.ts
    │   └── randomService.test.ts
    └── integration/
        └── pickRoute.test.ts

frontend/
├── src/
│   ├── pages/
│   │   └── HomePage.tsx
│   ├── components/
│   │   ├── PickButton.tsx
│   │   └── ResultCard.tsx
│   └── services/
│       └── pickApiClient.ts
└── tests/
    └── unit/
        └── resultCard.test.tsx
```

**Structure Decision**: Option 2 (web application) selected to keep parsing and source
protection server-side while keeping UI minimal and focused.

## Phase 0: Research Output Summary

Resolved decisions are documented in [research.md](research.md):
- Thin server architecture
- Provider abstraction
- Coordinate extraction fallback strategy
- Request/caching/rate-limit policy
- Uniform random selection + deterministic tests
- Stable API payload contract

## Phase 1: Design & Contracts

Artifacts generated:
- Data model: [data-model.md](data-model.md)
- API contract: [contracts/pick-api.yaml](contracts/pick-api.yaml)
- Quickstart: [quickstart.md](quickstart.md)

## Implementation Notes

- `RestaurantProvider` interface MUST encapsulate source retrieval and candidate parsing.
- OpenRice provider implementation MUST apply request cap, cache lookup/store, and retry policy.
- Endpoint returns normalized payload:
  `{ id, name, address, cuisine[], priceRange, photos[], sourceUrl, distanceMeters }`.
- Frontend must render `Not available` per field when value absent.
- Random selection utility must support seed injection for deterministic unit tests.

## Complexity Tracking

No constitution violations identified; no complexity exceptions required.
