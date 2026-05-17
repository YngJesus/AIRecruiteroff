import { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { candidatesApi, type Candidate } from "../../api/candidates";
import { jobsApi } from "../../api/jobs";
import { CVUploadModal } from "../../components/CVUploadModal";
import { ConfirmModal } from "../../components/ui/ConfirmModal";
import { PageShell, fieldClass } from "../../components/layout/PageShell";

const ACTIVE_STATUSES = new Set(["uploaded", "processing", "parsed"]);

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

  const fetchData = useCallback(
    async (opts?: { silent?: boolean }) => {
      if (!jobId) return;
      try {
        if (!opts?.silent) setIsLoading(true);
        const [jobRes, candRes] = await Promise.all([
          jobsApi.findOne(jobId),
          candidatesApi.findAll(jobId),
        ]);
        setJobTitle(jobRes.data.title);
        setCandidates(candRes.data);
        if (!opts?.silent) setPage(1);
      } catch (err: any) {
        setError(err.message || "Failed to load data");
      } finally {
        if (!opts?.silent) setIsLoading(false);
      }
    },
    [jobId],
  );

  useEffect(() => {
    if (!jobId) return;
    void fetchData();
  }, [jobId, fetchData]);

  const pipelineActive = useMemo(
    () => candidates.some((c) => ACTIVE_STATUSES.has(c.status)),
    [candidates],
  );

  useEffect(() => {
    if (!jobId || !pipelineActive) return;
    const t = setInterval(() => void fetchData({ silent: true }), 4000);
    return () => clearInterval(t);
  }, [jobId, pipelineActive, fetchData]);

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
      <PageShell>
        <div className="flex items-center gap-3 py-20 text-slate-400">
          <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
          Loading…
        </div>
      </PageShell>
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

  const totalPages = Math.max(
    1,
    Math.ceil(filteredCandidates.length / pageSize),
  );
  const paginatedCandidates = filteredCandidates.slice(
    (page - 1) * pageSize,
    page * pageSize,
  );

  return (
    <PageShell>
      <button
        type="button"
        onClick={() => navigate("/jobs")}
        className="mb-6 text-sm font-medium text-blue-400 hover:text-blue-300"
      >
        ← Back to jobs
      </button>

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-violet-400/90">
            Applicants
          </p>
          <h1 className="mt-1 text-3xl font-bold text-white">{jobTitle}</h1>
          <p className="mt-1 text-sm text-slate-400">
            List refreshes while CVs are processing.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowUploadModal(true)}
          className="shrink-0 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-900/25 transition hover:from-blue-500 hover:to-indigo-500"
        >
          + Upload CV
        </button>
      </div>

      <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by filename…"
          className={fieldClass}
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className={fieldClass}
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
          className={fieldClass}
        >
          <option value="desc">Score: high to low</option>
          <option value="asc">Score: low to high</option>
        </select>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-rose-800/60 bg-rose-950/50 p-3 text-rose-200">
          {error}
        </div>
      )}

      {filteredCandidates.length === 0 ? (
        <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 py-16 text-center text-slate-400">
          No candidates yet
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-800/80">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="border-b border-slate-800 bg-slate-900/80">
              <tr>
                <th className="px-5 py-3 font-semibold text-slate-400">
                  File name
                </th>
                <th className="px-5 py-3 font-semibold text-slate-400">
                  Match
                </th>
                <th className="px-5 py-3 font-semibold text-slate-400">
                  Status
                </th>
                <th className="px-5 py-3 font-semibold text-slate-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 bg-slate-900/30">
              {paginatedCandidates.map((candidate) => (
                <tr key={candidate.id} className="hover:bg-slate-800/40">
                  <td className="px-5 py-3.5 font-medium text-white">
                    {candidate.cvFileName}
                  </td>
                  <td className="px-5 py-3.5">
                    <span
                      className={`inline-flex rounded-lg px-2.5 py-1 text-xs font-semibold tabular-nums ${
                        candidate.matchScore >= 70
                          ? "bg-emerald-950/80 text-emerald-200 ring-1 ring-emerald-800/40"
                          : candidate.matchScore >= 40
                            ? "bg-amber-950/80 text-amber-200 ring-1 ring-amber-800/40"
                            : "bg-rose-950/80 text-rose-200 ring-1 ring-rose-800/40"
                      }`}
                    >
                      {candidate.matchScore.toFixed(0)}%
                    </span>
                  </td>
                  <td className="px-5 py-3.5 capitalize text-slate-400">
                    {candidate.status.replace(/-/g, " ")}
                  </td>
                  <td className="px-5 py-3.5">
                    <button
                      type="button"
                      onClick={() => navigate(`/candidates/${candidate.id}`)}
                      className="mr-2 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-500"
                    >
                      View
                    </button>
                    <button
                      type="button"
                      onClick={() => setCandidateToDelete(candidate)}
                      className="rounded-lg bg-rose-600/90 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-500"
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
        <div className="mt-8 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="rounded-xl border border-slate-700 bg-slate-800/60 px-4 py-2 text-sm text-slate-200 hover:bg-slate-800 disabled:opacity-40"
          >
            Prev
          </button>
          <div className="text-sm text-slate-400">
            Page {page} / {totalPages}
          </div>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="rounded-xl border border-slate-700 bg-slate-800/60 px-4 py-2 text-sm text-slate-200 hover:bg-slate-800 disabled:opacity-40"
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
            void fetchData({ silent: true });
          }}
        />
      )}
    </PageShell>
  );
}
