import { expect, test } from '@playwright/test';

const phoneViewport = { width: 320, height: 720 };
const tabletViewport = { width: 768, height: 1024 };
const desktopViewport = { width: 1440, height: 960 };

async function expectNoHorizontalOverflow(page: import('@playwright/test').Page) {
  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth))
    .toBe(true);
}

test.describe('Homepage calm-entry flow', () => {
  for (const viewport of [phoneViewport, tabletViewport, desktopViewport]) {
    test(`keeps the first visit flow usable at ${viewport.width}px`, async ({ page }) => {
      await page.setViewportSize(viewport);
      await page.goto('/');

      await expect(page.getByRole('heading', { name: 'Aether', level: 1 })).toBeVisible();
      await expect(page.locator('.home-hero')).toBeVisible();
      await expect(page.locator('.home-hero').getByRole('link').first()).toBeVisible();
      await expect(page.locator('.home-journey-dock')).toBeVisible();
      await expect(page.locator('.home-page')).toBeVisible();
      await expectNoHorizontalOverflow(page);
    });
  }
});
