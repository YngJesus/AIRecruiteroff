import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jobsApi } from "../../api/jobs";
import type { Job } from "../../api/jobs";

export function JobsListPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setIsLoading(true);
      const response = await jobsApi.getAll();
      setJobs(response.data);
    } catch (err: any) {
      setError(err.message || "Failed to load jobs");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure?")) {
      try {
        await jobsApi.delete(id);
        setJobs(jobs.filter((j) => j.id !== id));
      } catch (err: any) {
        setError(err.message || "Failed to delete job");
      }
    }
  };

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
          {jobs.map((job) => (
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
                        className="bg-blue-900 text-blue-200 px-2 py-1 rounded text-sm"
                      >
                        {skill.skill} ({skill.level})
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => navigate(`/candidates/${job.id}`)}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded"
                  >
                    Candidates
                  </button>
                  <button
                    onClick={() => handleDelete(job.id)}
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
    </div>
  );
}
