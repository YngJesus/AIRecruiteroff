import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "./components/ui/ProtectedRoute";
import { LoginPage } from "./pages/auth/LoginPage";
import { RegisterPage } from "./pages/auth/RegisterPage";
import { DashboardPage } from "./pages/DashboardPage";
import { JobsListPage } from "./pages/jobs/JobsListPage";
import { JobCreatePage } from "./pages/jobs/JobCreatePage";
import { useAuth } from "./context/AuthContext";
import { CandidateDetailPage } from "./pages/candidates/CandidateDetailPage";
import { CandidatesListPage } from "./pages/candidates/CandidatesListPage";
import { Navbar } from "./pages/Navbar";

export function App() {
  const { isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="bg-gray-900 h-screen flex items-center justify-center text-white">
        Loading...
      </div>
    );
  }
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected Routes */}
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <Navbar />
              <Routes>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route
                  path="/jobs"
                  element={
                    <ProtectedRoute requiredRole={["recruiter", "admin"]}>
                      <JobsListPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/jobs/new"
                  element={
                    <ProtectedRoute requiredRole={["recruiter", "admin"]}>
                      <JobCreatePage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/jobs/:jobId/candidates"
                  element={<CandidatesListPage />}
                />
                <Route
                  path="/candidates/:candidateId"
                  element={<CandidateDetailPage />}
                />
                <Route
                  path="/"
                  element={<Navigate to="/dashboard" replace />}
                />
              </Routes>
            </ProtectedRoute>
          }
        />

        {/* Catch all - redirect to dashboard */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
