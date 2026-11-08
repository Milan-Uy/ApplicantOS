import { readFileSync } from "fs"
import { parseEnv } from "util"
import { defineConfig } from "@playwright/test"

process.loadEnvFile(".env.local")

// Checked against the file, not process.env: workers re-load this config with DEMO_EMAIL already overridden below.
const fileEnv = parseEnv(readFileSync(".env.local", "utf8"))
const e2eEmail = process.env.E2E_EMAIL?.trim().toLowerCase()
if (!e2eEmail || !process.env.E2E_PASSWORD) throw new Error("E2E_EMAIL and E2E_PASSWORD must be set in .env.local")
if (e2eEmail === fileEnv.DEMO_EMAIL?.trim().toLowerCase()) {
  throw new Error("E2E_EMAIL must not equal DEMO_EMAIL: tests reset the e2e user's data")
}
// Inside tests the e2e user is "the demo user", in the runner as well as in the dev server.
process.env.DEMO_EMAIL = process.env.E2E_EMAIL

const storageState = "e2e/.auth/e2e.json"

export default defineConfig({
  testDir: "./e2e",
  // One shared server-side user: isolation by serial execution plus a reset per mutating spec.
  workers: 1,
  fullyParallel: false,
  globalSetup: "./e2e/global-setup.ts",
  use: { baseURL: "http://localhost:3100" },
  webServer: {
    command: "npx next dev -p 3100",
    url: "http://localhost:3100",
    reuseExistingServer: false,
    timeout: 180_000,
    env: { DEMO_EMAIL: process.env.E2E_EMAIL! },
  },
  projects: [
    { name: "desktop", use: { viewport: { width: 1440, height: 900 }, storageState } },
    {
      name: "mobile",
      testMatch: /(screens|a11y|nav)\.spec\.ts$/,
      use: { viewport: { width: 390, height: 844 }, storageState },
    },
  ],
})
