import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getToken } from "../storage/auth";
import { getSchedule, saveSchedule } from "../api/api";
import "../styles/pages/SchedulePage.css";

const days = [
  { id: 1, label: "Понедельник" },
  { id: 2, label: "Вторник" },
  { id: 3, label: "Среда" },
  { id: 4, label: "Четверг" },
  { id: 5, label: "Пятница" },
  { id: 6, label: "Суббота" },
  { id: 0, label: "Воскресенье" }
];

function SchedulePage() {

  const navigate = useNavigate();
  const token = getToken();
  const masterId = JSON.parse(atob(token.split(".")[1])).id;

  const [schedule, setSchedule] = useState({});

  useEffect(() => {

    async function fetchSchedule() {

      try {

        const data = await getSchedule(masterId, token);
        setSchedule(data);

      } catch (err) {

        alert(err.message);

      }

    }

    fetchSchedule();

  }, [masterId, token]);

  const toggleDay = (dayId) => {

    setSchedule((prev) => ({
      ...prev,
      [dayId]: prev[dayId] ? null : { start: "09:00", end: "18:00" }
    }));

  };

  const handleChange = (dayId, field, value) => {

    setSchedule((prev) => ({
      ...prev,
      [dayId]: {
        ...prev[dayId],
        [field]: value
      }
    }));

  };

  const handleSave = async () => {

    try {

      await saveSchedule(masterId, schedule, token);
      alert("График сохранён");

    } catch (err) {

      alert(err.message);

    }

  };

    return (
      <div className="schedule-page">

        <div className="schedule-header">
          <h2>График работы</h2>
          <p>Настрой удобное расписание приёма клиентов</p>
        </div>

        <div className="schedule-list">

          {days.map((day) => (
            <div
              key={day.id}
              className={`schedule-item ${
                schedule[day.id] ? "active" : ""
              }`}
            >

              <div className="left">

                <span className="day-name">
                  {day.label}
                </span>

                <button
                  className="toggle-btn"
                  onClick={() => toggleDay(day.id)}
                >
                  {schedule[day.id]
                    ? "Рабочий день"
                    : "Выходной"}
                </button>

              </div>

              {schedule[day.id] && (
                <div className="right">

                  <input
                    type="time"
                    value={schedule[day.id].start}
                    onChange={(e) =>
                      handleChange(day.id, "start", e.target.value)
                    }
                  />

                  <span className="dash">—</span>

                  <input
                    type="time"
                    value={schedule[day.id].end}
                    onChange={(e) =>
                      handleChange(day.id, "end", e.target.value)
                    }
                  />

                </div>
              )}

            </div>
          ))}

        </div>

        <div className="schedule-footer">

          <button className="primary-btn" onClick={handleSave}>
            Сохранить изменения
          </button>

          <button
            className="secondary-btn"
            onClick={() => navigate(`/master/${masterId}`)}
          >
            ← Назад
          </button>

        </div>

      </div>
    );
}

export default SchedulePage;