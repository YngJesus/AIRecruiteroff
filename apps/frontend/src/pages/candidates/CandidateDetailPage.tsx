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
      <div className="min-h-screen bg-gray-900 p-6 text-center text-gray-400">
        Loading...
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="min-h-screen bg-gray-900 p-6 text-center text-red-400">
        Candidate not found
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <button
        onClick={() => navigate(-1)}
        className="text-blue-400 hover:text-blue-300 mb-6"
      >
        ← Back
      </button>

      {error && (
        <div className="mb-4 p-3 bg-red-900 text-red-200 rounded">{error}</div>
      )}

      <div className="grid grid-cols-3 gap-6 mb-8">
        {/* Match Score Card */}
        <div className="bg-gray-800 p-6 rounded-lg">
          <h3 className="text-gray-400 text-sm mb-2">Match Score</h3>
          <div
            className={`text-5xl font-bold ${
              candidate.matchScore >= 70
                ? "text-green-400"
                : candidate.matchScore >= 40
                  ? "text-yellow-400"
                  : "text-red-400"
            }`}
          >
            {candidate.matchScore.toFixed(0)}%
          </div>
        </div>

        {/* Status Card */}
        <div className="bg-gray-800 p-6 rounded-lg">
          <h3 className="text-gray-400 text-sm mb-2">Status</h3>
          <p className="text-2xl font-semibold text-white capitalize">
            {candidate.status}
          </p>

          {hasRole(["recruiter", "admin"]) && (
            <div className="mt-4 flex items-center gap-2">
              <select
                value={selectedStatus}
                onChange={(e) =>
                  setSelectedStatus(e.target.value as Candidate["status"])
                }
                className="flex-1 px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none text-sm"
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
                className="px-3 py-2 rounded bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white text-sm font-semibold transition"
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
        <div className="bg-gray-800 p-6 rounded-lg">
          <h3 className="text-gray-400 text-sm mb-2">CV File</h3>
          <p className="text-lg text-white truncate">{candidate.cvFileName}</p>
          <button
            type="button"
            onClick={handleDownloadCv}
            disabled={isDownloading}
            className="text-blue-400 text-sm hover:text-blue-300 disabled:text-gray-500"
          >
            {isDownloading ? "Downloading..." : "Download CV"}
          </button>
        </div>
      </div>

      {["uploaded", "processing"].includes(candidate.status) && (
        <div className="mb-6 p-4 bg-blue-900/40 border border-blue-700 rounded text-blue-200">
          Candidate analysis is in progress. This page refreshes automatically
          every 3 seconds.
        </div>
      )}

      {/* Parsed Data */}
      {candidate.parsedData && (
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">
            Parsed Information
          </h2>

          {candidate.parsedData.skills && (
            <div className="mb-4">
              <h3 className="text-gray-300 font-semibold mb-2">Skills</h3>
              <div className="flex flex-wrap gap-2">
                {candidate.parsedData.skills.map((skill: any, idx: number) => (
                  <span
                    key={idx}
                    className="bg-blue-900 text-blue-200 px-3 py-1 rounded"
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
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">Skill Gaps</h2>
          <div className="space-y-2">
            {candidate.skillGaps.map((gap: any, idx: number) => (
              <div key={idx} className="flex items-center justify-between">
                <span className="text-gray-300">{gap.skill}</span>
                <span
                  className={`px-3 py-1 rounded text-sm font-semibold ${
                    gap.status === "match"
                      ? "bg-green-900 text-green-200"
                      : gap.status === "partial"
                        ? "bg-yellow-900 text-yellow-200"
                        : "bg-red-900 text-red-200"
                  }`}
                >
                  {gap.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {candidate.generatedQuestions &&
        candidate.generatedQuestions.length > 0 && (
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">
              Interview Questions
            </h2>
            <div className="space-y-4">
              {candidate.generatedQuestions.map((q: any, idx: number) => (
                <div key={idx} className="border border-gray-700 rounded p-4">
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
  );
}
