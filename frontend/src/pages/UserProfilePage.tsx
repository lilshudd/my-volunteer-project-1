import { Link } from "react-router-dom";
import { useUser } from "../context/UserContext";

export default function UserProfilePage() {
  const user = useUser();

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
            <li key={p._id}>
              <Link to={`/projects/${p._id}`}>{p.name || p.title}</Link>
            </li>
          ))}
        </ul>
      ) : (
        <div style={{ color: "#b0bec5" }}>Ви ще не берете участі у жодному проєкті.</div>
      )}
    </div>
  );
}