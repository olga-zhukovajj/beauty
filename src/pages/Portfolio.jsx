import { useEffect, useState } from "react";
import {
  getPortfolio,
  addPortfolio,
  deletePortfolio
} from "../api/api";

function Portfolio({ masterId, isOwner }) {

  const [images, setImages] = useState([]);
  const [url, setUrl] = useState("");

  useEffect(() => {
    if (!masterId) return;
    load();
  }, [masterId]);

  async function load() {
    try {
      const data = await getPortfolio(masterId);
      setImages(data);
    } catch (err) {
      console.error("Ошибка загрузки портфолио", err);
    }
  }

  const handleAdd = async () => {
    if (!url) return;

    try {
      await addPortfolio(masterId, url);
      setUrl("");
      load();
    } catch (err) {
      console.error("Ошибка добавления", err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deletePortfolio(id);
      load();
    } catch (err) {
      console.error("Ошибка удаления", err);
    }
  };

  return (
    <div style={{ marginTop: "30px" }}>

      <h3>Портфолио</h3>

      {isOwner && (
        <div style={{ marginBottom: "15px" }}>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setUrl(e.target.files[0])}
          />
          <button onClick={handleAdd}>
            Добавить
          </button>
        </div>
      )}

      {images.length === 0 && (
        <p style={{ color: "#999" }}>
          Пока нет работ
        </p>
      )}

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: "10px"
      }}>

        {images.map((img) => (
          <div key={img.id} style={{ position: "relative" }}>

            <img
              src={'http://localhost:5000${img.image_url}'}
              alt=""
              style={{
                width: "100%",
                height: "120px",
                objectFit: "cover",
                borderRadius: "10px"
              }}
            />

            {isOwner && (
              <button
                onClick={() => handleDelete(img.id)}
                style={{
                  position: "absolute",
                  top: "5px",
                  right: "5px",
                  background: "red",
                  color: "white",
                  border: "none",
                  borderRadius: "50%",
                  width: "22px",
                  height: "22px",
                  cursor: "pointer"
                }}
              >
                ×
              </button>
            )}

          </div>
        ))}

      </div>

    </div>
  );
}

export default Portfolio;