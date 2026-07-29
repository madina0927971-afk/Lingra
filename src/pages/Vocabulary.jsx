import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { getAllWords } from "../utils/progress";

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

  return (
    <div style={styles.page}>
      <Navbar />
      <h1 style={styles.h1}>Мой словарь</h1>
      <p style={styles.sub}>
        {words.length > 0
          ? `${words.length} слов и фраз выучено — сохраняется на этом устройстве`
          : "Пока пусто — пройдите первый урок, чтобы начать собирать слова"}
      </p>

      {words.length === 0 ? (
        <div style={styles.empty}>
          Слова появляются здесь автоматически каждый раз, когда вы отвечаете правильно в уроке.
        </div>
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
                <span>Повторено раз: {w.timesCorrect}</span>
                <span>Выучено: {new Date(w.firstLearnedAt).toLocaleDateString("ru-RU")}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <Link to="/dashboard" style={styles.back}>← Назад к прогрессу</Link>
    </div>
  );
}
