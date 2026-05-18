import express from "express";
import { pool } from "../db.js";
const router = express.Router();

router.use(express.json());

router.post("/", async (req, res) => {
  console.log("🔥 ROUTE HIT");
  console.log("🔥 BODY:", req.body);

  const {
    master_id,
    service_id,
    appointment_date,
    start_time,
    client_name,
    client_comment
  } = req.body;

  const result = await pool.query(
    `INSERT INTO appointments
    (master_id, service_id, appointment_date, start_time, client_name, client_comment)
    VALUES ($1,$2,$3,$4,$5,$6)
    RETURNING *`,
    [
      master_id,
      service_id,
      appointment_date,
      start_time,
      client_name,
      client_comment || null
    ]
  );

  res.json(result.rows[0]);
});

export default router;