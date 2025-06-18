import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function CreateProjectPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dateStart, setDateStart] = useState("");
  const [dateEnd, setDateEnd] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [validationError, setValidationError] = useState("");
  const navigate = useNavigate();

  const validate = () => {
    if (!title.trim()) return "Введіть назву проєкту";
    if (title.length < 3) return "Назва має містити мінімум 3 символи";
    if (!description.trim()) return "Введіть опис проєкту";
    if (description.length < 10) return "Опис має містити мінімум 10 символів";
    if (!dateStart) return "Вкажіть дату початку";
    if (dateEnd && dateEnd < dateStart) return "Дата завершення не може бути раніше дати початку";
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
      formData.append("title", title);
      formData.append("description", description);
      formData.append("dateStart", dateStart);
      if (dateEnd) formData.append("dateEnd", dateEnd);
      if (image) formData.append("image", image);

      const res = await fetch("/api/projects", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.message || "Помилка створення проєкту");
        return;
      }
      navigate("/projects");
    } catch {
      setError("Сервер недоступний");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Створити новий проєкт</h2>
      <input
        type="text"
        placeholder="Назва проєкту"
        value={title}
        onChange={e => setTitle(e.target.value)}
        required
      />
      <textarea
        placeholder="Опис"
        value={description}
        onChange={e => setDescription(e.target.value)}
        required
      />
      <input
        type="date"
        value={dateStart}
        onChange={e => setDateStart(e.target.value)}
        required
      />
      <input
        type="date"
        value={dateEnd}
        onChange={e => setDateEnd(e.target.value)}
      />
      <input
        type="file"
        accept="image/*"
        onChange={e => setImage(e.target.files?.[0] || null)}
      />
      <button type="submit">Створити</button>
      {validationError && <div style={{ color: "orange" }}>{validationError}</div>}
      {error && <div style={{ color: "red" }}>{error}</div>}
    </form>
  );
}