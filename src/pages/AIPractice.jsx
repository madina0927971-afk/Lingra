import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { getAIMessageQuota, recordAIMessageSent, isPremium } from "../utils/access";
import { useLanguage, translations } from "../utils/i18n";
import { simulateAIResponse } from "../utils/simulateAI";

export default function AIPractice() {
  const lang = useLanguage();
  const t = translations[lang] || translations.ru;

  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "Hi! I'm your Lingra AI English Tutor 🤖. Let's practice speaking! Tell me, what did you do today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [quota, setQuota] = useState(getAIMessageQuota());
  const chatRef = useRef(null);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const speakText = (text) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel(); // stop previous
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-US";
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  const send = async () => {
    if (!input.trim() || loading) return;

    // Check message quota
    const currentQuota = getAIMessageQuota();
    if (!currentQuota.isUnlimited && currentQuota.remaining <= 0) {
      setError("Вы израсходовали 5 бесплатныx сообщений на сегодня. Оформите Premium для безлимитного общения!");
      return;
    }

    const userMsg = { role: "user", text: input };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput("");
    setError(null);
    setLoading(true);

    // Record usage
    recordAIMessageSent();
    setQuota(getAIMessageQuota());

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updated.map((m) => ({
            role: m.role === "assistant" ? "assistant" : "user",
            content: m.text,
          })),
        }),
      });
      if (!res.ok) throw new Error("api unavailable");
      const data = await res.json();
      if (!data.text) throw new Error("empty response");
      setMessages((m) => [...m, { role: "assistant", text: data.text }]);
    } catch {
      // /api/chat недоступен (нет ключа/кредитов ANTHROPIC_API_KEY, сеть и т.п.) —
      // переключаемся на локальную симуляцию, но честно помечаем сообщение как
      // demo-режим, чтобы не выдавать заскриптованный ответ за настоящий ИИ.
      await new Promise((r) => setTimeout(r, 400 + Math.random() * 400));
      const simulated = simulateAIResponse(userMsg.text, updated);
      setMessages((m) => [...m, { role: "assistant", text: simulated, simulated: true }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <Navbar />

      <div style={styles.container}>
        <div style={styles.headerRow}>
          <div>
            <h1 style={styles.h1}>{t.navAI}</h1>
            <p style={styles.subtitle}>
              Практикуй разговорный английский 24/7 с умным ИИ-тьютором
            </p>
          </div>

          <div style={styles.quotaBadge}>
            {quota.isUnlimited ? (
              <span style={{ color: "#34d399" }}>✨ PRO Unlimited Access</span>
            ) : (
              <span>
                Осталось бесплатных сообщений сегодня:{" "}
                <strong style={{ color: quota.remaining > 0 ? "#6c5ce7" : "#ef4444" }}>
                  {quota.remaining} / {quota.limit}
                </strong>
              </span>
            )}
          </div>
        </div>

        {!quota.isUnlimited && quota.remaining <= 0 && (
          <div style={styles.limitBanner}>
            🔒 Бесплатный дневной лимит исчерпан.{" "}
            <Link to="/pricing" style={styles.upgradeLink}>
              Разблокировать Premium безлимит →
            </Link>
          </div>
        )}

        {messages.some((m) => m.simulated) && (
          <div style={styles.demoBanner}>
            ⚠️ ИИ-репетитор сейчас временно недоступен. Вы получаете заготовленные
            демо-ответы, а не живой ИИ — мы уже работаем над восстановлением.
          </div>
        )}

        {/* Chat Box */}
        <div style={styles.chatBox} ref={chatRef}>
          {messages.map((m, i) => {
            const isAI = m.role === "assistant";
            return (
              <div
                key={i}
                style={{
                  ...styles.msgWrapper,
                  justifyContent: isAI ? "flex-start" : "flex-end",
                }}
              >
                <div
                  style={{
                    ...styles.msgBubble,
                    background: isAI ? "#14142a" : "#6c5ce7",
                    border: isAI ? "1px solid rgba(255, 255, 255, 0.08)" : "none",
                  }}
                >
                  <div style={styles.msgHeader}>
                    <span>{isAI ? "🤖 Lingra Tutor" : "👤 Вы"}</span>
                    {isAI && m.simulated && (
                      <span style={styles.demoTag} title="ИИ временно недоступен — это заготовленный демо-ответ">
                        DEMO
                      </span>
                    )}
                    {isAI && (
                      <button
                        onClick={() => speakText(m.text)}
                        style={styles.voiceBtn}
                        title="Прослушать произношение"
                      >
                        🔊 Слушать
                      </button>
                    )}
                  </div>
                  <div style={styles.msgText}>{m.text}</div>
                </div>
              </div>
            );
          })}
          {loading && (
            <div style={styles.typingMsg}>🤖 Lingra Tutor печатает...</div>
          )}
        </div>

        {/* Input Row */}
        <div style={styles.inputRow}>
          <input
            style={styles.input}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="Напишите ответ на английском..."
            disabled={loading || (!quota.isUnlimited && quota.remaining <= 0)}
          />
          <button
            style={styles.sendBtn}
            onClick={send}
            disabled={loading || (!quota.isUnlimited && quota.remaining <= 0)}
          >
            Отправить
          </button>
        </div>

        {error && <p style={styles.error}>{error}</p>}
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
    maxWidth: "800px",
    margin: "0 auto",
    padding: "36px 24px",
    display: "flex",
    flexDirection: "column",
    minHeight: "calc(100vh - 70px)",
  },
  headerRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "20px",
    flexWrap: "wrap",
    gap: "12px",
  },
  h1: { fontSize: "2rem", fontWeight: "800", marginBottom: "4px" },
  subtitle: { color: "#9ca3af", fontSize: "0.95rem" },
  quotaBadge: {
    background: "#14142a",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    padding: "8px 14px",
    borderRadius: "10px",
    fontSize: "0.85rem",
    fontWeight: "600",
  },
  limitBanner: {
    background: "rgba(239, 68, 68, 0.15)",
    border: "1px solid rgba(239, 68, 68, 0.3)",
    color: "#f87171",
    padding: "12px 18px",
    borderRadius: "12px",
    marginBottom: "20px",
    fontSize: "0.95rem",
    fontWeight: "600",
  },
  upgradeLink: {
    color: "#fff",
    textDecoration: "underline",
    fontWeight: "700",
    marginLeft: "8px",
  },
  demoBanner: {
    background: "rgba(251, 191, 36, 0.12)",
    border: "1px solid rgba(251, 191, 36, 0.3)",
    color: "#fbbf24",
    padding: "12px 18px",
    borderRadius: "12px",
    marginBottom: "20px",
    fontSize: "0.9rem",
    fontWeight: "600",
    lineHeight: 1.4,
  },
  chatBox: {
    flex: 1,
    background: "rgba(20, 20, 42, 0.5)",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    borderRadius: "18px",
    padding: "20px",
    marginBottom: "20px",
    minHeight: "350px",
    maxHeight: "55vh",
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    gap: "14px",
  },
  msgWrapper: {
    display: "flex",
    width: "100%",
  },
  msgBubble: {
    maxWidth: "80%",
    borderRadius: "16px",
    padding: "14px 18px",
    color: "#fff",
    boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
  },
  msgHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "6px",
    fontSize: "0.8rem",
    fontWeight: "700",
    color: "#a29bfe",
    gap: "12px",
  },
  voiceBtn: {
    background: "rgba(255, 255, 255, 0.08)",
    border: "none",
    color: "#d1d5db",
    borderRadius: "6px",
    padding: "2px 8px",
    fontSize: "0.75rem",
    cursor: "pointer",
  },
  demoTag: {
    background: "rgba(251, 191, 36, 0.15)",
    color: "#fbbf24",
    border: "1px solid rgba(251, 191, 36, 0.35)",
    borderRadius: "6px",
    padding: "2px 8px",
    fontSize: "0.7rem",
    fontWeight: "700",
    letterSpacing: "0.5px",
  },
  msgText: {
    fontSize: "1rem",
    lineHeight: "1.5",
  },
  typingMsg: {
    color: "#9ca3af",
    fontStyle: "italic",
    fontSize: "0.9rem",
  },
  inputRow: {
    display: "flex",
    gap: "12px",
  },
  input: {
    flex: 1,
    background: "#14142a",
    border: "1px solid rgba(255, 255, 255, 0.12)",
    borderRadius: "14px",
    padding: "14px 18px",
    color: "#fff",
    fontSize: "1rem",
    outline: "none",
  },
  sendBtn: {
    background: "linear-gradient(135deg, #6c5ce7, #8c7ae6)",
    color: "#fff",
    border: "none",
    borderRadius: "14px",
    padding: "0 28px",
    fontSize: "1rem",
    fontWeight: "700",
    cursor: "pointer",
  },
  error: {
    color: "#f87171",
    marginTop: "12px",
    fontWeight: "600",
    fontSize: "0.9rem",
  },
};
