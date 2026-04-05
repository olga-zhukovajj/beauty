import express from "express";
import { pool } from "../db.js";

const router = express.Router();

router.post("/", async (req, res) => {

  try {

    const {
      master_id,
      service_id,
      appointment_date,
      start_time,
      client_name
    } = req.body;

    const result = await pool.query(
      `INSERT INTO appointments
       (master_id, service_id, appointment_date, start_time, client_name)
       VALUES ($1,$2,$3,$4,$5)
       RETURNING *`,
      [master_id, service_id, appointment_date, start_time, client_name]
    );

    res.json(result.rows[0]);

  } catch (error) {

    console.error("APPOINTMENT ERROR:", error);
    res.status(500).json({ message: "Ошибка создания записи" });

  }

});

export default router;