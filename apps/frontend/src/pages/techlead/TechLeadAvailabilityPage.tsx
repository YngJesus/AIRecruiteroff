import { useState, useEffect, useMemo } from "react";
import { useAuth } from "../../context/AuthContext";
import { availabilityApi } from "../../api/availability";
import { PageShell, fieldClass, labelClass } from "../../components/layout/PageShell";
import { PageHeader } from "../../components/ui/PageHeader";
import { EmptyState } from "../../components/ui/EmptyState";
import { StatusBadge } from "../../components/ui/StatusBadge";

export function TechLeadAvailabilityPage() {
  const { currentUser } = useAuth();
  const [availability, setAvailability] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    date: "",
    startTime: "",
    endTime: "",
  });

  const load = async () => {
    if (!currentUser) return;
    try {
      setLoading(true);
      const res = await availabilityApi.findForUser(currentUser.id);
      setAvailability(res.data || []);
    } catch (err) {
      console.error("Failed to load availability", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [currentUser]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!currentUser) return;
      await availabilityApi.create(
        currentUser.id,
        formData.date,
        formData.startTime,
        formData.endTime,
      );
      setFormData({ date: "", startTime: "", endTime: "" });
      setShowForm(false);
      await load();
    } catch (err) {
      console.error("Failed to create availability", err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await availabilityApi.delete(id);
      await load();
    } catch (err) {
      console.error("Failed to delete availability", err);
    }
  };

  const grouped = useMemo(() => {
    const map = new Map<string, any[]>();
    for (const slot of availability) {
      const list = map.get(slot.date) ?? [];
      list.push(slot);
      map.set(slot.date, list);
    }
    return [...map.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [availability]);

  const btnPrimary =
    "rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:from-violet-500 hover:to-indigo-500";

  return (
    <PageShell maxWidthClass="max-w-4xl">
      <PageHeader
        eyebrow="Scheduling"
        title="Your availability"
        description="HR books interviews only in these windows. Add slots for the next two weeks so accepted candidates can be scheduled quickly."
        actions={
          <button
            type="button"
            className={btnPrimary}
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? "Cancel" : "+ Add time slot"}
          </button>
        }
      />

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="mb-8 rounded-2xl border border-violet-800/40 bg-violet-950/20 p-6 space-y-4"
        >
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className={labelClass}>Date</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
                className={fieldClass}
                required
              />
            </div>
            <div>
              <label className={labelClass}>Start</label>
              <input
                type="time"
                value={formData.startTime}
                onChange={(e) =>
                  setFormData({ ...formData, startTime: e.target.value })
                }
                className={fieldClass}
                required
              />
            </div>
            <div>
              <label className={labelClass}>End</label>
              <input
                type="time"
                value={formData.endTime}
                onChange={(e) =>
                  setFormData({ ...formData, endTime: e.target.value })
                }
                className={fieldClass}
                required
              />
            </div>
          </div>
          <button type="submit" className={`w-full sm:w-auto ${btnPrimary}`}>
            Save slot
          </button>
        </form>
      )}

      {loading ? (
        <div className="flex justify-center py-16">
          <span className="h-8 w-8 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
        </div>
      ) : grouped.length === 0 ? (
        <EmptyState
          icon="📅"
          title="No availability yet"
          description="Add time slots so HR can schedule interviews after you accept candidates."
          action={
            <button type="button" className={btnPrimary} onClick={() => setShowForm(true)}>
              Add first slot
            </button>
          }
        />
      ) : (
        <div className="space-y-6">
          {grouped.map(([date, slots]) => (
            <section
              key={date}
              className="rounded-2xl border border-slate-800/80 bg-slate-900/50 overflow-hidden"
            >
              <div className="border-b border-slate-800/80 bg-slate-800/30 px-5 py-3">
                <h3 className="font-semibold text-white">
                  {new Date(date + "T12:00:00").toLocaleDateString(undefined, {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                  })}
                </h3>
              </div>
              <ul className="divide-y divide-slate-800/60">
                {slots
                  .sort((a, b) => a.startTime.localeCompare(b.startTime))
                  .map((slot) => (
                    <li
                      key={slot.id}
                      className="flex flex-wrap items-center justify-between gap-3 px-5 py-4"
                    >
                      <div className="flex items-center gap-4">
                        <span className="text-lg font-semibold tabular-nums text-white">
                          {slot.startTime} – {slot.endTime}
                        </span>
                        <StatusBadge
                          status={
                            slot.status === "available"
                              ? "matched"
                              : slot.status === "reserved"
                                ? "awaiting-interview"
                                : "rejected"
                          }
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDelete(slot.id)}
                        disabled={slot.status === "reserved"}
                        className="text-sm font-medium text-rose-400 hover:text-rose-300 disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        Remove
                      </button>
                    </li>
                  ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </PageShell>
  );
}
