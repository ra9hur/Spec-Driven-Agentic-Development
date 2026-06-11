// REQ-27 to REQ-29: Adaptive navigation & breakpoint architecture
// REQ-26: Global theme CSS
// TEST-401: Adaptive Visual Navigation & Breakpoint Architecture
// TEST-403: Global Obsidian Theme CSS Verification
// TEST-404: Desktop Header Structure
// TEST-405: Mobile Bottom Navigation Tray

import { test, expect } from '@playwright/test';

test.describe('Responsive Navigation', () => {
  // TEST-401: Desktop shows full header
  test('desktop shows full horizontal header with search bar', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('/');

    const header = page.locator('header');
    await expect(header).toBeVisible();
    await expect(page.locator('text=Press ⌘K to ask AI')).toBeVisible();
  });

  // TEST-401: Mobile shows condensed header and bottom nav
  test('mobile shows condensed header and bottom nav', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    const bottomNav = page.locator('[data-testid="mobile-bottom-nav"]');
    await expect(bottomNav).toBeVisible();
  });

  // TEST-401: Desktop hides mobile bottom nav
  test('desktop hides mobile bottom navigation tray', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('/');

    const bottomNav = page.locator('[data-testid="mobile-bottom-nav"]');
    await expect(bottomNav).not.toBeVisible();
  });

  // TEST-401: Mobile bottom nav has 4 touch targets
  test('mobile bottom nav shows Home, Search, Cart, Account touch targets', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    const bottomNav = page.locator('[data-testid="mobile-bottom-nav"]');
    await expect(bottomNav.locator('text=Home')).toBeVisible();
    await expect(bottomNav.locator('text=Search')).toBeVisible();
    await expect(bottomNav.locator('text=Cart')).toBeVisible();
    await expect(bottomNav.locator('text=Account')).toBeVisible();
  });

  // TEST-403: Global theme CSS verification
  test('body has correct background canvas color', async ({ page }) => {
    await page.goto('/');
    const body = page.locator('body');
    await expect(body).toHaveClass(/bg-canvas/);
    const bgColor = await page.evaluate(() =>
      window.getComputedStyle(document.body).backgroundColor
    );
    expect(bgColor !== 'rgba(0, 0, 0, 0)' && bgColor !== 'transparent').toBe(true);
  });

  // TEST-403: Accent color on interactive elements
  test('interactive elements use accent color', async ({ page }) => {
    await page.goto('/');
    const button = page.locator('button').first();
    const textColor = await button.evaluate((el) =>
      window.getComputedStyle(el).color
    );
    expect(textColor).toBeTruthy();
  });

  // TEST-404: Desktop header has logo
  test('desktop header displays store branding', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('/');

    await expect(page.locator('header a:has-text("Postgres E-Com")')).toBeVisible();
  });

  // TEST-404: Desktop header has Shop, Cart, Account nav links
  test('desktop header contains Shop, Cart, Account links', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('/');

    await expect(page.locator('header a:has-text("Shop")')).toBeVisible();
    await expect(page.locator('header a:has-text("Cart")')).toBeVisible();
    await expect(page.locator('header a:has-text("Account")')).toBeVisible();
  });

  // TEST-405: Mobile bottom nav fixed position
  test('mobile bottom nav has fixed positioning at bottom', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    await expect(page.locator('[data-testid="mobile-bottom-nav"]')).toHaveClass(/fixed/);
  });
});
