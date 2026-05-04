import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { dashboardApi, type DashboardSummary } from "../api/dashboard";

export function DashboardPage() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadSummary = async () => {
      try {
        setIsLoading(true);
        const response = await dashboardApi.getSummary();
        setSummary(response.data);
      } catch (err: any) {
        setError(err.message || "Failed to load dashboard stats");
      } finally {
        setIsLoading(false);
      }
    };

    loadSummary();
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 p-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-white">AIRecruiter</h1>
          <div className="flex items-center space-x-4">
            <span className="text-gray-300">
              Welcome, {currentUser?.firstName} {currentUser?.lastName}
            </span>
            <span className="text-gray-400 text-sm">({currentUser?.role})</span>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">
        {error && (
          <div className="mb-4 p-3 bg-red-900 text-red-200 rounded">
            {error}
          </div>
        )}

        {isLoading && !summary ? (
          <div className="text-gray-400">Loading dashboard stats...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-800 p-6 rounded-lg">
              <h2 className="text-xl font-semibold text-white mb-2">
                Total Jobs
              </h2>
              <p className="text-4xl font-bold text-blue-400">
                {summary?.totalJobs ?? 0}
              </p>
            </div>

            <div className="bg-gray-800 p-6 rounded-lg">
              <h2 className="text-xl font-semibold text-white mb-2">
                Total Candidates
              </h2>
              <p className="text-4xl font-bold text-green-400">
                {summary?.totalCandidates ?? 0}
              </p>
            </div>

            <div className="bg-gray-800 p-6 rounded-lg">
              <h2 className="text-xl font-semibold text-white mb-2">
                Avg Match Score
              </h2>
              <p className="text-4xl font-bold text-purple-400">
                {summary?.avgMatchScore ?? 0}%
              </p>
            </div>
          </div>
        )}

        {summary && (
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-gray-800 p-6 rounded-lg">
              <h2 className="text-xl font-semibold text-white mb-4">
                Candidates by Status
              </h2>
              <div className="space-y-2 text-gray-300">
                {Object.keys(summary.candidatesByStatus).length === 0 ? (
                  <p className="text-gray-500">No candidates yet</p>
                ) : (
                  Object.entries(summary.candidatesByStatus).map(
                    ([status, count]) => (
                      <div key={status} className="flex justify-between">
                        <span className="capitalize">{status}</span>
                        <span>{count}</span>
                      </div>
                    ),
                  )
                )}
              </div>
            </div>

            <div className="bg-gray-800 p-6 rounded-lg">
              <h2 className="text-xl font-semibold text-white mb-4">
                Recent Candidates
              </h2>
              <div className="space-y-3">
                {summary.recentCandidates.length === 0 ? (
                  <p className="text-gray-500">No recent candidates</p>
                ) : (
                  summary.recentCandidates.map((candidate) => (
                    <button
                      key={candidate.id}
                      onClick={() => navigate(`/candidates/${candidate.id}`)}
                      className="w-full text-left p-3 rounded bg-gray-700 hover:bg-gray-600 transition"
                    >
                      <div className="flex justify-between gap-3">
                        <span className="text-white truncate">
                          {candidate.cvFileName}
                        </span>
                        <span className="text-sm text-gray-300 capitalize">
                          {candidate.status}
                        </span>
                      </div>
                      <div className="text-sm text-gray-400 mt-1">
                        Match {candidate.matchScore}%
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
