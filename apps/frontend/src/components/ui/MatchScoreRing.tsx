export function MatchScoreRing({
  score,
  size = "md",
}: {
  score: number;
  size?: "sm" | "md" | "lg";
}) {
  const pct = Math.min(100, Math.max(0, Math.round(score)));
  const color =
    pct >= 70 ? "#34d399" : pct >= 40 ? "#fbbf24" : "#fb7185";
  const dims = size === "sm" ? "h-10 w-10 text-xs" : size === "lg" ? "h-20 w-20 text-lg" : "h-14 w-14 text-sm";

  return (
    <div
      className={`relative shrink-0 rounded-full p-0.5 ${dims}`}
      style={{
        background: `conic-gradient(${color} ${pct * 3.6}deg, rgb(51 65 85) 0deg)`,
      }}
      title={`${pct}% match`}
    >
      <div className="flex h-full w-full items-center justify-center rounded-full bg-slate-900 font-bold tabular-nums text-white">
        {pct}
      </div>
    </div>
  );
}
