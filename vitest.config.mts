import path from "node:path";
import { defineConfig } from "vitest/config";

// Tests use their own throw-away PostgreSQL (see tests/global-setup.ts), never the dev database.
const TEST_DB_PORT = 54329;

export default defineConfig({
  resolve: { alias: { "@": path.resolve(import.meta.dirname, "src") } },
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
    globalSetup: ["tests/global-setup.ts"],
    setupFiles: ["tests/setup.ts"],
    // One database shared by all test files, so run files one at a time.
    fileParallelism: false,
    testTimeout: 30_000,
    hookTimeout: 120_000,
    env: {
      DATABASE_URL: `postgres://ioweyouone:ioweyouone@127.0.0.1:${TEST_DB_PORT}/ioweyouone_test`,
      BETTER_AUTH_SECRET: "test-only-secret-0123456789abcdef0123456789",
      BETTER_AUTH_URL: "http://localhost:3000",
    },
  },
});
