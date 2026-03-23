<!--
Sync Impact Report
- Version change: N/A (template) -> 1.0.0
- Modified principles:
	- Principle 1 template slot -> I. Single-Feature Scope
	- Principle 2 template slot -> II. Session-Only Location Privacy
	- Principle 3 template slot -> III. Responsible OpenRice Access
	- Principle 4 template slot -> IV. Testable Core Selection Logic
	- Principle 5 template slot -> V. Complete Result Display with Safe Fallbacks
- Added sections:
	- Operational Constraints
	- Development Workflow and Quality Gates
- Removed sections:
	- None
- Templates requiring updates:
	- .specify/templates/plan-template.md: ✅ reviewed, no required change
	- .specify/templates/spec-template.md: ✅ reviewed, no required change
	- .specify/templates/tasks-template.md: ✅ reviewed, no required change
	- .specify/templates/commands/*.md: ⚠ path not present in this scaffold
	- .github/agents/*.md: ✅ reviewed for compatibility, no required change
- Deferred TODOs:
	- None
-->

# Lunch Picker Constitution

## Core Principles

### I. Single-Feature Scope
The product scope for v1 MUST remain one user action: pressing a single button
labeled "Pick a Restaurant" to receive exactly one restaurant result.
Any flow that introduces multi-step ranking, list browsing, account features,
or recommendation history is out of scope unless this constitution is amended.

### II. Session-Only Location Privacy
Location data MUST be used only for the active session to compute proximity.
The system MUST NOT persist precise coordinates in databases, files, analytics,
or logs. If telemetry is required, it MUST be coarse, non-identifying, and not
reconstructable to exact user position.

### III. Responsible OpenRice Access
For v1, OpenRice web pages are the source of restaurant data; no public API is
assumed. The implementation MUST minimize requests, cache responses where safe,
and apply rate limits. Bulk crawling, aggressive scraping, or behavior that may
interfere with site operation is prohibited.

### IV. Testable Core Selection Logic
Core decision logic MUST be unit-testable in isolation from network and UI.
At minimum, tests MUST cover:
- Distance filtering at $\leq 1000m$ boundary behavior.
- Deduplication rules for repeated restaurant entries.
- Random selection behavior with deterministic test controls (e.g., seeded RNG
	or injectable random provider).

### V. Complete Result Display with Safe Fallbacks
After a pick, the UI MUST display: name, location/address, cuisine, price
range, and photos. If any field is missing from source data, the UI MUST render
"Not available" for that field rather than leaving blank or failing.

## Operational Constraints

- Data source policy: OpenRice pages only for v1.
- Network etiquette: request minimization, bounded retries, and explicit rate
	limiting are mandatory.
- Caching policy: cache fetched responses to reduce duplicate requests while
	respecting freshness and legal constraints.
- Logging policy: logs MUST exclude precise coordinates and raw payloads that
	can reveal exact location.
- Failure policy: partial source data MUST degrade gracefully using
	"Not available" placeholders.

## Development Workflow and Quality Gates

- Constitution gate for planning: each plan MUST explicitly prove compliance
	with single-feature scope, privacy constraints, and access etiquette.
- Testing gate for implementation: unit tests for distance filter, dedupe, and
	random pick MUST pass before merge.
- UX gate for acceptance: a successful pick MUST show all required fields or
	"Not available" fallbacks.
- Compliance gate for data access: changes touching scraping/fetching MUST
	include evidence of rate limiting and cache behavior.

## Governance

This constitution overrides conflicting local conventions for this project.
Amendments require:
1. A documented proposal describing the change and rationale.
2. Explicit impact review on privacy, compliance, and testability.
3. Updates to affected templates or agent guidance when needed.

Versioning policy:
- MAJOR: incompatible principle removals/redefinitions.
- MINOR: new principle or materially expanded governance.
- PATCH: clarifications that do not change policy meaning.

Compliance review expectations:
- Every PR MUST include a constitution compliance check.
- Reviewers MUST block merges that violate non-negotiable principles.

**Version**: 1.0.0 | **Ratified**: 2026-03-23 | **Last Amended**: 2026-03-23
