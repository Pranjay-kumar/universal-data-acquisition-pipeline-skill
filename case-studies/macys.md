# Case Study: Macy's Product Metadata Pipeline

## Run Date

2026-06-09

## User Ask

Build a publishable case study that actually works: collect Macy's public product metadata such as product IDs, names, descriptions, prices, availability, product URLs, and product photo links. The result should be honest about where the public path is strong and where Macy's edge controls require conservative batching.

## ModeSelection

```json
{
  "mode": "pipeline-design",
  "reason": "The source has public sitemap discovery plus a product detail XAPI that can enrich product IDs into usable retail metadata, with edge sensitivity that must be designed around conservatively.",
  "will_probe": true,
  "will_collect_beyond_sample": false
}
```

## DatasetNeed

```json
{
  "decision_or_workflow": "Create a refreshable retail catalog intelligence dataset for public Macy's products.",
  "entity_grain": "product_snapshot",
  "required_fields": [
    "product_id",
    "product_url",
    "name",
    "brand",
    "regular_price",
    "sale_price",
    "availability",
    "image_urls",
    "observed_at"
  ],
  "nice_to_have_fields": [
    "description_text",
    "bullet_text",
    "review_count",
    "average_rating",
    "department",
    "division",
    "traits",
    "related_product_ids"
  ],
  "freshness": "daily or weekly depending on price-monitoring use case",
  "history": "snapshot history with first_seen, last_seen, price history, and availability history",
  "coverage_target": "warm-session category APIs for browse/product tile metadata, with PDP sitemap shards as fallback product discovery coverage",
  "join_keys": ["product_id"],
  "privacy_or_risk_fields": ["cart, checkout, account, loyalty, order, or personalized recommendation data"],
  "exclusions": ["checkout flows", "account APIs", "reviews requiring login", "cart/add-to-bag routes"],
  "useless_if": [
    "PDP sitemap shards stop exposing product IDs",
    "detail enrichment cannot be sampled without access-control errors",
    "prices are not returned in public guest product detail responses"
  ]
}
```

## SourceAccessClass

```json
{
  "class": "public_or_owned_session",
  "publishable_as_public_result": "public only when no cookies or storage state are required",
  "reason": "The pipeline can use public robots-listed sitemap indexes and unauthenticated product detail JSON. If the category XAPI requires browser-issued cookies or storage state, that stage becomes owned_session and local-only."
}
```

## SourcePlan

```json
[
  {
    "name": "robots",
    "url": "https://www.macys.com/robots.txt",
    "type": "robots",
    "result": "200",
    "reason": "Identifies public sitemap indexes and disallowed surfaces."
  },
  {
    "name": "sitemap_index",
    "url": "https://www.macys.com/dyn_img/sitemap/mcom_sitemapindex.xml",
    "type": "sitemap_index",
    "result": "200",
    "reason": "Lists PDP, category, facet, onsite, misc, and home page sitemap shards."
  },
  {
    "name": "warm_category_xapi",
    "url_template": "capture from visible category page network requests",
    "type": "browser_issued_xhr",
    "result": "recommended production route when a user-controlled warm browser can access category pages",
    "reason": "Category pages are often the easiest way to obtain product tiles, category context, pagination, sort, and facet behavior."
  },
  {
    "name": "pdp_sitemap_shards",
    "url_template": "https://www.macys.com/dyn_img/sitemap/mcom_sitemap_pdp_{suffix}.xml.gz",
    "type": "gzip_sitemap",
    "result": "200 for sampled shard mcom_sitemap_pdp_aa.xml.gz; immediate repeat later hit edge 403",
    "reason": "Primary product discovery surface. Sampled shard contained 50,000 product URLs when accepted by the edge."
  },
  {
    "name": "product_detail_xapi",
    "url_template": "https://www.macys.com/xapi/digital/v1/product/{product_id}?currencyCode=USD&_deviceType=DESKTOP&_regionCode=US&_shoppingMode=SITE&_application=SITE&bigTicketCXHeaders=1&_customerExperiment=&_customerState=GUEST",
    "type": "json_xapi",
    "result": "200 for validated product detail sample",
    "reason": "Enriches product IDs into name, brand, pricing, image file paths, availability, traits, reviews, and related metadata."
  }
]
```

