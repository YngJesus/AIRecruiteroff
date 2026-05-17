import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { interviewsApi, type Interview } from "../../api/interviews";
import { availabilityApi } from "../../api/availability";
import { usersApi } from "../../api/users";
import { fieldClass, labelClass } from "../../components/layout/PageShell";

export function HRScheduleInterviewPage({
  jobId,
  candidateId,
  existingInterview,
  onSuccess,
}: {
  jobId: string;
  candidateId: string;
  existingInterview?: Interview | null;
  onSuccess?: () => void;
}) {
  const { currentUser } = useAuth();
  const isReschedule = Boolean(existingInterview?.id);
  const [techLeads, setTechLeads] = useState<any[]>([]);
  const [selectedTechLead, setSelectedTechLead] = useState(
    existingInterview?.techLeadId ?? "",
  );
  const [availability, setAvailability] = useState<any[]>([]);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [loading, setLoading] = useState(false);
  const [scheduling, setScheduling] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showRescheduleForm, setShowRescheduleForm] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError("");
        const usersRes = await usersApi.findAll();
        const leads = usersRes.data.filter(
          (u: any) =>
            u.role === "tech_lead" &&
            (!currentUser?.departmentId ||
              u.departmentId === currentUser.departmentId),
        );
        setTechLeads(leads);
        if (existingInterview?.techLeadId) {
          const res = await availabilityApi.findForUser(
            existingInterview.techLeadId,
          );
          setAvailability(res.data || []);
        }
      } catch (err: any) {
        setError(err.response?.data?.message || err.message || "Failed to load");
      } finally {
        setLoading(false);
      }
    };
    void loadData();
  }, [currentUser, existingInterview?.techLeadId]);

  const handleTechLeadChange = async (techLeadId: string) => {
    setSelectedTechLead(techLeadId);
    setSelectedSlot("");
    setError("");
    if (!techLeadId) {
      setAvailability([]);
      return;
    }
    try {
      const res = await availabilityApi.findForUser(techLeadId);
      setAvailability(res.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Failed to load slots");
    }
  };

  const days = Array.from({ length: 14 }).map((_, i) => {
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
    };
  });

  const slotsByDate = (dateIso: string) =>
    availability
      .filter((s) => s.date === dateIso && s.status === "available")
      .sort((a: any, b: any) => a.startTime.localeCompare(b.startTime));

  const handleSubmit = async () => {
    if (!selectedSlot) {
      setError("Please select a time slot");
      return;
    }
    const slot = availability.find((s) => s.id === selectedSlot);
    if (!slot) {
      setError("Slot not found");
      return;
    }

    setScheduling(true);
    setError("");
    const scheduledAt = new Date(`${slot.date}T${slot.startTime}`).toISOString();

    try {
      if (isReschedule && existingInterview) {
        await interviewsApi.reschedule(
          existingInterview.id,
          selectedTechLead,
          scheduledAt,
          selectedSlot,
        );
        setSuccess("Interview rescheduled successfully.");
      } else {
        await interviewsApi.create(
          candidateId,
          jobId,
          selectedTechLead,
          scheduledAt,
          selectedSlot,
        );
        setSuccess("Interview scheduled successfully.");
      }
      setShowRescheduleForm(false);
      setTimeout(() => {
        setSuccess("");
        onSuccess?.();
      }, 1500);
    } catch (err: any) {
      setError(
        err.response?.data?.message || err.message || "Failed to save interview",
      );
    } finally {
      setScheduling(false);
    }
  };

  if (isReschedule && existingInterview && !showRescheduleForm) {
    return (
      <div className="space-y-4">
        <div className="rounded-xl border border-emerald-800/50 bg-emerald-950/30 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-400 mb-1">
            Interview scheduled
          </p>
          <p className="text-lg font-semibold text-white">
            {new Date(existingInterview.scheduledAt).toLocaleString(undefined, {
              weekday: "long",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
          <p className="text-sm text-slate-400 mt-1">
            Tech lead ID: {existingInterview.techLeadId.slice(0, 8)}…
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setShowRescheduleForm(true);
            void handleTechLeadChange(existingInterview.techLeadId);
          }}
          className="rounded-xl border border-slate-600 bg-slate-800/60 px-4 py-2.5 text-sm font-semibold text-slate-200 hover:bg-slate-800"
        >
          Reschedule interview
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-lg border border-rose-800/60 bg-rose-950/50 p-3 text-sm text-rose-200">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-lg border border-emerald-800/60 bg-emerald-950/50 p-3 text-sm text-emerald-200">
          {success}
        </div>
      )}

      {isReschedule && (
        <p className="text-sm text-slate-400">
          Pick a new slot for this candidate. The previous slot will be released.
        </p>
      )}

      <div>
        <label className={labelClass}>
          Tech Lead <span className="text-rose-400">*</span>
        </label>
        <select
          value={selectedTechLead}
          onChange={(e) => handleTechLeadChange(e.target.value)}
          disabled={loading}
          className={fieldClass}
        >
          <option value="">Select tech lead</option>
          {techLeads.map((lead) => (
            <option key={lead.id} value={lead.id}>
              {lead.firstName} {lead.lastName}
            </option>
          ))}
        </select>
      </div>

      {selectedTechLead && (
        <div>
          <label className={labelClass}>
            Available slots <span className="text-rose-400">*</span>
          </label>
          <div className="grid gap-3 max-h-64 overflow-y-auto pr-1">
            {days.map((d) => {
              const slots = slotsByDate(d.date);
              if (slots.length === 0) return null;
              return (
                <div
                  key={d.date}
                  className="rounded-xl border border-slate-800/60 bg-slate-800/30 p-3"
                >
                  <p className="text-sm font-medium text-slate-300 mb-2">
                    {d.label}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {slots.map((slot: any) => (
                      <button
                        key={slot.id}
                        type="button"
                        onClick={() => {
                          setSelectedSlot(slot.id);
                          setError("");
                        }}
                        disabled={scheduling}
                        className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                          selectedSlot === slot.id
                            ? "bg-blue-600 text-white ring-2 ring-blue-400"
                            : "bg-slate-700 text-white hover:bg-slate-600"
                        }`}
                      >
                        {slot.startTime} – {slot.endTime}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
            {days.every((d) => slotsByDate(d.date).length === 0) && (
              <p className="text-sm text-slate-500">
                No open slots for this tech lead. Ask them to add availability on
                their calendar.
              </p>
            )}
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {isReschedule && showRescheduleForm && (
          <button
            type="button"
            onClick={() => setShowRescheduleForm(false)}
            className="rounded-xl border border-slate-600 px-4 py-2.5 text-sm font-semibold text-slate-300"
          >
            Cancel
          </button>
        )}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!selectedSlot || scheduling || loading}
          className="flex-1 min-w-[200px] rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg disabled:opacity-50"
        >
          {scheduling
            ? "Saving…"
            : isReschedule
              ? "Confirm reschedule"
              : "Schedule interview"}
        </button>
      </div>
    </div>
  );
}
