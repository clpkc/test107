# Data Model: Lunch Restaurant Picker (v1)

## Entity: UserLocation
- Description: Request-scoped user location context.
- Fields:
  - `lat` (float, required)
  - `lng` (float, required)
  - `source` (enum: `device` | `manual`, required)
- Validation:
  - `-90 <= lat <= 90`
  - `-180 <= lng <= 180`
- Persistence:
  - Session/request scope only; no precise coordinate persistence.

## Entity: RestaurantCandidate
- Description: Parsed restaurant record before deduping/filtering.
- Fields:
  - `sourceUrl` (string, required)
  - `canonicalId` (string, required)
  - `name` (string, optional)
  - `address` (string, optional)
  - `cuisine` (string[], optional)
  - `priceRange` (string, optional)
  - `photos` (string[], optional)
  - `lat` (float, optional)
  - `lng` (float, optional)
- Validation:
  - `canonicalId` derived from normalized OpenRice URL when available.
  - Photo URL list contains valid absolute URLs only.

## Entity: EligibleRestaurant
- Description: Deduplicated candidate with valid coordinates within radius.
- Fields:
  - all `RestaurantCandidate` normalized fields
  - `distanceMeters` (integer, required)
- Validation:
  - `distanceMeters <= 1000`
  - Inclusive boundary (`1000` is valid)

## Entity: PickResult
- Description: API payload returned to frontend.
- Fields:
  - `id` (string, required)
  - `name` (string, required; fallback "Not available")
  - `address` (string, required; fallback "Not available")
  - `cuisine` (string[], required; fallback `["Not available"]`)
  - `priceRange` (string, required; fallback "Not available")
  - `photos` (string[], required; fallback `[]` and display as "Not available")
  - `sourceUrl` (string, required)
  - `distanceMeters` (integer, required)

## Entity: FetchOutcome
- Description: Outcome envelope for source retrieval/parsing.
- Fields:
  - `status` (enum: `ok` | `source_unavailable` | `parsing_failure` | `rate_limited` | `no_results`)
  - `message` (string, optional)
  - `attempts` (integer, required)

## Relationships
- One `UserLocation` request creates many `RestaurantCandidate` records.
- Candidates are transformed into a deduplicated set of `EligibleRestaurant`.
- Exactly one `EligibleRestaurant` is selected to produce one `PickResult`.

## State Transitions
1. `fetching` -> `parsed` -> `deduplicated` -> `distance_filtered` -> `selected`
2. Error transitions:
   - `fetching` -> `source_unavailable` or `rate_limited`
   - `parsed` -> `parsing_failure`
   - `distance_filtered` -> `no_results`
