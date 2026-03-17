import { useAuth } from "../../context/AuthContext";
import { Navigate } from "react-router-dom";

import ShelterSetup from "../../components/setup/ShelterSetup";
import DoctorSetup from "../../components/setup/DoctorSetup";
import StoreSetup from "../../components/setup/StoreSetup";

export default function SetupPage() {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const role = Number(user.role);
  const hasSetup = !!(user.hasSetup ?? user.has_setup);

  if (hasSetup) {
    if (role === 5) {
      return <Navigate to="/app/dashboard" replace />;
    }

    if (role === 3) {
      return <Navigate to="/app/store-dashboard" replace />;
    }

    if (role === 4) {
      return <Navigate to="/app/shelter-dashboard" replace />;
    }

    return <Navigate to="/app/feed" replace />;
  }

  switch (role) {
    case 5:
      return <DoctorSetup />;

    case 3:
      return <StoreSetup />;

    case 4:
      return <ShelterSetup />;

    default:
      return <Navigate to="/app/feed" replace />;
  }
}