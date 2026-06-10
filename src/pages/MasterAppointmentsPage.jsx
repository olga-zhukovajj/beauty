import { useEffect, useState } from "react";
import {
  getMasterAppointments,
  completeAppointment
} from "../api/api";
import { getCurrentUser } from "../storage/auth";

function MasterAppointmentsPage() {

  const [appointments, setAppointments] = useState([]);

  const currentUser = getCurrentUser();

  async function loadAppointments() {

    try {

      const data = await getMasterAppointments(
        currentUser.id
      );

      setAppointments(data);
      console.log(data);

    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    loadAppointments();
  }, []);

  async function handleComplete(id) {

    try {

      await completeAppointment(id);

      loadAppointments();

    } catch (error) {
      console.error(error);
    }
  }
 function formatDate(date) {
    return new Date(date).toLocaleDateString("ru-RU");
 }

 const formatTime = (t) => t?.slice(0, 5);

  return (
    <div style={{ padding: "20px" }}>
      <h2>Мои записи</h2>

      {appointments.map((item) => (

        <div
          key={item.id}
          style={{
            border: "1px solid #ddd",
            padding: "15px",
            marginBottom: "10px",
            borderRadius: "10px"
          }}
        >

          <p>
            <strong>Услуги:</strong> {item.services}
          </p>

          <p>
            Клиент: {item.client_name}
          </p>

          <p>
            Дата: {formatDate(item.appointment_date)}
          </p>

          <p>
            Время: {formatTime(item.start_time)}
          </p>

            <p>
            Стоимость: {item.service_price} ₽
            </p>

            <p>
            Длительность: {item.service_duration} мин
            </p>

            <p>
            Статус:
            {" "}
            {item.status === "scheduled"
                ? "🟡 Запланирована"
                : "🟢 Выполнена"}
            </p>

            {item.client_comment && (
            <div
                style={{
                background: "#f8f8f8",
                padding: "10px",
                borderRadius: "8px",
                marginTop: "10px"
                }}
            >
                <strong>Комментарий клиента:</strong>
                <br />
                {item.client_comment}
            </div>
            )}

          {item.status === "scheduled" && (
            <button
              onClick={() => handleComplete(item.id)}
            >
              Услуга оказана
            </button>
          )}

        </div>

      ))}

    </div>
  );
}

export default MasterAppointmentsPage;