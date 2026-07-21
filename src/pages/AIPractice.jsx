import { useState } from "react";

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
  },
  msg: { marginBottom: "10px", lineHeight: 1.4 },
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
};

export default function AIPractice() {
  const [messages, setMessages] = useState([
    { role: "tutor", text: "Hi! I'm your AI tutor. Let's practice English — tell me about your day." },
  ]);
  const [input, setInput] = useState("");

  const send = () => {
    if (!input.trim()) return;
    setMessages((m) => [...m, { role: "user", text: input }]);
    setInput("");
    // Note: actual Claude API call happens server-side via backend integration
  };

  return (
    <div style={styles.page}>
      <h1 style={styles.h1}>ИИ-репетитор</h1>
      <div style={styles.chat}>
        {messages.map((m, i) => (
          <div key={i} style={styles.msg}>
            <strong>{m.role === "tutor" ? "Tutor" : "Вы"}:</strong> {m.text}
          </div>
        ))}
      </div>
      <div style={styles.inputRow}>
        <input
          style={styles.input}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Напишите ответ на английском..."
        />
        <button style={styles.send} onClick={send}>Отправить</button>
      </div>
    </div>
  );
}
