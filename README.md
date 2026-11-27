# Ioweyouone — project decisions

Status: **initial decisions, no code yet**. This document records the tech stack decisions. Product behavior is documented in [doc/](doc/).

## Goal

A dynamic website hosted on a single Linux server. The database runs on the same host. The site should look nice and modern.

## Assumptions

- One Linux VPS, small to medium traffic.
- Dynamic site (data from a database), not a purely static one.

To confirm: what the site does besides authentication (blog, dashboard, shop, API).

## Tech stack

| Layer | Choice | Notes |
|---|---|---|
| Web server | Nginx | Reverse proxy, TLS, static caching. |
| Application | Next.js (TypeScript) on Node.js LTS | Proposed framework; process supervised by systemd. |
| Authentication | Better Auth | Email + password, register, login, forgot password. See [doc/auth.md](doc/auth.md). |
| Database | PostgreSQL (localhost) | Server-based SQL database, not file-based. See [doc/database.md](doc/database.md). |
| ORM / migrations | Drizzle ORM + drizzle-kit | Proposed; works with Better Auth. |
| Styling | Tailwind CSS | White and green theme (`brand` colors in `src/app/globals.css`). shadcn/ui not used yet. |
| HTTPS | Certbot (Let's Encrypt) | Automatic certificate renewal. |
| Deploy | `git pull` + build + systemd service restart | No Docker at the start. |

Items marked "proposed" were chosen by the assistant and are not yet confirmed.

## Look and UI

- Tailwind CSS with shadcn/ui components (accessible, easy to restyle).
- System font or a single Google Font (e.g. Inter).
- Light and dark mode, responsive layout (mobile first), readable contrast.
- Icons: Lucide (inline SVG).

## Architecture

```
Internet -> Nginx (TLS) -> Next.js (Node.js) -> PostgreSQL (localhost)
                                 |
                            Better Auth (sessions in the same database)
```

- The database listens on `127.0.0.1` only, with no external access.
- The application runs as a systemd service with restart on failure.

## Local development

Prerequisite: Node.js 20+.

```
npm install
cp .env.example .env.local      # then set BETTER_AUTH_SECRET (openssl rand -base64 32)
npm run db:dev                  # terminal 1: local PostgreSQL (dev only, data in .dev-db/)
npm run db:migrate              # terminal 2: create tables
npm run dev                     # terminal 2: http://localhost:3000
```

Tests (Vitest, see [doc/testing.md](doc/testing.md)): `npm test`. They start their own disposable PostgreSQL, so no setup is needed.

Pages: `/login`, `/register`, `/forgot-password`, `/reset-password`, `/` (signed-in home).
Password reset emails are printed to the server console until an SMTP provider is configured (`src/lib/email.ts`).
On a server, use a real PostgreSQL instead of `db:dev` and set `DATABASE_URL`.

## Next steps

1. Confirm site features and the data model.
2. Create the Next.js skeleton with Tailwind, shadcn/ui, Drizzle and Better Auth.
3. Set up PostgreSQL and migrations.
4. Prepare the Nginx config, systemd service and Certbot certificate.
5. Set up database backups (`pg_dump` via cron).

## Conventions

All files, code and comments are written in English.
