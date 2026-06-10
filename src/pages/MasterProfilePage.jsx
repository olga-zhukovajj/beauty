import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getMasterById } from "../api/api";
import { getToken, getCurrentUser } from "../storage/auth";
import Portfolio from "../pages/Portfolio";
import "../styles/pages/MasterProfilePage.css";

function MasterProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [master, setMaster] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const currentUser = getCurrentUser();

  useEffect(() => {
    async function fetchMaster() {
      try {
        const token = getToken();
        const data = await getMasterById(id, token);
        setMaster(data);
      } catch (err) {
        setError(err.message || "Ошибка при загрузке мастера");
      } finally {
        setLoading(false);
      }
    }

    fetchMaster();
  }, [id]);

  if (loading) return <p className="loading">Загрузка профиля...</p>;
  if (error) return <p className="error">{error}</p>;
  if (!master) return <p className="error">Мастер не найден</p>;

  const isOwner =
    currentUser?.role === "master" &&
    String(currentUser?.id) === String(master.id);

  const isClient = currentUser?.role === "client";

  return (
    <div className="profile-page">

      {/* HERO PROFILE */}
      <section className="profile-hero">

        <div className="profile-card">

          <div className="avatar-large">
            {master.name?.[0] || "M"}
          </div>

          <div className="profile-info">
            <h1>{master.name}</h1>
            <p>{master.email}</p>

            <span className="role-badge">
              beauty specialist
            </span>
          </div>

        </div>

        {/* ACTIONS */}
        <div className="actions">

          {isClient && (
            <button
              className="primary-btn"
              onClick={() => navigate(`/booking/${master.id}`)}
            >
              Записаться
            </button>
          )}

          {isOwner && (
            <>
              <button
                className="secondary-btn"
                onClick={() => navigate("/services")}
              >
                Услуги
              </button>

              <button
                className="secondary-btn"
                onClick={() => navigate("/schedule")}
              >
                Расписание
              </button>

              <button
                className="secondary-btn"
                onClick={() => navigate("/master/diary")}
              >
                Дневник записей
              </button>

              {/* <button
                className="secondary-btn"
                onClick={() => navigate("/master-appointments")}
              >
                Записи
              </button> */}
            </>
          )}

        </div>

      </section>

      {/* PORTFOLIO */}
      <section className="portfolio-section">
        <h2>Портфолио</h2>

        <Portfolio
          masterId={master.id}
          isOwner={isOwner}
        />
      </section>

      <div className="back">
        <button onClick={() => navigate("/masters")}>
          ← Назад
        </button>
      </div>

    </div>
  );
}

export default MasterProfilePage;