import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { candidatesApi, type Candidate } from "../../api/candidates";
import { useAuth } from "../../context/AuthContext";

export function CandidateDetailPage() {
  const { candidateId } = useParams();
  const navigate = useNavigate();
  const { hasRole } = useAuth();
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isDownloading, setIsDownloading] = useState(false);
  const [selectedStatus, setSelectedStatus] =
    useState<Candidate["status"]>("uploaded");
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  useEffect(() => {
    if (!candidateId) return;
    fetchCandidate();
  }, [candidateId]);

  useEffect(() => {
    if (!candidate) return;
    setSelectedStatus(candidate.status);
  }, [candidate?.id, candidate?.status]);

  useEffect(() => {
    if (!candidateId || !candidate) return;
    if (!["uploaded", "processing"].includes(candidate.status)) return;

    const timer = setInterval(() => {
      fetchCandidate(false);
    }, 3000);
    return () => clearInterval(timer);
  }, [candidateId, candidate?.status]);

  const fetchCandidate = async (showLoading = true) => {
    try {
      if (showLoading) setIsLoading(true);
      const response = await candidatesApi.getById(candidateId!);
      setCandidate(response.data);
    } catch (err: any) {
      setError(err.message || "Failed to load candidate");
    } finally {
      if (showLoading) setIsLoading(false);
    }
  };

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
                <option value="rejected">Rejected</option>
              </select>
              <button
                type="button"
                onClick={handleUpdateStatus}
                disabled={
                  isUpdatingStatus || selectedStatus === (candidate.status as any)
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
          <p className="mt-2 truncate text-lg text-white">{candidate.cvFileName}</p>
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
          Candidate analysis is in progress. This page refreshes automatically
          every 3 seconds.
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
                {candidate.parsedData.skills.map((skill: any, idx: number) => (
                  <span
                    key={idx}
                    className="rounded-lg bg-blue-950/80 px-3 py-1 text-blue-200 ring-1 ring-blue-800/50"
                  >
                    {skill.name ?? skill.skill ?? "Unknown skill"}
                    {(skill.level ?? skill.proficiency) &&
                      ` (${skill.level ?? skill.proficiency})`}
                  </span>
                ))}
              </div>
            </div>
          )}

          {candidate.parsedData.experience && (
            <div className="mb-4">
              <h3 className="text-gray-300 font-semibold mb-2">Experience</h3>
              {candidate.parsedData.experience.map((exp: any, idx: number) => (
                <div key={idx} className="mb-2 text-gray-400 text-sm">
                  <p className="font-semibold text-white">
                    {exp.role} at {exp.company}
                  </p>
                  <p>{exp.duration}</p>
                </div>
              ))}
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
          <h2 className="mb-4 text-xl font-semibold text-white">Skill match</h2>
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
            {matchCount} full skill matches, {partialCount} partial (close level
            or related skill), {gapCount} gaps — out of {gaps.length} evaluated
            job skills. The overall % weights required skills more than
            nice-to-have.
          </p>
          <ul className="space-y-2 text-sm text-slate-300">
            {gaps.map((g: any, i: number) => (
              <li key={i} className="flex gap-2 border-l-2 border-slate-600 pl-3">
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
    </div>
  );
}
