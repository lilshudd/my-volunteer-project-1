import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchWithAuth } from "../api/fetchWithAuth";
import MDEditor from "@uiw/react-md-editor";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

function MapClick({ setLat, setLng }: { setLat: (v: string) => void; setLng: (v: string) => void }) {
  useMapEvents({
    click(e: L.LeafletMouseEvent) {
      setLat(String(e.latlng.lat));
      setLng(String(e.latlng.lng));
    },
  });
  return null;
}

export default function EditProjectPage() {
  const { id } = useParams<{ id: string }>();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [dateStart, setDateStart] = useState("");
  const [dateEnd, setDateEnd] = useState("");
  const [donationLink, setDonationLink] = useState("");
  const [urgent, setUrgent] = useState(false);
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [currentImage, setCurrentImage] = useState<string | undefined>(undefined);
  const [image, setImage] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [validationError, setValidationError] = useState("");
  const [loadingGeo, setLoadingGeo] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const res = await fetchWithAuth(`/api/projects/${id}`);
        if (!res.ok) throw new Error("Не вдалося отримати проєкт");
        const data = await res.json();
        setTitle(data.title || "");
        setDescription(data.description || "");
        setLocation(data.location || "");
        setDateStart(data.dateStart ? data.dateStart.slice(0, 10) : "");
        setDateEnd(data.dateEnd ? data.dateEnd.slice(0, 10) : "");
        setDonationLink(data.donationLink || "");
        setUrgent(!!data.urgent);
        if (Array.isArray(data.locationCoords) && data.locationCoords.length === 2) {
          setLat(String(data.locationCoords[0]));
          setLng(String(data.locationCoords[1]));
        }
        setCurrentImage(data.image);
      } catch {
        setError("Помилка завантаження проєкту");
      }
    };
    fetchProject();
  }, [id]);

  const validate = () => {
    if (!title.trim()) return "Введіть назву проєкту";
    if (title.length < 3) return "Назва має містити мінімум 3 символи";
    if (!description || description.replace(/<[^>]+>/g, '').trim().length < 10)
      return "Опис має містити мінімум 10 символів";
    if (!location.trim()) return "Вкажіть місце проведення";
    if (!dateStart) return "Вкажіть дату початку";
    if (dateEnd && dateEnd < dateStart) return "Дата завершення не може бути раніше дати початку";
    if (donationLink && !/^https?:\/\/.+/.test(donationLink)) return "Введіть коректне посилання на банку";
    if ((lat && !lng) || (!lat && lng)) return "Вкажіть і широту, і довготу, або залиште обидва поля порожніми";
    if ((lat && isNaN(Number(lat))) || (lng && isNaN(Number(lng)))) return "Координати мають бути числами";
    return "";
  };

  const handleGeocode = async () => {
    if (!location) return;
    setLoadingGeo(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}`
      );
      const data = await res.json();
      if (data && data[0]) {
        setLat(data[0].lat);
        setLng(data[0].lon);
      } else {
        alert("Координати не знайдено");
      }
    } catch {
      alert("Помилка геокодування");
    }
    setLoadingGeo(false);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    const vError = validate();
    if (vError) {
      setValidationError(vError);
      return;
    }
    setValidationError("");
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("location", location);
      formData.append("dateStart", dateStart);
      if (dateEnd) formData.append("dateEnd", dateEnd);
      if (donationLink) formData.append("donationLink", donationLink);
      if (image) formData.append("image", image);
      formData.append("urgent", urgent ? "true" : "false");
      if (lat && lng) formData.append("locationCoords", JSON.stringify([Number(lat), Number(lng)]));

      const res = await fetchWithAuth(`/api/projects/${id}`, {
        method: "PUT",
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
    <div className="container">
      <form onSubmit={handleSubmit}>
        <h2>Редагувати проєкт</h2>
        <input
          type="text"
          placeholder="Назва проєкту"
          value={title}
          onChange={e => setTitle(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Місце проведення"
          value={location}
          onChange={e => setLocation(e.target.value)}
          required
        />
        <button type="button" onClick={handleGeocode} disabled={loadingGeo} style={{marginBottom: 8}}>
          {loadingGeo ? "Пошук..." : "Знайти координати за адресою"}
        </button>
        <MDEditor
          value={description}
          onChange={value => setDescription(value || "")}
          height={200}
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
          type="url"
          placeholder="Посилання на банку (Monobank, PrivatBank тощо)"
          value={donationLink}
          onChange={e => setDonationLink(e.target.value)}
        />
        <label>
          <input
            type="checkbox"
            checked={urgent}
            onChange={e => setUrgent(e.target.checked)}
          />{" "}
          Терміновий проєкт
        </label>
        <div style={{ display: "flex", gap: 8, margin: "0.5rem 0" }}>
          <input
            type="number"
            placeholder="Широта (latitude)"
            value={lat}
            onChange={e => setLat(e.target.value)}
            step="any"
            style={{ flex: 1 }}
          />
          <input
            type="number"
            placeholder="Довгота (longitude)"
            value={lng}
            onChange={e => setLng(e.target.value)}
            step="any"
            style={{ flex: 1 }}
          />
        </div>
        {/* Карта для вибору координат */}
        <div style={{ margin: "1rem 0" }}>
          <MapContainer
            center={[lat ? Number(lat) : 49, lng ? Number(lng) : 32]}
            zoom={lat && lng ? 12 : 6}
            style={{ height: 250, width: "100%", borderRadius: 10 }}
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <MapClick setLat={setLat} setLng={setLng} />
            {lat && lng && (
              <Marker position={[Number(lat), Number(lng)]} />
            )}
          </MapContainer>
          <div style={{ fontSize: 13, color: "#888" }}>
            Натисніть на карту, щоб вибрати координати
          </div>
        </div>
        {currentImage && (
          <div>
{currentImage && (
  <div>
    <img
      src={`http://localhost:5000/uploads/${currentImage}`}
      alt="Логотип проєкту"
      style={{ maxWidth: 120, maxHeight: 120, marginBottom: "1rem" }}
    />
  </div>
)}
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
    </div>
  );
}