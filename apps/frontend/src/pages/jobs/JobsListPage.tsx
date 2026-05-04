import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jobsApi } from "../../api/jobs";
import type { Job } from "../../api/jobs";
import { ConfirmModal } from "../../components/ui/ConfirmModal";

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
    <div className="min-h-screen bg-gray-900 p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white">Job Offers</h1>
        <button
          onClick={() => navigate("/jobs/new")}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded"
        >
          + New Job
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-900 text-red-200 rounded">{error}</div>
      )}

      {isLoading ? (
        <div className="text-center text-gray-400">Loading jobs...</div>
      ) : jobs.length === 0 ? (
        <div className="text-center text-gray-400 py-12">
          No jobs yet. Create your first job offer!
        </div>
      ) : (
        <div className="grid gap-4">
          {paginatedJobs.map((job) => (
            <div key={job.id} className="bg-gray-800 rounded-lg p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-white">
                    {job.title}
                  </h2>
                  <p className="text-gray-400 mt-2">{job.description}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {job.requiredSkills.map((skill, idx) => (
                      <span
                        key={idx}
                        className={`px-2 py-1 rounded text-sm ${
                          skill.priority === "required"
                            ? "bg-blue-900 text-blue-200"
                            : "bg-gray-700 text-gray-200"
                        }`}
                      >
                        {skill.skill} ({skill.level})
                        {skill.priority === "required" ? " • Required" : " • Nice"}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => navigate(`/jobs/${job.id}/candidates`)}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded"
                  >
                    Candidates{typeof job.candidateCount === "number"
                      ? ` (${job.candidateCount})`
                      : ""}
                  </button>
                  <button
                    onClick={() => navigate(`/jobs/${job.id}/edit`)}
                    className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => setJobToDelete(job)}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
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
    </div>
  );
}
