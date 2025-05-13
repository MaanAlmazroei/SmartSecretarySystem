import { test, expect } from "@playwright/test";

test("test", async ({ page }) => {
  await page.goto("http://localhost:3000/");
  await page.getByRole("button", { name: "Hide" }).click();
  await page
    .getByRole("navigation")
    .getByRole("link", { name: "Resources" })
    .click();
  await page.getByText("+").first().click();
  await page.getByText("+").first().click();
  const downloadPromise = page.waitForEvent("download");
  await page
    .locator("div")
    .filter({ hasText: /^Download−$/ })
    .getByRole("button")
    .click();
  const download = await downloadPromise;
  const download1Promise = page.waitForEvent("download");
  await page
    .locator("div")
    .filter({ hasText: /^Download\+$/ })
    .getByRole("button")
    .click();
  const download1 = await download1Promise;
  await page.getByText("course registeration and deletion 2+").click();
  await page.getByText("test1234+").click();
  await page.getByText("Course Addition and Deletion+").click();
  await page.getByText("Course Deletion+").click();
  await page.getByText("test2").click();
  await page.getByRole("textbox", { name: "Search for a topic..." }).click();
  await page
    .getByRole("textbox", { name: "Search for a topic..." })
    .fill("File");
  await page.getByText("+").click();
  const download2Promise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download" }).click();
  const download2 = await download2Promise;
});
