# Universal Public Data Pipeline Skill

Find the hidden public API before you scrape.

This Codex skill turns public-data requests into feasibility reports and reusable pipeline plans. It is aggressive about discovering public APIs, XHR endpoints, page-data routes, sitemaps, catalogs, and embedded JSON because structured endpoints are usually faster, cleaner, and less brittle than HTML scraping.

It is balanced about feasibility. If a source works, it says so. If the data is partial, rate-limited, risky, blocked, or not worth collecting, it says that too.

## What It Does

- Converts vague data asks into a concrete `DatasetSpec`
- Finds public APIs and storefront/page-data endpoints
- Derives endpoint templates, query params, headers, and pagination behavior
- Probes limits with tiny requests before broad collection
- Scores technical and responsible collection feasibility
- Designs reusable pipeline plans with validation and approval gates
- Produces consistent outputs: `SourcePlan`, `EndpointPlan`, `HeaderProfile`, `ProbeResults`, `FeasibilityReport`, `PipelinePlan`, `SampleRows`, and `ApprovalGate`

## What It Refuses

This skill is for public data only.

It does not do auth bypass, paywall bypass, CAPTCHA solving, private account access, credential or cookie use, fingerprint evasion, exploit generation, or rate-limit bypass.

It can detect limits and design within them using backoff, caching, checkpointing, sampling, dedupe, and explicit approval gates.

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
- sample rows
- a feasibility score
- a reusable pipeline plan
- an approval gate before a full run

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

## Case Studies

- [Macy's product metadata](case-studies/macys.md): category sitemap to public XAPI, with full catalog-check notes.
- [Wattpad followers/following](case-studies/wattpad.md): public endpoint discovery with pagination caps and responsible feasibility scoring.

## Skill Layout

```text
SKILL.md
agents/
  openai.yaml
references/
  workflow.md
  endpoint-discovery.md
  probing.md
  feasibility-scoring.md
  compliance-boundaries.md
  source-strategies.md
  output-contracts.md
  examples.md
case-studies/
  macys.md
  wattpad.md
PROMPTS.md
CONTRIBUTING.md
LICENSE
```

`SKILL.md` stays short so Codex can trigger the skill cheaply. The detailed behavior lives in reference files that Codex loads only when needed.

## The Core Idea

Most public websites already fetch structured data for normal users.

The job is to find that public data path, prove it works, understand its limits, and only then build the pipeline.

Scraping HTML first is usually the slow path.

