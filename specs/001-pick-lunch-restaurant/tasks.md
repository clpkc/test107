---
description: "Task list for Lunch Restaurant Picker implementation"
---

# Tasks: Lunch Restaurant Picker

**Input**: Design documents from `/specs/001-pick-lunch-restaurant/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/

**Tests**: Unit tests are explicitly required for distance calculation, radius filtering, deduping, and random selection.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: `backend/src/`, `frontend/src/`
- **Tests**: `backend/tests/`, `frontend/tests/`

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Initialize monorepo web app structure and toolchain.

- [ ] T001 Create web app directory structure in backend/src, backend/tests, frontend/src, and frontend/tests
- [ ] T002 Initialize backend package and dependencies in backend/package.json (Express/Fastify, Cheerio, Zod, pino)
- [ ] T003 [P] Initialize frontend package and dependencies in frontend/package.json
- [ ] T004 [P] Configure TypeScript projects in backend/tsconfig.json and frontend/tsconfig.json
- [ ] T005 [P] Configure lint/format scripts in backend/package.json and frontend/package.json
- [ ] T006 Create baseline app entrypoints in backend/src/app.ts and frontend/src/main.tsx

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core backend contracts and infrastructure required before user stories.

**⚠️ CRITICAL**: No user story implementation starts before this phase completes.

- [ ] T007 Define shared backend types and API response schema in backend/src/models/restaurant.ts
- [ ] T008 Define RestaurantProvider interface in backend/src/providers/RestaurantProvider.ts
- [ ] T009 Implement cache service with TTL support in backend/src/services/cacheService.ts
- [ ] T010 [P] Implement rate limiting service in backend/src/services/rateLimitService.ts
- [ ] T011 [P] Implement retry utility with exponential backoff and jitter in backend/src/services/retryService.ts
- [ ] T012 Implement distance calculation utility in backend/src/services/distanceService.ts
- [ ] T013 [P] Implement dedupe utility by canonical URL in backend/src/services/dedupeService.ts
- [ ] T014 [P] Implement uniform random selection utility with injectable RNG in backend/src/services/randomService.ts
- [ ] T015 Configure API routing and error middleware in backend/src/api/router.ts
- [ ] T016 Implement structured logging with coordinate redaction in backend/src/services/logger.ts

**Checkpoint**: Foundation complete, user stories can proceed.

---

## Phase 3: User Story 1 - One-Tap Nearby Restaurant Pick (Priority: P1) 🎯 MVP

**Goal**: Return one restaurant within inclusive 1000m after pressing `Pick a Restaurant`.

**Independent Test**: Provide valid lat/lng to `/api/pick`, get exactly one eligible result with required contract fields.

### Tests for User Story 1

- [ ] T017 [P] [US1] Add unit tests for distance calculations in backend/tests/unit/distanceService.test.ts
- [ ] T018 [P] [US1] Add unit tests for inclusive radius filtering (<=1000m) in backend/tests/unit/radiusFilter.test.ts
- [ ] T019 [P] [US1] Add unit tests for canonical URL deduping in backend/tests/unit/dedupeService.test.ts
- [ ] T020 [P] [US1] Add unit tests for uniform random selection with seeded RNG in backend/tests/unit/randomService.test.ts
- [ ] T021 [P] [US1] Add API contract test for GET /api/pick in backend/tests/contract/pickApi.contract.test.ts
- [ ] T022 [P] [US1] Add integration success-path test for pick flow in backend/tests/integration/pickRoute.success.test.ts

### Implementation for User Story 1

- [ ] T023 [US1] Implement OpenRice HTML parser for required fields in backend/src/parsers/openRiceParser.ts
- [ ] T024 [US1] Implement coordinate extraction and fallback geocoding flow in backend/src/services/coordinateResolver.ts
- [ ] T025 [US1] Implement OpenRice provider using parser + cache + limiter in backend/src/providers/OpenRiceRestaurantProvider.ts
- [ ] T026 [US1] Implement pick orchestration service (fetch, dedupe, filter, select) in backend/src/services/pickService.ts
- [ ] T027 [US1] Implement GET /api/pick endpoint in backend/src/api/pickRoute.ts
- [ ] T028 [US1] Build single-page UI with primary button in frontend/src/pages/HomePage.tsx
- [ ] T029 [US1] Implement frontend API client and result-card rendering in frontend/src/services/pickApiClient.ts and frontend/src/components/ResultCard.tsx
- [ ] T030 [US1] Enforce fallback display values (`Not available`) in frontend/src/components/ResultCard.tsx

**Checkpoint**: US1 delivers MVP behavior and is independently testable.

---

## Phase 4: User Story 2 - Location Denied with Manual Fallback (Priority: P2)

**Goal**: Allow user to complete a pick when location permission is denied.

**Independent Test**: Deny permission, enter manual location, press button, and receive one eligible result.

### Tests for User Story 2

- [ ] T031 [P] [US2] Add frontend unit tests for permission-denied fallback UI in frontend/tests/unit/locationFallback.test.tsx
- [ ] T032 [P] [US2] Add integration test for manual location pick flow in backend/tests/integration/pickRoute.manualFallback.test.ts

### Implementation for User Story 2

- [ ] T033 [US2] Implement browser location-permission and fallback state handling in frontend/src/pages/HomePage.tsx
- [ ] T034 [US2] Implement manual location input component in frontend/src/components/ManualLocationForm.tsx
- [ ] T035 [US2] Validate manual lat/lng before API call in frontend/src/services/pickApiClient.ts
- [ ] T036 [US2] Return clear 400 validation errors for invalid coordinates in backend/src/api/pickRoute.ts

**Checkpoint**: US2 works independently of US3.

---

## Phase 5: User Story 3 - Reliable Results Under Data Failures (Priority: P3)

**Goal**: Provide clear, retryable error states for no-results and source/parsing failures.

**Independent Test**: Simulate each failure mode and verify specific user-facing messages.

### Tests for User Story 3

- [ ] T037 [P] [US3] Add integration test for no-results-within-1000m in backend/tests/integration/pickRoute.noResults.test.ts
- [ ] T038 [P] [US3] Add integration test for source-unavailable handling in backend/tests/integration/pickRoute.sourceUnavailable.test.ts
- [ ] T039 [P] [US3] Add integration test for parsing-failure handling in backend/tests/integration/pickRoute.parsingFailure.test.ts
- [ ] T040 [P] [US3] Add frontend unit tests for error-state rendering and retry actions in frontend/tests/unit/errorStates.test.tsx

### Implementation for User Story 3

- [ ] T041 [US3] Map backend failure modes to API error codes/messages in backend/src/api/pickRoute.ts
- [ ] T042 [US3] Add no-results, source-unavailable, and parsing-failure UI states in frontend/src/pages/HomePage.tsx
- [ ] T043 [US3] Implement retry action wiring for retriable errors in frontend/src/services/pickApiClient.ts and frontend/src/pages/HomePage.tsx

**Checkpoint**: All user stories independently functional and testable.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final quality, compliance, and delivery checks.

- [ ] T044 [P] Update API documentation to match contract in specs/001-pick-lunch-restaurant/contracts/pick-api.yaml and backend/src/api/pickRoute.ts
- [ ] T045 [P] Add frontend accessibility pass for button/result card/fallback form in frontend/src/pages/HomePage.tsx
- [ ] T046 Validate no precise coordinate persistence in backend/src/services/logger.ts and backend/src/services/cacheService.ts
- [ ] T047 Run quickstart validation scenarios from specs/001-pick-lunch-restaurant/quickstart.md
- [ ] T048 Run full test suite and coverage in backend/tests and frontend/tests

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Starts immediately
- **Foundational (Phase 2)**: Depends on Setup; blocks all stories
- **User Stories (Phase 3+)**: Depend on Foundational completion
- **Polish (Phase 6)**: Depends on desired user stories completion

### User Story Dependencies

- **US1 (P1)**: Starts after Foundational; no story dependency
- **US2 (P2)**: Starts after Foundational; uses US1 endpoint contract but independently testable
- **US3 (P3)**: Starts after Foundational; independently testable failure handling

### Within Each User Story

- Tests first, expected to fail
- Parsing/model/service work before endpoint wiring
- Endpoint wiring before frontend integration
- Story-level validation before next story

### Parallel Opportunities

- Setup tasks T003-T005 can run in parallel
- Foundational tasks T010, T011, T013, T014 can run in parallel
- US1 tests T017-T022 can run in parallel
- US2 tests T031-T032 can run in parallel
- US3 tests T037-T040 can run in parallel

---

## Parallel Example: User Story 1

```bash
# Parallel unit tests
Task: "T017 backend/tests/unit/distanceService.test.ts"
Task: "T018 backend/tests/unit/radiusFilter.test.ts"
Task: "T019 backend/tests/unit/dedupeService.test.ts"
Task: "T020 backend/tests/unit/randomService.test.ts"

