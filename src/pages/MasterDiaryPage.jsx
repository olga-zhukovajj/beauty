import { useEffect, useState } from "react";
import { getCurrentUser } from "../storage/auth";
import { getAppointmentsByDate } from "../api/api";

function MasterDiaryPage() {
  const currentUser = getCurrentUser();

  const [date, setDate] = useState(
    new Date().toISOString().slice(0, 10)
  );

  const [appointments, setAppointments] = useState([]);
  const [selectedAppointment, setSelectedAppointment] =
    useState(null);

  async function load() {
    try {
      const data = await getAppointmentsByDate(
        currentUser.id,
        date
      );

      console.log(data);

      setAppointments(data);

      if (data.length > 0) {
        setSelectedAppointment(data[0]);
      } else {
        setSelectedAppointment(null);
      }
    } catch (err) {
      console.error(err);
    }
  }

  

  function getTopPosition(time) {
    const [hours, minutes] = time
      .slice(0, 5)
      .split(":")
      .map(Number);

    const totalMinutes = hours * 60 + minutes;

    return ((totalMinutes - 480) * 100) / 60;
  }

  function getEndTime(startTime, duration) {
    const [h, m] = startTime
      .slice(0, 5)
      .split(":")
      .map(Number);

    const totalMinutes = h * 60 + m + duration;

    const endHours = Math.floor(totalMinutes / 60);
    const endMinutes = totalMinutes % 60;

    return `${String(endHours).padStart(2, "0")}:${String(
      endMinutes
    ).padStart(2, "0")}`;
  }

  function getCurrentTimePosition() {
    const now = new Date();

    const minutes =
      now.getHours() * 60 +
      now.getMinutes();

    return ((minutes - 480) * 100) / 60;
  }
  
  const days = [];

    for (let i = -1; i <= 5; i++) {
      const d = new Date(date);
      d.setDate(d.getDate() + i);

      days.push(d);
    }

  useEffect(() => {
    load();
  }, [date]);

  const hours = [];
  for (let h = 8; h <= 20; h++) {
    hours.push(h);
  }

  const halfHours = [];
  for (let h = 8; h <= 20; h++) {
    halfHours.push(h * 60);
    halfHours.push(h * 60 + 30);
  }

  const today = new Date()
    .toISOString()
    .slice(0, 10);

  return (
    <div
      style={{
        maxWidth: "1400px",
        margin: "0 auto",
        padding: "30px"
      }}
    >
      <h2
        style={{
          marginBottom: "20px"
        }}
      >
        Ежедневник мастера
      </h2>

      <div
        style={{
          display: "flex",
          gap: "10px",
          overflowX: "auto",
          paddingBottom: "10px",
          marginBottom: "20px"
        }}
      >
        {days.map((day) => {
          const dayString = day.toISOString().slice(0, 10);

          const isActive = dayString === date;

          const today = new Date();
          const todayString = today.toISOString().slice(0, 10);

          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayString = yesterday.toISOString().slice(0, 10);

          const tomorrow = new Date();
          tomorrow.setDate(tomorrow.getDate() + 1);
          const tomorrowString = tomorrow.toISOString().slice(0, 10);

          let title = "";
          if (dayString === todayString) title = "Сегодня";
          else if (dayString === yesterdayString) title = "Вчера";
          else if (dayString === tomorrowString) title = "Завтра";

          const dateLabel = day.toLocaleDateString("ru-RU", {
            day: "numeric",
            month: "long",
          });

          return (
            <div
              key={dayString}
              onClick={() => setDate(dayString)}
              style={{
                minWidth: "110px",
                padding: "12px",
                borderRadius: "14px",
                cursor: "pointer",
                textAlign: "center",
                flexShrink: 0,
                background: isActive ? "#ffeed0" : "#fff",
                border: isActive ? "2px solid #ff9800" : "1px solid #ddd",
                boxShadow: "0 2px 8px rgba(0,0,0,0.08)"
              }}
            >
              {title && (
                <div style={{ fontWeight: 600, marginBottom: "4px" }}>
                  {title}, {dateLabel}
                </div>
              )}

              {!title && <div>{dateLabel}</div>}
            </div>
          );
        })}
      </div>

      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        style={{
          padding: "10px",
          borderRadius: "10px",
          border: "1px solid #ddd",
          marginBottom: "20px"
        }}
      />

      <div
        style={{
          display: "flex",
          gap: "15px",
          marginBottom: "25px"
        }}
      >
        <div
          style={{
            background: "#fff",
            padding: "15px 20px",
            borderRadius: "14px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)"
          }}
        >
          Записей: {appointments.length}
        </div>

        <div
          style={{
            background: "#fff",
            padding: "15px 20px",
            borderRadius: "14px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)"
          }}
        >
          Доход:{" "}
          {appointments.reduce(
            (sum, a) =>
              sum + Number(a.service_price),
            0
          )} ₽
        </div>

        <div
          style={{
            background: "#fff",
            padding: "15px 20px",
            borderRadius: "14px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)"
          }}
        >
          Занято:{" "}
          {appointments.reduce(
            (sum, a) =>
              sum + Number(a.service_duration),
            0
          )} мин
        </div>
      </div>

      {appointments.length === 0 ? (
        <div
          style={{
            background: "#fff",
            padding: "40px",
            borderRadius: "16px",
            textAlign: "center"
          }}
        >
          Нет записей на выбранную дату
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 350px",
            gap: "20px"
          }}
        >
          <div
            style={{
              position: "relative",
              border: "1px solid #ddd",
              borderRadius: "16px",
              background: "#fff",
              height: "850px",
              overflowY: "auto"
            }}
          >
            <div
              style={{
                position: "relative",
                height: "1300px"
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  bottom: 0,
                  left: "70px",
                  width: "1px",
                  background: "#ddd"
                }}
              />

              <div
                style={{
                  position: "absolute",
                  top: `${getCurrentTimePosition()}px`,
                  left: "70px",
                  right: 0,
                  height: "2px",
                  background: "#e53935",
                  zIndex: 20
                }}
              />

              <div
                style={{
                  position: "absolute",
                  top: `${getCurrentTimePosition() - 10}px`,
                  left: "15px",
                  color: "#e53935",
                  fontSize: "13px",
                  fontWeight: "600",
                  zIndex: 20
                }}
              >
                Сейчас
              </div>

              {hours.map((hour) => (
                <div
                  key={hour}
                  style={{
                    position: "absolute",
                    top: (hour - 8) * 100,
                    left: 0,
                    right: 0,
                    height: "100px",
                    borderTop: "1px solid #eee"
                  }}
                >
                  <span
                    style={{
                      position: "absolute",
                      left: "15px",
                      top: "-10px",
                      fontWeight: "600",
                      fontSize: "14px",
                      color: "#666"
                    }}
                  >
                    {String(hour).padStart(2, "0")}:00
                  </span>
                </div>
              ))}

              {halfHours.map((minute) => (
                <div
                  key={minute}
                  style={{
                    position: "absolute",
                    top: ((minute - 480) * 100) / 60,
                    left: "70px",
                    right: 0,
                    borderTop: "1px dashed #eee"
                  }}
                />
              ))}

              {appointments.map((a) => (
                <div
                  key={a.id}
                  onClick={() =>
                    setSelectedAppointment(a)
                  }
                  style={{
                    position: "absolute",
                    left: "80px",
                    right: "20px",

                    top: `${getTopPosition(
                      a.start_time
                    )}px`,

                    height: `${Math.max(
                      a.service_duration *
                        (100 / 60),
                      70
                    )}px`,

                    background:
                      selectedAppointment?.id ===
                      a.id
                        ? "#ffe7ba"
                        : a.status === "completed"
                        ? "#e8f7ec"
                        : "#fff4dc",

                    border:
                      selectedAppointment?.id ===
                      a.id
                        ? "2px solid #ff9800"
                        : a.status === "completed"
                        ? "1px solid #b7e0c0"
                        : "1px solid #f2d28b",

                    boxShadow:
                      "0 2px 8px rgba(0,0,0,0.08)",

                    cursor: "pointer",
                    borderRadius: "12px",
                    padding: "12px",
                    overflow: "hidden",
                    boxSizing: "border-box"
                  }}
                >
                  <strong>
                    {a.start_time.slice(0, 5)}
                    {" - "}
                    {getEndTime(
                      a.start_time,
                      a.service_duration
                    )}
                  </strong>

                  <div
                    style={{
                      fontWeight: "600",
                      marginTop: "5px"
                    }}
                  >
                    {a.client_name}
                  </div>

                  {a.service_duration >= 30 && (
                    <>
                      <div
                        style={{
                          fontSize: "14px",
                          marginTop: "5px"
                        }}
                      >
                        {a.services}
                      </div>

                      <div
                        style={{
                          fontSize: "13px",
                          marginTop: "6px",
                          opacity: 0.8
                        }}
                      >
                        {a.service_price} ₽
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div
            style={{
              background: "#fff",
              borderRadius: "18px",
              padding: "24px",
              boxShadow:
                "0 4px 12px rgba(0,0,0,0.08)",
              height: "fit-content",
              position: "sticky",
              top: "20px"
            }}
          >
            {!selectedAppointment ? (
              <p>
                Выберите запись в календаре
              </p>
            ) : (
              <>
                <h3>
                  {selectedAppointment.client_name}
                </h3>



                {selectedAppointment.client_phone && (
                  <p>
                    <strong>Телефон:</strong>
                    <br />
                    <a
                      href={`tel:${selectedAppointment.client_phone}`}
                      style={{
                        color: "#1976d2",
                        textDecoration: "none"
                      }}
                    >
                      {selectedAppointment.client_phone}
                    </a>
                  </p>
                )}

                <p>
                  <strong>Время:</strong>
                  <br />
                  {selectedAppointment.start_time.slice(
                    0,
                    5
                  )}
                  {" - "}
                  {getEndTime(
                    selectedAppointment.start_time,
                    selectedAppointment.service_duration
                  )}
                </p>

                <p>
                  <strong>Услуги:</strong>
                  <br />
                  {selectedAppointment.services}
                </p>

                <p>
                  <strong>Стоимость:</strong>
                  <br />
                  {selectedAppointment.service_price} ₽
                </p>

                <p>
                  <strong>Длительность:</strong>
                  <br />
                  {
                    selectedAppointment.service_duration
                  }{" "}
                  мин
                </p>

                {selectedAppointment.client_comment && (
                  <p>
                    <strong>
                      Комментарий:
                    </strong>
                    <br />
                    {
                      selectedAppointment.client_comment
                    }
                  </p>
                )}

                <p>
                  <strong>Статус:</strong>
                  <br />
                  {selectedAppointment.status ===
                  "completed"
                    ? "✓ Выполнена"
                    : "⏳ Запланирована"}
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default MasterDiaryPage;