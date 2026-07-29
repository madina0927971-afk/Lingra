import { useState } from "react";
import { useNavigate } from "react-router-dom";

const questions = [
  {
    question: "Choose the correct phrase: 'Yesterday, I ______ to the market.'",
    options: ["go", "went", "have gone", "will go"],
    correct: 1, // went
    levelPoint: 1,
  },
  {
    question: "Which sentence is grammatically correct?",
    options: [
      "If I will have time, I help you.",
      "If I have time, I would help you.",
      "If I had known about the meeting, I would have attended.",
      "If I know about meeting, I came.",
    ],
    correct: 2, // If I had known...
    levelPoint: 2,
  },
  {
    question: "Choose the best synonym for 'mitigate':",
    options: ["alleviate / reduce", "exaggerate", "determine", "postpone"],
    correct: 0, // alleviate
    levelPoint: 3,
  },
];

export default function PlacementTestModal({ onClose }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const navigate = useNavigate();

  const handleOptionSelect = (index) => {
    let newScore = score;
    if (index === questions[currentStep].correct) {
      newScore += questions[currentStep].levelPoint;
    }
    setScore(newScore);

    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setFinished(true);
    }
  };

  const getRecommendedLevel = () => {
    if (score <= 1) return { code: "a1-a2", label: "A1–A2 (Начинающий / Asosiy)", desc: "Фундамент: базовые фразы, грамматика и понимание на слух." };
    if (score <= 3) return { code: "b1-b2", label: "B1–B2 (Средний / Ishonchli)", desc: "Разговорный английский: фильмы, работа и уверенная речь." };
    return { code: "c1-c2", label: "C1–C2 (Продвинутый / Erkin)", desc: "Свободный разговор, бизнес-язык и тонкие нюансы носителей." };
  };

  const recommended = getRecommendedLevel();

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <button onClick={onClose} style={styles.closeBtn}>✕</button>

        {!finished ? (
          <div>
            <div style={styles.badge}>Тест уровня • Вопрос {currentStep + 1} из 3</div>
            <h3 style={styles.questionTitle}>{questions[currentStep].question}</h3>

            <div style={styles.optionsList}>
              {questions[currentStep].options.map((opt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleOptionSelect(idx)}
                  style={styles.optionBtn}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div style={{ textAlign: "center" }}>
            <div style={styles.resultBadge}>🎉 Ваш результат готовит успех!</div>
            <h2 style={styles.resultTitle}>Ваш рекомендуемый уровень:</h2>
            <div style={styles.levelTag}>{recommended.label}</div>
            <p style={styles.levelDesc}>{recommended.desc}</p>

            <button
              onClick={() => {
                onClose();
                navigate(`/lessons?level=${recommended.code}`);
              }}
              style={styles.actionBtn}
            >
              Начать обучение на уровне {recommended.label.split(" ")[0]} →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0, 0, 0, 0.75)",
    backdropFilter: "blur(8px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    padding: "20px",
  },
  modal: {
    background: "#14142a",
    border: "1px solid rgba(255, 255, 255, 0.12)",
    borderRadius: "20px",
    padding: "32px",
    maxWidth: "500px",
    width: "100%",
    position: "relative",
    boxShadow: "0 20px 40px rgba(0, 0, 0, 0.6)",
    color: "#fff",
    fontFamily: "system-ui, sans-serif",
  },
  closeBtn: {
    position: "absolute",
    top: "16px",
    right: "16px",
    background: "none",
    border: "none",
    color: "#9ca3af",
    fontSize: "1.2rem",
    cursor: "pointer",
  },
  badge: {
    color: "#a29bfe",
    fontSize: "0.85rem",
    fontWeight: "600",
    textTransform: "uppercase",
    marginBottom: "12px",
  },
  questionTitle: {
    fontSize: "1.25rem",
    fontWeight: "600",
    marginBottom: "24px",
    lineHeight: "1.4",
  },
  optionsList: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  optionBtn: {
    background: "rgba(255, 255, 255, 0.05)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    borderRadius: "12px",
    padding: "14px 18px",
    color: "#fff",
    textAlign: "left",
    fontSize: "1rem",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  resultBadge: {
    color: "#4ade80",
    fontWeight: "600",
    fontSize: "0.9rem",
    marginBottom: "8px",
  },
  resultTitle: {
    fontSize: "1.1rem",
    opacity: 0.8,
    marginBottom: "12px",
  },
  levelTag: {
    background: "linear-gradient(135deg, #6c5ce7, #8c7ae6)",
    display: "inline-block",
    padding: "10px 20px",
    borderRadius: "12px",
    fontSize: "1.3rem",
    fontWeight: "700",
    marginBottom: "16px",
    boxShadow: "0 6px 20px rgba(108, 92, 231, 0.4)",
  },
  levelDesc: {
    color: "#d1d5db",
    fontSize: "0.95rem",
    lineHeight: "1.5",
    marginBottom: "24px",
  },
  actionBtn: {
    width: "100%",
    background: "linear-gradient(135deg, #10b981, #059669)",
    color: "#fff",
    border: "none",
    borderRadius: "12px",
    padding: "14px",
    fontSize: "1rem",
    fontWeight: "700",
    cursor: "pointer",
  },
};
