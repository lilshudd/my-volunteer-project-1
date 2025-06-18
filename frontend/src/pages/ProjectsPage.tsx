import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import CreateProjectButton from "../components/CreateProjectButton";

type Project = {
  _id: string;
  name: string;
  description: string;
  image?: string;
  organizer: { _id: string; name?: string };
};

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [descFilter, setDescFilter] = useState("");
  const [authorFilter, setAuthorFilter] = useState("");

  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      setError("");
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("/api/projects", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) {
          throw new Error("Не вдалося отримати проєкти");
        }
        const data = await res.json();
        setProjects(data);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Помилка");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(search.toLowerCase()) &&
    project.description.toLowerCase().includes(descFilter.toLowerCase()) &&
    (authorFilter === "" ||
      (project.organizer?.name || "")
        .toLowerCase()
        .includes(authorFilter.toLowerCase()))
  );

  if (loading) return <div>Завантаження...</div>;
  if (error) return <div style={{ color: "red" }}>{error}</div>;

  return (
    <div>
      <div style={{ marginBottom: "1rem" }}>
        <CreateProjectButton /> {/* Замість Link */}
      </div>
      <input
        type="text"
        placeholder="Пошук за назвою..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        style={{ marginBottom: "0.5rem", width: "100%", maxWidth: 400 }}
      />
      <input
        type="text"
        placeholder="Пошук за описом..."
        value={descFilter}
        onChange={e => setDescFilter(e.target.value)}
        style={{ marginBottom: "0.5rem", width: "100%", maxWidth: 400 }}
      />
      <input
        type="text"
        placeholder="Пошук за автором..."
        value={authorFilter}
        onChange={e => setAuthorFilter(e.target.value)}
        style={{ marginBottom: "1rem", width: "100%", maxWidth: 400 }}
      />
      <h2>Список проєктів</h2>
      {filteredProjects.length === 0 && <div>Немає проєктів</div>}
      <ul>
        {filteredProjects.map((project) => (
          <li key={project._id}>
            <Link to={`/projects/${project._id}`}>
              <strong>{project.name}</strong>
            </Link>
            <div>{project.description}</div>
            {project.image && (
              <img
                src={`/uploads/${project.image}`}
                alt="Логотип проєкту"
                style={{ maxWidth: 100, maxHeight: 100 }}
              />
            )}
            <div>
              <small>
                Автор: {project.organizer?.name || "Невідомо"}
              </small>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}