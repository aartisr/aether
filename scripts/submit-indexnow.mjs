#!/usr/bin/env node

/**
 * Submit every canonical URL in a sitemap to IndexNow.
 *
 * Defaults are intentionally public and overrideable so the same script can be
 * reused for preview or production domains without editing repository files.
 */
const defaults = {
  siteUrl: 'https://aether.ai-aarti.com',
  key: 'E89462A2-342D-422A-9CCA-256ED04FBF52',
  endpoint: 'https://api.indexnow.org/indexnow',
};

const siteUrl = withoutTrailingSlash(process.env.INDEXNOW_SITE_URL ?? defaults.siteUrl);
const key = process.env.INDEXNOW_KEY ?? defaults.key;
const sitemapUrl = process.env.INDEXNOW_SITEMAP_URL ?? `${siteUrl}/sitemap.xml`;
const keyLocation = process.env.INDEXNOW_KEY_LOCATION ?? `${siteUrl}/${key}.txt`;
const endpoint = process.env.INDEXNOW_ENDPOINT ?? defaults.endpoint;
const dryRun = process.argv.includes('--dry-run');
const batchSize = 10_000;

async function main() {
  const site = new URL(siteUrl);
  const sitemap = new URL(sitemapUrl);
  const keyUrl = new URL(keyLocation);
  const submitEndpoint = new URL(endpoint);

  if (site.protocol !== 'https:' || sitemap.protocol !== 'https:' || keyUrl.protocol !== 'https:') {
    throw new Error('INDEXNOW_SITE_URL, INDEXNOW_SITEMAP_URL, and INDEXNOW_KEY_LOCATION must use HTTPS.');
  }

  if (keyUrl.host !== site.host) {
    throw new Error('INDEXNOW_KEY_LOCATION must be hosted on the same host as INDEXNOW_SITE_URL.');
  }

  console.log(`Checking IndexNow key: ${keyUrl.href}`);
  await verifyKeyFile(keyUrl, key);

  console.log(`Reading sitemap: ${sitemap.href}`);
  const urls = await collectSitemapUrls(sitemap, site.host);
  if (urls.length === 0) {
    throw new Error(`No URLs were found in ${sitemap.href}.`);
  }

  console.log(`Found ${urls.length} canonical URL${urls.length === 1 ? '' : 's'}.`);
  if (dryRun) {
    console.log('Dry run complete. Nothing was submitted.');
    return;
  }

  const batches = chunk(urls, batchSize);
  let accepted = 0;
  let pendingValidation = 0;

  for (const [index, urlBatch] of batches.entries()) {
    const result = await submitBatch({ endpoint: submitEndpoint, host: site.host, key, keyLocation: keyUrl.href, urls: urlBatch });
    const label = `Batch ${index + 1}/${batches.length} (${urlBatch.length} URL${urlBatch.length === 1 ? '' : 's'})`;

    if (result.status === 200) {
      accepted += urlBatch.length;
      console.log(`${label}: accepted (HTTP 200).`);
      continue;
    }

    if (result.status === 202) {
      accepted += urlBatch.length;
      pendingValidation += urlBatch.length;
      console.log(`${label}: accepted; key validation is pending (HTTP 202).`);
      continue;
    }

    const detail = result.body ? ` ${result.body}` : '';
    throw new Error(`${label}: IndexNow rejected the submission (HTTP ${result.status}).${detail}`);
  }

  console.log(`IndexNow accepted ${accepted}/${urls.length} URL${urls.length === 1 ? '' : 's'}.`);
  if (pendingValidation > 0) {
    console.log(`${pendingValidation} URL${pendingValidation === 1 ? ' is' : 's are'} awaiting key validation.`);
  } else {
    console.log('Submission verified: every batch received HTTP 200.');
  }
}

async function verifyKeyFile(keyUrl, expectedKey) {
  const response = await fetch(keyUrl, { headers: { Accept: 'text/plain' } });
  const body = (await response.text()).trim();

  if (!response.ok) {
    throw new Error(`IndexNow key file is not reachable (HTTP ${response.status}). Deploy ${keyUrl.pathname} before submitting.`);
  }
  if (body !== expectedKey) {
    throw new Error('IndexNow key file content does not exactly match INDEXNOW_KEY.');
  }
}

async function collectSitemapUrls(initialSitemap, expectedHost) {
  const pending = [initialSitemap];
  const visitedSitemaps = new Set();
  const urls = new Set();

  while (pending.length > 0) {
    const sitemap = pending.shift();
    if (!sitemap || visitedSitemaps.has(sitemap.href)) continue;
    visitedSitemaps.add(sitemap.href);

    const response = await fetch(sitemap, { headers: { Accept: 'application/xml, text/xml;q=0.9, */*;q=0.1' } });
    if (!response.ok) {
      throw new Error(`Sitemap ${sitemap.href} could not be read (HTTP ${response.status}).`);
    }

    const xml = await response.text();
    const locations = extractLocations(xml);
    const isSitemapIndex = /<sitemapindex\b/i.test(xml);

    for (const location of locations) {
      const url = new URL(location);
      if (url.protocol !== 'https:' || url.host !== expectedHost) {
        throw new Error(`Sitemap contains a URL outside the configured host: ${url.href}`);
      }

      if (isSitemapIndex) {
        pending.push(url);
      } else {
        urls.add(url.href);
      }
    }
  }

  return [...urls].sort();
}

function extractLocations(xml) {
  return [...xml.matchAll(/<loc>\s*([^<]+?)\s*<\/loc>/gi)].map((match) => decodeXmlEntities(match[1].trim()));
}

function decodeXmlEntities(value) {
  return value
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'");
}

async function submitBatch({ endpoint, host, key, keyLocation, urls }) {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({ host, key, keyLocation, urlList: urls }),
  });

  return { status: response.status, body: (await response.text()).trim().slice(0, 500) };
}

function chunk(items, size) {
  return Array.from({ length: Math.ceil(items.length / size) }, (_, index) => items.slice(index * size, (index + 1) * size));
}

function withoutTrailingSlash(value) {
  return value.replace(/\/+$/, '');
}

main().catch((error) => {
  console.error(`IndexNow submission failed: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
});
