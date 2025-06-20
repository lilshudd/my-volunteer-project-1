import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { fetchWithAuth } from "../api/fetchWithAuth";

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
    <div className="container">
      <h2>Мої проєкти</h2>
      {projects.length === 0 ? (
        <div>Ви ще не берете участь у жодному проєкті.</div>
      ) : (
        <ul>
          {projects.map((p) => (
            <li key={p._id} style={{ marginBottom: "1rem" }}>
              <strong>{p.title}</strong>
              <div>{p.description}</div>
              {p.organizer && (
                <div>
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