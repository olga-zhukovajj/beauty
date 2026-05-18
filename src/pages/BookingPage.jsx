import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { getServices, createAppointment, getAvailableSlots } from "../api/api";
import { getToken, getCurrentUser } from "../storage/auth";
import Calendar from "../components/Calendar";

function BookingPage() {
  const { masterId } = useParams();
  const navigate = useNavigate();

  const token = getToken();
  const currentUser = getCurrentUser();

  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [slots, setSlots] = useState([]);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [comment, setComment] = useState("");

  // ===== УСЛУГИ =====
  useEffect(() => {
    async function loadServices() {
      try {
        const data = await getServices(masterId, token);
        setServices(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Ошибка загрузки услуг", err);
      }
    }

    loadServices();
  }, [masterId]);

  // ===== СЛОТЫ =====
  useEffect(() => {
    async function loadSlots() {

      if (!selectedService || !date) return;

      try {

        const data = await getAvailableSlots(
          masterId,
          selectedService.id,
          date
        );
        console.log("ПРИШЛИ СЛОТЫ:", data); 
        setSlots(data);

      } catch (err) {
        console.error("Ошибка слотов:", err);
      }

    }

    loadSlots();
  }, [selectedService, date]);

  // ===== ЗАПИСЬ =====
  const handleBooking = async () => {
    if (!selectedService) return alert("Выберите услугу");
    if (!date) return alert("Выберите дату");
    if (!time) return alert("Выберите время");

    try {
      await createAppointment({
        masterId,
        serviceId: selectedService.id,
        date,
        time,
        clientName: currentUser?.name || "клиент",
        clientComment: comment
      });

      alert("Запись успешно создана");
      navigate(`/master/${masterId}`);
    } catch (error) {
      console.error(error);
      alert("Ошибка создания записи");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Запись к мастеру</h2>

      {/* ===== УСЛУГИ ===== */}
      <h3>Выберите услугу:</h3>

      {services.map(service => (
        <div key={service.id}>
          <label>
            <input
              type="radio"
              name="service"
              checked={selectedService?.id === service.id}
              onChange={() => setSelectedService(service)}
            />

            {service.title} — {service.price} ₽ ({service.duration} мин)
          </label>
        </div>
      ))}

      {/* ===== ИНФО ===== */}
      {selectedService && (
        <p style={{ marginTop: "10px" }}>
          Длительность: {selectedService.duration} мин
        </p>
      )}

      {/* ===== КАЛЕНДАРЬ ===== */}
      <div style={{ marginTop: "20px" }}>
        <h3>Выберите дату:</h3>
        <Calendar
          masterId={masterId}
          serviceId={selectedService?.id}
          duration={selectedService?.duration || 0}
          onSelectDate={setDate}
          getAvailableSlots={getAvailableSlots}
        />
      </div>

      {/* ===== СЛОТЫ ===== */}
      <div style={{ marginTop: "20px" }}>
        <h3>Доступное время</h3>

        {slots.length === 0 && selectedService && date && (
          <p>Нет свободных слотов</p>
        )}

        {slots.map((slot) => ( 
          <button
            key={slot}
            onClick={() => setTime(slot)}
            style={{
              margin: "5px",
              padding: "8px 12px",
              borderRadius: "8px",
              border: "1px solid #ccc",
              background: time === slot ? "#4f46e5" : "white",
              color: time === slot ? "white" : "black"
            }}
          >
            {slot}
          </button>
        ))}
      </div>

      {/* ===== КОММЕНТ ===== */}
      <textarea
        placeholder="Комментарий (например: чувствительная кожа)"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        style={{
          marginTop: "20px",
          width: "100%",
          height: "80px",
          padding: "10px",
          borderRadius: "8px",
          border: "1px solid #ccc"
        }}
      />

      {/* ===== КНОПКА ===== */}
      <button
        onClick={handleBooking}
        style={{ marginTop: "20px" }}
      >
        Подтвердить запись
      </button>
    </div>
  );
}

export default BookingPage;