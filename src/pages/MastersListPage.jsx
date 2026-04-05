import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMasters } from "../api/api";
import MasterCard from "../components/MasterCard";

function MastersListPage() {
  const navigate = useNavigate();

  const [masters, setMasters] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMasters() {
      try {
        const data = await getMasters();
        setMasters(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }

    loadMasters();
  }, []);

  if (loading) {
    return <p>Загрузка мастеров...</p>;
  }

  console.log(masters);

  // группируем мастеров по специализации
  const grouped = masters.reduce((acc, master) => {
    const spec = master.specialization || "other";

    if (!acc[spec]) {
      acc[spec] = [];
    }

    acc[spec].push(master);
    return acc;
  }, {});

  // названия блоков
  const titles = {
    nails: "Ногтевой сервис",
    brows: "Бровисты",
    lashes: "Лэшмейкеры",
    hair: "Парикмахеры",
    massage: "SPA и массаж",
    cosmetology: "Косметология",
    other: "Другие специалисты"
  };

  return (
    <div style={{ padding: "30px" }}>
      <h1>Каталог мастеров</h1>

      {Object.entries(grouped).map(([spec, masters]) => (
        <div key={spec} style={{ marginTop: "40px" }}>
          <h2>{titles[spec] || spec}</h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(250px,1fr))",
              gap: "20px",
              marginTop: "15px"
            }}
          >
            {masters.map((master) => (
              <MasterCard key={master.id} master={master} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default MastersListPage;