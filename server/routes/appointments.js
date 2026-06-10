import express from "express";
import { pool } from "../db.js";

const router = express.Router();

router.use(express.json());

router.post("/", async (req, res) => {
  try {
    console.log("BODY:", req.body);

    const {
      master_id,
      services,
      appointment_date,
      start_time,
      client_id,
      client_name,
      client_comment
    } = req.body;

    if (!Array.isArray(services) || services.length === 0) {
      return res.status(400).json({ message: "services пустой" });
    }

    // получаем услуги
    const serviceResult = await pool.query(
      `SELECT id, price, duration
       FROM services
       WHERE id = ANY($1)`,
      [services]
    );

    if (!serviceResult.rows.length) {
      return res.status(400).json({ message: "услуги не найдены" });
    }

    const total_price = serviceResult.rows.reduce(
      (sum, s) => sum + Number(s.price),
      0
    );

    const total_duration = serviceResult.rows.reduce(
      (sum, s) => sum + Number(s.duration),
      0
    );

    // создаём запись
    const result = await pool.query(
      `INSERT INTO appointments (
        master_id,
        client_id,
        appointment_date,
        start_time,
        client_name,
        client_comment,
        service_price,
        service_duration,
        status
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
      RETURNING *`,
      [
        master_id,
        client_id,
        appointment_date,
        start_time,
        client_name,
        client_comment ?? null,
        total_price,
        total_duration,
        "scheduled"
      ]
    );

    const appointment = result.rows[0];

    // связь услуг
    for (const serviceId of services) {
      await pool.query(
        `INSERT INTO appointment_services (appointment_id, service_id)
         VALUES ($1,$2)`,
        [appointment.id, serviceId]
      );
    }

    return res.json(appointment);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Ошибка создания записи" });
  }
});

export default router;