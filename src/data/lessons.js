// Контент уроков для уровня A1–A2.
// Каждый урок — набор упражнений трёх типов: choose (выбор), fill (заполнить пропуск), translate (перевод).

export const lessonsA1A2 = [
  {
    id: 1,
    title: "Приветствия и знакомство",
    exercises: [
      {
        type: "choose",
        question: "Выберите перевод слова «Здравствуйте»:",
        options: ["Hello", "Goodbye", "Thank you", "Please"],
        answer: "Hello",
      },
      {
        type: "choose",
        question: "Как по-английски «Меня зовут...»?",
        options: ["My name is...", "I am from...", "How are you?", "See you"],
        answer: "My name is...",
      },
      {
        type: "fill",
        question: "Заполните пропуск: Nice to ___ you.",
        answer: "meet",
      },
      {
        type: "translate",
        question: "Переведите на английский: «Как дела?»",
        answer: "How are you?",
      },
    ],
  },
  {
    id: 2,
    title: "В магазине",
    exercises: [
      {
        type: "choose",
        question: "Как спросить цену?",
        options: ["How much is it?", "What is it?", "Where is it?", "Who is it?"],
        answer: "How much is it?",
      },
      {
        type: "fill",
        question: "Заполните пропуск: Can I ___ this, please?",
        answer: "have",
      },
      {
        type: "translate",
        question: "Переведите на английский: «У вас есть сдача?»",
        answer: "Do you have change?",
      },
    ],
  },
  {
    id: 3,
    title: "Путешествия",
    exercises: [
      {
        type: "choose",
        question: "Как спросить дорогу?",
        options: [
          "Where is the airport?",
          "What time is it?",
          "How old are you?",
          "What is your name?",
        ],
        answer: "Where is the airport?",
      },
      {
        type: "fill",
        question: "Заполните пропуск: I would like to ___ a ticket.",
        answer: "buy",
      },
      {
        type: "translate",
        question: "Переведите на английский: «Где находится отель?»",
        answer: "Where is the hotel?",
      },
    ],
  },
  {
    id: 4,
    title: "Работа и офис",
    exercises: [
      {
        type: "choose",
        question: "Как спросить «Где находится ваш офис?»",
        options: [
          "Where is your office?",
          "What is your job?",
          "When is the meeting?",
          "Who is your boss?",
        ],
        answer: "Where is your office?",
      },
      {
        type: "fill",
        question: "Заполните пропуск: I work ___ a bank.",
        answer: "at",
      },
      {
        type: "translate",
        question: "Переведите на английский: «У меня встреча в 10 утра»",
        answer: "I have a meeting at 10 am",
      },
    ],
  },
];

// Контент уроков для уровня B1–B2.
export const lessonsB1B2 = [
  {
    id: 1,
    title: "Выражение мнения",
    exercises: [
      {
        type: "choose",
        question: "Как вежливо выразить своё мнение?",
        options: [
          "In my opinion, ...",
          "You are wrong because...",
          "I don't care about...",
          "Whatever, ...",
        ],
        answer: "In my opinion, ...",
      },
      {
        type: "choose",
        question: "Как выразить частичное согласие?",
        options: [
          "I see your point, but...",
          "No way.",
          "That's stupid.",
          "I don't know anything.",
        ],
        answer: "I see your point, but...",
      },
      {
        type: "fill",
        question: "Заполните пропуск: I would ___ to disagree with that.",
        answer: "have",
      },
      {
        type: "translate",
        question: "Переведите на английский: «На мой взгляд, это отличная идея»",
        answer: "In my opinion, this is a great idea",
      },
    ],
  },
  {
    id: 2,
    title: "На собеседовании",
    exercises: [
      {
        type: "choose",
        question: "Как рассказать о своём опыте работы?",
        options: [
          "I have five years of experience in marketing.",
          "I like marketing.",
          "Marketing is boring.",
          "I never worked before.",
        ],
        answer: "I have five years of experience in marketing.",
      },
      {
        type: "fill",
        question: "Заполните пропуск: What are your strengths ___ weaknesses?",
        answer: "and",
      },
      {
        type: "fill",
        question: "Заполните пропуск: I am a fast ___ (учусь быстро).",
        answer: "learner",
      },
      {
        type: "translate",
        question: "Переведите на английский: «Почему вы хотите работать у нас?»",
        answer: "Why do you want to work for us?",
      },
    ],
  },
  {
    id: 3,
    title: "Условные предложения",
    exercises: [
      {
        type: "choose",
        question: "Выберите правильный вариант: If I ___ more time, I would travel more.",
        options: ["had", "have", "will have", "having"],
        answer: "had",
      },
      {
        type: "choose",
        question: "Выберите правильный вариант: If it rains, we ___ stay home.",
        options: ["will", "would", "had", "having"],
        answer: "will",
      },
      {
        type: "fill",
        question: "Заполните пропуск: If I were you, I ___ apologize.",
        answer: "would",
      },
      {
        type: "translate",
        question: "Переведите на английский: «Если бы у меня было больше денег, я бы купил машину»",
        answer: "If I had more money, I would buy a car",
      },
    ],
  },
  {
    id: 4,
    title: "Обсуждение новостей",
    exercises: [
      {
        type: "choose",
        question: "Как спросить чьё-то мнение о новости?",
        options: [
          "What do you think about this news?",
          "Do you like news?",
          "Is this true?",
          "News is boring.",
        ],
        answer: "What do you think about this news?",
      },
      {
        type: "fill",
        question: "Заполните пропуск: According ___ the article, prices will rise.",
        answer: "to",
      },
      {
        type: "fill",
        question: "Заполните пропуск: The economy is expected ___ grow next year.",
        answer: "to",
      },
      {
        type: "translate",
        question: "Переведите на английский: «Это довольно спорная тема»",
        answer: "This is a rather controversial topic",
      },
    ],
  },
];

