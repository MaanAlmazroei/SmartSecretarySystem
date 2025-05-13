// playwright.config.js
import { defineConfig } from "@playwright/test";

export default defineConfig({
  // Specify the folder where your E2E tests are located
  testDir: "./tests",

  // Base URL for your app
  use: {
    baseURL: "http://localhost:3000",
  },
  workers: "95%",
  timeout: 60000,

  fullyParallel: true,
});
