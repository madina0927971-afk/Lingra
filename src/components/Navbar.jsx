import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useLanguage, setLanguage, translations } from "../utils/i18n";
import { isPremium } from "../utils/access";

export default function Navbar() {
  const lang = useLanguage();
  const [premium, setPremiumState] = useState(isPremium());
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setPremiumState(isPremium());
  }, [location]);

  const t = translations[lang] || translations.ru;

  const toggleLang = (newLang) => {
    setLanguage(newLang);
  };

  const navLinks = [
    { to: "/", label: t.navHome },
    { to: "/dashboard", label: t.navDashboard },
    { to: "/lessons", label: t.navLessons },
    { to: "/ai-practice", label: t.navAI },
    { to: "/vocabulary", label: t.navVocabulary },
    { to: "/pricing", label: t.navPricing },
  ];

  return (
    <header style={styles.header}>
      <style>{`
        @media (max-width: 768px) {
          .lingra-desktop-nav { display: none !important; }
          .lingra-hamburger { display: inline-block !important; }
        }
      `}</style>
      <div style={styles.container}>
        {/* Brand */}
        <Link to="/" style={styles.brand}>
          <span style={styles.logoIcon}>⚡</span>
          <span style={styles.brandText}>Lingra</span>
          {premium && <span style={styles.proBadge}>PRO</span>}
        </Link>

        {/* Desktop Links */}
        <nav className="lingra-desktop-nav" style={styles.desktopNav}>
          {navLinks.map((link) => {
            const active = location.pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                style={{
                  ...styles.link,
                  color: active ? "#a29bfe" : "#d1d5db",
                  borderBottom: active ? "2px solid #6c5ce7" : "none",
                }}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right Section: Language Switcher + CTA */}
        <div style={styles.rightGroup}>
          <div style={styles.langToggle}>
            <button
              onClick={() => toggleLang("ru")}
              style={{
                ...styles.langBtn,
                background: lang === "ru" ? "#6c5ce7" : "transparent",
                color: lang === "ru" ? "#fff" : "#9ca3af",
              }}
            >
              RU
            </button>
            <button
              onClick={() => toggleLang("uz")}
              style={{
                ...styles.langBtn,
                background: lang === "uz" ? "#6c5ce7" : "transparent",
                color: lang === "uz" ? "#fff" : "#9ca3af",
              }}
            >
              UZ
            </button>
          </div>

          <Link to="/pricing" style={styles.ctaBtn}>
            {premium ? "PRO Active ✨" : t.startFree}
          </Link>

          {/* Hamburger toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lingra-hamburger"
            style={styles.hamburger}
            aria-label="Toggle menu"
          >
            ☰
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      {mobileMenuOpen && (
        <div style={styles.mobileNav}>
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMobileMenuOpen(false)}
              style={styles.mobileLink}
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}

const styles = {
  header: {
    background: "rgba(8, 8, 17, 0.85)",
    backdropFilter: "blur(12px)",
    position: "sticky",
    top: 0,
    zIndex: 100,
    borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
  },
  container: {
    maxWidth: "1100px",
    margin: "0 auto",
    padding: "14px 24px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  brand: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    textDecoration: "none",
    color: "#fff",
    fontSize: "1.4rem",
    fontWeight: "700",
  },
  logoIcon: {
    background: "linear-gradient(135deg, #6c5ce7, #a29bfe)",
    borderRadius: "8px",
    padding: "4px 8px",
    fontSize: "1.1rem",
  },
  brandText: {
    letterSpacing: "-0.5px",
    background: "linear-gradient(135deg, #ffffff 0%, #a29bfe 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  proBadge: {
    background: "linear-gradient(135deg, #f59e0b, #ef4444)",
    color: "#fff",
    fontSize: "0.65rem",
    fontWeight: "800",
    padding: "2px 6px",
    borderRadius: "6px",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  desktopNav: {
    display: "flex",
    gap: "24px",
    alignItems: "center",
  },
  link: {
    textDecoration: "none",
    fontSize: "0.95rem",
    fontWeight: "500",
    paddingBottom: "4px",
    transition: "color 0.2s",
  },
  rightGroup: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
  },
  langToggle: {
    display: "flex",
    background: "rgba(255, 255, 255, 0.05)",
    borderRadius: "8px",
    padding: "2px",
    border: "1px solid rgba(255, 255, 255, 0.1)",
  },
  langBtn: {
    border: "none",
    borderRadius: "6px",
    padding: "4px 10px",
    fontSize: "0.8rem",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  ctaBtn: {
    background: "linear-gradient(135deg, #6c5ce7, #8c7ae6)",
    color: "#fff",
    textDecoration: "none",
    padding: "8px 18px",
    borderRadius: "10px",
    fontSize: "0.9rem",
    fontWeight: "600",
    boxShadow: "0 4px 14px rgba(108, 92, 231, 0.4)",
    transition: "transform 0.2s",
  },
  hamburger: {
    display: "none",
    background: "transparent",
    border: "none",
    color: "#fff",
    fontSize: "1.5rem",
    cursor: "pointer",
  },
  mobileNav: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    padding: "16px 24px",
    background: "#0d0d1f",
    borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
  },
  mobileLink: {
    color: "#e5e7eb",
    textDecoration: "none",
    fontSize: "1.1rem",
    padding: "8px 0",
  },
};
