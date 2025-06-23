import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="main-footer">
      <div className="footer-content">
        <div className="footer-brand">
          <img src="./images/logo.svg" alt="Волонтерський хаб" className="footer-logo" />
          <div>
            <strong>Волонтерський хаб</strong>
            <div className="footer-desc">
              Об’єднуємо людей для допомоги Україні.<br />
              Разом ми сильніші!
            </div>
          </div>
        </div>
        <div className="footer-links">
          <Link to="/about">Про нас</Link>
          <Link to="/projects">Проєкти</Link>
          <Link to="/faq">FAQ</Link>
          <Link to="/contacts">Контакти</Link>
        </div>
        <div className="footer-contacts">
          <div>
            <a href="mailto:help@domain.com">help@domain.com</a>
          </div>
          <div className="footer-socials">
            <a href="https://t.me/yourchannel" target="_blank" rel="noopener noreferrer" aria-label="Telegram">
              <img src="./images/telegram.svg" alt="Telegram" />
            </a>
            <a href="https://facebook.com/yourpage" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
              <img src="./images/facebook.svg" alt="Facebook" />
            </a>
            <a href="https://instagram.com/yourpage" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <img src="./images/instagram.svg" alt="Instagram" />
            </a>
          </div>
        </div>
      </div>
      <div className="footer-copyright">
        © {new Date().getFullYear()} Волонтерський хаб. Всі права захищено.
      </div>
    </footer>
  );
}