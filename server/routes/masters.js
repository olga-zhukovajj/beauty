import express from "express";
import { pool } from "../db.js";

const router = express.Router();

// список мастеров
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, name, email, specialization FROM users WHERE role = 'master'"
    );

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

// мастер по id
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      "SELECT id, name, email, specialization FROM users WHERE id = $1 AND role = 'master'",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Мастер не найден",
      });
    }

    res.json(result.rows[0]);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

// услуги мастера
router.get("/:id/services", async (req, res) => {
  try {
    const masterId = req.params.id;

    const result = await pool.query(
      "SELECT * FROM services WHERE master_id = $1",
      [masterId]
    );

    res.json(result.rows);

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Ошибка получения услуг",
    });
  }
});

// добавить услугу
router.post("/:id/services", async (req, res) => {
  try {
    const masterId = req.params.id;
    const { title, duration, price } = req.body;

    const result = await pool.query(
      `INSERT INTO services
      (master_id, title, duration, price)
      VALUES ($1,$2,$3,$4)
      RETURNING *`,
      [masterId, title, duration, price]
    );

    res.json(result.rows[0]);

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Ошибка добавления услуги",
    });
  }
});

// удалить услугу
router.delete("/:id/services/:serviceId", async (req, res) => {
  try {
    const { serviceId } = req.params;

    await pool.query(
      "DELETE FROM services WHERE id = $1",
      [serviceId]
    );

    res.json({
      message: "Услуга удалена",
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Ошибка удаления услуги",
    });
  }
});

// получить расписание
router.get("/:id/schedule", async (req, res) => {
  try {
    const masterId = req.params.id;

    const result = await pool.query(
      "SELECT day, start_time, end_time FROM schedules WHERE master_id = $1",
      [masterId]
    );

    const schedule = {};
    result.rows.forEach((row) => {
      schedule[row.day] = {
        start: row.start_time,
        end: row.end_time,
      };
    });

    res.json(schedule);

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Ошибка получения расписания",
    });
  }
});

// сохранить расписание
router.post("/:id/schedule", async (req, res) => {
  try {
    const masterId = req.params.id;
    const schedule = req.body;

    await pool.query(
      "DELETE FROM schedules WHERE master_id = $1",
      [masterId]
    );

    for (const day in schedule) {
      const item = schedule[day];

      if (!item) continue;

      await pool.query(
        `INSERT INTO schedules
        (master_id, day, start_time, end_time)
        VALUES ($1,$2,$3,$4)`,
        [masterId, day, item.start, item.end]
      );
    }

    res.json({
      message: "Расписание сохранено",
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Ошибка сохранения расписания",
    });
  }
});

router.get("/:id/appointments", async (req, res) => {
  try {

    const masterId = req.params.id;

    const result = await pool.query(
      `
      SELECT
          a.id,
          a.appointment_date,
          a.start_time,
          a.client_name,
          a.client_comment,
          a.status,
          a.service_price,
          a.service_duration,
          u.phone AS client_phone,

          STRING_AGG(s.title, ' + ') AS services

      FROM appointments a

      LEFT JOIN users u
          ON u.id = a.client_id

      LEFT JOIN appointment_services aps
          ON aps.appointment_id = a.id

      LEFT JOIN services s
          ON s.id = aps.service_id

      WHERE a.master_id = $1

      GROUP BY
          a.id,
          a.appointment_date,
          a.start_time,
          a.client_name,
          a.client_comment,
          a.status,
          a.service_price,
          a.service_duration

      ORDER BY
          a.appointment_date,
          a.start_time
      `,
      [masterId]
    );

    res.json(result.rows);

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Ошибка получения записей"
    });
  }
});

router.get("/:id/appointments-by-date", async (req, res) => {
  try {
    const masterId = req.params.id;
    const { date } = req.query;

    const result = await pool.query(
      `
      SELECT
          a.id,
          a.appointment_date,
          a.start_time,
          a.client_name,
          a.client_comment,
          a.status,
          a.service_price,
          a.service_duration,

          u.phone AS client_phone,
          u.email AS client_email,

          STRING_AGG(s.title, ', ') AS services

      FROM appointments a

      LEFT JOIN users u
          ON u.id = a.client_id

      LEFT JOIN appointment_services aps
          ON aps.appointment_id = a.id

      LEFT JOIN services s
          ON s.id = aps.service_id

      WHERE a.master_id = $1
        AND a.appointment_date = $2

      GROUP BY
          a.id,
          a.appointment_date,
          a.start_time,
          a.client_name,
          a.client_comment,
          a.status,
          a.service_price,
          a.service_duration,

          u.phone,
          u.email

      ORDER BY
          a.start_time
      `,
      [masterId, date]
    );

    console.log(result.rows[0]);

    res.json(result.rows);

  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Ошибка получения дневника"
    });
  }
});

export default router;