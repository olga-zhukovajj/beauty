import { getMasters } from "../storage/masters";
import { useNavigate } from "react-router-dom";

function MastersListPage() {
  const navigate = useNavigate();
  const masters = getMasters();

  if (!masters.length) {
    return <p>Мастера пока не зарегистрированы</p>;
  }

  return (
    <div>
      <h2>Выберите мастера</h2>

      {masters.map((master) => (
        <div
          key={master.id}
          style={{
            border: "1px solid #ccc",
            padding: "15px",
            marginBottom: "10px",
            cursor: "pointer"
          }}
          onClick={() =>
            navigate(`/master/${master.id}`)
          }
        >
          <h3>{master.name}</h3>
          <p>{master.phone}</p>
        </div>
      ))}
    </div>
  );
}

export default MastersListPage;