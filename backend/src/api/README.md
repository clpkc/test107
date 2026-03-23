# Lunch Picker API

## Endpoint

`GET /api/pick?lat=<number>&lng=<number>&radius=1000`

Returns one restaurant object:

```json
{
  "id": "string",
  "name": "string",
  "address": "string",
  "cuisine": ["string"],
  "priceRange": "string",
  "photos": ["string"],
  "sourceUrl": "string",
  "distanceMeters": 123
}
```

## Error Codes

- `invalid_input` -> `400`
- `no_results` -> `404`
- `rate_limited` -> `429`
- `source_unavailable` -> `502`
- `parsing_failure` -> `503`

Contract source: `specs/001-pick-lunch-restaurant/contracts/pick-api.yaml`.