## ProbeResults

Robots:

```text
https://www.macys.com/robots.txt -> 200 text/plain
```

Important robots signals:

- `Sitemap: https://www.macys.com/dyn_img/sitemap/mcom_sitemapindex.xml`
- `Sitemap: https://www.macys.com/dyn_img/sitemap/mcom_sitemapindex_labs.xml`
- Disallowed surfaces include cart, checkout, account XAPI, search routes, review-add routes, and several faceted crawl traps.

Sitemap index:

```text
https://www.macys.com/dyn_img/sitemap/mcom_sitemapindex.xml -> 200 XML
```

The index listed 10 PDP shards during the probe:

```text
mcom_sitemap_pdp_aa.xml.gz
mcom_sitemap_pdp_ab.xml.gz
mcom_sitemap_pdp_ac.xml.gz
mcom_sitemap_pdp_ad.xml.gz
mcom_sitemap_pdp_ae.xml.gz
mcom_sitemap_pdp_af.xml.gz
mcom_sitemap_pdp_ag.xml.gz
mcom_sitemap_pdp_ah.xml.gz
mcom_sitemap_pdp_ai.xml.gz
mcom_sitemap_pdp_aj.xml.gz
```

Sampled PDP shard:

| URL | Status | Content Type | URL Count | Finding |
|---|---:|---|---:|---|
| `https://www.macys.com/dyn_img/sitemap/mcom_sitemap_pdp_aa.xml.gz` | 200 in successful probe; later immediate repeat returned 403 | `application/x-gzip` | 50,000 | Product URLs include stable `ID=` query params when the shard is accepted by the edge. |

First product URLs observed in the sampled shard:

```text
https://www.macys.com/shop/product/crane-baby-infants-cove-sea-life-wash-cloths-5-piece-set?ID=19784296
https://www.macys.com/shop/product/lawrence-frames-washed-gray-picture-frame-8-x-10?ID=8528380
https://www.macys.com/shop/product/womens-colosseum-heathered-crimson-oklahoma-sooners-powered-by-title-ix-t-shirt?ID=14758428
https://www.macys.com/shop/product/new-era-mens-light-beige-olive-dallas-cowboys-2-tone-color-pack-split-panel-59fifty-fitted-hat?ID=24415905
https://www.macys.com/shop/product/new-era-mens-black-memphis-grizzlies-game-day-flag-a-frame-9forty-adjustable-hat?ID=21688791
```

Product detail XAPI sample:

```text
https://www.macys.com/xapi/digital/v1/product/21552892?... -> 200 application/json
```

Observed detail payload:

| Product ID | Bytes | Product | Brand | Price | Available | Images | Top-Level Field Groups |
|---|---:|---|---|---:|---|---:|---|
| `21552892` | 90,565 | Men's Tasman II Slipper | UGG | `$125.00` | true | 6 | `identifier`, `department`, `division`, `detail`, `shipping`, `relationships`, `imagery`, `availability`, `traits`, `pricing`, `productReviews` |

Endpoint behavior notes:

- Category APIs should be tested from a user-controlled warm browser session before falling back to sitemaps. Cold probes in this runner produced redirects or edge denials, but a visible browser session can reveal the exact Macy's category XHR shape.
- The sitemap index was accessible from the local runner. The sampled PDP gzip shard returned 50,000 URLs in a successful probe, then returned an edge 403 on an immediate repeat.
- A product detail request returned a rich JSON payload for product `21552892`.
- Repeated product detail probes later returned edge `403` or product `404` responses for some IDs. Treat detail enrichment as a rate-sensitive stage with backoff, checkpointing, and small approved batches.
- Playwright on a category page returned an access-denied page from this environment, so the production route should prefer sitemap + XAPI enrichment over rendered category browsing.

