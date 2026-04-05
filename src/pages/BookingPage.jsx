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
  const [selectedServices, setSelectedServices] = useState([]);
  const [slots, setSlots] = useState([]);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

  // загрузка услуг
  useEffect(() => {

    async function loadServices() {
      try {
        const data = await getServices(masterId, token);
        setServices(data);
      } catch (err) {
        console.error(err);
      }
    }

    loadServices();

  }, [masterId]);

  // суммарная длительность
  const totalDuration = selectedServices.reduce(
    (sum, s) => sum + s.duration,
    0
  );

  // загрузка слотов
  useEffect(() => {

    async function loadSlots() {

      if (!totalDuration || !date) return;

      try {
        const data = await getAvailableSlots(masterId, totalDuration, date);
        setSlots(data);
      } catch (err) {
        console.error(err);
      }

    }

    loadSlots();

  }, [totalDuration, date]);

  // выбор услуги
  const handleServiceChange = (service, checked) => {

    if (checked) {
      setSelectedServices(prev => [...prev, service]);
    } else {
      setSelectedServices(prev =>
        prev.filter(s => s.id !== service.id)
      );
    }

  };

  // запись
  const handleBooking = async () => {

    if (selectedServices.length === 0) {
      alert("Выберите хотя бы одну услугу");
      return;
    }

    if (!date) {
      alert("Выберите дату");
      return;
    }

    if (!time) {
      alert("Выберите время");
      return;
    }

    try {

      // ⚠️ пока отправляем первую услугу (упрощение)
      await createAppointment({
        masterId,
        serviceId: selectedServices[0].id,
        date,
        time,
        clientName: currentUser?.name || "клиент"
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

      {/* УСЛУГИ */}
      <div>

        <h3>Выберите услуги:</h3>

        {services.map(service => (

          <div key={service.id}>
            <label>

              <input
                type="checkbox"
                onChange={(e) =>
                  handleServiceChange(service, e.target.checked)
                }
              />

              {service.title} — {service.price} ₽ ({service.duration} мин)

            </label>
          </div>

        ))}

      </div>

      {/* ИТОГ */}
      <div style={{ marginTop: "10px" }}>
        <strong>Общая длительность: {totalDuration} мин</strong>
      </div>

      {/* КАЛЕНДАРЬ */}
      <div style={{ marginTop: "20px" }}>

        <h3>Выберите дату:</h3>

        <Calendar
          masterId={masterId}
          duration={totalDuration}
          onSelectDate={setDate}
          getAvailableSlots={getAvailableSlots}
        />

      </div>

      {/* СЛОТЫ */}
      <div style={{ marginTop: "20px" }}>

        <h3>Доступное время</h3>

        {slots.length === 0 && <p>Нет свободных слотов</p>}

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

      {/* КНОПКА */}
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