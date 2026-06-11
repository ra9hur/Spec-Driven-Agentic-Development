// REQ-34: Cart page (inline, no overlay drawer)
// TEST-408: Cart Page Component

import { test, expect } from '@playwright/test';

test.describe('Cart Page', () => {
  // TEST-408: Cart page renders as a full page layout
  test('cart page renders inline content', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('/cart');

    const cartPage = page.locator('[data-testid="cart-page"]');
    await expect(cartPage).toBeVisible();
  });

  // TEST-408: Cart page heading
  test('cart page has Cart heading', async ({ page }) => {
    await page.goto('/cart');

    await expect(page.locator('h1:has-text("Cart")')).toBeVisible();
  });

  // TEST-408: Empty cart state
  test('shows empty message when no items', async ({ page }) => {
    await page.goto('/cart');
    await expect(page.locator('text=empty')).toBeVisible();
  });

  // TEST-408: Cart page has continue shopping link when empty
  test('empty cart has continue shopping link', async ({ page }) => {
    await page.goto('/cart');
    await expect(page.locator('a:has-text("Continue Shopping")')).toBeVisible();
  });
});
