# Case Study: Wattpad Followers And Following

## User Ask

Assess whether public follower/following data can be collected from Wattpad, especially for popular accounts.

## Discovery Path

Public profile endpoint:

```text
https://www.wattpad.com/api/v3/users/{username}
```

Followers endpoint:

```text
https://www.wattpad.com/api/v3/users/{username}/followers?limit={limit}&offset={offset}
```

Following endpoint:

```text
https://www.wattpad.com/api/v3/users/{username}/following?limit={limit}&offset={offset}
```

## Header Profile

In probes, `User-Agent` was required. `Accept`, `Accept-Language`, and `Referer` were optional for the small public requests tested.

```json
{
  "required": ["User-Agent"],
  "optional": ["Accept", "Accept-Language", "Referer"],
  "forbidden": ["cookies", "auth tokens", "captcha tokens", "fingerprint headers"]
}
```

## Pagination Findings

The endpoint returns:

```json
{
  "users": [],
  "total": 0,
  "nextUrl": null
}
```

Observed behavior for popular accounts:

- maximum effective page size: `100`
- `limit > 100` is coerced to `100`
- follower pagination works up to the first `2000` retrievable followers
- requests beyond the cap fail for high-follower accounts
- `following` lists with small totals terminate cleanly with `users: []`

Boundary examples:

```text
followers?limit=100&offset=1900 -> 200, returns 100 users
followers?limit=100&offset=2000 -> 400, Followers disabled
followers?limit=2&offset=1998 -> 200, returns 2 users
followers?limit=2&offset=1999 -> 400, Followers disabled
```

The API may emit a `nextUrl` pointing to `offset=2000`, but that next page is blocked.

## Feasibility

```json
{
  "technical_feasibility": 88,
  "responsible_full_collection": 42,
  "narrow_sample_collection": 75,
  "interpretation": "Technically easy for small public probes, not suitable for broad follower harvesting without a separate compliance basis.",
  "recommended_strategy": "Use tiny probes for feasibility and pagination analysis. Avoid broad social graph collection by default."
}
```

## Why This Matters

The endpoint exists and is easy to probe, but the full dataset is intentionally not fully pageable for popular accounts. A good feasibility report separates "the endpoint works" from "the whole graph is collectible."

