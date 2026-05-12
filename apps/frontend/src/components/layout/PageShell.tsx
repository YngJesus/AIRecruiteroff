import React from "react";

const blobs = (
  <>
    <div className="pointer-events-none fixed inset-0 overflow-hidden">
      <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-indigo-600/12 blur-3xl" />
      <div className="absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-blue-600/10 blur-3xl" />
    </div>
  </>
);

/** Main app pages (under navbar): slate background + soft gradients. */
export function PageShell({
  children,
  maxWidthClass = "max-w-7xl",
}: {
  children: React.ReactNode;
  maxWidthClass?: string;
}) {
  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100">
      {blobs}
      <div
        className={`relative mx-auto px-4 py-6 sm:px-6 lg:px-8 ${maxWidthClass}`}
      >
        {children}
      </div>
    </div>
  );
}

/** Login / register: centered card on same visual language as the app. */
export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-slate-950 px-4 py-12 text-slate-100">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-1/4 top-0 h-72 w-72 -translate-x-1/2 rounded-full bg-blue-600/18 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 h-80 w-80 rounded-full bg-indigo-600/14 blur-3xl" />
      </div>
      <div className="relative w-full max-w-md">{children}</div>
    </div>
  );
}

/** Shared field styles for forms */
export const fieldClass =
  "w-full rounded-xl border border-slate-600 bg-slate-800/80 px-4 py-2.5 text-white placeholder:text-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/40";

export const labelClass = "mb-2 block text-sm font-medium text-slate-300";
