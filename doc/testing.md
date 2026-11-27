# Testing

Automated tests use Vitest (the TypeScript counterpart of pytest). Run them with `npm test` (`npm run test:watch` for watch mode).

## How it works

- Integration tests: they call the real Better Auth instance (`auth.api.*`) against a real PostgreSQL. Nothing in the auth or database layer is mocked.
- `tests/global-setup.ts` starts a disposable PostgreSQL on port 54329, applies the real Drizzle migrations from `drizzle/`, and deletes everything afterwards. The dev database is never touched. No manual setup is needed.
- `tests/setup.ts` empties all tables before every test, so tests are independent.
- The email sender (`src/lib/email.ts`) is mocked so tests can read the reset link from the "sent" email.
- Test files run one at a time because they share one database.

## Covered cases

Register (`tests/register.test.ts`): success and auto sign-in, email stored in lower case, password never stored in plain text, duplicate email (also with different letter case), password length limits (7 / 8 / 128 / 129 characters), invalid email, missing name, no user created on failure.

Login (`tests/login.test.ts`): correct credentials, HttpOnly + SameSite session cookie, wrong password, unknown email, identical error for both (no account enumeration), email case-insensitive, password case-sensitive, empty password, invalid email format, session readable with cookie, no session without or with a forged cookie, sign out invalidates the session, two independent sessions.

Forgot / reset password (`tests/password-reset.test.ts`): email sent to a registered address, identical answer and no email for unknown addresses, invalid email format, case-insensitive match, new password works and old one stops, token is single-use, unknown token, expired token, too short / too long new password (token stays usable after a rejected password), new token on every request, token removed after success.

## Not covered

- Browser behavior (form validation messages, the "passwords do not match" check, redirects). That needs an end-to-end tool such as Playwright.
- Rate limiting. Better Auth does not rate limit outside production by default; verify and test it when deploying.
- Email confirmation and real SMTP delivery (not enabled yet).
