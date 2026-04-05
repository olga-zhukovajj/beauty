import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { pool } from "./db.js";
import authRoutes from "./routes/auth.js";
import { authenticateToken } from "./middleware/authMiddleware.js";
import appointmentsRoutes from "./routes/appointments.js";
import slotsRoutes from "./routes/slots.js";
import portfolioRoutes from "./routes/portfolio.js";
import path from "path";



dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api", authRoutes);
app.use("/api/masters", slotsRoutes);
app.use("/api/appointments", appointmentsRoutes);
app.use("/api/portfolio", portfolioRoutes);
app.use("/uploads", express.static("uploads"));


app.get("/", (req, res) => {
  res.send("Server is runng!!!! 🚀");
});

app.get("/test-route", (req, res) => {

  console.log("TEST ROUTE WAS HIT");
  res.send("TEST ROUTE WORKS");
});


app.get("/api/profile", authenticateToken, (req, res) => {
  res.json({
    message: "Доступ разрешён",
    user: req.user,
  });
});

app.get("/test-db", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json({
      message: "Database connected successfully",
      time: result.rows[0].now,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Database connection failed" });
  }
});

app.get("/api/masters/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      "SELECT id, name, email FROM users WHERE id = $1 AND role = 'master'",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Мастер не найден" });
    }

    res.json(result.rows[0]);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

app.get("/api/masters", async (req, res) => {
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

app.get("/api/users", async (req, res) => {
  const result = await pool.query("SELECT id, name, email, role FROM users");
  res.json(result.rows);
});

const PORT = process.env.PORT || 5000;

app.get("/api/test", (req, res) => {
  res.send("API работает");
});

// ===== УСЛУГИ МАСТЕРА =====

// получить услуги мастера
app.get("/api/masters/:id/services", async (req, res) => {
  try {
    const masterId = req.params.id;

    const result = await pool.query(
      "SELECT * FROM services WHERE master_id = $1",
      [masterId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Ошибка получения услуг" });
  }
});

// добавить услугу
app.post("/api/masters/:id/services", async (req, res) => {
  try {
    const masterId = req.params.id;
    const { title, duration, price } = req.body;

    const result = await pool.query(
      `INSERT INTO services (master_id, title, duration, price)
       VALUES ($1,$2,$3,$4)
       RETURNING *`,
      [masterId, title, duration, price]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Ошибка добавления услуги" });
  }
});

// удалить услугу
app.delete("/api/masters/:id/services/:serviceId", async (req, res) => {
  try {
    const { serviceId } = req.params;

    await pool.query(
      "DELETE FROM services WHERE id = $1",
      [serviceId]
    );

    res.json({ message: "Услуга удалена" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Ошибка удаления услуги" });
  }
});

// получить расписание мастера
app.get("/api/masters/:id/schedule", async (req, res) => {
  try {
    const masterId = req.params.id;

    const result = await pool.query(
      "SELECT day, start_time, end_time FROM schedules WHERE master_id=$1",
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
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Ошибка получения расписания" });
  }
});


// сохранить расписание
app.post("/api/masters/:id/schedule", async (req, res) => {
  try {
    const masterId = req.params.id;
    const schedule = req.body;

    await pool.query(
      "DELETE FROM schedules WHERE master_id=$1",
      [masterId]
    );

    for (const day in schedule) {
      const item = schedule[day];

      if (!item) continue;

      await pool.query(
        `INSERT INTO schedules (master_id, day, start_time, end_time)
         VALUES ($1,$2,$3,$4)`,
        [masterId, day, item.start, item.end]
      );
    }

    res.json({ message: "Расписание сохранено" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Ошибка сохранения расписания" });
  }
});

app.get("/api/masters/:id/available-slots", async (req, res) => {
  try {
    const masterId = req.params.id;
    const { date } = req.query;

    const dayOfWeek = new Date(date).getDay();

    const scheduleResult = await pool.query(
      "SELECT * FROM schedules WHERE master_id=$1 AND day=$2",
      [masterId, dayOfWeek]
    );

    if (!scheduleResult.rows.length) {
      return res.json([]);
    }

    const { start_time, end_time } = scheduleResult.rows[0];

    const appointments = await pool.query(
      "SELECT start_time FROM appointments WHERE master_id=$1 AND appointment_date=$2",
      [masterId, date]
    );

    const booked = appointments.rows.map(a => a.start_time);

    const slots = [];

    let current = start_time;

    while (current < end_time) {
      if (!booked.includes(current)) {
        slots.push(current);
      }

      const [h, m] = current.split(":").map(Number);
      const next = new Date(0,0,0,h,m+60);
      current = next.toTimeString().slice(0,5);
    }

    res.json(slots);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Ошибка получения слотов" });
  }
});

app.post("/api/appointments", async (req, res) => {
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

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Ошибка записи" });
  }
});

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});


