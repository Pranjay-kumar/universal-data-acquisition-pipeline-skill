---
name: data-acquisition-browser
description: "Use for Playwright-based public or authorized browser probing: rendered DOM fallback, browser network capture, JSON/API route discovery from page loads, screenshots, tiny DOM samples, and user-owned storage-state workflows. Do not use for CAPTCHA solving, stealth, fingerprint evasion, auth bypass, or rate-limit bypass."
---

# Data Acquisition Browser

Act as the browser acquisition specialist. Use Playwright when structured HTTP probes are insufficient, or when the user explicitly authorizes owned-session access.

## Shared Core

Read from `../data-acquisition-core/references/`:

- `source-access.md`
- `playwright-rendered-dom.md`
- `probing.md`
- `compliance-boundaries.md`
- `output-contracts.md`

## Helper

Use `scripts/playwright_probe.mjs` from this skill folder.

From the repo root:

```powershell
npm install
npx playwright install chromium
npm run probe:playwright -- "https://example.com/public-page" "outputs/example-playwright-probe.json"
```

Owned-session:

```powershell
$env:PLAYWRIGHT_STORAGE_STATE = "auth\storage-state.json"
npm run probe:playwright -- "https://example.com/account/export" "outputs/owned-session-probe.json"
```

Never print or commit storage state.

## Warm Session Capture

Use this when a normal public page, such as a retail category page, issues browser-context XHR/fetch requests that cold HTTP probes cannot reproduce.

Capture locally:

- user-owned browser storage state
- observed endpoint URL and query params
- safe request headers such as `Accept`, `Accept-Language`, `Origin`, and `Referer`
- response field shape, pagination params, and sample rows

Do not capture or publish cookies, auth tokens, CAPTCHA tokens, account state, cart state, or fingerprint material.

See `../data-acquisition-core/references/execution-adapters.md` for optional runtime adapters, including Jacob Padilla's Stealth-Requests and Google-Colab-Selenium projects.
