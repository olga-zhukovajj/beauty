import express from "express";
import { pool } from "../db.js";

const router = express.Router();

router.get("/:id/available-slots", async (req, res) => {
  try {
    console.log("=== СЛОТЫ ===");

    const masterId = req.params.id;
    const { date, serviceId } = req.query;

    console.log("REQ QUERY:", req.query);
    console.log("MASTER:", masterId);
    console.log("DATE:", date);
    console.log("SERVICE:", serviceId);

    // длительность услуги
    const serviceRes = await pool.query(
      "SELECT duration FROM services WHERE id = $1",
      [serviceId]
    );

    const duration = serviceRes.rows[0]?.duration || 60;
    console.log("DURATION:", duration);

    // день недели
    let dayOfWeek = new Date(date).getDay();
    dayOfWeek = dayOfWeek === 0 ? 7 : dayOfWeek;

    console.log("DAY:", dayOfWeek);

    // расписание
    const scheduleResult = await pool.query(
      "SELECT * FROM schedules WHERE master_id=$1 AND day=$2",
      [masterId, dayOfWeek]
    );

    console.log("SCHEDULE:", scheduleResult.rows);

    if (!scheduleResult.rows.length) {
      console.log("❌ НЕТ РАСПИСАНИЯ");
      return res.json([]);
    }

    const startTime = scheduleResult.rows[0].start_time.slice(0,5);
    const endTime = scheduleResult.rows[0].end_time.slice(0,5);

    const toMin = (t) => {
      const [h, m] = t.split(":").map(Number);
      return h * 60 + m;
    };

    const toTime = (m) => {
      const h = String(Math.floor(m / 60)).padStart(2, "0");
      const mm = String(m % 60).padStart(2, "0");
      return `${h}:${mm}`;
    };

    const start = toMin(startTime);
    const end = toMin(endTime);

    console.log("WORK TIME:", startTime, "-", endTime);

    // записи
    const appointments = await pool.query(
      "SELECT start_time, service_id FROM appointments WHERE master_id=$1 AND appointment_date=$2",
      [masterId, date]
    );

    console.log("APPOINTMENTS:", appointments.rows);

    const slots = [];

    for (let t = start; t + duration <= end; t += 30) {
      let isBusy = false;

      for (let a of appointments.rows) {
        const service = await pool.query(
          "SELECT duration FROM services WHERE id=$1",
          [a.service_id]
        );

        const busyDuration = service.rows[0]?.duration || 60;

        const [h, m] = a.start_time.slice(0,5).split(":").map(Number);
        const aStart = h * 60 + m;
        const aEnd = aStart + busyDuration;

        if (t < aEnd && (t + duration) > aStart) {
          isBusy = true;
          break;
        }
      }

      if (!isBusy) {
        slots.push(toTime(t));
      }
    }

    console.log("RESULT SLOTS:", slots);

    res.json(slots);

  } catch (err) {
    console.error("❌ ОШИБКА:", err);
    res.status(500).json({ message: "Ошибка получения слотов" });
  }
});

export default router;