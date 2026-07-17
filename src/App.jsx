import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Lessons from "./pages/Lessons";
import LessonView from "./pages/LessonView";
import AIPractice from "./pages/AIPractice";
import Pricing from "./pages/Pricing";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/lessons" element={<Lessons />} />
        <Route path="/lesson/:level/:id" element={<LessonView />} />
        <Route path="/ai-practice" element={<AIPractice />} />
        <Route path="/pricing" element={<Pricing />} />
      </Routes>
    </Router>
  );
}

export default App;
