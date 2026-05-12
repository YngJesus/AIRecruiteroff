import React, { useEffect, useMemo, useState } from "react";
import { usersApi, type AdminUser, type UserRole } from "../../api/users";
import { ConfirmModal } from "../../components/ui/ConfirmModal";
import { PageShell, fieldClass } from "../../components/layout/PageShell";

const roleLabel: Record<UserRole, string> = {
  admin: "Admin",
  recruiter: "Recruiter",
  tech_lead: "Tech Lead",
};

export function UsersManagementPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    role: "recruiter" as UserRole,
  });
  const [isCreating, setIsCreating] = useState(false);

  const [userToDelete, setUserToDelete] = useState<AdminUser | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const load = async () => {
    setError("");
    setIsLoading(true);
    try {
      const res = await usersApi.getAll();
      setUsers(res.data);
    } catch (err: any) {
      setError(err.message || "Failed to load users");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) => {
      const hay =
        `${u.email} ${u.firstName} ${u.lastName} ${u.role}`.toLowerCase();
      return hay.includes(q);
    });
  }, [users, search]);

  const handleUpdateRole = async (user: AdminUser, role: UserRole) => {
    setError("");
    try {
      const res = await usersApi.update(user.id, { role });
      setUsers((prev) => prev.map((u) => (u.id === user.id ? res.data : u)));
    } catch (err: any) {
      setError(err.message || "Failed to update user");
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!createForm.email.trim() || !createForm.password.trim()) {
      setError("Email and password are required");
      return;
    }
    try {
      setIsCreating(true);
      const res = await usersApi.create(createForm);
      setUsers((prev) => [res.data, ...prev]);
      setShowCreate(false);
      setCreateForm({
        email: "",
        password: "",
        firstName: "",
        lastName: "",
        role: "recruiter",
      });
    } catch (err: any) {
      setError(err.message || "Failed to create user");
    } finally {
      setIsCreating(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;
    setError("");
    setIsDeleting(true);
    try {
      await usersApi.delete(userToDelete.id);
      setUsers((prev) => prev.filter((u) => u.id !== userToDelete.id));
      setUserToDelete(null);
    } catch (err: any) {
      setError(err.message || "Failed to delete user");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <PageShell>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-violet-400/90">
            Administration
          </p>
          <h1 className="mt-1 text-3xl font-bold text-white">Users</h1>
          <p className="mt-1 text-sm text-slate-400">
            Create accounts, assign roles, and remove access.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowCreate(true)}
          className="shrink-0 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-900/25 transition hover:from-blue-500 hover:to-indigo-500"
        >
          + New user
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-rose-800/60 bg-rose-950/50 p-3 text-rose-200">
          {error}
        </div>
      )}

      <div className="mb-4">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, email, role…"
          className={fieldClass}
        />
      </div>

      {isLoading ? (
        <div className="flex items-center gap-3 py-16 text-slate-400">
          <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
          Loading users…
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 py-16 text-center text-slate-400">
          No users found
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-800/80">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="border-b border-slate-800 bg-slate-900/80">
              <tr>
                <th className="px-5 py-3 font-semibold text-slate-400">Name</th>
                <th className="px-5 py-3 font-semibold text-slate-400">Email</th>
                <th className="px-5 py-3 font-semibold text-slate-400">Role</th>
                <th className="px-5 py-3 font-semibold text-slate-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 bg-slate-900/30">
              {filtered.map((u) => (
                <tr key={u.id} className="hover:bg-slate-800/40">
                  <td className="px-5 py-3.5 font-medium text-white">
                    {u.firstName} {u.lastName}
                  </td>
                  <td className="px-5 py-3.5 text-slate-400">{u.email}</td>
                  <td className="px-5 py-3.5">
                    <select
                      value={u.role}
                      onChange={(e) =>
                        handleUpdateRole(u, e.target.value as UserRole)
                      }
                      className={fieldClass}
                    >
                      <option value="recruiter">{roleLabel.recruiter}</option>
                      <option value="tech_lead">{roleLabel.tech_lead}</option>
                      <option value="admin">{roleLabel.admin}</option>
                    </select>
                  </td>
                  <td className="px-5 py-3.5">
                    <button
                      type="button"
                      onClick={() => setUserToDelete(u)}
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

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-slate-700/80 bg-slate-900/95 p-6 shadow-2xl">
            <h2 className="text-xl font-semibold text-white">New user</h2>
            <p className="mt-1 text-sm text-slate-400">
              Creates a full account (same as API registration flow).
            </p>
            <form onSubmit={handleCreate} className="mt-5 space-y-3">
              <input
                value={createForm.email}
                onChange={(e) =>
                  setCreateForm((p) => ({ ...p, email: e.target.value }))
                }
                placeholder="Email"
                className={fieldClass}
              />
              <input
                value={createForm.password}
                onChange={(e) =>
                  setCreateForm((p) => ({ ...p, password: e.target.value }))
                }
                placeholder="Password (min 6 chars)"
                type="password"
                className={fieldClass}
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  value={createForm.firstName}
                  onChange={(e) =>
                    setCreateForm((p) => ({ ...p, firstName: e.target.value }))
                  }
                  placeholder="First name"
                  className={fieldClass}
                />
                <input
                  value={createForm.lastName}
                  onChange={(e) =>
                    setCreateForm((p) => ({ ...p, lastName: e.target.value }))
                  }
                  placeholder="Last name"
                  className={fieldClass}
                />
              </div>
              <select
                value={createForm.role}
                onChange={(e) =>
                  setCreateForm((p) => ({
                    ...p,
                    role: e.target.value as UserRole,
                  }))
                }
                className={fieldClass}
              >
                <option value="recruiter">{roleLabel.recruiter}</option>
                <option value="tech_lead">{roleLabel.tech_lead}</option>
                <option value="admin">{roleLabel.admin}</option>
              </select>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => (isCreating ? null : setShowCreate(false))}
                  disabled={isCreating}
                  className="rounded-xl border border-slate-600 bg-slate-800/80 px-4 py-2 text-sm font-semibold text-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                >
                  {isCreating ? "Creating…" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {userToDelete && (
        <ConfirmModal
          title="Delete user?"
          message={`This will permanently delete "${userToDelete.email}".`}
          confirmText="Delete"
          variant="danger"
          isLoading={isDeleting}
          onCancel={() => (isDeleting ? null : setUserToDelete(null))}
          onConfirm={handleConfirmDelete}
        />
      )}
    </PageShell>
  );
}
