import type { ReactNode } from "react";

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-700/80 bg-slate-900/30 px-6 py-12 text-center">
      {icon && (
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-800/80 text-2xl text-slate-400">
          {icon}
        </div>
      )}
      <p className="text-base font-medium text-slate-300">{title}</p>
      {description && (
        <p className="mx-auto mt-2 max-w-sm text-sm text-slate-500">{description}</p>
      )}
      {action && <div className="mt-6 flex justify-center">{action}</div>}
    </div>
  );
}
