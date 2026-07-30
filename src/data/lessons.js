// Контент уроков для всех уровней.
// title и question хранятся как { ru, uz } — компоненты вызывают localize(value, lang).
// options/answer обычно остаются на английском (это язык, который изучают),
// кроме двух упражнений об идиомах ниже, где сами варианты ответа — пояснения на ru/uz.

// Универсальный помощник: если значение — объект {ru, uz}, вернуть нужный язык (с фолбэком на ru).
// Если значение — обычная строка или массив строк (английский), вернуть как есть.
export function localize(value, lang) {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value[lang] || value.ru;
  }
  return value;
}

export const lessonsA1A2 = [
  {
    id: 1,
    title: { ru: "Приветствия и знакомство", uz: "Salomlashish va tanishuv" },
    exercises: [
      {
        type: "choose",
        question: {
          ru: "Выберите перевод слова «Здравствуйте»:",
          uz: "«Salom» so'zining tarjimasini tanlang:",
        },
        options: ["Hello", "Goodbye", "Thank you", "Please"],
        answer: "Hello",
      },
      {
        type: "choose",
        question: {
          ru: "Как по-английски «Меня зовут...»?",
          uz: "«Mening ismim...» inglizchada qanday bo'ladi?",
        },
        options: ["My name is...", "I am from...", "How are you?", "See you"],
        answer: "My name is...",
      },
      {
        type: "fill",
        question: { ru: "Заполните пропуск: Nice to ___ you.", uz: "Bo'shliqni to'ldiring: Nice to ___ you." },
        answer: "meet",
      },
      {
        type: "translate",
        question: {
          ru: "Переведите на английский: «Как дела?»",
          uz: "Ingliz tiliga tarjima qiling: «Qalaysiz?»",
        },
        answer: "How are you?",
      },
    ],
  },
  {
    id: 2,
    title: { ru: "В магазине", uz: "Do'konda" },
    exercises: [
      {
        type: "choose",
        question: { ru: "Как спросить цену?", uz: "Narxni qanday so'raymiz?" },
        options: ["How much is it?", "What is it?", "Where is it?", "Who is it?"],
        answer: "How much is it?",
      },
      {
        type: "fill",
        question: { ru: "Заполните пропуск: Can I ___ this, please?", uz: "Bo'shliqni to'ldiring: Can I ___ this, please?" },
        answer: "have",
      },
      {
        type: "translate",
        question: {
          ru: "Переведите на английский: «У вас есть сдача?»",
          uz: "Ingliz tiliga tarjima qiling: «Qaytim bormi?»",
        },
        answer: "Do you have change?",
      },
    ],
  },
  {
    id: 3,
    title: { ru: "Путешествия", uz: "Sayohat" },
    exercises: [
      {
        type: "choose",
        question: { ru: "Как спросить дорогу?", uz: "Yo'lni qanday so'raymiz?" },
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
        question: { ru: "Заполните пропуск: I would like to ___ a ticket.", uz: "Bo'shliqni to'ldiring: I would like to ___ a ticket." },
        answer: "buy",
      },
      {
        type: "translate",
        question: {
          ru: "Переведите на английский: «Где находится отель?»",
          uz: "Ingliz tiliga tarjima qiling: «Mehmonxona qayerda joylashgan?»",
        },
        answer: "Where is the hotel?",
      },
    ],
  },
  {
    id: 4,
    title: { ru: "Работа и офис", uz: "Ish va ofis" },
    exercises: [
      {
        type: "choose",
        question: {
          ru: "Как спросить «Где находится ваш офис?»",
          uz: "«Ofisingiz qayerda joylashgan?» deb qanday so'raymiz?",
        },
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
        question: { ru: "Заполните пропуск: I work ___ a bank.", uz: "Bo'shliqni to'ldiring: I work ___ a bank." },
        answer: "at",
      },
      {
        type: "translate",
        question: {
          ru: "Переведите на английский: «У меня встреча в 10 утра»",
          uz: "Ingliz tiliga tarjima qiling: «Mening soat 10:00 da uchrashuvim bor»",
        },
        answer: "I have a meeting at 10 am",
      },
    ],
  },
];

