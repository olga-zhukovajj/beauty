import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  getServices,
  createAppointment,
  getAvailableSlots
} from "../api/api";
import { getCurrentUser } from "../storage/auth";
import Calendar from "../components/Calendar";
import "../styles/pages/BookingPage.css";

function BookingPage() {
  const { masterId } = useParams();
  const navigate = useNavigate();

  const currentUser = getCurrentUser();

  const [services, setServices] = useState([]);
  const [selectedServices, setSelectedServices] = useState([]);
  const [slots, setSlots] = useState([]);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [comment, setComment] = useState("");

  useEffect(() => {
    async function load() {
      const data = await getServices(masterId);
      setServices(data);
    }
    load();
  }, [masterId]);

  const toggleService = (service) => {
    setSelectedServices((prev) => {
      const exists = prev.find((s) => s.id === service.id);

      if (exists) {
        return prev.filter((s) => s.id !== service.id);
      }

      return [...prev, service];
    });
  };

  useEffect(() => {
    async function loadSlots() {
      if (!date || selectedServices.length === 0) return;

      const data = await getAvailableSlots(masterId, date, totalDuration);
      setSlots(data);
    }

    loadSlots();
  }, [selectedServices, date]);

  async function handleBooking() {
    if (selectedServices.length === 0) return alert("Выбери услуги");
    if (!date) return alert("Выбери дату");
    if (!time) return alert("Выбери время");

    await createAppointment({
      masterId,
      services: selectedServices.map((s) => s.id),
      date,
      time,
      clientId: currentUser.id,
      clientName: currentUser?.name || "клиент",
      clientComment: comment
    });

    navigate(`/master/${masterId}`);
  }

  const totalDuration = selectedServices.reduce(
    (sum, s) => sum + s.duration,
    0
  );

  const totalPrice = selectedServices.reduce(
    (sum, s) => sum + s.price,
    0
  );
  return (
    <div className="booking-page">

      <h2>Запись</h2>

      <div>
        {services.map((service) => (
          <div
            key={service.id}
            onClick={() => toggleService(service)}
            style={{
              padding: 10,
              border: selectedServices.find(s => s.id === service.id)
                ? "2px solid black"
                : "1px solid #ccc",
              cursor: "pointer",
              marginBottom: 8
            }}
          >
            {service.title} — {service.price}₽ — {service.duration} мин
          </div>
        ))}
      </div>

      <p>Итого: {totalPrice} ₽ • {totalDuration} мин</p>

      <Calendar
        masterId={masterId}
        duration={totalDuration}
        onSelectDate={setDate}
        getAvailableSlots={getAvailableSlots}
      />

      <div>
        {slots.map((slot) => (
          <button
            key={slot}
            onClick={() => setTime(slot)}
          >
            {slot.slice(0, 5)}
          </button>
        ))}
      </div>

      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />

      <button onClick={handleBooking}>
        Записаться
      </button>

    </div>
  );
}

export default BookingPage;