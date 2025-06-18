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
      {user && (user.role === "organizer" || user.role === "admin") && (
        <Link to="/create">Create Project</Link>
      )} |{" "}
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
          setUser({ name: data.name, email: data.email, role: data.role });
          localStorage.setItem("user", JSON.stringify({ name: data.name, email: data.email, role: data.role }));
        }
      } catch {
        toast.error("Не вдалося отримати профіль користувача");
      }
    };
    fetchProfile();
  }, []);

  return (
    <UserContext.Provider value={user}>
      <UserUpdateContext.Provider value={setUser}>
        <BrowserRouter>
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
              path="/create"
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
            <Route path="*" element={<div>Головна сторінка або 404</div>} />
          </Routes>
        </BrowserRouter>
      </UserUpdateContext.Provider>
    </UserContext.Provider>
  );
}