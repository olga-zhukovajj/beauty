import express from "express";
import { pool } from "../db.js";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Multer storage
const storage = multer.diskStorage({
  destination: path.join(__dirname, "../uploads"),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

// GET портфолио по masterId через query
router.get("/", async (req, res) => {
  try {
    const { masterId } = req.query;
    if (!masterId) return res.status(400).json({ message: "masterId обязателен" });

    const result = await pool.query(
      "SELECT * FROM portfolio WHERE master_id=$1 ORDER BY created_at DESC",
      [masterId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Ошибка загрузки портфолио" });
  }
});

// POST — добавить фото
router.post("/", upload.array("image"), async (req, res) => {
  try {

    const { masterId } = req.body;

    if (!masterId) {
      return res.status(400).json({
        message: "masterId обязателен"
      });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        message: "Файлы не найдены"
      });
    }

    const uploadedImages = [];

    for (const file of req.files) {

      const imageUrl = `/uploads/${file.filename}`;

      const result = await pool.query(
        `
        INSERT INTO portfolio
        (master_id, image_url)
        VALUES ($1, $2)
        RETURNING *
        `,
        [masterId, imageUrl]
      );

      uploadedImages.push(result.rows[0]);
    }

    res.json(uploadedImages);

  } catch (err) {

    console.error(err);

    res.status(500).json({
      message: "Ошибка добавления фото"
    });

  }
});

router.delete("/:id", async (req, res) => {
  try {

    const { id } = req.params;

    await pool.query(
      "DELETE FROM portfolio WHERE id = $1",
      [id]
    );

    res.json({
      success: true
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      error: "Ошибка удаления"
    });

  }
});

export default router;