// Контент уроков для уровня C1–C2.
export const lessonsC1C2 = [
  {
    id: 1,
    title: "Академическое письмо",
    exercises: [
      {
        type: "choose",
        question: "Какая фраза уместна для введения аргумента в эссе?",
        options: [
          "It could be argued that...",
          "Everybody knows that...",
          "I heard somewhere that...",
          "Obviously...",
        ],
        answer: "It could be argued that...",
      },
      {
        type: "fill",
        question: "Заполните пропуск: The findings ___ that further research is needed.",
        answer: "suggest",
      },
      {
        type: "fill",
        question: "Заполните пропуск: Despite ___ evidence, the theory remains popular.",
        answer: "conflicting",
      },
      {
        type: "translate",
        question: "Переведите на английский: «Данные свидетельствуют об обратном»",
        answer: "The data suggests otherwise",
      },
    ],
  },
  {
    id: 2,
    title: "Ведение переговоров",
    exercises: [
      {
        type: "choose",
        question: "Как предложить компромисс на переговорах?",
        options: [
          "Perhaps we could meet halfway on this.",
          "Take it or leave it.",
          "That's not my problem.",
          "No compromise is possible.",
        ],
        answer: "Perhaps we could meet halfway on this.",
      },
      {
        type: "fill",
        question: "Заполните пропуск: Let's put this issue ___ the side for now.",
        answer: "to",
      },
      {
        type: "fill",
        question: "Заполните пропуск: We need to find common ___.",
        answer: "ground",
      },
      {
        type: "translate",
        question: "Переведите на английский: «Мы готовы пойти на уступки»",
        answer: "We are willing to make concessions",
      },
    ],
  },
  {
    id: 3,
    title: "Тонкости идиом",
    exercises: [
      {
        type: "choose",
        question: "Что означает идиома «to bite the bullet»?",
        options: [
          "Смириться с чем-то неприятным",
          "Съесть что-то невкусное",
          "Испугаться",
          "Опоздать",
        ],
        answer: "Смириться с чем-то неприятным",
      },
      {
        type: "choose",
        question: "Что означает «to read between the lines»?",
        options: [
          "Понимать скрытый смысл",
          "Читать очень быстро",
          "Пропускать абзацы",
          "Читать вслух",
        ],
        answer: "Понимать скрытый смысл",
      },
      {
        type: "fill",
        question: "Заполните пропуск: It's not rocket ___ (это несложно).",
        answer: "science",
      },
      {
        type: "translate",
        question: "Переведите на английский: «Это уже перебор» (используя идиому \"the last straw\")",
        answer: "That's the last straw",
      },
    ],
  },
  {
    id: 4,
    title: "Публичные выступления",
    exercises: [
      {
        type: "choose",
        question: "Как эффектно начать презентацию?",
        options: [
          "Let me start by asking you a question.",
          "So, um, hi everyone.",
          "I didn't prepare much.",
          "This will be quick, I promise.",
        ],
        answer: "Let me start by asking you a question.",
      },
      {
        type: "fill",
        question: "Заполните пропуск: To sum ___, our strategy has three pillars.",
        answer: "up",
      },
      {
        type: "fill",
        question: "Заполните пропуск: I'd like to leave some time ___ questions at the end.",
        answer: "for",
      },
      {
        type: "translate",
        question: "Переведите на английский: «Позвольте перейти к следующему пункту»",
        answer: "Let me move on to the next point",
      },
    ],
  },
];

const LEVELS = {
  "a1-a2": lessonsA1A2,
  "b1-b2": lessonsB1B2,
  "c1-c2": lessonsC1C2,
};

export function getLesson(level, id) {
  const source = LEVELS[level] || lessonsA1A2;
  return source.find((l) => l.id === Number(id));
}

export function getLessons(level) {
  return LEVELS[level] || lessonsA1A2;
}
