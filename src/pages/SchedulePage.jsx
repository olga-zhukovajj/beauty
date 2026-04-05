import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getToken } from "../storage/auth";
import { getSchedule, saveSchedule } from "../api/api";

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
    <div>

      <h2>График работы</h2>

      {days.map((day) => (

        <div key={day.id} style={{marginBottom:20}}>

          <strong>{day.label}</strong>

          <button onClick={() => toggleDay(day.id)} style={{marginLeft:10}}>
            {schedule[day.id] ? "Рабочий день" : "Выходной"}
          </button>

          {schedule[day.id] && (

            <div style={{marginTop:10}}>

              <input
                type="time"
                value={schedule[day.id].start}
                onChange={(e)=>handleChange(day.id,"start",e.target.value)}
              />

              <span style={{margin:"0 10px"}}>—</span>

              <input
                type="time"
                value={schedule[day.id].end}
                onChange={(e)=>handleChange(day.id,"end",e.target.value)}
              />

            </div>

          )}

        </div>

      ))}

      <button onClick={handleSave}>Сохранить</button>

      <button onClick={() => navigate(`/master/${masterId}`)}>
        ← Вернуться в профиль
      </button>

    </div>
  );

}

export default SchedulePage;