## EndpointPlan

```json
[
  {
    "name": "warm_category_xapi",
    "method": "GET",
    "template": "capture from the category page XHR/fetch request",
    "extract": "Category product tiles, product IDs, names, brand, price/availability snippets, image data, category context, pagination params, sort/facet params",
    "pagination": {
      "type": "category browse",
      "params_to_capture": ["category id", "canonical path", "page size", "offset or page index", "sort", "facets"]
    },
    "confidence": 0.88
  },
  {
    "name": "pdp_sitemap_index",
    "method": "GET",
    "template": "https://www.macys.com/dyn_img/sitemap/mcom_sitemapindex.xml",
    "extract": "PDP sitemap shard URLs matching mcom_sitemap_pdp_*.xml.gz",
    "pagination": {
      "type": "sitemap-index",
      "observed_shards": 10
    },
    "confidence": 0.82
  },
  {
    "name": "pdp_sitemap_shard",
    "method": "GET",
    "template": "{pdp_sitemap_url}",
    "extract": "Product URL and ID query parameter",
    "pagination": {
      "type": "sitemap-file",
      "observed_urls_in_sampled_shard": 50000
    },
    "confidence": 0.95
  },
  {
    "name": "product_detail",
    "method": "GET",
    "template": "https://www.macys.com/xapi/digital/v1/product/{product_id}?currencyCode=USD&_deviceType=DESKTOP&_regionCode=US&_shoppingMode=SITE&_application=SITE&bigTicketCXHeaders=1&_customerExperiment=&_customerState=GUEST",
    "extract": "Product name, brand, description containers, price tiers, availability, image file paths, traits, reviews, and relationships",
    "pagination": {
      "type": "one request per product_id",
      "batching": "checkpointed small batches with backoff"
    },
    "confidence": 0.75
  }
]
```

## HeaderProfile

```json
{
  "required": ["User-Agent", "Accept"],
  "optional": ["Accept-Language", "Referer", "Origin", "browser-issued storage state for owned_session runs"],
  "forbidden": ["auth tokens", "captcha tokens", "fingerprint headers", "cart/session headers", "checkout headers"],
  "notes": "Use ordinary browser-issued context from a user-controlled session when needed. Keep cookies/storage local and unpublished. Do not bypass edge denials, account boundaries, checkout, or rate limits."
}
```

## SampleRows

```json
[
  {
    "product_id": "21552892",
    "product_url": "https://www.macys.com/shop/product/ugg-mens-tasman-ii-slipper?ID=21552892",
    "name": "Men's Tasman II Slipper",
    "brand": "UGG",
    "regular_price": "$125.00",
    "available": true,
    "image_urls": [
      "https://slimages.macysassets.com/is/image/MCY/products/7/optimized/33291437_fpx.tif",
      "https://slimages.macysassets.com/is/image/MCY/products/8/optimized/33291438_fpx.tif",
      "https://slimages.macysassets.com/is/image/MCY/products/2/optimized/33291452_fpx.tif"
    ],
    "observed_from": "product_detail_xapi",
    "observed_at": "2026-06-09"
  },
  {
    "product_id": "19784296",
    "product_url": "https://www.macys.com/shop/product/crane-baby-infants-cove-sea-life-wash-cloths-5-piece-set?ID=19784296",
    "name_from_url_slug": "crane baby infants cove sea life wash cloths 5 piece set",
    "observed_from": "pdp_sitemap",
    "observed_at": "2026-06-09"
  }
]
```

## FeasibilityScorecard

```json
{
  "coverage": 9,
  "stability": 7,
  "pagination_depth": 9,
  "refreshability": 8,
  "data_quality": 8,
  "engineering_cost": "M",
  "legal_tos_risk": "medium",
  "recommended_path": "warm_category_xapi_plus_product_detail_xapi_with_pdp_sitemap_fallback",
  "traffic_light": "Green-Yellow"
}
```

