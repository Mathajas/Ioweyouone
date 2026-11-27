import type { ReactNode } from "react";

type Props = {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
};

// Shared layout for all authentication pages: centered white card on a soft green background.
export function AuthShell({ title, subtitle, children, footer }: Props) {
  return (
    <main className="flex flex-1 items-center justify-center bg-gradient-to-br from-brand-50 via-white to-brand-100 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 flex items-center justify-center gap-2">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 text-lg font-bold text-white shadow-sm">
            I
          </span>
          <span className="text-xl font-semibold tracking-tight text-brand-900">Ioweyouone</span>
        </div>
        <div className="rounded-2xl border border-brand-100 bg-white p-8 shadow-lg shadow-brand-900/5">
          <h1 className="text-2xl font-semibold tracking-tight text-brand-900">{title}</h1>
          <p className="mt-1 text-sm text-brand-900/60">{subtitle}</p>
          <div className="mt-6">{children}</div>
        </div>
        {footer ? <p className="mt-6 text-center text-sm text-brand-900/70">{footer}</p> : null}
      </div>
    </main>
  );
}
