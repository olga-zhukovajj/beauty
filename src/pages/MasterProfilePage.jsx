import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getMasterById } from "../api/api";
import { getToken, getCurrentUser } from "../storage/auth";
import Portfolio from "../pages/Portfolio";

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

  if (loading) return <p>Загрузка профиля мастера...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!master) return <p>Мастер не найден</p>;

  const isOwner =
    currentUser?.role === "master" &&
    String(currentUser?.id) === String(master.id);

  const isClient = currentUser?.role === "client";

  return (
    <div style={{ padding: "20px" }}>

      <h2>{master.name}</h2>
      <p>Email: {master.email}</p>

      {/* КНОПКА ЗАПИСИ */}
      {isClient && (
        <button
          onClick={() => navigate(`/booking/${master.id}`)}
          style={{ marginTop: "10px" }}
        >
          Записаться
        </button>
      )}

      {/* УПРАВЛЕНИЕ */}
      {isOwner && (
        <div style={{ marginTop: "20px" }}>
          <button onClick={() => navigate("/services")}>
            Управлять услугами
          </button>

          <button
            onClick={() => navigate("/schedule")}
            style={{ marginLeft: "10px" }}
          >
            Управлять расписанием
          </button>
        </div>
      )}

      {/* ПОРТФОЛИО — ВОТ ОНО */}
      <Portfolio
        masterId={master.id}
        isOwner={isOwner}
      />

      <button
        onClick={() => navigate("/masters")}
        style={{ marginTop: "30px" }}
      >
        На главную
      </button>

    </div>
  );
}

export default MasterProfilePage;