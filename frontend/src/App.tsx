import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom';
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
    <nav style={{ marginBottom: '1rem' }}>
      <Link to="/">Home</Link> |{" "}
      <Link to="/projects">Projects</Link> |{" "}
      {user && <Link to="/my-projects">Мої проєкти</Link>} |{" "}
      {user && (user.role === "organizer" || user.role === "admin") && (
        <Link to="/projects/create">Create Project</Link>
      )} |{" "}
      {user && user.role === "admin" && (
        <>
          <Link to="/admin/requests">Заявки волонтерів</Link> |{" "}
          <Link to="/admin/users">Користувачі</Link> |{" "}
        </>
      )}
      {token && <Link to="/profile">Профіль</Link>} |{" "}
      {!token && <><Link to="/login">Login</Link> | <Link to="/signup">Signup</Link> | </>}
      {token && <button onClick={handleLogout}>Вийти</button>}
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
          {/* <Route path="*" element={<div>Головна сторінка або 404</div>} /> */}
        </BrowserRouter>
      </UserUpdateContext.Provider>
    </UserContext.Provider>
  );
}