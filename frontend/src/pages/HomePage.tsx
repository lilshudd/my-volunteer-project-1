import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

// Простий хук для визначення авторизації (заміни на свій, якщо є)
function useAuth() {
  const token = localStorage.getItem("accessToken");
  return { isAuth: !!token };
}

type Project = {
  _id: string;
  title: string;
  description: string;
  location?: string;
  dateStart?: string;
  dateEnd?: string;
  urgent?: boolean;
};

const howItWorks = [
  {
    icon: "📝",
    title: "Реєстрація",
    desc: "Створи акаунт або увійди, щоб долучитися до спільноти.",
  },
  {
    icon: "🔎",
    title: "Обери проєкт",
    desc: "Знайди ініціативу, яка тобі близька, або створи власну.",
  },
  {
    icon: "🤝",
    title: "Долучайся",
    desc: "Стань частиною команди або підтримай донатом.",
  },
];

const reviews = [
  {
    name: "Олена, Київ",
    text: "Завдяки цій платформі я знайшла чудову команду однодумців. Разом ми допомогли десяткам людей!",
    avatar: "/images/review1.jpg",
  },
  {
    name: "Ігор, Львів",
    text: "Дуже зручно знаходити актуальні проєкти та долучатися до них. Рекомендую всім волонтерам!",
    avatar: "/images/review2.jpg",
  },
  {
    name: "Марія, Харків",
    text: "Платформа допомогла зібрати кошти на важливу ініціативу. Дякую за підтримку!",
    avatar: "/images/review3.jpg",
  },
];

export default function HomePage() {
  const [stats, setStats] = useState({
    projects: 0,
    volunteers: 0,
    donations: 0,
  });
  const [topProjects, setTopProjects] = useState<Project[]>([]);
  const { isAuth } = useAuth();

  useEffect(() => {
    fetch("/api/stats")
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(() => setStats({ projects: 0, volunteers: 0, donations: 0 }));

    fetch("/api/projects?limit=3&urgent=true")
      .then(res => res.json())
      .then(data => setTopProjects(data))
      .catch(() => setTopProjects([]));
  }, []);

  return (
    <div className="container home-hero">
      {/* Головний банер */}
      <div className="home-banner">
        <img src="/images/main-banner.jpg" alt="Волонтерський хаб" />
      </div>

      <h1>Волонтерський хаб</h1>
      <p>
        Об'єднуємо волонтерів для допомоги військовим та цивільним.<br />
        Долучайся до проєктів, створюй свої ініціативи, підтримуй донатами!
      </p>

      {/* Динамічна статистика */}
      <div className="stats-block">
        <div>
          <span className="stat-number">{stats.projects}</span>
          <span className="stat-label">проєктів</span>
        </div>
        <div>
          <span className="stat-number">{stats.volunteers}</span>
          <span className="stat-label">волонтерів</span>
        </div>
        <div>
          <span className="stat-number">
            {stats.donations ? `₴${stats.donations.toLocaleString()}` : "—"}
          </span>
          <span className="stat-label">зібрано донатів</span>
        </div>
      </div>

      {/* Секція "Чому це важливо?" */}
      <div className="why-important">
        <h2>Чому це важливо?</h2>
        <p>
          Кожен проєкт — це реальна допомога тим, хто її потребує. 
          Ваша участь рятує життя, підтримує військових та цивільних у складний час.
        </p>
        <ul>
          <li>⚡ <b>Термінові потреби</b> закриваються швидше</li>
          <li>🤲 <b>Кожен волонтер</b> — це шанс на зміни</li>
          <li>📈 <b>Прозорість</b> та відкритість для всіх учасників</li>
        </ul>
      </div>

      {/* Блок "Як це працює" */}
      <div className="how-it-works-extended">
        <h2>Як це працює?</h2>
        <div className="how-steps">
          {howItWorks.map((step, idx) => (
            <div className="how-step" key={idx}>
              <div className="how-icon">{step.icon}</div>
              <div className="how-title">{step.title}</div>
              <div className="how-desc">{step.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Ряд з ілюстраціями */}
      <div className="home-images-row">
        <img src="/images/volunteers.svg" alt="Волонтери" />
        <img src="/images/help.svg" alt="Допомога" />
        <img src="/images/donation.svg" alt="Донати" />
      </div>

      {/* Секція "Актуальні проєкти" */}
      <div className="urgent-projects">
        <h2>Актуальні проєкти</h2>
        <div className="urgent-projects-list">
          {topProjects.length === 0 && <div>Наразі немає термінових проєктів.</div>}
          {topProjects.map(p => (
            <div className="urgent-project-card" key={p._id}>
              <div className="urgent-title">
                {p.urgent && <span className="urgent-badge">Терміново</span>} {p.title}
              </div>
              <div className="urgent-desc">{p.description.slice(0, 80)}...</div>
              <div className="urgent-meta">
                <span>📍 {p.location || "Онлайн"}</span>
                <span>
                  🗓 {p.dateStart ? new Date(p.dateStart).toLocaleDateString() : "—"}
                  {p.dateEnd ? " – " + new Date(p.dateEnd).toLocaleDateString() : ""}
                </span>
              </div>
              <Link to={`/projects/${p._id}`}>
                <button className="urgent-btn">Детальніше</button>
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* Відгуки волонтерів */}
      <div className="reviews-section">
        <h2>Відгуки волонтерів</h2>
        <div className="reviews-list">
          {reviews.map((r, idx) => (
            <div className="review-card" key={idx}>
              <img src={r.avatar} alt={r.name} className="review-avatar" />
              <div className="review-text">"{r.text}"</div>
              <div className="review-author">— {r.name}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Блок заклику для організаторів */}
      <div className="for-organizers">
        <h3>Є ідея для допомоги?</h3>
        {isAuth ? (
          <Link to="/projects/create">
            <button className="cta-btn" style={{ marginTop: 8 }}>Створити проєкт</button>
          </Link>
        ) : (
          <Link to="/login">
            <button className="cta-btn" style={{ marginTop: 8 }}>Увійти або зареєструватися</button>
          </Link>
        )}
      </div>

      <Link to="/projects">
        <button className="cta-btn">Переглянути проєкти</button>
      </Link>
    </div>
  );
}