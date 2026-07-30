import { Link, useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { getLessons, localize } from "../data/lessons";
import { isLessonUnlocked } from "../utils/access";
import { getLessonResult } from "../utils/progress";
import { useLanguage, translations } from "../utils/i18n";

const STAGE_LABELS = {
  ru: {
    "a1-a2": "A1–A2 (Основы)",
    "b1-b2": "B1–B2 (Уверенный)",
    "c1-c2": "C1–C2 (Продвинутый)",
  },
  uz: {
    "a1-a2": "A1–A2 (Asoslar)",
    "b1-b2": "B1–B2 (Ishonchli)",
    "c1-c2": "C1–C2 (Ilg'or)",
  },
};
const STAGES = ["a1-a2", "b1-b2", "c1-c2"];

export default function Lessons() {
  const { level = "a1-a2" } = useParams();
  const navigate = useNavigate();
  const lang = useLanguage();
  const t = translations[lang] || translations.ru;

  const lessons = getLessons(level);

  return (
    <div style={styles.page}>
      <Navbar />

      <div style={styles.container}>
        <h1 style={styles.h1}>{t.navLessons}</h1>

        {/* Level Tabs */}
        <div style={styles.tabsRow}>
          {STAGES.map((code) => (
            <button
              key={code}
              onClick={() => navigate(`/lessons/${code}`)}
              style={{
                ...styles.tabBtn,
                background: level === code ? "#6c5ce7" : "rgba(255, 255, 255, 0.05)",
                color: level === code ? "#fff" : "#9ca3af",
                border: level === code ? "none" : "1px solid rgba(255, 255, 255, 0.08)",
              }}
            >
              {(STAGE_LABELS[lang] || STAGE_LABELS.ru)[code]}
            </button>
          ))}
        </div>

        {/* Lessons List */}
        <div style={styles.list}>
          {lessons.map((l) => {
            const unlocked = isLessonUnlocked(l.id);
            const result = getLessonResult(level, l.id);
            const stars = result ? "⭐".repeat(result.stars) + "☆".repeat(3 - result.stars) : "";
            return (
              <Link
                key={l.id}
                to={`/lesson/${level}/${l.id}`}
                style={styles.itemCard}
              >
                <div style={styles.itemLeft}>
                  <span style={styles.lessonNum}>{t.lvLessonWord} {l.id}</span>
                  <div style={styles.lessonTitle}>{localize(l.title, lang)}</div>
                  {stars && <div style={styles.stars}>{stars}</div>}
                </div>

                <div style={styles.itemRight}>
                  {unlocked ? (
                    <span style={styles.badgeFree}>
                      {l.id === 1
                        ? (lang === "uz" ? "🎁 Bepul" : "🎁 Бесплатно")
                        : (lang === "uz" ? "✓ Ochiq" : "✓ Доступно")}
                    </span>
                  ) : (
                    <span style={styles.badgeLocked}>🔒 PRO</span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#080811",
    color: "#fff",
    fontFamily: "system-ui, sans-serif",
  },
  container: {
    maxWidth: "800px",
    margin: "0 auto",
    padding: "40px 24px",
  },
  h1: { fontSize: "2.2rem", fontWeight: "800", marginBottom: "24px" },
  tabsRow: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
    marginBottom: "32px",
  },
  tabBtn: {
    borderRadius: "12px",
    padding: "10px 20px",
    fontSize: "0.95rem",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  list: {
    display: "flex",
    flexDirection: "column",
    gap: "14px",
  },
  itemCard: {
    background: "#14142a",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    borderRadius: "16px",
    padding: "20px 24px",
    color: "#fff",
    textDecoration: "none",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    transition: "transform 0.2s, border-color 0.2s",
  },
  itemLeft: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  lessonNum: {
    color: "#6c5ce7",
    fontWeight: "700",
    fontSize: "0.85rem",
    textTransform: "uppercase",
  },
  lessonTitle: {
    fontSize: "1.1rem",
    fontWeight: "600",
  },
  stars: {
    fontSize: "0.85rem",
    opacity: 0.85,
    letterSpacing: "1px",
  },
  itemRight: {},
  badgeFree: {
    background: "rgba(16, 185, 129, 0.15)",
    color: "#34d399",
    border: "1px solid rgba(16, 185, 129, 0.3)",
    padding: "6px 14px",
    borderRadius: "20px",
    fontSize: "0.85rem",
    fontWeight: "600",
  },
  badgeLocked: {
    background: "rgba(239, 68, 68, 0.15)",
    color: "#f87171",
    border: "1px solid rgba(239, 68, 68, 0.3)",
    padding: "6px 14px",
    borderRadius: "20px",
    fontSize: "0.85rem",
    fontWeight: "600",
  },
};
