import { useParams, Link } from "react-router-dom";
import { useState } from "react";

const styles = {
  page: {
    minHeight: "100vh",
    background: "#080811",
    color: "#fff",
    padding: "32px 24px",
    fontFamily: "system-ui, sans-serif",
  },
  h1: { fontSize: "1.6rem", marginBottom: "8px" },
  meta: { opacity: 0.6, marginBottom: "24px" },
  card: {
    background: "#14142a",
    borderRadius: "14px",
    padding: "24px",
    maxWidth: "500px",
  },
  question: { fontSize: "1.1rem", marginBottom: "16px" },
  option: {
    display: "block",
    width: "100%",
    background: "#1f1f3d",
    color: "#fff",
    border: "none",
    borderRadius: "10px",
    padding: "12px",
    marginBottom: "10px",
    textAlign: "left",
    cursor: "pointer",
  },
  back: { color: "#6c5ce7", textDecoration: "none", display: "inline-block", marginTop: "20px" },
};

export default function LessonView() {
  const { level, id } = useParams();
  const [selected, setSelected] = useState(null);

  const options = ["Hello", "Goodbye", "Thank you", "Please"];

  return (
    <div style={styles.page}>
      <h1 style={styles.h1}>Урок {id}</h1>
      <p style={styles.meta}>Уровень: {level}</p>
      <div style={styles.card}>
        <p style={styles.question}>Выберите перевод слова «Здравствуйте»:</p>
        {options.map((opt) => (
          <button
            key={opt}
            style={{
              ...styles.option,
              background: selected === opt ? "#6c5ce7" : "#1f1f3d",
            }}
            onClick={() => setSelected(opt)}
          >
            {opt}
          </button>
        ))}
      </div>
      <Link to="/lessons" style={styles.back}>← Назад к урокам</Link>
    </div>
  );
}
