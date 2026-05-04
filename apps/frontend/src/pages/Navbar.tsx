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
    location.pathname.startsWith(path) ? "text-blue-400" : "text-gray-300";

  return (
    <nav className="bg-gray-800 border-b border-gray-700 p-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-8">
          <h1
            onClick={() => navigate("/dashboard")}
            className="text-2xl font-bold text-white cursor-pointer hover:text-blue-400"
          >
            AIRecruiter
          </h1>
          <div className="flex space-x-6">
            <button
              onClick={() => navigate("/dashboard")}
              className={`${isActive("/dashboard")} hover:text-blue-400`}
            >
              Dashboard
            </button>
            {(currentUser?.role === "recruiter" ||
              currentUser?.role === "admin") && (
              <button
                onClick={() => navigate("/jobs")}
                className={`${isActive("/jobs")} hover:text-blue-400`}
              >
                Jobs
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <span className="text-gray-300">
            {currentUser?.firstName} {currentUser?.lastName}
          </span>
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
