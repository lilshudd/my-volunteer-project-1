import { BrowserRouter, Routes, Route, NavLink, useNavigate } from 'react-router-dom';
import { useEffect, useState } from "react";
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ProjectsPage from './pages/ProjectsPage';
import HomePage from './pages/HomePage';
import CreateProjectPage from './pages/CreateProjectPage';
import ProjectDetailsPage from './pages/ProjectDetailsPage';
import EditProjectPage from './pages/EditProjectPage';
import UserProfilePage from './pages/UserProfilePage';
import EditProfilePage from './pages/EditProfilePage';
import PrivateRoute from './components/PrivateRoute';
import { UserContext, UserUpdateContext } from "./context/UserContext";
import type { UserType } from "./context/UserContext";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AdminRequestsPage from './pages/AdminRequestsPage';
import MyProjectsPage from './pages/MyProjectsPage';
import UsersAdminPage from './pages/UsersAdminPage';
import Footer from "./components/Footer";

function NavBar() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const token = localStorage.getItem("token");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    toast.info("Ви вийшли з акаунта");
    navigate("/login");
  };

  return (
    <nav>
      <ul className="nav-list">
        <li>
          <NavLink to="/" end>
            🏠 Home
          </NavLink>
        </li>
        <li>
          <NavLink to="/projects">📋 Projects</NavLink>
        </li>
        {user && (
          <li>
            <NavLink to="/my-projects">⭐ Мої проєкти</NavLink>
          </li>
        )}
        {user && (user.role === "organizer" || user.role === "admin") && (
          <li>
            <NavLink to="/projects/create">➕ Створити</NavLink>
          </li>
        )}
        {user && user.role === "admin" && (
          <>
            <li>
              <NavLink to="/admin/requests">📝 Заявки</NavLink>
            </li>
            <li>
              <NavLink to="/admin/users">👤 Користувачі</NavLink>
            </li>
          </>
        )}
        {token && (
          <li>
            <NavLink to="/profile">👤 Профіль</NavLink>
          </li>
        )}
        {!token && (
          <>
            <li>
              <NavLink to="/login">🔑 Login</NavLink>
            </li>
            <li>
              <NavLink to="/signup">🆕 Signup</NavLink>
            </li>
          </>
        )}
        {token && (
          <li>
            <button onClick={handleLogout} className="nav-logout-btn">
              🚪 Вийти
            </button>
          </li>
        )}
      </ul>
    </nav>
  );
}

export default function App() {
  const [user, setUser] = useState<UserType>(() => {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  });
  const [prevRole, setPrevRole] = useState<string | null>(user?.role || null);

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;
      try {
        const res = await fetch("/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          if (prevRole && prevRole !== data.role) {
            toast.info(`Ваша роль змінена на "${data.role}"`);
          }
          setPrevRole(data.role);
          setUser({ name: data.name, email: data.email, role: data.role });
          localStorage.setItem("user", JSON.stringify({ name: data.name, email: data.email, role: data.role }));
        }
      } catch {
        // toast.error("Не вдалося отримати профіль користувача");
      }
    };
    fetchProfile();
    const interval = setInterval(fetchProfile, 30000); // Оновлення кожні 30 секунд
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prevRole]);

  return (
    <UserContext.Provider value={user}>
      <UserUpdateContext.Provider value={setUser}>
        <BrowserRouter basename="/my-volunteer-project">
          <NavBar />
          <ToastContainer position="top-right" autoClose={3000} />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route
              path="/projects"
              element={
                <PrivateRoute>
                  <ProjectsPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/projects/:id"
              element={
                <PrivateRoute>
                  <ProjectDetailsPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/projects/:id/edit"
              element={
                <PrivateRoute>
                  <EditProjectPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/projects/create"
              element={
                <PrivateRoute roles={["organizer", "admin"]}>
                  <CreateProjectPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <PrivateRoute>
                  <UserProfilePage />
                </PrivateRoute>
              }
            />
            <Route
              path="/profile/edit"
              element={
                <PrivateRoute>
                  <EditProfilePage />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/requests"
              element={
                <PrivateRoute roles={["admin"]}>
                  <AdminRequestsPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <PrivateRoute roles={["admin"]}>
                  <UsersAdminPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/my-projects"
              element={
                <PrivateRoute>
                  <MyProjectsPage />
                </PrivateRoute>
              }
            />
          </Routes>
          <Footer />
        </BrowserRouter>
      </UserUpdateContext.Provider>
    </UserContext.Provider>
  );
}