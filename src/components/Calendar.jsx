import { useState, useEffect } from "react";

function Calendar({ masterId, serviceId, duration, onSelectDate, getAvailableSlots }) {

  const [currentDate, setCurrentDate] = useState(new Date());
  const [availability, setAvailability] = useState({});
  const [selectedDate, setSelectedDate] = useState(null);

  const weekDays = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const startDay = firstDay === 0 ? 6 : firstDay - 1;

  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // сегодняшняя дата (обнуляем время)
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // ограничение: максимум +2 месяца
  const maxDate = new Date();
  maxDate.setMonth(maxDate.getMonth() + 2);

  // загрузка доступности
  useEffect(() => {

    async function loadAvailability() {

      if (!duration || !masterId || !serviceId) return;

      const data = {};

      for (let day = 1; day <= daysInMonth; day++) {

        const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

        try {
          const slots = await getAvailableSlots(masterId, serviceId, dateStr);
          data[dateStr] = Array.isArray(slots) && slots.length > 0;
        } catch {
          data[dateStr] = false;
        }

      }

      setAvailability(data);
    }

    loadAvailability();

  }, [month, year, duration, masterId]);

  return (
    <div style={{
      border: "1px solid #eee",
      borderRadius: "12px",
      padding: "15px",
      maxWidth: "400px"
    }}>

      {/* ПЕРЕКЛЮЧЕНИЕ МЕСЯЦА */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        marginBottom: "15px",
        alignItems: "center"
      }}>

        <button
          onClick={() => setCurrentDate(new Date(year, month - 1))}
          style={{ cursor: "pointer" }}
        >
          ←
        </button>

        <strong>
          {year} / {month + 1}
        </strong>

        <button
          onClick={() => setCurrentDate(new Date(year, month + 1))}
          style={{ cursor: "pointer" }}
        >
          →
        </button>

      </div>

      {/* СЕТКА */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(7, 1fr)",
        gap: "6px"
      }}>

        {/* ДНИ НЕДЕЛИ */}
        {weekDays.map(day => (
          <div key={day} style={{
            textAlign: "center",
            fontSize: "13px",
            color: "#666"
          }}>
            {day}
          </div>
        ))}

        {/* ПУСТЫЕ */}
        {[...Array(startDay)].map((_, i) => (
          <div key={"empty-" + i}></div>
        ))}

        {/* ДНИ */}
        {[...Array(daysInMonth)].map((_, i) => {

          const day = i + 1;

          const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

          const hasSlots = availability[dateStr];

          const currentDayDate = new Date(year, month, day);

          const isPast = currentDayDate < today;
          const isTooFar = currentDayDate > maxDate;

          const isDisabled = isPast || isTooFar;

          return (
            <div
              key={day}
              onClick={() => {
                if (!isDisabled && hasSlots) {
                  setSelectedDate(dateStr);
                  onSelectDate(dateStr);
                }
              }}
              style={{
                padding: "10px",
                textAlign: "center",
                borderRadius: "8px",
                cursor: (!isDisabled && hasSlots) ? "pointer" : "not-allowed",
                border: selectedDate === dateStr ? "2px solid #4f46e5" : "1px solid #eee",
                background:
                  isDisabled
                    ? "#f3f4f6"
                    : hasSlots === undefined
                    ? "#eee"
                    : hasSlots
                    ? "#a7f3d0"
                    : "#fecaca",
                opacity: isDisabled ? 0.5 : hasSlots === false ? 0.6 : 1,
                transition: "0.2s"
              }}
            >
              {day}
            </div>
          );

        })}

      </div>

      {/* ЛЕГЕНДА */}
      <div style={{
        marginTop: "15px",
        fontSize: "13px",
        display: "flex",
        justifyContent: "space-between"
      }}>
        <span>🟢 есть</span>
        <span>🔴 нет</span>
        <span>⚪ недоступно</span>
      </div>

    </div>
  );
}

export default Calendar;