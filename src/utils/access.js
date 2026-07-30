// Lingra Access Control & Subscription Utility

const PREMIUM_KEY = "lingra_premium_status";
const PROMO_CODES = ["LINGRA2026", "LINGRAVIP", "LINGRAPRO", "START2026", "UZB2026"];
const AI_FREE_LIMIT = 5;
const AI_USAGE_KEY = "lingra_ai_usage";

export function isPremium() {
  try {
    return localStorage.getItem(PREMIUM_KEY) === "true";
  } catch (e) {
    return false;
  }
}

export function activatePremium(code) {
  const cleanCode = (code || "").trim().toUpperCase();
  if (!cleanCode) return { success: false, message: "Введите промокод или ключ активации" };
  
  if (PROMO_CODES.includes(cleanCode)) {
    localStorage.setItem(PREMIUM_KEY, "true");
    return { success: true, message: "Премиум доступ успешно активирован! 🚀" };
  }
  return { success: false, message: "Неверный промокод или ключ доступа" };
}

export function setPremiumDirectly(status = true) {
  localStorage.setItem(PREMIUM_KEY, status ? "true" : "false");
}

export function isLessonUnlocked(lessonId) {
  // Lesson 1 is free for everyone
  if (Number(lessonId) === 1) return true;
  return isPremium();
}

export function getAIMessageQuota() {
  if (isPremium()) return { isUnlimited: true, remaining: Infinity, limit: Infinity };
  
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  let usage = { date: today, count: 0 };
  
  try {
    const stored = localStorage.getItem(AI_USAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.date === today) {
        usage = parsed;
      }
    }
  } catch (e) {}

  const remaining = Math.max(0, AI_FREE_LIMIT - usage.count);
  return { isUnlimited: false, remaining, limit: AI_FREE_LIMIT };
}

export function recordAIMessageSent() {
  if (isPremium()) return true;
  
  const today = new Date().toISOString().slice(0, 10);
  let count = 0;
  
  try {
    const stored = localStorage.getItem(AI_USAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.date === today) count = parsed.count;
    }
  } catch (e) {}

  if (count >= AI_FREE_LIMIT) return false;

  localStorage.setItem(AI_USAGE_KEY, JSON.stringify({ date: today, count: count + 1 }));
  return true;
}
