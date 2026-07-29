import { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import PlacementTestModal from "../components/PlacementTestModal";
import { getLanguage, translations } from "../utils/i18n";

export default function Home() {
  const [lang] = useState(getLanguage());
  const [showTest, setShowTest] = useState(false);
  const [sandboxInput, setSandboxInput] = useState("");
  const [sandboxResponse, setSandboxResponse] = useState(null);
  const [sandboxLoading, setSandboxLoading] = useState(false);

  const t = translations[lang] || translations.ru;

  const handleSandboxSend = async () => {
    if (!sandboxInput.trim() || sandboxLoading) return;
    setSandboxLoading(true);
    setSandboxResponse(null);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: sandboxInput }],
        }),
      });
      const data = await res.json();
      if (res.ok && data.text) {
        setSandboxResponse(data.text);
      } else {
        setSandboxResponse(
          "Great try! In the full app, I will correct your mistakes and explain grammar rules in detail. 🚀"
        );
      }
    } catch (e) {
      setSandboxResponse(
        "Great phrase! Keep practicing with Lingra to speak English fluently."
      );
    } finally {
      setSandboxLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <Navbar />

      {/* Hero Section */}
      <section style={styles.hero}>
        <div style={styles.badgeContainer}>
          <span style={styles.freeBadge}>{t.freeLessonBadge}</span>
        </div>
        <h1 style={styles.heroTitle}>{t.heroTitle}</h1>
        <p style={styles.heroSubtitle}>{t.heroSubtitle}</p>

        <div style={styles.ctaGroup}>
          <Link to="/lessons" style={styles.primaryCta}>
            {t.startLearning} →
          </Link>
          <button onClick={() => setShowTest(true)} style={styles.secondaryCta}>
            🎯 {t.testLevel}
          </button>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>{t.whyLingraTitle}</h2>
        <div style={styles.grid3}>
          <div style={styles.featureCard}>
            <div style={styles.cardIcon}>🤖</div>
            <h3 style={styles.cardTitle}>{t.feat1Title}</h3>
            <p style={styles.cardDesc}>{t.feat1Desc}</p>
          </div>
          <div style={styles.featureCard}>
            <div style={styles.cardIcon}>🇺🇿 🇷🇺</div>
            <h3 style={styles.cardTitle}>{t.feat2Title}</h3>
            <p style={styles.cardDesc}>{t.feat2Desc}</p>
          </div>
          <div style={styles.featureCard}>
            <div style={styles.cardIcon}>📈</div>
            <h3 style={styles.cardTitle}>{t.feat3Title}</h3>
            <p style={styles.cardDesc}>{t.feat3Desc}</p>
          </div>
        </div>
      </section>

      {/* Live AI Sandbox Demo */}
      <section style={styles.sandboxSection}>
        <div style={styles.sandboxContainer}>
          <h2 style={styles.sectionTitle}>{t.aiPreviewTitle}</h2>
          <p style={styles.sandboxSubtitle}>{t.aiPreviewSubtitle}</p>

          <div style={styles.sandboxBox}>
            <div style={styles.inputRow}>
              <input
                style={styles.sandboxInput}
                value={sandboxInput}
                onChange={(e) => setSandboxInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSandboxSend()}
                placeholder="Example: Hello! How can I improve my English speaking?"
              />
              <button
                onClick={handleSandboxSend}
                disabled={sandboxLoading}
                style={styles.sandboxBtn}
              >
                {sandboxLoading ? "..." : "Отправить"}
              </button>
            </div>

            {sandboxResponse && (
              <div style={styles.aiReplyBox}>
                <div style={styles.aiAvatar}>🤖 Lingra AI:</div>
                <div style={styles.aiText}>{sandboxResponse}</div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Stages Overview */}
      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>{t.stagesTitle}</h2>
        <div style={styles.grid3}>
          <div style={styles.stageCard}>
            <span style={styles.stageTag}>A1–A2</span>
            <h3 style={styles.stageTitle}>{t.stage1Name}</h3>
            <p style={styles.stageDesc}>{t.stage1Desc}</p>
            <Link to="/lessons?level=a1-a2" style={styles.stageLink}>
              Уроки A1-A2 →
            </Link>
          </div>
          <div style={styles.stageCard}>
            <span style={styles.stageTag}>B1–B2</span>
            <h3 style={styles.stageTitle}>{t.stage2Name}</h3>
            <p style={styles.stageDesc}>{t.stage2Desc}</p>
            <Link to="/lessons?level=b1-b2" style={styles.stageLink}>
              Уроки B1-B2 →
            </Link>
          </div>
          <div style={styles.stageCard}>
            <span style={styles.stageTag}>C1–C2</span>
            <h3 style={styles.stageTitle}>{t.stage3Name}</h3>
            <p style={styles.stageDesc}>{t.stage3Desc}</p>
            <Link to="/lessons?level=c1-c2" style={styles.stageLink}>
              Уроки C1-C2 →
            </Link>
          </div>
        </div>
      </section>

      {/* Reviews & Social Proof */}
      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>{t.reviewsTitle}</h2>
        <div style={styles.grid3}>
          <div style={styles.reviewCard}>
            <div style={styles.stars}>★★★★★</div>
            <p style={styles.reviewText}>
              «За 2 недели общения с ИИ-репетитором я перестал бояться говорить на собеседовании. Отличный курс!»
            </p>

            <div style={styles.reviewer}>— Сардор М., Ташкент</div>
          </div>
          <div style={styles.reviewCard}>
            <div style={styles.stars}>★★★★★</div>
            <p style={styles.reviewText}>
              «Очень удобно, что объяснения есть и на узбекском, и на русском. Все уроки структурированы по делу.»
            </p>
            <div style={styles.reviewer}>— Нигора К., Самарканд</div>
          </div>
          <div style={styles.reviewCard}>
            <div style={styles.stars}>★★★★★</div>
            <p style={styles.reviewText}>
              «Оплатил через Telegram-бота локальной картой Uzcard. Доступ открылся сразу же!»
            </p>
            <div style={styles.reviewer}>— Алексей Р., Алматы</div>
          </div>
        </div>
      </section>

      {/* FAQ Accordion */}
      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>{t.faqTitle}</h2>
        <div style={styles.faqList}>
          <div style={styles.faqCard}>
            <h4 style={styles.faqQ}>❓ {t.faq1Q}</h4>
            <p style={styles.faqA}>{t.faq1A}</p>
          </div>
          <div style={styles.faqCard}>
            <h4 style={styles.faqQ}>❓ {t.faq2Q}</h4>
            <p style={styles.faqA}>{t.faq2A}</p>
          </div>
          <div style={styles.faqCard}>
            <h4 style={styles.faqQ}>❓ {t.faq3Q}</h4>
            <p style={styles.faqA}>{t.faq3A}</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={styles.footer}>
        <div style={styles.footerContainer}>
          <p>{t.footerText}</p>
          <div style={styles.footerLinks}>
            <Link to="/pricing" style={styles.footerLink}>
              {t.navPricing}
            </Link>
            <a
              href="https://t.me/lingra_support"
              target="_blank"
              rel="noreferrer"
              style={styles.footerLink}
            >
              Поддержка в Telegram
            </a>
          </div>
        </div>
      </footer>

      {showTest && <PlacementTestModal onClose={() => setShowTest(false)} />}
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#080811",
    color: "#fff",
    fontFamily: "system-ui, -apple-system, sans-serif",
  },
  hero: {
    maxWidth: "900px",
    margin: "0 auto",
    padding: "80px 24px 60px",
    textAlign: "center",
  },
  badgeContainer: {
    marginBottom: "20px",
  },
  freeBadge: {
    background: "rgba(108, 92, 231, 0.15)",
    color: "#a29bfe",
    border: "1px solid rgba(108, 92, 231, 0.4)",
    padding: "6px 16px",
    borderRadius: "20px",
    fontSize: "0.9rem",
    fontWeight: "600",
  },
  heroTitle: {
    fontSize: "3rem",
    fontWeight: "800",
    lineHeight: "1.2",
    marginBottom: "20px",
    background: "linear-gradient(135deg, #ffffff 0%, #a29bfe 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  heroSubtitle: {
    fontSize: "1.2rem",
    color: "#9ca3af",
    lineHeight: "1.6",
    maxWidth: "680px",
    margin: "0 auto 36px",
  },
  ctaGroup: {
    display: "flex",
    gap: "16px",
    justifyContent: "center",
    flexWrap: "wrap",
  },
  primaryCta: {
    background: "linear-gradient(135deg, #6c5ce7, #8c7ae6)",
    color: "#fff",
    textDecoration: "none",
    padding: "16px 36px",
    borderRadius: "14px",
    fontSize: "1.1rem",
    fontWeight: "700",
    boxShadow: "0 8px 24px rgba(108, 92, 231, 0.4)",
  },
  secondaryCta: {
    background: "rgba(255, 255, 255, 0.06)",
    border: "1px solid rgba(255, 255, 255, 0.15)",
    color: "#fff",
    padding: "16px 28px",
    borderRadius: "14px",
    fontSize: "1.05rem",
    fontWeight: "600",
    cursor: "pointer",
  },
  section: {
    maxWidth: "1100px",
    margin: "0 auto",
    padding: "60px 24px",
  },
  sectionTitle: {
    fontSize: "2rem",
    fontWeight: "700",
    textAlign: "center",
    marginBottom: "40px",
  },
  grid3: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "24px",
  },
  featureCard: {
    background: "#14142a",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    borderRadius: "18px",
    padding: "30px",
  },
  cardIcon: {
    fontSize: "2.5rem",
    marginBottom: "16px",
  },
  cardTitle: {
    fontSize: "1.25rem",
    fontWeight: "600",
    marginBottom: "10px",
  },
  cardDesc: {
    color: "#9ca3af",
    lineHeight: "1.5",
    fontSize: "0.95rem",
  },
  sandboxSection: {
    background: "linear-gradient(180deg, rgba(20, 20, 42, 0.6) 0%, rgba(8, 8, 17, 1) 100%)",
    padding: "60px 24px",
    borderTop: "1px solid rgba(255, 255, 255, 0.05)",
    borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
  },
  sandboxContainer: {
    maxWidth: "750px",
    margin: "0 auto",
  },
  sandboxSubtitle: {
    textAlign: "center",
    color: "#9ca3af",
    marginTop: "-20px",
    marginBottom: "30px",
  },
  sandboxBox: {
    background: "#14142a",
    border: "1px solid rgba(108, 92, 231, 0.3)",
    borderRadius: "18px",
    padding: "24px",
    boxShadow: "0 12px 30px rgba(0,0,0,0.4)",
  },
  inputRow: {
    display: "flex",
    gap: "12px",
  },
  sandboxInput: {
    flex: 1,
    background: "#1f1f3d",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    borderRadius: "12px",
    padding: "14px 18px",
    color: "#fff",
    fontSize: "1rem",
    outline: "none",
  },
  sandboxBtn: {
    background: "#6c5ce7",
    color: "#fff",
    border: "none",
    borderRadius: "12px",
    padding: "0 24px",
    fontSize: "1rem",
    fontWeight: "600",
    cursor: "pointer",
  },
  aiReplyBox: {
    marginTop: "20px",
    background: "rgba(108, 92, 231, 0.12)",
    borderLeft: "4px solid #6c5ce7",
    borderRadius: "8px",
    padding: "16px",
  },
  aiAvatar: {
    fontWeight: "700",
    color: "#a29bfe",
    marginBottom: "6px",
  },
  aiText: {
    color: "#e5e7eb",
    lineHeight: "1.5",
  },
  stageCard: {
    background: "#14142a",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    borderRadius: "18px",
    padding: "28px",
    display: "flex",
    flexDirection: "column",
  },
  stageTag: {
    background: "rgba(108, 92, 231, 0.2)",
    color: "#a29bfe",
    alignSelf: "flex-start",
    padding: "4px 12px",
    borderRadius: "8px",
    fontWeight: "700",
    fontSize: "0.85rem",
    marginBottom: "14px",
  },
  stageTitle: {
    fontSize: "1.2rem",
    fontWeight: "600",
    marginBottom: "10px",
  },
  stageDesc: {
    color: "#9ca3af",
    fontSize: "0.95rem",
    lineHeight: "1.5",
    flex: 1,
    marginBottom: "20px",
  },
  stageLink: {
    color: "#a29bfe",
    textDecoration: "none",
    fontWeight: "600",
  },
  reviewCard: {
    background: "#14142a",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    borderRadius: "18px",
    padding: "24px",
  },
  stars: {
    color: "#f59e0b",
    marginBottom: "12px",
  },
  reviewText: {
    color: "#d1d5db",
    fontStyle: "italic",
    lineHeight: "1.5",
    marginBottom: "16px",
  },
  reviewer: {
    color: "#9ca3af",
    fontWeight: "600",
    fontSize: "0.9rem",
  },
  faqList: {
    maxWidth: "800px",
    margin: "0 auto",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  faqCard: {
    background: "#14142a",
    borderRadius: "14px",
    padding: "20px 24px",
    border: "1px solid rgba(255, 255, 255, 0.06)",
  },
  faqQ: {
    fontSize: "1.1rem",
    fontWeight: "600",
    marginBottom: "8px",
  },
  faqA: {
    color: "#9ca3af",
    lineHeight: "1.5",
    fontSize: "0.95rem",
  },
  footer: {
    borderTop: "1px solid rgba(255, 255, 255, 0.08)",
    padding: "32px 24px",
    background: "#05050b",
  },
  footerContainer: {
    maxWidth: "1100px",
    margin: "0 auto",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "16px",
    color: "#6b7280",
    fontSize: "0.9rem",
  },
  footerLinks: {
    display: "flex",
    gap: "20px",
  },
  footerLink: {
    color: "#9ca3af",
    textDecoration: "none",
  },
};
