import { test, expect } from '@playwright/test';



test.describe('Public Routes', () => {
  test('navigate to public routes', async ({ page }) => {
    // Navigate to Home Page
    await page.goto('http://localhost:3000/');
    await expect(page.locator('h1')).toHaveText('Welcome to Smart Secretary System');

    // Navigate to Login Page
    await page.goto('http://localhost:3000/login');
    await expect(page.locator('h1')).toHaveText('Welcome');

    // Navigate to Signup Page
    await page.goto('http://localhost:3000/signup');
    await expect(page.locator('h1')).toHaveText('Create Account');

    // Navigate to Resources Page
    await page.goto('http://localhost:3000/resources');
    await expect(page.locator('h1')).toHaveText('Resources');
  });
});