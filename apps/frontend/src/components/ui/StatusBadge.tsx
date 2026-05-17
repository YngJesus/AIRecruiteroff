const STATUS_STYLES: Record<string, string> = {
  matched: "bg-emerald-500/15 text-emerald-300 ring-emerald-500/30",
  parsed: "bg-sky-500/15 text-sky-300 ring-sky-500/30",
  processing: "bg-amber-500/15 text-amber-300 ring-amber-500/30",
  uploaded: "bg-slate-500/15 text-slate-300 ring-slate-500/30",
  "awaiting-interview": "bg-violet-500/15 text-violet-300 ring-violet-500/30",
  "interview-scheduled": "bg-blue-500/15 text-blue-300 ring-blue-500/30",
  rejected: "bg-rose-500/15 text-rose-300 ring-rose-500/30",
  failed: "bg-red-500/15 text-red-300 ring-red-500/30",
  pending: "bg-amber-500/15 text-amber-300 ring-amber-500/30",
  scheduled: "bg-blue-500/15 text-blue-300 ring-blue-500/30",
};

export function StatusBadge({ status }: { status: string }) {
  const label = status.replace(/-/g, " ");
  const style =
    STATUS_STYLES[status] ??
    "bg-slate-500/15 text-slate-300 ring-slate-500/30";

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ring-1 ${style}`}
    >
      {label}
    </span>
  );
}
