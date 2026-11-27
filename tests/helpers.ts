import { expect, vi } from "vitest";
import { auth } from "@/lib/auth";
import { sendEmail } from "@/lib/email";

export const USER = { name: "Test User", email: "test@example.com", password: "password1234" };

export async function register(overrides: Partial<typeof USER> = {}) {
  return auth.api.signUpEmail({ body: { ...USER, ...overrides } });
}

export async function login(email = USER.email, password = USER.password) {
  return auth.api.signInEmail({ body: { email, password }, returnHeaders: true });
}

// Turns Set-Cookie headers from a response into a Cookie request header.
export function cookieHeader(responseHeaders: Headers): Headers {
  const cookie = responseHeaders
    .getSetCookie()
    .map((c) => c.split(";")[0])
    .join("; ");
  return new Headers({ cookie });
}

export async function requestReset(email: string) {
  return auth.api.requestPasswordReset({ body: { email, redirectTo: "/reset-password" } });
}

// Extracts the reset token from the last captured email.
export function lastResetToken(): string {
  const calls = vi.mocked(sendEmail).mock.calls;
  expect(calls.length).toBeGreaterThan(0);
  const text = calls[calls.length - 1][0].text;
  const match = text.match(/reset-password\/([^?\s]+)/);
  expect(match).not.toBeNull();
  return match![1];
}

// Asserts a promise rejects with a Better Auth error carrying the given code.
export async function expectAuthError(promise: Promise<unknown>, code: string) {
  await expect(promise).rejects.toMatchObject({ body: { code } });
}
