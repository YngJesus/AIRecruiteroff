import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { jobsApi, type Job } from "../../api/jobs";

type Skill = Job["requiredSkills"][number];

export function JobEditPage() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState<Job | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [skills, setSkills] = useState<Skill[]>([
    { skill: "", level: "mid", priority: "required" },
  ]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const canSubmit = useMemo(() => {
    if (!title.trim()) return false;
    if (skills.length === 0) return false;
    if (skills.some((s) => !s.skill.trim())) return false;
    return true;
  }, [title, skills]);

  useEffect(() => {
    if (!jobId) return;
    const run = async () => {
      setError("");
      setIsLoading(true);
      try {
        const response = await jobsApi.getById(jobId);
        const data = response.data;
        setJob(data);
        setTitle(data.title ?? "");
        setDescription(data.description ?? "");
        setSkills(
          data.requiredSkills?.length
            ? data.requiredSkills
            : [{ skill: "", level: "mid", priority: "required" }],
        );
      } catch (err: any) {
        setError(err.message || "Failed to load job");
      } finally {
        setIsLoading(false);
      }
    };
    run();
  }, [jobId]);

  const handleAddSkill = () => {
    setSkills([...skills, { skill: "", level: "mid", priority: "required" }]);
  };

  const handleRemoveSkill = (idx: number) => {
    setSkills(skills.filter((_, i) => i !== idx));
  };

  const handleSkillChange = (
    idx: number,
    field: keyof Skill,
    value: string,
  ) => {
    const newSkills = [...skills];
    newSkills[idx] = { ...newSkills[idx], [field]: value } as Skill;
    setSkills(newSkills);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobId) return;
    setError("");

    if (!canSubmit) {
      setError("Please fill out the title and all skills");
      return;
    }

    try {
      setIsSaving(true);
      await jobsApi.update(jobId, {
        title,
        description,
        requiredSkills: skills,
      });
      navigate("/jobs");
    } catch (err: any) {
      setError(err.message || "Failed to update job");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 p-6 text-center text-gray-400">
        Loading...
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-gray-900 p-6 text-center text-red-400">
        Job not found
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-2">Edit Job</h1>
        <p className="text-gray-400 mb-8">{job.title}</p>

        {error && (
          <div className="mb-4 p-3 bg-red-900 text-red-200 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Job Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
              placeholder="e.g., Senior React Developer"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
              placeholder="Job description..."
              rows={4}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Required Skills *
            </label>
            <div className="space-y-3">
              {skills.map((skill, idx) => (
                <div key={idx} className="flex gap-2">
                  <input
                    type="text"
                    value={skill.skill}
                    onChange={(e) =>
                      handleSkillChange(idx, "skill", e.target.value)
                    }
                    className="flex-1 px-4 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                    placeholder="Skill name"
                  />
                  <select
                    value={skill.level}
                    onChange={(e) =>
                      handleSkillChange(idx, "level", e.target.value as any)
                    }
                    className="px-4 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                  >
                    <option value="junior">Junior</option>
                    <option value="mid">Mid</option>
                    <option value="senior">Senior</option>
                  </select>
                  <select
                    value={skill.priority}
                    onChange={(e) =>
                      handleSkillChange(idx, "priority", e.target.value as any)
                    }
                    className="px-4 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                  >
                    <option value="required">Required</option>
                    <option value="nice-to-have">Nice-to-have</option>
                  </select>
                  {skills.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(idx)}
                      className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={handleAddSkill}
              className="mt-2 text-blue-400 hover:text-blue-300"
            >
              + Add Skill
            </button>
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={isSaving || !canSubmit}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-semibold py-2 rounded"
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
            <button
              type="button"
              onClick={() => navigate("/jobs")}
              className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 rounded"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

