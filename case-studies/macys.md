# Case Study: Macy's Product Metadata

## User Ask

Find all public product metadata at Macy's. Prefer reverse-engineered public API endpoints over HTML scraping.

## Discovery Path

The endpoint-first route was:

```text
robots-listed sitemap index
-> catalog category sitemap
-> public category discover XAPI
-> product IDs and listing-grid metadata
-> public product detail XAPI when deeper metadata is needed
```

## Public Sources

Category sitemap:

```text
https://www.macys.com/dyn_img/sitemap/mcom_sitemap_cat_aa.xml.gz
```

Category page-data endpoint:

```text
https://www.macys.com/xapi/discover/v1/page?pathname={category_path}&id={category_id}&_deviceType=DESKTOP&_regionCode=US&_application=SITE
```

Product detail endpoint:

```text
https://www.macys.com/xapi/digital/v1/product/{product_id}?currencyCode=USD&_deviceType=DESKTOP&_regionCode=US&_shoppingMode=SITE&_application=SITE&bigTicketCXHeaders=1&_customerExperiment=&_customerState=GUEST
```

## Probe Notes

- The category sitemap contained thousands of catalog category URLs.
- Category discover responses exposed category metadata, product counts, product IDs, and product listing-grid objects.
- Product detail responses exposed richer product metadata for a specific product ID.
- Some shell clients returned 403 on early probes, but a normal Python HTTP client with a transparent `User-Agent` could retrieve public sitemap and JSON responses.
- Full category traversal needs dedupe because categories and facets overlap.

## Sample Shape

```json
{
  "category_id": "338138",
  "category_name": "UGG Men's Slippers",
  "product_id": "21552892",
  "name": "UGG Men's Tasman II Slipper",
  "brand": "UGG",
  "price": "$125.00",
  "confidence": 0.9
}
```

## Feasibility

```json
{
  "technical_feasibility": 82,
  "interpretation": "feasible",
  "recommended_strategy": "Use category sitemap discovery, category discover XAPI for product IDs and listing metadata, and product detail XAPI for enrichment.",
  "main_risks": [
    "category overlap and duplicate products",
    "pagination and facet coverage",
    "regional availability differences",
    "runtime for full enrichment"
  ]
}
```

## Why This Matters

HTML scraping would be slower and more brittle. The public endpoint path gives stable IDs, category context, prices, images, availability, and pagination signals directly.

