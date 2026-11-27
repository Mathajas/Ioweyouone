# Database

Status: **PostgreSQL chosen** (assistant recommendation, confirm).

## Requirements

- Simple SQL database, not file-based (so not SQLite).
- Runs on the same host as the website.

## Decision

PostgreSQL on the same Linux host.

Why:
- Better Auth supports PostgreSQL through its built-in Kysely adapter, and through Drizzle and Prisma adapters (per Better Auth documentation seen in search results).
- Mature, widely used, free, runs well on a small VPS.

Alternative: MariaDB/MySQL (also supported by Better Auth/Kysely). Choose it only if you already know it better.

## Setup notes

- Bind to `127.0.0.1` only; no public port.
- Separate database user for the application with minimal privileges.
- Migrations with `drizzle-kit` (or the Better Auth CLI when using the built-in Kysely adapter). Note: the Better Auth CLI migrate command does not work with Prisma/Drizzle adapters; use the ORM's own migration tool there.
- Backups: `pg_dump` via cron, stored off the server.

## Open questions

- Data model beyond the auth tables (users, sessions, accounts, verification) — depends on site features.
