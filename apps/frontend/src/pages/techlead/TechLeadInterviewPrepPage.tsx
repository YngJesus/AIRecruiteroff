import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  reviewsApi,
  type InterviewBriefing,
  type ReviewQuestion,
} from "../../api/reviews";
import { candidatesApi } from "../../api/candidates";
import { PageShell } from "../../components/layout/PageShell";
import { PageHeader } from "../../components/ui/PageHeader";
import { MatchScoreRing } from "../../components/ui/MatchScoreRing";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { EmptyState } from "../../components/ui/EmptyState";

function candidateName(cvFileName?: string) {
  return cvFileName?.replace(/\.[^.]+$/, "") || "Candidate";
}

function BriefingCard({ briefing }: { briefing: InterviewBriefing }) {
  const [expanded, setExpanded] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const c = briefing.candidate;
  const score = briefing.score ?? c?.matchScore ?? 0;
  const questions = briefing.questions ?? [];
  const scheduled = briefing.interview?.scheduledAt;

  const handleDownloadCv = async () => {
    if (!c?.id) return;
    setDownloading(true);
    try {
      const response = await candidatesApi.downloadCV(c.id);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = c.cvFileName || "cv.pdf";
      a.click();
      window.URL.revokeObjectURL(url);
    } finally {
      setDownloading(false);
    }
  };

  const isPast =
    scheduled && new Date(scheduled).getTime() < Date.now() - 60 * 60 * 1000;

  return (
    <article className="rounded-2xl border border-slate-800/80 bg-slate-900/60 overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex w-full flex-wrap items-center gap-4 p-5 text-left transition hover:bg-slate-800/30"
      >
        <div className="min-w-[200px] flex-1">
          <h3 className="text-lg font-semibold text-white">
            {candidateName(c?.cvFileName)}
          </h3>
          <p className="mt-0.5 text-sm text-slate-400">
            {c?.jobTitle || "Role"}
            {scheduled
              ? ` · ${new Date(scheduled).toLocaleString(undefined, {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}`
              : " · Awaiting HR to schedule"}
          </p>
        </div>
        <MatchScoreRing score={score} size="lg" />
        {c?.status && <StatusBadge status={c.status} />}
        {scheduled && (
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 ${
              isPast
                ? "bg-slate-800 text-slate-400 ring-slate-700"
                : "bg-violet-950/80 text-violet-200 ring-violet-800/50"
            }`}
          >
            {isPast ? "Past" : "Upcoming"}
          </span>
        )}
        <span className="text-sm text-slate-500">{expanded ? "▲" : "▼"}</span>
      </button>

      {expanded && (
        <div className="space-y-5 border-t border-slate-800/80 p-5">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleDownloadCv}
              disabled={downloading}
              className="rounded-lg border border-slate-600 bg-slate-800/80 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:bg-slate-700 disabled:opacity-50"
            >
              {downloading ? "Downloading…" : "Download CV"}
            </button>
            <Link
              to="/techlead/calendar"
              className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-violet-500"
            >
              Open calendar
            </Link>
          </div>

          {briefing.notes && (
            <div className="rounded-xl border border-slate-700/50 bg-slate-800/40 p-4">
              <p className="mb-1 text-xs font-semibold uppercase text-slate-500">
                HR notes
              </p>
              <p className="text-sm text-slate-200">{briefing.notes}</p>
            </div>
          )}

          {c?.skillGaps && c.skillGaps.length > 0 && (
            <div>
              <h4 className="mb-2 text-sm font-semibold text-slate-300">
                Skill breakdown
              </h4>
              <div className="flex flex-wrap gap-2">
                {c.skillGaps.map((g, i) => (
                  <span
                    key={i}
                    className={`rounded-lg px-2.5 py-1 text-xs font-medium ${
                      g.status === "match"
                        ? "bg-emerald-950/80 text-emerald-200"
                        : g.status === "partial"
                          ? "bg-amber-950/80 text-amber-200"
                          : "bg-rose-950/80 text-rose-200"
                    }`}
                  >
                    {g.skill}: {g.status}
                  </span>
                ))}
              </div>
            </div>
          )}

          {c?.parsedData?.experience && c.parsedData.experience.length > 0 && (
            <div>
              <h4 className="mb-2 text-sm font-semibold text-slate-300">
                Experience (from CV)
              </h4>
              <ul className="space-y-2 text-sm text-slate-300">
                {c.parsedData.experience.slice(0, 4).map((exp, i) => (
                  <li
                    key={i}
                    className="rounded-lg border border-slate-700/50 bg-slate-800/30 px-3 py-2"
                  >
                    <span className="font-medium text-white">
                      {exp.role || "Role"}
                    </span>
                    {exp.company && (
                      <span className="text-slate-400"> at {exp.company}</span>
                    )}
                    {exp.duration && (
                      <span className="block text-xs text-slate-500">
                        {exp.duration}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div>
            <h4 className="mb-3 text-sm font-semibold text-slate-300">
              Interview questions ({questions.length})
            </h4>
            {questions.length === 0 ? (
              <p className="text-sm text-slate-500">
                No questions saved yet. They may still be on the review queue.
              </p>
            ) : (
              <ol className="space-y-2">
                {questions.map((q: ReviewQuestion, idx) => (
                  <li
                    key={idx}
                    className="rounded-xl border border-slate-700/60 bg-slate-800/30 p-3"
                  >
                    <p className="text-sm text-white">{q.question}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      {q.skill || "General"}
                      {q.difficulty ? ` · ${q.difficulty}` : ""}
                    </p>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </div>
      )}
    </article>
  );
}

export function TechLeadInterviewPrepPage() {
  const { currentUser } = useAuth();
  const [briefings, setBriefings] = useState<InterviewBriefing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<"all" | "upcoming" | "awaiting">("all");

  const load = async () => {
    if (!currentUser) return;
    setLoading(true);
    setError("");
    try {
      const res = await reviewsApi.findInterviewPrep(currentUser.id);
      setBriefings(res.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [currentUser]);

  const filtered = useMemo(() => {
    const now = Date.now();
    return briefings.filter((b) => {
      if (filter === "awaiting") return !b.interview?.scheduledAt;
      if (filter === "upcoming") {
        return (
          b.interview?.scheduledAt &&
          new Date(b.interview.scheduledAt).getTime() >= now - 60 * 60 * 1000
        );
      }
      return true;
    });
  }, [briefings, filter]);

  const upcomingCount = briefings.filter(
    (b) =>
      b.interview?.scheduledAt &&
      new Date(b.interview.scheduledAt).getTime() >= Date.now(),
  ).length;
  const awaitingCount = briefings.filter((b) => !b.interview?.scheduledAt).length;

  return (
    <PageShell maxWidthClass="max-w-3xl">
      <PageHeader
        eyebrow="Interview prep"
        title="Your candidates"
        description="Candidates you accepted, with HR notes, skills, and interview questions — use this before each interview."
      />

      {error && (
        <div className="mb-4 rounded-xl border border-rose-800/60 bg-rose-950/50 p-4 text-rose-200">
          {error}
        </div>
      )}

      {!loading && briefings.length > 0 && (
        <div className="mb-6 flex flex-wrap gap-2">
          {(
            [
              ["all", `All (${briefings.length})`],
              ["upcoming", `Scheduled (${upcomingCount})`],
              [
                "awaiting",
                `Awaiting schedule (${awaitingCount})`,
              ],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setFilter(key)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                filter === key
                  ? "bg-violet-600 text-white"
                  : "border border-slate-700 bg-slate-800/50 text-slate-300 hover:bg-slate-800"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20">
          <span className="h-8 w-8 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
        </div>
      ) : briefings.length === 0 ? (
        <EmptyState
          icon="📋"
          title="No candidates yet"
          description="When you accept candidates from the review queue, they appear here with questions and profile details."
          action={
            <Link
              to="/techlead/reviews"
              className="rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-violet-500"
            >
              Open review queue
            </Link>
          }
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          title="Nothing in this filter"
          description="Try another tab or check the calendar for past interviews."
        />
      ) : (
        <div className="space-y-4">
          {filtered.map((b) => (
            <BriefingCard key={b.reviewId} briefing={b} />
          ))}
        </div>
      )}
    </PageShell>
  );
}
