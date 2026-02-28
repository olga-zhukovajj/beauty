import { getCurrentUser } from "../storage/currentUser";
import MasterDashboard from "./MasterDashboard";
import ClientDashboard from "./ClientDashboard";

function DashboardPage() {
  const user = getCurrentUser();

  if (!user) {
    return <p>Пользователь не найден</p>;
  }

  if (user.role === "master") {
    return <MasterDashboard />;
  }

  return <ClientDashboard />;
}

export default DashboardPage;