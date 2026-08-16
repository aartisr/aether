import { expect, test } from '@playwright/test';

const publicRoutes = [
  '/',
  '/about',
  '/accessibility',
  '/ask',
  '/blog',
  '/echo',
  '/fairness-governance',
  '/feedback',
  '/mentors',
  '/offline',
  '/peer-navigator',
  '/privacy',
  '/resilience-pathway',
];

const viewports = [
  { name: 'small phone', width: 320, height: 720 },
  { name: 'tablet', width: 768, height: 1024 },
];

test.describe('Public-page responsive guardrails', () => {
  for (const viewport of viewports) {
    test(`keeps every public page usable on a ${viewport.name}`, async ({ page }) => {
      await page.setViewportSize(viewport);

      for (const route of publicRoutes) {
        const response = await page.goto(route, { waitUntil: 'domcontentloaded' });

        expect(response?.status(), `${route} should load`).toBeLessThan(400);
        await expect(page.locator('body')).toBeVisible();
        await expect
          .poll(
            () => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
            { message: `${route} should not create horizontal scrolling at ${viewport.width}px` },
          )
          .toBe(true);
      }
    });
  }
});
