import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { candidatesApi } from "../../api/candidates";

export function CandidateDetailPage() {
  const { candidateId } = useParams();
  const navigate = useNavigate();
  const [candidate, setCandidate] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!candidateId) return;
    fetchCandidate();
  }, [candidateId]);

  const fetchCandidate = async () => {
    try {
      setIsLoading(true);
      const response = await candidatesApi.getById(candidateId!);
      setCandidate(response.data);
    } catch (err: any) {
      setError(err.message || "Failed to load candidate");
    } finally {
      setIsLoading(false);
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
        </div>

        {/* File Name Card */}
        <div className="bg-gray-800 p-6 rounded-lg">
          <h3 className="text-gray-400 text-sm mb-2">CV File</h3>
          <p className="text-lg text-white truncate">{candidate.cvFileName}</p>
        </div>
      </div>

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
                    {skill.name}
                    {skill.level && ` (${skill.level})`}
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
        <div className="bg-gray-800 rounded-lg p-6">
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
    </div>
  );
}