## DataAcquisitionMemo

```json
{
  "fastest_viable_route": "Use Warm Session Capture on a category page, extract the live category XAPI request, and page through product tiles with the exact browser-issued request shape.",
  "cheapest_robust_route": "Use warm category XAPI for product tile/category context and PDP sitemaps as fallback product discovery coverage. Enrich selected IDs through product detail XAPI with strict batch sizes and retry/backoff.",
  "highest_coverage_route": "Combine category XAPI coverage across selected category seeds with all 10 PDP shards, dedupe by product_id, then enrich only approved product cohorts.",
  "coverage_ceiling": "Very high for discoverable public PDPs because the sampled shard alone contained 50,000 URLs and the index listed 10 PDP shards.",
  "main_trapdoors": [
    "do not crawl cart, checkout, account, search, or review-add routes",
    "PDP sitemaps can include products that later return 404 or unavailable detail responses",
    "detail XAPI can return edge 403s under repeated probing",
    "image URLs are file paths that need canonical image-host construction",
    "category/facet pages overlap heavily and require dedupe across category seeds",
    "warm-session category routes must not publish cookies, storage state, or browser-issued secrets"
  ],
  "sample_before_full_run": [
    "capture one category XHR from a visible browser page",
    "validate category pagination over 1-2 pages",
    "fetch sitemap index as fallback coverage",
    "parse product IDs",
    "enrich 1-5 products through detail XAPI",
    "validate price, availability, image URL construction, and stable product_id"
  ],
  "stop_conditions": [
    "route requires login, private account cookies, CAPTCHA, checkout, account, or private headers",
    "edge denials persist after backing off",
    "the requested fields require cart, personalization, or account state"
  ],
  "recommendation": "Publish this as the working retail catalog architecture example: category XAPI is the preferred warm-session route for product tiles and browse context; PDP sitemaps provide coverage fallback; product detail XAPI gives rich metadata for validated samples."
}
```

## FeasibilityReport

```json
{
  "score": 78,
  "traffic_light": "Green-Yellow",
  "interpretation": "Works as a public product discovery and enrichment architecture, but broad runs are edge-sensitive and should be paced, checkpointed, and approved.",
  "availability": "Public robots file and sitemap index are accessible. PDP shard mcom_sitemap_pdp_aa.xml.gz returned 50,000 product URLs in a successful probe.",
  "accessibility": "Sitemap index discovery is strong. A PDP shard returned 50,000 URLs in a successful probe. Product detail XAPI returned a rich public JSON sample. Later edge denials indicate both shard refresh and enrichment need careful batching.",
  "structure": "Product IDs are stable in PDP URLs. Detail JSON has organized groups for identifier, detail, pricing, imagery, availability, traits, reviews, and relationships.",
  "coverage": "High for public PDP discovery. Full enriched coverage depends on allowed request pacing and product availability.",
  "pagination": "Sitemap-index plus gzip shard pagination is explicit and simple. Detail enrichment is one product ID per request.",
  "runtime": "Discovery is cheap. Detail enrichment cost scales linearly with deduped product count.",
  "storage": "Store raw sitemap URLs, raw detail JSON for sampled/enriched products, normalized product snapshots, and run reports.",
  "risk": "Medium because retail sites enforce edge controls. Browser-issued cookies/storage may be used only as local owned-session context; do not publish them or use CAPTCHA solving, checkout routes, private account access, or rate-limit bypass.",
  "recommended_strategy": "Use a three-stage product pipeline: warm-session category API capture for browse/product tile metadata, PDP sitemap fallback for coverage, then conservative detail enrichment with checkpointing and quality gates.",
  "confidence": 0.86
}
```

## PipelineQualityPlan

