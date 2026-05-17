import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { reviewsApi, type Review } from "../../api/reviews";
import { interviewsApi } from "../../api/interviews";
import { availabilityApi } from "../../api/availability";
import { PageShell } from "../../components/layout/PageShell";
import { PageHeader } from "../../components/ui/PageHeader";
import { StatCard } from "../../components/ui/StatCard";
import { MatchScoreRing } from "../../components/ui/MatchScoreRing";
import { EmptyState } from "../../components/ui/EmptyState";
import {
  IconClipboard,
  IconCalendar,
  IconClock,
  IconChart,
} from "../../components/ui/icons";

export function TechLeadDashboard() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [interviews, setInterviews] = useState<any[]>([]);
  const [availability, setAvailability] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      if (!currentUser) return;
      try {
        setLoading(true);
        const [rRes, iRes, aRes] = await Promise.all([
          reviewsApi.findByTechLead(currentUser.id),
          interviewsApi.findByTechLead(currentUser.id),
          availabilityApi.findForUser(currentUser.id),
        ]);
        setReviews(rRes.data || []);
        setInterviews(iRes.data || []);
        setAvailability(aRes.data || []);
      } catch (err: any) {
        setError(err.response?.data?.message || err.message || "Failed to load");
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [currentUser]);

  const now = new Date();
  const weekEnd = new Date(now);
  weekEnd.setDate(weekEnd.getDate() + 7);

  const interviewsThisWeek = useMemo(
    () =>
      interviews.filter((i) => {
        const d = new Date(i.scheduledAt);
        return d >= now && d <= weekEnd;
      }),
    [interviews, now, weekEnd],
  );

  const openSlots = availability.filter((s) => s.status === "available").length;

  const avgPendingMatch =
    reviews.length > 0
      ? Math.round(
          reviews.reduce(
            (s, r) => s + (r.score ?? r.candidate?.matchScore ?? 0),
            0,
          ) / reviews.length,
        )
      : 0;

  const upcomingSorted = [...interviewsThisWeek].sort(
    (a, b) =>
      new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime(),
  );

  const btnPrimary =
    "rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-900/25 transition hover:from-violet-500 hover:to-indigo-500";
  const btnSecondary =
    "rounded-xl border border-slate-600 bg-slate-800/50 px-5 py-2.5 text-sm font-semibold text-slate-200 transition hover:bg-slate-800";

  return (
    <PageShell>
      <PageHeader
        eyebrow="Tech lead workspace"
        title={`Welcome back, ${currentUser?.firstName ?? "there"}`}
        description="Review candidates HR sends you, prep for interviews, and manage your calendar."
        actions={
          <>
            <button type="button" className={btnPrimary} onClick={() => navigate("/techlead/prep")}>
              My candidates
            </button>
            <button type="button" className={btnSecondary} onClick={() => navigate("/techlead/reviews")}>
              Review queue
            </button>
          </>
        }
      />

      {error && (
        <div className="mb-6 rounded-xl border border-rose-800/60 bg-rose-950/50 px-4 py-3 text-rose-200">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-900/50 px-6 py-16 text-slate-400">
          <span className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
          Loading your workspace…
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Pending reviews"
              value={reviews.length}
              hint="Candidates waiting for your decision"
              accent="from-violet-600 to-purple-600"
              icon={<IconClipboard className="h-6 w-6" />}
              onClick={() => navigate("/techlead/reviews")}
            />
            <StatCard
              label="Interviews (7 days)"
              value={interviewsThisWeek.length}
              hint="Scheduled on your calendar"
              accent="from-blue-600 to-cyan-600"
              icon={<IconCalendar className="h-6 w-6" />}
              onClick={() => navigate("/techlead/calendar")}
            />
            <StatCard
              label="Open slots"
              value={openSlots}
              hint="Available for HR to book"
              accent="from-emerald-600 to-teal-600"
              icon={<IconClock className="h-6 w-6" />}
              onClick={() => navigate("/techlead/calendar")}
            />
            <StatCard
              label="Avg match (queue)"
              value={reviews.length ? `${avgPendingMatch}%` : "—"}
              hint="Average AI score in your inbox"
              accent="from-amber-500 to-orange-600"
              icon={<IconChart className="h-6 w-6" />}
            />
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-5">
            <section className="lg:col-span-3 rounded-2xl border border-slate-800/80 bg-slate-900/50 p-5 backdrop-blur-sm">
              <div className="flex items-center justify-between gap-2 mb-4">
                <h2 className="text-lg font-semibold text-white">Review queue</h2>
                <button
                  type="button"
                  onClick={() => navigate("/techlead/reviews")}
                  className="text-sm font-medium text-violet-400 hover:text-violet-300"
                >
                  View all →
                </button>
              </div>
              {reviews.length === 0 ? (
                <EmptyState
                  icon="✓"
                  title="Inbox zero"
                  description="When HR sends candidates from your department, they appear here with match scores and AI questions."
                  action={
                    <button type="button" className={btnSecondary} onClick={() => navigate("/techlead/calendar")}>
                      Set availability
                    </button>
                  }
                />
              ) : (
                <ul className="space-y-3">
                  {reviews.slice(0, 5).map((r) => {
                    const score = r.score ?? r.candidate?.matchScore ?? 0;
                    return (
                      <li key={r.id}>
                        <button
                          type="button"
                          onClick={() => navigate("/techlead/reviews")}
                          className="flex w-full items-center gap-4 rounded-xl border border-slate-800/60 bg-slate-800/30 p-4 text-left transition hover:border-violet-700/50 hover:bg-slate-800/50"
                        >
                          <MatchScoreRing score={score} />
                          <div className="min-w-0 flex-1">
                            <p className="truncate font-medium text-white">
                              {r.candidate?.cvFileName?.replace(/\.[^.]+$/, "") || "Candidate"}
                            </p>
                            <p className="text-sm text-slate-400 truncate">
                              {r.candidate?.jobTitle || "Role"} · {r.questions?.length ?? 0} questions
                            </p>
                          </div>
                          <span className="shrink-0 rounded-lg bg-violet-600/20 px-3 py-1 text-xs font-semibold text-violet-300">
                            Review
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>

            <section className="lg:col-span-2 rounded-2xl border border-slate-800/80 bg-slate-900/50 p-5 backdrop-blur-sm">
              <div className="flex items-center justify-between gap-2 mb-4">
                <h2 className="text-lg font-semibold text-white">Upcoming</h2>
                <button
                  type="button"
                  onClick={() => navigate("/techlead/calendar")}
                  className="text-sm font-medium text-blue-400 hover:text-blue-300"
                >
                  Calendar →
                </button>
              </div>
              {upcomingSorted.length === 0 ? (
                <EmptyState
                  title="No interviews this week"
                  description="Add availability so HR can schedule after you accept candidates."
                />
              ) : (
                <ul className="space-y-3">
                  {upcomingSorted.slice(0, 5).map((it) => (
                    <li key={it.id}>
                      <button
                        type="button"
                        onClick={() => navigate("/techlead/prep")}
                        className="w-full rounded-xl border border-slate-800/60 bg-slate-800/30 p-3 text-left transition hover:border-violet-700/50 hover:bg-slate-800/50"
                      >
                      <p className="text-xs font-medium text-blue-400">
                        {new Date(it.scheduledAt).toLocaleString(undefined, {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                      <p className="mt-1 truncate text-sm font-medium text-white">
                        {it.candidate?.cvFileName?.replace(/\.[^.]+$/, "") || "Interview"}
                      </p>
                      <p className="text-xs text-slate-500 truncate">{it.job?.title}</p>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>

          <div className="mt-8 rounded-2xl border border-slate-800/80 bg-gradient-to-r from-slate-900/80 to-violet-950/20 p-6">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400 mb-4">
              Quick actions
            </h2>
            <div className="flex flex-wrap gap-3">
              <button type="button" className={btnPrimary} onClick={() => navigate("/techlead/prep")}>
                Interview prep
              </button>
              <button type="button" className={btnSecondary} onClick={() => navigate("/techlead/reviews")}>
                Review queue ({reviews.length})
              </button>
              <button type="button" className={btnSecondary} onClick={() => navigate("/techlead/calendar")}>
                Calendar
              </button>
            </div>
          </div>
        </>
      )}
    </PageShell>
  );
}
