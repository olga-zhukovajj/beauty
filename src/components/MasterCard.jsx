import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getServices } from "../api/api";
import { getToken } from "../storage/auth";

function MasterCard({ master }) {
  const navigate = useNavigate();
  const token = getToken();
  const [services, setServices] = useState([]);

  useEffect(() => {
    async function loadServices() {
      try {
        const data = await getServices(master.id, token);
        setServices(data.slice(0, 3)); // показываем только 3 услуги
      } catch {
        setServices([]);
      }
    }

    loadServices();
  }, [master.id]);

  return (
    <div
      style={{
        border: "1px solid #ddd",
        borderRadius: "12px",
        padding: "20px",
        background: "#fff",
        boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
        transition: "0.2s",
      }}
    >
      <h3 style={{ marginBottom: "5px" }}>{master.name}</h3>
      <p style={{ color: "#777", fontSize: "14px" }}>{master.email}</p>

      <div style={{ marginTop: "10px" }}>
        <strong>Доступные услуги:</strong>

        {services.length === 0 && (
          <p style={{ fontSize: "14px", color: "#999" }}>
            Услуги пока не добавлены
          </p>
        )}

        {services.map((s) => (
          <div
            key={s.id}
            style={{
              fontSize: "14px",
              marginTop: "4px",
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <span>{s.title}</span>
            <span>{s.price} ₽</span>
          </div>
        ))}
      </div>

      <button
        onClick={() => navigate(`/master/${master.id}`)}
        style={{
          marginTop: "15px",
          padding: "8px 12px",
          borderRadius: "8px",
          border: "none",
          background: "#4f46e5",
          color: "white",
          cursor: "pointer",
        }}
      >
        Открыть профиль
      </button>
    </div>
  );
}

export default MasterCard;