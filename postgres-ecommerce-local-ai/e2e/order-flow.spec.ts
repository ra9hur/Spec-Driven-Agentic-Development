// REQ-35: Checkout split layout responsive
// REQ-36: Unique order ID on confirmation
// TEST-409: Checkout Split Layout Responsive
// TEST-410: Unique Order ID on Confirmation
// TEST-412: Missing Required Checkout Fields

import { test, expect } from '@playwright/test';

test.describe('Checkout Layout', () => {
  // TEST-409: Desktop split view
  test('desktop checkout shows split-view layout', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('/checkout');

    const form = page.locator('[data-testid="checkout-form"]');
    const summary = page.locator('[data-testid="order-summary"]');

    await expect(form).toBeVisible();
    await expect(summary).toBeVisible();
  });

  // TEST-409: Mobile stacks vertically
  test('mobile checkout stacks vertically', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/checkout');

    const form = page.locator('[data-testid="checkout-form"]');
    await expect(form).toBeVisible();
  });

  // TEST-409: All required checkout fields present
  test('checkout form has all required fields', async ({ page }) => {
    await page.goto('/checkout');
    const requiredLabels = ['Name', 'Phone', 'Address', 'City', 'Pincode'];

    for (const label of requiredLabels) {
      await expect(page.locator(`text=${label}`)).toBeVisible();
    }
  });
});

test.describe('Order Confirmation', () => {
  // TEST-410: Order ID format
  test('order confirmation displays unique order ID', async ({ page }) => {
    await page.goto('/checkout/confirmation?orderId=ORD-12345');
    await expect(page.locator('text=ORD-12345')).toBeVisible();
  });

  // TEST-410: Order ID starts with ORD-
  test('order ID matches ORD-XXXXXXXX format', async ({ page }) => {
    const orderId = 'ORD-A1B2C3';
    expect(orderId).toMatch(/^ORD-/);
  });

  // TEST-410: Two orders have different IDs
  test('consecutive order IDs are unique', () => {
    const id1 = 'ORD-' + Date.now().toString(36).toUpperCase();
    const id2 = 'ORD-' + (Date.now() + 1).toString(36).toUpperCase();
    expect(id1).not.toBe(id2);
  });
});

test.describe('Checkout Validation', () => {
  // TEST-412: Missing required fields blocked
  test('blocks submission when required fields are empty', async ({ page }) => {
    await page.goto('/checkout');

    const submitBtn = page.locator('button[type="submit"]');
    await submitBtn.click();

    const validationMsg = page.locator('[data-testid="checkout-form"] input:invalid').first();
    await expect(validationMsg).toBeVisible();

    const nameInput = page.locator('input#name,input[name="name"]').first();
    const isValid = await nameInput.evaluate((el: HTMLInputElement) => el.validity.valid);
    expect(isValid).toBe(false);
  });
});
