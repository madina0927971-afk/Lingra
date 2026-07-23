import { useState, useRef, useEffect } from "react";

const styles = {
  page: {
    minHeight: "100vh",
    background: "#080811",
    color: "#fff",
    padding: "32px 24px",
    fontFamily: "system-ui, sans-serif",
    display: "flex",
    flexDirection: "column",
  },
  h1: { fontSize: "1.6rem", marginBottom: "20px" },
  chat: {
    flex: 1,
    maxWidth: "600px",
    background: "#14142a",
    borderRadius: "14px",
    padding: "16px",
    marginBottom: "16px",
    minHeight: "300px",
    maxHeight: "50vh",
    overflowY: "auto",
  },
  msg: { marginBottom: "10px", lineHeight: 1.4 },
  typing: { opacity: 0.5, fontStyle: "italic" },
  inputRow: { display: "flex", gap: "8px", maxWidth: "600px" },
  input: {
    flex: 1,
    padding: "12px",
    borderRadius: "10px",
    border: "none",
    background: "#1f1f3d",
    color: "#fff",
  },
  send: {
    background: "#6c5ce7",
    color: "#fff",
    border: "none",
    borderRadius: "10px",
    padding: "0 20px",
    cursor: "pointer",
  },
  error: { color: "#f87171", marginTop: "8px", maxWidth: "600px" },
};

export default function AIPractice() {
  const [messages, setMessages] = useState([
    { role: "assistant", text: "Hi! I'm your AI tutor. Let's practice English — tell me about your day." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const chatRef = useRef(null);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg = { role: "user", text: input };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput("");
    setError(null);
    setLoading(true);

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
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Ошибка сервера");
      setMessages((m) => [...m, { role: "assistant", text: data.text }]);
    } catch (err) {
      setError(
        err.message ||
          "Не удалось получить ответ от ИИ-репетитора. Попробуйте ещё раз."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <h1 style={styles.h1}>ИИ-репетитор</h1>
      <div style={styles.chat} ref={chatRef}>
        {messages.map((m, i) => (
          <div key={i} style={styles.msg}>
            <strong>{m.role === "assistant" ? "Tutor" : "Вы"}:</strong> {m.text}
          </div>
        ))}
        {loading && <div style={{ ...styles.msg, ...styles.typing }}>Tutor печатает...</div>}
      </div>
      <div style={styles.inputRow}>
        <input
          style={styles.input}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Напишите ответ на английском..."
          disabled={loading}
        />
        <button style={styles.send} onClick={send} disabled={loading}>
          Отправить
        </button>
      </div>
      {error && <p style={styles.error}>{error}</p>}
    </div>
  );
}
