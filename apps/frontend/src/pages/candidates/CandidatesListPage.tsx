import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { candidatesApi, type Candidate } from "../../api/candidates";
import { jobsApi } from "../../api/jobs";

export function CandidatesListPage() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [jobTitle, setJobTitle] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!jobId) return;
    fetchData();
  }, [jobId]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [jobRes, candRes] = await Promise.all([
        jobsApi.getById(jobId!),
        candidatesApi.getAll(jobId),
      ]);
      setJobTitle(jobRes.data.title);
      setCandidates(candRes.data);
    } catch (err: any) {
      setError(err.message || "Failed to load data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Delete candidate?")) {
      try {
        await candidatesApi.delete(id);
        setCandidates(candidates.filter((c) => c.id !== id));
      } catch (err: any) {
        setError(err.message || "Failed to delete");
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 p-6 text-center text-gray-400">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <button
        onClick={() => navigate("/jobs")}
        className="text-blue-400 hover:text-blue-300 mb-6"
      >
        ← Back to Jobs
      </button>

      <h1 className="text-3xl font-bold text-white mb-2">{jobTitle}</h1>
      <h2 className="text-lg text-gray-300 mb-8">Candidates</h2>

      {error && (
        <div className="mb-4 p-3 bg-red-900 text-red-200 rounded">{error}</div>
      )}

      {candidates.length === 0 ? (
        <div className="text-center text-gray-400 py-12">No candidates yet</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-gray-300">
            <thead className="bg-gray-800">
              <tr>
                <th className="px-6 py-3">File Name</th>
                <th className="px-6 py-3">Match Score</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {candidates.map((candidate) => (
                <tr key={candidate.id} className="border-b border-gray-700">
                  <td className="px-6 py-4">{candidate.cvFileName}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 rounded text-sm font-semibold ${
                        candidate.matchScore >= 70
                          ? "bg-green-900 text-green-200"
                          : candidate.matchScore >= 40
                            ? "bg-yellow-900 text-yellow-200"
                            : "bg-red-900 text-red-200"
                      }`}
                    >
                      {candidate.matchScore.toFixed(0)}%
                    </span>
                  </td>
                  <td className="px-6 py-4 capitalize">{candidate.status}</td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => navigate(`/candidates/${candidate.id}`)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded mr-2"
                    >
                      View
                    </button>
                    <button
                      onClick={() => handleDelete(candidate.id)}
                      className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
