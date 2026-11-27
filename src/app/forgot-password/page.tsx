"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { AuthShell } from "@/components/auth-shell";
import { Field, FormMessage, SubmitButton } from "@/components/form-bits";
import { authClient } from "@/lib/auth-client";

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setPending(true);
    const form = new FormData(event.currentTarget);
    const { error } = await authClient.requestPasswordReset({
      email: String(form.get("email")),
      redirectTo: "/reset-password",
    });
    setPending(false);
    if (error) {
      setError(error.message ?? "Could not send the reset link");
      return;
    }
    setSent(true);
  }

  return (
    <AuthShell
      title="Forgot your password?"
      subtitle="Enter your email and we will send you a reset link."
      footer={
        <Link href="/login" className="font-semibold text-brand-600 hover:text-brand-700">
          Back to sign in
        </Link>
      }
    >
      {sent ? (
        // Same message whether or not the account exists, to avoid revealing registered emails.
        <FormMessage kind="success">
          If an account exists for that email, a reset link has been sent.
        </FormMessage>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4">
          {error ? <FormMessage kind="error">{error}</FormMessage> : null}
          <Field id="email" name="email" type="email" label="Email" placeholder="you@example.com" autoComplete="email" required />
          <SubmitButton pending={pending}>Send reset link</SubmitButton>
        </form>
      )}
    </AuthShell>
  );
}
