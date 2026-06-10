import express from "express";
import bcrypt from "bcrypt";
import { pool } from "../db.js";
import jwt from "jsonwebtoken";

const router = express.Router();

// Регистрация
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, phone, role, specialization } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: "Все поля обязательны" });
    }

    if (!["master", "client"].includes(role)) {
      return res.status(400).json({ message: "Неверная роль" });
    }

    if (role === "master" && !specialization) {
      return res.status(400).json({
        message: "Мастер должен выбрать специализацию"
      });
    }

    // Проверяем, существует ли пользователь
    const existingUser = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ message: "Email уже зарегистрирован" });
    }

    // Хешируем пароль
    const hashedPassword = await bcrypt.hash(password, 10);

    // Сохраняем пользователя
    const newUser = await pool.query(
      `
      INSERT INTO users
      (
        name,
        email,
        password_hash,
        phone,
        role,
        specialization
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING
        id,
        name,
        email,
        phone,
        role,
        specialization
      `,
      [
        name,
        email,
        hashedPassword,
        phone,
        role,
        role === "master"
          ? specialization
          : null
      ]
    );

    res.status(201).json({
      message: "Пользователь успешно зарегистрирован",
      user: newUser.rows[0],
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

// Логин
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Введите email и пароль" });
    }

    // Ищем пользователя
    const userResult = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (userResult.rows.length === 0) {
      return res.status(400).json({ message: "Пользователь не найден" });
    }

    const user = userResult.rows[0];

    // Проверяем пароль
    const isMatch = await bcrypt.compare(
      password, 
      user.password_hash
    );

    if (!isMatch) {
      return res.status(400).json({ message: "Неверный пароль" });
    }

    // Генерируем токен
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.json({
      message: "Успешный вход",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        specialization: user.specialization
      },
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

export default router;