import { test, expect } from "@playwright/test";

test("test", async ({ page }) => {
  await page.goto("http://localhost:3000/");
  await page.getByRole("button", { name: "Hide" }).click();
  await page
    .getByRole("navigation")
    .getByRole("link", { name: "Appointments" })
    .click();
  await page.getByRole("textbox", { name: "Email" }).click();
  await page
    .getByRole("textbox", { name: "Email" })
    .fill("official.hatimalharbi@gmail.com");
  await page.getByRole("textbox", { name: "Email" }).press("Tab");
  await page.getByRole("textbox", { name: "Password" }).fill("Password123");
  await page.getByRole("textbox", { name: "Password" }).press("Tab");
  await page.getByTestId("login-button").click();
  await page.getByRole("button", { name: "Hide" }).click();
  await page
    .getByRole("navigation")
    .getByRole("link", { name: "Appointments" })
    .click();
  await page
    .getByText("'; DROP TABLE hatim; --In ProgressCreated: May 7, 2025, 10:02")
    .click();
  await page.getByText("aaaaaaaaaaIn ProgressCreated").click();
  await page.getByText("hello In ProgressCreated: May").click();
  await page.getByRole("button", { name: "+ New Appointment" }).click();
  await page.getByRole("textbox", { name: "Appointment Title *" }).click();
  await page
    .getByRole("textbox", { name: "Appointment Title *" })
    .fill("I need bonus");
  await page.getByRole("textbox", { name: "Date *" }).fill("2027-10-18");
  await page.getByText("11:30 AM").click();
  await page.getByRole("textbox", { name: "Description *" }).click();
  await page
    .getByRole("textbox", { name: "Description *" })
    .fill("This is for testing purposes, i dont need bonus but i'd prefer it");
  await page.getByRole("button", { name: "Schedule Appointment" }).click();
  await page
    .getByText(
      "I need bonusIn ProgressCreated: May 10, 2025, 02:03 AMThis is for testing"
    )
    .click();
});