# Parallel implementation foundations
Task: "T023 backend/src/parsers/openRiceParser.ts"
Task: "T024 backend/src/services/coordinateResolver.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 (Setup)
2. Complete Phase 2 (Foundational)
3. Complete Phase 3 (US1)
4. Validate US1 with tests and quick manual run
5. Demo MVP

### Incremental Delivery

1. Setup + Foundational
2. Deliver US1 (MVP)
3. Deliver US2 (permission fallback)
4. Deliver US3 (failure resilience)
5. Final polish and regression pass

### Parallel Team Strategy

1. Team completes Phases 1-2 together
2. Then parallelize by story:
   - Dev A: US1 implementation
   - Dev B: US2 flow
   - Dev C: US3 error handling
3. Integrate with contract and regression checks

---

## Notes

- All tasks use strict checklist format with IDs and file paths.
- [P] markers indicate no direct file-level dependency conflicts.
- US-labeled tasks map directly to prioritized user stories.
- Suggested MVP scope: Phase 3 (US1) after foundational work.

---

## Phase 7: Post-Analysis Gap Closure Tasks

**Purpose**: Close analysis-identified test coverage gaps without altering existing task sequencing.

- [ ] T049 [P] Add unit test to verify retries on 429/5xx never exceed per-click attempt cap in backend/tests/unit/retryPerClickCap.test.ts
- [ ] T050 [P] Add unit test to verify retries never bypass global rate limiter in backend/tests/unit/retryRateLimiterInteraction.test.ts
- [ ] T051 [P] Add integration test where upstream returns 429 then 200 and assert total upstream requests stay within caps and limiter rules in backend/tests/integration/pickRoute.retryLimiterCaps.test.ts
- [ ] T052 [P] Add frontend unit/UI test asserting primary button text equals exactly "Pick a Restaurant" in frontend/tests/unit/pickButtonLabel.test.tsx
- [ ] T053 [P] Add unit test for cache key normalization to ensure equivalent request inputs resolve to one cache key in backend/tests/unit/cacheKeyNormalization.test.ts
- [ ] T054 [P] Add unit/integration test for cache TTL behavior to verify before-TTL uses cache and after-TTL triggers refresh in backend/tests/integration/cacheTtlRefresh.test.ts
