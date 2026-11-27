# Authentication

Status: **library chosen — Better Auth**.

## Requirements

Simple account system based on email and password:

- **Login** — sign in with email + password.
- **Register** — create an account with email + password.
- **Forgot password** — request a reset link by email and set a new password.

Out of scope for now: social login, 2FA, roles/permissions.

## Decision

Better Auth (TypeScript, MIT license), chosen by the user on 2026-11-27 as the most popular and actively maintained option.

Evidence gathered (from search results, not verified on GitHub): about 30k GitHub stars, last push 2026-09-17; it took over maintenance of Auth.js. Re-check current numbers and the latest security advisories before pinning a version.

Alternatives considered and rejected: `fastapi-users` (maintenance mode), Django + `django-allauth`, Ory Kratos (separate service, UI built by us).

## Storage

Users, sessions and tokens live in our PostgreSQL database (see [database.md](database.md)). Better Auth connects through a Drizzle, Prisma or Kysely adapter; Drizzle is proposed.

## Security checklist

- HTTPS only (Certbot), secure and HttpOnly session cookies.
- Strong `BETTER_AUTH_SECRET` kept outside git (environment variable).
- Rate limiting on login and password reset; confirm Better Auth's built-in limits in its docs and add Nginx `limit_req` as a second layer.
- Password reset links are single-use and expire; confirm defaults in the docs.
- Case-insensitive unique email.

Not yet verified in the docs: the exact password reset, rate limiting and password hashing defaults. Check them when implementing.

## Needed from outside

- Outgoing email (SMTP) for the reset link and optional email confirmation.

## Open questions

- Require email confirmation after registration?
- Email as the only identifier, or also a separate login name? (Initial text mentions "mail, password and login".)
- Which SMTP provider will send the emails?
