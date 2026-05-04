import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { dashboardApi, type DashboardSummary } from "../api/dashboard";

function statusLabel(status: string) {
  return status.replace(/-/g, " ");
}

export function DashboardPage() {
  const { currentUser, hasRole } = useAuth();
  const navigate = useNavigate();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadSummary = async () => {
      try {
        setIsLoading(true);
        const response = await dashboardApi.getSummary();
        setSummary(response.data);
      } catch (err: any) {
        setError(err.message || "Failed to load dashboard stats");
      } finally {
        setIsLoading(false);
      }
    };

    loadSummary();
  }, []);

  const totalStatusCount =
    summary?.candidatesByStatus
      ? Object.values(summary.candidatesByStatus).reduce(
          (sum, v) => sum + Number(v || 0),
          0,
        )
      : 0;

  const statusColor = (status: string) => {
    switch (status) {
      case "matched":
        return "bg-emerald-500";
      case "parsed":
        return "bg-sky-500";
      case "processing":
        return "bg-amber-400";
      case "uploaded":
        return "bg-slate-500";
      case "awaiting-interview":
        return "bg-violet-500";
      case "rejected":
        return "bg-rose-600";
      case "failed":
        return "bg-red-500";
      default:
        return "bg-slate-500";
    }
  };

  const statRing = (pct: number) =>
    `conic-gradient(rgb(59 130 246) ${pct * 3.6}deg, rgb(51 65 85) 0deg)`;

  const matchQualityPct = summary
    ? Math.min(
        100,
        summary.totalCandidates > 0
          ? Math.round(
              (summary.highMatchCandidates / summary.totalCandidates) * 100,
            )
          : 0,
      )
    : 0;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-blue-600/20 blur-3xl" />
        <div className="absolute -bottom-24 right-0 h-[28rem] w-[28rem] rounded-full bg-indigo-600/15 blur-3xl" />
        <div className="absolute left-1/3 top-1/2 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl" />
      </div>

      <header className="relative border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-blue-400/90">
              AIRecruiter
            </p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Hiring command center
            </h1>
            <p className="mt-1 max-w-xl text-sm text-slate-400">
              Pipeline health, match quality, and recent activity — scoped to
              your roles.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-xl border border-slate-700/80 bg-slate-800/50 px-4 py-2 text-sm">
              <span className="text-slate-300">
                {currentUser?.firstName} {currentUser?.lastName}
              </span>
              <span className="ml-2 rounded-md bg-slate-700 px-2 py-0.5 text-xs text-slate-300">
                {currentUser?.role}
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {error && (
          <div className="mb-6 rounded-xl border border-rose-800/60 bg-rose-950/50 px-4 py-3 text-rose-200">
            {error}
          </div>
        )}

        {isLoading && !summary ? (
          <div className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-900/50 px-6 py-12 text-slate-400">
            <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
            Loading your dashboard…
          </div>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {[
                {
                  label: "Active jobs",
                  value: summary?.totalJobs ?? 0,
                  hint: "Roles you’re hiring for",
                  accent: "from-blue-600 to-indigo-600",
                  icon: "briefcase",
                },
                {
                  label: "Candidates",
                  value: summary?.totalCandidates ?? 0,
                  hint: "In your pipeline",
                  accent: "from-emerald-600 to-teal-600",
                  icon: "users",
                },
                {
                  label: "Avg match",
                  value: `${summary?.avgMatchScore ?? 0}%`,
                  hint: "Across all profiles",
                  accent: "from-violet-600 to-purple-600",
                  icon: "chart",
                },
                {
                  label: "Strong fits (≥70%)",
                  value: summary?.highMatchCandidates ?? 0,
                  hint: "Worth prioritizing",
                  accent: "from-amber-500 to-orange-600",
                  icon: "star",
                },
              ].map((card) => (
                <div
                  key={card.label}
                  className="group relative overflow-hidden rounded-2xl border border-slate-800/80 bg-gradient-to-br from-slate-900/90 to-slate-900/40 p-5 shadow-xl shadow-black/20 transition hover:border-slate-700"
                >
                  <div
                    className={`absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-to-br ${card.accent} opacity-20 blur-2xl transition group-hover:opacity-30`}
                  />
                  <div className="relative flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                        {card.label}
                      </p>
                      <p className="mt-2 text-3xl font-bold tabular-nums text-white">
                        {card.value}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">{card.hint}</p>
                    </div>
                    <div
                      className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${card.accent} text-lg text-white/95 shadow-lg`}
                    >
                      {card.icon === "briefcase" && "💼"}
                      {card.icon === "users" && "👥"}
                      {card.icon === "chart" && "📊"}
                      {card.icon === "star" && "⭐"}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 grid gap-4 lg:grid-cols-3">
              <div className="rounded-2xl border border-slate-800/80 bg-slate-900/50 p-5 backdrop-blur-sm lg:col-span-1">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
                  Pipeline signals
                </h2>
                <ul className="mt-4 space-y-3">
                  <li className="flex items-center justify-between rounded-xl bg-slate-800/40 px-3 py-2.5">
                    <span className="text-sm text-slate-300">In progress</span>
                    <span className="rounded-lg bg-amber-500/20 px-2.5 py-0.5 text-sm font-semibold text-amber-300">
                      {summary?.pipelineInProgress ?? 0}
                    </span>
                  </li>
                  <li className="flex items-center justify-between rounded-xl bg-slate-800/40 px-3 py-2.5">
                    <span className="text-sm text-slate-300">
                      Interview ready
                    </span>
                    <span className="rounded-lg bg-violet-500/20 px-2.5 py-0.5 text-sm font-semibold text-violet-300">
                      {summary?.interviewReady ?? 0}
                    </span>
                  </li>
                  <li className="flex items-center justify-between rounded-xl bg-slate-800/40 px-3 py-2.5">
                    <span className="text-sm text-slate-300">
                      Needs attention
                    </span>
                    <span className="rounded-lg bg-rose-500/20 px-2.5 py-0.5 text-sm font-semibold text-rose-300">
                      {summary?.needsAttention ?? 0}
                    </span>
                  </li>
                </ul>
                <div className="mt-5 flex items-center gap-4">
                  <div
                    className="relative h-14 w-14 shrink-0 rounded-full p-0.5"
                    style={{ background: statRing(matchQualityPct) }}
                  >
                    <div className="flex h-full w-full items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white">
                      {matchQualityPct}%
                    </div>
                  </div>
                  <p className="text-xs leading-relaxed text-slate-500">
                    Share of candidates scoring at least 70% against your job
                    skills — a quick read on pipeline quality.
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-800/80 bg-slate-900/50 p-5 backdrop-blur-sm lg:col-span-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
                    Status distribution
                  </h2>
                  {totalStatusCount > 0 && (
                    <span className="text-xs text-slate-500">
                      {totalStatusCount} total
                    </span>
                  )}
                </div>
                {totalStatusCount > 0 && summary && (
                  <div className="mt-4 h-4 w-full overflow-hidden rounded-full bg-slate-800 ring-1 ring-slate-700/50 flex">
                    {Object.entries(summary.candidatesByStatus).map(
                      ([status, count]) => (
                        <div
                          key={status}
                          className={`${statusColor(status)} h-full transition-all`}
                          style={{
                            width: `${(Number(count) / totalStatusCount) * 100}%`,
                          }}
                          title={`${statusLabel(status)}: ${count}`}
                        />
                      ),
                    )}
                  </div>
                )}
                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  {Object.keys(summary?.candidatesByStatus ?? {}).length ===
                  0 ? (
                    <p className="text-sm text-slate-500">
                      No candidates yet — upload CVs from a job to populate
                      this view.
                    </p>
                  ) : (
                    Object.entries(summary!.candidatesByStatus).map(
                      ([status, count]) => (
                        <div
                          key={status}
                          className="flex items-center justify-between rounded-xl border border-slate-800/60 bg-slate-800/30 px-3 py-2"
                        >
                          <span className="flex items-center gap-2 text-sm text-slate-300">
                            <span
                              className={`h-2 w-2 shrink-0 rounded-full ${statusColor(
                                status,
                              )}`}
                            />
                            <span className="capitalize">
                              {statusLabel(status)}
                            </span>
                          </span>
                          <span className="text-sm font-semibold tabular-nums text-white">
                            {count}
                          </span>
                        </div>
                      ),
                    )
                  )}
                </div>
              </div>
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-2">
              <div className="rounded-2xl border border-slate-800/80 bg-slate-900/50 p-5 backdrop-blur-sm">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="text-lg font-semibold text-white">
                    Recent jobs
                  </h2>
                  {hasRole(["recruiter", "admin"]) && (
                    <button
                      type="button"
                      onClick={() => navigate("/jobs")}
                      className="text-sm font-medium text-blue-400 hover:text-blue-300"
                    >
                      View all →
                    </button>
                  )}
                </div>
                <div className="mt-4 space-y-2">
                  {(summary?.recentJobs?.length ?? 0) === 0 ? (
                    <p className="text-sm text-slate-500">
                      No jobs yet. Create a job to start tracking applicants.
                    </p>
                  ) : (
                    summary!.recentJobs.map((job) => (
                      <button
                        key={job.id}
                        type="button"
                        onClick={() => navigate(`/jobs/${job.id}/candidates`)}
                        className="flex w-full items-center justify-between gap-3 rounded-xl border border-slate-800/60 bg-slate-800/30 px-4 py-3 text-left transition hover:border-slate-600 hover:bg-slate-800/50"
                      >
                        <span className="truncate font-medium text-white">
                          {job.title}
                        </span>
                        <span className="shrink-0 rounded-full bg-slate-700 px-2.5 py-0.5 text-xs font-medium text-slate-200">
                          {job.candidateCount} applicants
                        </span>
                      </button>
                    ))
                  )}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-800/80 bg-slate-900/50 p-5 backdrop-blur-sm">
                <h2 className="text-lg font-semibold text-white">
                  Recent candidates
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  Latest updates in your scope
                </p>
                <div className="mt-4 space-y-2">
                  {(summary?.recentCandidates?.length ?? 0) === 0 ? (
                    <p className="text-sm text-slate-500">
                      No recent activity yet.
                    </p>
                  ) : (
                    summary!.recentCandidates.map((candidate) => (
                      <button
                        key={candidate.id}
                        type="button"
                        onClick={() =>
                          navigate(`/candidates/${candidate.id}`)
                        }
                        className="w-full rounded-xl border border-slate-800/60 bg-slate-800/30 p-3 text-left transition hover:border-slate-600 hover:bg-slate-800/50"
                      >
                        <div className="flex justify-between gap-2">
                          <span className="truncate text-sm font-medium text-white">
                            {candidate.cvFileName}
                          </span>
                          <span className="shrink-0 rounded-md bg-slate-700/80 px-2 py-0.5 text-xs capitalize text-slate-200">
                            {statusLabel(candidate.status)}
                          </span>
                        </div>
                        <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-400">
                          <span className="font-medium text-slate-300">
                            {candidate.jobTitle}
                          </span>
                          <span className="text-slate-600">·</span>
                          <span className="tabular-nums text-emerald-400/90">
                            {candidate.matchScore}% match
                          </span>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              {hasRole(["recruiter", "admin"]) && (
                <>
                  <button
                    type="button"
                    onClick={() => navigate("/jobs")}
                    className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-900/30 transition hover:from-blue-500 hover:to-indigo-500"
                  >
                    Manage jobs
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate("/jobs/new")}
                    className="rounded-xl border border-slate-600 bg-slate-800/50 px-5 py-2.5 text-sm font-semibold text-slate-200 transition hover:bg-slate-800"
                  >
                    New job posting
                  </button>
                </>
              )}
              {hasRole("admin") && (
                <button
                  type="button"
                  onClick={() => navigate("/admin/users")}
                  className="rounded-xl border border-violet-700/50 bg-violet-950/30 px-5 py-2.5 text-sm font-semibold text-violet-200 transition hover:bg-violet-950/50"
                >
                  User administration
                </button>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
