import { beforeEach, vi } from "vitest";
import { sql } from "drizzle-orm";
import { db } from "@/db";

// Capture outgoing emails instead of printing them, so tests can read reset links.
vi.mock("@/lib/email", () => ({ sendEmail: vi.fn(async () => {}) }));

// Every test starts from an empty database.
beforeEach(async () => {
  await db.execute(sql`TRUNCATE TABLE "verification", "session", "account", "user" CASCADE`);
});
