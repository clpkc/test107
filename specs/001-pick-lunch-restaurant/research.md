# Research: Lunch Restaurant Picker (v1)

## Decision 1: Web App with Thin Server
- Decision: Use a server-rendered/static frontend with a thin backend endpoint at `/api/pick`.
- Rationale: Keeps OpenRice HTML fetching/parsing server-side, protects scraping logic, and allows centralized request budget, caching, and rate limiting.
- Alternatives considered:
  - Pure frontend fetching: rejected due to CORS, anti-bot fragility, and policy control limits.
  - Heavy backend service with persistence: rejected for v1 scope simplicity.

## Decision 2: Provider Abstraction
- Decision: Define a `RestaurantProvider` interface and implement `OpenRiceRestaurantProvider` for v1.
- Rationale: Allows parser/data-source replacement without changing selection or API layers.
- Alternatives considered:
  - Direct OpenRice parser in endpoint: rejected due to tight coupling.

## Decision 3: Coordinate Resolution Strategy
- Decision: Extract coordinates from OpenRice page metadata first, then fallback to address geocoding; exclude restaurants if coordinates remain unavailable.
- Rationale: Preserves <=1000m filtering correctness without guessing coordinates.
- Alternatives considered:
  - Include restaurants without coordinates: rejected because radius requirement becomes unverifiable.

## Decision 4: Caching and Request Budget
- Decision: Enforce max 3 OpenRice origin requests per click, URL-normalized cache key, TTL 10 minutes.
- Rationale: Meets anti-crawling constraints and reduces repeat load.
- Alternatives considered:
  - No cache: rejected due to repeated origin hits.
  - Unlimited requests with backoff: rejected as non-compliant and risky.

## Decision 5: Rate Limiting and Retry
- Decision: Server-side limiter at 30 req/min with 5 requests/10s burst; retries only for 429/5xx/timeout, max 2 attempts with exponential backoff + jitter.
- Rationale: Prevents interference with source and keeps behavior predictable.
- Alternatives considered:
  - Aggressive retries: rejected due to request amplification risk.

## Decision 6: Selection Fairness and Testability
- Decision: Deduplicate by canonical source URL, choose uniformly random over eligible deduplicated pool, and inject deterministic RNG in tests.
- Rationale: Ensures fairness and reproducible unit tests.
- Alternatives considered:
  - Weighted or heuristic ranking: rejected for v1 one-tap simplicity.

## Decision 7: API Contract
- Decision: Backend returns `{ id, name, address, cuisine[], priceRange, photos[], sourceUrl, distanceMeters }`.
- Rationale: Matches frontend card requirements and keeps response minimal.
- Alternatives considered:
  - Return raw scraped payload: rejected due to unstable schema.
