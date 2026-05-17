import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "./components/ui/ProtectedRoute";
import { LoginPage } from "./pages/auth/LoginPage";
import { DashboardPage } from "./pages/DashboardPage";
import { JobsListPage } from "./pages/jobs/JobsListPage";
import { JobCreatePage } from "./pages/jobs/JobCreatePage";
import { JobEditPage } from "./pages/jobs/JobEditPage";
import { useAuth } from "./context/AuthContext";
import { CandidateDetailPage } from "./pages/candidates/CandidateDetailPage";
import { CandidatesListPage } from "./pages/candidates/CandidatesListPage";
import { Navbar } from "./pages/Navbar";
import { AdminDepartmentsPage } from "./pages/admin/AdminDepartmentsPage";
import { AdminUsersPage } from "./pages/admin/AdminUsersPage";
import { TechLeadCalendarPage } from "./pages/techlead/TechLeadCalendarPage";
import { TechLeadReviewsPage } from "./pages/techlead/TechLeadReviewsPage";
import { TechLeadInterviewPrepPage } from "./pages/techlead/TechLeadInterviewPrepPage";

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
                  path="/jobs/:jobId/edit"
                  element={
                    <ProtectedRoute requiredRole={["recruiter", "admin"]}>
                      <JobEditPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/jobs/:jobId/candidates"
                  element={
                    <ProtectedRoute
                      requiredRole={["recruiter", "admin", "tech_lead"]}
                    >
                      <CandidatesListPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/candidates/:candidateId"
                  element={
                    <ProtectedRoute
                      requiredRole={["recruiter", "admin", "tech_lead"]}
                    >
                      <CandidateDetailPage />
                    </ProtectedRoute>
                  }
                />
                {/* Admin Routes */}
                <Route
                  path="/admin/users"
                  element={
                    <ProtectedRoute requiredRole="admin">
                      <AdminUsersPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/departments"
                  element={
                    <ProtectedRoute requiredRole="admin">
                      <AdminDepartmentsPage />
                    </ProtectedRoute>
                  }
                />
                {/* Tech Lead Routes */}
                <Route
                  path="/techlead/questions"
                  element={<Navigate to="/techlead/reviews" replace />}
                />
                <Route
                  path="/techlead/availability"
                  element={<Navigate to="/techlead/calendar" replace />}
                />
                <Route
                  path="/techlead/interviews"
                  element={<Navigate to="/techlead/calendar" replace />}
                />
                <Route
                  path="/techlead/calendar"
                  element={
                    <ProtectedRoute requiredRole="tech_lead">
                      <TechLeadCalendarPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/techlead/reviews"
                  element={
                    <ProtectedRoute requiredRole="tech_lead">
                      <TechLeadReviewsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/techlead/prep"
                  element={
                    <ProtectedRoute requiredRole="tech_lead">
                      <TechLeadInterviewPrepPage />
                    </ProtectedRoute>
                  }
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
