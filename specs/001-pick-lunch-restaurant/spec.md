# Feature Specification: Lunch Restaurant Picker

**Feature Branch**: `001-pick-lunch-restaurant`  
**Created**: 2026-03-23  
**Status**: Draft  
**Input**: User description: "Build a small app that helps me pick a lunch restaurant near my current location with minimal effort."

## Clarifications

### Session 2026-03-23

- Q: Where do coordinates come from for OpenRice data? -> A: Extract coordinates from
	OpenRice page metadata first (JSON-LD, map links, data attributes), then fallback
	to geocoding parsed address; candidates without coordinates are excluded from
	radius filtering.
- Q: What is the per-click request budget and anti-abuse policy? -> A: Hard cap of
	3 OpenRice origin requests per "Pick a Restaurant" click, with page cache TTL,
	rate limiting, and bounded retries.
- Q: What are field extraction and fallback rules? -> A: Each required display field
	has explicit source selectors and MUST show "Not available" on missing values;
	photos require at least 1 valid image URL.
- Q: How are duplicates removed and randomness ensured? -> A: Deduplicate by canonical
	OpenRice URL identity and choose uniformly from the eligible deduplicated pool.
- Q: Which acceptance criteria are mandatory for release? -> A: Five explicit
	Given/When/Then criteria: success path, permission-denied fallback, no-results in
	1000m, source unavailable, and parsing failure.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - One-Tap Nearby Restaurant Pick (Priority: P1)

As a hungry user, I want to press one clearly labeled button and immediately get one
random nearby restaurant so I can decide lunch quickly.

**Why this priority**: This is the core value of the app and the minimum viable workflow.

**Independent Test**: Can be fully tested by granting location permission,
pressing "Pick a Restaurant" once, and verifying one valid result within 1000 meters.

**Acceptance Scenarios**:

1. **Given** location permission is granted and eligible restaurants are available,
	 **When** the user presses "Pick a Restaurant", **Then** the app returns exactly one
	 randomly selected restaurant within 1000 meters.
2. **Given** a restaurant is selected, **When** details are shown, **Then** the app shows
	 name, location/address, cuisine, price range, and photos (if available).

---

### User Story 2 - Location Denied with Manual Fallback (Priority: P2)

As a privacy-conscious user, I want to continue using the app even if I deny location
permission by entering my location manually.

**Why this priority**: Permission denial is common and must not block the primary task.

**Independent Test**: Can be tested by denying permission, entering a manual location,
then pressing "Pick a Restaurant" and receiving one eligible result.

**Acceptance Scenarios**:

1. **Given** the user denies location permission, **When** the app prompts a manual
	 fallback and the user provides valid location input, **Then** the app uses that input
	 to find and return one restaurant within 1000 meters.
2. **Given** the user denies permission and provides invalid manual location input,
	 **When** selection is attempted, **Then** the app shows a clear validation error and
	 does not crash.

---

### User Story 3 - Reliable Results Under Data Failures (Priority: P3)

As a user, I want understandable error feedback when restaurant data cannot be retrieved
or parsed, so I know what to do next.

**Why this priority**: Reliability and clear failures prevent user frustration.

**Independent Test**: Can be tested by simulating no in-radius results,
source unavailability, and parsing errors, then verifying clear error states.

**Acceptance Scenarios**:

1. **Given** no restaurants are found within 1000 meters, **When** the user presses
	 "Pick a Restaurant", **Then** the app shows a no-results message with a retry path.
2. **Given** the OpenRice source is unavailable or the response cannot be parsed,
	 **When** selection is attempted, **Then** the app shows a source/parsing failure
	 message and allows retry without storing precise user coordinates.

### Edge Cases

- A restaurant exactly 1000 meters away MUST be considered in range.
- Duplicate restaurant entries from the source MUST be deduplicated before random
	selection.
- If a restaurant candidate has no resolvable coordinates after metadata extraction and
	address geocoding fallback, it MUST be excluded from distance eligibility.
- If all fetched candidates are excluded due to missing coordinates, the app MUST show
	a "no restaurants within 1000m" style outcome with retry guidance.
- If one or more display fields are missing from source data, each missing field MUST
	render as "Not available".
- If photos are missing, the photos area MUST display "Not available" instead of
	empty content.
- If rate limits are reached, the app MUST fail gracefully with a retriable message.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST request location permission on first use of the pick flow.
- **FR-002**: If permission is denied, the system MUST provide manual location fallback
	input and allow continuation.
- **FR-003**: The interface MUST expose only one primary action button labeled exactly
	"Pick a Restaurant".
- **FR-004**: Each button press MUST return exactly ONE randomly selected restaurant.
- **FR-005**: The system MUST include only restaurants within a 1000 meter radius of
	the resolved user location (device or manual fallback).
- **FR-006**: The 1000 meter radius boundary MUST be inclusive.
- **FR-007**: The system MUST use https://www.openrice.com/zh/hongkong website pages
	as the v1 data source and MUST NOT assume a public API.
- **FR-008**: The system MUST minimize network load by applying response caching and
	request rate limiting.
- **FR-009**: The system MUST avoid heavy crawling and MUST NOT perform bulk crawling
	behavior that could interfere with the source site.
- **FR-010**: The system MUST handle and display clear user-facing errors for:
	location denied without valid fallback, no in-radius results, source unavailable,
	and parsing failure.
- **FR-011**: After selection, the system MUST show name, location/address, cuisine,
	price range, and photos.
- **FR-012**: For any missing field in selection details, the system MUST display
	"Not available".
