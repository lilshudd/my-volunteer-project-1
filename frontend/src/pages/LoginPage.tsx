import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { useUserUpdate } from "../context/UserContext";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const setUser = useUserUpdate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Помилка входу");
        toast.error(data.message || "Помилка входу");
        return;
      }
      localStorage.setItem("token", data.accessToken);
      localStorage.setItem("user", JSON.stringify({ name: data.user.name, email: data.user.email, role: data.user.role }));
      await setUser();
      toast.success("Вхід успішний!");
      navigate("/");
    } catch {
      setError("Сервер недоступний");
      toast.error("Сервер недоступний");
    }
  };

  return (
    <div className="container">
    <form onSubmit={handleSubmit}>
      <h2>Вхід</h2>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        required
      />
      <input
        type="password"
        placeholder="Пароль"
        value={password}
        onChange={e => setPassword(e.target.value)}
        required
      />
      <button type="submit">Увійти</button>
      {error && <div style={{ color: "red" }}>{error}</div>}
      <div>
        Ще не маєте акаунта? <Link to="/signup">Зареєструватися</Link>
      </div>
    </form>
    </div>
  );
}