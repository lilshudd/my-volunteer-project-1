import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { useUserUpdate } from "../context/UserContext";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [wantsOrganizer, setWantsOrganizer] = useState(false);
  const [error, setError] = useState("");
  const [validationError, setValidationError] = useState("");
  const navigate = useNavigate();
  const setUser = useUserUpdate();

  const validate = () => {
    if (!name.trim()) return "Введіть ім'я";
    if (!email.match(/^[\w-.]+@[\w-]+\.[a-z]{2,}$/i)) return "Некоректний email";
    if (password.length < 6) return "Пароль має містити мінімум 6 символів";
    return "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const vError = validate();
    if (vError) {
      setValidationError(vError);
      toast.warn(vError);
      return;
    }
    setValidationError("");
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name, organizerRequest: wantsOrganizer }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Помилка реєстрації");
        toast.error(data.message || "Помилка реєстрації");
        return;
      }
      if (data.accessToken) {
        localStorage.setItem("token", data.accessToken);
        localStorage.setItem("user", JSON.stringify({ name: data.user.name, email: data.user.email, role: data.user.role }));
        setUser();
        toast.success("Реєстрація успішна!");
        navigate("/");
      } else {
        toast.success("Реєстрація успішна! Увійдіть у систему.");
        navigate("/login");
      }
    } catch {
      setError("Сервер недоступний");
      toast.error("Сервер недоступний");
    }
  };

  return (
    <div className="container">
    <form onSubmit={handleSubmit}>
      <h2>Реєстрація</h2>
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
        placeholder="Пароль"
        value={password}
        onChange={e => setPassword(e.target.value)}
        required
      />
      <label style={{ display: "block", margin: "10px 0" }}>
        <input
          type="checkbox"
          checked={wantsOrganizer}
          onChange={e => setWantsOrganizer(e.target.checked)}
        />
        Я хочу створювати проєкти (стати волонтером)
      </label>
      <button type="submit">Зареєструватися</button>
      {validationError && <div style={{ color: "orange" }}>{validationError}</div>}
      {error && <div style={{ color: "red" }}>{error}</div>}
      <div>
        Вже є акаунт? <Link to="/login">Увійти</Link>
      </div>
    </form>
    </div>
  );
}