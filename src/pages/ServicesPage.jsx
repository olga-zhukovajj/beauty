import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getToken } from "../storage/auth";
import { getServices, addService, removeService } from "../api/api";
import "../styles/pages/ServicesPage.css";

function ServicesPage() {
  const navigate = useNavigate();
  const token = getToken();
  const [services, setServices] = useState([]);
  const [form, setForm] = useState({ title: "", duration: "", price: "" });

  const masterId = JSON.parse(atob(token.split(".")[1])).id;

  useEffect(() => {
    async function fetchServices() {
      try {
        const data = await getServices(masterId, token);
        setServices(data);
      } catch (err) {
        alert(err.message);
      }
    }
    fetchServices();
  }, [masterId, token]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await addService(masterId, form, token);
      const updated = await getServices(masterId, token);
      setServices(updated);
      setForm({ title: "", duration: "", price: "" });
    } catch (err) {
      alert(err.message);
    }
  };

  const handleRemove = async (id) => {
    try {
      await removeService(masterId, id, token);
      const updated = await getServices(masterId, token);
      setServices(updated);
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="services-page">

      <div className="services-header">
        <h2>Услуги</h2>
        <p>Управляй своими услугами и ценами</p>
      </div>

      {/* FORM */}
      <form className="service-form" onSubmit={handleAdd}>

        <input
          name="title"
          placeholder="Название услуги"
          value={form.title}
          onChange={handleChange}
          required
        />

        <input
          name="duration"
          type="number"
          placeholder="Длительность (мин)"
          value={form.duration}
          onChange={handleChange}
          required
        />

        <input
          name="price"
          type="number"
          placeholder="Цена"
          value={form.price}
          onChange={handleChange}
          required
        />

        <button type="submit" className="primary-btn">
          Добавить услугу
        </button>

      </form>

      {/* GRID */}
      <div className="services-grid">

        {services.map((s) => (

          <div key={s.id} className="service-card">

            <div className="service-info">

              <h3>{s.title}</h3>

              <p>
                {s.duration} мин • {s.price} ₽
              </p>

            </div>

            <button
              className="delete-btn"
              onClick={() => handleRemove(s.id)}
            >
              Удалить
            </button>

          </div>

        ))}

      </div>

      <button
        className="back-btn"
        onClick={() => navigate(`/master/${masterId}`)}
      >
        ← Назад в профиль
      </button>

    </div>
  );
}

export default ServicesPage;