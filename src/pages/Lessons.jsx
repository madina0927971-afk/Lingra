import { Link, useParams } from "react-router-dom";
import { getLessons } from "../data/lessons";

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
  h1: { fontSize: "1.8rem", marginBottom: "24px" },
  list: { display: "grid", gap: "12px", maxWidth: "600px" },
  item: {
    background: "#14142a",
    borderRadius: "12px",
    padding: "16px 20px",
    color: "#fff",
    textDecoration: "none",
  },
};

export default function Lessons() {
  const { level = "a1-a2" } = useParams();
  const lessons = getLessons(level);
  const label = LEVEL_LABELS[level] || level;

  return (
    <div style={styles.page}>
      <h1 style={styles.h1}>Уроки — {label}</h1>
      <div style={styles.list}>
        {lessons.map((l) => (
          <Link key={l.id} to={`/lesson/${level}/${l.id}`} style={styles.item}>
            {l.id}. {l.title}
          </Link>
        ))}
      </div>
    </div>
  );
}
