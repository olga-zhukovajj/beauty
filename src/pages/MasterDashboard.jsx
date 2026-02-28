import { useNavigate } from "react-router-dom";
import { getCurrentUser, logout } from "../storage/currentUser";

function MasterDashboard() {
  const navigate = useNavigate();
  const user = getCurrentUser();

  if (!user || user.role !== "master") {
    return <p>Доступ запрещён</p>;
  }

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div style={{ padding: "30px", maxWidth: "600px", margin: "0 auto" }}>
      <h2>Панель мастера</h2>

      <div
        style={{
          border: "1px solid #ddd",
          padding: "15px",
          borderRadius: "8px",
          marginBottom: "20px"
        }}
      >
        <h3>{user.name}</h3>
        <p>{user.email}</p>
        <p>{user.phone}</p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        <button onClick={() => navigate(`/master/${user.id}`)}>
          Мой профиль
        </button>

        <button onClick={() => navigate("/services")}>
          Управление услугами
        </button>

        <button onClick={() => navigate("/schedule")}>
          Управление расписанием
        </button>

        <button
          onClick={handleLogout}
          style={{ marginTop: "20px", backgroundColor: "#f44336", color: "white" }}
        >
          Выйти
        </button>
      </div>
    </div>
  );
}

export default MasterDashboard;