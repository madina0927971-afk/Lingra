// Прогресс пользователя: XP, стрик, завершённые уроки — хранится в localStorage.
// Ключ хранения:
const STORAGE_KEY = "lingra_progress_v1";

const LEVEL_ORDER = ["a1-a2", "b1-b2", "c1-c2"];

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function defaultProgress() {
  return {
    xp: 0,
    streak: 0,
    lastActiveDate: null,
    lessons: {}, // key: "level:id" -> { correct, total, stars, completedAt }
    words: {}, // key: normalized english term -> { term, context, level, lessonId, timesCorrect, firstLearnedAt, lastReviewedAt }
  };
}

export function loadProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultProgress();
    const parsed = JSON.parse(raw);
    return { ...defaultProgress(), ...parsed };
  } catch {
    return defaultProgress();
  }
}

function save(progress) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // localStorage недоступен (приватный режим и т.п.) — тихо игнорируем
  }
}

// Вызывать один раз при заходе в приложение — обновляет стрик по дням.
export function touchStreak() {
  const progress = loadProgress();
  const today = todayStr();
  if (progress.lastActiveDate === today) return progress;

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yStr = yesterday.toISOString().slice(0, 10);

  if (progress.lastActiveDate === yStr) {
    progress.streak += 1;
  } else {
    progress.streak = 1;
  }
  progress.lastActiveDate = today;
  save(progress);
  return progress;
}

export function saveLessonResult(level, lessonId, correct, total) {
  const progress = loadProgress();
  const key = `${level}:${lessonId}`;
  const stars = total > 0 ? Math.round((correct / total) * 3) : 0;
  const alreadyDone = !!progress.lessons[key];
  const earnedXP = correct * 10 + (correct === total ? 20 : 0);

  const prevStars = alreadyDone ? progress.lessons[key].stars : 0;
  progress.lessons[key] = {
    correct,
    total,
    stars: Math.max(stars, prevStars),
    completedAt: new Date().toISOString(),
  };

  // XP начисляем всегда (за повторное прохождение тоже, но меньше)
  progress.xp += alreadyDone ? Math.round(earnedXP * 0.3) : earnedXP;
  save(progress);
  return { xpEarned: alreadyDone ? Math.round(earnedXP * 0.3) : earnedXP, stars, progress };
}

export function getLessonResult(level, lessonId) {
  const progress = loadProgress();
  return progress.lessons[`${level}:${lessonId}`] || null;
}

export function getLevelStats(level, totalLessons) {
  const progress = loadProgress();
  const completed = Array.from({ length: totalLessons }).filter(
    (_, i) => progress.lessons[`${level}:${i + 1}`]
  ).length;
  const percent = totalLessons > 0 ? Math.round((completed / totalLessons) * 100) : 0;
  return { completed, total: totalLessons, percent };
}

export function isLevelUnlocked(level, lessonsCountByLevel) {
  const idx = LEVEL_ORDER.indexOf(level);
  if (idx <= 0) return true; // первый уровень всегда открыт
  const prevLevel = LEVEL_ORDER[idx - 1];
  const prevTotal = lessonsCountByLevel[prevLevel] || 0;
  const stats = getLevelStats(prevLevel, prevTotal);
  return stats.percent >= 70; // открываем следующий этап после 70% предыдущего
}

// Вызывается при каждом верном ответе в уроке — сохраняет слово/фразу в словарь пользователя.
// term — правильный ответ упражнения (exercise.answer), context — вопрос урока (для подсказки).
export function recordLearnedWord(level, lessonId, term, context) {
  if (!term) return;
  const progress = loadProgress();
  const key = term.trim().toLowerCase();
  const existing = progress.words[key];

  progress.words[key] = {
    term,
    context: context || (existing ? existing.context : ""),
    level,
    lessonId,
    timesCorrect: (existing?.timesCorrect || 0) + 1,
    firstLearnedAt: existing?.firstLearnedAt || new Date().toISOString(),
    lastReviewedAt: new Date().toISOString(),
  };
  save(progress);
}

export function getAllWords() {
  const progress = loadProgress();
  return Object.values(progress.words).sort(
    (a, b) => new Date(b.lastReviewedAt) - new Date(a.lastReviewedAt)
  );
}

export function getWordCount() {
  return Object.keys(loadProgress().words).length;
}

export function getTotalXP() {
  return loadProgress().xp;
}

export function getStreak() {
  return loadProgress().streak;
}

export function resetProgress() {
  save(defaultProgress());
}
