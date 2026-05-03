import React from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export function DashboardPage() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 p-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-white">AIRecruiter</h1>
          <div className="flex items-center space-x-4">
            <span className="text-gray-300">
              Welcome, {currentUser?.firstName} {currentUser?.lastName}
            </span>
            <span className="text-gray-400 text-sm">({currentUser?.role})</span>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold text-white mb-2">
              Total Jobs
            </h2>
            <p className="text-4xl font-bold text-blue-400">0</p>
          </div>

          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold text-white mb-2">
              Total Candidates
            </h2>
            <p className="text-4xl font-bold text-green-400">0</p>
          </div>

          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold text-white mb-2">
              Avg Match Score
            </h2>
            <p className="text-4xl font-bold text-purple-400">0%</p>
          </div>
        </div>
      </main>
    </div>
  );
}
