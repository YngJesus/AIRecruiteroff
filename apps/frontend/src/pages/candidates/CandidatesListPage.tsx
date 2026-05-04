import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { candidatesApi, type Candidate } from "../../api/candidates";
import { jobsApi } from "../../api/jobs";
import { CVUploadModal } from "../../components/CVUploadModal";
import { ConfirmModal } from "../../components/ui/ConfirmModal";

export function CandidatesListPage() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [jobTitle, setJobTitle] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [candidateToDelete, setCandidateToDelete] = useState<Candidate | null>(
    null,
  );
  const [isDeleting, setIsDeleting] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 10;

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
      setPage(1);
    } catch (err: any) {
      setError(err.message || "Failed to load data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!candidateToDelete) return;
    setError("");
    setIsDeleting(true);
    try {
      await candidatesApi.delete(candidateToDelete.id);
      setCandidates(candidates.filter((c) => c.id !== candidateToDelete.id));
      setCandidateToDelete(null);
    } catch (err: any) {
      setError(err.message || "Failed to delete");
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 p-6 text-center text-gray-400">
        Loading...
      </div>
    );
  }

  const filteredCandidates = candidates
    .filter((candidate) =>
      statusFilter === "all" ? true : candidate.status === statusFilter,
    )
    .filter((candidate) =>
      candidate.cvFileName.toLowerCase().includes(search.toLowerCase()),
    )
    .sort((a, b) =>
      sortOrder === "desc"
        ? b.matchScore - a.matchScore
        : a.matchScore - b.matchScore,
    );

  const totalPages = Math.max(1, Math.ceil(filteredCandidates.length / pageSize));
  const paginatedCandidates = filteredCandidates.slice(
    (page - 1) * pageSize,
    page * pageSize,
  );

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <button
        onClick={() => navigate("/jobs")}
        className="text-blue-400 hover:text-blue-300 mb-6"
      >
        ← Back to Jobs
      </button>

      <div className="flex items-center justify-between mb-2">
        <h1 className="text-3xl font-bold text-white">{jobTitle}</h1>
        <button
          onClick={() => setShowUploadModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          + Upload CV
        </button>
      </div>
      <h2 className="text-lg text-gray-300 mb-8">Candidates</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by filename..."
          className="bg-gray-800 border border-gray-700 rounded px-3 py-2 text-gray-200"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-gray-800 border border-gray-700 rounded px-3 py-2 text-gray-200"
        >
          <option value="all">All statuses</option>
          <option value="uploaded">Uploaded</option>
          <option value="processing">Processing</option>
          <option value="parsed">Parsed</option>
          <option value="matched">Matched</option>
          <option value="failed">Failed</option>
          <option value="awaiting-interview">Awaiting interview</option>
          <option value="rejected">Rejected</option>
        </select>
        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value as "desc" | "asc")}
          className="bg-gray-800 border border-gray-700 rounded px-3 py-2 text-gray-200"
        >
          <option value="desc">Score: high to low</option>
          <option value="asc">Score: low to high</option>
        </select>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-900 text-red-200 rounded">{error}</div>
      )}

      {filteredCandidates.length === 0 ? (
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
              {paginatedCandidates.map((candidate) => (
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
                      onClick={() => setCandidateToDelete(candidate)}
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

      {!isLoading && filteredCandidates.length > pageSize && (
        <div className="mt-6 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="px-3 py-2 rounded bg-gray-800 hover:bg-gray-700 disabled:bg-gray-800 text-gray-200 disabled:text-gray-500"
          >
            Prev
          </button>
          <div className="text-sm text-gray-400">
            Page {page} / {totalPages}
          </div>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="px-3 py-2 rounded bg-gray-800 hover:bg-gray-700 disabled:bg-gray-800 text-gray-200 disabled:text-gray-500"
          >
            Next
          </button>
        </div>
      )}

      {candidateToDelete && (
        <ConfirmModal
          title="Delete candidate?"
          message={`This will permanently delete "${candidateToDelete.cvFileName}".`}
          confirmText="Delete"
          variant="danger"
          isLoading={isDeleting}
          onCancel={() => (isDeleting ? null : setCandidateToDelete(null))}
          onConfirm={handleConfirmDelete}
        />
      )}

      {showUploadModal && jobId && (
        <CVUploadModal
          jobId={jobId}
          onSuccess={(payload) =>
            navigate(`/candidates/${payload.candidateId}`)
          }
          onClose={() => {
            setShowUploadModal(false);
            fetchData();
          }}
        />
      )}
    </div>
  );
}
