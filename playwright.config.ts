import { readFileSync } from "fs"
import { parseEnv } from "util"
import { defineConfig } from "@playwright/test"

process.loadEnvFile(".env.local")

// Tests reset the E2E_EMAIL user's data, so it must never be the live demo account — whichever
// DEMO_EMAIL wins (shell or file). Only the dev server sees DEMO_EMAIL=E2E_EMAIL (webServer.env).
const norm = (s?: string) => s?.trim().toLowerCase() ?? ""
const e2eEmail = norm(process.env.E2E_EMAIL)
const demoEmails = [process.env.DEMO_EMAIL, parseEnv(readFileSync(".env.local", "utf8")).DEMO_EMAIL].map(norm)
if (!e2eEmail || !process.env.E2E_PASSWORD) throw new Error("E2E_EMAIL and E2E_PASSWORD must be set")
if (!demoEmails[0]) throw new Error("DEMO_EMAIL must be set so the tests can prove they are not resetting it")
if (demoEmails.includes(e2eEmail)) throw new Error("E2E_EMAIL must not equal DEMO_EMAIL: tests reset the e2e user's data")

const storageState = "e2e/.auth/e2e.json"

export default defineConfig({
  testDir: "./e2e",
  // One shared server-side user: isolation by serial execution plus a reset per mutating spec.
  workers: 1,
  fullyParallel: false,
  // First visit to a route compiles it in `next dev`; on a cold cache that alone can pass 30 s.
  timeout: 60_000,
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
