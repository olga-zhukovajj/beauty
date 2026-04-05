import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser, registerUser } from "../api/api";
import { saveToken, saveUser } from "../storage/auth";

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
    <div>
      <h2>{isLogin ? "Вход" : "Регистрация"}</h2>

      <div style={{ marginBottom: "15px" }}>
        <button type="button" onClick={() => setIsLogin(true)}>
          Войти
        </button>

        <button
          type="button"
          onClick={() => setIsLogin(false)}
          style={{ marginLeft: "10px" }}
        >
          Зарегистрироваться
        </button>
      </div>

      {!isLogin && (
        <div style={{ marginBottom: "15px" }}>
          <label>
            <input
              type="radio"
              value="client"
              checked={role === "client"}
              onChange={(e) => setRole(e.target.value)}
            />
            Клиент
          </label>

          <label style={{ marginLeft: "15px" }}>
            <input
              type="radio"
              value="master"
              checked={role === "master"}
              onChange={(e) => setRole(e.target.value)}
            />
            Мастер
          </label>
        </div>
      )}

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
            <option value="">Выберите специализацию</option>
            <option value="nails">Ногтевой сервис</option>
            <option value="brows">Бровист</option>
            <option value="lashes">Лэшмейкер</option>
            <option value="hair">Парикмахер</option>
            <option value="massage">Массаж</option>
            <option value="cosmetology">Косметолог</option>
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

        <button type="submit">
          {isLogin ? "Войти" : "Зарегистрироваться"}
        </button>

      </form>
    </div>
  );
}

export default AuthPage;