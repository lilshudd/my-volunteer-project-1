import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { fetchWithAuth } from "../api/fetchWithAuth";
import MDEditor from "@uiw/react-md-editor";

type Project = {
  _id: string;
  title: string;
  description: string;
  image?: string;
  participants?: string[];
  organizer: { _id: string; name?: string; email?: string };
  location?: string;
  dateStart?: string;
  dateEnd?: string;
};

function getUserIdFromToken(): string | null {
  const token = localStorage.getItem("token");
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.id || payload._id || null;
  } catch {
    return null;
  }
}

export default function ProjectDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [joining, setJoining] = useState(false);
  const [joinError, setJoinError] = useState("");
  const navigate = useNavigate();

  const userId = getUserIdFromToken();

  useEffect(() => {
    const fetchProject = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetchWithAuth(`/api/projects/${id}`);
        if (!res.ok) {
          throw new Error("Не вдалося отримати проєкт");
        }
        const data = await res.json();
        setProject(data);
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
    fetchProject();
  }, [id]);

  const handleJoin = async () => {
    setJoining(true);
    setJoinError("");
    try {
      const res = await fetchWithAuth(`/api/projects/${id}/participate`, {
        method: "POST",
      });
      if (!res.ok) {
        const data = await res.json();
        toast.error(data.message || "Не вдалося приєднатися");
        throw new Error(data.message || "Не вдалося приєднатися");
      }
      const updated = await res.json();
      setProject(updated);
      toast.success("Ви приєдналися до проєкту!");
    } catch (err: unknown) {
      if (err instanceof Error) setJoinError(err.message);
      else setJoinError("Помилка приєднання");
    } finally {
      setJoining(false);
    }
  };

  const handleLeave = async () => {
    setJoining(true);
    setJoinError("");
    try {
      const res = await fetchWithAuth(`/api/projects/${id}/participate`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json();
        toast.error(data.message || "Не вдалося вийти з проєкту");
        throw new Error(data.message || "Не вдалося вийти з проєкту");
      }
      const updated = await res.json();
      setProject(updated);
      toast.info("Ви вийшли з проєкту");
    } catch (err: unknown) {
      if (err instanceof Error) setJoinError(err.message);
      else setJoinError("Помилка виходу");
    } finally {
      setJoining(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Ви впевнені, що хочете видалити цей проєкт?")) return;
    try {
      const res = await fetchWithAuth(`/api/projects/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        toast.error("Не вдалося видалити проєкт");
        throw new Error("Не вдалося видалити проєкт");
      }
      toast.success("Проєкт видалено!");
      navigate("/projects");
    } catch {
      toast.error("Помилка видалення");
    }
  };

  if (loading) return <div>Завантаження...</div>;
  if (error) return <div style={{ color: "red" }}>{error}</div>;
  if (!project) return <div>Проєкт не знайдено</div>;

  const isParticipant = project.participants?.includes(userId || "");
  const isAuthor = project.organizer && project.organizer._id === userId;

  return (
    <div className="container">
      <h2>{project.title}</h2>
      {/* Інформаційний блок про проєкт */}
      <div className="project-info-block">
        <div>
          <strong>Організатор:</strong> {project.organizer?.name || "Невідомо"}
        </div>
        <div>
          <strong>Кількість учасників:</strong> {project.participants?.length || 0}
        </div>
        <div>
          <strong>Місце проведення:</strong> {project.location || "Не вказано"}
        </div>
        <div>
          <strong>Дата початку:</strong>{" "}
          {project.dateStart ? new Date(project.dateStart).toLocaleDateString() : "Не вказано"}
        </div>
        <div>
          <strong>Дата завершення:</strong>{" "}
          {project.dateEnd ? new Date(project.dateEnd).toLocaleDateString() : "Не вказано"}
        </div>
      </div>
      <MDEditor.Markdown source={project.description} />
      {project.image && (
        <img
          src={`/uploads/${project.image}`}
          alt="Логотип проєкту"
          style={{ maxWidth: 200, maxHeight: 200, marginBottom: "1rem" }}
        />
      )}
      {isAuthor && (
        <div style={{ marginTop: "1rem" }}>
          <Link to={`/projects/${project._id}/edit`}>
            <button>Редагувати</button>
          </Link>
          <button onClick={handleDelete} style={{ marginLeft: "1rem", color: "red" }}>
            Видалити
          </button>
        </div>
      )}
      <div style={{ marginTop: "2rem" }}>
        {isParticipant ? (
          <button onClick={handleLeave} disabled={joining}>
            {joining ? "Вихід..." : "Вийти з проєкту"}
          </button>
        ) : (
          <button onClick={handleJoin} disabled={joining}>
            {joining ? "Приєднання..." : "Приєднатися до проєкту"}
          </button>
        )}
        {joinError && <div style={{ color: "red" }}>{joinError}</div>}
      </div>
    </div>
  );
}