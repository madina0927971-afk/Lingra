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

export function getLesson(level, id) {
  const source = level === "a1-a2" ? lessonsA1A2 : lessonsA1A2; // пока только один уровень заполнен
  return source.find((l) => l.id === Number(id));
}

export function getLessons(level) {
  return level === "a1-a2" ? lessonsA1A2 : lessonsA1A2;
}
