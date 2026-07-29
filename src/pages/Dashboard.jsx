import { Link } from "react-router-dom";
import { getLessons } from "../data/lessons";
import { getLevelStats, isLevelUnlocked, getTotalXP, getStreak, getWordCount } from "../utils/progress";

const stages = [
  { level: "a1-a2", title: "Стадия 1: Основы", label: "A1–A2" },
  { level: "b1-b2", title: "Стадия 2: Уверенное общение", label: "B1–B2" },
  { level: "c1-c2", title: "Стадия 3: Свободное владение", label: "C1–C2" },
];

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
  const xp = getTotalXP();
  const streak = getStreak();
  const wordCount = getWordCount();

  const lessonsCountByLevel = {
    "a1-a2": getLessons("a1-a2").length,
    "b1-b2": getLessons("b1-b2").length,
    "c1-c2": getLessons("c1-c2").length,
  };

  return (
    <div style={styles.page}>
      <div style={styles.topBar}>
        <div style={styles.stat}>
          <span>⚡</span>
          <span style={styles.statValue}>{xp}</span>
          <span style={{ opacity: 0.6 }}>XP</span>
        </div>
        <div style={styles.stat}>
          <span>🔥</span>
          <span style={styles.statValue}>{streak}</span>
          <span style={{ opacity: 0.6 }}>дней подряд</span>
        </div>
        <Link to="/vocabulary" style={{ ...styles.stat, textDecoration: "none", color: "#fff" }}>
          <span>📚</span>
          <span style={styles.statValue}>{wordCount}</span>
          <span style={{ opacity: 0.6 }}>слов в словаре</span>
        </Link>
      </div>

      <h1 style={styles.h1}>Твой прогресс</h1>
      <div style={styles.grid}>
        {stages.map((s) => {
          const total = lessonsCountByLevel[s.level];
          const stats = getLevelStats(s.level, total);
          const unlocked = isLevelUnlocked(s.level, lessonsCountByLevel);

          const cardContent = (
            <>
              <div style={styles.cardTitle}>{s.title}</div>
              <div style={styles.cardLevel}>{s.label}</div>
              <div style={styles.barBg}>
                <div style={{ ...styles.barFill, width: `${stats.percent}%` }} />
              </div>
              <div style={styles.progressText}>
                {stats.completed}/{stats.total} уроков пройдено ({stats.percent}%)
              </div>
              {!unlocked && <div style={styles.lockBadge}>🔒</div>}
            </>
          );

          return unlocked ? (
            <Link key={s.level} to={`/lessons/${s.level}`} style={styles.card}>
              {cardContent}
            </Link>
          ) : (
            <div
              key={s.level}
              style={{ ...styles.card, ...styles.cardLocked }}
              title="Пройдите 70% предыдущей стадии, чтобы открыть эту"
            >
              {cardContent}
            </div>
          );
        })}

        <Link to="/ai-practice" style={styles.aiCard}>
          <div style={styles.cardTitle}>🤖 ИИ-репетитор</div>
          <div style={{ opacity: 0.85, fontSize: "0.9rem" }}>Практика в чате в любое время</div>
        </Link>
      </div>
    </div>
  );
}
