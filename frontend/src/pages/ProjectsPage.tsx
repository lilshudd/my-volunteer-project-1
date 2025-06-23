import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import CreateProjectButton from "../components/CreateProjectButton";
import { fetchWithAuth } from "../api/fetchWithAuth";

type Project = {
  _id: string;
  title: string;
  description: string;
  image?: string;
  organizer?: { _id: string; name?: string };
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
        const res = await fetchWithAuth("/api/projects");
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
    (project.title || "")
      .toLowerCase()
      .includes(search.toLowerCase()) &&
    (project.description || "")
      .toLowerCase()
      .includes(descFilter.toLowerCase()) &&
    (authorFilter === "" ||
      ((project.organizer?.name || "")
        .toLowerCase()
        .includes(authorFilter.toLowerCase())))
  );

  if (loading) return <div>Завантаження...</div>;
  if (error) return <div style={{ color: "red" }}>{error}</div>;

  return (
    <div className="container">
      <div style={{ marginBottom: "1rem" }}>
        <CreateProjectButton />
      </div>
      <div className="projects-filters">
        <input
          type="text"
          placeholder="Пошук за назвою..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <input
          type="text"
          placeholder="Пошук за описом..."
          value={descFilter}
          onChange={e => setDescFilter(e.target.value)}
        />
        <input
          type="text"
          placeholder="Пошук за автором..."
          value={authorFilter}
          onChange={e => setAuthorFilter(e.target.value)}
        />
      </div>
      <h2 style={{ marginBottom: "1.2rem" }}>Список проєктів</h2>
      {filteredProjects.length === 0 && <div>Немає проєктів</div>}
      <ul className="project-list">
        {filteredProjects.map((project) => (
          <li key={project._id} className="project-card">
            <Link to={`/projects/${project._id}`}>
              <strong>{project.title}</strong>
            </Link>
            <div>{project.description}</div>
            {project.image && (
  <img
    src={`http://localhost:5000/uploads/${project.image}`}
    alt="Логотип проєкту"
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