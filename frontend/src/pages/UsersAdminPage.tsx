import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { fetchWithAuth } from "../api/fetchWithAuth";

type User = {
  _id: string;
  name: string;
  email: string;
  role: string;
};

const roles = ["user", "organizer", "admin"];

export default function UsersAdminPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [editRoles, setEditRoles] = useState<{ [id: string]: string }>({});

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetchWithAuth("/api/auth/users");
      if (!res.ok) throw new Error("Помилка отримання користувачів");
      const data = await res.json();
      setUsers(data);
    } catch {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = (id: string, newRole: string) => {
    setEditRoles((prev) => ({ ...prev, [id]: newRole }));
  };

  const handleSaveRole = async (id: string) => {
    const newRole = editRoles[id];
    try {
      const res = await fetchWithAuth(`/api/auth/users/${id}/role`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ role: newRole }),
      });
      if (!res.ok) throw new Error("Не вдалося змінити роль");
      toast.success("Роль оновлено");
      setEditRoles((prev) => {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      });
      fetchUsers();
    } catch {
      toast.error("Помилка при оновленні ролі");
    }
  };

  if (loading) return <div>Завантаження...</div>;

  return (
    <div className="container">
      <h2>Всі користувачі</h2>
      <table>
        <thead>
          <tr>
            <th>Ім'я</th>
            <th>Email</th>
            <th>Роль</th>
            <th>Дія</th>
          </tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u._id}>
              <td>{u.name}</td>
              <td>{u.email}</td>
              <td>
                <select
                  value={editRoles[u._id] ?? u.role}
                  onChange={e => handleRoleChange(u._id, e.target.value)}
                  disabled={u._id === users.find(user => user.role === "admin")?._id}
                >
                  {roles.map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </td>
              <td>
                <button
                  onClick={() => handleSaveRole(u._id)}
                  disabled={editRoles[u._id] === undefined || editRoles[u._id] === u.role}
                >
                  Зберегти
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}