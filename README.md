# Universal Public Data Pipeline Skill

Stop writing scrapers. First, prove the data path.

This Codex skill turns public-data requests into due-diligence reports and reusable pipeline plans. It is aggressive about discovering public APIs, XHR endpoints, page-data routes, sitemaps, catalogs, and embedded JSON because structured endpoints are usually faster, cleaner, and less brittle than HTML scraping.

It is balanced about feasibility. If a source works, it says so. If the data is partial, rate-limited, risky, blocked, or not worth collecting, it says that too.

The core question is not "can we scrape this?"

The core question is:

```text
Is this public dataset collectible enough to justify building a pipeline?
```

## What It Does

- Converts vague data asks into a concrete `DatasetSpec`
- Designs the actual dataset need before collection: decision, grain, fields, freshness, history, coverage, join keys, and exclusions
- Finds public APIs and storefront/page-data endpoints
- Derives endpoint templates, query params, headers, and pagination behavior
- Probes limits with tiny requests before broad collection
- Scores technical and responsible collection feasibility with Green/Yellow/Red status
- Produces a data acquisition memo: fastest route, cheapest robust route, highest-coverage route, trapdoors, and stop conditions
- Designs reusable pipeline plans with validation and approval gates
- Produces consistent outputs: `SourcePlan`, `EndpointPlan`, `HeaderProfile`, `ProbeResults`, `FeasibilityScorecard`, `DataAcquisitionMemo`, `FeasibilityReport`, `PipelinePlan`, `SampleRows`, and `ApprovalGate`

## What It Refuses

This skill is for public data only.

It does not do auth bypass, paywall bypass, CAPTCHA solving, private account access, credential or cookie use, fingerprint evasion, exploit generation, or rate-limit bypass.

It can detect limits and design within them using backoff, caching, checkpointing, sampling, dedupe, and explicit approval gates.

## The Scorecard

Every serious feasibility report should make the decision obvious:

| Dimension | Meaning |
|---|---|
| Coverage | How much of the requested dataset appears reachable |
| Stability | How brittle the route looks |
| Pagination depth | Whether public pagination reaches the target scale |
| Refreshability | Whether the pipeline can run repeatedly |
| Data quality | Whether fields are complete and normalized enough |
| Engineering cost | S, M, L, or XL |
| Legal/ToS risk | low, medium, or high |
| Recommended path | official API, public XAPI, embedded JSON, sitemap plus detail, HTML, rendered DOM, or reject |
| Traffic light | Green, Yellow, or Red |

Green means build the pipeline. Yellow means sample, narrow, or find another route. Red means stop.

## Modes

Use modes to keep Codex from overbuilding:

| Mode | Use It When |
|---|---|
| Dataset Design | You know the business goal but not the exact data needed |
| Feasibility | You named a dataset and need to know whether it is collectible |
| Endpoint Discovery | You want public APIs, XHR/fetch routes, feeds, sitemaps, or embedded JSON |
| Pagination/Limits | You need to know how many rows are actually reachable |
| Source Comparison | Multiple routes might work and you need the tradeoff |
| Pipeline Design | Sources are known and you want a refreshable plan |
| Sample Validation | You want tiny probes and sample rows |
| Compliance Boundary | You want Green/Yellow/Red stop conditions |
| Execution | You explicitly approved collection beyond samples |

Default ladder:

```text
Dataset Design -> Feasibility -> Endpoint Discovery -> Pagination/Limits -> Pipeline Design -> Sample Validation -> Execution
```

## 15-Second Demo

Prompt:

```text
Use $universal-public-data-pipeline to find all public product metadata for Macy's.
Prefer public APIs or page-data endpoints over HTML scraping. Stop at feasibility first.
```

What the skill should discover:

```text
category sitemap -> public category discover XAPI -> product IDs -> product detail XAPI
```

The useful result is not "here is a scraper." The useful result is:

- the endpoint templates
- the params and headers that matter
- the page and category limits
- the feasibility scorecard
- the data acquisition memo
- sample rows
- a feasibility score
- a reusable pipeline plan
- an approval gate before a full run

## Case Study Snapshot

| Target | Best Source Found | Pagination/Coverage Signal | Feasibility |
|---|---|---|---|
| Macy's product metadata | Category sitemap -> public category XAPI -> product detail XAPI | Category grids and product IDs are publicly discoverable; dedupe needed across categories | Green |
| Wattpad followers/following | Public user graph API | Followers on popular accounts appear publicly capped near a deep offset; following behaves differently | Yellow |

## Public API Pattern Library

The skill teaches Codex to recognize common public data routes before falling back to HTML:

- Next.js and Nuxt page data
- GraphQL and persisted queries
- Algolia indices
- Shopify product/catalog JSON
- Salesforce Commerce Cloud APIs
- Storefront XAPI and BFF routes
- sitemap-to-detail enrichment
- JSON-LD and hydration state
- mobile API mirrors
- search, autocomplete, feed, and listing endpoints

## Install

Clone the repo:

```powershell
git clone https://github.com/Pranjay-kumar/universal-public-data-pipeline-skill
```

Install into Codex skills:

```powershell
$dest = "$env:USERPROFILE\.codex\skills\universal-public-data-pipeline"
if (Test-Path $dest) { Remove-Item -Recurse -Force $dest }
Copy-Item -Recurse ".\universal-public-data-pipeline-skill" $dest
```

Restart Codex or start a new thread so the skill metadata is loaded.

## Try These Prompts

```text
Use $universal-public-data-pipeline to assess whether we can collect all product metadata from REI. Prefer public APIs and page-data endpoints. Stop at feasibility.
```

```text
Use $universal-public-data-pipeline to find public follower/following endpoints for Wattpad and determine pagination limits. Use tiny probes only.
```

```text
Use $universal-public-data-pipeline to collect public event listings for NYC tech meetups. Find APIs, feeds, or embedded JSON before HTML scraping.
```

```text
Use $universal-public-data-pipeline to design a refreshable public pipeline for government contract awards. Prefer official APIs or bulk datasets.
```

More examples live in [PROMPTS.md](PROMPTS.md).

## Real Results

- [Macy's product metadata](case-studies/macys.md): category sitemap to public XAPI, with full catalog-check notes.
- [Wattpad followers/following](case-studies/wattpad.md): public endpoint discovery with pagination caps and responsible feasibility scoring.
- [Greenhouse and Lever public job boards](case-studies/greenhouse-lever-jobs.md): ATS public APIs, provider-specific pagination, and hiring-signal pipeline design.

Only publish case studies after using the skill on a real target and recording probe-backed evidence. Keep hypothetical examples in `PROMPTS.md` or `references/examples.md`, not in `case-studies/`.

## Skill Layout

```text
SKILL.md
agents/
  openai.yaml
references/
  workflow.md
  modes.md
  endpoint-discovery.md
  probing.md
  feasibility-scoring.md
  compliance-boundaries.md
  source-strategies.md
  output-contracts.md
  pattern-library.md
  examples.md
case-studies/
  macys.md
  wattpad.md
  greenhouse-lever-jobs.md
PROMPTS.md
CONTRIBUTING.md
LICENSE
```

`SKILL.md` stays short so Codex can trigger the skill cheaply. The detailed behavior lives in reference files that Codex loads only when needed.

## The Core Idea

Most public websites already fetch structured data for normal users.

The job is to find that public data path, prove it works, understand its limits, decide whether the collection is worth doing, and only then build the pipeline.

Scraping HTML first is usually the slow path.