```json
{
  "raw_layers": [
    "raw/sitemap_index.xml",
    "raw/pdp_sitemaps/*.xml.gz",
    "raw/product_detail/{product_id}.json"
  ],
  "normalized_layers": [
    "normalized/product_urls.jsonl",
    "normalized/product_snapshots.jsonl"
  ],
  "primary_key": ["product_id"],
  "dedupe": "dedupe product IDs across all PDP shards before enrichment",
  "quality_gates": [
    "sitemap index returns at least one PDP shard",
    "at least one accepted PDP shard parses at least 1 product URL",
    "product IDs parse from ID= query parameter",
    "detail response contains product[0].id matching requested product_id",
    "price fields parse as numeric value plus formatted value when present",
    "image file paths can be canonicalized to Macy's image host",
    "run report records all 403, 404, empty, and malformed detail responses"
  ],
  "observability": [
    "counts by sitemap shard",
    "deduped product count",
    "detail success/error counts",
    "sample field completeness",
    "edge-denial rate",
    "old/new product ID diff"
  ]
}
```

## PipelinePlan

```yaml
name: macys_public_product_metadata
entity: product_snapshot
source_access_class: public
run_date: 2026-06-09
strategy: warm_category_xapi_then_sitemap_fallback_then_checkpointed_detail_enrichment
sources:
  - name: warm_category_xapi
    type: browser_issued_xhr
    capture: visible category page network request
    fields: product tiles, category context, pagination, sort, facets
  - name: robots
    type: robots
    url: https://www.macys.com/robots.txt
  - name: sitemap_index
    type: sitemap_index
    url: https://www.macys.com/dyn_img/sitemap/mcom_sitemapindex.xml
  - name: pdp_sitemap_shards
    type: gzip_sitemap
    selector: mcom_sitemap_pdp_*.xml.gz
    observed_shards: 10
    sampled_shard: https://www.macys.com/dyn_img/sitemap/mcom_sitemap_pdp_aa.xml.gz
    sampled_url_count: 50000
    repeat_probe_note: immediate repeat later returned edge 403
  - name: product_detail_xapi
    type: json
    template: https://www.macys.com/xapi/digital/v1/product/{product_id}?currencyCode=USD&_deviceType=DESKTOP&_regionCode=US&_shoppingMode=SITE&_application=SITE&bigTicketCXHeaders=1&_customerExperiment=&_customerState=GUEST
headers:
  User-Agent: Mozilla/5.0 public-data-pipeline/0.1
  Accept: application/json,application/xml,text/plain,*/*
  Accept-Language: en-US,en;q=0.9
schema:
  primary_key:
    - product_id
  fields:
    - product_id
    - product_url
    - name
    - brand
    - regular_price
    - sale_price
    - available
    - description_text
    - bullet_text
    - image_urls
    - review_count
    - average_rating
    - traits
    - observed_at
outputs:
  - raw/sitemap_index.xml
  - raw/pdp_sitemaps/*.xml.gz
  - raw/product_detail/{product_id}.json
  - normalized/product_urls.jsonl
  - normalized/product_snapshots.jsonl
  - reports/run_report.json
limits:
  cookies_storage_state_local_only: true
  no_published_cookies: true
  no_auth: true
  no_cart_checkout_or_account_routes: true
  no_captcha_solving: true
  no_rate_limit_bypass: true
approval:
  full_run_approved: false
```

## ApprovalGate

```json
{
  "sample_validated": true,
  "full_run_approved": false,
  "recommended_next_step": "For publication, use the current evidence as a pipeline case study and run only tiny approved refresh checks. Do not run broad shard refresh or detail enrichment without explicit approval and pacing limits."
}
```

## LinkedIn Angle

This is the strongest retail case study because it is not "I scraped HTML." It is a real acquisition architecture:

```text
visible category page -> live category XAPI -> product tiles and pagination -> product detail XAPI -> PDP sitemap fallback coverage -> normalized product_snapshot table
```

The useful lesson is that the agent should not start with Playwright. It should first find the public catalog surfaces that already exist, then design a restartable pipeline around them.
