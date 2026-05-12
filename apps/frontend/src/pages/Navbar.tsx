import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isActive = (path: string) =>
    location.pathname.startsWith(path)
      ? "text-white bg-slate-800/90 ring-1 ring-slate-600/80"
      : "text-slate-400 hover:text-white hover:bg-slate-800/50";

  return (
    <nav className="sticky top-0 z-40 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center gap-6">
          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="text-left text-xl font-bold tracking-tight text-white transition hover:text-blue-300"
          >
            AIRecruiter
          </button>
          <div className="flex flex-wrap items-center gap-1">
            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition ${isActive("/dashboard")}`}
            >
              Dashboard
            </button>
            {(currentUser?.role === "recruiter" ||
              currentUser?.role === "admin") && (
              <button
                type="button"
                onClick={() => navigate("/jobs")}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition ${isActive("/jobs")}`}
              >
                Jobs
              </button>
            )}
            {currentUser?.role === "admin" && (
              <button
                type="button"
                onClick={() => navigate("/admin/users")}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition ${isActive("/admin")}`}
              >
                Users
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden text-sm text-slate-400 sm:inline">
            <span className="font-medium text-slate-200">
              {currentUser?.firstName} {currentUser?.lastName}
            </span>
            <span className="ml-2 rounded-md bg-slate-800 px-2 py-0.5 text-xs text-slate-400">
              {currentUser?.role}
            </span>
          </span>
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-lg bg-rose-600/90 px-3 py-2 text-sm font-semibold text-white transition hover:bg-rose-500"
          >
            Log out
          </button>
        </div>
      </div>
    </nav>
  );
}
