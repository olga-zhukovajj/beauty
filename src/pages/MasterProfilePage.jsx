import { useParams, useNavigate } from "react-router-dom";
import { getMasters } from "../storage/masters";
import { getCurrentUser } from "../storage/currentUser";

function MasterProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const masters = getMasters();
  const currentUser = getCurrentUser();

  const master = masters.find((m) => m.id === id);

  if (!master) {
    return <p>Мастер не найден</p>;
  }

  const isOwner =
    currentUser &&
    currentUser.role === "master" &&
    currentUser.id === master.id;

  return (
    <div>
      <h2>{master.name}</h2>
      <p>{master.phone}</p>

      <h3>Портфолио</h3>
      <p>Здесь будут фотографии работ</p>

      <h3>Услуги</h3>

      {/* Если смотрит клиент */}
      {!isOwner && (
        <button onClick={() => navigate(`/booking/${master.id}`)}>
          Записаться
        </button>
      )}

      {/* Если мастер смотрит свой профиль */}
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
    </div>
  );
}

export default MasterProfilePage;