import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { pool } from "./db.js";
import authRoutes from "./routes/auth.js";
import { authenticateToken } from "./middleware/authMiddleware.js";
import appointmentsRoutes from "./routes/appointments.js";
import slotsRoutes from "./routes/slots.js";
import portfolioRoutes from "./routes/portfolio.js";
import mastersRoutes from "./routes/masters.js";
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
app.use("/api/masters", mastersRoutes);
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



app.get("/api/users", async (req, res) => {
  const result = await pool.query("SELECT id, name, email, role FROM users");
  res.json(result.rows);
});

const PORT = process.env.PORT || 5000;

app.get("/api/test", (req, res) => {
  res.send("API работает");
});



app.listen(PORT, () => {
  console.log(`🔥 Server started on port ${PORT}`);
});