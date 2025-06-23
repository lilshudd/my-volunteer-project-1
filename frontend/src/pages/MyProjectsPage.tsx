import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { fetchWithAuth } from "../api/fetchWithAuth";
import { Link } from "react-router-dom";

type Project = {
  _id: string;
  title: string;
  description: string;
  organizer?: { name: string; email: string };
};

export default function MyProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjects();
    // eslint-disable-next-line
  }, []);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await fetchWithAuth("/api/projects/my");
      if (!res.ok) throw new Error("Помилка отримання проєктів");
      const data = await res.json();
      setProjects(data);
    } catch {
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLeave = async (projectId: string) => {
    if (!window.confirm("Ви впевнені, що хочете вийти з цього проєкту?")) return;
    try {
      const res = await fetchWithAuth(`/api/projects/${projectId}/participate`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Не вдалося вийти з проєкту");
      toast.success("Ви вийшли з проєкту");
      setProjects(projects.filter((p) => p._id !== projectId));
    } catch {
      toast.error("Сталася помилка");
    }
  };

  if (loading) return <div>Завантаження...</div>;

  return (
    <div className="my-projects-section">
      <div className="my-projects-title">Мої проєкти</div>
      {projects.length === 0 ? (
        <div style={{ color: "#b0bec5" }}>Ви ще не берете участі у жодному проєкті.</div>
      ) : (
        <ul className="my-projects-list">
          {projects.map((p) => (
            <li className="my-project-card" key={p._id}>
              <strong>
                <Link to={`/projects/${p._id}`}>{p.title}</Link>
              </strong>
              <div className="project-meta">{p.description}</div>
              {p.organizer && (
                <div className="project-meta">
                  Організатор: {p.organizer.name} ({p.organizer.email})
                </div>
              )}
              <button onClick={() => handleLeave(p._id)}>
                Вийти з проєкту
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}