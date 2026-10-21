import { defineConfig, devices } from "@playwright/test";

const PORT = 43127;
const BASE = `http://127.0.0.1:${PORT}`;

export default defineConfig({
  testDir: "tests/e2e",
  timeout: 30_000,
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: [["list"]],
  use: {
    baseURL: BASE,
    trace: "on-first-retry",
    ...devices["Pixel 5"]
  },
  webServer: {
    command: `python3 server.py --port ${PORT}`,
    url: BASE,
    reuseExistingServer: !process.env.CI,
    timeout: 30_000
  }
});
