"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Field, FormMessage, SubmitButton } from "@/components/form-bits";
import { authClient } from "@/lib/auth-client";

export function ResetPasswordForm({ token }: { token: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const form = new FormData(event.currentTarget);
    const newPassword = String(form.get("password"));
    if (newPassword !== String(form.get("confirm"))) {
      setError("Passwords do not match");
      return;
    }
    setPending(true);
    const { error } = await authClient.resetPassword({ newPassword, token });
    setPending(false);
    if (error) {
      setError(error.message ?? "Could not reset the password");
      return;
    }
    router.push("/login");
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {error ? <FormMessage kind="error">{error}</FormMessage> : null}
      <Field id="password" name="password" type="password" label="New password" placeholder="At least 8 characters" autoComplete="new-password" minLength={8} required />
      <Field id="confirm" name="confirm" type="password" label="Confirm new password" placeholder="Repeat your password" autoComplete="new-password" minLength={8} required />
      <SubmitButton pending={pending}>Reset password</SubmitButton>
    </form>
  );
}
