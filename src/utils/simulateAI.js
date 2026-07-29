// Локальная симуляция ответов ИИ-репетитора.
// Используется как fallback, если /api/chat недоступен (нет ключа, нет сети и т.п.),
// чтобы демо-сценарий всегда работал до конца без ошибок.

const GREETINGS = ["hi", "hello", "hey", "good morning", "good evening"];
const THANKS = ["thank", "thanks"];

const FOLLOW_UPS = [
  "What did you do after that?",
  "How did that make you feel?",
  "Can you tell me more about it?",
  "What happened next?",
  "Do you often do that?",
  "Why do you think that happened?",
];

const CORRECTIONS = [
  {
    test: /\bi am agree\b/i,
    fix: 'Small correction: we say "I agree", not "I am agree". ',
  },
  {
    test: /\bmore better\b/i,
    fix: 'Tip: just "better" is enough — no need for "more better". ',
  },
  {
    test: /\bdidn't went\b/i,
    fix: 'Small fix: "didn\'t go", not "didn\'t went" — after "didn\'t" we use the base form. ',
  },
];

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function containsAny(text, words) {
  const lower = text.toLowerCase();
  return words.some((w) => lower.includes(w));
}

export function simulateAIResponse(userText, history = []) {
  const text = (userText || "").trim();
  if (!text) {
    return "I didn't quite catch that — could you write a full sentence in English?";
  }

  let correctionNote = "";
  for (const rule of CORRECTIONS) {
    if (rule.test.test(text)) {
      correctionNote = rule.fix;
      break;
    }
  }

  if (containsAny(text, GREETINGS) && history.length <= 1) {
    return "Hello! Great to see you here. Tell me — what's one thing you did today?";
  }

  if (containsAny(text, THANKS)) {
    return "You're welcome! Let's keep practicing — describe your typical morning routine.";
  }

  const wordCount = text.split(/\s+/).filter(Boolean).length;

  if (wordCount < 3) {
    return "Nice start! Can you try to answer in a full sentence? For example: \"I usually...\"";
  }

  const praises = [
    "That's a good sentence!",
    "Nice, I understood you clearly.",
    "Good job putting that together.",
    "I like how you explained that.",
  ];

  return `${correctionNote}${pick(praises)} ${pick(FOLLOW_UPS)}`.trim();
}
