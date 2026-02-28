import { useNavigate } from "react-router-dom";

function ClientDashboard() {
  const navigate = useNavigate();

  return (
    <div>
      <h2>Панель клиента</h2>

      <button onClick={() => navigate("/services")}>
        Посмотреть услуги
      </button>

      <button onClick={() => navigate("/booking")}>
        Записаться
      </button>
    </div>
  );
}

export default ClientDashboard;