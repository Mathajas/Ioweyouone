// Local development PostgreSQL (no system install needed). NOT for production.
// Usage: npm run db:dev   (keep running in its own terminal)
import fs from "node:fs";
import EmbeddedPostgres from "embedded-postgres";

const databaseDir = "./.dev-db";
const pg = new EmbeddedPostgres({
  databaseDir,
  user: "ioweyouone",
  password: "ioweyouone",
  port: 5432,
  persistent: true,
  autoRehydrateSymlinks: true,
  initdbFlags: ["--encoding=UTF8", "--locale=C"],
});

const firstRun = !fs.existsSync(databaseDir);
if (firstRun) await pg.initialise();
await pg.start();
if (firstRun) await pg.createDatabase("ioweyouone");
console.log("Dev PostgreSQL ready on 127.0.0.1:5432 (Ctrl+C to stop)");

const stop = async () => {
  await pg.stop();
  process.exit(0);
};
process.on("SIGINT", stop);
process.on("SIGTERM", stop);
