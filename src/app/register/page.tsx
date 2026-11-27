"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { AuthShell } from "@/components/auth-shell";
import { Field, FormMessage, SubmitButton } from "@/components/form-bits";
import { authClient } from "@/lib/auth-client";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const form = new FormData(event.currentTarget);
    const password = String(form.get("password"));
    if (password !== String(form.get("confirm"))) {
      setError("Passwords do not match");
      return;
    }
    setPending(true);
    const { error } = await authClient.signUp.email({
      name: String(form.get("name")),
      email: String(form.get("email")),
      password,
    });
    setPending(false);
    if (error) {
      setError(error.message ?? "Registration failed");
      return;
    }
    router.push("/");
    router.refresh();
  }

  return (
    <AuthShell
      title="Create your account"
      subtitle="It only takes a minute."
      footer={
        <>
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-brand-600 hover:text-brand-700">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4">
        {error ? <FormMessage kind="error">{error}</FormMessage> : null}
        <Field id="name" name="name" type="text" label="Name" placeholder="Your name" autoComplete="name" required />
        <Field id="email" name="email" type="email" label="Email" placeholder="you@example.com" autoComplete="email" required />
        <Field id="password" name="password" type="password" label="Password" placeholder="At least 8 characters" autoComplete="new-password" minLength={8} required />
        <Field id="confirm" name="confirm" type="password" label="Confirm password" placeholder="Repeat your password" autoComplete="new-password" minLength={8} required />
        <SubmitButton pending={pending}>Create account</SubmitButton>
      </form>
    </AuthShell>
  );
}
