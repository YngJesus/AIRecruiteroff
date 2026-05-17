import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { NotificationBell } from "../components/ui/NotificationBell";

const linkClass = (active: boolean) =>
  active
    ? "text-white bg-gradient-to-r from-blue-600/20 to-violet-600/20 ring-1 ring-slate-600/80"
    : "text-slate-400 hover:text-white hover:bg-slate-800/50";

export function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isActive = (path: string) => location.pathname.startsWith(path);

  const role = currentUser?.role;
  const isTechLead = role === "tech_lead";
  const isHr = role === "recruiter" || role === "admin";

  return (
    <nav className="sticky top-0 z-40 border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center gap-6">
          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="text-left"
          >
            <span className="text-xl font-bold tracking-tight text-white">
              AIRecruiter
            </span>
            <span className="block text-[10px] font-medium uppercase tracking-widest text-slate-500">
              {isTechLead ? "Tech lead" : isHr ? "Hiring" : role}
            </span>
          </button>
          <div className="flex flex-wrap items-center gap-1">
            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition ${linkClass(isActive("/dashboard"))}`}
            >
              Dashboard
            </button>
            {isHr && (
              <button
                type="button"
                onClick={() => navigate("/jobs")}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition ${linkClass(isActive("/jobs"))}`}
              >
                Jobs
              </button>
            )}
            {role === "admin" && (
              <>
                <button
                  type="button"
                  onClick={() => navigate("/admin/users")}
                  className={`rounded-lg px-3 py-2 text-sm font-medium transition ${linkClass(isActive("/admin/users"))}`}
                >
                  Users
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/admin/departments")}
                  className={`rounded-lg px-3 py-2 text-sm font-medium transition ${linkClass(isActive("/admin/departments"))}`}
                >
                  Departments
                </button>
              </>
            )}
            {isTechLead && (
              <>
                <button
                  type="button"
                  onClick={() => navigate("/techlead/reviews")}
                  className={`rounded-lg px-3 py-2 text-sm font-medium transition ${linkClass(isActive("/techlead/reviews"))}`}
                >
                  Reviews
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/techlead/prep")}
                  className={`rounded-lg px-3 py-2 text-sm font-medium transition ${linkClass(isActive("/techlead/prep"))}`}
                >
                  My candidates
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/techlead/calendar")}
                  className={`rounded-lg px-3 py-2 text-sm font-medium transition ${linkClass(isActive("/techlead/calendar") || isActive("/techlead/interviews") || isActive("/techlead/availability"))}`}
                >
                  Calendar
                </button>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <NotificationBell />
          <span className="hidden text-sm text-slate-400 sm:inline">
            <span className="font-medium text-slate-200">
              {currentUser?.firstName} {currentUser?.lastName}
            </span>
            <span className="ml-2 rounded-md bg-slate-800 px-2 py-0.5 text-xs text-slate-400 capitalize">
              {isTechLead ? "Tech Lead" : role === "recruiter" ? "HR" : role}
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
