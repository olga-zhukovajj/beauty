import express from "express";
import { pool } from "../db.js";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

const storage = multer.diskStorage({
destination: path.join(__dirname, "../uploads"),
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// получить портфолио мастера
router.get("/:masterId", async (req, res) => {
  try {
    const { masterId } = req.params;

    const result = await pool.query(
      "SELECT * FROM portfolio WHERE master_id = $1 ORDER BY created_at DESC",
      [masterId]
    );

    res.json(result.rows);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Ошибка загрузки портфолио" });
  }
});

// добавить фото
router.post("/", upload.single("image"), async (req, res) => {
  try {

    const { masterId } = req.body;

    const imageUrl = `/uploads/${req.file.filename}`;

    const result = await pool.query(
      `INSERT INTO portfolio (master_id, image_url)
       VALUES ($1, $2)
       RETURNING *`,
      [masterId, imageUrl]
    );

    res.json(result.rows[0]);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Ошибка загрузки фото" });
  }
});

// удалить фото
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query(
      "DELETE FROM portfolio WHERE id = $1",
      [id]
    );

    res.json({ success: true });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Ошибка удаления" });
  }
});

export default router;