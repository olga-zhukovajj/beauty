import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getToken } from "../storage/auth";
import { getServices, addService, removeService } from "../api/api";

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
    <div>
      <h2>Услуги мастера</h2>
      <form onSubmit={handleAdd}>
        <input name="title" placeholder="Название услуги" value={form.title} onChange={handleChange} required />
        <input name="duration" placeholder="Длительность (мин)" type="number" value={form.duration} onChange={handleChange} required />
        <input name="price" placeholder="Цена" type="number" value={form.price} onChange={handleChange} required />
        <button type="submit">Добавить услугу</button>
      </form>

      <ul>
        {services.map(s => (
          <li key={s.id}>
            {s.title} — {s.duration} мин — {s.price} ₽
            <button onClick={() => handleRemove(s.id)}>Удалить</button>
          </li>
        ))}
      </ul>

      <button onClick={() => navigate(`/master/${masterId}`)}>← Вернуться в профиль</button>
    </div>
  );
}

export default ServicesPage;