import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export default function EditProfilePage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;
      try {
        const res = await fetch("/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setName(data.name);
          setEmail(data.email);
        }
      } catch {
        setError("Не вдалося отримати профіль");
      }
    };
    fetchProfile();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/auth/me", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, email, password: password || undefined }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Помилка оновлення профілю");
        toast.error(data.message || "Помилка оновлення профілю");
        return;
      }
      toast.success("Профіль оновлено!");
      navigate("/profile");
    } catch {
      setError("Сервер недоступний");
      toast.error("Сервер недоступний");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Редагування профілю</h2>
      <input
        type="text"
        placeholder="Ім'я"
        value={name}
        onChange={e => setName(e.target.value)}
        required
      />
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        required
      />
      <input
        type="password"
        placeholder="Новий пароль (не обов'язково)"
        value={password}
        onChange={e => setPassword(e.target.value)}
      />
      <button type="submit">Зберегти</button>
      {error && <div style={{ color: "red" }}>{error}</div>}
    </form>
  );
}