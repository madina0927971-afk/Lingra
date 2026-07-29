import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Lessons from "./pages/Lessons";
import LessonView from "./pages/LessonView";
import AIPractice from "./pages/AIPractice";
import Vocabulary from "./pages/Vocabulary";
import Pricing from "./pages/Pricing";
import { touchStreak } from "./utils/progress";

function App() {
  useEffect(() => {
    // Обновляем стрик один раз при загрузке приложения
    touchStreak();
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        {/* Старая ссылка без уровня — по умолчанию ведём на A1-A2 */}
        <Route path="/lessons" element={<Navigate to="/lessons/a1-a2" replace />} />
        <Route path="/lessons/:level" element={<Lessons />} />
        <Route path="/lesson/:level/:id" element={<LessonView />} />
        <Route path="/ai-practice" element={<AIPractice />} />
        <Route path="/vocabulary" element={<Vocabulary />} />
        <Route path="/pricing" element={<Pricing />} />
      </Routes>
    </Router>
  );
}

export default App;
