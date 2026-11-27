import { describe, expect, it } from "vitest";
import { auth } from "@/lib/auth";
import { USER, cookieHeader, expectAuthError, login, register } from "./helpers";

describe("login", () => {
  it("signs in with correct credentials", async () => {
    await register();
    const { headers, response } = await login();
    expect(response.user.email).toBe(USER.email);
    expect(response.token).toEqual(expect.any(String));
    expect(headers.getSetCookie().join(";")).toContain("better-auth.session_token");
  });

  it("sets an HttpOnly session cookie", async () => {
    await register();
    const { headers } = await login();
    const cookie = headers.getSetCookie().find((c) => c.includes("session_token"))!;
    expect(cookie).toMatch(/HttpOnly/i);
    expect(cookie).toMatch(/SameSite=Lax/i);
  });

  it("rejects a wrong password", async () => {
    await register();
    await expectAuthError(login(USER.email, "wrongpassword1"), "INVALID_EMAIL_OR_PASSWORD");
  });

  it("rejects an unknown email", async () => {
    await expectAuthError(login("nobody@example.com", USER.password), "INVALID_EMAIL_OR_PASSWORD");
  });

  it("gives the same error for a wrong password and an unknown email (no account enumeration)", async () => {
    await register();
    const wrongPassword = await login(USER.email, "wrongpassword1").catch((e) => e);
    const unknownEmail = await login("nobody@example.com", "wrongpassword1").catch((e) => e);
    expect(wrongPassword.body.code).toBe(unknownEmail.body.code);
    expect(wrongPassword.body.message).toBe(unknownEmail.body.message);
  });

  it("accepts the email in a different letter case", async () => {
    await register();
    await expect(login("TEST@Example.com")).resolves.toBeDefined();
  });

  it("is case-sensitive for the password", async () => {
    await register();
    await expectAuthError(login(USER.email, USER.password.toUpperCase()), "INVALID_EMAIL_OR_PASSWORD");
  });

  it("rejects an empty password", async () => {
    await register();
    await expect(login(USER.email, "")).rejects.toBeDefined();
  });

  it("rejects an invalid email format", async () => {
    await expect(login("not-an-email", USER.password)).rejects.toBeDefined();
  });

  it("creates a session that getSession can read", async () => {
    await register();
    const { headers } = await login();
    const session = await auth.api.getSession({ headers: cookieHeader(headers) });
    expect(session?.user.email).toBe(USER.email);
  });

  it("has no session without a cookie", async () => {
    const session = await auth.api.getSession({ headers: new Headers() });
    expect(session).toBeNull();
  });

  it("has no session with a forged cookie", async () => {
    const session = await auth.api.getSession({
      headers: new Headers({ cookie: "better-auth.session_token=forged.value" }),
    });
    expect(session).toBeNull();
  });

  it("invalidates the session on sign out", async () => {
    await register();
    const { headers } = await login();
    const cookies = cookieHeader(headers);
    await auth.api.signOut({ headers: cookies });
    expect(await auth.api.getSession({ headers: cookies })).toBeNull();
  });

  it("allows two independent sessions for the same user", async () => {
    await register();
    const first = cookieHeader((await login()).headers);
    const second = cookieHeader((await login()).headers);
    await auth.api.signOut({ headers: first });
    expect(await auth.api.getSession({ headers: first })).toBeNull();
    expect((await auth.api.getSession({ headers: second }))?.user.email).toBe(USER.email);
  });
});
