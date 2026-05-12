import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jobsApi } from "../../api/jobs";
import type { Job } from "../../api/jobs";
import { ConfirmModal } from "../../components/ui/ConfirmModal";
import { PageShell } from "../../components/layout/PageShell";

export function JobsListPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [jobToDelete, setJobToDelete] = useState<Job | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 6;
  const navigate = useNavigate();

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setIsLoading(true);
      const response = await jobsApi.getAll();
      setJobs(response.data);
      setPage(1);
    } catch (err: any) {
      setError(err.message || "Failed to load jobs");
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!jobToDelete) return;
    setError("");
    setIsDeleting(true);
    try {
      await jobsApi.delete(jobToDelete.id);
      setJobs(jobs.filter((j) => j.id !== jobToDelete.id));
      setJobToDelete(null);
    } catch (err: any) {
      setError(err.message || "Failed to delete job");
    } finally {
      setIsDeleting(false);
    }
  };

  const totalPages = Math.max(1, Math.ceil(jobs.length / pageSize));
  const paginatedJobs = jobs.slice((page - 1) * pageSize, page * pageSize);

  return (
    <PageShell>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-blue-400/90">
            Open roles
          </p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-white">
            Job offers
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Manage postings, skills, and applicants in one place.
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate("/jobs/new")}
          className="shrink-0 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-900/30 transition hover:from-blue-500 hover:to-indigo-500"
        >
          + New job
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-rose-800/60 bg-rose-950/50 p-3 text-rose-200">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center gap-3 py-16 text-slate-400">
          <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
          Loading jobs…
        </div>
      ) : jobs.length === 0 ? (
        <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 py-16 text-center text-slate-400">
          No jobs yet. Create your first job offer.
        </div>
      ) : (
        <div className="grid gap-4">
          {paginatedJobs.map((job) => (
            <div
              key={job.id}
              className="rounded-2xl border border-slate-800/80 bg-slate-900/50 p-6 shadow-lg shadow-black/10 transition hover:border-slate-700"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:justify-between lg:gap-6">
                <div className="min-w-0 flex-1">
                  <h2 className="text-xl font-semibold text-white">{job.title}</h2>
                  <p className="mt-2 line-clamp-2 text-sm text-slate-400">
                    {job.description || "No description"}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {job.requiredSkills.map((skill, idx) => (
                      <span
                        key={idx}
                        className={`rounded-lg px-2.5 py-1 text-xs font-medium ${
                          skill.priority === "required"
                            ? "bg-blue-950/80 text-blue-200 ring-1 ring-blue-800/50"
                            : "bg-slate-800 text-slate-300 ring-1 ring-slate-700"
                        }`}
                      >
                        {skill.skill} ({skill.level})
                        {skill.priority === "required" ? " · Req" : " · Nice"}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 lg:flex-col lg:items-end">
                  <button
                    type="button"
                    onClick={() => navigate(`/jobs/${job.id}/candidates`)}
                    className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-violet-500"
                  >
                    Candidates
                    {typeof job.candidateCount === "number"
                      ? ` (${job.candidateCount})`
                      : ""}
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate(`/jobs/${job.id}/edit`)}
                    className="rounded-xl border border-slate-600 bg-slate-800/60 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:bg-slate-800"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => setJobToDelete(job)}
                    className="rounded-xl bg-rose-600/90 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-500"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!isLoading && jobs.length > pageSize && (
        <div className="mt-8 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="rounded-xl border border-slate-700 bg-slate-800/60 px-4 py-2 text-sm text-slate-200 transition hover:bg-slate-800 disabled:opacity-40"
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
            className="rounded-xl border border-slate-700 bg-slate-800/60 px-4 py-2 text-sm text-slate-200 transition hover:bg-slate-800 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}

      {jobToDelete && (
        <ConfirmModal
          title="Delete job?"
          message={`This will permanently delete "${jobToDelete.title}" and its candidates.`}
          confirmText="Delete"
          variant="danger"
          isLoading={isDeleting}
          onCancel={() => (isDeleting ? null : setJobToDelete(null))}
          onConfirm={handleConfirmDelete}
        />
      )}
    </PageShell>
  );
}
