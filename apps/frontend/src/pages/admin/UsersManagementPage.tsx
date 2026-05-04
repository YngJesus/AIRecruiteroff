import React, { useEffect, useMemo, useState } from "react";
import { usersApi, type AdminUser, type UserRole } from "../../api/users";
import { ConfirmModal } from "../../components/ui/ConfirmModal";

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
    load();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) => {
      const hay = `${u.email} ${u.firstName} ${u.lastName} ${u.role}`.toLowerCase();
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
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Users</h1>
          <p className="text-gray-400">Admin-only user management</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          + New User
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-900 text-red-200 rounded">{error}</div>
      )}

      <div className="mb-4">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, email, role..."
          className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-gray-200"
        />
      </div>

      {isLoading ? (
        <div className="text-center text-gray-400">Loading users...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center text-gray-400 py-12">No users found</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-gray-300">
            <thead className="bg-gray-800">
              <tr>
                <th className="px-6 py-3">Name</th>
                <th className="px-6 py-3">Email</th>
                <th className="px-6 py-3">Role</th>
                <th className="px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.id} className="border-b border-gray-700">
                  <td className="px-6 py-4">
                    {u.firstName} {u.lastName}
                  </td>
                  <td className="px-6 py-4">{u.email}</td>
                  <td className="px-6 py-4">
                    <select
                      value={u.role}
                      onChange={(e) =>
                        handleUpdateRole(u, e.target.value as UserRole)
                      }
                      className="bg-gray-800 border border-gray-700 rounded px-3 py-2 text-gray-200"
                    >
                      <option value="recruiter">{roleLabel.recruiter}</option>
                      <option value="tech_lead">{roleLabel.tech_lead}</option>
                      <option value="admin">{roleLabel.admin}</option>
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => setUserToDelete(u)}
                      className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
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
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full border border-gray-700">
            <h2 className="text-xl font-semibold text-white mb-4">New user</h2>
            <form onSubmit={handleCreate} className="space-y-3">
              <input
                value={createForm.email}
                onChange={(e) =>
                  setCreateForm((p) => ({ ...p, email: e.target.value }))
                }
                placeholder="Email"
                className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-gray-200"
              />
              <input
                value={createForm.password}
                onChange={(e) =>
                  setCreateForm((p) => ({ ...p, password: e.target.value }))
                }
                placeholder="Password (min 6 chars)"
                type="password"
                className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-gray-200"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  value={createForm.firstName}
                  onChange={(e) =>
                    setCreateForm((p) => ({ ...p, firstName: e.target.value }))
                  }
                  placeholder="First name"
                  className="bg-gray-900 border border-gray-700 rounded px-3 py-2 text-gray-200"
                />
                <input
                  value={createForm.lastName}
                  onChange={(e) =>
                    setCreateForm((p) => ({ ...p, lastName: e.target.value }))
                  }
                  placeholder="Last name"
                  className="bg-gray-900 border border-gray-700 rounded px-3 py-2 text-gray-200"
                />
              </div>
              <select
                value={createForm.role}
                onChange={(e) =>
                  setCreateForm((p) => ({ ...p, role: e.target.value as UserRole }))
                }
                className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-gray-200"
              >
                <option value="recruiter">{roleLabel.recruiter}</option>
                <option value="tech_lead">{roleLabel.tech_lead}</option>
                <option value="admin">{roleLabel.admin}</option>
              </select>

              <div className="flex gap-3 pt-2 justify-end">
                <button
                  type="button"
                  onClick={() => (isCreating ? null : setShowCreate(false))}
                  disabled={isCreating}
                  className="px-4 py-2 rounded bg-gray-700 hover:bg-gray-600 disabled:bg-gray-700 text-white font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-semibold"
                >
                  {isCreating ? "Creating..." : "Create"}
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
    </div>
  );
}

