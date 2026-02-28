import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createMaster } from "../models/master";
import { getMasters, saveMasters } from "../storage/masters";
import { setCurrentUser } from "../storage/currentUser";

function AuthPage() {
  const navigate = useNavigate();

  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState("client");

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: ""
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (isLogin) {
      // ===== LOGIN =====
      const masters = getMasters();
      const clients =
        JSON.parse(localStorage.getItem("clients")) || [];

      const user =
        masters.find((m) => m.email === form.email && m.password === form.password) ||
        clients.find((c) => c.email === form.email && c.password === form.password);

      if (!user) {
        alert("Неверный email или пароль");
        return;
      }

      setCurrentUser(user);
      navigate("/dashboard");
    } else {
      // ===== REGISTER =====
      if (role === "master") {
        const masters = getMasters();

        const existing = masters.find(
          (m) => m.email === form.email
        );

        if (existing) {
          alert("Email уже используется");
          return;
        }

        const newMaster = createMaster({
          ...form,
          role: "master"
        });

        saveMasters([...masters, newMaster]);
        setCurrentUser(newMaster);
      } else {
        const clients =
          JSON.parse(localStorage.getItem("clients")) || [];

        const existing = clients.find(
          (c) => c.email === form.email
        );

        if (existing) {
          alert("Email уже используется");
          return;
        }

        const newClient = {
          id: Date.now().toString(),
          ...form,
          role: "client"
        };

        localStorage.setItem(
          "clients",
          JSON.stringify([...clients, newClient])
        );

        setCurrentUser(newClient);
      }

      navigate("/dashboard");
    }
  };

  return (
    <div>
      <h2>{isLogin ? "Вход" : "Регистрация"}</h2>

      <div style={{ marginBottom: "15px" }}>
        <button onClick={() => setIsLogin(true)}>Войти</button>
        <button
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