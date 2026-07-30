import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { getLessons } from "../data/lessons";
import { getLevelStats, getTotalXP, getStreak, getWordCount } from "../utils/progress";
import { isPremium } from "../utils/access";
import { useLanguage, translations } from "../utils/i18n";

const styles = {
  page: {
    minHeight: "100vh",
    background: "#080811",
    color: "#fff",
    padding: "32px 24px",
    fontFamily: "system-ui, sans-serif",
  },
  topBar: {
    display: "flex",
    gap: "16px",
    marginBottom: "28px",
    flexWrap: "wrap",
  },
  stat: {
    background: "#14142a",
    borderRadius: "12px",
    padding: "12px 18px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "0.95rem",
  },
  statValue: { fontWeight: 700, fontSize: "1.1rem" },
  h1: { fontSize: "1.8rem", marginBottom: "20px" },
  grid: { display: "grid", gap: "16px", maxWidth: "600px" },
  card: {
    background: "#14142a",
    borderRadius: "14px",
    padding: "20px",
    textDecoration: "none",
    color: "#fff",
    display: "block",
    position: "relative",
  },
  cardLocked: { opacity: 0.45, cursor: "not-allowed" },
  cardTitle: { fontWeight: 600, marginBottom: "4px" },
  cardLevel: { opacity: 0.6, fontSize: "0.9rem", marginBottom: "10px" },
  barBg: {
    height: "8px",
    background: "#1f1f3d",
    borderRadius: "6px",
    overflow: "hidden",
  },
  barFill: {
    height: "100%",
    background: "#6c5ce7",
    borderRadius: "6px",
  },
  progressText: { fontSize: "0.8rem", opacity: 0.6, marginTop: "6px" },
  lockBadge: {
    position: "absolute",
    top: "16px",
    right: "18px",
    fontSize: "0.8rem",
    opacity: 0.7,
  },
  aiCard: {
    background: "linear-gradient(135deg, #6c5ce7, #a29bfe)",
    borderRadius: "14px",
    padding: "20px",
    textDecoration: "none",
    color: "#fff",
    display: "block",
  },
};

export default function Dashboard() {
  const lang = useLanguage();
  const t = translations[lang] || translations.ru;

  const xp = getTotalXP();
  const streak = getStreak();
  const wordCount = getWordCount();

  const stages = [
    { level: "a1-a2", title: t.dashStage1Title, label: "A1–A2" },
    { level: "b1-b2", title: t.dashStage2Title, label: "B1–B2" },
    { level: "c1-c2", title: t.dashStage3Title, label: "C1–C2" },
  ];

  const lessonsCountByLevel = {
    "a1-a2": getLessons("a1-a2").length,
    "b1-b2": getLessons("b1-b2").length,
    "c1-c2": getLessons("c1-c2").length,
  };

  const premium = isPremium();

  return (
    <div style={styles.page}>
      <Navbar />
      <div style={styles.topBar}>
        <div style={styles.stat}>
          <span>⚡</span>
          <span style={styles.statValue}>{xp}</span>
          <span style={{ opacity: 0.6 }}>{t.dashXpLabel}</span>
        </div>
        <div style={styles.stat}>
          <span>🔥</span>
          <span style={styles.statValue}>{streak}</span>
          <span style={{ opacity: 0.6 }}>{t.dashStreakLabel}</span>
        </div>
        <Link to="/vocabulary" style={{ ...styles.stat, textDecoration: "none", color: "#fff" }}>
          <span>📚</span>
          <span style={styles.statValue}>{wordCount}</span>
          <span style={{ opacity: 0.6 }}>{t.dashWordsLabel}</span>
        </Link>
      </div>

      <h1 style={styles.h1}>{t.dashTitle}</h1>
      <div style={styles.grid}>
        {stages.map((s) => {
          const total = lessonsCountByLevel[s.level];
          const stats = getLevelStats(s.level, total);

          const cardContent = (
            <>
              <div style={styles.cardTitle}>{s.title}</div>
              <div style={styles.cardLevel}>{s.label}</div>
              <div style={styles.barBg}>
                <div style={{ ...styles.barFill, width: `${stats.percent}%` }} />
              </div>
              <div style={styles.progressText}>
                {stats.completed}/{stats.total} {t.dashLessonsProgress} ({stats.percent}%)
              </div>
              {!premium && <div style={styles.lockBadge}>🔒 PRO</div>}
            </>
          );

          // Уровень всегда доступен для просмотра списка уроков (как и на странице
          // "Kurslar"), реальное ограничение — Premium на отдельные уроки, поэтому
          // честно ведём именно туда, а не показываем недостижимый прогресс-барьер.
          return (
            <Link key={s.level} to={`/lessons/${s.level}`} style={styles.card} title={!premium ? t.dashLockedHintPremium : undefined}>
              {cardContent}
            </Link>
          );
        })}

        <Link to="/ai-practice" style={styles.aiCard}>
          <div style={styles.cardTitle}>{t.dashAITitle}</div>
          <div style={{ opacity: 0.85, fontSize: "0.9rem" }}>{t.dashAISubtitle}</div>
        </Link>
      </div>
    </div>
  );
}
