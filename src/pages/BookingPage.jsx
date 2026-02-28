import { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { getCurrentUser } from "../storage/currentUser";
import { getAvailableSlots } from "../utils/slotGenerator";
import { addAppointment } from "../storage/appointments";
import { useNavigate } from "react-router-dom";

function BookingPage({ selectedService }) {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [slots, setSlots] = useState([]);

  // Генерация слотов при выборе даты
  useEffect(() => {
    if (!user || !selectedService) return; // Проверка важна!

    const dateStr = selectedDate.toISOString().split("T")[0];
    const available = getAvailableSlots(
      user.id,
      dateStr,
      selectedService.duration
    );
    setSlots(available);
  }, [selectedDate, user?.id, selectedService]);

  // Клик на слот = создание записи
  const handleBook = (slot) => {
    if (!user || !selectedService) return;

    const dateStr = selectedDate.toISOString().split("T")[0];

    addAppointment({
      id: crypto.randomUUID(),
      masterId: user.id,
      serviceId: selectedService.id,
      date: dateStr,
      startTime: slot.start,
      endTime: slot.end,
    });

    alert(`Вы записаны на ${slot.start} - ${slot.end}`);
    setSlots((prev) => prev.filter((s) => s.start !== slot.start)); // убрать слот после записи
  };

  // Подсветка дней календаря
  const tileClassName = ({ date, view }) => {
    if (view !== "month" || !selectedService) return "";

    const dateStr = date.toISOString().split("T")[0];
    const available = getAvailableSlots(user.id, dateStr, selectedService.duration);

    if (!available.length) return "full-day"; // занято или выходной
    return "available-day"; // есть свободные слоты
  };

  // Если услуга не выбрана
  if (!selectedService) {
    return (
      <div style={{ maxWidth: 600, margin: "20px auto", fontFamily: "Arial" }}>
        <button
          onClick={() => navigate("/")}
          style={{ marginBottom: 20, padding: "5px 10px", cursor: "pointer" }}
        >
          ← Вернуться на главную
        </button>
        <p>Пожалуйста, выберите услугу.</p>
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={() => navigate("/")}
         >
        ← Вернуться на главную
      </button>

      <h2>Выберите дату</h2>
      <Calendar
        onChange={setSelectedDate}
        value={selectedDate}
        tileClassName={tileClassName}
      />

      <h3>Свободные слоты</h3>
      {slots.length === 0 && <p>Свободных слотов нет</p>}
      <div style={{ display: "flex", flexWrap: "wrap", marginTop: 10 }}>
        {slots.map((slot) => (
          <button
            key={slot.start}
            onClick={() => handleBook(slot)}
            style={{
              margin: "5px",
              padding: "10px 15px",
              cursor: "pointer",
              backgroundColor: "#4CAF50",
              color: "white",
              border: "none",
              borderRadius: 4,
            }}
          >
            {slot.start} - {slot.end}
          </button>
        ))}
      </div>

    </div>
  );
}

export default BookingPage;