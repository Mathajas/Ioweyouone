import { eq } from "drizzle-orm";
import { describe, expect, it } from "vitest";
import { db } from "@/db";
import { account, user } from "@/db/schema";
import { USER, expectAuthError, register } from "./helpers";

describe("register", () => {
  it("creates an account and returns the user", async () => {
    const result = await register();
    expect(result.user).toMatchObject({ name: USER.name, email: USER.email, emailVerified: false });
    expect(result.token).toEqual(expect.any(String)); // user is signed in right after registering
  });

  it("stores the email in lower case", async () => {
    await register({ email: "Mixed.Case@Example.COM" });
    const rows = await db.select().from(user);
    expect(rows).toHaveLength(1);
    expect(rows[0].email).toBe("mixed.case@example.com");
  });

  it("never stores the password in plain text", async () => {
    await register();
    const [row] = await db.select().from(account).where(eq(account.providerId, "credential"));
    expect(row.password).toBeTruthy();
    expect(row.password).not.toContain(USER.password);
  });

  it("rejects an email that is already registered", async () => {
    await register();
    await expectAuthError(register({ name: "Other" }), "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL");
  });

  it("treats emails case-insensitively when checking duplicates", async () => {
    await register();
    await expectAuthError(register({ email: "TEST@EXAMPLE.COM" }), "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL");
  });

  it("rejects a password shorter than 8 characters", async () => {
    await expectAuthError(register({ password: "short" }), "PASSWORD_TOO_SHORT");
  });

  it("accepts a password of exactly 8 characters", async () => {
    await expect(register({ password: "12345678" })).resolves.toBeDefined();
  });

  it("rejects a password longer than 128 characters", async () => {
    await expectAuthError(register({ password: "a".repeat(129) }), "PASSWORD_TOO_LONG");
  });

  it("accepts a password of exactly 128 characters", async () => {
    await expect(register({ password: "a".repeat(128) })).resolves.toBeDefined();
  });

  it("rejects an invalid email address", async () => {
    await expectAuthError(register({ email: "not-an-email" }), "VALIDATION_ERROR");
  });

  it("rejects a missing name", async () => {
    // name is required; sending it undefined must fail validation
    await expect(register({ name: undefined })).rejects.toBeDefined();
  });

  it("does not create a user when registration fails", async () => {
    await register();
    await register({ name: "Other" }).catch(() => {});
    await register({ email: "x@example.com", password: "short" }).catch(() => {});
    expect(await db.select().from(user)).toHaveLength(1);
  });
});
