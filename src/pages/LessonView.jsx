import { useParams, useNavigate, Link } from "react-router-dom";
import { useState } from "react";
import { getLesson, getLessons } from "../data/lessons";
import { saveLessonResult, recordLearnedWord } from "../utils/progress";

const styles = {
  page: {
    minHeight: "100vh",
    background: "#080811",
    color: "#fff",
    padding: "32px 24px",
    fontFamily: "system-ui, sans-serif",
  },
  h1: { fontSize: "1.6rem", marginBottom: "4px" },
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
    fontSize: "1rem",
  },
  input: {
    width: "100%",
    padding: "12px",
    borderRadius: "10px",
    border: "none",
    background: "#1f1f3d",
    color: "#fff",
    fontSize: "1rem",
    marginBottom: "12px",
  },
  feedback: { marginTop: "8px", fontWeight: 600 },
  correct: { color: "#4ade80" },
  wrong: { color: "#f87171" },
  nextBtn: {
    marginTop: "16px",
    background: "#6c5ce7",
    color: "#fff",
    border: "none",
    borderRadius: "10px",
    padding: "10px 20px",
    cursor: "pointer",
  },
  back: { color: "#6c5ce7", textDecoration: "none", display: "inline-block", marginTop: "20px" },
  progress: { opacity: 0.5, fontSize: "0.9rem", marginBottom: "12px" },
  scoreBadge: { opacity: 0.7, fontSize: "0.85rem", marginBottom: "12px" },
  resultCard: {
    background: "#14142a",
    borderRadius: "14px",
    padding: "32px",
    maxWidth: "460px",
    textAlign: "center",
  },
  resultStars: { fontSize: "2.2rem", letterSpacing: "6px", marginBottom: "12px" },
  resultScore: { fontSize: "1.3rem", fontWeight: 700, marginBottom: "6px" },
  resultXP: { color: "#6c5ce7", fontWeight: 600, marginBottom: "20px" },
  resultBtnRow: { display: "flex", gap: "10px", justifyContent: "center", flexWrap: "wrap" },
};

export default function LessonView() {
  const { level, id } = useParams();
  const navigate = useNavigate();
  const lesson = getLesson(level, id);
  const allLessons = getLessons(level);

  const [step, setStep] = useState(0);
  const [textAnswer, setTextAnswer] = useState("");
  const [feedback, setFeedback] = useState(null); // null | 'correct' | 'wrong'
  const [selected, setSelected] = useState(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [finished, setFinished] = useState(false);
  const [result, setResult] = useState(null); // { xpEarned, stars }

  if (!lesson) {
    return (
      <div style={styles.page}>
        <h1 style={styles.h1}>Урок не найден</h1>
        <Link to={`/lessons/${level || "a1-a2"}`} style={styles.back}>← Назад к урокам</Link>
      </div>
    );
  }

  const normalize = (s) => s.trim().toLowerCase().replace(/[.,!?]/g, "");

  if (finished) {
    const nextLessonIdx = allLessons.findIndex((l) => l.id === lesson.id) + 1;
    const nextLesson = allLessons[nextLessonIdx];

    return (
      <div style={{ ...styles.page, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <div style={styles.resultCard}>
          <div style={styles.resultStars}>
            {"⭐".repeat(result.stars)}{"☆".repeat(3 - result.stars)}
          </div>
          <div style={styles.resultScore}>
            Результат: {correctCount} из {lesson.exercises.length}
          </div>
          <div style={styles.resultXP}>+{result.xpEarned} XP</div>
          <div style={styles.resultBtnRow}>
            {nextLesson ? (
              <button
                style={styles.nextBtn}
                onClick={() => navigate(`/lesson/${level}/${nextLesson.id}`)}
              >
                Следующий урок →
              </button>
            ) : (
              <button style={styles.nextBtn} onClick={() => navigate("/dashboard")}>
                Стадия завершена! 🎉
              </button>
            )}
            <button
              style={{ ...styles.nextBtn, background: "#1f1f3d" }}
              onClick={() => navigate(`/lessons/${level}`)}
            >
              К списку уроков
            </button>
          </div>
        </div>
      </div>
    );
  }

  const exercise = lesson.exercises[step];
  const isLast = step === lesson.exercises.length - 1;

  const checkChoose = (opt) => {
    if (feedback !== null) return;
    setSelected(opt);
    const isCorrect = normalize(opt) === normalize(exercise.answer);
    if (isCorrect) {
      setCorrectCount((c) => c + 1);
      recordLearnedWord(level, lesson.id, exercise.answer, exercise.question);
    }
    setFeedback(isCorrect ? "correct" : "wrong");
  };

  const checkText = () => {
    if (feedback !== null) return;
    const isCorrect = normalize(textAnswer) === normalize(exercise.answer);
    if (isCorrect) {
      setCorrectCount((c) => c + 1);
      recordLearnedWord(level, lesson.id, exercise.answer, exercise.question);
    }
    setFeedback(isCorrect ? "correct" : "wrong");
  };

  const next = () => {
    if (isLast) {
      const finalCorrect = correctCount;
      const { xpEarned, stars } = saveLessonResult(
        level,
        lesson.id,
        finalCorrect,
        lesson.exercises.length
      );
      setResult({ xpEarned, stars });
      setFinished(true);
      return;
    }
    setStep((s) => s + 1);
    setTextAnswer("");
    setSelected(null);
    setFeedback(null);
  };

  return (
    <div style={styles.page}>
      <h1 style={styles.h1}>Урок {lesson.id}: {lesson.title}</h1>
      <p style={styles.meta}>Уровень: {level}</p>
      <p style={styles.progress}>Задание {step + 1} из {lesson.exercises.length}</p>
      <p style={styles.scoreBadge}>✓ Верно: {correctCount}</p>

      <div style={styles.card}>
        <p style={styles.question}>{exercise.question}</p>

        {exercise.type === "choose" && (
          <>
            {exercise.options.map((opt) => {
              let bg = "#1f1f3d";
              if (selected === opt) {
                bg = normalize(opt) === normalize(exercise.answer) ? "#1f6d3d" : "#6d1f2a";
              }
              return (
                <button
                  key={opt}
                  style={{ ...styles.option, background: bg }}
                  onClick={() => checkChoose(opt)}
                  disabled={feedback !== null}
                >
                  {opt}
                </button>
              );
            })}
          </>
        )}

        {(exercise.type === "fill" || exercise.type === "translate") && (
          <>
            <input
              style={styles.input}
              value={textAnswer}
              onChange={(e) => setTextAnswer(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && feedback === null && checkText()}
              placeholder="Введите ответ на английском..."
              disabled={feedback !== null}
            />
            {feedback === null && (
              <button style={styles.nextBtn} onClick={checkText}>Проверить</button>
            )}
          </>
        )}

        {feedback === "correct" && (
          <p style={{ ...styles.feedback, ...styles.correct }}>✓ Верно!</p>
        )}
        {feedback === "wrong" && (
          <p style={{ ...styles.feedback, ...styles.wrong }}>
            ✗ Неверно. Правильный ответ: {exercise.answer}
          </p>
        )}

        {feedback !== null && (
          <button style={styles.nextBtn} onClick={next}>
            {isLast ? "Завершить урок" : "Следующее задание →"}
          </button>
        )}
      </div>

      <Link to={`/lessons/${level}`} style={styles.back}>← Назад к урокам</Link>
    </div>
  );
}