- **FR-013**: The system MUST NOT persist precise user coordinates in storage,
	telemetry, or logs.

### Distance and Coordinate Resolution Rules

- **DR-001**: Candidate restaurant coordinates MUST be extracted in this priority order:
	page-embedded coordinates (for example JSON-LD or map parameters), then address
	geocoding fallback.
- **DR-002**: If no valid coordinates can be obtained for a candidate restaurant,
	that candidate MUST be excluded from the 1000 meter radius pool.
- **DR-003**: Distance filtering MUST use inclusive boundary logic where
	distance <= 1000 meters is eligible.
- **DR-004**: User-provided manual fallback location MUST be resolved to coordinates
	for the same radius evaluation logic as device location.

### Request Budget, Caching, Rate Limiting, and Retry

- **RQ-001**: Each "Pick a Restaurant" click MUST trigger at most 3 OpenRice origin
	page requests (cache hits do not count toward origin requests).
- **RQ-002**: Page cache key MUST be the normalized request URL
	(scheme + host + path + sorted query, without fragment).
- **RQ-003**: Cached OpenRice page responses MUST use a TTL of 10 minutes.
- **RQ-004**: The client/service MUST enforce rate limiting of at most 30 OpenRice
	origin requests per minute, with a burst ceiling of 5 requests per 10 seconds.
- **RQ-005**: Retry is allowed only for transient failures (HTTP 429, HTTP 5xx,
	or network timeout) with at most 2 retries using exponential backoff and jitter.
- **RQ-006**: Retry MUST NOT violate the per-click request cap or global rate limit.

### Field Extraction and Fallback Rules

- **FX-001**: Name source is the restaurant title text from listing/detail page;
	if missing, display "Not available".
- **FX-002**: Address source is the restaurant address text block;
	if missing, display "Not available".
- **FX-003**: Cuisine source is the cuisine/category labels;
	if missing, display "Not available".
- **FX-004**: Price range source is the displayed price indicator/text;
	if missing, display "Not available".
- **FX-005**: Photos source is restaurant image/gallery URLs; minimum photo rule is
	at least 1 valid image URL to be considered available. If zero valid URLs exist,
	display "Not available" for photos.

### Deduplication and Random Selection Rules

- **SL-001**: Restaurant identity for deduplication MUST use canonical OpenRice URL
	(path normalized, query and fragment removed, trailing slash normalized).
- **SL-002**: If canonical URL is unavailable, a fallback identity key of
	normalized(name + address) MAY be used.
- **SL-003**: Random selection MUST be uniform over the deduplicated eligible pool:
	each eligible restaurant has probability 1/N where N is pool size.
- **SL-004**: Randomizer behavior MUST support deterministic test control via
	injectable seeded randomness.

### Assumptions and Dependencies

- OpenRice website terms and access controls permit lightweight, respectful retrieval
	for this use case.
- Distance is computed from geospatial coordinates provided by either device location
	services or user-provided manual location.
- Manual fallback input is sufficient to resolve coordinates needed for distance
	filtering.

### Key Entities *(include if feature involves data)*

- **UserLocation**: Location context used for filtering restaurants; sourced from device
	permission flow or manual fallback input; precise coordinates are session-scoped only.
- **RestaurantCandidate**: Raw restaurant record parsed from source pages, including
	source identifier, name, address, cuisine, price range, photos, and coordinates.
- **RestaurantPool**: Deduplicated list of in-radius restaurant candidates eligible for
	random selection.
- **RestaurantSelectionResult**: Single chosen restaurant plus normalized display fields,
	with "Not available" substitutions for missing values.
- **FetchOutcome**: Result of source retrieval/parsing (success, source unavailable,
	parsing failure, rate-limited) used to drive user-facing error handling.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: In at least 95% of successful pick attempts under normal source
	availability, users receive one restaurant result within 3 seconds.
- **SC-002**: 100% of returned restaurants in test datasets are within an inclusive
	1000 meter radius.
- **SC-003**: 100% of selections display all required detail fields, with missing values
	shown as "Not available".
- **SC-004**: In automated tests, deduplication removes repeated source entries and
	random selection still returns one item from the deduplicated pool.
- **SC-005**: 100% of tested failure modes (location denied/no fallback,
	no results in radius, source unavailable, parsing failure) show explicit and
	actionable error states.

## Acceptance Criteria (Clarified)

1. **Given** location permission is granted and OpenRice source pages are reachable,
	**When** the user presses "Pick a Restaurant", **Then** the app returns exactly one
	randomly selected, deduplicated restaurant within inclusive 1000m and displays
	name, address, cuisine, price range, and photos or "Not available" fallbacks.

2. **Given** location permission is denied,
	**When** the user provides a valid manual fallback location and presses
	"Pick a Restaurant", **Then** the app returns exactly one eligible restaurant within
	inclusive 1000m using the same filtering and display rules.

3. **Given** location is available but no deduplicated candidates have distance <=1000m,
	**When** the user presses "Pick a Restaurant", **Then** the app shows a clear
	no-restaurants-within-1000m message and a retry action.

4. **Given** OpenRice source pages are unavailable (for example timeout/429/5xx after
	bounded retries), **When** the user presses "Pick a Restaurant", **Then** the app
	shows a source-unavailable error message and does not persist precise coordinates.

5. **Given** OpenRice page retrieval succeeds but parsing fails for required content,
	**When** the user presses "Pick a Restaurant", **Then** the app shows a parsing
	failure message with retry guidance and does not crash.
