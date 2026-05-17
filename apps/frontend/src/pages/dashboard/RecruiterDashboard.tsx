import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { dashboardApi, type DashboardSummary } from "../../api/dashboard";
import { PageShell } from "../../components/layout/PageShell";
import { PageHeader } from "../../components/ui/PageHeader";
import { StatCard } from "../../components/ui/StatCard";
import { StatusBadge } from "../../components/ui/StatusBadge";
import {
  IconBriefcase,
  IconUsers,
  IconChart,
  IconStar,
} from "../../components/ui/icons";

function statusLabel(status: string) {
  return status.replace(/-/g, " ");
}

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

export function RecruiterDashboard() {
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
    void loadSummary();
  }, []);

  const totalStatusCount = summary
    ? Object.values(summary.candidatesByStatus).reduce(
        (sum, v) => sum + Number(v || 0),
        0,
      )
    : 0;

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

  const statRing = (pct: number) =>
    `conic-gradient(rgb(59 130 246) ${pct * 3.6}deg, rgb(51 65 85) 0deg)`;

  const btnPrimary =
    "rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-900/30 transition hover:from-blue-500 hover:to-indigo-500";
  const btnSecondary =
    "rounded-xl border border-slate-600 bg-slate-800/50 px-5 py-2.5 text-sm font-semibold text-slate-200 transition hover:bg-slate-800";

  return (
    <PageShell>
      <PageHeader
        eyebrow="HR workspace"
        title={`Hi ${currentUser?.firstName ?? ""}, your hiring pipeline`}
        description="Track jobs, CV analysis, and candidates ready for tech lead review or interview scheduling."
        actions={
          hasRole(["recruiter", "admin"]) ? (
            <button type="button" className={btnPrimary} onClick={() => navigate("/jobs/new")}>
              + New job
            </button>
          ) : undefined
        }
      />

      {error && (
        <div className="mb-6 rounded-xl border border-rose-800/60 bg-rose-950/50 px-4 py-3 text-rose-200">
          {error}
        </div>
      )}

      {isLoading && !summary ? (
        <div className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-900/50 px-6 py-16 text-slate-400">
          <span className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
          Loading your dashboard…
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Active jobs"
              value={summary?.totalJobs ?? 0}
              hint="Roles in your department"
              accent="from-blue-600 to-indigo-600"
              icon={<IconBriefcase className="h-6 w-6" />}
              onClick={() => navigate("/jobs")}
            />
            <StatCard
              label="Candidates"
              value={summary?.totalCandidates ?? 0}
              hint="CVs in your pipeline"
              accent="from-emerald-600 to-teal-600"
              icon={<IconUsers className="h-6 w-6" />}
            />
            <StatCard
              label="Avg match"
              value={`${summary?.avgMatchScore ?? 0}%`}
              hint="Across all profiles"
              accent="from-violet-600 to-purple-600"
              icon={<IconChart className="h-6 w-6" />}
            />
            <StatCard
              label="Strong fits"
              value={summary?.highMatchCandidates ?? 0}
              hint="Score ≥ 70%"
              accent="from-amber-500 to-orange-600"
              icon={<IconStar className="h-6 w-6" />}
            />
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            <div className="rounded-2xl border border-slate-800/80 bg-slate-900/50 p-5 lg:col-span-1">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
                Action needed
              </h2>
              <ul className="mt-4 space-y-3">
                <li className="flex items-center justify-between rounded-xl bg-amber-500/10 px-3 py-3 ring-1 ring-amber-500/20">
                  <span className="text-sm text-slate-300">Processing CVs</span>
                  <span className="text-lg font-bold text-amber-300">
                    {summary?.pipelineInProgress ?? 0}
                  </span>
                </li>
                <li className="flex items-center justify-between rounded-xl bg-violet-500/10 px-3 py-3 ring-1 ring-violet-500/20">
                  <span className="text-sm text-slate-300">Schedule interview</span>
                  <span className="text-lg font-bold text-violet-300">
                    {summary?.interviewReady ?? 0}
                  </span>
                </li>
                <li className="flex items-center justify-between rounded-xl bg-rose-500/10 px-3 py-3 ring-1 ring-rose-500/20">
                  <span className="text-sm text-slate-300">Failed / rejected</span>
                  <span className="text-lg font-bold text-rose-300">
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
                  Share of candidates scoring ≥70% — your pipeline quality at a glance.
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-800/80 bg-slate-900/50 p-5 lg:col-span-2">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
                Pipeline by status
              </h2>
              {totalStatusCount > 0 && summary && (
                <div className="mt-4 flex h-3 overflow-hidden rounded-full bg-slate-800 ring-1 ring-slate-700/50">
                  {Object.entries(summary.candidatesByStatus).map(
                    ([status, count]) => (
                      <div
                        key={status}
                        className={`${statusColor(status)} h-full`}
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
                {Object.keys(summary?.candidatesByStatus ?? {}).length === 0 ? (
                  <p className="text-sm text-slate-500 col-span-2">
                    Upload CVs from a job page to see your pipeline fill in.
                  </p>
                ) : (
                  Object.entries(summary!.candidatesByStatus).map(
                    ([status, count]) => (
                      <div
                        key={status}
                        className="flex items-center justify-between rounded-xl border border-slate-800/60 bg-slate-800/30 px-3 py-2"
                      >
                        <StatusBadge status={status} />
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
            <section className="rounded-2xl border border-slate-800/80 bg-slate-900/50 p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-white">Recent jobs</h2>
                <button
                  type="button"
                  onClick={() => navigate("/jobs")}
                  className="text-sm font-medium text-blue-400 hover:text-blue-300"
                >
                  View all →
                </button>
              </div>
              <ul className="space-y-2">
                {(summary?.recentJobs?.length ?? 0) === 0 ? (
                  <li className="text-sm text-slate-500">No jobs yet.</li>
                ) : (
                  summary!.recentJobs.map((job) => (
                    <li key={job.id}>
                      <button
                        type="button"
                        onClick={() => navigate(`/jobs/${job.id}/candidates`)}
                        className="flex w-full items-center justify-between gap-3 rounded-xl border border-slate-800/60 bg-slate-800/30 px-4 py-3 text-left transition hover:border-blue-700/40 hover:bg-slate-800/50"
                      >
                        <span className="truncate font-medium text-white">
                          {job.title}
                        </span>
                        <span className="shrink-0 rounded-full bg-blue-600/20 px-2.5 py-0.5 text-xs font-medium text-blue-200">
                          {job.candidateCount} applicants
                        </span>
                      </button>
                    </li>
                  ))
                )}
              </ul>
            </section>

            <section className="rounded-2xl border border-slate-800/80 bg-slate-900/50 p-5">
              <h2 className="text-lg font-semibold text-white mb-4">
                Recent candidates
              </h2>
              <ul className="space-y-2">
                {(summary?.recentCandidates?.length ?? 0) === 0 ? (
                  <li className="text-sm text-slate-500">No activity yet.</li>
                ) : (
                  summary!.recentCandidates.map((candidate) => (
                    <li key={candidate.id}>
                      <button
                        type="button"
                        onClick={() => navigate(`/candidates/${candidate.id}`)}
                        className="w-full rounded-xl border border-slate-800/60 bg-slate-800/30 p-3 text-left transition hover:border-slate-600 hover:bg-slate-800/50"
                      >
                        <div className="flex justify-between gap-2 items-start">
                          <span className="truncate text-sm font-medium text-white">
                            {candidate.cvFileName}
                          </span>
                          <StatusBadge status={candidate.status} />
                        </div>
                        <p className="mt-1.5 text-xs text-slate-400">
                          {candidate.jobTitle} ·{" "}
                          <span className="text-emerald-400/90 font-medium">
                            {candidate.matchScore}% match
                          </span>
                        </p>
                      </button>
                    </li>
                  ))
                )}
              </ul>
            </section>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <button type="button" className={btnPrimary} onClick={() => navigate("/jobs")}>
              Manage jobs
            </button>
            <button type="button" className={btnSecondary} onClick={() => navigate("/jobs/new")}>
              Post new role
            </button>
            {hasRole("admin") && (
              <button
                type="button"
                className="rounded-xl border border-violet-700/50 bg-violet-950/30 px-5 py-2.5 text-sm font-semibold text-violet-200 transition hover:bg-violet-950/50"
                onClick={() => navigate("/admin/users")}
              >
                User administration
              </button>
            )}
          </div>
        </>
      )}
    </PageShell>
  );
}
