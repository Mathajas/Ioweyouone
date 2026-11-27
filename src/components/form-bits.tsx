import type { ComponentProps } from "react";

type FieldProps = ComponentProps<"input"> & { label: string };

export function Field({ label, id, ...props }: FieldProps) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-brand-900">
        {label}
      </label>
      <input
        id={id}
        {...props}
        className="block w-full rounded-lg border border-brand-200 bg-white px-3.5 py-2.5 text-sm text-brand-900 placeholder:text-brand-900/40 outline-none transition focus:border-brand-600 focus:ring-4 focus:ring-brand-100"
      />
    </div>
  );
}

export function SubmitButton({ pending, children }: { pending: boolean; children: string }) {
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700 focus:outline-none focus:ring-4 focus:ring-brand-200 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "Please wait..." : children}
    </button>
  );
}

export function FormMessage({ kind, children }: { kind: "error" | "success"; children: string }) {
  const styles =
    kind === "error"
      ? "border-red-200 bg-red-50 text-red-700"
      : "border-brand-200 bg-brand-50 text-brand-700";
  return (
    <p role={kind === "error" ? "alert" : "status"} className={`rounded-lg border px-3.5 py-2.5 text-sm ${styles}`}>
      {children}
    </p>
  );
}
