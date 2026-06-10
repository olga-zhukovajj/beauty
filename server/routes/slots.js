import express from "express";
import { pool } from "../db.js";

const router = express.Router();

router.get("/:id/available-slots", async (req, res) => {
  try {
    const masterId = req.params.id;
    const { date, duration } = req.query;
    const bookingDuration = Number(duration) || 60;

    if (!date) {
      return res.status(400).json({
        message: "date обязательна",
      });
    }

    // 1. расписание мастера
    let dayOfWeek = new Date(date).getDay();
    dayOfWeek = dayOfWeek === 0 ? 7 : dayOfWeek;

    const scheduleResult = await pool.query(
      `
      SELECT start_time, end_time
      FROM schedules
      WHERE master_id = $1 AND day = $2
      `,
      [masterId, dayOfWeek]
    );

    if (!scheduleResult.rows.length) {
      return res.json([]);
    }

    const startTime = scheduleResult.rows[0].start_time.slice(0, 5);
    const endTime = scheduleResult.rows[0].end_time.slice(0, 5);

    const toMin = (time) => {
      const [h, m] = time.split(":").map(Number);
      return h * 60 + m;
    };

    const toTime = (minutes) => {
      const h = String(Math.floor(minutes / 60)).padStart(2, "0");
      const m = String(minutes % 60).padStart(2, "0");
      return `${h}:${m}`;
    };

    const start = toMin(startTime);
    const end = toMin(endTime);

    // 2. ВСЕ записи мастера на день
    const appointments = await pool.query(
      `
      SELECT start_time, service_duration
      FROM appointments
      WHERE master_id = $1
      AND appointment_date = $2
      `,
      [masterId, date]
    );

    const slots = [];

    // 3. генерируем слоты
    for (let t = start; t < end; t += 30) {

      if (t + bookingDuration > end) {
        continue;
      }

      let isBusy = false;

      for (const a of appointments.rows) {

        const [h, m] = a.start_time
          .slice(0, 5)
          .split(":")
          .map(Number);

        const aStart = h * 60 + m;
        const aEnd = aStart + (a.service_duration || 60);

        if (t < aEnd && t + bookingDuration > aStart) {
          isBusy = true;
          break;
        }
      }

      if (!isBusy) {
        slots.push(toTime(t));
      }
    }
    res.json(slots);

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Ошибка получения слотов",
    });
  }
});

export default router;