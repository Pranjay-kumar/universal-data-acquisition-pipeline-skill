# Case Study: Greenhouse And Lever Public Job Boards

## Run Date

2026-06-09

## User Ask

Test whether Greenhouse and Lever public job boards are useful real targets for the skill.

## ModeSelection

```json
{
  "mode": "source-comparison",
  "reason": "The target is a public jobs dataset with two common ATS source strategies to compare.",
  "will_probe": true,
  "will_collect_beyond_sample": false
}
```

## DatasetNeed

```json
{
  "decision_or_workflow": "Track public hiring activity across selected companies.",
  "entity_grain": "job_posting_snapshot",
  "required_fields": [
    "provider",
    "company",
    "job_id",
    "title",
    "location",
    "department_or_team",
    "absolute_url",
    "first_published_or_created_at",
    "updated_at",
    "observed_at"
  ],
  "nice_to_have_fields": [
    "description_html",
    "employment_type",
    "salary_range",
    "workplace_type",
    "requisition_id",
    "application_deadline"
  ],
  "freshness": "daily or weekly depending on the hiring signal use case",
  "history": "snapshot history with first_seen, last_seen, and removed_at",
  "coverage_target": "selected company boards, not all companies on the internet",
  "join_keys": ["provider", "company_token", "job_id"],
  "privacy_or_risk_fields": ["candidate or applicant data"],
  "exclusions": ["application submission", "candidate data", "internal boards", "auth-only postings"],
  "useless_if": [
    "company board tokens cannot be resolved",
    "job IDs are unstable",
    "removed postings cannot be inferred from snapshots"
  ]
}
```

## Public Sources

Documentation signals:

- Greenhouse Job Board API documentation states that job board data is publicly available and that GET endpoints do not require authentication.
- Lever help documentation describes `https://api.lever.co/v0/postings/[YOURACCOUNTNAME]` as the API call used to dynamically populate a public careers site.

Greenhouse Job Board API:

```text
https://boards-api.greenhouse.io/v1/boards/{board_token}/jobs?content=false
https://boards-api.greenhouse.io/v1/boards/{board_token}/jobs?content=true
https://boards-api.greenhouse.io/v1/boards/{board_token}/jobs/{job_id}
```

Lever Postings API:

```text
https://api.lever.co/v0/postings/{site}?mode=json
https://api.lever.co/v0/postings/{site}?mode=json&skip={n}&limit={n}
https://api.lever.co/v0/postings/{site}/{posting_id}?mode=json
```

## HeaderProfile

```json
{
  "required": [],
  "optional": ["User-Agent", "Accept"],
  "forbidden": ["cookies", "auth tokens", "captcha tokens", "fingerprint headers"],
  "notes": "Tiny unauthenticated GET probes succeeded with a normal User-Agent and Accept: application/json."
}
```

## ProbeResults

Greenhouse examples:

| Board Token | Endpoint | Status | Count | Notes |
|---|---|---:|---:|---|
| `stripe` | `/v1/boards/stripe/jobs?content=false` | 200 | 492 | Returned `jobs` plus `meta.total`; no description content. |
| `stripe` | `/v1/boards/stripe/jobs?content=true` | 200 | 492 | Same count with `content`, `departments`, and `offices`. |
| `stripe` | `/v1/boards/stripe/jobs/{job_id}` | 200 | 1 | Detail endpoint returned the same rich job object for one posting. |
| `airbnb` | `/v1/boards/airbnb/jobs?content=false` | 200 | 223 | Clean public board response. |
| `databricks` | `/v1/boards/databricks/jobs?content=false` | 200 | 777 | Large board returned in one response. |
| `discord` | `/v1/boards/discord/jobs?content=false` | 200 | 69 | Clean public board response. |
| `anthropic` | `/v1/boards/anthropic/jobs?content=false` | 200 | 378 | Clean public board response. |
| `notion` | `/v1/boards/notion/jobs?content=false` | 404 | 0 | Board token was not valid for this route during the probe. |

Greenhouse pagination probes against Stripe:

| Query | Count | Finding |
|---|---:|---|
| `content=false` | 492 | Baseline. |
| `content=false&limit=1` | 492 | `limit` ignored. |
| `content=false&offset=1` | 492 | `offset` ignored. |
| `content=false&page=2` | 492 | `page` ignored. |
| `content=false&limit=1&offset=1` | 492 | Both ignored. |

Lever examples:

| Site | Endpoint | Status | Count | Notes |
|---|---|---:|---:|---|
| `dnb` | `/v0/postings/dnb?mode=json` | 200 | 98 | Returned a flat JSON list of postings. |
| `dnb` | `/v0/postings/dnb?mode=json&group=team` | 200 | 12 groups | Returned grouped objects with `title` and `postings`. |
| `dnb` | `/v0/postings/dnb/{posting_id}?mode=json` | 200 | 1 | Detail endpoint returned a single posting. |
| `netflix` | `/v0/postings/netflix?mode=json` | 200 | 0 | Valid route, no public postings returned in this probe. |
| `ramp`, `vercel`, `figma`, `scaleai`, `databricks`, `discord`, `notion` | `/v0/postings/{site}?mode=json` | 404 | 0 | Site tokens were not valid for this route during the probe. |

Lever pagination probes against `dnb`:

| Query | Count | First ID Behavior |
|---|---:|---|
| `mode=json` | 98 | Baseline. |
| `mode=json&limit=1` | 1 | Limit applied. |
| `mode=json&skip=1` | 97 | First posting skipped. |
| `mode=json&offset=1` | 98 | `offset` ignored. |
| `mode=json&limit=1&skip=1` | 1 | Limit and skip applied together. |

