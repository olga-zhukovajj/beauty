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
import { fileURLToPath } from "url";

console.log("🚀 СТАРТ ФАЙЛА");

process.on("uncaughtException", (err) => {
  console.error("💥 UNCAUGHT:", err);
});

process.on("unhandledRejection", (err) => {
  console.error("💥 PROMISE ERROR:", err);
});
dotenv.config();

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(express.json());
app.use("/api", authRoutes);
app.use("/api/masters", slotsRoutes);
app.use("/api/appointments", appointmentsRoutes);
app.use("/api/portfolio", portfolioRoutes);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

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
    const { date, serviceId } = req.query;

    if (!serviceId || !date) {
      return res.status(400).json({ message: "serviceId и date обязательны" });
    }

    // получаем длительность услуги
    const serviceRes = await pool.query(
      "SELECT duration FROM services WHERE id = $1",
      [serviceId]
    );

    const duration = serviceRes.rows[0]?.duration || 60;

    // расписание дня
    let dayOfWeek = new Date(date).getDay();
    dayOfWeek = dayOfWeek === 0 ? 7 : dayOfWeek;

    const scheduleResult = await pool.query(
      "SELECT * FROM schedules WHERE master_id=$1 AND day=$2",
      [masterId, dayOfWeek]
    );

    if (!scheduleResult.rows.length) {
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

    const appointments = await pool.query(
      "SELECT start_time, service_id FROM appointments WHERE master_id=$1 AND appointment_date=$2",
      [masterId, date]
    );

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

    res.json(slots);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Ошибка получения слотов" });
  }
});



app.listen(PORT, () => {
  console.log(`🔥 Server started on port ${PORT}`);
});