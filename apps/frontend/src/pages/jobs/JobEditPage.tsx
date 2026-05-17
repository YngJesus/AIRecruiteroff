import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { jobsApi, type Job } from "../../api/jobs";
import {
  PageShell,
  fieldClass,
  labelClass,
} from "../../components/layout/PageShell";

type Skill = Job["requiredSkills"][number];
const selectClass = `${fieldClass} py-2`;

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
        const response = await jobsApi.findOne(jobId);
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
        setJob(null);
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
      <PageShell maxWidthClass="max-w-2xl">
        <div className="flex items-center gap-3 py-20 text-slate-400">
          <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
          Loading job…
        </div>
      </PageShell>
    );
  }

  if (!job) {
    return (
      <PageShell maxWidthClass="max-w-2xl">
        <p className="py-20 text-center text-rose-400">Job not found</p>
      </PageShell>
    );
  }

  return (
    <PageShell maxWidthClass="max-w-2xl">
      <p className="text-xs font-semibold uppercase tracking-widest text-blue-400/90">
        Edit posting
      </p>
      <h1 className="mt-1 text-3xl font-bold text-white">Edit job</h1>
      <p className="mt-1 text-sm text-slate-400">{job.title}</p>

      {error && (
        <div className="mt-6 rounded-xl border border-rose-800/60 bg-rose-950/50 p-3 text-rose-200">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        <div>
          <label className={labelClass}>Job title *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={fieldClass}
            placeholder="e.g. Senior React Developer"
          />
        </div>

        <div>
          <label className={labelClass}>Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={`${fieldClass} min-h-[120px] resize-y`}
            placeholder="Job description…"
            rows={4}
          />
        </div>

        <div>
          <label className={labelClass}>Skills *</label>
          <div className="space-y-3">
            {skills.map((skill, idx) => (
              <div
                key={idx}
                className="flex flex-col gap-2 rounded-xl border border-slate-800/80 bg-slate-900/40 p-3 sm:flex-row sm:flex-wrap"
              >
                <input
                  type="text"
                  value={skill.skill}
                  onChange={(e) =>
                    handleSkillChange(idx, "skill", e.target.value)
                  }
                  className={`${fieldClass} sm:min-w-[140px] sm:flex-1`}
                  placeholder="Skill name"
                />
                <select
                  value={skill.level}
                  onChange={(e) =>
                    handleSkillChange(idx, "level", e.target.value as any)
                  }
                  className={selectClass}
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
                  className={selectClass}
                >
                  <option value="required">Required</option>
                  <option value="nice-to-have">Nice-to-have</option>
                </select>
                {skills.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(idx)}
                    className="rounded-xl bg-rose-600/90 px-3 py-2 text-sm font-semibold text-white"
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
            className="mt-3 text-sm font-medium text-blue-400 hover:text-blue-300"
          >
            + Add skill
          </button>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="submit"
            disabled={isSaving || !canSubmit}
            className="flex-1 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-900/25 transition hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50"
          >
            {isSaving ? "Saving…" : "Save changes"}
          </button>
          <button
            type="button"
            onClick={() => navigate("/jobs")}
            className="flex-1 rounded-xl border border-slate-600 bg-slate-800/60 py-2.5 text-sm font-semibold text-slate-200 hover:bg-slate-800"
          >
            Cancel
          </button>
        </div>
      </form>
    </PageShell>
  );
}
