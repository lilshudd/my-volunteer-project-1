import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { fetchWithAuth } from "../api/fetchWithAuth";

type User = {
  _id: string;
  name: string;
  email: string;
  role: string;
};

export default function AdminRequestsPage() {
  const [requests, setRequests] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRequests = async () => {
      setLoading(true);
      try {
        const res = await fetchWithAuth("/api/auth/organizer-requests");
        if (!res.ok) throw new Error("Помилка отримання заявок");
        const data = await res.json();
        setRequests(data);
      } catch {
        toast.error("Помилка отримання заявок");
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, []);

  const approve = async (id: string) => {
    try {
      const res = await fetchWithAuth(`/api/auth/approve-organizer/${id}`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Помилка підтвердження");
      toast.success("Роль організатора видано!");
      setRequests(reqs => reqs.filter(u => u._id !== id));
    } catch {
      toast.error("Помилка підтвердження");
    }
  };

  if (loading) return <div>Завантаження...</div>;

  return (
    <div className="container">
      <h2>Заявки на роль волонтера</h2>
      {requests.length === 0 ? (
        <div>Немає нових заявок</div>
      ) : (
        <ul>
          {requests.map(u => (
            <li key={u._id}>
              {u.name} ({u.email}){" "}
              <button onClick={() => approve(u._id)}>Підтвердити</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}