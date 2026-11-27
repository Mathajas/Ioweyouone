import { beforeEach, describe, expect, it, vi } from "vitest";
import { db } from "@/db";
import { verification } from "@/db/schema";
import { auth } from "@/lib/auth";
import { sendEmail } from "@/lib/email";
import { USER, expectAuthError, lastResetToken, login, register, requestReset } from "./helpers";

const NEW_PASSWORD = "brandnewpass99";

async function reset(token: string, newPassword = NEW_PASSWORD) {
  return auth.api.resetPassword({ body: { token, newPassword } });
}

beforeEach(() => {
  vi.mocked(sendEmail).mockClear();
});

describe("forgot password", () => {
  it("sends one email with a reset link to a registered address", async () => {
    await register();
    await requestReset(USER.email);
    expect(sendEmail).toHaveBeenCalledTimes(1);
    expect(vi.mocked(sendEmail).mock.calls[0][0]).toMatchObject({ to: USER.email });
    expect(lastResetToken()).toEqual(expect.any(String));
  });

  it("answers identically for unknown addresses and sends no email", async () => {
    await register();
    const known = await requestReset(USER.email);
    vi.mocked(sendEmail).mockClear();
    const unknown = await requestReset("nobody@example.com");
    expect(unknown).toEqual(known);
    expect(sendEmail).not.toHaveBeenCalled();
  });

  it("rejects an invalid email format", async () => {
    await expect(requestReset("not-an-email")).rejects.toBeDefined();
  });

  it("matches the address case-insensitively", async () => {
    await register();
    await requestReset("TEST@EXAMPLE.COM");
    expect(sendEmail).toHaveBeenCalledTimes(1);
  });
});

describe("reset password", () => {
  it("sets the new password; the old one stops working", async () => {
    await register();
    await requestReset(USER.email);
    await reset(lastResetToken());
    await expectAuthError(login(USER.email, USER.password), "INVALID_EMAIL_OR_PASSWORD");
    await expect(login(USER.email, NEW_PASSWORD)).resolves.toBeDefined();
  });

  it("works only once per token", async () => {
    await register();
    await requestReset(USER.email);
    const token = lastResetToken();
    await reset(token);
    await expectAuthError(reset(token, "anotherpass123"), "INVALID_TOKEN");
    await expect(login(USER.email, NEW_PASSWORD)).resolves.toBeDefined();
  });

  it("rejects an unknown token", async () => {
    await register();
    await expectAuthError(reset("not-a-real-token"), "INVALID_TOKEN");
    await expect(login(USER.email, USER.password)).resolves.toBeDefined();
  });

  it("rejects an expired token", async () => {
    await register();
    await requestReset(USER.email);
    const token = lastResetToken();
    await db.update(verification).set({ expiresAt: new Date(Date.now() - 60_000) });
    await expectAuthError(reset(token), "INVALID_TOKEN");
    await expect(login(USER.email, USER.password)).resolves.toBeDefined();
  });

  it("rejects a new password shorter than 8 characters and keeps the token usable", async () => {
    await register();
    await requestReset(USER.email);
    const token = lastResetToken();
    await expectAuthError(reset(token, "short"), "PASSWORD_TOO_SHORT");
    await expect(reset(token)).resolves.toBeDefined();
  });

  it("rejects a new password longer than 128 characters", async () => {
    await register();
    await requestReset(USER.email);
    await expectAuthError(reset(lastResetToken(), "a".repeat(129)), "PASSWORD_TOO_LONG");
  });

  it("issues a different token for every request and the latest one works", async () => {
    await register();
    await requestReset(USER.email);
    const first = lastResetToken();
    await requestReset(USER.email);
    const second = lastResetToken();
    expect(second).not.toBe(first);
    await expect(reset(second)).resolves.toBeDefined();
  });

  it("removes the token from the database after a successful reset", async () => {
    await register();
    await requestReset(USER.email);
    await reset(lastResetToken());
    expect(await db.select().from(verification)).toHaveLength(0);
  });
});
