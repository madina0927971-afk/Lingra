import { Link } from "react-router-dom";

const stages = [
  { level: "A1-A2", title: "Стадия 1: Основы" },
  { level: "B1-B2", title: "Стадия 2: Уверенное общение" },
  { level: "C1-C2", title: "Стадия 3: Свободное владение" },
];

const styles = {
  page: {
    minHeight: "100vh",
    background: "#080811",
    color: "#fff",
    padding: "32px 24px",
    fontFamily: "system-ui, sans-serif",
  },
  h1: { fontSize: "1.8rem", marginBottom: "24px" },
  grid: { display: "grid", gap: "16px", maxWidth: "600px" },
  card: {
    background: "#14142a",
    borderRadius: "14px",
    padding: "20px",
    textDecoration: "none",
    color: "#fff",
    display: "block",
  },
  cardTitle: { fontWeight: 600, marginBottom: "4px" },
  cardLevel: { opacity: 0.6, fontSize: "0.9rem" },
};

export default function Dashboard() {
  return (
    <div style={styles.page}>
      <h1 style={styles.h1}>Твой прогресс</h1>
      <div style={styles.grid}>
        {stages.map((s) => (
          <Link key={s.level} to="/lessons" style={styles.card}>
            <div style={styles.cardTitle}>{s.title}</div>
            <div style={styles.cardLevel}>{s.level}</div>
          </Link>
        ))}
        <Link to="/ai-practice" style={styles.card}>
          <div style={styles.cardTitle}>ИИ-репетитор</div>
          <div style={styles.cardLevel}>Практика в чате</div>
        </Link>
      </div>
    </div>
  );
}
