# Execution Adapters

Execution adapters are runtime choices for probing and running a pipeline after the source access class and endpoint plan are clear. Pick the weakest adapter that works.

## Adapter Ladder

1. `plain_http`: `fetch`, `requests`, `httpx`, or similar HTTP client.
2. `browser_context_http`: HTTP requests replayed from a user-owned browser context or exported storage state.
3. `playwright_visible`: visible or headed Playwright for network capture and warm-session probes.
4. `playwright_headless`: bounded rendered-page probes when public structured routes are insufficient.
5. `selenium_colab`: Selenium in Google Colab when the user wants a notebook/browser runtime.
6. `provided_adapter`: a user-provided adapter package with explicit constraints and local-only secrets.

Use browser-context adapters when a public page mints request context for public XHR/API routes. Do not use them for CAPTCHA solving, fingerprint spoofing, auth bypass, or rate-limit bypass.

## Warm Session Capture

Use this when a cold HTTP request fails but the same public data is visible to the user in a normal browser page.

Capture:

- page URL and final URL
- XHR/fetch/GraphQL endpoint URL
- query params and path params
- method and content type
- safe headers: `Accept`, `Accept-Language`, `Origin`, `Referer`, and app-version headers that are not secrets
- pagination params and terminal behavior
- sample response schema
- whether storage state was required

Never capture or commit:

- cookies
- bearer tokens
- CSRF/session tokens
- CAPTCHA tokens
- account identifiers
- cart, checkout, order, or private profile state
- fingerprint material

If storage state is required, classify the run as `owned_session` and label outputs `non_public_authorized_result`.

## Jacob Padilla Adapter Notes

These projects can be referenced as optional user-installed adapters:

- Stealth-Requests: `https://github.com/jpjacobpadilla/Stealth-Requests`
- Google-Colab-Selenium: `https://github.com/jpjacobpadilla/Google-Colab-Selenium`

Recommended positioning:

| Project | Useful Role | Skill Boundary |
|---|---|---|
| Stealth-Requests | Browser-like HTTP client ergonomics, retries, parsing helpers, compatible adapter interface | Do not document or rely on stealth, fingerprint, CAPTCHA, or rate-limit bypass behavior. Use only for authorized/public tiny probes and record it as `provided_adapter`. |
| Google-Colab-Selenium | Notebook-friendly visible browser runtime for user-driven page loads and network observation | Use for user-owned visible browser sessions, not CAPTCHA solving or undetected-driver evasion. |

When a user requests one of these adapters, include:

```json
{
  "adapter": "provided_adapter",
  "package": "Stealth-Requests or Google-Colab-Selenium",
  "allowed_use": "authorized warm-session capture and bounded sample validation",
  "disallowed_use": [
    "captcha solving",
    "fingerprint spoofing",
    "auth bypass",
    "rate-limit bypass",
    "publishing cookies or storage state"
  ],
  "publishability": "public only if no cookies/session/private state were required"
}
```

## Macy's Category API Pattern

For Macy's-style retail category APIs, prefer this route when the user's browser can access the page:

```text
visible category page
-> capture live category XHR/fetch route
-> extract endpoint template, category ID, canonical path, page size, offset/cursor, sort/facet params
-> replay tiny probe in the same browser context
-> normalize product tiles
-> dedupe product IDs across categories
-> enrich selected IDs with product detail XAPI
```

Record a route as `Green` only if the category API can be sampled repeatedly within approved pacing. Otherwise mark it `Green-Yellow` and keep sitemap/PDP discovery as fallback coverage.
