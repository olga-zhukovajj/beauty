import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getServices } from "../api/api";
import { getToken } from "../storage/auth";
import "../styles/pages/MasterCard.css";

function MasterCard({ master }) {
  const navigate = useNavigate();
  const token = getToken();
  const [services, setServices] = useState([]);

  useEffect(() => {
    async function loadServices() {
      try {
        const data = await getServices(master.id, token);
        setServices(data.slice(0, 3));
      } catch {
        setServices([]);
      }
    }

    loadServices();
  }, [master.id]);

  return (
    <div className="master-card">

      <div className="card-header">
        <div className="avatar">
          {master.name?.[0] || "M"}
        </div>

        <div className="master-info">
          <h3>{master.name}</h3>
          <p>{master.email}</p>
        </div>
      </div>

      <div className="services">
        <span className="label">Услуги</span>

        {services.length === 0 ? (
          <p className="empty">Пока нет услуг</p>
        ) : (
          services.map((s) => (
            <div className="service-item" key={s.id}>
              <span>{s.title}</span>
              <span>{s.price} ₽</span>
            </div>
          ))
        )}
      </div>

      <button
        className="open-btn"
        onClick={() => navigate(`/master/${master.id}`)}
      >
        Открыть профиль
      </button>

    </div>
  );
}

export default MasterCard;