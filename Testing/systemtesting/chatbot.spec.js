import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('http://localhost:3000/');
  await page.getByRole('textbox', { name: 'Message...' }).click();
  await page.getByRole('textbox', { name: 'Message...' }).fill('hello');
  await page.getByRole('button', { name: 'Send' }).click();
  await page.getByRole('textbox', { name: 'Message...' }).click();
  await page.getByRole('textbox', { name: 'Message...' }).fill('how to find resources?');
  await page.getByRole('button', { name: 'Send' }).click();
  await page.getByRole('textbox', { name: 'Message...' }).click();
  await page.getByRole('textbox', { name: 'Message...' }).fill('can i upload tickets?');
  await page.getByRole('button', { name: 'Send' }).click();
  await page.getByRole('textbox', { name: 'Message...' }).click();
  await page.getByRole('textbox', { name: 'Message...' }).fill('what are you doing?');
  await page.getByRole('button', { name: 'Send' }).click();
  await page.getByRole('textbox', { name: 'Message...' }).click();
  await page.getByRole('textbox', { name: 'Message...' }).fill('thank u');
  await page.getByRole('button', { name: 'Send' }).click();
  await page.getByRole('button', { name: 'Hide' }).click();
});