## SampleRows

```json
[
  {
    "provider": "greenhouse",
    "company_token": "stripe",
    "job_id": "7964697",
    "title": "Account Executive, AI Sales",
    "location": "San Francisco, CA",
    "absolute_url": "https://stripe.com/jobs/search?gh_jid=7964697",
    "first_published": "2026-06-02T11:35:23-04:00",
    "updated_at": "2026-06-05T15:44:04-04:00"
  },
  {
    "provider": "lever",
    "company_token": "dnb",
    "job_id": "620dcbfd-ff4d-4fad-97d2-d7fb69e2c851",
    "title": "Account Executive II, Eastern Region  (R-18928)",
    "location": "Ontario - Canada",
    "team": "Sales",
    "absolute_url": "https://jobs.lever.co/dnb/620dcbfd-ff4d-4fad-97d2-d7fb69e2c851",
    "created_at": 1774015783631
  }
]
```

## FeasibilityScorecard

```json
{
  "coverage": 8,
  "stability": 9,
  "pagination_depth": 8,
  "refreshability": 9,
  "data_quality": 8,
  "engineering_cost": "S",
  "legal_tos_risk": "low",
  "recommended_path": "official_api",
  "traffic_light": "Green"
}
```

## DataAcquisitionMemo

```json
{
  "fastest_viable_route": "Use known company ATS tokens and fetch each public board endpoint directly.",
  "cheapest_robust_route": "Maintain a seed list of provider/company tokens, fetch public board JSON daily, normalize fields, and infer removed jobs from missing IDs across snapshots.",
  "highest_coverage_route": "Resolve ATS provider and board token from each target company's careers page, then use provider-specific APIs for Greenhouse, Lever, and additional ATS systems.",
  "coverage_ceiling": "High for selected companies with known public ATS tokens; not suitable for discovering every company using each ATS without a separate source-discovery process.",
  "main_trapdoors": [
    "board token discovery is the hard part",
    "Greenhouse returns whole board responses rather than normal pagination in these probes",
    "Lever uses skip/limit, not offset",
    "job descriptions are HTML and need cleaning",
    "removed jobs require snapshot history"
  ],
  "sample_before_full_run": [
    "validate one Greenhouse board and one Lever board",
    "test detail endpoints",
    "test first_seen/last_seen logic across two runs"
  ],
  "stop_conditions": [
    "posting data requires auth",
    "candidate/application data is requested",
    "the user wants application submission or private internal boards"
  ],
  "recommendation": "Green for selected-company hiring intelligence. Build a provider-normalized snapshot pipeline, not a generic scraper."
}
```

## FeasibilityReport

```json
{
  "score": 88,
  "traffic_light": "Green",
  "interpretation": "Feasible for selected public company job boards.",
  "availability": "Greenhouse and Lever both expose public job posting APIs for published job boards.",
  "accessibility": "Unauthenticated GET requests worked for public listings and detail endpoints.",
  "structure": "Structured JSON with stable posting IDs, timestamps, URLs, locations, and description HTML.",
  "coverage": "Strong for known company tokens. Coverage depends on resolving the correct ATS provider and token for each company.",
  "pagination": "Greenhouse returned full board lists in probe targets and ignored limit/offset/page. Lever supported skip/limit and ignored offset.",
  "runtime": "Small for selected companies. Daily refresh over a seed list should be cheap.",
  "storage": "Manageable. Store normalized posting snapshots plus raw provider payload when needed.",
  "risk": "Low for public postings. Do not collect applicant/candidate data or submit applications.",
  "recommended_strategy": "Use provider APIs directly, normalize to a common job_posting_snapshot schema, and track first_seen/last_seen/removed_at over time.",
  "confidence": 0.9
}
```

## PipelinePlan

```yaml
name: ats_public_jobs_snapshot
entity: job_posting_snapshot
sources:
  - provider: greenhouse
    template: https://boards-api.greenhouse.io/v1/boards/{board_token}/jobs?content=false
    detail_template: https://boards-api.greenhouse.io/v1/boards/{board_token}/jobs/{job_id}
  - provider: lever
    template: https://api.lever.co/v0/postings/{site}?mode=json&skip={skip}&limit={limit}
    detail_template: https://api.lever.co/v0/postings/{site}/{posting_id}?mode=json
strategy: fetch selected public board tokens, normalize postings, snapshot daily
headers:
  User-Agent: Mozilla/5.0 public-data-pipeline/0.1
  Accept: application/json
pagination:
  greenhouse: whole board response in tested boards; ignore limit/offset/page
  lever: skip plus limit
schema:
  keys:
    - provider
    - company_token
    - job_id
  fields:
    - title
    - location
    - department_or_team
    - absolute_url
    - first_published_or_created_at
    - updated_at
    - description_html
    - observed_at
dedupe:
  primary_key: [provider, company_token, job_id]
checkpoints:
  by_company_token: true
outputs:
  - jobs_snapshot.jsonl
  - jobs_snapshot.csv
  - run_report.json
validation:
  - required ID and title
  - URL is present
  - observed_at is set
  - first_seen/last_seen changes are monotonic
approval:
  full_run_approved: false
```

## ApprovalGate

```json
{
  "sample_validated": true,
  "full_run_approved": false,
  "recommended_next_step": "Build a tiny selected-company snapshot run for 5 Greenhouse boards and 1-2 Lever boards, then publish counts and normalized sample rows."
}
```

## Why This Matters

This shows a clean non-retail use case. The skill does not need to scrape career pages when the ATS already exposes public structured data. It also demonstrates provider-specific behavior: Greenhouse board responses were whole-list in the tested examples, while Lever had real `skip`/`limit` pagination.
