import { useState } from "react";
import Navbar from "../components/Navbar";
import { useLanguage, translations } from "../utils/i18n";
import { activatePremium, isPremium } from "../utils/access";

const plans = [
  {
    level: "A1–A2 (Основы / Asosiy)",
    price: "$10",
    localPrice: "125,000 UZS",
    period: "Доступ на 3 месяца",
    checkoutUrl: "https://lingra.lemonsqueezy.com/buy/REPLACE_A1_A2_VARIANT_ID",
    popular: false,
  },
  {
    level: "B1–B2 (Уверенный / Ishonchli)",
    price: "$15",
    localPrice: "185,000 UZS",
    period: "Доступ на 6 месяцев",
    checkoutUrl: "https://lingra.lemonsqueezy.com/buy/REPLACE_B1_B2_VARIANT_ID",
    popular: true,
  },
  {
    level: "Полный курс + ИИ 24/7 (ALL ACCESS)",
    price: "$25",
    localPrice: "310,000 UZS",
    period: "Навсегда (Lifetime)",
    checkoutUrl: "https://lingra.lemonsqueezy.com/buy/REPLACE_C1_C2_VARIANT_ID",
    popular: false,
  },
];

export default function Pricing() {
  const lang = useLanguage();
  const [code, setCode] = useState("");
  const [statusMsg, setStatusMsg] = useState(null);
  const [premium, setPremiumState] = useState(isPremium());

  const t = translations[lang] || translations.ru;

  const handleActivate = (e) => {
    e.preventDefault();
    const res = activatePremium(code);
    setStatusMsg(res);
    if (res.success) {
      setPremiumState(true);
    }
  };

  return (
    <div style={styles.page}>
      <Navbar />

      <div style={styles.container}>
        <h1 style={styles.h1}>{t.pricingTitle}</h1>
        <p style={styles.subtitle}>{t.pricingSubtitle}</p>

        {premium && (
          <div style={styles.activeBanner}>
            ✨ У вас уже активирован <strong>PREMIUM ДОСТУП</strong>! Все уроки и ИИ-репетитор открыты.
          </div>
        )}

        {/* Pricing Cards */}
        <div style={styles.grid}>
          {plans.map((p) => (
            <div
              key={p.level}
              style={{
                ...styles.card,
                border: p.popular
                  ? "2px solid #6c5ce7"
                  : "1px solid rgba(255, 255, 255, 0.08)",
                position: "relative",
              }}
            >
              {p.popular && <span style={styles.popularBadge}>Популярный</span>}
              <div style={styles.level}>{p.level}</div>
              <div style={styles.price}>{p.price}</div>
              <div style={styles.localPrice}>~ {p.localPrice}</div>
              <div style={styles.period}>{p.period}</div>

              <a
                href={p.checkoutUrl}
                className="lemonsqueezy-button"
                style={styles.button}
                target="_blank"
                rel="noopener noreferrer"
              >
                💳 {t.buyBtn} (Visa/MC)
              </a>

              <a
                href={`https://t.me/lingra_support?text=${encodeURIComponent(
                  `Здравствуйте! Хочу купить доступ к курсу "${p.level}" через Uzcard/Humo/Click/Payme.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                style={styles.tgBtn}
              >
                🇺🇿 {t.tgBtn}
              </a>
            </div>
          ))}
        </div>

        {/* Local Payment Callout */}
        <div style={styles.localPayBox}>
          <div style={styles.localPayIcon}>💳</div>
          <div>
            <h3 style={styles.localPayTitle}>{t.payLocalTitle}</h3>
            <p style={styles.localPayDesc}>{t.payLocalDesc}</p>
          </div>
        </div>

        {/* Promo Code Activation Box */}
        <div style={styles.codeBox}>
          <h3 style={styles.codeTitle}>🔑 {t.haveCode}</h3>
          <form onSubmit={handleActivate} style={styles.codeForm}>
            <input
              style={styles.codeInput}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder={t.enterCodePlaceholder}
            />
            <button type="submit" style={styles.activateBtn}>
              {t.activateBtn}
            </button>
          </form>

          {statusMsg && (
            <p
              style={{
                ...styles.status,
                color: statusMsg.success ? "#4ade80" : "#f87171",
              }}
            >
              {statusMsg.message}
            </p>
          )}
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
    maxWidth: "900px",
    margin: "0 auto",
    padding: "40px 24px",
  },
  h1: { fontSize: "2.4rem", fontWeight: "800", textAlign: "center", marginBottom: "8px" },
  subtitle: {
    textAlign: "center",
    color: "#9ca3af",
    fontSize: "1.1rem",
    marginBottom: "40px",
  },
  activeBanner: {
    background: "rgba(16, 185, 129, 0.15)",
    border: "1px solid #10b981",
    color: "#34d399",
    padding: "16px",
    borderRadius: "14px",
    textAlign: "center",
    marginBottom: "30px",
    fontWeight: "600",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: "24px",
    marginBottom: "40px",
  },
  card: {
    background: "#14142a",
    borderRadius: "18px",
    padding: "30px 24px",
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
  },
  popularBadge: {
    position: "absolute",
    top: "-12px",
    left: "50%",
    transform: "translateX(-50%)",
    background: "#6c5ce7",
    color: "#fff",
    fontSize: "0.75rem",
    fontWeight: "700",
    padding: "4px 14px",
    borderRadius: "20px",
    textTransform: "uppercase",
  },
  level: { fontSize: "1.15rem", fontWeight: "600", marginBottom: "16px" },
  price: { fontSize: "2.2rem", fontWeight: "800", color: "#a29bfe", marginBottom: "4px" },
  localPrice: { color: "#9ca3af", fontSize: "0.9rem", marginBottom: "8px" },
  period: { color: "#6b7280", fontSize: "0.85rem", marginBottom: "24px" },
  button: {
    background: "linear-gradient(135deg, #6c5ce7, #8c7ae6)",
    color: "#fff",
    border: "none",
    borderRadius: "12px",
    padding: "12px 18px",
    fontWeight: "700",
    cursor: "pointer",
    textDecoration: "none",
    display: "block",
    marginBottom: "10px",
  },
  tgBtn: {
    background: "rgba(255, 255, 255, 0.06)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    color: "#d1d5db",
    borderRadius: "12px",
    padding: "10px 16px",
    fontSize: "0.9rem",
    fontWeight: "600",
    textDecoration: "none",
    display: "block",
  },
  localPayBox: {
    background: "linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(239, 68, 68, 0.1) 100%)",
    border: "1px solid rgba(245, 158, 11, 0.3)",
    borderRadius: "18px",
    padding: "24px",
    display: "flex",
    gap: "18px",
    alignItems: "center",
    marginBottom: "32px",
  },
  localPayIcon: { fontSize: "2.2rem" },
  localPayTitle: { fontSize: "1.15rem", fontWeight: "700", marginBottom: "4px" },
  localPayDesc: { color: "#d1d5db", fontSize: "0.95rem", lineHeight: "1.4" },
  codeBox: {
    background: "#14142a",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    borderRadius: "18px",
    padding: "28px",
  },
  codeTitle: { fontSize: "1.2rem", fontWeight: "700", marginBottom: "16px" },
  codeForm: { display: "flex", gap: "12px" },
  codeInput: {
    flex: 1,
    background: "#1f1f3d",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    borderRadius: "12px",
    padding: "12px 16px",
    color: "#fff",
    fontSize: "1rem",
    outline: "none",
  },
  activateBtn: {
    background: "#10b981",
    color: "#fff",
    border: "none",
    borderRadius: "12px",
    padding: "0 24px",
    fontWeight: "700",
    cursor: "pointer",
  },
  status: { marginTop: "12px", fontWeight: "600" },
  demoBox: { marginTop: "16px", fontSize: "0.85rem", color: "#9ca3af" },
  demoLink: {
    background: "none",
    border: "none",
    color: "#a29bfe",
    textDecoration: "underline",
    cursor: "pointer",
    fontWeight: "600",
  },
};
