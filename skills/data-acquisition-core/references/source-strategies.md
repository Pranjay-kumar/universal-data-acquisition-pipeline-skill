# Source Strategies

Pick the fastest reliable strategy that fits the dataset and source access class.

## Official Public API

Use when docs and unauthenticated, licensed, partner, or otherwise approved access exists. Prefer it over reverse-engineered endpoints.

Watch for:

- API keys
- partner-only access
- rate limits
- field coverage
- terms

## Public Site API Or XAPI

Use when the public site fetches structured JSON for normal unauthenticated page loads.

Best for:

- product catalogs
- category pages
- public profiles
- search results
- listing pages
- reviews
- events
- media metadata

Document endpoint templates, params, headers, pagination, and fallback.

If cold HTTP probes fail but a normal user-visible page issues the API from the browser, switch to Warm Session Capture. Capture the live XHR request template from a user-controlled browser context, preserve only safe headers in the pipeline plan, and keep any storage state local and uncommitted.

## Embedded JSON Or Hydration

Use when page HTML contains data blobs such as JSON-LD, app state, or static props.

Best when API endpoints are unavailable but page HTML is stable.

## Sitemap And Catalog Discovery

Use for broad discovery:

- sitemap indexes
- gzipped XML sitemaps
- category sitemaps
- product sitemaps
- public directories
- brand/category indexes

Sitemaps often provide IDs and URLs, then detail endpoints provide rich records.

## Search And Browse Endpoints

Use when the dataset is naturally queryable or category-driven.

Probe:

- result count
- max page size
- offset/cursor limits
- facets
- sort behavior
- dedupe across categories

For retail category APIs, prefer the exact request shape observed from the category page over hand-written guesses. Record category ID, canonical path, query params, page size, offset/cursor params, sort/facet params, and whether the endpoint requires warmed browser context.

## Static HTML

Use only when structured endpoints are unavailable. Prefer robust selectors and schema validation.

## Rendered DOM

Use only when the data requires JavaScript rendering and no public endpoint, feed, sitemap, embedded JSON, or static HTML route is sufficient. Prefer Playwright for tiny bounded probes and evidence capture.

Read `playwright-rendered-dom.md` before using this strategy.

## Warm Session Capture

Use when the data is visible in a normal browser session and the site mints request context before returning structured APIs. This is often the practical route for storefront category APIs, app shell XHR calls, or region/consent-sensitive browse endpoints.

Recommended flow:

1. Open the public target page in a user-controlled visible browser.
2. Let the page load normally and accept only user-intended consent prompts.
3. Capture network requests for XHR/fetch/GraphQL/page-data routes.
4. Save only endpoint templates, query params, safe headers, and response schemas.
5. If cookies/storage are needed for replay, classify as `owned_session` and keep storage state local.
6. Use tiny probes before broad collection.

This mode is for browser-issued context and reproducible pipeline design. It is not a permission to solve CAPTCHA, spoof fingerprints, bypass access controls, or bypass rate limits.

## Reject

Reject or lower feasibility when data requires unauthorized private access, evasion, CAPTCHA solving, auth bypass, or rate-limit bypass.

## Strategy Recommendation Language

For every serious data request, name three routes even if two are inferior:

- `fastest viable route`: quickest way to prove and collect useful rows
- `cheapest robust route`: simplest refreshable design with the least moving parts
- `highest coverage route`: path most likely to maximize completeness, even if slower

Then choose one recommended route and explain why.
