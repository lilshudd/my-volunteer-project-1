import { useUser } from "../context/UserContext";
import { Link } from "react-router-dom";

export default function CreateProjectButton() {
  const user = useUser();

  if (!user || (user.role !== "organizer" && user.role !== "admin")) {
    return null;
  }

  return (
    <Link to="/projects/create">
      <button>Створити проєкт</button>
    </Link>
  );
}