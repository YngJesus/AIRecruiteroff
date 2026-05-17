import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { candidatesApi, type Candidate } from "../../api/candidates";
import { usersApi } from "../../api/users";
import { reviewsApi } from "../../api/reviews";
import { useAuth } from "../../context/AuthContext";
import { HRScheduleInterviewPage } from "../hr/HRScheduleInterviewPage";
import { interviewsApi, type Interview } from "../../api/interviews";

export function CandidateDetailPage() {
  const { candidateId } = useParams();
  const navigate = useNavigate();
  const { hasRole, currentUser } = useAuth();
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isDownloading, setIsDownloading] = useState(false);
  const [selectedStatus, setSelectedStatus] =
    useState<Candidate["status"]>("uploaded");
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [showSendModal, setShowSendModal] = useState(false);
  const [techLeads, setTechLeads] = useState<any[]>([]);
  const [selectedTechLead, setSelectedTechLead] = useState("");
  const [sendNotes, setSendNotes] = useState("");
  const [sendScore, setSendScore] = useState<number | undefined>(undefined);
  const [sendLoading, setSendLoading] = useState(false);
  const [sendError, setSendError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [scheduledInterview, setScheduledInterview] =
    useState<Interview | null>(null);

  const fetchCandidate = useCallback(
    async (showLoading = true) => {
      if (!candidateId) return;
      try {
        if (showLoading) setIsLoading(true);
        const [candidateRes, interviewRes] = await Promise.all([
          candidatesApi.findOne(candidateId),
          interviewsApi.findByCandidate(candidateId).catch(() => ({ data: null })),
        ]);
        setCandidate(candidateRes.data);
        setScheduledInterview(interviewRes.data ?? null);
      } catch (err: any) {
        setError(err.message || "Failed to load candidate");
      } finally {
        if (showLoading) setIsLoading(false);
      }
    },
    [candidateId],
  );

  useEffect(() => {
    if (!candidateId) return;
    void fetchCandidate();
  }, [candidateId, fetchCandidate]);

  useEffect(() => {
    if (!candidate) return;
    setSelectedStatus(candidate.status);
  }, [candidate?.id, candidate?.status]);

  /** Poll until pipeline finishes, including `parsed` (match done, questions generating) and legacy `matched` without questions. */
  useEffect(() => {
    if (!candidateId) return;

    const shouldPoll = (c: Candidate | null) => {
      if (!c) return true;
      if (["uploaded", "processing", "parsed"].includes(c.status)) return true;
      if (
        c.status === "matched" &&
        (!Array.isArray(c.generatedQuestions) ||
          c.generatedQuestions.length === 0)
      ) {
        return true;
      }
      return false;
    };

    if (!shouldPoll(candidate)) return;

    const timer = setInterval(() => {
      void fetchCandidate(false);
    }, 2500);
    return () => clearInterval(timer);
  }, [
    candidateId,
    candidate?.status,
    candidate?.generatedQuestions?.length,
    fetchCandidate,
  ]);

  const handleDownloadCv = async () => {
    if (!candidate) return;
    setError("");
    setIsDownloading(true);
    try {
      const response = await candidatesApi.downloadCV(candidate.id);
      const blob = response.data;
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = candidate.cvFileName || "cv";
      document.body.appendChild(a);
      a.click();
      a.remove();

      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      setError(err.message || "Failed to download CV");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!candidate) return;
    setError("");
    setIsUpdatingStatus(true);
    try {
      const response = await candidatesApi.updateStatus(
        candidate.id,
        selectedStatus,
      );
      setCandidate(response.data);
    } catch (err: any) {
      setError(err.message || "Failed to update status");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 p-6 text-center text-slate-400">
        <span className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-blue-500 border-t-transparent align-middle" />{" "}
        Loading candidate…
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="min-h-screen bg-slate-950 p-6 text-center text-rose-400">
        Candidate not found
      </div>
    );
  }

  const gaps = candidate.skillGaps ?? [];
  const matchCount = gaps.filter((g: any) => g.status === "match").length;
  const partialCount = gaps.filter((g: any) => g.status === "partial").length;
  const gapCount = gaps.filter((g: any) => g.status === "gap").length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute right-0 top-0 h-72 w-72 rounded-full bg-indigo-600/15 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-64 w-64 rounded-full bg-blue-600/10 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-6xl p-4 sm:p-6">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 text-sm font-medium text-blue-400 hover:text-blue-300"
        >
          ← Back
        </button>

        {error && (
          <div className="mb-4 rounded-xl border border-rose-800/60 bg-rose-950/50 p-3 text-rose-200">
            {error}
          </div>
        )}
        {successMessage && (
          <div className="mb-4 rounded-xl border border-emerald-800/60 bg-emerald-950/50 p-3 text-emerald-200">
            {successMessage}
          </div>
        )}

        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
          {/* Match Score Card */}
          <div className="rounded-2xl border border-slate-800/80 bg-gradient-to-br from-slate-900/90 to-slate-900/50 p-6 shadow-xl shadow-black/20">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Match score
            </h3>
            <div
              className={`mt-2 text-5xl font-bold tabular-nums ${
                candidate.matchScore >= 70
                  ? "text-emerald-400"
                  : candidate.matchScore >= 40
                    ? "text-amber-400"
                    : "text-rose-400"
              }`}
            >
              {candidate.matchScore.toFixed(0)}%
            </div>
            <p className="mt-2 text-xs text-slate-500">
              Weighted by required vs nice-to-have skills and level fit.
            </p>
          </div>

          {/* Status Card */}
          <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-6 backdrop-blur-sm">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Status
            </h3>
            <p className="mt-2 text-2xl font-semibold capitalize text-white">
              {candidate.status}
            </p>

            {hasRole(["recruiter", "admin"]) && (
              <div className="mt-4 flex items-center gap-2">
                <select
                  value={selectedStatus}
                  onChange={(e) =>
                    setSelectedStatus(e.target.value as Candidate["status"])
                  }
                  className="flex-1 rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
                >
                  <option value="uploaded">Uploaded</option>
                  <option value="processing">Processing</option>
                  <option value="parsed">Parsed</option>
                  <option value="matched">Matched</option>
                  <option value="failed">Failed</option>
                  <option value="awaiting-interview">Awaiting interview</option>
                  <option value="interview-scheduled">Interview scheduled</option>
                  <option value="rejected">Rejected</option>
                </select>
                <button
                  type="button"
                  onClick={handleUpdateStatus}
                  disabled={
                    isUpdatingStatus ||
                    selectedStatus === (candidate.status as any)
                  }
                  className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:bg-slate-600"
                >
                  {isUpdatingStatus ? "Saving..." : "Update"}
                </button>
              </div>
            )}

            {candidate.processingError && (
              <p className="text-red-400 text-xs mt-2">
                {candidate.processingError}
              </p>
            )}
          </div>

          {/* File Name Card */}
          <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-6 backdrop-blur-sm">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              CV file
            </h3>
            <p className="mt-2 truncate text-lg text-white">
              {candidate.cvFileName}
            </p>
            <button
              type="button"
              onClick={handleDownloadCv}
              disabled={isDownloading}
              className="mt-3 text-sm font-medium text-blue-400 hover:text-blue-300 disabled:text-slate-500"
            >
              {isDownloading ? "Downloading..." : "Download CV"}
            </button>
          </div>
        </div>

        {["uploaded", "processing"].includes(candidate.status) && (
          <div className="mb-6 rounded-xl border border-blue-700/50 bg-blue-950/40 p-4 text-sm text-blue-200">
            CV analysis is running. This page refreshes automatically while
            processing.
          </div>
        )}
        {candidate.status === "parsed" &&
          (!candidate.generatedQuestions ||
            candidate.generatedQuestions.length === 0) && (
            <div className="mb-6 rounded-xl border border-violet-700/50 bg-violet-950/40 p-4 text-sm text-violet-200">
              Match score is ready. Generating interview questions — updates
              appear here automatically (no refresh needed).
            </div>
          )}

        {hasRole(["recruiter", "admin"]) &&
          candidate.status === "matched" && (
            <div className="mb-6">
              <button
                type="button"
                onClick={async () => {
                  try {
                    const res = await usersApi.findAll();
                    const leads = res.data.filter(
                      (u: any) =>
                        u.role === "tech_lead" &&
                        (!currentUser?.departmentId ||
                          u.departmentId === currentUser.departmentId),
                    );
                    setTechLeads(leads);
                    setSendScore(Math.round(candidate.matchScore));
                    setShowSendModal(true);
                  } catch (err) {
                    console.error(err);
                  }
                }}
                className="rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-500"
              >
                Send to Tech Lead for review
              </button>
            </div>
          )}

        {hasRole(["recruiter", "admin"]) &&
          (candidate.status === "awaiting-interview" ||
            candidate.status === "interview-scheduled" ||
            scheduledInterview) && (
            <div className="mb-8 rounded-2xl border border-blue-800/50 bg-gradient-to-br from-slate-900/90 to-blue-950/20 p-6">
              <h2 className="text-xl font-semibold text-white mb-1">
                {scheduledInterview ? "Interview" : "Schedule interview"}
              </h2>
              <p className="text-sm text-slate-400 mb-4">
                {scheduledInterview
                  ? "This candidate already has a booked slot. You can reschedule if plans change."
                  : "Tech lead accepted this candidate. Pick an available slot to book the interview."}
              </p>
              <HRScheduleInterviewPage
                jobId={candidate.jobId}
                candidateId={candidate.id}
                existingInterview={scheduledInterview}
                onSuccess={() => {
                  setSuccessMessage(
                    scheduledInterview
                      ? "Interview updated."
                      : "Interview scheduled successfully.",
                  );
                  void fetchCandidate(false);
                }}
              />
            </div>
          )}

        {/* Parsed Data */}
        {candidate.parsedData && (
          <div className="mb-6 rounded-2xl border border-slate-800/80 bg-slate-900/50 p-6">
            <h2 className="mb-4 text-xl font-semibold text-white">
              Parsed Information
            </h2>

            {candidate.parsedData.skills && (
              <div className="mb-4">
                <h3 className="text-gray-300 font-semibold mb-2">Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {candidate.parsedData.skills.map(
                    (skill: any, idx: number) => (
                      <span
                        key={idx}
                        className="rounded-lg bg-blue-950/80 px-3 py-1 text-blue-200 ring-1 ring-blue-800/50"
                      >
                        {skill.name ?? skill.skill ?? "Unknown skill"}
                        {(skill.level ?? skill.proficiency) &&
                          ` (${skill.level ?? skill.proficiency})`}
                      </span>
                    ),
                  )}
                </div>
              </div>
            )}

            {candidate.parsedData.experience && (
              <div className="mb-4">
                <h3 className="text-gray-300 font-semibold mb-2">Experience</h3>
                {candidate.parsedData.experience.map(
                  (exp: any, idx: number) => (
                    <div key={idx} className="mb-2 text-gray-400 text-sm">
                      <p className="font-semibold text-white">
                        {exp.role} at {exp.company}
                      </p>
                      <p>{exp.duration}</p>
                    </div>
                  ),
                )}
              </div>
            )}

            {candidate.parsedData.education && (
              <div>
                <h3 className="text-gray-300 font-semibold mb-2">Education</h3>
                {candidate.parsedData.education.map((edu: any, idx: number) => (
                  <div key={idx} className="mb-2 text-gray-400 text-sm">
                    <p className="font-semibold text-white">{edu.degree}</p>
                    <p>{edu.school}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Skill Gaps */}
        {candidate.skillGaps && candidate.skillGaps.length > 0 && (
          <div className="mb-6 rounded-2xl border border-slate-800/80 bg-slate-900/50 p-6">
            <h2 className="mb-4 text-xl font-semibold text-white">
              Skill match
            </h2>
            <div className="space-y-2">
              {candidate.skillGaps.map((gap: any, idx: number) => (
                <div
                  key={idx}
                  className="flex items-center justify-between rounded-xl border border-slate-800/60 bg-slate-800/30 px-3 py-2"
                >
                  <span className="text-slate-300">{gap.skill}</span>
                  <span
                    className={`rounded-lg px-3 py-1 text-sm font-semibold ${
                      gap.status === "match"
                        ? "bg-emerald-950/80 text-emerald-200 ring-1 ring-emerald-800/50"
                        : gap.status === "partial"
                          ? "bg-amber-950/80 text-amber-200 ring-1 ring-amber-800/50"
                          : "bg-rose-950/80 text-rose-200 ring-1 ring-rose-800/50"
                    }`}
                  >
                    {gap.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {gaps.length > 0 && (
          <div className="mb-6 rounded-2xl border border-slate-800/80 bg-gradient-to-br from-slate-900/90 to-indigo-950/30 p-6 ring-1 ring-indigo-900/30">
            <h2 className="mb-2 text-xl font-semibold text-white">
              Score breakdown
            </h2>
            <p className="mb-4 text-sm text-slate-400">
              {matchCount} full skill matches, {partialCount} partial (close
              level or related skill), {gapCount} gaps — out of {gaps.length}{" "}
              evaluated job skills. The overall % weights required skills more
              than nice-to-have.
            </p>
            <ul className="space-y-2 text-sm text-slate-300">
              {gaps.map((g: any, i: number) => (
                <li
                  key={i}
                  className="flex gap-2 border-l-2 border-slate-600 pl-3"
                >
                  <span className="font-medium text-white">{g.skill}</span>
                  <span className="text-slate-500">—</span>
                  <span className="text-slate-400">
                    {g.status === "match" &&
                      "Meets or exceeds the required proficiency level."}
                    {g.status === "partial" &&
                      "Close: related skill or one level below requirement."}
                    {g.status === "gap" &&
                      "Missing or well below the required level."}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {candidate.generatedQuestions &&
          candidate.generatedQuestions.length > 0 && (
            <div className="rounded-2xl border border-slate-800/80 bg-slate-900/50 p-6">
              <h2 className="mb-4 text-xl font-semibold text-white">
                Interview Questions
              </h2>
              <div className="space-y-4">
                {candidate.generatedQuestions.map((q: any, idx: number) => (
                  <div
                    key={idx}
                    className="rounded-xl border border-slate-700/80 bg-slate-800/30 p-4"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-blue-300 font-semibold">
                        {q.skill}
                      </span>
                      <span className="text-xs px-2 py-1 rounded bg-gray-700 text-gray-200">
                        {q.difficulty}
                      </span>
                      <span className="text-xs px-2 py-1 rounded bg-purple-900 text-purple-200">
                        {q.type}
                      </span>
                    </div>
                    <p className="text-gray-200">{q.question}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
      </div>
      {showSendModal && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg bg-slate-900 p-6 border border-slate-800">
            <h3 className="mb-4 text-lg font-semibold text-white">
              Send candidate to Tech Lead
            </h3>

            {sendError && (
              <div className="mb-4 rounded-lg border border-rose-800/60 bg-rose-950/50 p-3 text-sm text-rose-200">
                {sendError}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Tech Lead <span className="text-rose-400">*</span>
                </label>
                <select
                  value={selectedTechLead}
                  onChange={(e) => {
                    setSelectedTechLead(e.target.value);
                    setSendError("");
                  }}
                  disabled={sendLoading}
                  className="w-full px-3 py-2 bg-slate-800 text-white rounded border border-slate-700 focus:border-blue-500 focus:outline-none disabled:opacity-50"
                >
                  <option value="">Select Tech Lead</option>
                  {techLeads.length === 0 && (
                    <option value="" disabled>
                      No tech leads in your department
                    </option>
                  )}
                  {techLeads.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.firstName} {t.lastName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Score (0-100)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={sendScore ?? ""}
                  onChange={(e) =>
                    setSendScore(Number(e.target.value) || undefined)
                  }
                  disabled={sendLoading}
                  placeholder="Optional initial score"
                  className="w-full px-3 py-2 bg-slate-800 text-white rounded border border-slate-700 focus:border-blue-500 focus:outline-none disabled:opacity-50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Notes
                </label>
                <textarea
                  value={sendNotes}
                  onChange={(e) => setSendNotes(e.target.value)}
                  disabled={sendLoading}
                  placeholder="Any observations or context..."
                  className="w-full px-3 py-2 bg-slate-800 text-white rounded border border-slate-700 focus:border-blue-500 focus:outline-none resize-none disabled:opacity-50"
                  rows={3}
                />
              </div>
            </div>

            <div className="mt-6 flex gap-2 justify-end">
              <button
                onClick={() => {
                  setShowSendModal(false);
                  setSelectedTechLead("");
                  setSendNotes("");
                  setSendScore(undefined);
                  setSendError("");
                }}
                disabled={sendLoading}
                className="px-4 py-2 rounded-lg bg-slate-700 text-white font-medium transition hover:bg-slate-600 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  setSendError("");
                  if (!selectedTechLead) {
                    setSendError("Please select a Tech Lead");
                    return;
                  }
                  if (!candidate) return;
                  if (!currentUser) {
                    setSendError("Session error: user not available");
                    return;
                  }

                  try {
                    setSendLoading(true);
                    await reviewsApi.create({
                      candidateId: candidate.id,
                      techLeadId: selectedTechLead,
                      questions: candidate.generatedQuestions || [],
                      score: sendScore ?? candidate.matchScore,
                      notes: sendNotes,
                    });

                    setShowSendModal(false);
                    setSelectedTechLead("");
                    setSendNotes("");
                    setSendScore(undefined);
                    setError("");
                    setSuccessMessage(
                      "Sent to tech lead — they will review and notify you when accepted.",
                    );
                    setTimeout(() => setSuccessMessage(""), 5000);
                  } catch (err: any) {
                    setSendError(
                      err.message ||
                        err.error?.message ||
                        "Failed to send review to Tech Lead",
                    );
                  } finally {
                    setSendLoading(false);
                  }
                }}
                disabled={sendLoading || !selectedTechLead}
                className="px-4 py-2 rounded-lg bg-emerald-600 text-white font-medium transition hover:bg-emerald-500 disabled:bg-slate-600"
              >
                {sendLoading ? "Sending..." : "Send"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
