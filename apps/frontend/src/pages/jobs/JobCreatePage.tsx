import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { jobsApi } from "../../api/jobs";
import {
  PageShell,
  fieldClass,
  labelClass,
} from "../../components/layout/PageShell";

interface Skill {
  skill: string;
  level: "junior" | "mid" | "senior";
  priority: "required" | "nice-to-have";
}

const selectClass = `${fieldClass} py-2`;

export function JobCreatePage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [skills, setSkills] = useState<Skill[]>([
    { skill: "", level: "mid", priority: "required" },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

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
    newSkills[idx] = { ...newSkills[idx], [field]: value };
    setSkills(newSkills);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!title.trim()) {
      setError("Title is required");
      return;
    }

    if (skills.some((s) => !s.skill.trim())) {
      setError("All skills must have a name");
      return;
    }

    try {
      setIsLoading(true);
      await jobsApi.create({
        title,
        description,
        requiredSkills: skills,
      } as any);
      navigate("/jobs");
    } catch (err: any) {
      setError(err.message || "Failed to create job");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageShell maxWidthClass="max-w-2xl">
      <p className="text-xs font-semibold uppercase tracking-widest text-blue-400/90">
        New posting
      </p>
      <h1 className="mt-1 text-3xl font-bold text-white">Create job</h1>
      <p className="mt-1 text-sm text-slate-400">
        Define title, description, and weighted skills for matching.
      </p>

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
            placeholder="Role summary, team, stack…"
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
                    className="rounded-xl bg-rose-600/90 px-3 py-2 text-sm font-semibold text-white sm:self-stretch"
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
            disabled={isLoading}
            className="flex-1 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-900/25 transition hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50"
          >
            {isLoading ? "Creating…" : "Create job"}
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
