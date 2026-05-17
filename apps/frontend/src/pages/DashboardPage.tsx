import { useAuth } from "../context/AuthContext";
import { TechLeadDashboard } from "./dashboard/TechLeadDashboard";
import { RecruiterDashboard } from "./dashboard/RecruiterDashboard";

export function DashboardPage() {
  const { currentUser } = useAuth();

  if (currentUser?.role === "tech_lead") {
    return <TechLeadDashboard />;
  }

  return <RecruiterDashboard />;
}
