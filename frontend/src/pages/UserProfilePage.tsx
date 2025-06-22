import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchWithAuth } from "../api/fetchWithAuth";

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
        const res = await fetchWithAuth(`/api/auth/me`);
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
    <div className="profile-container">
      <div className="profile-title">Профіль користувача</div>
      <div className="profile-info">
        <div className="profile-info-row">
          <b>Ім'я:</b> <span>{user.name}</span>
        </div>
        <div className="profile-info-row">
          <b>Email:</b> <span>{user.email}</span>
        </div>
        <div className="profile-info-row">
          <b>Роль:</b> <span>{user.role}</span>
        </div>
      </div>
      <Link to="/profile/edit">
        <button className="profile-edit-btn">Редагувати профіль</button>
      </Link>
      <div className="profile-projects-title">Мої проєкти</div>
      {user.projects && user.projects.length > 0 ? (
        <ul className="profile-projects-list">
          {user.projects.map((p) => (
            <li key={p._id}>{p.name}</li>
          ))}
        </ul>
      ) : (
        <div style={{ color: "#b0bec5" }}>Ви ще не берете участі у жодному проєкті.</div>
      )}
    </div>
  );
}