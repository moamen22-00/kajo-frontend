// pages/dashboard/DashboardPage.jsx
import { useAuth } from "../../context/AuthContext";
import FeedPage from "../FeedPage/FeedPage";
import SetupPage from "../SetupPage/SetupPage";

import ShelterDashboard from "../../components/dashboard/ShelterDashboard";
import DoctorDashboard from "../../components/dashboard/DoctorDashboard";
import StoreDashboard from "../../components/dashboard/StoreDashboard";

export default function DashboardPage() {
  const { user } = useAuth();
  if (!user) return null;

  // 1️⃣ Verify account setup for business owners
  if (user.role !== "user" && !user.hasSetup) {
    return <SetupPage />;
  }

  // 2️⃣ Regular user
  if (user.role === "user") {
    return <FeedPage />;
  }

  // 3️⃣ Business owners' dashboards
  if (user.role === "shelter-owner") return <ShelterDashboard />;
  if (user.role === "doctor") return <DoctorDashboard />;
  if (user.role === "shop-owner") return <StoreDashboard />;

  return null;
}
