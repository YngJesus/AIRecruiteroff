import { useState, useEffect, useMemo } from "react";
import { useAuth } from "../../context/AuthContext";
import { interviewsApi } from "../../api/interviews";
import { availabilityApi } from "../../api/availability";
import { Link } from "react-router-dom";
import { PageShell } from "../../components/layout/PageShell";
import { PageHeader } from "../../components/ui/PageHeader";
import { EmptyState } from "../../components/ui/EmptyState";

export function TechLeadInterviewsPage() {
  const { currentUser } = useAuth();
  const [interviews, setInterviews] = useState<any[]>([]);
  const [availability, setAvailability] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError("");
        if (!currentUser) return;
        const [iRes, aRes] = await Promise.all([
          interviewsApi.findByTechLead(currentUser.id),
          availabilityApi.findForUser(currentUser.id),
        ]);
        setInterviews(iRes.data || []);
        setAvailability(aRes.data || []);
      } catch (err: any) {
        setError(err.message || "Failed to load calendar");
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [currentUser]);

  const days = useMemo(
    () =>
      Array.from({ length: 7 }).map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() + i);
        const iso = d.toISOString().slice(0, 10);
        return {
          date: iso,
          label: d.toLocaleDateString(undefined, {
            weekday: "short",
            month: "short",
            day: "numeric",
          }),
          isToday: i === 0,
        };
      }),
    [],
  );

  const interviewsByDate = (dateIso: string) =>
    interviews.filter((it) => it.scheduledAt?.slice(0, 10) === dateIso);

  const slotsByDate = (dateIso: string) =>
    availability
      .filter((s) => s.date === dateIso)
      .sort((a: any, b: any) => a.startTime.localeCompare(b.startTime));

  const weekInterviewCount = days.reduce(
    (n, d) => n + interviewsByDate(d.date).length,
    0,
  );

  return (
    <PageShell maxWidthClass="max-w-5xl">
      <PageHeader
        eyebrow="Calendar"
        title="Interviews & availability"
        description="Your 7-day schedule — green blocks are booked interviews, gray slots are open for HR to book."
        actions={
          <Link
            to="/techlead/availability"
            className="rounded-xl border border-slate-600 bg-slate-800/50 px-5 py-2.5 text-sm font-semibold text-slate-200 hover:bg-slate-800"
          >
            Edit availability
          </Link>
        }
      />

      {error && (
        <div className="mb-6 rounded-xl border border-rose-800/60 bg-rose-950/50 p-4 text-rose-200">
          {error}
        </div>
      )}

      {!loading && (
        <div className="mb-6 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-800/80 bg-slate-900/50 px-4 py-3">
            <p className="text-xs text-slate-500 uppercase tracking-wide">This week</p>
            <p className="text-2xl font-bold text-white">{weekInterviewCount}</p>
            <p className="text-xs text-slate-400">interviews scheduled</p>
          </div>
          <div className="rounded-xl border border-slate-800/80 bg-slate-900/50 px-4 py-3">
            <p className="text-xs text-slate-500 uppercase tracking-wide">Open slots</p>
            <p className="text-2xl font-bold text-emerald-400">
              {availability.filter((s) => s.status === "available").length}
            </p>
            <p className="text-xs text-slate-400">available to book</p>
          </div>
          <div className="rounded-xl border border-slate-800/80 bg-slate-900/50 px-4 py-3">
            <p className="text-xs text-slate-500 uppercase tracking-wide">Reserved</p>
            <p className="text-2xl font-bold text-violet-400">
              {availability.filter((s) => s.status === "reserved").length}
            </p>
            <p className="text-xs text-slate-400">slots taken</p>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20">
          <span className="h-8 w-8 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
        </div>
      ) : (
        <div className="space-y-4">
          {days.map((d) => {
            const slots = slotsByDate(d.date);
            const booked = interviewsByDate(d.date);
            const empty = slots.length === 0 && booked.length === 0;
            return (
              <section
                key={d.date}
                className={`rounded-2xl border overflow-hidden ${
                  d.isToday
                    ? "border-violet-700/50 ring-1 ring-violet-600/30"
                    : "border-slate-800/80"
                } bg-slate-900/50`}
              >
                <div
                  className={`flex items-center justify-between px-5 py-3 border-b border-slate-800/80 ${
                    d.isToday ? "bg-violet-950/30" : "bg-slate-800/30"
                  }`}
                >
                  <h3 className="font-semibold text-white">
                    {d.label}
                    {d.isToday && (
                      <span className="ml-2 text-xs font-medium text-violet-400">
                        Today
                      </span>
                    )}
                  </h3>
                  <span className="text-xs text-slate-500">
                    {booked.length} interview{booked.length !== 1 ? "s" : ""}
                  </span>
                </div>
                <div className="p-4 space-y-2">
                  {empty ? (
                    <p className="text-sm text-slate-500 py-2">Nothing scheduled</p>
                  ) : (
                    <>
                      {slots.map((slot: any) => {
                        const match = booked.find(
                          (it) =>
                            it.scheduledAt?.slice(11, 16) ===
                            slot.startTime.slice(0, 5),
                        );
                        return (
                          <div
                            key={slot.id}
                            className={`flex items-center justify-between gap-3 rounded-xl border p-3 ${
                              match
                                ? "border-emerald-800/50 bg-emerald-950/25"
                                : "border-slate-700/50 bg-slate-800/25"
                            }`}
                          >
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-slate-300 tabular-nums">
                                {slot.startTime} – {slot.endTime}
                              </p>
                              {match ? (
                                <>
                                  <p className="text-white font-semibold text-sm mt-0.5 truncate">
                                    {match.candidate?.cvFileName?.replace(/\.[^.]+$/, "")}
                                  </p>
                                  <p className="text-xs text-slate-400 truncate">
                                    {match.job?.title}
                                  </p>
                                </>
                              ) : (
                                <p className="text-xs text-slate-500 mt-0.5">Open slot</p>
                              )}
                            </div>
                            {match?.candidate?.id && (
                              <Link
                                to={`/candidates/${match.candidate.id}`}
                                className="shrink-0 text-sm font-medium text-blue-400 hover:text-blue-300"
                              >
                                View →
                              </Link>
                            )}
                          </div>
                        );
                      })}
                    </>
                  )}
                </div>
              </section>
            );
          })}
          {weekInterviewCount === 0 &&
            availability.filter((s) => s.status === "available").length === 0 && (
              <EmptyState
                icon="📅"
                title="Your calendar is empty"
                description="Add availability so HR can book interviews after you accept candidates."
                action={
                  <Link
                    to="/techlead/availability"
                    className="rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-violet-500"
                  >
                    Add time slots
                  </Link>
                }
              />
            )}
        </div>
      )}
    </PageShell>
  );
}