export const lessonsB1B2 = [
  {
    id: 1,
    title: { ru: "Выражение мнения", uz: "Fikr bildirish" },
    exercises: [
      {
        type: "choose",
        question: {
          ru: "Как вежливо выразить своё мнение?",
          uz: "Fikringizni qanday odobli tarzda bildirasiz?",
        },
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
        question: {
          ru: "Как выразить частичное согласие?",
          uz: "Qisman rozilikni qanday bildirish mumkin?",
        },
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
        question: { ru: "Заполните пропуск: I would ___ to disagree with that.", uz: "Bo'shliqni to'ldiring: I would ___ to disagree with that." },
        answer: "have",
      },
      {
        type: "translate",
        question: {
          ru: "Переведите на английский: «На мой взгляд, это отличная идея»",
          uz: "Ingliz tiliga tarjima qiling: «Menimcha, bu ajoyib g'oya»",
        },
        answer: "In my opinion, this is a great idea",
      },
    ],
  },
  {
    id: 2,
    title: { ru: "На собеседовании", uz: "Suhbatda (intervyu)" },
    exercises: [
      {
        type: "choose",
        question: {
          ru: "Как рассказать о своём опыте работы?",
          uz: "Ish tajribangiz haqida qanday gapirasiz?",
        },
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
        question: { ru: "Заполните пропуск: What are your strengths ___ weaknesses?", uz: "Bo'shliqni to'ldiring: What are your strengths ___ weaknesses?" },
        answer: "and",
      },
      {
        type: "fill",
        question: {
          ru: "Заполните пропуск: I am a fast ___ (учусь быстро).",
          uz: "Bo'shliqni to'ldiring: I am a fast ___ (tez o'rganaman).",
        },
        answer: "learner",
      },
      {
        type: "translate",
        question: {
          ru: "Переведите на английский: «Почему вы хотите работать у нас?»",
          uz: "Ingliz tiliga tarjima qiling: «Nima uchun bizda ishlamoqchisiz?»",
        },
        answer: "Why do you want to work for us?",
      },
    ],
  },
  {
    id: 3,
    title: { ru: "Условные предложения", uz: "Shart gaplar" },
    exercises: [
      {
        type: "choose",
        question: {
          ru: "Выберите правильный вариант: If I ___ more time, I would travel more.",
          uz: "To'g'ri variantni tanlang: If I ___ more time, I would travel more.",
        },
        options: ["had", "have", "will have", "having"],
        answer: "had",
      },
      {
        type: "choose",
        question: {
          ru: "Выберите правильный вариант: If it rains, we ___ stay home.",
          uz: "To'g'ri variantni tanlang: If it rains, we ___ stay home.",
        },
        options: ["will", "would", "had", "having"],
        answer: "will",
      },
      {
        type: "fill",
        question: { ru: "Заполните пропуск: If I were you, I ___ apologize.", uz: "Bo'shliqni to'ldiring: If I were you, I ___ apologize." },
        answer: "would",
      },
      {
        type: "translate",
        question: {
          ru: "Переведите на английский: «Если бы у меня было больше денег, я бы купил машину»",
          uz: "Ingliz tiliga tarjima qiling: «Agar mening ko'proq pulim bo'lsa, mashina sotib olardim»",
        },
        answer: "If I had more money, I would buy a car",
      },
    ],
  },
  {
    id: 4,
    title: { ru: "Обсуждение новостей", uz: "Yangiliklarni muhokama qilish" },
    exercises: [
      {
        type: "choose",
        question: {
          ru: "Как спросить чьё-то мнение о новости?",
          uz: "Kimningdir yangilik haqidagi fikrini qanday so'raysiz?",
        },
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
        question: { ru: "Заполните пропуск: According ___ the article, prices will rise.", uz: "Bo'shliqni to'ldiring: According ___ the article, prices will rise." },
        answer: "to",
      },
      {
        type: "fill",
        question: { ru: "Заполните пропуск: The economy is expected ___ grow next year.", uz: "Bo'shliqni to'ldiring: The economy is expected ___ grow next year." },
        answer: "to",
      },
      {
        type: "translate",
        question: {
          ru: "Переведите на английский: «Это довольно спорная тема»",
          uz: "Ingliz tiliga tarjima qiling: «Bu ancha bahsli mavzu»",
        },
        answer: "This is a rather controversial topic",
      },
    ],
  },
];

