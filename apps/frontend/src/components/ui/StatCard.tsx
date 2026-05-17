import type { ReactNode } from "react";

type StatCardProps = {
  label: string;
  value: string | number;
  hint?: string;
  accent?: string;
  icon: ReactNode;
  onClick?: () => void;
};

export function StatCard({
  label,
  value,
  hint,
  accent = "from-blue-600 to-indigo-600",
  icon,
  onClick,
}: StatCardProps) {
  const className = `group relative w-full overflow-hidden rounded-2xl border border-slate-800/80 bg-gradient-to-br from-slate-900/95 to-slate-900/40 p-5 text-left shadow-xl shadow-black/20 transition ${
    onClick
      ? "hover:border-slate-600 hover:shadow-blue-900/10 cursor-pointer"
      : "hover:border-slate-700"
  }`;

  const inner = (
    <>
      <div
        className={`absolute -right-10 -top-10 h-28 w-28 rounded-full bg-gradient-to-br ${accent} opacity-20 blur-2xl transition group-hover:opacity-35`}
      />
      <div className="relative flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            {label}
          </p>
          <p className="mt-2 text-3xl font-bold tabular-nums text-white">
            {value}
          </p>
          {hint && (
            <p className="mt-1 text-xs text-slate-500 leading-relaxed">{hint}</p>
          )}
        </div>
        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${accent} text-white shadow-lg`}
        >
          {icon}
        </div>
      </div>
    </>
  );

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={className}>
        {inner}
      </button>
    );
  }
  return <div className={className}>{inner}</div>;
}
