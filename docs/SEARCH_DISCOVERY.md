# Search, GEO, and AI Discovery

Aether is designed to be understandable to both people and machines without relying on misleading SEO tactics. The site exposes a single canonical identity, useful public content, structured data, and clear boundaries around wellbeing claims.

## What ships with the app

- Canonical URLs, per-page titles and descriptions, Open Graph/Twitter previews, and language alternates.
- `WebSite`, `Organization`, `WebApplication`, `WebPage`, `BlogPosting`, `BreadcrumbList`, `FAQPage`, `HowTo`, and list structured data where the corresponding content is visible on the page.
- XML and image sitemaps containing canonical HTML pages, plus an RSS feed for newly published writing.
- A permissive crawler policy for major search, AI, and research crawlers.
- `/llms.txt` for concise entity facts and `/llms-full.txt` for citation-ready public editorial context.

## Release checklist

1. Set `NEXT_PUBLIC_SITE_URL` to the final HTTPS production origin. Search engines treat canonical URLs as identity; never leave a preview URL as the production canonical.
2. Set `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` and `NEXT_PUBLIC_BING_VERIFICATION` after verifying the final domain in Google Search Console and Bing Webmaster Tools.
3. Submit `${NEXT_PUBLIC_SITE_URL}/sitemap.xml` to both webmaster tools after the first production deploy and after material content changes.
4. Validate one representative page with Google's Rich Results Test and inspect the rendered canonical, robots directives, and JSON-LD.
5. Request indexing for the homepage and each newly published guide through Google Search Console's URL Inspection tool. IndexNow notifies participating engines, but it does not replace Google Search Console.
6. Keep article dates, author attribution, source links, and practical claims accurate. For wellbeing topics, preserve safety context and avoid turning educational content into medical claims.

## Editorial standard

The durable ranking signal is useful, attributable content—not a larger keyword list. Each new guide should answer a specific student question, include one practical next step, link to relevant Aether pathways, and cite primary or trusted sources where a factual claim needs support. Update an article's source file when its guidance changes so its sitemap and structured-data modification date remain meaningful.

## Important limits

GEO (generative engine optimization) has no universal ranking specification and no implementation can guarantee inclusion in an AI answer. Google does not require an AI-specific text file or schema type for AI Overviews or AI Mode: eligibility comes from being indexable in Google Search with a usable snippet. The machine-readable endpoints make Aether easier for compatible tools to identify and retrieve, while authoritative content, consistent publishing, domain verification, and credible external references remain the parts that must be earned over time.
