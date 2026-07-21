import { Link } from "react-router-dom";

const styles = {
  page: {
    minHeight: "100vh",
    background: "#080811",
    color: "#fff",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px",
    textAlign: "center",
    fontFamily: "system-ui, sans-serif",
  },
  title: { fontSize: "2.2rem", marginBottom: "12px" },
  subtitle: { fontSize: "1.1rem", opacity: 0.8, marginBottom: "32px", maxWidth: "480px" },
  cta: {
    background: "#6c5ce7",
    color: "#fff",
    padding: "14px 32px",
    borderRadius: "12px",
    textDecoration: "none",
    fontWeight: 600,
  },
};

export default function Home() {
  return (
    <div style={styles.page}>
      <h1 style={styles.title}>Lingra ⚡</h1>
      <p style={styles.subtitle}>
        Практичный курс английского для русско- и узбекоязычных учеников.
        Три этапа: A1–A2, B1–B2, C1–C2.
      </p>
      <Link to="/dashboard" style={styles.cta}>Начать</Link>
    </div>
  );
}
