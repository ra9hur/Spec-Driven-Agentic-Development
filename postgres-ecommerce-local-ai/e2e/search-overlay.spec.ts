// REQ-30: Multi-column dynamic grid scaling
// REQ-31: Category sorting & price filters
// REQ-40: 404 handling for invalid categories
// TEST-402: Multi-Column Dynamic Grid Scaling
// TEST-406: Category Sorting & Price Filters
// TEST-411: Invalid Category Route 404

import { test, expect } from '@playwright/test';

function getColumnCount(gtc: string): number {
  const match = gtc.match(/repeat\((\d+)/);
  if (match) return parseInt(match[1]);
  return gtc.split(' ').length;
}

test.describe('Product Grid Scaling', () => {
  // TEST-402: Desktop 4-column grid
  test('desktop shows 4-column product grid', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('/shop');

    const grid = page.locator('[data-testid="product-grid"]');
    const display = await grid.evaluate((el) => window.getComputedStyle(el).display);
    const columns = await grid.evaluate((el) => {
      const gtc = window.getComputedStyle(el).gridTemplateColumns;
      const match = gtc.match(/repeat\((\d+)/);
      return match ? parseInt(match[1]) : gtc.split(' ').length;
    });
    expect(columns).toBe(4);
  });

  // TEST-402: Mobile 2-column grid
  test('mobile shows 2-column product grid', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/shop');

    const grid = page.locator('[data-testid="product-grid"]');
    const columns = await grid.evaluate((el) => {
      const gtc = window.getComputedStyle(el).gridTemplateColumns;
      const match = gtc.match(/repeat\((\d+)/);
      return match ? parseInt(match[1]) : gtc.split(' ').length;
    });
    expect(columns).toBe(2);
  });
});

test.describe('Category Sorting & Filters', () => {
  // TEST-406: Sort dropdown exists
  test('category page has sort dropdown', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('/shop/t-shirts');

    const sortSelect = page.locator('select').first();
    await expect(sortSelect).toBeVisible();
  });

  // TEST-406: Price filter exists
  test('category page has price range filter', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('/shop/t-shirts');

    const priceSlider = page.locator('input[type="range"]').first();
    await expect(priceSlider).toBeVisible();
  });
});

test.describe('Invalid Category Route', () => {
  // TEST-411: 404 on non-existent category
  test('returns 404 for non-existent category', async ({ page }) => {
    await page.goto('/shop/non-existent-category');
    await expect(page.locator('text=404').or(page.locator('text=not found'))).toBeVisible();
  });

  // TEST-411: 404 page has navigation back
  test('404 page has back to shop link', async ({ page }) => {
    await page.goto('/shop/non-existent-category');
    const backLink = page.locator('a:has-text("Shop")').or(page.locator('a:has-text("Back")'));
    await expect(backLink).toBeAttached();
  });
});
