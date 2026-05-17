import { useState, useEffect } from "react";
import { departmentsApi } from "../../api/departments";
import { PageShell, fieldClass, labelClass } from "../../components/layout/PageShell";
import { PageHeader } from "../../components/ui/PageHeader";
import { ConfirmModal } from "../../components/ui/ConfirmModal";

export function AdminDepartmentsPage() {
  const [departments, setDepartments] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({ name: "", description: "" });
  const [depToDelete, setDepToDelete] = useState<any | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadDepartments = async () => {
    try {
      setLoading(true);
      const res = await departmentsApi.findAll();
      setDepartments(res.data);
    } catch (err: any) {
      setError(err.message || "Failed to load departments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadDepartments();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await departmentsApi.create(formData.name, formData.description);
      setFormData({ name: "", description: "" });
      setShowForm(false);
      await loadDepartments();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Failed to create");
    }
  };

  const handleDelete = async () => {
    if (!depToDelete) return;
    setDeleting(true);
    try {
      await departmentsApi.delete(depToDelete.id);
      setDepToDelete(null);
      await loadDepartments();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Failed to delete");
    } finally {
      setDeleting(false);
    }
  };

  const btnPrimary =
    "rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg hover:from-blue-500 hover:to-indigo-500";

  return (
    <PageShell maxWidthClass="max-w-4xl">
      <PageHeader
        eyebrow="Administration"
        title="Departments"
        description="Organize jobs and users by department — e.g. Cyber Security, Engineering."
        actions={
          <button type="button" className={btnPrimary} onClick={() => setShowForm(!showForm)}>
            {showForm ? "Cancel" : "+ New department"}
          </button>
        }
      />

      {error && (
        <div className="mb-6 rounded-xl border border-rose-800/60 bg-rose-950/50 p-4 text-rose-200">
          {error}
        </div>
      )}

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="mb-8 rounded-2xl border border-slate-800/80 bg-slate-900/50 p-6 space-y-4"
        >
          <div>
            <label className={labelClass}>Name</label>
            <input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={fieldClass}
              placeholder="e.g. Cyber Security"
              required
            />
          </div>
          <div>
            <label className={labelClass}>Description</label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className={fieldClass}
              rows={3}
              placeholder="Optional"
            />
          </div>
          <button type="submit" className={btnPrimary}>
            Create department
          </button>
        </form>
      )}

      {loading ? (
        <div className="flex justify-center py-16">
          <span className="h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
        </div>
      ) : departments.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-700 py-12 text-center text-slate-500">
          No departments yet.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {departments.map((dep) => (
            <article
              key={dep.id}
              className="rounded-2xl border border-slate-800/80 bg-slate-900/50 p-5 flex flex-col gap-3"
            >
              <div>
                <h3 className="text-lg font-semibold text-white">{dep.name}</h3>
                {dep.description && (
                  <p className="text-sm text-slate-400 mt-1">{dep.description}</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => setDepToDelete(dep)}
                className="self-start rounded-lg px-3 py-1.5 text-sm font-medium text-rose-400 hover:bg-rose-950/40"
              >
                Delete
              </button>
            </article>
          ))}
        </div>
      )}

      {depToDelete && (
        <ConfirmModal
          title="Delete department?"
          message={`Remove "${depToDelete.name}"? Users and jobs may still reference it.`}
          confirmText="Delete"
          variant="danger"
          isLoading={deleting}
          onCancel={() => !deleting && setDepToDelete(null)}
          onConfirm={handleDelete}
        />
      )}
    </PageShell>
  );
}
