import fs from "node:fs";
import path from "node:path";
import EmbeddedPostgres from "embedded-postgres";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Pool } from "pg";

const PORT = 54329;
const DB_DIR = path.resolve(".test-db");

// Starts a fresh, disposable PostgreSQL, applies the real migrations, and removes everything afterwards.
export default async function setup() {
  fs.rmSync(DB_DIR, { recursive: true, force: true });
  const pg = new EmbeddedPostgres({
    databaseDir: DB_DIR,
    user: "ioweyouone",
    password: "ioweyouone",
    port: PORT,
    persistent: false,
    autoRehydrateSymlinks: true,
    initdbFlags: ["--encoding=UTF8", "--locale=C"],
    onLog: () => {},
    onError: () => {},
  });
  await pg.initialise();
  await pg.start();
  await pg.createDatabase("ioweyouone_test");

  const pool = new Pool({
    connectionString: `postgres://ioweyouone:ioweyouone@127.0.0.1:${PORT}/ioweyouone_test`,
  });
  await migrate(drizzle(pool), { migrationsFolder: path.resolve("drizzle") });
  await pool.end();

  return async () => {
    await pg.stop();
    fs.rmSync(DB_DIR, { recursive: true, force: true });
  };
}
