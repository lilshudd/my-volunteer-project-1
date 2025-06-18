import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function EditProjectPage() {
  const { id } = useParams<{ id: string }>();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [currentImage, setCurrentImage] = useState<string | undefined>(undefined);
  const [image, setImage] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [validationError, setValidationError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`/api/projects/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) throw new Error("Не вдалося отримати проєкт");
        const data = await res.json();
        setName(data.name || data.title || "");
        setDescription(data.description || "");
        setCurrentImage(data.image);
      } catch {
        setError("Помилка завантаження проєкту");
      }
    };
    fetchProject();
  }, [id]);

  const validate = () => {
    if (!name.trim()) return "Введіть назву проєкту";
    if (name.length < 3) return "Назва має містити мінімум 3 символи";
    if (!description.trim()) return "Введіть опис проєкту";
    if (description.length < 10) return "Опис має містити мінімум 10 символів";
    return "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const vError = validate();
    if (vError) {
      setValidationError(vError);
      return;
    }
    setValidationError("");
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("name", name);
      formData.append("description", description);
      if (image) formData.append("image", image);

      const res = await fetch(`/api/projects/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.message || "Помилка оновлення проєкту");
        return;
      }
      navigate(`/projects/${id}`);
    } catch {
      setError("Сервер недоступний");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Редагувати проєкт</h2>
      <input
        type="text"
        placeholder="Назва проєкту"
        value={name}
        onChange={e => setName(e.target.value)}
        required
      />
      <textarea
        placeholder="Опис"
        value={description}
        onChange={e => setDescription(e.target.value)}
        required
      />
      {currentImage && (
        <div>
          <img
            src={`/uploads/${currentImage}`}
            alt="Логотип проєкту"
            style={{ maxWidth: 120, maxHeight: 120, marginBottom: "1rem" }}
          />
        </div>
      )}
      <input
        type="file"
        accept="image/*"
        onChange={e => setImage(e.target.files?.[0] || null)}
      />
      <button type="submit">Зберегти</button>
      {validationError && <div style={{ color: "orange" }}>{validationError}</div>}
      {error && <div style={{ color: "red" }}>{error}</div>}
    </form>
  );
}