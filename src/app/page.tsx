import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { SignOutButton } from "@/components/sign-out-button";
import { auth } from "@/lib/auth";

export default async function HomePage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  return (
    <main className="flex flex-1 items-center justify-center bg-gradient-to-br from-brand-50 via-white to-brand-100 px-4">
      <div className="w-full max-w-md rounded-2xl border border-brand-100 bg-white p-8 text-center shadow-lg shadow-brand-900/5">
        <h1 className="text-2xl font-semibold tracking-tight text-brand-900">Hello, {session.user.name}</h1>
        <p className="mt-1 text-sm text-brand-900/60">You are signed in as {session.user.email}.</p>
        <div className="mt-6">
          <SignOutButton />
        </div>
      </div>
    </main>
  );
}
