import { Link } from "react-router-dom";
import { getLessons } from "../data/lessons";

const lessons = getLessons("a1-a2");

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
  return (
    <div style={styles.page}>
      <h1 style={styles.h1}>Уроки — A1–A2</h1>
      <div style={styles.list}>
        {lessons.map((l) => (
          <Link key={l.id} to={`/lesson/a1-a2/${l.id}`} style={styles.item}>
            {l.id}. {l.title}
          </Link>
        ))}
      </div>
    </div>
  );
}