export const lessonsC1C2 = [
  {
    id: 1,
    title: { ru: "Академическое письмо", uz: "Akademik yozuv" },
    exercises: [
      {
        type: "choose",
        question: {
          ru: "Какая фраза уместна для введения аргумента в эссе?",
          uz: "Insholarda argument kiritish uchun qaysi ibora mos keladi?",
        },
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
        question: { ru: "Заполните пропуск: The findings ___ that further research is needed.", uz: "Bo'shliqni to'ldiring: The findings ___ that further research is needed." },
        answer: "suggest",
      },
      {
        type: "fill",
        question: { ru: "Заполните пропуск: Despite ___ evidence, the theory remains popular.", uz: "Bo'shliqni to'ldiring: Despite ___ evidence, the theory remains popular." },
        answer: "conflicting",
      },
      {
        type: "translate",
        question: {
          ru: "Переведите на английский: «Данные свидетельствуют об обратном»",
          uz: "Ingliz tiliga tarjima qiling: «Ma'lumotlar aksini ko'rsatmoqda»",
        },
        answer: "The data suggests otherwise",
      },
    ],
  },
  {
    id: 2,
    title: { ru: "Ведение переговоров", uz: "Muzokaralar olib borish" },
    exercises: [
      {
        type: "choose",
        question: {
          ru: "Как предложить компромисс на переговорах?",
          uz: "Muzokaralarda murosani qanday taklif qilasiz?",
        },
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
        question: { ru: "Заполните пропуск: Let's put this issue ___ the side for now.", uz: "Bo'shliqni to'ldiring: Let's put this issue ___ the side for now." },
        answer: "to",
      },
      {
        type: "fill",
        question: { ru: "Заполните пропуск: We need to find common ___.", uz: "Bo'shliqni to'ldiring: We need to find common ___." },
        answer: "ground",
      },
      {
        type: "translate",
        question: {
          ru: "Переведите на английский: «Мы готовы пойти на уступки»",
          uz: "Ingliz tiliga tarjima qiling: «Biz yon berishga tayyormiz»",
        },
        answer: "We are willing to make concessions",
      },
    ],
  },
  {
    id: 3,
    title: { ru: "Тонкости идиом", uz: "Idiomalarning nozik jihatlari" },
    exercises: [
      {
        type: "choose",
        question: {
          ru: "Что означает идиома «to bite the bullet»?",
          uz: "«To bite the bullet» iborasi nimani anglatadi?",
        },
        options: {
          ru: ["Смириться с чем-то неприятным", "Съесть что-то невкусное", "Испугаться", "Опоздать"],
          uz: ["Yoqimsiz narsaga chidash", "Mazasiz narsani yeyish", "Qo'rqib ketish", "Kechikish"],
        },
        answer: { ru: "Смириться с чем-то неприятным", uz: "Yoqimsiz narsaga chidash" },
      },
      {
        type: "choose",
        question: {
          ru: "Что означает «to read between the lines»?",
          uz: "«To read between the lines» nimani anglatadi?",
        },
        options: {
          ru: ["Понимать скрытый смысл", "Читать очень быстро", "Пропускать абзацы", "Читать вслух"],
          uz: ["Yashirin ma'noni tushunish", "Juda tez o'qish", "Abzatslarni o'tkazib yuborish", "Ovoz chiqarib o'qish"],
        },
        answer: { ru: "Понимать скрытый смысл", uz: "Yashirin ma'noni tushunish" },
      },
      {
        type: "fill",
        question: {
          ru: "Заполните пропуск: It's not rocket ___ (это несложно).",
          uz: "Bo'shliqni to'ldiring: It's not rocket ___ (bu unchalik qiyin emas).",
        },
        answer: "science",
      },
      {
        type: "translate",
        question: {
          ru: "Переведите на английский: «Это уже перебор» (используя идиому \"the last straw\")",
          uz: "Ingliz tiliga tarjima qiling: «Bu chegaradan chiqib ketdi» (\"the last straw\" iborasidan foydalanib)",
        },
        answer: "That's the last straw",
      },
    ],
  },
  {
    id: 4,
    title: { ru: "Публичные выступления", uz: "Ommaviy nutq so'zlash" },
    exercises: [
      {
        type: "choose",
        question: {
          ru: "Как эффектно начать презентацию?",
          uz: "Taqdimotni qanday ta'sirli boshlash mumkin?",
        },
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
        question: { ru: "Заполните пропуск: To sum ___, our strategy has three pillars.", uz: "Bo'shliqni to'ldiring: To sum ___, our strategy has three pillars." },
        answer: "up",
      },
      {
        type: "fill",
        question: { ru: "Заполните пропуск: I'd like to leave some time ___ questions at the end.", uz: "Bo'shliqni to'ldiring: I'd like to leave some time ___ questions at the end." },
        answer: "for",
      },
      {
        type: "translate",
        question: {
          ru: "Переведите на английский: «Позвольте перейти к следующему пункту»",
          uz: "Ingliz tiliga tarjima qiling: «Keyingi bandga o'tishga ruxsat bering»",
        },
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
