import express from "express";
import { pool } from "../db.js";

const router = express.Router();

router.get("/:masterId/available-slots", async (req, res) => {

  try {

    const { masterId } = req.params;
    const { duration, date } = req.query;

    const durationNum = Number(duration);

    // текущая дата/время
    const now = new Date();

    const selectedDate = new Date(date + "T00:00:00");

    const isToday =
      selectedDate.toDateString() === now.toDateString();

    // день недели (ПН=1, ВС=0)
    const jsDay = selectedDate.getDay();
    const dayOfWeek = jsDay === 0 ? 0 : jsDay;

    // расписание мастера
    const schedule = await pool.query(
      `SELECT start_time, end_time
       FROM schedules
       WHERE master_id = $1 AND day = $2`,
      [masterId, dayOfWeek]
    );

    if (schedule.rows.length === 0) {
      return res.json([]);
    }

    const startTime = schedule.rows[0].start_time;
    const endTime = schedule.rows[0].end_time;

    // занятые записи
    const appointments = await pool.query(
      `SELECT start_time
       FROM appointments
       WHERE master_id = $1
       AND appointment_date = $2`,
      [masterId, date]
    );

    const bookedTimes = appointments.rows.map(a =>
      a.start_time.toString().slice(0, 5)
    );

    const slots = [];

    let current = new Date(`1970-01-01T${startTime}`);
    const end = new Date(`1970-01-01T${endTime}`);

    while (new Date(current.getTime() + durationNum * 60000) <= end) {

      const timeStr = current.toTimeString().slice(0, 5);

      // 🚨 ВОТ ГЛАВНАЯ МАГИЯ
      if (isToday) {
        const [h, m] = timeStr.split(":");
        const slotDate = new Date();
        slotDate.setHours(Number(h), Number(m), 0, 0);

        if (slotDate <= now) {
          current.setMinutes(current.getMinutes() + durationNum);
          continue;
        }
      }

      const isBooked = bookedTimes.includes(timeStr);

      if (!isBooked) {
        slots.push(timeStr);
      }

      current.setMinutes(current.getMinutes() + durationNum);
    }

    res.json(slots);

  } catch (error) {

    console.error("SLOTS ERROR:", error);
    res.status(500).json({ message: "Ошибка получения слотов" });

  }

});

export default router;