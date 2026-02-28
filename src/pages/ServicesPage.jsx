import { useState, useEffect } from "react";
import { getCurrentUser } from "../storage/currentUser";
import { getServicesForMaster, addServiceForMaster, removeServiceForMaster } from "../storage/services";
import { createService } from "../models/service";
import { useNavigate } from "react-router-dom";

function ServicesPage() {
  const navigate = useNavigate();
  const [user] = useState (() => getCurrentUser());
  const [services, setServices] = useState([]);
  const [form, setForm] = useState({ title: "", duration: "", price: "" });

    useEffect(() => {
        if (!user) return;

        const services = getServicesForMaster(user.id);
        setServices(services);
    }, [user?.id]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAdd = (e) => {
    e.preventDefault();
    const newService = createService({
      title: form.title,
      duration: Number(form.duration),
      price: Number(form.price)
    });
    addServiceForMaster(user.id, newService);
    setServices(getServicesForMaster(user.id));
    setForm({ title: "", duration: "", price: "" });
  };

  const handleRemove = (id) => {
    removeServiceForMaster(user.id, id);
    setServices(getServicesForMaster(user.id));
  };


  const goBack = () => {
    navigate("/dashboard"); 
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
        {services.map((s) => (
          <li key={s.id}>
            {s.title} — {s.duration} мин — {s.price} ₽
            <button onClick={() => handleRemove(s.id)}>Удалить</button>
          </li>
        ))}
      </ul>
      <button onClick={goBack}>← Вернуться на главную</button>
    </div>
  );
}

export default ServicesPage;
