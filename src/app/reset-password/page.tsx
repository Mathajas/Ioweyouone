import Link from "next/link";
import { AuthShell } from "@/components/auth-shell";
import { FormMessage } from "@/components/form-bits";
import { ResetPasswordForm } from "./reset-form";

export default async function ResetPasswordPage(props: PageProps<"/reset-password">) {
  const { token, error } = await props.searchParams;
  const validToken = typeof token === "string" && token.length > 0 && !error ? token : null;

  return (
    <AuthShell
      title="Set a new password"
      subtitle="Choose a strong password you have not used before."
      footer={
        <Link href="/login" className="font-semibold text-brand-600 hover:text-brand-700">
          Back to sign in
        </Link>
      }
    >
      {validToken ? (
        <ResetPasswordForm token={validToken} />
      ) : (
        <FormMessage kind="error">
          This reset link is invalid or has expired. Request a new one from the forgot password page.
        </FormMessage>
      )}
    </AuthShell>
  );
}
