import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('http://localhost:3000/');
  await page.getByRole('button', { name: 'Hide' }).click();
  await page.getByRole('navigation').getByRole('link', { name: 'Tickets' }).click();
  await page.getByRole('textbox', { name: 'Email' }).click();
  await page.getByRole('textbox', { name: 'Email' }).fill('official.hatimalharbi@gmail.com');
  await page.getByRole('textbox', { name: 'Email' }).press('Tab');
  await page.getByRole('textbox', { name: 'Password' }).fill('Password123');
  await page.getByRole('textbox', { name: 'Password' }).press('Tab');
  await page.getByRole('checkbox', { name: 'Remember me' }).press('Tab');
  await page.getByRole('link', { name: 'Forgot password?' }).press('Tab');
  await page.getByTestId('login-button').click();
  await page.getByRole('button', { name: 'Hide' }).click();
  await page.getByRole('navigation').getByRole('link', { name: 'Tickets' }).click();
  await page.getByRole('textbox', { name: 'Ticket Title *' }).click();
  await page.getByRole('textbox', { name: 'Ticket Title *' }).fill('Meeting');
  await page.getByRole('textbox', { name: 'Ticket Title *' }).press('Tab');
  await page.getByRole('textbox', { name: 'Description *' }).fill('Please have a meeting with me at 10 o\'clock');
  await page.getByRole('button', { name: 'Submit Ticket' }).click();
  await page.getByText('MeetingIn ProgressCreated:').click();
  await page.getByRole('button', { name: 'Close' }).click();
  await page.getByRole('link', { name: 'Sign Out' }).click();
});