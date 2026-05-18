import { useEffect, useState } from "react";
import { getMasters } from "../api/api";
import MasterCard from "../components/MasterCard";

import "../styles/pages/MastersListPage.css";

function MastersListPage() {
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
    return <p className="loading">Загрузка...</p>;
  }

  const grouped = masters.reduce((acc, master) => {
    const spec = master.specialization || "other";

    if (!acc[spec]) {
      acc[spec] = [];
    }

    acc[spec].push(master);

    return acc;
  }, {});

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
    <div className="masters-page">

      <section className="hero-section">
        <div className="hero-floating float-1"></div>
        <div className="hero-floating float-2"></div>
        <div className="hero-floating float-3"></div>
        <div className="hero-content">

          <span className="hero-badge">
            beauty booking platform
          </span>

            <h1>
              Найдите мастера,
              <br />
              которому доверите себя
            </h1>

            <p>
              Онлайн-запись к частным beauty-специалистам.
              Удобный поиск, услуги и бронирование в одном месте.
            </p>

          </div>

        </section>
      <div className="content-wrapper">

        {Object.entries(grouped).map(([spec, masters]) => (
          <section
            className="category-section"
            key={spec}
          >
            <div className="category-header">
              <h2>{titles[spec] || spec}</h2>
            </div>

            <div className="masters-grid">

              {masters.map((master) => (
                <MasterCard
                  key={master.id}
                  master={master}
                />
              ))}

            </div>
          </section>
        ))}

      </div>

    </div>
  );
}

export default MastersListPage;