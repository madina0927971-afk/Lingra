import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { getAllWords } from "../utils/progress";
import { useLanguage, translations } from "../utils/i18n";

const LEVEL_LABELS = {
  "a1-a2": "A1–A2",
  "b1-b2": "B1–B2",
  "c1-c2": "C1–C2",
};

const styles = {
  page: {
    minHeight: "100vh",
    background: "#080811",
    color: "#fff",
    padding: "32px 24px",
    fontFamily: "system-ui, sans-serif",
  },
  h1: { fontSize: "1.8rem", marginBottom: "4px" },
  sub: { opacity: 0.6, marginBottom: "24px" },
  empty: {
    background: "#14142a",
    borderRadius: "14px",
    padding: "32px",
    maxWidth: "500px",
    opacity: 0.7,
  },
  list: { display: "grid", gap: "10px", maxWidth: "600px" },
  item: {
    background: "#14142a",
    borderRadius: "12px",
    padding: "14px 18px",
  },
  term: { fontWeight: 600, fontSize: "1.05rem", marginBottom: "4px" },
  context: { opacity: 0.55, fontSize: "0.85rem", marginBottom: "6px" },
  meta: {
    display: "flex",
    gap: "12px",
    fontSize: "0.78rem",
    opacity: 0.5,
  },
  badge: {
    display: "inline-block",
    background: "#1f1f3d",
    borderRadius: "6px",
    padding: "2px 8px",
  },
  back: { color: "#6c5ce7", textDecoration: "none", display: "inline-block", marginTop: "24px" },
};

export default function Vocabulary() {
  const words = getAllWords();
  const lang = useLanguage();
  const t = translations[lang] || translations.ru;
  const dateLocale = lang === "uz" ? "uz-UZ" : "ru-RU";

  return (
    <div style={styles.page}>
      <Navbar />
      <h1 style={styles.h1}>{t.vocTitle}</h1>
      <p style={styles.sub}>
        {words.length > 0
          ? `${words.length} ${t.vocSubtitleFilled}`
          : t.vocSubtitleEmpty}
      </p>

      {words.length === 0 ? (
        <div style={styles.empty}>{t.vocEmptyHint}</div>
      ) : (
        <div style={styles.list}>
          {words.map((w) => (
            <div key={w.term} style={styles.item}>
              <div style={styles.term}>{w.term}</div>
              {w.context && <div style={styles.context}>{w.context}</div>}
              <div style={styles.meta}>
                <span className="badge" style={styles.badge}>
                  {LEVEL_LABELS[w.level] || w.level}
                </span>
                <span>{t.vocRepeatedLabel}: {w.timesCorrect}</span>
                <span>{t.vocLearnedLabel}: {new Date(w.firstLearnedAt).toLocaleDateString(dateLocale)}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <Link to="/dashboard" style={styles.back}>{t.vocBackToProgress}</Link>
    </div>
  );
}
