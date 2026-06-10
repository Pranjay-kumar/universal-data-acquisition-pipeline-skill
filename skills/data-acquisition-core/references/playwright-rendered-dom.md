# Playwright Rendered-DOM Fallback

Use Playwright only as a fallback for public data pages when structured routes are unavailable or incomplete.

For authenticated owned-session work, read `source-access.md` first and mark outputs non-public.

## When To Use

Use this strategy when:

- public APIs, feeds, sitemaps, embedded JSON, and static HTML have been checked first
- the data is visible to ordinary unauthenticated users
- JavaScript rendering is required to populate the public page
- tiny sample validation is enough to decide feasibility

Do not use this strategy for login-only pages, CAPTCHA solving, paywalls, private account data, or anti-bot evasion.

Exception: login/session state is allowed only in `owned_session`, `provided_credentials`, `licensed_api`, `partner_api`, or `internal_system` access classes when the user explicitly authorizes it.

## Required Evidence Capture

For every Playwright probe, record:

- target URL
- viewport and locale
- final URL after redirects
- status and console errors when available
- screenshot path when useful
- network requests inspected
- whether a public API route was found from network traffic
- selectors or extraction path used only if no structured route is found
- sample row count
- elapsed time and obvious performance cost

## Probe Order

1. Open one public page.
2. Wait only for normal page readiness or a specific visible public element.
3. Inspect network requests for JSON, GraphQL, XHR/fetch, page-data, or feed routes.
4. If a structured route is found, switch back to endpoint discovery.
5. If no structured route is found, extract a tiny DOM sample.
6. Score the route as higher cost and more brittle than API/JSON routes.

## Bounds

Default bounds:

- 1 to 3 URLs
- 20 rows maximum
- 2 minutes maximum
- no infinite scroll beyond one or two ordinary user-visible increments

Increase only after explicit approval.

## PlaywrightPlan

```json
{
  "reason_for_browser_fallback": "",
  "urls": [],
  "wait_strategy": "",
  "network_inspection": {
    "json_routes_found": [],
    "graphql_routes_found": [],
    "page_data_routes_found": []
  },
  "dom_extraction": {
    "selectors": [],
    "sample_limit": 20
  },
  "evidence": {
    "screenshots": [],
    "console_errors": [],
    "network_notes": []
  },
  "cost_and_brittleness": "",
  "fallback_recommendation": ""
}
```

## Implementation Notes

- If this repo is available locally, prefer the bundled helper:

```bash
npm install
npx playwright install chromium
npm run probe:playwright -- "https://example.com/public-page" outputs/example-playwright-probe.json
```

For an authorized owned-session probe, use a local Playwright storage state file that is not committed:

```bash
PLAYWRIGHT_STORAGE_STATE=auth/storage-state.json npm run probe:playwright -- "https://example.com/account/export" outputs/owned-session-probe.json
```

- For public probes, use normal Playwright defaults.
- For Warm Session Capture, use a user-controlled browser context to observe browser-issued XHR/fetch routes and safe headers. Keep storage state local and classify the run as `owned_session` if cookies or local storage are required for replay.
- Do not add CAPTCHA solvers, fingerprint spoofing, auth bypass, or rate-limit bypass.
- For owned-session probes, storage state must remain local, gitignored, and never printed.
- Prefer network-discovered public endpoints over DOM selectors whenever possible.
- Keep selectors semantic when possible: links, headings, JSON-LD, visible cards, table rows, accessible labels.
- Treat infinite scroll as a pagination risk, not a full-run strategy by default.
- Include Playwright outputs in `ProbeResults`, `FeasibilityScorecard`, and `DataAcquisitionMemo`.

## Feasibility Guidance

Rendered DOM can be valid for small public datasets, but it usually lowers:

- stability
- runtime
- refreshability
- engineering cost score

Recommend a full Playwright pipeline only when the dataset is valuable, public, small or partitionable, and no structured route exists.
