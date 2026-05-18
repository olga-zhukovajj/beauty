import { useEffect, useState } from "react";
import "../styles/pages/Portfolio.css";

function Portfolio({ masterId, isOwner }) {
  const [images, setImages] = useState([]);
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);

  // modal
  const [activeIndex, setActiveIndex] = useState(null);

  // delete mode
  const [deleteMode, setDeleteMode] = useState(false);
  const [selected, setSelected] = useState([]);

  useEffect(() => {
    if (masterId) loadPortfolio();
  }, [masterId]);

  const loadPortfolio = async () => {
    const res = await fetch(
      `http://localhost:5000/api/portfolio?masterId=${masterId}`
    );
    const data = await res.json();
    setImages(Array.isArray(data) ? data : []);
  };

  /* ===== UPLOAD ===== */

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles(selectedFiles);
    setPreviews(selectedFiles.map((f) => URL.createObjectURL(f)));
  };

  const handleAdd = async () => {
    const formData = new FormData();
    files.forEach((f) => formData.append("image", f));
    formData.append("masterId", masterId);

    await fetch("http://localhost:5000/api/portfolio", {
      method: "POST",
      body: formData,
    });

    setFiles([]);
    setPreviews([]);
    loadPortfolio();
  };

  /* ===== DELETE MODE ===== */

  const toggleSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id]
    );
  };

  const confirmDelete = async () => {
    await Promise.all(
      selected.map((id) =>
        fetch(`http://localhost:5000/api/portfolio/${id}`, {
          method: "DELETE",
        })
      )
    );

    setSelected([]);
    setDeleteMode(false);
    loadPortfolio();
  };

  /* ===== MODAL ===== */

  const openModal = (index) => {
    if (deleteMode) return; // защита
    setActiveIndex(index);
  };

  const closeModal = () => setActiveIndex(null);

  const next = (e) => {
    e.stopPropagation();
    setActiveIndex((prev) =>
      prev === images.length - 1 ? 0 : prev + 1
    );
  };

  const prev = (e) => {
    e.stopPropagation();
    setActiveIndex((prev) =>
      prev === 0 ? images.length - 1 : prev - 1
    );
  };

  return (
    <div className="portfolio">

      {/* UPLOAD */}
      {isOwner && (
        <div className="upload-box">

          {/* выбор файлов */}
          <label className="action-label">
            Загрузить новые фото

            <input
              type="file"
              multiple
              onChange={handleFileChange}
            />
          </label>

          {/* счётчик */}
          {files.length > 0 && (
            <span className="files-count">
              {files.length} фото выбрано
            </span>
          )}

          {/* добавить */}
          <button
            className="action-label"
            onClick={handleAdd}
            disabled={!files.length}
          >
            Добавить
          </button>

          <button
            className={`action-label ${
              deleteMode ? "active" : ""
            }`}
            onClick={() => {
              setDeleteMode(!deleteMode);

              if (deleteMode) {
                setSelected([]);
              }
            }}
          >
            {deleteMode
              ? "Отмена"
              : "Удалить фото"}
          </button>

          {/* confirm delete */}
          {deleteMode && selected.length > 0 && (
            <button
              className="action-label active"
              onClick={confirmDelete}
            >
              Удалить ({selected.length})
            </button>
          )}


        </div>
      )}

      {/* PREVIEWS */}
      {previews.length > 0 && (
        <div className="previews">
          {previews.map((p, i) => (
            <img key={i} src={p} alt="" />
          ))}
        </div>
      )}

      {/* GRID */}
      <div className="grid">
        {images.map((img, index) => (
          <div
            key={img.id}
            className={`item ${
              selected.includes(img.id) ? "selected" : ""
            }`}
          >

            <img
              src={`http://localhost:5000${img.image_url}`}
              alt=""
              onClick={() =>
                deleteMode
                  ? toggleSelect(img.id)
                  : openModal(index)
              }
            />

          </div>
        ))}
      </div>

      {/* MODAL */}
      {activeIndex !== null && (
        <div className="modal" onClick={closeModal}>

          <button className="nav left" onClick={prev}>
            ‹
          </button>

          <img
            src={`http://localhost:5000${images[activeIndex]?.image_url}`}
            alt=""
            onClick={(e) => e.stopPropagation()}
          />

          <button className="nav right" onClick={next}>
            ›
          </button>

        </div>
      )}

    </div>
  );
}

export default Portfolio;