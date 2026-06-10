# Source Access

Classify source access before probing or implementation. This controls what is allowed, what can be published, and how secrets must be handled.

## Access Classes

| Class | Meaning | Publish As Public Result |
|---|---|---|
| `public` | Public unauthenticated pages, APIs, feeds, files, sitemaps, or embedded data | yes |
| `owned_session` | User logs into their own account/session to access data they are authorized to view | no |
| `provided_credentials` | User provides credentials for an account or portal they control | no |
| `licensed_api` | User has an API key or licensed data/API access | no unless license explicitly allows |
| `partner_api` | User has partner/integration access | no unless terms explicitly allow |
| `internal_system` | User's own internal app/database/admin system | no |
| `restricted_reject` | Requires bypass, evasion, private third-party access, or disallowed collection | no |

## Owned-Session Rules

Use owned-session mode only when all are true:

- the user explicitly asks to use their own authenticated access
- the user is authorized to access the data
- the session is used to preserve ordinary browser-issued context, consent, region, or user-owned access
- the pipeline does not bypass paywalls, access controls, CAPTCHA, rate limits, or account boundaries
- outputs are marked `non_public_authorized_result`
- cookies, tokens, and session files are never printed, committed, or included in reports

Do not use owned-session mode for:

- credential theft or extraction
- third-party private data the user is not authorized to access
- CAPTCHA solving
- stealth/fingerprint evasion
- rate-limit bypass
- publishing the result as a public pipeline

## Secret Handling

Prefer, in order:

1. Existing browser profile controlled by the user
2. Local Playwright `storageState` file outside version control
3. Environment variables
4. Secret manager

Never include secret values in:

- markdown reports
- screenshots
- logs
- sample rows
- committed files
- case studies

## Required Label

Every authenticated run must include:

```json
{
  "source_access_class": "owned_session",
  "is_publishable_as_public_result": false,
  "authorization_basis": "user-owned session",
  "secret_handling": "user_local_only",
  "output_label": "non_public_authorized_result"
}
```
