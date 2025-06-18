import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

type Project = {
  _id: string;
  name: string;
};

type User = {
  _id: string;
  name: string;
  email: string;
  role: string;
  projects?: Project[];
};

export default function UserProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      setError("");
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`/api/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) throw new Error("Не вдалося отримати дані користувача");
        const data = await res.json();
        setUser(data);
      } catch (err: unknown) {
        if (err instanceof Error) setError(err.message);
        else setError("Помилка");
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  if (loading) return <div>Завантаження...</div>;
  if (error) return <div style={{ color: "red" }}>{error}</div>;
  if (!user) return <div>Користувача не знайдено</div>;

  return (
    <div>
      <h2>Профіль користувача</h2>
      <div><b>Ім'я:</b> {user.name}</div>
      <div><b>Email:</b> {user.email}</div>
      <div><b>Роль:</b> {user.role}</div>
      <Link to="/profile/edit">
        <button style={{ marginTop: "1rem" }}>Редагувати профіль</button>
      </Link>
      <h3 style={{ marginTop: "2rem" }}>Мої проєкти</h3>
      {user.projects && user.projects.length > 0 ? (
        <ul>
          {user.projects.map((p) => (
            <li key={p._id}>{p.name}</li>
          ))}
        </ul>
      ) : (
        <div>Ви ще не берете участі у жодному проєкті.</div>
      )}
    </div>
  );
}