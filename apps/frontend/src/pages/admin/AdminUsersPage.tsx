import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { usersApi, type UserRole } from "../../api/users";
import { departmentsApi } from "../../api/departments";
import {
  PageShell,
  fieldClass,
  labelClass,
} from "../../components/layout/PageShell";
import { PageHeader } from "../../components/ui/PageHeader";
import { ConfirmModal } from "../../components/ui/ConfirmModal";

export function AdminUsersPage() {
  const { currentUser } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userToDelete, setUserToDelete] = useState<any | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [userToEdit, setUserToEdit] = useState<any | null>(null);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState<{
    firstName: string;
    lastName: string;
    role: UserRole;
    departmentId: string;
  } | null>(null);
  const [formData, setFormData] = useState<{
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    departmentId: string;
  }>({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    role: "recruiter",
    departmentId: "",
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [usersRes, depsRes] = await Promise.all([
        usersApi.findAll(),
        departmentsApi.findAll(),
      ]);
      setUsers(usersRes.data);
      setDepartments(depsRes.data);
    } catch (err: any) {
      setError(err.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await usersApi.create(formData);
      setFormData({
        email: "",
        password: "",
        firstName: "",
        lastName: "",
        role: "recruiter",
        departmentId: "",
      });
      setShowForm(false);
      await loadData();
    } catch (err: any) {
      setError(
        err.response?.data?.message || err.message || "Failed to create user",
      );
    }
  };

  const handleDelete = async () => {
    if (!userToDelete) return;
    setDeleting(true);
    try {
      await usersApi.delete(userToDelete.id);
      setUserToDelete(null);
      await loadData();
    } catch (err: any) {
      setError(
        err.response?.data?.message || err.message || "Failed to delete",
      );
    } finally {
      setDeleting(false);
    }
  };

  const handleEditClick = (user: any) => {
    setUserToEdit(user);
    setEditData({
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      role: user.role as UserRole,
      departmentId: user.departmentId || "",
    });
    setEditing(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userToEdit || !editData) return;
    setError("");
    try {
      await usersApi.update(userToEdit.id, editData);
      setUserToEdit(null);
      setEditing(false);
      await loadData();
    } catch (err: any) {
      setError(
        err.response?.data?.message || err.message || "Failed to update user",
      );
    }
  };

  const btnPrimary =
    "rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg hover:from-blue-500 hover:to-indigo-500";

  return (
    <PageShell>
      <PageHeader
        eyebrow="Administration"
        title="Users"
        description="Create HR and tech lead accounts and assign them to departments."
        actions={
          <button
            type="button"
            className={btnPrimary}
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? "Cancel" : "+ Create user"}
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
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className={fieldClass}
                required
              />
            </div>
            <div>
              <label className={labelClass}>Password</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className={fieldClass}
                required
              />
            </div>
            <div>
              <label className={labelClass}>First name</label>
              <input
                value={formData.firstName}
                onChange={(e) =>
                  setFormData({ ...formData, firstName: e.target.value })
                }
                className={fieldClass}
                required
              />
            </div>
            <div>
              <label className={labelClass}>Last name</label>
              <input
                value={formData.lastName}
                onChange={(e) =>
                  setFormData({ ...formData, lastName: e.target.value })
                }
                className={fieldClass}
                required
              />
            </div>
            <div>
              <label className={labelClass}>Role</label>
              <select
                value={formData.role}
                onChange={(e) =>
                  setFormData({ ...formData, role: e.target.value as UserRole })
                }
                className={fieldClass}
              >
                <option value="recruiter">HR (Recruiter)</option>
                <option value="tech_lead">Tech Lead</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Department</label>
              <select
                value={formData.departmentId}
                onChange={(e) =>
                  setFormData({ ...formData, departmentId: e.target.value })
                }
                className={fieldClass}
              >
                <option value="">No department</option>
                {departments.map((dep) => (
                  <option key={dep.id} value={dep.id}>
                    {dep.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <button type="submit" className={btnPrimary}>
            Create user
          </button>
        </form>
      )}

      {editing && userToEdit && editData && (
        <form
          onSubmit={handleEditSubmit}
          className="mb-8 rounded-2xl border border-slate-800/80 bg-slate-900/50 p-6 space-y-4"
        >
          <h3 className="text-white text-lg">Edit {userToEdit.email}</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>First name</label>
              <input
                value={editData.firstName}
                onChange={(e) =>
                  setEditData({ ...editData, firstName: e.target.value })
                }
                className={fieldClass}
                required
              />
            </div>
            <div>
              <label className={labelClass}>Last name</label>
              <input
                value={editData.lastName}
                onChange={(e) =>
                  setEditData({ ...editData, lastName: e.target.value })
                }
                className={fieldClass}
                required
              />
            </div>
            <div>
              <label className={labelClass}>Role</label>
              <select
                value={editData.role}
                onChange={(e) =>
                  setEditData({ ...editData, role: e.target.value as UserRole })
                }
                className={fieldClass}
              >
                <option value="recruiter">HR (Recruiter)</option>
                <option value="tech_lead">Tech Lead</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Department</label>
              <select
                value={editData.departmentId}
                onChange={(e) =>
                  setEditData({ ...editData, departmentId: e.target.value })
                }
                className={fieldClass}
              >
                <option value="">No department</option>
                {departments.map((dep) => (
                  <option key={dep.id} value={dep.id}>
                    {dep.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex gap-3">
            <button type="submit" className={btnPrimary}>
              Save
            </button>
            <button
              type="button"
              className="rounded-xl border px-4 py-2 text-sm"
              onClick={() => {
                setUserToEdit(null);
                setEditing(false);
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="flex justify-center py-16">
          <span className="h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-800/80 bg-slate-900/50 overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-800 bg-slate-800/40 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-3">User</th>
                <th className="px-5 py-3">Role</th>
                <th className="px-5 py-3">Department</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-slate-800/30">
                  <td className="px-5 py-4">
                    <p className="font-medium text-white">{user.email}</p>
                    <p className="text-slate-400">
                      {user.firstName} {user.lastName}
                    </p>
                  </td>
                  <td className="px-5 py-4 capitalize text-slate-300">
                    {user.role === "tech_lead"
                      ? "Tech lead"
                      : user.role === "recruiter"
                        ? "HR"
                        : user.role}
                  </td>
                  <td className="px-5 py-4 text-slate-300">
                    {departments.find((d) => d.id === user.departmentId)
                      ?.name || "—"}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <button
                      type="button"
                      onClick={() => handleEditClick(user)}
                      className="mr-2 rounded-lg px-3 py-1.5 text-sm font-medium text-sky-400 hover:bg-sky-950/50"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      disabled={user.id === currentUser?.id}
                      onClick={() => setUserToDelete(user)}
                      className="rounded-lg px-3 py-1.5 text-sm font-medium text-rose-400 hover:bg-rose-950/50 disabled:opacity-40 disabled:cursor-not-allowed"
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

      {userToDelete && (
        <ConfirmModal
          title="Delete user?"
          message={`Remove ${userToDelete.email}? This cannot be undone.`}
          confirmText="Delete"
          variant="danger"
          isLoading={deleting}
          onCancel={() => !deleting && setUserToDelete(null)}
          onConfirm={handleDelete}
        />
      )}
    </PageShell>
  );
}
