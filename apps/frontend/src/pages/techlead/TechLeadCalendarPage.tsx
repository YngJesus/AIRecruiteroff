import { useState, useEffect, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { interviewsApi } from "../../api/interviews";
import { availabilityApi } from "../../api/availability";
import { PageShell, fieldClass, labelClass } from "../../components/layout/PageShell";
import { PageHeader } from "../../components/ui/PageHeader";
const DAY_COUNT = 14;

export function TechLeadCalendarPage() {
  const { currentUser } = useAuth();
  const [interviews, setInterviews] = useState<any[]>([]);
  const [availability, setAvailability] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [addDate, setAddDate] = useState<string | null>(null);
  const [slotForm, setSlotForm] = useState({ startTime: "09:00", endTime: "10:00" });
  const [savingSlot, setSavingSlot] = useState(false);

  const load = useCallback(async () => {
    if (!currentUser) return;
    try {
      setLoading(true);
      setError("");
      const [iRes, aRes] = await Promise.all([
        interviewsApi.findByTechLead(currentUser.id),
        availabilityApi.findForUser(currentUser.id),
      ]);
      setInterviews(iRes.data || []);
      setAvailability(aRes.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    void load();
  }, [load]);

  const days = useMemo(() => {
    return Array.from({ length: DAY_COUNT }).map((_, i) => {
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
    });
  }, []);

  const interviewsByDate = (dateIso: string) =>
    interviews.filter((it) => it.scheduledAt?.slice(0, 10) === dateIso);

  const slotsByDate = (dateIso: string) =>
    availability
      .filter((s) => s.date === dateIso)
      .sort((a: any, b: any) => a.startTime.localeCompare(b.startTime));

  const handleAddSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !addDate) return;
    setSavingSlot(true);
    setError("");
    try {
      await availabilityApi.create(
        currentUser.id,
        addDate,
        slotForm.startTime,
        slotForm.endTime,
      );
      setAddDate(null);
      setSlotForm({ startTime: "09:00", endTime: "10:00" });
      await load();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Failed to add slot");
    } finally {
      setSavingSlot(false);
    }
  };

  const handleDeleteSlot = async (id: string) => {
    try {
      await availabilityApi.delete(id);
      await load();
    } catch (err: any) {
      setError(err.message || "Failed to remove slot");
    }
  };

  const openSlots = availability.filter((s) => s.status === "available").length;

  return (
    <PageShell maxWidthClass="max-w-5xl">
      <PageHeader
        eyebrow="Calendar"
        title="Your calendar"
        description="Add availability on any day and see interviews HR books on your open slots."
      />

      {error && (
        <div className="mb-6 rounded-xl border border-rose-800/60 bg-rose-950/50 p-4 text-rose-200">
          {error}
        </div>
      )}

      {!loading && (
        <div className="mb-6 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-800/80 bg-slate-900/50 px-4 py-3">
            <p className="text-xs text-slate-500 uppercase tracking-wide">Open slots</p>
            <p className="text-2xl font-bold text-emerald-400">{openSlots}</p>
          </div>
          <div className="rounded-xl border border-slate-800/80 bg-slate-900/50 px-4 py-3">
            <p className="text-xs text-slate-500 uppercase tracking-wide">Upcoming interviews</p>
            <p className="text-2xl font-bold text-white">{interviews.length}</p>
          </div>
          <div className="rounded-xl border border-slate-800/80 bg-slate-900/50 px-4 py-3">
            <p className="text-xs text-slate-500 uppercase tracking-wide">Tip</p>
            <p className="text-sm text-slate-400 mt-1">Click + Add slot on any day</p>
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
                  className={`flex flex-wrap items-center justify-between gap-2 px-5 py-3 border-b border-slate-800/80 ${
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
                  <button
                    type="button"
                    onClick={() => setAddDate(d.date)}
                    className="rounded-lg bg-violet-600/90 px-3 py-1.5 text-xs font-semibold text-white hover:bg-violet-500"
                  >
                    + Add slot
                  </button>
                </div>
                <div className="p-4 space-y-2">
                  {slots.length === 0 && booked.length === 0 && (
                    <p className="text-sm text-slate-500 py-2">Nothing on this day yet.</p>
                  )}
                  {slots.map((slot: any) => {
                    const match = booked.find(
                      (it) =>
                        it.scheduledAt?.slice(11, 16) ===
                        slot.startTime.slice(0, 5),
                    );
                    const isReserved = slot.status === "reserved" || Boolean(match);
                    return (
                      <div
                        key={slot.id}
                        className={`flex items-center justify-between gap-3 rounded-xl border p-3 ${
                          isReserved
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
                            <p className="text-xs text-emerald-400/90 mt-0.5">
                              {slot.status === "available" ? "Open for HR" : slot.status}
                            </p>
                          )}
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                          {match?.candidate?.id && (
                            <Link
                              to={`/candidates/${match.candidate.id}`}
                              className="text-sm font-medium text-blue-400 hover:text-blue-300"
                            >
                              View
                            </Link>
                          )}
                          {slot.status === "available" && (
                            <button
                              type="button"
                              onClick={() => handleDeleteSlot(slot.id)}
                              className="text-sm text-rose-400 hover:text-rose-300"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      )}

      {addDate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-white mb-1">Add availability</h3>
            <p className="text-sm text-slate-400 mb-4">
              {new Date(addDate + "T12:00:00").toLocaleDateString(undefined, {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
            </p>
            <form onSubmit={handleAddSlot} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Start</label>
                  <input
                    type="time"
                    value={slotForm.startTime}
                    onChange={(e) =>
                      setSlotForm({ ...slotForm, startTime: e.target.value })
                    }
                    className={fieldClass}
                    required
                  />
                </div>
                <div>
                  <label className={labelClass}>End</label>
                  <input
                    type="time"
                    value={slotForm.endTime}
                    onChange={(e) =>
                      setSlotForm({ ...slotForm, endTime: e.target.value })
                    }
                    className={fieldClass}
                    required
                  />
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setAddDate(null)}
                  className="rounded-xl border border-slate-600 px-4 py-2 text-sm font-semibold text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingSlot}
                  className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-500 disabled:opacity-50"
                >
                  {savingSlot ? "Saving…" : "Save slot"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PageShell>
  );
}
