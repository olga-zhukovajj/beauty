import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser, registerUser } from "../api/api";
import { saveToken, saveUser } from "../storage/auth";
import "../styles/pages/AuthPage.css";

function AuthPage() {
  const navigate = useNavigate();

  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState("client");

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    specialization: ""
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {

      if (isLogin) {

        const result = await loginUser({
          email: form.email,
          password: form.password
        });

        saveToken(result.token);
        saveUser(result.user);

        alert("Вход выполнен");

        if (result.user.role === "master") {
          navigate(`/master/${result.user.id}`);
        } else {
          navigate("/masters");
        }

      } else {

        await registerUser({
          name: form.name,
          email: form.email,
          password: form.password,
          phone: form.phone,
          role: role,
          specialization: role === "master" ? form.specialization : null
        });

        alert("Регистрация успешна");
        setIsLogin(true);

      }

    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="auth-page">

      {/* LEFT SIDE */}

      <div className="auth-hero">

        <div className="hero-overlay" />

      <div className="hero-content">

        <span className="hero-badge">
          personal beauty space
        </span>

        <h1>
          your beauty
          <br />
          begins here
        </h1>

        <p>
          Удобная платформа
          для записи к мастерам,
          управления услугами
          и работы с клиентами
        </p>

      </div>

      </div>

      {/* RIGHT SIDE */}

      <div className="auth-panel">

        <div className="auth-card">

          <h2>
            {isLogin
              ? "Вход"
              : "Регистрация"}
          </h2>

          {/* SWITCH */}

          <div className="auth-switch">

            <button
              type="button"
              className={isLogin ? "active" : ""}
              onClick={() => setIsLogin(true)}
            >
              Войти
            </button>

            <button
              type="button"
              className={!isLogin ? "active" : ""}
              onClick={() => setIsLogin(false)}
            >
              Регистрация
            </button>

          </div>

          {/* ROLE */}

          {!isLogin && (
            <div className="role-switch">

              <button
                type="button"
                className={
                  role === "client"
                    ? "active"
                    : ""
                }
                onClick={() => setRole("client")}
              >
                Клиент
              </button>

              <button
                type="button"
                className={
                  role === "master"
                    ? "active"
                    : ""
                }
                onClick={() => setRole("master")}
              >
                Мастер
              </button>

            </div>
          )}

          {/* FORM */}

          <form onSubmit={handleSubmit}>

            {!isLogin && (
              <>
                <input
                  type="text"
                  name="name"
                  placeholder="Имя"
                  value={form.name}
                  onChange={handleChange}
                  required
                />

                <input
                  type="text"
                  name="phone"
                  placeholder="Телефон"
                  value={form.phone}
                  onChange={handleChange}
                  required
                />
              </>
            )}

            {!isLogin && role === "master" && (
              <select
                name="specialization"
                value={form.specialization}
                onChange={handleChange}
                required
              >
                <option value="">
                  Специализация
                </option>

                <option value="nails">
                  Ногтевой сервис
                </option>

                <option value="brows">
                  Бровист
                </option>

                <option value="lashes">
                  Лэшмейкер
                </option>

                <option value="hair">
                  Парикмахер
                </option>

                <option value="massage">
                  Массаж
                </option>

                <option value="cosmetology">
                  Косметолог
                </option>

              </select>
            )}

            <input
              type="email"
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              required
            />

            <input
              type="password"
              name="password"
              placeholder="Пароль"
              value={form.password}
              onChange={handleChange}
              required
            />

            <button
              type="submit"
              className="submit-btn"
            >
              {isLogin
                ? "Войти"
                : "Создать аккаунт"}
            </button>

          </form>

        </div>

      </div>

    </div>
);
}

export default AuthPage;