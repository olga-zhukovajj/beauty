import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser } from "../storage/currentUser";
import {
  getWeeklySchedule,
  saveWeeklySchedule,
} from "../storage/weeklySchedule";

const days = [
  { id: 0, label: "Понедельник" },
  { id: 1, label: "Вторник" },
  { id: 2, label: "Среда" },
  { id: 3, label: "Четверг" },
  { id: 4, label: "Пятница" },
  { id: 5, label: "Суббота" },
  { id: 6, label: "Воскресенье" },
];

function SchedulePage() {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const [schedule, setSchedule] = useState({});

  useEffect(() => {
    if (!user) return;
    setSchedule(getWeeklySchedule(user.id));
  }, [user?.id]);

  const handleChange = (dayId, field, value) => {
    setSchedule((prev) => ({
      ...prev,
      [dayId]: {
        ...prev[dayId],
        [field]: value,
      },
    }));
  };

  const toggleDay = (dayId) => {
    setSchedule((prev) => ({
      ...prev,
      [dayId]: prev[dayId] ? null : { start: "09:00", end: "18:00" },
    }));
  };

  const handleSave = () => {
    saveWeeklySchedule(user.id, schedule);
    alert("График сохранён");
  };


  const goBack = () => {
    navigate("/dashboard"); 
  };


  return (
    <div>
      <h2>График работы</h2>

      {days.map((day) => (
        <div key={day.id} style={{ marginBottom: 10 }}>
          <strong>{day.label}</strong>

          <button onClick={() => toggleDay(day.id)}>
            {schedule[day.id] ? "Рабочий день " : "Выходной "}
          </button>

          {schedule[day.id] && (
            <>
              <input
                type="time"
                value={schedule[day.id].start}
                onChange={(e) =>
                  handleChange(day.id, "start", e.target.value)
                }
              />
              <input
                type="time"
                value={schedule[day.id].end}
                onChange={(e) =>
                  handleChange(day.id, "end", e.target.value)
                }
              />
            </>
          )}
        </div>
      ))}

      <button onClick={handleSave}>Сохранить</button>
      <button onClick={goBack}>← Вернуться на главную</button>
    </div>
  );
}

export default SchedulePage;