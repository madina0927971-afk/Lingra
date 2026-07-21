const plans = [
  { level: "A1–A2", price: "$10", period: "3 месяца" },
  { level: "B1–B2", price: "$10", period: "3 месяца" },
  { level: "C1–C2", price: "$10", period: "3 месяца" },
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
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "16px",
    maxWidth: "700px",
  },
  card: {
    background: "#14142a",
    borderRadius: "14px",
    padding: "24px",
    textAlign: "center",
  },
  level: { fontSize: "1.2rem", fontWeight: 600, marginBottom: "8px" },
  price: { fontSize: "1.6rem", color: "#6c5ce7", marginBottom: "4px" },
  period: { opacity: 0.6, fontSize: "0.9rem" },
  button: {
    marginTop: "16px",
    background: "#6c5ce7",
    color: "#fff",
    border: "none",
    borderRadius: "10px",
    padding: "10px 20px",
    cursor: "pointer",
    width: "100%",
  },
};

export default function Pricing() {
  return (
    <div style={styles.page}>
      <h1 style={styles.h1}>Тарифы</h1>
      <div style={styles.grid}>
        {plans.map((p) => (
          <div key={p.level} style={styles.card}>
            <div style={styles.level}>{p.level}</div>
            <div style={styles.price}>{p.price}/мес</div>
            <div style={styles.period}>{p.period}</div>
            <button style={styles.button}>Оформить</button>
          </div>
        ))}
      </div>
    </div>
  );
}
