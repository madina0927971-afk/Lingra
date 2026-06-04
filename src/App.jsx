import { useState, useEffect, useRef, useCallback } from "react";

// ─── API ──────────────────────────────────────────────────────────────────────
const API_URL = "http://localhost:3001"; // замени на Railway URL в проде

const api = {
  async request(method, path, body, token) {
    try {
      const res = await fetch(`${API_URL}${path}`, {
        method,
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: body ? JSON.stringify(body) : undefined,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Request failed");
      return data;
    } catch (e) {
      throw e;
    }
  },
  register: (body) => api.request("POST", "/auth/register", body),
  login:    (body) => api.request("POST", "/auth/login", body),
  me:       (token) => api.request("GET", "/auth/me", null, token),
  saveProgress: (body, token) => api.request("POST", "/progress/save", body, token),
  createCheckout: (body, token) => api.request("POST", "/payments/create-checkout", body, token),
  getSubscription: (token) => api.request("GET", "/payments/subscription", null, token),
  createPortal: (token) => api.request("POST", "/payments/create-portal", {}, token),
};


// ─── SPEECH SYNTHESIS ────────────────────────────────────────────────────────
const LANG_CODES = {
  en: "en-US", de: "de-DE", ar: "ar-SA", fa: "fa-IR",
  zh: "zh-CN", ru: "ru-RU", uz: "uz-UZ", ja: "ja-JP",
  ko: "ko-KR", es: "es-ES", tr: "tr-TR",
};

const speak = (text, langCode) => {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utt = new SpeechSynthesisUtterance(text);
  utt.lang = LANG_CODES[langCode] || "en-US";
  utt.rate = 0.85;
  utt.pitch = 1;
  window.speechSynthesis.speak(utt);
};

const SpeakBtn = ({ text, lang, size = 18 }) => (
  <button
    onClick={(e) => { e.stopPropagation(); speak(text, lang); }}
    style={{
      background: "rgba(99,102,241,.2)", border: "1px solid rgba(99,102,241,.4)",
      borderRadius: 10, width: size + 14, height: size + 14,
      display: "inline-flex", alignItems: "center", justifyContent: "center",
      cursor: "pointer", fontSize: size, flexShrink: 0, transition: "all .15s",
    }}
    onMouseEnter={e => e.currentTarget.style.background = "rgba(99,102,241,.4)"}
    onMouseLeave={e => e.currentTarget.style.background = "rgba(99,102,241,.2)"}
    title="Прослушать"
  >🔊</button>
);

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const PRICE_PER_LANG = 10; // $10/month for English
const MAX_LIVES = 3;
const XP_PER_EXERCISE = 10;
const XP_PER_LESSON = 50;

const NATIVE_LANGS = [
  { code: "ru", name: "Русский", flag: "🇷🇺" },
  { code: "uz", name: "O'zbek", flag: "🇺🇿" },
];

const LANGUAGES = [
  { code: "en", name: "English", flag: "🇬🇧", color: "#3B82F6" },
];

const LEVELS = ["beginner", "intermediate", "advanced"];

// ─── UI STRINGS ───────────────────────────────────────────────────────────────
const UI = {
  ru: {
    selectNative:"Выбери родной язык", chooseToLearn:"ЯЗЫКИ ДЛЯ ИЗУЧЕНИЯ",
    days:"дней", xp:"XP", langs:"языков", pricingBtn:"💎 Тарифы и цены",
    lessons:"УРОКИ", words:"слов", questions:"заданий",
    aiTitle:"AI Наставник", aiOnline:"● онлайн", aiPlaceholder:"Напишите...",
    pricing:"Тарифы", langPrice:"$10/мес за язык",
    free4th:"3 языка → 4-й БЕСПЛАТНО (-$10)",
    free6th:"5 языков → 6-й БЕСПЛАТНО + скидка $5/мес",
    selectedLangs:"Выбрано", total:"Итого", discount:"Скидка",
    free:"бесплатно", subscribe:"Подписаться",
    level:"УРОВЕНЬ", beginner:"Начинающий", intermediate:"Средний", advanced:"Продвинутый",
    levelDesc1:"Алфавит, базовые слова", levelDesc2:"Диалоги, грамматика",
    levelDesc3:"Беглость, деловой язык", selectLevel:"Выбери уровень",
    month:"/мес", next:"Далее →", back:"← Назад", check:"Проверить",
    correct:"Верно! 🎉", wrong:"Неверно", lives:"Жизни",
    lessonDone:"Урок пройден!", result:"Результат", continueBtn:"Продолжить",
    exerciseTypes:{ translate:"Переведи фразу", arrange:"Составь фразу", fill:"Заполни пропуск", choose:"Выбери перевод", listen:"Прослушай и напиши" },
    tapWords:"Нажми на слова по порядку", typeAnswer:"Введи ответ...",
    livesOut:"Жизни закончились!", tryAgain:"Попробовать снова",
    streak:"Серия", perfect:"Идеально! ⭐",
    hintBtn:"Подсказка", hintUsed:"Подсказка использована",
  },
  en: {
    selectNative:"Choose your native language", chooseToLearn:"LANGUAGES TO LEARN",
    days:"days", xp:"XP", langs:"langs", pricingBtn:"💎 Pricing",
    lessons:"LESSONS", words:"words", questions:"exercises",
    aiTitle:"AI Tutor", aiOnline:"● online", aiPlaceholder:"Type here...",
    pricing:"Pricing", langPrice:"$10/mo per language",
    free4th:"3 languages → 4th FREE (-$10)",
    free6th:"5 languages → 6th FREE + $5 off/mo",
    selectedLangs:"Selected", total:"Total", discount:"Discount",
    free:"free", subscribe:"Subscribe",
    level:"LEVEL", beginner:"Beginner", intermediate:"Intermediate", advanced:"Advanced",
    levelDesc1:"Alphabet, basic words", levelDesc2:"Dialogues, grammar",
    levelDesc3:"Fluency, business language", selectLevel:"Choose level",
    month:"/mo", next:"Next →", back:"← Back", check:"Check",
    correct:"Correct! 🎉", wrong:"Wrong", lives:"Lives",
    lessonDone:"Lesson Complete!", result:"Score", continueBtn:"Continue",
    exerciseTypes:{ translate:"Translate the phrase", arrange:"Arrange the words", fill:"Fill in the blank", choose:"Choose translation", listen:"Listen and type" },
    tapWords:"Tap the words in order", typeAnswer:"Type your answer...",
    livesOut:"No lives left!", tryAgain:"Try again",
    streak:"Streak", perfect:"Perfect! ⭐",
    hintBtn:"Hint", hintUsed:"Hint used",
  },
  uz: {
    selectNative:"Ona tilingizni tanlang", chooseToLearn:"O'RGANISH UCHUN TILLAR",
    days:"kun", xp:"XP", langs:"til", pricingBtn:"💎 Narxlar",
    lessons:"DARSLAR", words:"so'z", questions:"topshiriq",
    aiTitle:"AI Murabbiy", aiOnline:"● online", aiPlaceholder:"Yozing...",
    pricing:"Narxlar", langPrice:"$10/oy har bir til",
    free4th:"3 til → 4-chi BEPUL (-$10)",
    free6th:"5 til → 6-chi BEPUL + $5 chegirma/oy",
    selectedLangs:"Tanlangan", total:"Jami", discount:"Chegirma",
    free:"bepul", subscribe:"Obuna bo'lish",
    level:"DARAJA", beginner:"Boshlang'ich", intermediate:"O'rta", advanced:"Yuqori",
    levelDesc1:"Alifbo, asosiy so'zlar", levelDesc2:"Dialoglar, grammatika",
    levelDesc3:"Ravonlik, biznes tili", selectLevel:"Darajani tanlang",
    month:"/oy", next:"Keyingi →", back:"← Orqaga", check:"Tekshirish",
    correct:"To'g'ri! 🎉", wrong:"Noto'g'ri", lives:"Jonlar",
    lessonDone:"Dars tugadi!", result:"Natija", continueBtn:"Davom etish",
    exerciseTypes:{ translate:"Iborani tarjima qiling", arrange:"So'zlarni tering", fill:"Bo'shliқni to'ldiring", choose:"Tarjimani tanlang", listen:"Eshiting va yozing" },
    tapWords:"So'zlarga tartibda bosing", typeAnswer:"Javobingizni yozing...",
    livesOut:"Jonlar tugadi!", tryAgain:"Qayta urinib ko'ring",
    streak:"Seriya", perfect:"Mukammal! ⭐",
    hintBtn:"Maslahat", hintUsed:"Maslahat ishlatildi",
  },
  tr: {
    selectNative:"Ana dilinizi seçin", chooseToLearn:"ÖĞRENİLECEK DİLLER",
    days:"gün", xp:"XP", langs:"dil", pricingBtn:"💎 Fiyatlar",
    lessons:"DERSLER", words:"kelime", questions:"alıştırma",
    aiTitle:"AI Öğretmen", aiOnline:"● çevrimiçi", aiPlaceholder:"Yazın...",
    pricing:"Fiyatlar", langPrice:"Dil başına $10/ay",
    free4th:"3 dil → 4. BEDAVA (-$10)",
    free6th:"5 dil → 6. BEDAVA + $5 indirim/ay",
    selectedLangs:"Seçilen", total:"Toplam", discount:"İndirim",
    free:"bedava", subscribe:"Abone Ol",
    level:"SEVİYE", beginner:"Başlangıç", intermediate:"Orta", advanced:"İleri",
    levelDesc1:"Alfabe, temel kelimeler", levelDesc2:"Diyaloglar, gramer",
    levelDesc3:"Akıcılık, iş dili", selectLevel:"Seviye seç",
    month:"/ay", next:"İleri →", back:"← Geri", check:"Kontrol Et",
    correct:"Doğru! 🎉", wrong:"Yanlış", lives:"Canlar",
    lessonDone:"Ders Bitti!", result:"Sonuç", continueBtn:"Devam",
    exerciseTypes:{ translate:"Cümleyi çevirin", arrange:"Kelimeleri sıralayın", fill:"Boşluğu doldurun", choose:"Çeviriyi seçin", listen:"Dinle ve yaz" },
    tapWords:"Kelimelere sırayla dokunun", typeAnswer:"Cevabınızı yazın...",
    livesOut:"Canlar bitti!", tryAgain:"Tekrar dene",
    streak:"Seri", perfect:"Mükemmel! ⭐",
    hintBtn:"İpucu", hintUsed:"İpucu kullanıldı",
  },
  ar: {
    selectNative:"اختر لغتك الأم", chooseToLearn:"اللغات للتعلم",
    days:"أيام", xp:"XP", langs:"لغات", pricingBtn:"💎 الأسعار",
    lessons:"الدروس", words:"كلمات", questions:"تمرين",
    aiTitle:"مدرب AI", aiOnline:"● متصل", aiPlaceholder:"اكتب...",
    pricing:"الأسعار", langPrice:"$10/شهر لكل لغة",
    free4th:"3 لغات ← اللغة الرابعة مجانية (-$10)",
    free6th:"5 لغات ← السادسة مجانية + $5/شهر",
    selectedLangs:"المختارة", total:"المجموع", discount:"خصم",
    free:"مجاني", subscribe:"اشترك",
    level:"المستوى", beginner:"مبتدئ", intermediate:"متوسط", advanced:"متقدم",
    levelDesc1:"الأبجدية، كلمات أساسية", levelDesc2:"حوارات، قواعد",
    levelDesc3:"طلاقة، لغة الأعمال", selectLevel:"اختر المستوى",
    month:"/شهر", next:"التالي →", back:"→ رجوع", check:"تحقق",
    correct:"صحيح! 🎉", wrong:"خطأ", lives:"الأرواح",
    lessonDone:"اكتمل الدرس!", result:"النتيجة", continueBtn:"استمر",
    exerciseTypes:{ translate:"ترجم الجملة", arrange:"رتب الكلمات", fill:"املأ الفراغ", choose:"اختر الترجمة", listen:"استمع واكتب" },
    tapWords:"انقر على الكلمات بالترتيب", typeAnswer:"اكتب إجابتك...",
    livesOut:"نفدت الأرواح!", tryAgain:"حاول مرة أخرى",
    streak:"سلسلة", perfect:"مثالي! ⭐",
    hintBtn:"تلميح", hintUsed:"تم استخدام التلميح",
  },
  fa: {
    selectNative:"زبان مادری خود را انتخاب کنید", chooseToLearn:"زبان‌های یادگیری",
    days:"روز", xp:"XP", langs:"زبان", pricingBtn:"💎 قیمت‌ها",
    lessons:"درس‌ها", words:"کلمه", questions:"تمرین",
    aiTitle:"مربی AI", aiOnline:"● آنلاین", aiPlaceholder:"بنویسید...",
    pricing:"قیمت‌ها", langPrice:"$10/ماه برای هر زبان",
    free4th:"3 زبان ← چهارم رایگان (-$10)",
    free6th:"5 زبان ← ششم رایگان + $5/ماه",
    selectedLangs:"انتخاب شده", total:"جمع", discount:"تخفیف",
    free:"رایگان", subscribe:"اشتراک",
    level:"سطح", beginner:"مبتدی", intermediate:"متوسط", advanced:"پیشرفته",
    levelDesc1:"الفبا، کلمات پایه", levelDesc2:"گفتگو، دستور زبان",
    levelDesc3:"روانی، زبان تجاری", selectLevel:"سطح را انتخاب کنید",
    month:"/ماه", next:"بعدی →", back:"← برگشت", check:"بررسی",
    correct:"درست! 🎉", wrong:"اشتباه", lives:"جان‌ها",
    lessonDone:"درس تمام شد!", result:"نتیجه", continueBtn:"ادامه",
    exerciseTypes:{ translate:"جمله را ترجمه کنید", arrange:"کلمات را مرتب کنید", fill:"جای خالی را پر کنید", choose:"ترجمه را انتخاب کنید", listen:"بشنوید و بنویسید" },
    tapWords:"روی کلمات به ترتیب بزنید", typeAnswer:"جواب را بنویسید...",
    livesOut:"جان‌ها تمام شد!", tryAgain:"دوباره امتحان کنید",
    streak:"سری", perfect:"عالی! ⭐",
    hintBtn:"راهنما", hintUsed:"راهنما استفاده شد",
  },
  zh: {
    selectNative:"选择您的母语", chooseToLearn:"学习语言",
    days:"天", xp:"XP", langs:"语言", pricingBtn:"💎 价格",
    lessons:"课程", words:"单词", questions:"练习",
    aiTitle:"AI导师", aiOnline:"● 在线", aiPlaceholder:"输入...",
    pricing:"价格", langPrice:"每种语言$10/月",
    free4th:"3语言→第4个免费(-$10)",
    free6th:"5语言→第6个免费+$5/月",
    selectedLangs:"已选", total:"合计", discount:"优惠",
    free:"免费", subscribe:"订阅",
    level:"级别", beginner:"初级", intermediate:"中级", advanced:"高级",
    levelDesc1:"字母、基础词汇", levelDesc2:"对话、语法",
    levelDesc3:"流利、商务语言", selectLevel:"选择级别",
    month:"/月", next:"下一步 →", back:"← 返回", check:"检查",
    correct:"正确！🎉", wrong:"错误", lives:"生命",
    lessonDone:"课程完成！", result:"结果", continueBtn:"继续",
    exerciseTypes:{ translate:"翻译这个句子", arrange:"排列单词", fill:"填空", choose:"选择翻译", listen:"听写" },
    tapWords:"按顺序点击单词", typeAnswer:"输入答案...",
    livesOut:"生命用完了！", tryAgain:"再试一次",
    streak:"连续", perfect:"完美！⭐",
    hintBtn:"提示", hintUsed:"已用提示",
  },
  es: {
    selectNative:"Elige tu idioma nativo", chooseToLearn:"IDIOMAS PARA APRENDER",
    days:"días", xp:"XP", langs:"idiomas", pricingBtn:"💎 Precios",
    lessons:"LECCIONES", words:"palabras", questions:"ejercicios",
    aiTitle:"Tutor AI", aiOnline:"● en línea", aiPlaceholder:"Escribe...",
    pricing:"Precios", langPrice:"$10/mes por idioma",
    free4th:"3 idiomas → 4º GRATIS (-$10)",
    free6th:"5 idiomas → 6º GRATIS + $5 dto./mes",
    selectedLangs:"Seleccionados", total:"Total", discount:"Descuento",
    free:"gratis", subscribe:"Suscribirse",
    level:"NIVEL", beginner:"Principiante", intermediate:"Intermedio", advanced:"Avanzado",
    levelDesc1:"Alfabeto, palabras básicas", levelDesc2:"Diálogos, gramática",
    levelDesc3:"Fluidez, lenguaje de negocios", selectLevel:"Elige nivel",
    month:"/mes", next:"Siguiente →", back:"← Atrás", check:"Comprobar",
    correct:"¡Correcto! 🎉", wrong:"Incorrecto", lives:"Vidas",
    lessonDone:"¡Lección completada!", result:"Resultado", continueBtn:"Continuar",
    exerciseTypes:{ translate:"Traduce la frase", arrange:"Ordena las palabras", fill:"Rellena el hueco", choose:"Elige la traducción", listen:"Escucha y escribe" },
    tapWords:"Toca las palabras en orden", typeAnswer:"Escribe tu respuesta...",
    livesOut:"¡Sin vidas!", tryAgain:"Intentar de nuevo",
    streak:"Racha", perfect:"¡Perfecto! ⭐",
    hintBtn:"Pista", hintUsed:"Pista usada",
  },
  de: {
    selectNative:"Wähle deine Muttersprache", chooseToLearn:"SPRACHEN LERNEN",
    days:"Tage", xp:"XP", langs:"Sprachen", pricingBtn:"💎 Preise",
    lessons:"LEKTIONEN", words:"Wörter", questions:"Aufgaben",
    aiTitle:"AI Tutor", aiOnline:"● online", aiPlaceholder:"Schreiben...",
    pricing:"Preise", langPrice:"$10/Monat pro Sprache",
    free4th:"3 Sprachen → 4. GRATIS (-$10)",
    free6th:"5 Sprachen → 6. GRATIS + $5 Rabatt/Monat",
    selectedLangs:"Ausgewählt", total:"Gesamt", discount:"Rabatt",
    free:"gratis", subscribe:"Abonnieren",
    level:"NIVEAU", beginner:"Anfänger", intermediate:"Mittelstufe", advanced:"Fortgeschritten",
    levelDesc1:"Alphabet, Grundwörter", levelDesc2:"Dialoge, Grammatik",
    levelDesc3:"Fließend, Geschäftssprache", selectLevel:"Niveau wählen",
    month:"/Monat", next:"Weiter →", back:"← Zurück", check:"Prüfen",
    correct:"Richtig! 🎉", wrong:"Falsch", lives:"Leben",
    lessonDone:"Lektion abgeschlossen!", result:"Ergebnis", continueBtn:"Weiter",
    exerciseTypes:{ translate:"Übersetze den Satz", arrange:"Ordne die Wörter", fill:"Fülle die Lücke aus", choose:"Wähle die Übersetzung", listen:"Hör zu und schreibe" },
    tapWords:"Tippe die Wörter der Reihe nach", typeAnswer:"Deine Antwort...",
    livesOut:"Keine Leben mehr!", tryAgain:"Nochmal versuchen",
    streak:"Serie", perfect:"Perfekt! ⭐",
    hintBtn:"Hinweis", hintUsed:"Hinweis verwendet",
  },
};

// ─── LESSON DATA ──────────────────────────────────────────────────────────────
// Each lesson contains exercises. Exercise types:
// translate: given source phrase, type translation
// arrange: tap words in correct order to form translation
// fill: fill the blank in a sentence
// choose: multiple choice translation
const LESSON_DATA = {
  "en-beginner": [
    {
      id:1, emoji:"👋", titles:{ ru:"Приветствия", en:"Greetings", uz:"Salomlashish", tr:"Selamlaşma", ar:"التحيات", fa:"احوال‌پرسی", zh:"问候", es:"Saludos", de:"Begrüßungen" },
      exercises: [
        { type:"choose", targetWord:"Hello", translations:{ ru:"Привет", en:"Hi", uz:"Salom", tr:"Merhaba", ar:"مرحبا", fa:"سلام", zh:"你好", es:"Hola", de:"Hallo" }, distractors:{ ru:["Пока","Спасибо","Извините"], en:["Bye","Thanks","Sorry"], uz:["Xayr","Rahmat","Kechirasiz"], tr:["Güle güle","Teşekkürler","Pardon"], ar:["وداعا","شكرا","معذرة"], fa:["خداحافظ","ممنون","ببخشید"], zh:["再见","谢谢","对不起"], es:["Adiós","Gracias","Perdón"], de:["Tschüss","Danke","Entschuldigung"] } },
        { type:"arrange", sentence:{ ru:"Привет как дела", en:"Hello how are you", uz:"Salom qanday siz", tr:"Merhaba nasılsın", ar:"مرحبا كيف حالك", fa:"سلام حالت چطور", zh:"你好 你 好吗", es:"Hola cómo estás", de:"Hallo wie geht es dir" }, answer:"Hello how are you", words:["Hello","how","are","you","where","going"] },
        { type:"translate", source:{ ru:"Спасибо большое!", en:"Thank you very much!", uz:"Katta rahmat!", tr:"Çok teşekkürler!", ar:"شكرا جزيلا!", fa:"خیلی ممنون!", zh:"非常感谢！", es:"¡Muchas gracias!", de:"Vielen Dank!" }, answer:"Thank you very much", accept:["thank you very much","thank you so much","thanks a lot"] },
        { type:"fill", sentence:"___ are you?", blank:"How", hint:{ ru:"Как дела?", en:"How are you?", uz:"Qandaysiz?", tr:"Nasılsın?", ar:"كيف حالك؟", fa:"حالت چطوره؟", zh:"你好吗？", es:"¿Cómo estás?", de:"Wie geht es dir?" }, options:["How","What","Where","Who"] },
        { type:"choose", targetWord:"Goodbye", translations:{ ru:"До свидания", en:"Farewell", uz:"Xayr", tr:"Güle güle", ar:"وداعا", fa:"خداحافظ", zh:"再见", es:"Adiós", de:"Auf Wiedersehen" }, distractors:{ ru:["Привет","Спасибо","Пожалуйста"], en:["Hello","Thanks","Please"], uz:["Salom","Rahmat","Iltimos"], tr:["Merhaba","Teşekkürler","Lütfen"], ar:["مرحبا","شكرا","من فضلك"], fa:["سلام","ممنون","لطفاً"], zh:["你好","谢谢","请"], es:["Hola","Gracias","Por favor"], de:["Hallo","Danke","Bitte"] } },
        { type:"arrange", sentence:{ ru:"Пожалуйста помоги мне", en:"Please help me", uz:"Iltimos menga yordam bering", tr:"Lütfen bana yardım et", ar:"من فضلك ساعدني", fa:"لطفاً کمکم کن", zh:"请帮助我", es:"Por favor ayúdame", de:"Bitte hilf mir" }, answer:"Please help me", words:["Please","help","me","take","give","you"] },
      ]
    },
    {
      id:2, emoji:"🔢", titles:{ ru:"Числа", en:"Numbers", uz:"Raqamlar", tr:"Sayılar", ar:"الأرقام", fa:"اعداد", zh:"数字", es:"Números", de:"Zahlen" },
      exercises: [
        { type:"choose", targetWord:"One", translations:{ ru:"Один", en:"1", uz:"Bir", tr:"Bir", ar:"واحد", fa:"یک", zh:"一", es:"Uno", de:"Eins" }, distractors:{ ru:["Два","Три","Четыре"], en:["Two","Three","Four"], uz:["Ikki","Uch","To'rt"], tr:["İki","Üç","Dört"], ar:["اثنان","ثلاثة","أربعة"], fa:["دو","سه","چهار"], zh:["二","三","四"], es:["Dos","Tres","Cuatro"], de:["Zwei","Drei","Vier"] } },
        { type:"fill", sentence:"I have ___ apple.", blank:"one", hint:{ ru:"У меня есть одно яблоко.", en:"I have one apple.", uz:"Menda bitta olma bor.", tr:"Bir elmam var.", ar:"عندي تفاحة واحدة.", fa:"یک سیب دارم.", zh:"我有一个苹果。", es:"Tengo una manzana.", de:"Ich habe einen Apfel." }, options:["one","two","ten","many"] },
        { type:"choose", targetWord:"Ten", translations:{ ru:"Десять", en:"10", uz:"O'n", tr:"On", ar:"عشرة", fa:"ده", zh:"十", es:"Diez", de:"Zehn" }, distractors:{ ru:["Пять","Два","Три"], en:["Five","Two","Three"], uz:["Besh","Ikki","Uch"], tr:["Beş","İki","Üç"], ar:["خمسة","اثنان","ثلاثة"], fa:["پنج","دو","سه"], zh:["五","二","三"], es:["Cinco","Dos","Tres"], de:["Fünf","Zwei","Drei"] } },
        { type:"arrange", sentence:{ ru:"У меня пять книг", en:"I have five books", uz:"Menda beshta kitob bor", tr:"Beş kitabım var", ar:"عندي خمسة كتب", fa:"پنج کتاب دارم", zh:"我有五本书", es:"Tengo cinco libros", de:"Ich habe fünf Bücher" }, answer:"I have five books", words:["I","have","five","books","ten","read"] },
        { type:"translate", source:{ ru:"Три дня", en:"Three days", uz:"Uch kun", tr:"Üç gün", ar:"ثلاثة أيام", fa:"سه روز", zh:"三天", es:"Tres días", de:"Drei Tage" }, answer:"three days", accept:["three days"] },
      ]
    },
    {
      id:3, emoji:"🍕", titles:{ ru:"Еда", en:"Food", uz:"Ovqat", tr:"Yiyecek", ar:"الطعام", fa:"غذا", zh:"食物", es:"Comida", de:"Essen" },
      exercises: [
        { type:"choose", targetWord:"Water", translations:{ ru:"Вода", en:"H₂O", uz:"Suv", tr:"Su", ar:"ماء", fa:"آب", zh:"水", es:"Agua", de:"Wasser" }, distractors:{ ru:["Кофе","Чай","Сок"], en:["Coffee","Tea","Juice"], uz:["Qahva","Choy","Sharbat"], tr:["Kahve","Çay","Meyve suyu"], ar:["قهوة","شاي","عصير"], fa:["قهوه","چای","آبمیوه"], zh:["咖啡","茶","果汁"], es:["Café","Té","Jugo"], de:["Kaffee","Tee","Saft"] } },
        { type:"arrange", sentence:{ ru:"Я хочу кофе пожалуйста", en:"I want coffee please", uz:"Iltimos menga qahva bering", tr:"Kahve istiyorum lütfen", ar:"أريد قهوة من فضلك", fa:"قهوه میخوام لطفاً", zh:"我要咖啡请", es:"Quiero café por favor", de:"Ich möchte Kaffee bitte" }, answer:"I want coffee please", words:["I","want","coffee","please","eat","drink"] },
        { type:"fill", sentence:"This is ___!", blank:"delicious", hint:{ ru:"Это вкусно!", en:"This is delicious!", uz:"Bu mazali!", tr:"Bu lezzetli!", ar:"هذا لذيذ!", fa:"این خوشمزه است!", zh:"这很美味！", es:"¡Esto es delicioso!", de:"Das ist lecker!" }, options:["delicious","terrible","small","old"] },
        { type:"translate", source:{ ru:"Свежий хлеб", en:"Fresh bread", uz:"Yangi non", tr:"Taze ekmek", ar:"خبز طازج", fa:"نان تازه", zh:"新鲜面包", es:"Pan fresco", de:"Frisches Brot" }, answer:"fresh bread", accept:["fresh bread"] },
        { type:"choose", targetWord:"Breakfast", translations:{ ru:"Завтрак", en:"Morning meal", uz:"Nonushta", tr:"Kahvaltı", ar:"وجبة الفطور", fa:"صبحانه", zh:"早餐", es:"Desayuno", de:"Frühstück" }, distractors:{ ru:["Обед","Ужин","Перекус"], en:["Lunch","Dinner","Snack"], uz:["Tushlik","Kechki ovqat","Gazak"], tr:["Öğle yemeği","Akşam yemeği","Atıştırmalık"], ar:["غداء","عشاء","وجبة خفيفة"], fa:["ناهار","شام","میان‌وعده"], zh:["午餐","晚餐","零食"], es:["Almuerzo","Cena","Merienda"], de:["Mittagessen","Abendessen","Snack"] } },
      ]
    },
    {
      id:4, emoji:"🏠", titles:{ ru:"Дом", en:"Home", uz:"Uy", tr:"Ev", ar:"المنزل", fa:"خانه", zh:"家", es:"Hogar", de:"Zuhause" },
      exercises: [
        { type:"choose", targetWord:"House", translations:{ ru:"Дом", en:"Building", uz:"Uy", tr:"Ev", ar:"منزل", fa:"خانه", zh:"房子", es:"Casa", de:"Haus" }, distractors:{ ru:["Квартира","Комната","Офис"], en:["Apartment","Room","Office"], uz:["Kvartira","Xona","Ofis"], tr:["Daire","Oda","Ofis"], ar:["شقة","غرفة","مكتب"], fa:["آپارتمان","اتاق","دفتر"], zh:["公寓","房间","办公室"], es:["Apartamento","Habitación","Oficina"], de:["Wohnung","Zimmer","Büro"] } },
        { type:"arrange", sentence:{ ru:"Мой дом большой", en:"My house is big", uz:"Mening uyim katta", tr:"Evim büyük", ar:"بيتي كبير", fa:"خانه‌ام بزرگ است", zh:"我的房子很大", es:"Mi casa es grande", de:"Mein Haus ist groß" }, answer:"My house is big", words:["My","house","is","big","small","their"] },
        { type:"fill", sentence:"I live in a ___.", blank:"house", hint:{ ru:"Я живу в доме.", en:"I live in a house.", uz:"Men uyda yashayman.", tr:"Bir evde yaşıyorum.", ar:"أنا أعيش في منزل.", fa:"در خانه‌ای زندگی می‌کنم.", zh:"我住在一所房子里。", es:"Vivo en una casa.", de:"Ich lebe in einem Haus." }, options:["house","car","tree","boat"] },
        { type:"translate", source:{ ru:"Большая комната", en:"Big room", uz:"Katta xona", tr:"Büyük oda", ar:"غرفة كبيرة", fa:"اتاق بزرگ", zh:"大房间", es:"Habitación grande", de:"Großes Zimmer" }, answer:"big room", accept:["big room","large room"] },
      ]
    },
  ],
  "en-intermediate": [
    {
      id:1, emoji:"💼", titles:{ ru:"Работа", en:"Work", uz:"Ish", tr:"İş", ar:"العمل", fa:"کار", zh:"工作", es:"Trabajo", de:"Arbeit" },
      exercises: [
        { type:"choose", targetWord:"Meeting", translations:{ ru:"Встреча/Совещание", en:"Gathering", uz:"Yig'ilish", tr:"Toplantı", ar:"اجتماع", fa:"جلسه", zh:"会议", es:"Reunión", de:"Besprechung" }, distractors:{ ru:["Перерыв","Вечеринка","Звонок"], en:["Break","Party","Call"], uz:["Tanaffus","Ziyofat","Qo'ng'iroq"], tr:["Mola","Parti","Arama"], ar:["استراحة","حفلة","مكالمة"], fa:["استراحت","مهمانی","تماس"], zh:["休息","派对","电话"], es:["Descanso","Fiesta","Llamada"], de:["Pause","Party","Anruf"] } },
        { type:"translate", source:{ ru:"Дедлайн завтра.", en:"The deadline is tomorrow.", uz:"Muddat ertaga.", tr:"Son tarih yarın.", ar:"الموعد النهائي غدا.", fa:"مهلت فردا است.", zh:"截止日期是明天。", es:"El plazo es mañana.", de:"Die Frist ist morgen." }, answer:"the deadline is tomorrow", accept:["the deadline is tomorrow","deadline is tomorrow"] },
        { type:"arrange", sentence:{ ru:"Мой коллега очень полезен", en:"My colleague is very helpful", uz:"Mening hamkashim juda foydali", tr:"Meslektaşım çok yardımsever", ar:"زميلي مفيد جدا", fa:"همکارم خیلی مفید است", zh:"我的同事非常有帮助", es:"Mi colega es muy útil", de:"Mein Kollege ist sehr hilfreich" }, answer:"My colleague is very helpful", words:["My","colleague","is","very","helpful","lazy","meeting"] },
        { type:"fill", sentence:"What is your ___?", blank:"salary", hint:{ ru:"Какая у тебя зарплата?", en:"What is your salary?", uz:"Maoshingiz qancha?", tr:"Maaşın ne kadar?", ar:"ما هو راتبك؟", fa:"حقوقت چقدره؟", zh:"你的薪水是多少？", es:"¿Cuál es tu salario?", de:"Was ist dein Gehalt?" }, options:["salary","name","house","car"] },
        { type:"choose", targetWord:"Project", translations:{ ru:"Проект", en:"Assignment", uz:"Loyiha", tr:"Proje", ar:"مشروع", fa:"پروژه", zh:"项目", es:"Proyecto", de:"Projekt" }, distractors:{ ru:["Встреча","Отчёт","Офис"], en:["Meeting","Report","Office"], uz:["Yig'ilish","Hisobot","Ofis"], tr:["Toplantı","Rapor","Ofis"], ar:["اجتماع","تقرير","مكتب"], fa:["جلسه","گزارش","دفتر"], zh:["会议","报告","办公室"], es:["Reunión","Informe","Oficina"], de:["Besprechung","Bericht","Büro"] } },
      ]
    },
    {
      id:2, emoji:"🏙️", titles:{ ru:"Город", en:"City", uz:"Shahar", tr:"Şehir", ar:"المدينة", fa:"شهر", zh:"城市", es:"Ciudad", de:"Stadt" },
      exercises: [
        { type:"choose", targetWord:"Subway", translations:{ ru:"Метро", en:"Underground", uz:"Metro", tr:"Metro", ar:"مترو", fa:"مترو", zh:"地铁", es:"Metro", de:"U-Bahn" }, distractors:{ ru:["Автобус","Трамвай","Такси"], en:["Bus","Tram","Taxi"], uz:["Avtobus","Tramvay","Taksi"], tr:["Otobüs","Tramvay","Taksi"], ar:["حافلة","ترام","سيارة أجرة"], fa:["اتوبوس","تراموا","تاکسی"], zh:["公交","电车","出租车"], es:["Autobús","Tranvía","Taxi"], de:["Bus","Straßenbahn","Taxi"] } },
        { type:"translate", source:{ ru:"Здесь много пробок.", en:"There is heavy traffic here.", uz:"Bu yerda tiqilinch ko'p.", tr:"Burada yoğun trafik var.", ar:"يوجد ازدحام مروري هنا.", fa:"اینجا ترافیک سنگین است.", zh:"这里交通很拥挤。", es:"Hay mucho tráfico aquí.", de:"Hier ist viel Verkehr." }, answer:"there is heavy traffic here", accept:["there is heavy traffic here","there is a lot of traffic here","there's heavy traffic here"] },
        { type:"arrange", sentence:{ ru:"Аптека рядом с банком", en:"The pharmacy is near the bank", uz:"Dorixona bankga yaqin", tr:"Eczane bankanın yanında", ar:"الصيدلية قريبة من البنك", fa:"داروخانه نزدیک بانک است", zh:"药店在银行附近", es:"La farmacia está cerca del banco", de:"Die Apotheke ist nah an der Bank" }, answer:"The pharmacy is near the bank", words:["The","pharmacy","is","near","the","bank","far","store"] },
        { type:"fill", sentence:"I live in a nice ___.", blank:"neighborhood", hint:{ ru:"Я живу в хорошем районе.", en:"I live in a nice neighborhood.", uz:"Men yaxshi mahallada yashayman.", tr:"Güzel bir mahallede yaşıyorum.", ar:"أعيش في حي جميل.", fa:"در محله خوبی زندگی می‌کنم.", zh:"我住在一个好街区。", es:"Vivo en un buen barrio.", de:"Ich lebe in einem schönen Viertel." }, options:["neighborhood","country","planet","ocean"] },
      ]
    },
  ],
  "en-advanced": [
    {
      id:1, emoji:"🎯", titles:{ ru:"Бизнес-язык", en:"Business English", uz:"Biznes tili", tr:"İş İngilizcesi", ar:"لغة الأعمال", fa:"انگلیسی تجاری", zh:"商务英语", es:"Inglés de negocios", de:"Geschäftsenglisch" },
      exercises: [
        { type:"choose", targetWord:"Leverage", translations:{ ru:"Рычаг влияния / использовать", en:"Use as advantage", uz:"Foydalanish", tr:"Kaldıraç etkisi", ar:"الاستفادة من", fa:"اهرم", zh:"利用优势", es:"Aprovechar", de:"Hebel/Nutzen" }, distractors:{ ru:["Потерять","Игнорировать","Сломать"], en:["Ignore","Break","Lose"], uz:["E'tiborsiz","Buzmoq","Yo'qotmoq"], tr:["Görmezden gel","Kır","Kaybet"], ar:["تجاهل","كسر","خسر"], fa:["نادیده گرفتن","شکستن","از دست دادن"], zh:["忽略","打破","失去"], es:["Ignorar","Romper","Perder"], de:["Ignorieren","Brechen","Verlieren"] } },
        { type:"translate", source:{ ru:"Нам нужно использовать нашу сеть контактов.", en:"We need to leverage our network.", uz:"Biz tarmog'imizdan foydalanishimiz kerak.", tr:"Ağımızdan yararlanmamız gerekiyor.", ar:"نحتاج إلى الاستفادة من شبكتنا.", fa:"باید از شبکه‌مان استفاده کنیم.", zh:"我们需要利用我们的网络。", es:"Necesitamos aprovechar nuestra red.", de:"Wir müssen unser Netzwerk nutzen." }, answer:"we need to leverage our network", accept:["we need to leverage our network","we must leverage our network"] },
        { type:"arrange", sentence:{ ru:"Совместная работа команды даёт результаты", en:"Team synergy drives results", uz:"Jamoa sinergiyasi natijalar beradi", tr:"Takım sinerjisi sonuçlar doğurur", ar:"تآزر الفريق يحقق النتائج", fa:"هم‌افزایی تیم نتیجه می‌دهد", zh:"团队协同推动结果", es:"La sinergia del equipo impulsa los resultados", de:"Teamsynergie treibt Ergebnisse voran" }, answer:"Team synergy drives results", words:["Team","synergy","drives","results","blocks","loses","random"] },
        { type:"fill", sentence:"I don't have the ___ for that right now.", blank:"bandwidth", hint:{ ru:"У меня сейчас нет ресурсов на это.", en:"I don't have the bandwidth for that.", uz:"Bunga vaqtim yo'q.", tr:"Bunun için kapasitem yok.", ar:"ليس لدي الطاقة لذلك الآن.", fa:"الان ظرفیتش رو ندارم.", zh:"我现在没有精力做那件事。", es:"No tengo capacidad para eso ahora.", de:"Dafür habe ich gerade keine Kapazität." }, options:["bandwidth","coffee","time","money"] },
      ]
    },
  ],
  "tr-beginner": [
    {
      id:1, emoji:"👋", titles:{ ru:"Приветствия", en:"Greetings", uz:"Salomlashish", tr:"Selamlaşma", ar:"التحيات", fa:"احوال‌پرسی", zh:"问候", es:"Saludos", de:"Begrüßungen" },
      exercises: [
        { type:"choose", targetWord:"Merhaba", translations:{ ru:"Привет", en:"Hello", uz:"Salom", tr:"Selam", ar:"مرحبا", fa:"سلام", zh:"你好", es:"Hola", de:"Hallo" }, distractors:{ ru:["Пока","Спасибо","Извини"], en:["Bye","Thanks","Sorry"], uz:["Xayr","Rahmat","Kechirasiz"], tr:["Hoşça kal","Teşekkürler","Özür"], ar:["وداعا","شكرا","آسف"], fa:["خداحافظ","ممنون","ببخشید"], zh:["再见","谢谢","对不起"], es:["Adiós","Gracias","Perdón"], de:["Tschüss","Danke","Entschuldigung"] } },
        { type:"arrange", sentence:{ ru:"Привет как дела", en:"Hello how are you", uz:"Salom qandaysiz", tr:"Merhaba nasılsın", ar:"مرحبا كيف حالك", fa:"سلام حالت چطور", zh:"你好你好吗", es:"Hola cómo estás", de:"Hallo wie geht es dir" }, answer:"Merhaba nasılsın", words:["Merhaba","nasılsın","Güle","güle","nereye"] },
        { type:"fill", sentence:"___ için teşekkürler!", blank:"Her şey", hint:{ ru:"Спасибо за всё!", en:"Thank you for everything!", uz:"Hamma narsa uchun rahmat!", tr:"Her şey için teşekkürler!", ar:"شكرا على كل شيء!", fa:"برای همه چیز ممنون!", zh:"感谢一切！", es:"¡Gracias por todo!", de:"Danke für alles!" }, options:["Her şey","Hiçbir şey","Yemek","Para"] },
        { type:"translate", source:{ ru:"Пока, до завтра!", en:"Bye, see you tomorrow!", uz:"Xayr, ertaga ko'rishguncha!", tr:"Bye, see you tomorrow!", ar:"وداعا، أراك غدا!", fa:"خداحافظ، تا فردا!", zh:"再见，明天见！", es:"¡Adiós, hasta mañana!", de:"Tschüss, bis morgen!" }, answer:"güle güle yarın görüşürüz", accept:["güle güle yarın görüşürüz","güle güle yarın görüşelim","hoşça kal yarın görüşürüz"] },
        { type:"choose", targetWord:"Lütfen", translations:{ ru:"Пожалуйста", en:"Please", uz:"Iltimos", tr:"Rica ederim", ar:"من فضلك", fa:"لطفاً", zh:"请", es:"Por favor", de:"Bitte" }, distractors:{ ru:["Нет","Да","Может быть"], en:["No","Yes","Maybe"], uz:["Yo'q","Ha","Balki"], tr:["Hayır","Evet","Belki"], ar:["لا","نعم","ربما"], fa:["نه","بله","شاید"], zh:["不","是","也许"], es:["No","Sí","Quizás"], de:["Nein","Ja","Vielleicht"] } },
      ]
    },
    {
      id:2, emoji:"🔢", titles:{ ru:"Числа", en:"Numbers", uz:"Raqamlar", tr:"Sayılar", ar:"الأرقام", fa:"اعداد", zh:"数字", es:"Números", de:"Zahlen" },
      exercises: [
        { type:"choose", targetWord:"Bir", translations:{ ru:"Один", en:"One", uz:"Bir", tr:"1", ar:"واحد", fa:"یک", zh:"一", es:"Uno", de:"Eins" }, distractors:{ ru:["Два","Три","Пять"], en:["Two","Three","Five"], uz:["Ikki","Uch","Besh"], tr:["İki","Üç","Beş"], ar:["اثنان","ثلاثة","خمسة"], fa:["دو","سه","پنج"], zh:["二","三","五"], es:["Dos","Tres","Cinco"], de:["Zwei","Drei","Fünf"] } },
        { type:"arrange", sentence:{ ru:"У меня два яблока", en:"I have two apples", uz:"Menda ikkita olma bor", tr:"İki elmam var", ar:"عندي تفاحتان", fa:"دو سیب دارم", zh:"我有两个苹果", es:"Tengo dos manzanas", de:"Ich habe zwei Äpfel" }, answer:"İki elmam var", words:["İki","elmam","var","üç","yok","beş"] },
        { type:"fill", sentence:"___ dakika bekleyin.", blank:"On", hint:{ ru:"Подождите десять минут.", en:"Wait ten minutes.", uz:"O'n daqiqa kuting.", tr:"On dakika bekleyin.", ar:"انتظر عشر دقائق.", fa:"ده دقیقه صبر کن.", zh:"等十分钟。", es:"Espera diez minutos.", de:"Warte zehn Minuten." }, options:["On","Bir","Yüz","Beş bin"] },
        { type:"translate", source:{ ru:"Пять человек", en:"Five people", uz:"Besh kishi", tr:"Five people", ar:"خمسة أشخاص", fa:"پنج نفر", zh:"五个人", es:"Cinco personas", de:"Fünf Personen" }, answer:"beş kişi", accept:["beş kişi","beş insan"] },
      ]
    },
    {
      id:3, emoji:"🍕", titles:{ ru:"Еда", en:"Food", uz:"Ovqat", tr:"Yiyecek", ar:"الطعام", fa:"غذا", zh:"食物", es:"Comida", de:"Essen" },
      exercises: [
        { type:"choose", targetWord:"Su", translations:{ ru:"Вода", en:"Water", uz:"Suv", tr:"H₂O", ar:"ماء", fa:"آب", zh:"水", es:"Agua", de:"Wasser" }, distractors:{ ru:["Кофе","Чай","Молоко"], en:["Coffee","Tea","Milk"], uz:["Qahva","Choy","Sut"], tr:["Kahve","Çay","Süt"], ar:["قهوة","شاي","حليب"], fa:["قهوه","چای","شیر"], zh:["咖啡","茶","牛奶"], es:["Café","Té","Leche"], de:["Kaffee","Tee","Milch"] } },
        { type:"arrange", sentence:{ ru:"Это очень вкусно", en:"This is very delicious", uz:"Bu juda mazali", tr:"This is very delicious", ar:"هذا لذيذ جدا", fa:"این خیلی خوشمزه است", zh:"这非常美味", es:"Esto es muy delicioso", de:"Das ist sehr lecker" }, answer:"Bu çok lezzetli", words:["Bu","çok","lezzetli","güzel","kötü","uzak"] },
        { type:"fill", sentence:"Türk ___ içmek istiyorum.", blank:"kahvesi", hint:{ ru:"Хочу выпить турецкий кофе.", en:"I want to drink Turkish coffee.", uz:"Turk qahvasi ichmoqchiman.", tr:"Türk kahvesi içmek istiyorum.", ar:"أريد شرب القهوة التركية.", fa:"می‌خوام قهوه ترکی بخورم.", zh:"我想喝土耳其咖啡。", es:"Quiero beber café turco.", de:"Ich möchte türkischen Kaffee trinken." }, options:["kahvesi","çayı","suyu","sütü"] },
        { type:"translate", source:{ ru:"Свежий хлеб каждое утро", en:"Fresh bread every morning", uz:"Har kuni ertalab yangi non", tr:"Fresh bread every morning", ar:"خبز طازج كل صباح", fa:"هر روز صبح نان تازه", zh:"每天早上新鲜面包", es:"Pan fresco cada mañana", de:"Frisches Brot jeden Morgen" }, answer:"her sabah taze ekmek", accept:["her sabah taze ekmek","her gün sabah taze ekmek"] },
      ]
    },
  ],
};


// ─── EXPANDED LESSON CONTENT ─────────────────────────────────────────────────
// Helper to build a lesson quickly
const mkLesson = (id, emoji, titles, exercises) => ({ id, emoji, titles, exercises });
const T = (ru,en,uz,tr,ar,fa,zh,es,de) => ({ru,en,uz,tr,ar,fa,zh,es,de});
const D = (ru,en,uz,tr,ar,fa,zh,es,de) => ({ru,en,uz,tr,ar,fa,zh,es,de});

const EXTRA_LESSONS = {

  // ── RUSSIAN beginner ──────────────────────────────────────────────────────
  "ru-beginner": [
    mkLesson(1,"👋", T("Приветствия","Greetings","Salomlashish","Selamlaşma","التحيات","احوال‌پرسی","问候","Saludos","Begrüßungen"), [
      { type:"choose", targetWord:"Привет", translations:T("Hi!","Hello","Salom","Merhaba","مرحبا","سلام","你好","Hola","Hallo"), distractors:T(["Пока","Нет","Да"],["Bye","No","Yes"],["Xayr","Yo'q","Ha"],["Güle güle","Hayır","Evet"],["وداعا","لا","نعم"],["خداحافظ","نه","بله"],["再见","不","是"],["Adiós","No","Sí"],["Tschüss","Nein","Ja"]) },
      { type:"arrange", sentence:T("Как тебя зовут?","What is your name?","Ismingiz nima?","Adın ne?","ما اسمك؟","اسمت چیه؟","你叫什么名字？","¿Cómo te llamas?","Wie heißt du?"), answer:"Как тебя зовут", words:["Как","тебя","зовут","где","живёшь","когда"] },
      { type:"fill", sentence:"Меня ___ Нусрат.", blank:"зовут", hint:T("Меня зовут Нусрат.","My name is Nusrat.","Mening ismim Nusrat.","Adım Nusrat.","اسمي نسرت.","اسمم نسراته.","我叫努斯拉特。","Me llamo Nusrat.","Ich heiße Nusrat."), options:["зовут","есть","живу","хочу"] },
      { type:"translate", source:T("My name is...","My name is...","Mening ismim...","Adım...","اسمي...","اسمم...","我叫...","Me llamo...","Ich heiße..."), answer:"меня зовут", accept:["меня зовут","моё имя"] },
      { type:"choose", targetWord:"Пожалуйста", translations:T("Please/You're welcome","Please","Iltimos","Lütfen","من فضلك","لطفاً","请","Por favor","Bitte"), distractors:T(["Спасибо","Нет","Привет"],["Thanks","No","Hi"],["Rahmat","Yo'q","Salom"],["Teşekkür","Hayır","Merhaba"],["شكرا","لا","مرحبا"],["ممنون","نه","سلام"],["谢谢","不","你好"],["Gracias","No","Hola"],["Danke","Nein","Hallo"]) },
    ]),
    mkLesson(2,"🔢", T("Числа","Numbers","Raqamlar","Sayılar","الأرقام","اعداد","数字","Números","Zahlen"), [
      { type:"choose", targetWord:"Один", translations:T("One","One","Bir","Bir","واحد","یک","一","Uno","Eins"), distractors:T(["Два","Три","Пять"],["Two","Three","Five"],["Ikki","Uch","Besh"],["İki","Üç","Beş"],["اثنان","ثلاثة","خمسة"],["دو","سه","پنج"],["二","三","五"],["Dos","Tres","Cinco"],["Zwei","Drei","Fünf"]) },
      { type:"arrange", sentence:T("У меня три яблока","I have three apples","Menda uchta olma bor","Üç elmam var","عندي ثلاث تفاحات","سه تا سیب دارم","我有三个苹果","Tengo tres manzanas","Ich habe drei Äpfel"), answer:"У меня три яблока", words:["У","меня","три","яблока","пять","книг"] },
      { type:"fill", sentence:"Нас ___ человек.", blank:"пять", hint:T("Нас пять человек.","There are five of us.","Bizda besh kishi.","Beş kişiyiz.","نحن خمسة أشخاص.","ما پنج نفریم.","我们有五个人。","Somos cinco personas.","Wir sind fünf Personen."), options:["пять","много","мало","десять"] },
      { type:"translate", source:T("Ten minutes","Ten minutes","O'n daqiqa","On dakika","عشر دقائق","ده دقیقه","十分钟","Diez minutos","Zehn Minuten"), answer:"десять минут", accept:["десять минут"] },
    ]),
    mkLesson(3,"🍎", T("Еда","Food","Ovqat","Yiyecek","الطعام","غذا","食物","Comida","Essen"), [
      { type:"choose", targetWord:"Хлеб", translations:T("Bread","Bread","Non","Ekmek","خبز","نان","面包","Pan","Brot"), distractors:T(["Вода","Молоко","Сыр"],["Water","Milk","Cheese"],["Suv","Sut","Pishloq"],["Su","Süt","Peynir"],["ماء","حليب","جبن"],["آب","شیر","پنیر"],["水","牛奶","奶酪"],["Agua","Leche","Queso"],["Wasser","Milch","Käse"]) },
      { type:"arrange", sentence:T("Я хочу кофе с молоком","I want coffee with milk","Sutli qahva istayapman","Sütlü kahve istiyorum","أريد قهوة بالحليب","قهوه با شیر میخوام","我要加牛奶的咖啡","Quiero café con leche","Ich möchte Kaffee mit Milch"), answer:"Я хочу кофе с молоком", words:["Я","хочу","кофе","с","молоком","без","сахара"] },
      { type:"fill", sentence:"Это очень ___!", blank:"вкусно", hint:T("Это очень вкусно!","This is very delicious!","Bu juda mazali!","Bu çok lezzetli!","هذا لذيذ جدا!","این خیلی خوشمزه است!","这非常美味！","¡Esto es muy delicioso!","Das ist sehr lecker!"), options:["вкусно","плохо","дорого","далеко"] },
      { type:"translate", source:T("Fresh juice","Fresh juice","Yangi sharbat","Taze meyve suyu","عصير طازج","آبمیوه تازه","新鲜果汁","Jugo fresco","Frischer Saft"), answer:"свежий сок", accept:["свежий сок"] },
    ]),
    mkLesson(4,"🏙️", T("Город","City","Shahar","Şehir","المدينة","شهر","城市","Ciudad","Stadt"), [
      { type:"choose", targetWord:"Магазин", translations:T("Shop/Store","Shop","Do'kon","Dükkan","متجر","مغازه","商店","Tienda","Geschäft"), distractors:T(["Банк","Школа","Больница"],["Bank","School","Hospital"],["Bank","Maktab","Kasalxona"],["Banka","Okul","Hastane"],["بنك","مدرسة","مستشفى"],["بانک","مدرسه","بیمارستان"],["银行","学校","医院"],["Banco","Escuela","Hospital"],["Bank","Schule","Krankenhaus"]) },
      { type:"arrange", sentence:T("Где находится метро?","Where is the subway?","Metro qayerda?","Metro nerede?","أين المترو؟","مترو کجاست؟","地铁在哪里？","¿Dónde está el metro?","Wo ist die U-Bahn?"), answer:"Где находится метро", words:["Где","находится","метро","автобус","банк","школа"] },
      { type:"fill", sentence:"Я живу в ___ доме.", blank:"большом", hint:T("Я живу в большом доме.","I live in a big house.","Men katta uyda yashayman.","Büyük bir evde yaşıyorum.","أعيش في منزل كبير.","در خانه بزرگی زندگی می‌کنم.","我住在大房子里。","Vivo en una casa grande.","Ich lebe in einem großen Haus."), options:["большом","маленьком","красивом","новом"] },
      { type:"translate", source:T("Turn left","Turn left","Chapga buring","Sola dön","اتجه يساراً","به چپ بپیچ","向左转","Gira a la izquierda","Links abbiegen"), answer:"повернуть налево", accept:["повернуть налево","налево","поверните налево"] },
    ]),
  ],

  // ── JAPANESE beginner ─────────────────────────────────────────────────────
  "ja-beginner": [
    mkLesson(1,"👋", T("挨拶","Greetings","Salomlashish","Selamlaşma","التحيات","احوال‌پرسی","问候","Saludos","Begrüßungen"), [
      { type:"choose", targetWord:"こんにちは", translations:T("Привет/Здравствуйте","Hello","Salom","Merhaba","مرحبا","سلام","你好","Hola","Hallo"), distractors:T(["Пока","Спасибо","Извини"],["Bye","Thanks","Sorry"],["Xayr","Rahmat","Kechirasiz"],["Güle güle","Teşekkür","Özür"],["وداعا","شكرا","آسف"],["خداحافظ","ممنون","ببخشید"],["再见","谢谢","对不起"],["Adiós","Gracias","Perdón"],["Tschüss","Danke","Entschuldigung"]) },
      { type:"arrange", sentence:T("Меня зовут Танака","My name is Tanaka","Mening ismim Tanaka","Adım Tanaka","اسمي تاناكا","اسمم تاناکاست","我叫田中","Me llamo Tanaka","Ich heiße Tanaka"), answer:"わたしは たなか です", words:["わたしは","たなか","です","どこ","いつ","なに"] },
      { type:"fill", sentence:"___ ございます!", blank:"ありがとう", hint:T("Большое спасибо!","Thank you very much!","Katta rahmat!","Çok teşekkürler!","شكرا جزيلا!","خیلی ممنون!","非常感谢！","¡Muchas gracias!","Vielen Dank!"), options:["ありがとう","すみません","おはよう","さようなら"] },
      { type:"translate", source:T("Good morning","Good morning","Xayrli tong","Günaydın","صباح الخير","صبح بخیر","早上好","Buenos días","Guten Morgen"), answer:"おはようございます", accept:["おはようございます","おはよう"] },
      { type:"choose", targetWord:"さようなら", translations:T("До свидания","Goodbye","Xayr","Güle güle","وداعا","خداحافظ","再见","Adiós","Auf Wiedersehen"), distractors:T(["Привет","Спасибо","Пожалуйста"],["Hello","Thanks","Please"],["Salom","Rahmat","Iltimos"],["Merhaba","Teşekkür","Lütfen"],["مرحبا","شكرا","من فضلك"],["سلام","ممنون","لطفاً"],["你好","谢谢","请"],["Hola","Gracias","Por favor"],["Hallo","Danke","Bitte"]) },
    ]),
    mkLesson(2,"🔢", T("数字","Numbers","Raqamlar","Sayılar","الأرقام","اعداد","数字","Números","Zahlen"), [
      { type:"choose", targetWord:"いち", translations:T("Один (1)","One","Bir","Bir","واحد","یک","一","Uno","Eins"), distractors:T(["Два","Три","Четыре"],["Two","Three","Four"],["Ikki","Uch","To'rt"],["İki","Üç","Dört"],["اثنان","ثلاثة","أربعة"],["دو","سه","چهار"],["二","三","四"],["Dos","Tres","Cuatro"],["Zwei","Drei","Vier"]) },
      { type:"fill", sentence:"___ さんが います。", blank:"さん", hint:T("Здесь три человека.","There are three people.","Uch kishi bor.","Üç kişi var.","هناك ثلاثة أشخاص.","سه نفر هستند.","有三个人。","Hay tres personas.","Es gibt drei Personen."), options:["さん","に","ご","じゅう"] },
      { type:"translate", source:T("Five apples","Five apples","Beshta olma","Beş elma","خمس تفاحات","پنج سیب","五个苹果","Cinco manzanas","Fünf Äpfel"), answer:"りんご が ご つ", accept:["りんごがごつ","りんご ご つ","ごつのりんご"] },
    ]),
    mkLesson(3,"🍜", T("食べ物","Food","Ovqat","Yiyecek","الطعام","غذا","食物","Comida","Essen"), [
      { type:"choose", targetWord:"みず", translations:T("Вода","Water","Suv","Su","ماء","آب","水","Agua","Wasser"), distractors:T(["Чай","Кофе","Сок"],["Tea","Coffee","Juice"],["Choy","Qahva","Sharbat"],["Çay","Kahve","Meyve suyu"],["شاي","قهوة","عصير"],["چای","قهوه","آبمیوه"],["茶","咖啡","果汁"],["Té","Café","Jugo"],["Tee","Kaffee","Saft"]) },
      { type:"arrange", sentence:T("Это очень вкусно","This is very delicious","Bu juda mazali","Bu çok lezzetli","هذا لذيذ جدا","این خیلی خوشمزه است","这非常美味","Esto es muy delicioso","Das ist sehr lecker"), answer:"これは とても おいしい です", words:["これは","とても","おいしい","です","まずい","たかい"] },
      { type:"fill", sentence:"すし が ___。", blank:"すき です", hint:T("Я люблю суши.","I like sushi.","Men sushini yaxshi ko'raman.","Sushi seviyorum.","أحب السوشي.","سوشی دوست دارم.","我喜欢寿司。","Me gusta el sushi.","Ich mag Sushi."), options:["すき です","きらい です","たかい です","やすい です"] },
    ]),
  ],

  // ── KOREAN beginner ───────────────────────────────────────────────────────
  "ko-beginner": [
    mkLesson(1,"👋", T("인사","Greetings","Salomlashish","Selamlaşma","التحيات","احوال‌پرسی","问候","Saludos","Begrüßungen"), [
      { type:"choose", targetWord:"안녕하세요", translations:T("Здравствуйте","Hello","Salom","Merhaba","مرحبا","سلام","你好","Hola","Hallo"), distractors:T(["Пока","Спасибо","Извините"],["Bye","Thanks","Sorry"],["Xayr","Rahmat","Kechirasiz"],["Güle güle","Teşekkür","Özür"],["وداعا","شكرا","آسف"],["خداحافظ","ممنون","ببخشید"],["再见","谢谢","对不起"],["Adiós","Gracias","Perdón"],["Tschüss","Danke","Entschuldigung"]) },
      { type:"arrange", sentence:T("Меня зовут Ким","My name is Kim","Mening ismim Kim","Adım Kim","اسمي كيم","اسمم کیمه","我叫金","Me llamo Kim","Ich heiße Kim"), answer:"저는 김 입니다", words:["저는","김","입니다","어디","언제","무엇"] },
      { type:"fill", sentence:"___ 합니다!", blank:"감사", hint:T("Спасибо!","Thank you!","Rahmat!","Teşekkürler!","شكرا!","ممنون!","谢谢！","¡Gracias!","Danke!"), options:["감사","안녕","미안","괜찮"] },
      { type:"translate", source:T("Good morning","Good morning","Xayrli tong","Günaydın","صباح الخير","صبح بخیر","早上好","Buenos días","Guten Morgen"), answer:"좋은 아침", accept:["좋은 아침","안녕하세요"] },
      { type:"choose", targetWord:"미안합니다", translations:T("Извините/Простите","Sorry","Kechirasiz","Özür dilerim","آسف","ببخشید","对不起","Lo siento","Entschuldigung"), distractors:T(["Привет","Пока","Спасибо"],["Hi","Bye","Thanks"],["Salom","Xayr","Rahmat"],["Merhaba","Güle güle","Teşekkür"],["مرحبا","وداعا","شكرا"],["سلام","خداحافظ","ممنون"],["你好","再见","谢谢"],["Hola","Adiós","Gracias"],["Hallo","Tschüss","Danke"]) },
    ]),
    mkLesson(2,"🔢", T("숫자","Numbers","Raqamlar","Sayılar","الأرقام","اعداد","数字","Números","Zahlen"), [
      { type:"choose", targetWord:"일", translations:T("Один (1)","One","Bir","Bir","واحد","یک","一","Uno","Eins"), distractors:T(["Два","Три","Пять"],["Two","Three","Five"],["Ikki","Uch","Besh"],["İki","Üç","Beş"],["اثنان","ثلاثة","خمسة"],["دو","سه","پنج"],["二","三","五"],["Dos","Tres","Cinco"],["Zwei","Drei","Fünf"]) },
      { type:"arrange", sentence:T("У меня два билета","I have two tickets","Menda ikkita chipta bor","İki biletim var","عندي تذكرتان","دو تا بلیت دارم","我有两张票","Tengo dos entradas","Ich habe zwei Tickets"), answer:"저는 표가 두 장 있어요", words:["저는","표가","두","장","있어요","없어요","세"] },
      { type:"fill", sentence:"___ 명이 있어요.", blank:"다섯", hint:T("Здесь пять человек.","There are five people.","Besh kishi bor.","Beş kişi var.","هناك خمسة أشخاص.","پنج نفر هستند.","有五个人。","Hay cinco personas.","Es gibt fünf Personen."), options:["다섯","하나","열","백"] },
    ]),
    mkLesson(3,"🍚", T("음식","Food","Ovqat","Yiyecek","الطعام","غذا","食物","Comida","Essen"), [
      { type:"choose", targetWord:"물", translations:T("Вода","Water","Suv","Su","ماء","آب","水","Agua","Wasser"), distractors:T(["Чай","Кофе","Молоко"],["Tea","Coffee","Milk"],["Choy","Qahva","Sut"],["Çay","Kahve","Süt"],["شاي","قهوة","حليب"],["چای","قهوه","شیر"],["茶","咖啡","牛奶"],["Té","Café","Leche"],["Tee","Kaffee","Milch"]) },
      { type:"translate", source:T("I like kimchi","I like kimchi","Kimchini yaxshi ko'raman","Kimchi seviyorum","أحب الكيمتشي","کیمچی دوست دارم","我喜欢泡菜","Me gusta el kimchi","Ich mag Kimchi"), answer:"김치를 좋아해요", accept:["김치를 좋아해요","김치 좋아해요"] },
      { type:"fill", sentence:"이 음식이 ___ 맛있어요.", blank:"정말", hint:T("Эта еда очень вкусная.","This food is really delicious.","Bu ovqat juda mazali.","Bu yemek gerçekten lezzetli.","هذا الطعام لذيذ جداً.","این غذا واقعاً خوشمزه است.","这道菜真的很好吃。","Esta comida está muy rica.","Dieses Essen ist wirklich lecker."), options:["정말","별로","조금","너무"] },
    ]),
  ],

  // ── ARABIC beginner ───────────────────────────────────────────────────────
  "ar-beginner": [
    mkLesson(1,"👋", T("التحيات","Greetings","Salomlashish","Selamlaşma","التحيات","احوال‌پرسی","问候","Saludos","Begrüßungen"), [
      { type:"choose", targetWord:"مرحبا", translations:T("Привет","Hello","Salom","Merhaba","تحية","سلام","你好","Hola","Hallo"), distractors:T(["Пока","Спасибо","Нет"],["Bye","Thanks","No"],["Xayr","Rahmat","Yo'q"],["Güle güle","Teşekkür","Hayır"],["وداعا","شكرا","لا"],["خداحافظ","ممنون","نه"],["再见","谢谢","不"],["Adiós","Gracias","No"],["Tschüss","Danke","Nein"]) },
      { type:"arrange", sentence:T("Как тебя зовут?","What is your name?","Ismingiz nima?","Adın ne?","ما اسمك؟","اسمت چیه؟","你叫什么名字？","¿Cómo te llamas?","Wie heißt du?"), answer:"ما اسمك", words:["ما","اسمك","أين","متى","كيف","لماذا"] },
      { type:"fill", sentence:"___ الخير!", blank:"صباح", hint:T("Доброе утро!","Good morning!","Xayrli tong!","Günaydın!","صباح الخير!","صبح بخیر!","早上好！","¡Buenos días!","Guten Morgen!"), options:["صباح","مساء","ليل","يوم"] },
      { type:"translate", source:T("Thank you very much","Thank you very much","Katta rahmat","Çok teşekkürler","شكرا جزيلا","خیلی ممنون","非常感谢","Muchas gracias","Vielen Dank"), answer:"شكرا جزيلا", accept:["شكرا جزيلا","شكراً جزيلاً","شكرا"] },
      { type:"choose", targetWord:"مع السلامة", translations:T("До свидания","Goodbye","Xayr","Güle güle","وداعا","خداحافظ","再见","Adiós","Auf Wiedersehen"), distractors:T(["Привет","Спасибо","Да"],["Hello","Thanks","Yes"],["Salom","Rahmat","Ha"],["Merhaba","Teşekkür","Evet"],["مرحبا","شكرا","نعم"],["سلام","ممنون","بله"],["你好","谢谢","是"],["Hola","Gracias","Sí"],["Hallo","Danke","Ja"]) },
    ]),
    mkLesson(2,"🔢", T("الأرقام","Numbers","Raqamlar","Sayılar","الأرقام","اعداد","数字","Números","Zahlen"), [
      { type:"choose", targetWord:"واحد", translations:T("Один","One","Bir","Bir","1","یک","一","Uno","Eins"), distractors:T(["Два","Три","Пять"],["Two","Three","Five"],["Ikki","Uch","Besh"],["İki","Üç","Beş"],["اثنان","ثلاثة","خمسة"],["دو","سه","پنج"],["二","三","五"],["Dos","Tres","Cinco"],["Zwei","Drei","Fünf"]) },
      { type:"fill", sentence:"عندي ___ كتب.", blank:"ثلاثة", hint:T("У меня три книги.","I have three books.","Menda uchta kitob bor.","Üç kitabım var.","عندي ثلاثة كتب.","سه تا کتاب دارم.","我有三本书。","Tengo tres libros.","Ich habe drei Bücher."), options:["ثلاثة","عشرة","واحد","مئة"] },
      { type:"translate", source:T("Ten days","Ten days","O'n kun","On gün","عشرة أيام","ده روز","十天","Diez días","Zehn Tage"), answer:"عشرة أيام", accept:["عشرة أيام","١٠ أيام"] },
    ]),
    mkLesson(3,"🥙", T("الطعام","Food","Ovqat","Yiyecek","الطعام","غذا","食物","Comida","Essen"), [
      { type:"choose", targetWord:"ماء", translations:T("Вода","Water","Suv","Su","H₂O","آب","水","Agua","Wasser"), distractors:T(["Чай","Кофе","Сок"],["Tea","Coffee","Juice"],["Choy","Qahva","Sharbat"],["Çay","Kahve","Meyve suyu"],["شاي","قهوة","عصير"],["چای","قهوه","آبمیوه"],["茶","咖啡","果汁"],["Té","Café","Jugo"],["Tee","Kaffee","Saft"]) },
      { type:"arrange", sentence:T("Это очень вкусно","This is delicious","Bu mazali","Bu lezzetli","هذا لذيذ","این خوشمزه است","这很美味","Esto está delicioso","Das ist lecker"), answer:"هذا لذيذ جدا", words:["هذا","لذيذ","جدا","رديء","غالي","قديم"] },
      { type:"fill", sentence:"أريد ___ من فضلك.", blank:"قهوة", hint:T("Мне кофе, пожалуйста.","Coffee please.","Qahva bering, iltimos.","Kahve lütfen.","أريد قهوة من فضلك.","قهوه لطفاً.","请给我咖啡。","Un café por favor.","Kaffee bitte."), options:["قهوة","كتاب","سيارة","بيت"] },
    ]),
  ],

  // ── FARSI beginner ────────────────────────────────────────────────────────
  "fa-beginner": [
    mkLesson(1,"👋", T("احوال‌پرسی","Greetings","Salomlashish","Selamlaşma","التحيات","احوال‌پرسی","问候","Saludos","Begrüßungen"), [
      { type:"choose", targetWord:"سلام", translations:T("Привет","Hello","Salom","Merhaba","مرحبا","درود","你好","Hola","Hallo"), distractors:T(["Пока","Спасибо","Нет"],["Bye","Thanks","No"],["Xayr","Rahmat","Yo'q"],["Güle güle","Teşekkür","Hayır"],["وداعا","شكرا","لا"],["خداحافظ","ممنون","نه"],["再见","谢谢","不"],["Adiós","Gracias","No"],["Tschüss","Danke","Nein"]) },
      { type:"arrange", sentence:T("Как тебя зовут?","What is your name?","Ismingiz nima?","Adın ne?","ما اسمك؟","اسمت چیه؟","你叫什么名字？","¿Cómo te llamas?","Wie heißt du?"), answer:"اسم شما چیست", words:["اسم","شما","چیست","کجا","کی","چرا"] },
      { type:"fill", sentence:"___ ممنون!", blank:"خیلی", hint:T("Большое спасибо!","Thank you very much!","Katta rahmat!","Çok teşekkürler!","شكرا جزيلا!","خیلی ممنون!","非常感谢！","¡Muchas gracias!","Vielen Dank!"), options:["خیلی","کمی","هرگز","بعداً"] },
      { type:"translate", source:T("Good night","Good night","Yaxshi tun","İyi geceler","تصبح على خير","شب بخیر","晚安","Buenas noches","Gute Nacht"), answer:"شب بخیر", accept:["شب بخیر"] },
      { type:"choose", targetWord:"خداحافظ", translations:T("До свидания","Goodbye","Xayr","Güle güle","وداعا","بای","再见","Adiós","Auf Wiedersehen"), distractors:T(["Привет","Спасибо","Да"],["Hello","Thanks","Yes"],["Salom","Rahmat","Ha"],["Merhaba","Teşekkür","Evet"],["مرحبا","شكرا","نعم"],["سلام","ممنون","بله"],["你好","谢谢","是"],["Hola","Gracias","Sí"],["Hallo","Danke","Ja"]) },
    ]),
    mkLesson(2,"🔢", T("اعداد","Numbers","Raqamlar","Sayılar","الأرقام","اعداد","数字","Números","Zahlen"), [
      { type:"choose", targetWord:"یک", translations:T("Один","One","Bir","Bir","واحد","1","一","Uno","Eins"), distractors:T(["Два","Три","Пять"],["Two","Three","Five"],["Ikki","Uch","Besh"],["İki","Üç","Beş"],["اثنان","ثلاثة","خمسة"],["دو","سه","پنج"],["二","三","五"],["Dos","Tres","Cinco"],["Zwei","Drei","Fünf"]) },
      { type:"fill", sentence:"من ___ کتاب دارم.", blank:"سه", hint:T("У меня три книги.","I have three books.","Menda uchta kitob bor.","Üç kitabım var.","عندي ثلاثة كتب.","من سه کتاب دارم.","我有三本书。","Tengo tres libros.","Ich habe drei Bücher."), options:["سه","یک","ده","صد"] },
      { type:"translate", source:T("Five people","Five people","Besh kishi","Beş kişi","خمسة أشخاص","پنج نفر","五个人","Cinco personas","Fünf Personen"), answer:"پنج نفر", accept:["پنج نفر"] },
    ]),
    mkLesson(3,"🥘", T("غذا","Food","Ovqat","Yiyecek","الطعام","غذا","食物","Comida","Essen"), [
      { type:"choose", targetWord:"آب", translations:T("Вода","Water","Suv","Su","ماء","H₂O","水","Agua","Wasser"), distractors:T(["Чай","Кофе","Шербет"],["Tea","Coffee","Sherbet"],["Choy","Qahva","Sharbat"],["Çay","Kahve","Şerbet"],["شاي","قهوة","شربات"],["چای","قهوه","شربت"],["茶","咖啡","果汁"],["Té","Café","Refresco"],["Tee","Kaffee","Saft"]) },
      { type:"arrange", sentence:T("Это очень вкусно","This is very tasty","Bu juda mazali","Bu çok lezzetli","هذا لذيذ جدا","این خیلی خوشمزه است","这非常好吃","Esto está muy rico","Das ist sehr lecker"), answer:"این خیلی خوشمزه است", words:["این","خیلی","خوشمزه","است","بد","گران"] },
      { type:"fill", sentence:"یک ___ لطفاً!", blank:"چای", hint:T("Один чай, пожалуйста!","One tea please!","Bir choy, iltimos!","Bir çay lütfen!","شاي واحد من فضلك!","یک چای لطفاً!","一杯茶请！","¡Un té por favor!","Einen Tee bitte!"), options:["چای","کتاب","ماشین","خانه"] },
    ]),
  ],

  // ── UZBEK beginner ────────────────────────────────────────────────────────
  "uz-beginner": [
    mkLesson(1,"👋", T("Salomlashish","Greetings","Salomlashish","Selamlaşma","التحيات","احوال‌پرسی","问候","Saludos","Begrüßungen"), [
      { type:"choose", targetWord:"Salom", translations:T("Привет","Hello","Salut","Merhaba","مرحبا","سلام","你好","Hola","Hallo"), distractors:T(["Пока","Спасибо","Нет"],["Bye","Thanks","No"],["Xayr","Rahmat","Yo'q"],["Güle güle","Teşekkür","Hayır"],["وداعا","شكرا","لا"],["خداحافظ","ممنون","نه"],["再见","谢谢","不"],["Adiós","Gracias","No"],["Tschüss","Danke","Nein"]) },
      { type:"arrange", sentence:T("Как тебя зовут?","What is your name?","Ismingiz nima?","Adın ne?","ما اسمك؟","اسمت چیه؟","你叫什么名字？","¿Cómo te llamas?","Wie heißt du?"), answer:"Ismingiz nima", words:["Ismingiz","nima","qayerda","qachon","necha","kim"] },
      { type:"fill", sentence:"___ ko'rishguncha!", blank:"Xayr", hint:T("До свидания!","Goodbye!","Xayr!","Güle güle!","وداعا!","خداحافظ!","再见！","¡Adiós!","Auf Wiedersehen!"), options:["Xayr","Salom","Rahmat","Iltimos"] },
      { type:"translate", source:T("Thank you","Thank you","Merci","Teşekkürler","شكرا","ممنون","谢谢","Gracias","Danke"), answer:"rahmat", accept:["rahmat","katta rahmat"] },
      { type:"choose", targetWord:"Kechirasiz", translations:T("Извините","Excuse me","Pardon","Özür","عذراً","ببخشید","对不起","Perdón","Entschuldigung"), distractors:T(["Привет","Спасибо","Пожалуйста"],["Hello","Thanks","Please"],["Salom","Rahmat","Iltimos"],["Merhaba","Teşekkür","Lütfen"],["مرحبا","شكرا","من فضلك"],["سلام","ممنون","لطفاً"],["你好","谢谢","请"],["Hola","Gracias","Por favor"],["Hallo","Danke","Bitte"]) },
    ]),
    mkLesson(2,"🔢", T("Raqamlar","Numbers","Raqamlar","Sayılar","الأرقام","اعداد","数字","Números","Zahlen"), [
      { type:"choose", targetWord:"Bir", translations:T("Один","One","1","Bir","واحد","یک","一","Uno","Eins"), distractors:T(["Два","Три","Пять"],["Two","Three","Five"],["Ikki","Uch","Besh"],["İki","Üç","Beş"],["اثنان","ثلاثة","خمسة"],["دو","سه","پنج"],["二","三","五"],["Dos","Tres","Cinco"],["Zwei","Drei","Fünf"]) },
      { type:"arrange", sentence:T("У меня пять книг","I have five books","Menda beshta kitob bor","Beş kitabım var","عندي خمسة كتب","پنج کتاب دارم","我有五本书","Tengo cinco libros","Ich habe fünf Bücher"), answer:"Menda beshta kitob bor", words:["Menda","beshta","kitob","bor","yo'q","uchta"] },
      { type:"fill", sentence:"___ daqiqa kuting.", blank:"O'n", hint:T("Подождите десять минут.","Wait ten minutes.","O'n daqiqa kuting.","On dakika bekleyin.","انتظر عشر دقائق.","ده دقیقه صبر کن.","等十分钟。","Espera diez minutos.","Warte zehn Minuten."), options:["O'n","Bir","Yuz","Ming"] },
    ]),
    mkLesson(3,"🍽️", T("Ovqatlar","Food","Ovqat","Yiyecek","الطعام","غذا","食物","Comida","Essen"), [
      { type:"choose", targetWord:"Suv", translations:T("Вода","Water","Su","Su","ماء","آب","水","Agua","Wasser"), distractors:T(["Чай","Кофе","Шербет"],["Tea","Coffee","Juice"],["Choy","Qahva","Sharbat"],["Çay","Kahve","Meyve suyu"],["شاي","قهوة","عصير"],["چای","قهوه","آبمیوه"],["茶","咖啡","果汁"],["Té","Café","Jugo"],["Tee","Kaffee","Saft"]) },
      { type:"arrange", sentence:T("Это очень вкусно","This is very tasty","Bu juda mazali","Bu çok lezzetli","هذا لذيذ جدا","این خیلی خوشمزه است","这非常美味","Esto está muy rico","Das ist sehr lecker"), answer:"Bu juda mazali", words:["Bu","juda","mazali","yomon","arzon","qimmat"] },
      { type:"fill", sentence:"Non ___ yangi.", blank:"juda", hint:T("Хлеб очень свежий.","The bread is very fresh.","Non juda yangi.","Ekmek çok taze.","الخبز طازج جداً.","نان خیلی تازه است.","面包非常新鲜。","El pan está muy fresco.","Das Brot ist sehr frisch."), options:["juda","kam","ko'p","eski"] },
    ]),
  ],

  // ── CHINESE beginner ──────────────────────────────────────────────────────
  "zh-beginner": [
    mkLesson(1,"👋", T("问候","Greetings","Salomlashish","Selamlaşma","التحيات","احوال‌پرسی","问候","Saludos","Begrüßungen"), [
      { type:"choose", targetWord:"你好", translations:T("Привет","Hello","Salom","Merhaba","مرحبا","سلام","Hi","Hola","Hallo"), distractors:T(["Пока","Спасибо","Нет"],["Bye","Thanks","No"],["Xayr","Rahmat","Yo'q"],["Güle güle","Teşekkür","Hayır"],["وداعا","شكرا","لا"],["خداحافظ","ممنون","نه"],["Bye","Thanks","No"],["Adiós","Gracias","No"],["Tschüss","Danke","Nein"]) },
      { type:"arrange", sentence:T("Меня зовут Ли","My name is Li","Mening ismim Li","Adım Li","اسمي لي","اسمم لیه","我叫李","Me llamo Li","Ich heiße Li"), answer:"我 叫 李", words:["我","叫","李","你","他","她"] },
      { type:"fill", sentence:"___ 谢谢!", blank:"非常", hint:T("Большое спасибо!","Thank you very much!","Katta rahmat!","Çok teşekkürler!","شكرا جزيلا!","خیلی ممنون!","非常感谢！","¡Muchas gracias!","Vielen Dank!"), options:["非常","一点","很少","不"] },
      { type:"translate", source:T("Good morning","Good morning","Xayrli tong","Günaydın","صباح الخير","صبح بخیر","Morning greeting","Buenos días","Guten Morgen"), answer:"早上好", accept:["早上好","早安"] },
      { type:"choose", targetWord:"再见", translations:T("До свидания","Goodbye","Xayr","Güle güle","وداعا","خداحافظ","Bye","Adiós","Auf Wiedersehen"), distractors:T(["Привет","Спасибо","Да"],["Hello","Thanks","Yes"],["Salom","Rahmat","Ha"],["Merhaba","Teşekkür","Evet"],["مرحبا","شكرا","نعم"],["سلام","ممنون","بله"],["Hi","Thanks","Yes"],["Hola","Gracias","Sí"],["Hallo","Danke","Ja"]) },
    ]),
    mkLesson(2,"🔢", T("数字","Numbers","Raqamlar","Sayılar","الأرقام","اعداد","数字","Números","Zahlen"), [
      { type:"choose", targetWord:"一", translations:T("Один","One","Bir","Bir","واحد","یک","1","Uno","Eins"), distractors:T(["Два","Три","Пять"],["Two","Three","Five"],["Ikki","Uch","Besh"],["İki","Üç","Beş"],["اثنان","ثلاثة","خمسة"],["دو","سه","پنج"],["二","三","五"],["Dos","Tres","Cinco"],["Zwei","Drei","Fünf"]) },
      { type:"fill", sentence:"我有 ___ 本书。", blank:"三", hint:T("У меня три книги.","I have three books.","Menda uchta kitob bor.","Üç kitabım var.","عندي ثلاثة كتب.","سه تا کتاب دارم.","我有三本书。","Tengo tres libros.","Ich habe drei Bücher."), options:["三","一","十","百"] },
      { type:"translate", source:T("Ten minutes","Ten minutes","O'n daqiqa","On dakika","عشر دقائق","ده دقیقه","10 minutes","Diez minutos","Zehn Minuten"), answer:"十分钟", accept:["十分钟","十 分钟"] },
    ]),
    mkLesson(3,"🍜", T("食物","Food","Ovqat","Yiyecek","الطعام","غذا","食物","Comida","Essen"), [
      { type:"choose", targetWord:"水", translations:T("Вода","Water","Suv","Su","ماء","آب","H₂O","Agua","Wasser"), distractors:T(["Чай","Кофе","Молоко"],["Tea","Coffee","Milk"],["Choy","Qahva","Sut"],["Çay","Kahve","Süt"],["شاي","قهوة","حليب"],["چای","قهوه","شیر"],["茶","咖啡","牛奶"],["Té","Café","Leche"],["Tee","Kaffee","Milch"]) },
      { type:"arrange", sentence:T("Это очень вкусно","This is very tasty","Bu juda mazali","Bu çok lezzetli","هذا لذيذ جدا","این خیلی خوشمزه است","This is delicious","Esto está muy rico","Das ist sehr lecker"), answer:"这个 很 好吃", words:["这个","很","好吃","难吃","贵","便宜"] },
      { type:"fill", sentence:"我想喝 ___。", blank:"茶", hint:T("Я хочу выпить чай.","I want to drink tea.","Choy ichmoqchiman.","Çay içmek istiyorum.","أريد شرب الشاي.","می‌خوام چای بخورم.","我想喝茶。","Quiero beber té.","Ich möchte Tee trinken."), options:["茶","书","车","家"] },
    ]),
  ],

  // ── GERMAN intermediate ───────────────────────────────────────────────────
  "de-intermediate": [
    mkLesson(1,"💼", T("Arbeit","Work","Ish","İş","العمل","کار","工作","Trabajo","Arbeit"), [
      { type:"choose", targetWord:"Besprechung", translations:T("Совещание","Meeting","Yig'ilish","Toplantı","اجتماع","جلسه","会议","Reunión","Meeting"), distractors:T(["Перерыв","Вечеринка","Отчёт"],["Break","Party","Report"],["Tanaffus","Ziyofat","Hisobot"],["Mola","Parti","Rapor"],["استراحة","حفلة","تقرير"],["استراحت","مهمانی","گزارش"],["休息","派对","报告"],["Descanso","Fiesta","Informe"],["Pause","Party","Bericht"]) },
      { type:"translate", source:T("The deadline is tomorrow.","The deadline is tomorrow.","Muddat ertaga.","Son tarih yarın.","الموعد النهائي غدا.","مهلت فردا است.","截止日期是明天。","El plazo es mañana.","Die Frist ist morgen."), answer:"die frist ist morgen", accept:["die frist ist morgen","der termin ist morgen"] },
      { type:"arrange", sentence:T("Мой коллега очень полезен","My colleague is very helpful","Mening hamkashim foydali","Meslektaşım yardımsever","زميلي مفيد جدا","همکارم مفید است","我的同事很有帮助","Mi colega es muy útil","Mein Kollege ist sehr hilfsbereit"), answer:"Mein Kollege ist sehr hilfsbereit", words:["Mein","Kollege","ist","sehr","hilfsbereit","faul","selten"] },
      { type:"fill", sentence:"Was ist dein ___?", blank:"Gehalt", hint:T("Какая у тебя зарплата?","What is your salary?","Maoshingiz qancha?","Maaşın ne kadar?","ما هو راتبك؟","حقوقت چقدره؟","你的薪水是多少？","¿Cuál es tu salario?","Was ist dein Gehalt?"), options:["Gehalt","Name","Haus","Auto"] },
    ]),
    mkLesson(2,"🏙️", T("Stadt","City","Shahar","Şehir","المدينة","شهر","城市","Ciudad","Stadt"), [
      { type:"choose", targetWord:"U-Bahn", translations:T("Метро","Subway","Metro","Metro","مترو","مترو","地铁","Metro","Underground"), distractors:T(["Автобус","Трамвай","Такси"],["Bus","Tram","Taxi"],["Avtobus","Tramvay","Taksi"],["Otobüs","Tramvay","Taksi"],["حافلة","ترام","سيارة أجرة"],["اتوبوس","تراموا","تاکسی"],["公交","电车","出租车"],["Autobús","Tranvía","Taxi"],["Bus","Straßenbahn","Taxi"]) },
      { type:"translate", source:T("There is heavy traffic here.","There is heavy traffic here.","Bu yerda tiqilinch ko'p.","Burada yoğun trafik var.","يوجد ازدحام مروري هنا.","اینجا ترافیک سنگین است.","这里交通很拥挤。","Hay mucho tráfico aquí.","Hier ist viel Verkehr."), answer:"hier ist viel verkehr", accept:["hier ist viel verkehr","hier gibt es viel verkehr"] },
      { type:"fill", sentence:"Die Apotheke ist ___ der Bank.", blank:"neben", hint:T("Аптека рядом с банком.","The pharmacy is near the bank.","Dorixona bank yonida.","Eczane bankanın yanında.","الصيدلية بجانب البنك.","داروخانه کنار بانک است.","药店在银行旁边。","La farmacia está junto al banco.","Die Apotheke ist neben der Bank."), options:["neben","unter","über","hinter"] },
    ]),
  ],

  // ── SPANISH intermediate ──────────────────────────────────────────────────
  "es-intermediate": [
    mkLesson(1,"💼", T("Trabajo","Work","Ish","İş","العمل","کار","工作","Trabajo","Arbeit"), [
      { type:"choose", targetWord:"Reunión", translations:T("Встреча","Meeting","Yig'ilish","Toplantı","اجتماع","جلسه","会议","Meeting","Besprechung"), distractors:T(["Перерыв","Вечеринка","Отчёт"],["Break","Party","Report"],["Tanaffus","Ziyofat","Hisobot"],["Mola","Parti","Rapor"],["استراحة","حفلة","تقرير"],["استراحت","مهمانی","گزارش"],["休息","派对","报告"],["Descanso","Fiesta","Informe"],["Pause","Party","Bericht"]) },
      { type:"translate", source:T("The deadline is tomorrow.","The deadline is tomorrow.","Muddat ertaga.","Son tarih yarın.","الموعد النهائي غدا.","مهلت فردا است.","截止日期是明天。","El plazo es mañana.","Die Frist ist morgen."), answer:"el plazo es mañana", accept:["el plazo es mañana","la fecha límite es mañana"] },
      { type:"arrange", sentence:T("Мой коллега очень полезен","My colleague is very helpful","Mening hamkashim foydali","Meslektaşım yardımsever","زميلي مفيد جدا","همکارم مفید است","我的同事很有帮助","Mi colega es muy útil","Mein Kollege ist sehr hilfsbereit"), answer:"Mi colega es muy útil", words:["Mi","colega","es","muy","útil","perezoso","malo"] },
      { type:"fill", sentence:"¿Cuál es tu ___?", blank:"salario", hint:T("Какая у тебя зарплата?","What is your salary?","Maoshingiz qancha?","Maaşın ne kadar?","ما هو راتبك؟","حقوقت چقدره؟","你的薪水是多少？","¿Cuál es tu salario?","Was ist dein Gehalt?"), options:["salario","nombre","casa","coche"] },
    ]),
  ],
};

// Merge extra lessons into LESSON_DATA
Object.entries(EXTRA_LESSONS).forEach(([key, lessons]) => {
  LESSON_DATA[key] = lessons;
});

// Generate stub data for any still-missing lang-level combos
const allCombos2 = [];
LANGUAGES.forEach(l => LEVELS.forEach(lv => allCombos2.push(`${l.code}-${lv}`)));
allCombos2.forEach(key => {
  if (!LESSON_DATA[key]) {
    LESSON_DATA[key] = [
      {
        id:1, emoji:"📚",
        titles:{ ru:"Скоро", en:"Coming soon", uz:"Tez kunda", tr:"Yakında", ar:"قريباً", fa:"به زودی", zh:"即将推出", es:"Próximamente", de:"Demnächst" },
        exercises:[
          { type:"choose", targetWord:"Soon", translations:{ ru:"Скоро", en:"Coming soon", uz:"Tez kunda", tr:"Yakında", ar:"قريباً", fa:"به زودی", zh:"即将推出", es:"Próximamente", de:"Demnächst" }, distractors:{ ru:["Да","Нет","Может"], en:["Yes","No","Maybe"], uz:["Ha","Yo'q","Balki"], tr:["Evet","Hayır","Belki"], ar:["نعم","لا","ربما"], fa:["بله","نه","شاید"], zh:["是","否","也许"], es:["Sí","No","Quizás"], de:["Ja","Nein","Vielleicht"] } },
        ]
      }
    ];
  }
});


// ─── ADDITIONAL LESSONS (injected after LESSON_DATA) ─────────────────────────
const ADDITIONAL_LESSONS = {

  // ══ ENGLISH — more lessons ══════════════════════════════════════════════════
  "en-beginner-extra": [
    { id:5, emoji:"👨‍👩‍👧", titles:{ru:"Семья",en:"Family",uz:"Oila",tr:"Aile",ar:"العائلة",fa:"خانواده",zh:"家庭",es:"Familia",de:"Familie"},
      exercises:[
        {type:"choose",targetWord:"Mother",translations:{ru:"Мама",en:"Mom",uz:"Ona",tr:"Anne",ar:"أم",fa:"مادر",zh:"妈妈",es:"Madre",de:"Mutter"},distractors:{ru:["Папа","Брат","Сестра"],en:["Father","Brother","Sister"],uz:["Ota","Aka","Singil"],tr:["Baba","Erkek kardeş","Kız kardeş"],ar:["أب","أخ","أخت"],fa:["پدر","برادر","خواهر"],zh:["爸爸","兄弟","姐妹"],es:["Padre","Hermano","Hermana"],de:["Vater","Bruder","Schwester"]}},
        {type:"arrange",sentence:{ru:"Моя семья большая",en:"My family is big",uz:"Mening oilam katta",tr:"Ailem büyük",ar:"عائلتي كبيرة",fa:"خانواده‌ام بزرگ است",zh:"我的家庭很大",es:"Mi familia es grande",de:"Meine Familie ist groß"},answer:"My family is big",words:["My","family","is","big","small","their"]},
        {type:"fill",sentence:"I have two ___.",blank:"sisters",hint:{ru:"У меня две сестры.",en:"I have two sisters.",uz:"Mening ikki singlim bor.",tr:"İki kız kardeşim var.",ar:"عندي أختان.",fa:"دو خواهر دارم.",zh:"我有两个姐妹。",es:"Tengo dos hermanas.",de:"Ich habe zwei Schwestern."},options:["sisters","brothers","fathers","mothers"]},
        {type:"translate",source:{ru:"Мой папа врач.",en:"My father is a doctor.",uz:"Otam shifokor.",tr:"Babam doktor.",ar:"أبي طبيب.",fa:"پدرم دکتره.",zh:"我爸爸是医生。",es:"Mi padre es médico.",de:"Mein Vater ist Arzt."},answer:"my father is a doctor",accept:["my father is a doctor","my dad is a doctor"]},
        {type:"choose",targetWord:"Children",translations:{ru:"Дети",en:"Kids",uz:"Bolalar",tr:"Çocuklar",ar:"أطفال",fa:"بچه‌ها",zh:"孩子们",es:"Niños",de:"Kinder"},distractors:{ru:["Взрослые","Старики","Родители"],en:["Adults","Elderly","Parents"],uz:["Kattalar","Qariyalar","Ota-onalar"],tr:["Yetişkinler","Yaşlılar","Ebeveynler"],ar:["بالغون","كبار","والدان"],fa:["بزرگسالان","سالمندان","والدین"],zh:["成年人","老人","父母"],es:["Adultos","Ancianos","Padres"],de:["Erwachsene","Senioren","Eltern"]}},
      ]},
    { id:6, emoji:"🎨", titles:{ru:"Цвета",en:"Colors",uz:"Ranglar",tr:"Renkler",ar:"الألوان",fa:"رنگ‌ها",zh:"颜色",es:"Colores",de:"Farben"},
      exercises:[
        {type:"choose",targetWord:"Red",translations:{ru:"Красный",en:"Crimson",uz:"Qizil",tr:"Kırmızı",ar:"أحمر",fa:"قرمز",zh:"红色",es:"Rojo",de:"Rot"},distractors:{ru:["Синий","Зелёный","Жёлтый"],en:["Blue","Green","Yellow"],uz:["Ko'k","Yashil","Sariq"],tr:["Mavi","Yeşil","Sarı"],ar:["أزرق","أخضر","أصفر"],fa:["آبی","سبز","زرد"],zh:["蓝色","绿色","黄色"],es:["Azul","Verde","Amarillo"],de:["Blau","Grün","Gelb"]}},
        {type:"arrange",sentence:{ru:"Моя машина синяя",en:"My car is blue",uz:"Mening mashinam ko'k",tr:"Arabam mavi",ar:"سيارتي زرقاء",fa:"ماشینم آبی است",zh:"我的车是蓝色的",es:"Mi coche es azul",de:"Mein Auto ist blau"},answer:"My car is blue",words:["My","car","is","blue","red","green"]},
        {type:"fill",sentence:"The sky is ___.",blank:"blue",hint:{ru:"Небо голубое.",en:"The sky is blue.",uz:"Osmon ko'k.",tr:"Gökyüzü mavi.",ar:"السماء زرقاء.",fa:"آسمان آبی است.",zh:"天空是蓝色的。",es:"El cielo es azul.",de:"Der Himmel ist blau."},options:["blue","red","black","white"]},
        {type:"translate",source:{ru:"Белый и чёрный",en:"White and black",uz:"Oq va qora",tr:"Beyaz ve siyah",ar:"أبيض وأسود",fa:"سفید و مشکی",zh:"黑白",es:"Blanco y negro",de:"Weiß und Schwarz"},answer:"white and black",accept:["white and black","black and white"]},
      ]},
    { id:7, emoji:"⏰", titles:{ru:"Время",en:"Time",uz:"Vaqt",tr:"Zaman",ar:"الوقت",fa:"زمان",zh:"时间",es:"Tiempo",de:"Zeit"},
      exercises:[
        {type:"choose",targetWord:"Morning",translations:{ru:"Утро",en:"Dawn time",uz:"Ertalab",tr:"Sabah",ar:"صباح",fa:"صبح",zh:"早上",es:"Mañana",de:"Morgen"},distractors:{ru:["Вечер","Ночь","День"],en:["Evening","Night","Day"],uz:["Kechqurun","Tun","Kun"],tr:["Akşam","Gece","Gün"],ar:["مساء","ليل","نهار"],fa:["عصر","شب","روز"],zh:["晚上","夜晚","白天"],es:["Tarde","Noche","Día"],de:["Abend","Nacht","Tag"]}},
        {type:"arrange",sentence:{ru:"Сейчас три часа дня",en:"It is three o clock now",uz:"Hozir soat uch",tr:"Şu an saat üç",ar:"الآن الساعة الثالثة",fa:"الان ساعت سه است",zh:"现在是三点钟",es:"Ahora son las tres",de:"Es ist jetzt drei Uhr"},answer:"It is three o clock now",words:["It","is","three","o","clock","now","five","morning"]},
        {type:"fill",sentence:"See you ___!",blank:"tomorrow",hint:{ru:"Увидимся завтра!",en:"See you tomorrow!",uz:"Ertaga ko'rishguncha!",tr:"Yarın görüşürüz!",ar:"أراك غداً!",fa:"فردا می‌بینمت!",zh:"明天见！",es:"¡Hasta mañana!",de:"Bis morgen!"},options:["tomorrow","yesterday","never","soon"]},
        {type:"translate",source:{ru:"Который час?",en:"What time is it?",uz:"Soat necha?",tr:"Saat kaç?",ar:"كم الساعة؟",fa:"ساعت چنده؟",zh:"现在几点？",es:"¿Qué hora es?",de:"Wie spät ist es?"},answer:"what time is it",accept:["what time is it","what's the time"]},
      ]},
    { id:8, emoji:"🌦️", titles:{ru:"Погода",en:"Weather",uz:"Ob-havo",tr:"Hava durumu",ar:"الطقس",fa:"آب‌وهوا",zh:"天气",es:"Clima",de:"Wetter"},
      exercises:[
        {type:"choose",targetWord:"Hot",translations:{ru:"Жарко",en:"Warm",uz:"Issiq",tr:"Sıcak",ar:"حار",fa:"گرم",zh:"热",es:"Caliente",de:"Heiß"},distractors:{ru:["Холодно","Тепло","Ветрено"],en:["Cold","Warm","Windy"],uz:["Sovuq","Iliq","Shamolли"],tr:["Soğuk","Ilık","Rüzgarlı"],ar:["بارد","دافئ","عاصف"],fa:["سرد","گرم","بادی"],zh:["冷","暖","有风"],es:["Frío","Tibio","Ventoso"],de:["Kalt","Warm","Windig"]}},
        {type:"arrange",sentence:{ru:"Сегодня очень холодно",en:"It is very cold today",uz:"Bugun juda sovuq",tr:"Bugün çok soğuk",ar:"اليوم بارد جداً",fa:"امروز خیلی سرد است",zh:"今天很冷",es:"Hoy hace mucho frío",de:"Heute ist es sehr kalt"},answer:"It is very cold today",words:["It","is","very","cold","today","hot","tomorrow"]},
        {type:"fill",sentence:"It is ___ outside.",blank:"raining",hint:{ru:"На улице дождь.",en:"It is raining outside.",uz:"Tashqarida yomg'ir yog'yapti.",tr:"Dışarıda yağmur yağıyor.",ar:"المطر ينزل خارجاً.",fa:"بیرون باران میاد.",zh:"外面在下雨。",es:"Está lloviendo afuera.",de:"Es regnet draußen."},options:["raining","sunny","snowing","cloudy"]},
        {type:"translate",source:{ru:"Какая погода сегодня?",en:"What is the weather today?",uz:"Bugun ob-havo qanday?",tr:"Bugün hava nasıl?",ar:"كيف الطقس اليوم؟",fa:"امروز هوا چطوره؟",zh:"今天天气怎么样？",es:"¿Cómo está el clima hoy?",de:"Wie ist das Wetter heute?"},answer:"what is the weather today",accept:["what is the weather today","how is the weather today","what's the weather today"]},
      ]},
  ],

  "en-intermediate-extra": [
    { id:3, emoji:"✈️", titles:{ru:"Путешествия",en:"Travel",uz:"Sayohat",tr:"Seyahat",ar:"السفر",fa:"سفر",zh:"旅行",es:"Viaje",de:"Reise"},
      exercises:[
        {type:"choose",targetWord:"Passport",translations:{ru:"Паспорт",en:"Travel document",uz:"Pasport",tr:"Pasaport",ar:"جواز سفر",fa:"پاسپورت",zh:"护照",es:"Pasaporte",de:"Reisepass"},distractors:{ru:["Билет","Виза","Сумка"],en:["Ticket","Visa","Bag"],uz:["Chipta","Viza","Sumka"],tr:["Bilet","Vize","Çanta"],ar:["تذكرة","تأشيرة","حقيبة"],fa:["بلیت","ویزا","کیف"],zh:["票","签证","包"],es:["Boleto","Visa","Bolsa"],de:["Ticket","Visum","Tasche"]}},
        {type:"translate",source:{ru:"Где мой багаж?",en:"Where is my luggage?",uz:"Mening bagajim qayerda?",tr:"Bagajım nerede?",ar:"أين أمتعتي؟",fa:"چمدونم کجاست؟",zh:"我的行李在哪里？",es:"¿Dónde está mi equipaje?",de:"Wo ist mein Gepäck?"},answer:"where is my luggage",accept:["where is my luggage","where is my baggage"]},
        {type:"arrange",sentence:{ru:"Мой рейс задержан на два часа",en:"My flight is delayed by two hours",uz:"Mening reysim ikki soatga kechikdi",tr:"Uçuşum iki saat gecikti",ar:"رحلتي متأخرة ساعتين",fa:"پروازم دو ساعت تأخیر داره",zh:"我的航班延误了两个小时",es:"Mi vuelo está retrasado dos horas",de:"Mein Flug hat zwei Stunden Verspätung"},answer:"My flight is delayed by two hours",words:["My","flight","is","delayed","by","two","hours","minutes"]},
        {type:"fill",sentence:"I need to ___ my ticket.",blank:"book",hint:{ru:"Мне нужно забронировать билет.",en:"I need to book my ticket.",uz:"Chiptamni band qilishim kerak.",tr:"Biletimi rezerve etmem gerekiyor.",ar:"أحتاج حجز تذكرتي.",fa:"باید بلیتم رو رزرو کنم.",zh:"我需要预订我的票。",es:"Necesito reservar mi boleto.",de:"Ich muss mein Ticket buchen."},options:["book","cook","look","take"]},
      ]},
    { id:4, emoji:"🏥", titles:{ru:"Здоровье",en:"Health",uz:"Salomatlik",tr:"Sağlık",ar:"الصحة",fa:"سلامت",zh:"健康",es:"Salud",de:"Gesundheit"},
      exercises:[
        {type:"choose",targetWord:"Doctor",translations:{ru:"Врач",en:"Physician",uz:"Shifokor",tr:"Doktor",ar:"طبيب",fa:"دکتر",zh:"医生",es:"Médico",de:"Arzt"},distractors:{ru:["Медсестра","Пациент","Аптекарь"],en:["Nurse","Patient","Pharmacist"],uz:["Hamshira","Bemor","Dorixonachi"],tr:["Hemşire","Hasta","Eczacı"],ar:["ممرضة","مريض","صيدلاني"],fa:["پرستار","بیمار","داروساز"],zh:["护士","病人","药剂师"],es:["Enfermera","Paciente","Farmacéutico"],de:["Krankenschwester","Patient","Apotheker"]}},
        {type:"translate",source:{ru:"У меня болит голова.",en:"I have a headache.",uz:"Boshim og'riyapti.",tr:"Başım ağrıyor.",ar:"عندي صداع.",fa:"سردرد دارم.",zh:"我头痛。",es:"Me duele la cabeza.",de:"Ich habe Kopfschmerzen."},answer:"i have a headache",accept:["i have a headache","my head hurts"]},
        {type:"arrange",sentence:{ru:"Мне нужно к врачу",en:"I need to see a doctor",uz:"Shifokorga borishim kerak",tr:"Doktora gitmem gerekiyor",ar:"أحتاج رؤية طبيب",fa:"باید دکتر برم",zh:"我需要看医生",es:"Necesito ver a un médico",de:"Ich muss einen Arzt aufsuchen"},answer:"I need to see a doctor",words:["I","need","to","see","a","doctor","dentist","nurse"]},
        {type:"fill",sentence:"Take this ___ twice a day.",blank:"medicine",hint:{ru:"Принимайте это лекарство дважды в день.",en:"Take this medicine twice a day.",uz:"Bu doriни kuniga ikki marta qabul qiling.",tr:"Bu ilacı günde iki kez alın.",ar:"خذ هذا الدواء مرتين يومياً.",fa:"این دارو رو روزی دو بار بخور.",zh:"每天服用两次这种药。",es:"Tome esta medicina dos veces al día.",de:"Nehmen Sie diese Medizin zweimal täglich."},options:["medicine","food","water","book"]},
      ]},
    { id:5, emoji:"🛍️", titles:{ru:"Покупки",en:"Shopping",uz:"Xarid",tr:"Alışveriş",ar:"التسوق",fa:"خرید",zh:"购物",es:"Compras",de:"Einkaufen"},
      exercises:[
        {type:"choose",targetWord:"Expensive",translations:{ru:"Дорогой",en:"Costly",uz:"Qimmat",tr:"Pahalı",ar:"غالي",fa:"گرون",zh:"贵",es:"Caro",de:"Teuer"},distractors:{ru:["Дешёвый","Новый","Старый"],en:["Cheap","New","Old"],uz:["Arzon","Yangi","Eski"],tr:["Ucuz","Yeni","Eski"],ar:["رخيص","جديد","قديم"],fa:["ارزان","جدید","قدیمی"],zh:["便宜","新","旧"],es:["Barato","Nuevo","Viejo"],de:["Billig","Neu","Alt"]}},
        {type:"translate",source:{ru:"Можно дешевле?",en:"Can you make it cheaper?",uz:"Arzonroq bo'ladimi?",tr:"Daha ucuz olabilir mi?",ar:"هل يمكن أرخص؟",fa:"ارزون‌تر نمیشه؟",zh:"能便宜点吗？",es:"¿Puede ser más barato?",de:"Können Sie es billiger machen?"},answer:"can you make it cheaper",accept:["can you make it cheaper","can it be cheaper","is there a discount"]},
        {type:"fill",sentence:"Do you have this in my ___?",blank:"size",hint:{ru:"Есть это в моём размере?",en:"Do you have this in my size?",uz:"Mening o'lchamimda bormi?",tr:"Benim bedenimde var mı?",ar:"هل عندك هذا بمقاسي؟",fa:"این به سایز من هست؟",zh:"你们有我的尺码吗？",es:"¿Tienen esto en mi talla?",de:"Haben Sie das in meiner Größe?"},options:["size","color","price","style"]},
        {type:"arrange",sentence:{ru:"Я хотел бы вернуть это",en:"I would like to return this",uz:"Buni qaytarmoqchiman",tr:"Bunu iade etmek istiyorum",ar:"أريد إرجاع هذا",fa:"می‌خوام این رو پس بدم",zh:"我想退回这个",es:"Me gustaría devolver esto",de:"Ich möchte das zurückgeben"},answer:"I would like to return this",words:["I","would","like","to","return","this","buy","keep"]},
      ]},
    { id:6, emoji:"🍽️", titles:{ru:"В ресторане",en:"At the Restaurant",uz:"Restoranda",tr:"Restoranda",ar:"في المطعم",fa:"در رستوران",zh:"在餐厅",es:"En el restaurante",de:"Im Restaurant"},
      exercises:[
        {type:"choose",targetWord:"Menu",translations:{ru:"Меню",en:"Bill of fare",uz:"Menyu",tr:"Menü",ar:"قائمة الطعام",fa:"منو",zh:"菜单",es:"Menú",de:"Speisekarte"},distractors:{ru:["Счёт","Официант","Стол"],en:["Bill","Waiter","Table"],uz:["Hisob","Ofitsiant","Stol"],tr:["Hesap","Garson","Masa"],ar:["فاتورة","نادل","طاولة"],fa:["صورت‌حساب","گارسون","میز"],zh:["账单","服务员","桌子"],es:["Cuenta","Mesero","Mesa"],de:["Rechnung","Kellner","Tisch"]}},
        {type:"translate",source:{ru:"Принесите счёт, пожалуйста.",en:"Can I have the bill please?",uz:"Hisobni olib keling, iltimos.",tr:"Hesabı getirir misiniz?",ar:"الحساب من فضلك.",fa:"صورت‌حساب لطفاً.",zh:"请给我账单。",es:"La cuenta por favor.",de:"Die Rechnung bitte."},answer:"can i have the bill please",accept:["can i have the bill please","the bill please","check please"]},
        {type:"fill",sentence:"A table for ___, please.",blank:"two",hint:{ru:"Столик на двоих, пожалуйста.",en:"A table for two, please.",uz:"Ikki kishilik stol, iltimos.",tr:"İki kişilik masa, lütfen.",ar:"طاولة لشخصين من فضلك.",fa:"یه میز برای دو نفر لطفاً.",zh:"请给两个人的桌子。",es:"Una mesa para dos, por favor.",de:"Einen Tisch für zwei, bitte."},options:["two","five","ten","many"]},
      ]},
  ],

  "en-advanced-extra": [
    { id:2, emoji:"📊", titles:{ru:"Переговоры",en:"Negotiations",uz:"Muzokaralar",tr:"Müzakereler",ar:"مفاوضات",fa:"مذاکرات",zh:"谈判",es:"Negociaciones",de:"Verhandlungen"},
      exercises:[
        {type:"choose",targetWord:"Stakeholder",translations:{ru:"Заинтересованная сторона",en:"Interested party",uz:"Manfaatdor tomon",tr:"Paydaş",ar:"صاحب مصلحة",fa:"ذینفع",zh:"利益相关者",es:"Parte interesada",de:"Interessenvertreter"},distractors:{ru:["Инвестор","Клиент","Партнёр"],en:["Investor","Client","Partner"],uz:["Investor","Mijoz","Sherik"],tr:["Yatırımcı","Müşteri","Ortak"],ar:["مستثمر","عميل","شريك"],fa:["سرمایه‌گذار","مشتری","شریک"],zh:["投资者","客户","合伙人"],es:["Inversor","Cliente","Socio"],de:["Investor","Kunde","Partner"]}},
        {type:"translate",source:{ru:"Нам нужно согласовать условия.",en:"We need to align on the terms.",uz:"Shartlarni muvofiqlashtirish kerak.",tr:"Şartlar üzerinde anlaşmamız gerekiyor.",ar:"نحتاج إلى الاتفاق على الشروط.",fa:"باید روی شرایط توافق کنیم.",zh:"我们需要就条款达成一致。",es:"Necesitamos ponernos de acuerdo en los términos.",de:"Wir müssen uns über die Bedingungen einigen."},answer:"we need to align on the terms",accept:["we need to align on the terms","we need to agree on the terms"]},
        {type:"arrange",sentence:{ru:"Это взаимовыгодное партнёрство",en:"This is a mutually beneficial partnership",uz:"Bu o'zaro foydali hamkorlik",tr:"Bu karşılıklı yarar sağlayan bir ortaklık",ar:"هذه شراكة مفيدة للطرفين",fa:"این یک شراکت سودمند متقابل است",zh:"这是互利合作",es:"Esta es una asociación mutuamente beneficiosa",de:"Dies ist eine gegenseitig vorteilhafte Partnerschaft"},answer:"This is a mutually beneficial partnership",words:["This","is","a","mutually","beneficial","partnership","risky","failed"]},
        {type:"fill",sentence:"Let's ___ on this issue.",blank:"circle back",hint:{ru:"Давайте вернёмся к этому вопросу.",en:"Let's circle back on this issue.",uz:"Bu masalaga qaytaylik.",tr:"Bu konuya geri dönelim.",ar:"لنعود إلى هذه المسألة.",fa:"بیاید به این موضوع برگردیم.",zh:"让我们重新回到这个问题。",es:"Volvamos a este tema.",de:"Lassen Sie uns auf dieses Thema zurückkommen."},options:["circle back","give up","move on","skip"]},
      ]},
    { id:3, emoji:"💡", titles:{ru:"Презентации",en:"Presentations",uz:"Taqdimotlar",tr:"Sunumlar",ar:"عروض تقديمية",fa:"ارائه‌ها",zh:"演示文稿",es:"Presentaciones",de:"Präsentationen"},
      exercises:[
        {type:"choose",targetWord:"Compelling",translations:{ru:"Убедительный",en:"Convincing",uz:"Ishontirarli",tr:"İkna edici",ar:"مقنع",fa:"متقاعدکننده",zh:"有说服力",es:"Convincente",de:"Überzeugend"},distractors:{ru:["Скучный","Слабый","Короткий"],en:["Boring","Weak","Short"],uz:["Zerikarli","Zaif","Qisqa"],tr:["Sıkıcı","Zayıf","Kısa"],ar:["ممل","ضعيف","قصير"],fa:["کسل‌کننده","ضعیف","کوتاه"],zh:["无聊","弱","短"],es:["Aburrido","Débil","Corto"],de:["Langweilig","Schwach","Kurz"]}},
        {type:"translate",source:{ru:"Позвольте мне перейти к следующему слайду.",en:"Let me take you to the next slide.",uz:"Keling, keyingi slaydga o'tamiz.",tr:"Bir sonraki slayta geçelim.",ar:"دعني أنتقل إلى الشريحة التالية.",fa:"بذارید به اسلاید بعدی بریم.",zh:"让我带你到下一张幻灯片。",es:"Permítame pasar a la siguiente diapositiva.",de:"Lassen Sie mich zur nächsten Folie gehen."},answer:"let me take you to the next slide",accept:["let me take you to the next slide","let's move to the next slide"]},
        {type:"fill",sentence:"To ___ my point, here is the data.",blank:"illustrate",hint:{ru:"Чтобы проиллюстрировать мою точку зрения, вот данные.",en:"To illustrate my point, here is the data.",uz:"Fikrimni tasvirlash uchun, mana ma'lumotlar.",tr:"Noktamı göstermek için işte veriler.",ar:"لتوضيح وجهة نظري، إليك البيانات.",fa:"برای نشان دادن نظرم، اینجا داده‌ها هستند.",zh:"为了说明我的观点，这里是数据。",es:"Para ilustrar mi punto, aquí están los datos.",de:"Um meinen Punkt zu veranschaulichen, hier sind die Daten."},options:["illustrate","ignore","avoid","hide"]},
      ]},
    { id:4, emoji:"🤝", titles:{ru:"Деловое общение",en:"Business Communication",uz:"Biznes muloqot",tr:"İş iletişimi",ar:"التواصل التجاري",fa:"ارتباطات تجاری",zh:"商务沟通",es:"Comunicación empresarial",de:"Geschäftskommunikation"},
      exercises:[
        {type:"choose",targetWord:"Proactive",translations:{ru:"Проактивный",en:"Initiative-taking",uz:"Tashabbuskor",tr:"Proaktif",ar:"استباقي",fa:"پیش‌دستانه",zh:"主动的",es:"Proactivo",de:"Proaktiv"},distractors:{ru:["Пассивный","Ленивый","Медленный"],en:["Passive","Lazy","Slow"],uz:["Passiv","Dangasa","Sekin"],tr:["Pasif","Tembel","Yavaş"],ar:["سلبي","كسول","بطيء"],fa:["منفعل","تنبل","کند"],zh:["被动","懒","慢"],es:["Pasivo","Perezoso","Lento"],de:["Passiv","Faul","Langsam"]}},
        {type:"translate",source:{ru:"Я хотел бы запланировать звонок.",en:"I'd like to schedule a call.",uz:"Qo'ng'iroq rejalashtirmoqchiman.",tr:"Bir görüşme planlamak istiyorum.",ar:"أود جدولة مكالمة.",fa:"می‌خوام یه تماس برنامه‌ریزی کنم.",zh:"我想安排一个电话会议。",es:"Me gustaría programar una llamada.",de:"Ich möchte einen Anruf planen."},answer:"i'd like to schedule a call",accept:["i'd like to schedule a call","i would like to schedule a call"]},
        {type:"arrange",sentence:{ru:"Прошу прощения за задержку ответа",en:"I apologize for the delayed response",uz:"Kechikkan javob uchun uzr so'rayman",tr:"Geç cevap için özür dilerim",ar:"أعتذر عن التأخر في الرد",fa:"برای تأخیر در پاسخ عذرخواهی می‌کنم",zh:"为回复迟缓道歉",es:"Me disculpo por la demora en responder",de:"Ich entschuldige mich für die verzögerte Antwort"},answer:"I apologize for the delayed response",words:["I","apologize","for","the","delayed","response","quick","early"]},
      ]},
  ],

  // ══ TURKISH — more lessons ═══════════════════════════════════════════════════
  "tr-intermediate-extra": [
    { id:2, emoji:"✈️", titles:{ru:"Путешествия",en:"Travel",uz:"Sayohat",tr:"Seyahat",ar:"السفر",fa:"سفر",zh:"旅行",es:"Viaje",de:"Reise"},
      exercises:[
        {type:"choose",targetWord:"Uçak",translations:{ru:"Самолёт",en:"Airplane",uz:"Samolyot",tr:"Tayyare",ar:"طائرة",fa:"هواپیما",zh:"飞机",es:"Avión",de:"Flugzeug"},distractors:{ru:["Поезд","Автобус","Корабль"],en:["Train","Bus","Ship"],uz:["Poyezd","Avtobus","Kema"],tr:["Tren","Otobüs","Gemi"],ar:["قطار","حافلة","سفينة"],fa:["قطار","اتوبوس","کشتی"],zh:["火车","公交","船"],es:["Tren","Autobús","Barco"],de:["Zug","Bus","Schiff"]}},
        {type:"translate",source:{ru:"Где касса?",en:"Where is the ticket counter?",uz:"Kassa qayerda?",tr:"Where is the ticket counter?",ar:"أين شباك التذاكر؟",fa:"باجه کجاست؟",zh:"售票处在哪里？",es:"¿Dónde está la taquilla?",de:"Wo ist der Ticketschalter?"},answer:"bilet gişesi nerede",accept:["bilet gişesi nerede","kasa nerede"]},
        {type:"fill",sentence:"Pasaportumu ___ ettim.",blank:"kaybettim",hint:{ru:"Я потерял паспорт.",en:"I lost my passport.",uz:"Pasportimni yo'qotdim.",tr:"Pasaportumu kaybettim.",ar:"فقدت جواز سفري.",fa:"پاسپورتم رو گم کردم.",zh:"我把护照丢了。",es:"Perdí mi pasaporte.",de:"Ich habe meinen Reisepass verloren."},options:["kaybettim","buldum","aldım","verdim"]},
      ]},
    { id:3, emoji:"🏥", titles:{ru:"Здоровье",en:"Health",uz:"Salomatlik",tr:"Sağlık",ar:"الصحة",fa:"سلامت",zh:"健康",es:"Salud",de:"Gesundheit"},
      exercises:[
        {type:"choose",targetWord:"Hasta",translations:{ru:"Больной/Пациент",en:"Patient/Sick",uz:"Bemor",tr:"Doktor",ar:"مريض",fa:"بیمار",zh:"病人",es:"Enfermo",de:"Krank/Patient"},distractors:{ru:["Здоровый","Врач","Медсестра"],en:["Healthy","Doctor","Nurse"],uz:["Sog'lom","Shifokor","Hamshira"],tr:["Sağlıklı","Doktor","Hemşire"],ar:["صحيح","طبيب","ممرضة"],fa:["سالم","دکتر","پرستار"],zh:["健康","医生","护士"],es:["Sano","Médico","Enfermera"],de:["Gesund","Arzt","Krankenschwester"]}},
        {type:"translate",source:{ru:"У меня болит живот.",en:"My stomach hurts.",uz:"Qornim og'riyapti.",tr:"My stomach hurts.",ar:"بطني يؤلمني.",fa:"شکمم درد می‌کنه.",zh:"我肚子痛。",es:"Me duele el estómago.",de:"Mein Bauch tut weh."},answer:"karnım ağrıyor",accept:["karnım ağrıyor","midem ağrıyor"]},
        {type:"fill",sentence:"Doktora ___ lazım.",blank:"gitmem",hint:{ru:"Мне нужно пойти к врачу.",en:"I need to go to the doctor.",uz:"Shifokorga borishim kerak.",tr:"Doktora gitmem lazım.",ar:"يجب أن أذهب للطبيب.",fa:"باید دکتر برم.",zh:"我需要去看医生。",es:"Necesito ir al médico.",de:"Ich muss zum Arzt."},options:["gitmem","kalmam","yemem","içmem"]},
      ]},
  ],

  "tr-advanced": [
    { id:1, emoji:"📰", titles:{ru:"СМИ и политика",en:"Media & Politics",uz:"OAV va siyosat",tr:"Medya ve Siyaset",ar:"الإعلام والسياسة",fa:"رسانه و سیاست",zh:"媒体与政治",es:"Medios y política",de:"Medien und Politik"},
      exercises:[
        {type:"choose",targetWord:"Hükümet",translations:{ru:"Правительство",en:"Government",uz:"Hukumat",tr:"İdare",ar:"حكومة",fa:"دولت",zh:"政府",es:"Gobierno",de:"Regierung"},distractors:{ru:["Оппозиция","Парламент","Суд"],en:["Opposition","Parliament","Court"],uz:["Muxolafat","Parlament","Sud"],tr:["Muhalefet","Parlamento","Mahkeme"],ar:["معارضة","برلمان","محكمة"],fa:["مخالفان","پارلمان","دادگاه"],zh:["反对派","议会","法院"],es:["Oposición","Parlamento","Tribunal"],de:["Opposition","Parlament","Gericht"]}},
        {type:"translate",source:{ru:"Выборы состоятся в следующем месяце.",en:"Elections will take place next month.",uz:"Saylov kelasi oy bo'ladi.",tr:"Elections will take place next month.",ar:"الانتخابات ستجري الشهر القادم.",fa:"انتخابات ماه آینده برگزار می‌شه.",zh:"选举将在下个月举行。",es:"Las elecciones se realizarán el próximo mes.",de:"Die Wahlen finden nächsten Monat statt."},answer:"seçimler gelecek ay yapılacak",accept:["seçimler gelecek ay yapılacak","seçim gelecek ay"]},
        {type:"arrange",sentence:{ru:"Экономика растёт каждый год",en:"The economy grows every year",uz:"Iqtisodiyot har yili o'sadi",tr:"The economy grows every year",ar:"الاقتصاد ينمو كل عام",fa:"اقتصاد هر سال رشد می‌کنه",zh:"经济每年都在增长",es:"La economía crece cada año",de:"Die Wirtschaft wächst jedes Jahr"},answer:"Ekonomi her yıl büyüyor",words:["Ekonomi","her","yıl","büyüyor","küçülüyor","durdu"]},
        {type:"fill",sentence:"Müzakereler ___ sürdü.",blank:"uzun",hint:{ru:"Переговоры шли долго.",en:"The negotiations went on for a long time.",uz:"Muzokaralar uzoq davom etdi.",tr:"Müzakereler uzun sürdü.",ar:"استمرت المفاوضات طويلاً.",fa:"مذاکرات مدت طولانی ادامه یافت.",zh:"谈判持续了很长时间。",es:"Las negociaciones duraron mucho tiempo.",de:"Die Verhandlungen dauerten lange."},options:["uzun","kısa","hızlı","ani"]},
      ]},
    { id:2, emoji:"💼", titles:{ru:"Деловой турецкий",en:"Business Turkish",uz:"Biznes turk tili",tr:"İş Türkçesi",ar:"التركية للأعمال",fa:"ترکی تجاری",zh:"商务土耳其语",es:"Turco de negocios",de:"Geschäftstürkisch"},
      exercises:[
        {type:"choose",targetWord:"Sözleşme",translations:{ru:"Контракт/Договор",en:"Contract",uz:"Shartnoma",tr:"Anlaşma",ar:"عقد",fa:"قرارداد",zh:"合同",es:"Contrato",de:"Vertrag"},distractors:{ru:["Счёт","Отчёт","Письмо"],en:["Invoice","Report","Letter"],uz:["Hisob","Hisobot","Xat"],tr:["Fatura","Rapor","Mektup"],ar:["فاتورة","تقرير","رسالة"],fa:["فاکتور","گزارش","نامه"],zh:["发票","报告","信件"],es:["Factura","Informe","Carta"],de:["Rechnung","Bericht","Brief"]}},
        {type:"translate",source:{ru:"Нам нужно подписать контракт.",en:"We need to sign the contract.",uz:"Shartnomani imzolashimiz kerak.",tr:"We need to sign the contract.",ar:"نحتاج إلى توقيع العقد.",fa:"باید قرارداد رو امضا کنیم.",zh:"我们需要签署合同。",es:"Necesitamos firmar el contrato.",de:"Wir müssen den Vertrag unterzeichnen."},answer:"sözleşmeyi imzalamamız gerekiyor",accept:["sözleşmeyi imzalamamız gerekiyor","kontratı imzalamamız lazım"]},
        {type:"fill",sentence:"Bu teklif ___ geçerlidir.",blank:"bir hafta",hint:{ru:"Это предложение действительно одну неделю.",en:"This offer is valid for one week.",uz:"Bu taklif bir hafta amal qiladi.",tr:"Bu teklif bir hafta geçerlidir.",ar:"هذا العرض صالح لمدة أسبوع.",fa:"این پیشنهاد یک هفته اعتبار دارد.",zh:"这个报价有效期为一周。",es:"Esta oferta es válida por una semana.",de:"Dieses Angebot gilt für eine Woche."},options:["bir hafta","bir yıl","bir gün","bir saat"]},
      ]},
  ],
};

// Inject additional lessons into LESSON_DATA
Object.entries(ADDITIONAL_LESSONS).forEach(([key, lessons]) => {
  const baseKey = key.replace("-extra", "");
  if (!LESSON_DATA[baseKey]) LESSON_DATA[baseKey] = [];
  if (key.endsWith("-extra")) {
    LESSON_DATA[baseKey] = [...LESSON_DATA[baseKey], ...lessons];
  } else {
    LESSON_DATA[key] = lessons;
  }
});


// ─── MEGA CONTENT PACK ────────────────────────────────────────────────────────
const MEGA_LESSONS = {

  // ══ ENGLISH beginner extra pack 2 ══════════════════════════════════════════
  "en-beginner-extra2": [
    { id:9, emoji:"🏫", titles:{ru:"Школа",en:"School",uz:"Maktab",tr:"Okul",ar:"المدرسة",fa:"مدرسه",zh:"学校",es:"Escuela",de:"Schule"},
      exercises:[
        {type:"choose",targetWord:"Teacher",translations:{ru:"Учитель",en:"Educator",uz:"O'qituvchi",tr:"Öğretmen",ar:"معلم",fa:"معلم",zh:"老师",es:"Profesor",de:"Lehrer"},distractors:{ru:["Ученик","Директор","Родитель"],en:["Student","Principal","Parent"],uz:["O'quvchi","Direktor","Ota-ona"],tr:["Öğrenci","Müdür","Ebeveyn"],ar:["طالب","مدير","والد"],fa:["دانش‌آموز","مدیر","والدین"],zh:["学生","校长","家长"],es:["Estudiante","Director","Padre"],de:["Schüler","Direktor","Eltern"]}},
        {type:"arrange",sentence:{ru:"Я иду в школу каждый день",en:"I go to school every day",uz:"Men har kuni maktabga boraman",tr:"Her gün okula gidiyorum",ar:"أذهب إلى المدرسة كل يوم",fa:"هر روز مدرسه می‌رم",zh:"我每天去学校",es:"Voy a la escuela todos los días",de:"Ich gehe jeden Tag zur Schule"},answer:"I go to school every day",words:["I","go","to","school","every","day","week","month"]},
        {type:"fill",sentence:"I study ___ at school.",blank:"English",hint:{ru:"Я учу английский в школе.",en:"I study English at school.",uz:"Men maktabda ingliz tilini o'rganaman.",tr:"Okulda İngilizce çalışıyorum.",ar:"أدرس اللغة الإنجليزية في المدرسة.",fa:"در مدرسه انگلیسی می‌خونم.",zh:"我在学校学英语。",es:"Estudio inglés en la escuela.",de:"Ich lerne Englisch in der Schule."},options:["English","lunch","sports","music"]},
        {type:"translate",source:{ru:"Открой книгу на странице десять.",en:"Open your book to page ten.",uz:"Kitobingizni o'ninchi sahifaga oching.",tr:"Kitabınızı onuncu sayfaya açın.",ar:"افتح كتابك على الصفحة العاشرة.",fa:"کتابت رو صفحه ده باز کن.",zh:"把书翻到第十页。",es:"Abre tu libro en la página diez.",de:"Öffne dein Buch auf Seite zehn."},answer:"open your book to page ten",accept:["open your book to page ten","open the book to page ten"]},
      ]},
    { id:10, emoji:"🐶", titles:{ru:"Животные",en:"Animals",uz:"Hayvonlar",tr:"Hayvanlar",ar:"الحيوانات",fa:"حیوانات",zh:"动物",es:"Animales",de:"Tiere"},
      exercises:[
        {type:"choose",targetWord:"Dog",translations:{ru:"Собака",en:"Canine",uz:"It",tr:"Köpek",ar:"كلب",fa:"سگ",zh:"狗",es:"Perro",de:"Hund"},distractors:{ru:["Кошка","Птица","Рыба"],en:["Cat","Bird","Fish"],uz:["Mushuk","Qush","Baliq"],tr:["Kedi","Kuş","Balık"],ar:["قطة","طائر","سمكة"],fa:["گربه","پرنده","ماهی"],zh:["猫","鸟","鱼"],es:["Gato","Pájaro","Pez"],de:["Katze","Vogel","Fisch"]}},
        {type:"arrange",sentence:{ru:"У меня есть большая собака",en:"I have a big dog",uz:"Mening katta itim bor",tr:"Büyük bir köpeğim var",ar:"عندي كلب كبير",fa:"یه سگ بزرگ دارم",zh:"我有一只大狗",es:"Tengo un perro grande",de:"Ich habe einen großen Hund"},answer:"I have a big dog",words:["I","have","a","big","dog","small","cat"]},
        {type:"fill",sentence:"The ___ is sleeping on the sofa.",blank:"cat",hint:{ru:"Кошка спит на диване.",en:"The cat is sleeping on the sofa.",uz:"Mushuk divanda uxlayapti.",tr:"Kedi kanepede uyuyor.",ar:"القطة نائمة على الأريكة.",fa:"گربه روی مبل خوابیده.",zh:"猫在沙发上睡觉。",es:"El gato está durmiendo en el sofá.",de:"Die Katze schläft auf dem Sofa."},options:["cat","fish","bird","horse"]},
        {type:"translate",source:{ru:"Какое твоё любимое животное?",en:"What is your favourite animal?",uz:"Sevimli hayvoning nima?",tr:"En sevdiğin hayvan ne?",ar:"ما هو حيوانك المفضل؟",fa:"حیوان مورد علاقه‌ات چیه؟",zh:"你最喜欢什么动物？",es:"¿Cuál es tu animal favorito?",de:"Was ist dein Lieblingstier?"},answer:"what is your favourite animal",accept:["what is your favourite animal","what is your favorite animal"]},
      ]},
    { id:11, emoji:"🏠", titles:{ru:"Комнаты дома",en:"Rooms",uz:"Xonalar",tr:"Odalar",ar:"غرف المنزل",fa:"اتاق‌های خانه",zh:"房间",es:"Habitaciones",de:"Zimmer"},
      exercises:[
        {type:"choose",targetWord:"Kitchen",translations:{ru:"Кухня",en:"Cooking room",uz:"Oshxona",tr:"Mutfak",ar:"مطبخ",fa:"آشپزخانه",zh:"厨房",es:"Cocina",de:"Küche"},distractors:{ru:["Спальня","Ванная","Гостиная"],en:["Bedroom","Bathroom","Living room"],uz:["Yotoqxona","Hammom","Mehmonxona"],tr:["Yatak odası","Banyo","Oturma odası"],ar:["غرفة نوم","حمام","غرفة معيشة"],fa:["اتاق خواب","حمام","اتاق نشیمن"],zh:["卧室","浴室","客厅"],es:["Dormitorio","Baño","Sala"],de:["Schlafzimmer","Badezimmer","Wohnzimmer"]}},
        {type:"arrange",sentence:{ru:"Ванная комната наверху",en:"The bathroom is upstairs",uz:"Hammom yuqorida",tr:"Banyo yukarıda",ar:"الحمام في الطابق العلوي",fa:"حمام طبقه بالاست",zh:"浴室在楼上",es:"El baño está arriba",de:"Das Badezimmer ist oben"},answer:"The bathroom is upstairs",words:["The","bathroom","is","upstairs","downstairs","kitchen","bedroom"]},
        {type:"fill",sentence:"We eat in the ___.",blank:"dining room",hint:{ru:"Мы едим в столовой.",en:"We eat in the dining room.",uz:"Biz ovqat xonasida ovqatlanamiz.",tr:"Yemek odasında yiyoruz.",ar:"نأكل في غرفة الطعام.",fa:"توی اتاق ناهارخوری غذا می‌خوریم.",zh:"我们在餐厅吃饭。",es:"Comemos en el comedor.",de:"Wir essen im Esszimmer."},options:["dining room","garage","garden","roof"]},
        {type:"translate",source:{ru:"Моя спальня на втором этаже.",en:"My bedroom is on the second floor.",uz:"Yotoqxonam ikkinchi qavatda.",tr:"Yatak odam ikinci katta.",ar:"غرفتي في الطابق الثاني.",fa:"اتاق خوابم طبقه دومه.",zh:"我的卧室在二楼。",es:"Mi dormitorio está en el segundo piso.",de:"Mein Schlafzimmer ist im zweiten Stock."},answer:"my bedroom is on the second floor",accept:["my bedroom is on the second floor","my room is on the second floor"]},
      ]},
    { id:12, emoji:"💪", titles:{ru:"Спорт",en:"Sports",uz:"Sport",tr:"Spor",ar:"الرياضة",fa:"ورزش",zh:"体育",es:"Deportes",de:"Sport"},
      exercises:[
        {type:"choose",targetWord:"Football",translations:{ru:"Футбол",en:"Soccer",uz:"Futbol",tr:"Futbol",ar:"كرة القدم",fa:"فوتبال",zh:"足球",es:"Fútbol",de:"Fußball"},distractors:{ru:["Баскетбол","Теннис","Плавание"],en:["Basketball","Tennis","Swimming"],uz:["Basketbol","Tennis","Suzish"],tr:["Basketbol","Tenis","Yüzme"],ar:["كرة السلة","تنس","السباحة"],fa:["بسکتبال","تنیس","شنا"],zh:["篮球","网球","游泳"],es:["Baloncesto","Tenis","Natación"],de:["Basketball","Tennis","Schwimmen"]}},
        {type:"arrange",sentence:{ru:"Я играю в футбол каждую субботу",en:"I play football every Saturday",uz:"Men har shanba kuni futbol o'ynayman",tr:"Her Cumartesi futbol oynuyorum",ar:"أنا ألعب كرة القدم كل سبت",fa:"هر شنبه فوتبال بازی می‌کنم",zh:"我每周六踢足球",es:"Juego fútbol todos los sábados",de:"Ich spiele jeden Samstag Fußball"},answer:"I play football every Saturday",words:["I","play","football","every","Saturday","Sunday","basketball"]},
        {type:"fill",sentence:"She runs ___ kilometres every morning.",blank:"five",hint:{ru:"Она бегает пять километров каждое утро.",en:"She runs five kilometres every morning.",uz:"U har ertalab besh kilometr yuguradi.",tr:"Her sabah beş kilometre koşuyor.",ar:"تجري خمسة كيلومترات كل صباح.",fa:"هر صبح پنج کیلومتر می‌دوه.",zh:"她每天早上跑五公里。",es:"Corre cinco kilómetros cada mañana.",de:"Sie läuft jeden Morgen fünf Kilometer."},options:["five","ten","one","hundred"]},
        {type:"translate",source:{ru:"Кто твой любимый спортсмен?",en:"Who is your favourite athlete?",uz:"Sevimli sportchingiz kim?",tr:"En sevdiğin sporcu kim?",ar:"من هو رياضيك المفضل؟",fa:"ورزشکار مورد علاقه‌ات کیه؟",zh:"你最喜欢的运动员是谁？",es:"¿Quién es tu deportista favorito?",de:"Wer ist dein Lieblingssportler?"},answer:"who is your favourite athlete",accept:["who is your favourite athlete","who is your favorite athlete","who is your favourite sportsman"]},
      ]},
  ],

  // ══ ENGLISH intermediate extra pack 2 ══════════════════════════════════════
  "en-intermediate-extra2": [
    { id:7, emoji:"💻", titles:{ru:"Технологии",en:"Technology",uz:"Texnologiya",tr:"Teknoloji",ar:"التكنولوجيا",fa:"فناوری",zh:"技术",es:"Tecnología",de:"Technologie"},
      exercises:[
        {type:"choose",targetWord:"Software",translations:{ru:"Программное обеспечение",en:"Computer program",uz:"Dasturiy ta'minot",tr:"Yazılım",ar:"برنامج",fa:"نرم‌افزار",zh:"软件",es:"Software",de:"Software"},distractors:{ru:["Железо","Сеть","Данные"],en:["Hardware","Network","Data"],uz:["Texnik vosita","Tarmoq","Ma'lumot"],tr:["Donanım","Ağ","Veri"],ar:["جهاز","شبكة","بيانات"],fa:["سخت‌افزار","شبکه","داده"],zh:["硬件","网络","数据"],es:["Hardware","Red","Datos"],de:["Hardware","Netzwerk","Daten"]}},
        {type:"translate",source:{ru:"Мой компьютер завис.",en:"My computer has crashed.",uz:"Kompyuterim ishlamay qoldi.",tr:"Bilgisayarım çöktü.",ar:"تعطّل جهازي.",fa:"کامپیوترم هنگ کرده.",zh:"我的电脑崩溃了。",es:"Mi computadora se bloqueó.",de:"Mein Computer ist abgestürzt."},answer:"my computer has crashed",accept:["my computer has crashed","my computer crashed"]},
        {type:"arrange",sentence:{ru:"Мне нужно обновить программу",en:"I need to update the software",uz:"Dasturni yangilashim kerak",tr:"Yazılımı güncellemem gerekiyor",ar:"أحتاج تحديث البرنامج",fa:"باید نرم‌افزار رو آپدیت کنم",zh:"我需要更新软件",es:"Necesito actualizar el software",de:"Ich muss die Software aktualisieren"},answer:"I need to update the software",words:["I","need","to","update","the","software","delete","install"]},
        {type:"fill",sentence:"Can you ___ me the file?",blank:"send",hint:{ru:"Можешь отправить мне файл?",en:"Can you send me the file?",uz:"Menga faylni yubora olasizmi?",tr:"Dosyayı bana gönderebilir misin?",ar:"هل يمكنك إرسال الملف لي؟",fa:"می‌تونی فایل رو برام بفرستی؟",zh:"你能把文件发给我吗？",es:"¿Puedes enviarme el archivo?",de:"Kannst du mir die Datei schicken?"},options:["send","eat","buy","hide"]},
      ]},
    { id:8, emoji:"🏦", titles:{ru:"Банк и деньги",en:"Bank & Money",uz:"Bank va pul",tr:"Banka ve Para",ar:"البنك والمال",fa:"بانک و پول",zh:"银行和钱",es:"Banco y dinero",de:"Bank und Geld"},
      exercises:[
        {type:"choose",targetWord:"Account",translations:{ru:"Счёт",en:"Bank record",uz:"Hisob",tr:"Hesap",ar:"حساب",fa:"حساب",zh:"账户",es:"Cuenta",de:"Konto"},distractors:{ru:["Кредит","Наличные","Карта"],en:["Credit","Cash","Card"],uz:["Kredit","Naqd","Karta"],tr:["Kredi","Nakit","Kart"],ar:["ائتمان","نقد","بطاقة"],fa:["اعتبار","نقد","کارت"],zh:["信用","现金","卡"],es:["Crédito","Efectivo","Tarjeta"],de:["Kredit","Bargeld","Karte"]}},
        {type:"translate",source:{ru:"Я хочу открыть счёт.",en:"I would like to open an account.",uz:"Hisob ochmoqchiman.",tr:"Hesap açmak istiyorum.",ar:"أريد فتح حساب.",fa:"می‌خوام حساب باز کنم.",zh:"我想开一个账户。",es:"Me gustaría abrir una cuenta.",de:"Ich möchte ein Konto eröffnen."},answer:"i would like to open an account",accept:["i would like to open an account","i want to open an account"]},
        {type:"fill",sentence:"Can I ___ some money please?",blank:"withdraw",hint:{ru:"Можно снять деньги?",en:"Can I withdraw some money please?",uz:"Pul yechib olsam bo'ladimi?",tr:"Para çekebilir miyim?",ar:"هل يمكنني سحب بعض المال؟",fa:"می‌تونم پول برداشت کنم؟",zh:"我可以取一些钱吗？",es:"¿Puedo retirar algo de dinero?",de:"Kann ich etwas Geld abheben?"},options:["withdraw","deposit","hide","spend"]},
        {type:"arrange",sentence:{ru:"Обменный курс сегодня плохой",en:"The exchange rate is bad today",uz:"Bugun valyuta kursi yomon",tr:"Döviz kuru bugün kötü",ar:"سعر الصرف سيء اليوم",fa:"نرخ ارز امروز بده",zh:"今天的汇率很差",es:"El tipo de cambio está malo hoy",de:"Der Wechselkurs ist heute schlecht"},answer:"The exchange rate is bad today",words:["The","exchange","rate","is","bad","today","good","tomorrow"]},
      ]},
    { id:9, emoji:"🎓", titles:{ru:"Образование",en:"Education",uz:"Ta'lim",tr:"Eğitim",ar:"التعليم",fa:"آموزش",zh:"教育",es:"Educación",de:"Bildung"},
      exercises:[
        {type:"choose",targetWord:"University",translations:{ru:"Университет",en:"College",uz:"Universitet",tr:"Üniversite",ar:"جامعة",fa:"دانشگاه",zh:"大学",es:"Universidad",de:"Universität"},distractors:{ru:["Школа","Колледж","Детский сад"],en:["School","High school","Kindergarten"],uz:["Maktab","Kollej","Bog'cha"],tr:["Okul","Lise","Anaokulu"],ar:["مدرسة","ثانوية","روضة"],fa:["مدرسه","دبیرستان","مهدکودک"],zh:["学校","高中","幼儿园"],es:["Escuela","Instituto","Jardín"],de:["Schule","Gymnasium","Kindergarten"]}},
        {type:"translate",source:{ru:"Я изучаю медицину в университете.",en:"I study medicine at university.",uz:"Men universitetda tibbiyot o'qiyman.",tr:"Üniversitede tıp okuyorum.",ar:"أدرس الطب في الجامعة.",fa:"در دانشگاه پزشکی می‌خونم.",zh:"我在大学学医。",es:"Estudio medicina en la universidad.",de:"Ich studiere Medizin an der Universität."},answer:"i study medicine at university",accept:["i study medicine at university","i study medicine at the university"]},
        {type:"fill",sentence:"I ___ my exam last week.",blank:"passed",hint:{ru:"Я сдал экзамен на прошлой неделе.",en:"I passed my exam last week.",uz:"O'tgan hafta imtihondan o'tdim.",tr:"Geçen hafta sınavımı geçtim.",ar:"اجتزت امتحاني الأسبوع الماضي.",fa:"هفته پیش امتحانم رو پاس کردم.",zh:"我上周通过了考试。",es:"Aprobé mi examen la semana pasada.",de:"Ich habe letzte Woche meine Prüfung bestanden."},options:["passed","failed","missed","forgot"]},
      ]},
  ],

  // ══ JAPANESE more lessons ═══════════════════════════════════════════════════
  "ja-beginner-extra": [
    { id:4, emoji:"👨‍👩‍👧", titles:{ru:"Семья",en:"Family",uz:"Oila",tr:"Aile",ar:"العائلة",fa:"خانواده",zh:"家庭",es:"Familia",de:"Familie"},
      exercises:[
        {type:"choose",targetWord:"おかあさん",translations:{ru:"Мама",en:"Mother",uz:"Ona",tr:"Anne",ar:"أم",fa:"مادر",zh:"妈妈",es:"Madre",de:"Mutter"},distractors:{ru:["Папа","Брат","Сестра"],en:["Father","Brother","Sister"],uz:["Ota","Aka","Singil"],tr:["Baba","Erkek kardeş","Kız kardeş"],ar:["أب","أخ","أخت"],fa:["پدر","برادر","خواهر"],zh:["爸爸","兄弟","姐妹"],es:["Padre","Hermano","Hermana"],de:["Vater","Bruder","Schwester"]}},
        {type:"arrange",sentence:{ru:"Моя семья большая",en:"My family is big",uz:"Oilam katta",tr:"Ailem büyük",ar:"عائلتي كبيرة",fa:"خانواده‌ام بزرگه",zh:"我家人很多",es:"Mi familia es grande",de:"Meine Familie ist groß"},answer:"わたしの かぞく は おおきい です", words:["わたしの","かぞく","は","おおきい","です","ちいさい","たのしい"]},
        {type:"fill",sentence:"おとうさん は ___ です。",blank:"いしゃ",hint:{ru:"Папа — врач.",en:"Father is a doctor.",uz:"Otam shifokor.",tr:"Babam doktor.",ar:"أبي طبيب.",fa:"بابام دکتره.",zh:"爸爸是医生。",es:"Mi padre es médico.",de:"Vater ist Arzt."},options:["いしゃ","せんせい","がくせい","かいしゃいん"]},
      ]},
    { id:5, emoji:"🌆", titles:{ru:"Город",en:"City",uz:"Shahar",tr:"Şehir",ar:"المدينة",fa:"شهر",zh:"城市",es:"Ciudad",de:"Stadt"},
      exercises:[
        {type:"choose",targetWord:"えき",translations:{ru:"Вокзал/Станция",en:"Station",uz:"Stansiya",tr:"İstasyon",ar:"محطة",fa:"ایستگاه",zh:"车站",es:"Estación",de:"Bahnhof"},distractors:{ru:["Магазин","Школа","Больница"],en:["Shop","School","Hospital"],uz:["Do'kon","Maktab","Kasalxona"],tr:["Dükkan","Okul","Hastane"],ar:["متجر","مدرسة","مستشفى"],fa:["مغازه","مدرسه","بیمارستان"],zh:["商店","学校","医院"],es:["Tienda","Escuela","Hospital"],de:["Geschäft","Schule","Krankenhaus"]}},
        {type:"translate",source:{ru:"Где ближайшая станция метро?",en:"Where is the nearest station?",uz:"Eng yaqin stansiya qayerda?",tr:"En yakın istasyon nerede?",ar:"أين أقرب محطة؟",fa:"نزدیک‌ترین ایستگاه کجاست؟",zh:"最近的车站在哪里？",es:"¿Dónde está la estación más cercana?",de:"Wo ist die nächste Station?"},answer:"えき は どこ ですか",accept:["えきはどこですか","えき は どこ ですか"]},
        {type:"fill",sentence:"ここから ___ まで どのくらいですか。",blank:"えき",hint:{ru:"Как далеко отсюда до станции?",en:"How far is it from here to the station?",uz:"Bu yerdan stansiyagacha qancha?",tr:"Buradan istasyona ne kadar uzak?",ar:"كم المسافة من هنا إلى المحطة؟",fa:"از اینجا تا ایستگاه چقدره؟",zh:"从这里到车站有多远？",es:"¿Qué tan lejos está la estación desde aquí?",de:"Wie weit ist es von hier bis zur Station?"},options:["えき","うみ","やま","そら"]},
      ]},
    { id:6, emoji:"⏰", titles:{ru:"Время",en:"Time",uz:"Vaqt",tr:"Zaman",ar:"الوقت",fa:"زمان",zh:"时间",es:"Tiempo",de:"Zeit"},
      exercises:[
        {type:"choose",targetWord:"あさ",translations:{ru:"Утро",en:"Morning",uz:"Ertalab",tr:"Sabah",ar:"صباح",fa:"صبح",zh:"早上",es:"Mañana",de:"Morgen"},distractors:{ru:["Вечер","Ночь","День"],en:["Evening","Night","Afternoon"],uz:["Kechqurun","Tun","Tushdan keyin"],tr:["Akşam","Gece","Öğleden sonra"],ar:["مساء","ليل","بعد الظهر"],fa:["عصر","شب","بعدازظهر"],zh:["晚上","夜晚","下午"],es:["Tarde","Noche","Mediodía"],de:["Abend","Nacht","Nachmittag"]}},
        {type:"arrange",sentence:{ru:"Сейчас восемь часов утра",en:"It is eight in the morning",uz:"Hozir ertalab soat sakkiz",tr:"Şu an sabah sekiz",ar:"الآن الثامنة صباحاً",fa:"الان ساعت هشت صبحه",zh:"现在是早上八点",es:"Son las ocho de la mañana",de:"Es ist acht Uhr morgens"},answer:"いま は あさ の はち じ です",words:["いま","は","あさ","の","はち","じ","です","ご","ろく"]},
        {type:"translate",source:{ru:"Который час?",en:"What time is it?",uz:"Soat necha?",tr:"Saat kaç?",ar:"كم الساعة؟",fa:"ساعت چنده؟",zh:"现在几点？",es:"¿Qué hora es?",de:"Wie spät ist es?"},answer:"いま なんじ ですか",accept:["いまなんじですか","いま なんじ ですか"]},
      ]},
  ],

  "ja-intermediate": [
    { id:1, emoji:"💼", titles:{ru:"Работа",en:"Work",uz:"Ish",tr:"İş",ar:"العمل",fa:"کار",zh:"工作",es:"Trabajo",de:"Arbeit"},
      exercises:[
        {type:"choose",targetWord:"かいぎ",translations:{ru:"Совещание",en:"Meeting",uz:"Yig'ilish",tr:"Toplantı",ar:"اجتماع",fa:"جلسه",zh:"会议",es:"Reunión",de:"Besprechung"},distractors:{ru:["Перерыв","Обед","Отчёт"],en:["Break","Lunch","Report"],uz:["Tanaffus","Tushlik","Hisobot"],tr:["Mola","Öğle yemeği","Rapor"],ar:["استراحة","غداء","تقرير"],fa:["استراحت","ناهار","گزارش"],zh:["休息","午餐","报告"],es:["Descanso","Almuerzo","Informe"],de:["Pause","Mittagessen","Bericht"]}},
        {type:"translate",source:{ru:"Сегодня у меня много работы.",en:"I have a lot of work today.",uz:"Bugun ko'p ishim bor.",tr:"Bugün çok işim var.",ar:"عندي عمل كثير اليوم.",fa:"امروز کار زیادی دارم.",zh:"我今天有很多工作。",es:"Hoy tengo mucho trabajo.",de:"Ich habe heute viel Arbeit."},answer:"きょう は しごと が たくさん あります",accept:["きょうはしごとがたくさんあります","きょう しごと たくさん"]},
        {type:"arrange",sentence:{ru:"Встреча начнётся в три часа",en:"The meeting starts at three",uz:"Yig'ilish uchda boshlanadi",tr:"Toplantı üçte başlar",ar:"الاجتماع يبدأ في الثالثة",fa:"جلسه ساعت سه شروع می‌شه",zh:"会议三点开始",es:"La reunión empieza a las tres",de:"Das Meeting beginnt um drei Uhr"},answer:"かいぎ は さんじ に はじまります",words:["かいぎ","は","さんじ","に","はじまります","おわります","よじ"]},
        {type:"fill",sentence:"この プロジェクト の ___ は らいしゅう です。",blank:"しめきり",hint:{ru:"Дедлайн этого проекта — на следующей неделе.",en:"The deadline for this project is next week.",uz:"Bu loyihaning muddati keyingi hafta.",tr:"Bu projenin son tarihi gelecek hafta.",ar:"الموعد النهائي لهذا المشروع هو الأسبوع القادم.",fa:"ددلاین این پروژه هفته دیگه‌ست.",zh:"这个项目的截止日期是下周。",es:"El plazo de este proyecto es la próxima semana.",de:"Die Frist für dieses Projekt ist nächste Woche."},options:["しめきり","かいぎ","やすみ","しごと"]},
      ]},
    { id:2, emoji:"🛒", titles:{ru:"Покупки",en:"Shopping",uz:"Xarid",tr:"Alışveriş",ar:"التسوق",fa:"خرید",zh:"购物",es:"Compras",de:"Einkaufen"},
      exercises:[
        {type:"choose",targetWord:"いくら",translations:{ru:"Сколько стоит?",en:"How much?",uz:"Qancha?",tr:"Ne kadar?",ar:"بكم؟",fa:"چقدره؟",zh:"多少钱？",es:"¿Cuánto?",de:"Wie viel?"},distractors:{ru:["Где?","Когда?","Почему?"],en:["Where?","When?","Why?"],uz:["Qayerda?","Qachon?","Nima uchun?"],tr:["Nerede?","Ne zaman?","Neden?"],ar:["أين؟","متى؟","لماذا؟"],fa:["کجا؟","کِی؟","چرا؟"],zh:["哪里？","什么时候？","为什么？"],es:["¿Dónde?","¿Cuándo?","¿Por qué?"],de:["Wo?","Wann?","Warum?"]}},
        {type:"translate",source:{ru:"Это слишком дорого.",en:"This is too expensive.",uz:"Bu juda qimmat.",tr:"Bu çok pahalı.",ar:"هذا غالٍ جداً.",fa:"این خیلی گرونه.",zh:"这太贵了。",es:"Esto es demasiado caro.",de:"Das ist zu teuer."},answer:"これ は たかすぎます",accept:["これはたかすぎます","たかすぎます"]},
        {type:"fill",sentence:"もっと ___ の は ありますか。",blank:"やすい",hint:{ru:"Есть что-то подешевле?",en:"Do you have something cheaper?",uz:"Arzonroq narsa bormi?",tr:"Daha ucuz bir şey var mı?",ar:"هل عندك شيء أرخص؟",fa:"چیز ارزون‌تری دارید؟",zh:"有更便宜的吗？",es:"¿Tiene algo más barato?",de:"Haben Sie etwas Günstigeres?"},options:["やすい","たかい","おおきい","ちいさい"]},
      ]},
  ],

  // ══ KOREAN more lessons ══════════════════════════════════════════════════════
  "ko-beginner-extra": [
    { id:4, emoji:"👨‍👩‍👧", titles:{ru:"Семья",en:"Family",uz:"Oila",tr:"Aile",ar:"العائلة",fa:"خانواده",zh:"家庭",es:"Familia",de:"Familie"},
      exercises:[
        {type:"choose",targetWord:"어머니",translations:{ru:"Мама",en:"Mother",uz:"Ona",tr:"Anne",ar:"أم",fa:"مادر",zh:"妈妈",es:"Madre",de:"Mutter"},distractors:{ru:["Папа","Брат","Сестра"],en:["Father","Brother","Sister"],uz:["Ota","Aka","Singil"],tr:["Baba","Erkek kardeş","Kız kardeş"],ar:["أب","أخ","أخت"],fa:["پدر","برادر","خواهر"],zh:["爸爸","兄弟","姐妹"],es:["Padre","Hermano","Hermana"],de:["Vater","Bruder","Schwester"]}},
        {type:"arrange",sentence:{ru:"Моя семья очень добрая",en:"My family is very kind",uz:"Oilam juda mehribon",tr:"Ailem çok nazik",ar:"عائلتي طيبة جداً",fa:"خانواده‌ام خیلی مهربونن",zh:"我家人很善良",es:"Mi familia es muy amable",de:"Meine Familie ist sehr nett"},answer:"우리 가족은 정말 친절해요",words:["우리","가족은","정말","친절해요","나빠요","작아요"]},
        {type:"fill",sentence:"저는 ___ 가 한 명 있어요.",blank:"형",hint:{ru:"У меня есть один старший брат.",en:"I have one older brother.",uz:"Mening bitta katta akam bor.",tr:"Bir büyük erkek kardeşim var.",ar:"عندي أخ أكبر واحد.",fa:"یه داداش بزرگتر دارم.",zh:"我有一个哥哥。",es:"Tengo un hermano mayor.",de:"Ich habe einen älteren Bruder."},options:["형","언니","동생","친구"]},
      ]},
    { id:5, emoji:"🍚", titles:{ru:"Корейская еда",en:"Korean Food",uz:"Koreya ovqati",tr:"Kore yemeği",ar:"الطعام الكوري",fa:"غذای کره‌ای",zh:"韩国食物",es:"Comida coreana",de:"Koreanisches Essen"},
      exercises:[
        {type:"choose",targetWord:"비빔밥",translations:{ru:"Пибимпаб (рис с овощами)",en:"Mixed rice bowl",uz:"Aralash guruch taomi",tr:"Karışık pirinç yemeği",ar:"أرز مخلوط",fa:"برنج مخلوط",zh:"拌饭",es:"Arroz mezclado",de:"Gemischter Reis"},distractors:{ru:["Суп","Лапша","Барбекю"],en:["Soup","Noodles","BBQ"],uz:["Sho'rva","Noodle","Barbekyu"],tr:["Çorba","Noodle","Barbekü"],ar:["شوربة","نودلز","شواء"],fa:["سوپ","نودل","باربیکیو"],zh:["汤","面条","烧烤"],es:["Sopa","Fideos","Barbacoa"],de:["Suppe","Nudeln","Barbecue"]}},
        {type:"translate",source:{ru:"Это очень острое!",en:"This is very spicy!",uz:"Bu juda achchiq!",tr:"Bu çok baharatlı!",ar:"هذا حار جداً!",fa:"این خیلی تنده!",zh:"这非常辣！",es:"¡Esto está muy picante!",de:"Das ist sehr scharf!"},answer:"이거 정말 매워요",accept:["이거 정말 매워요","이것은 매우 맵습니다"]},
        {type:"fill",sentence:"삼겹살 ___ 인분 주세요.",blank:"이",hint:{ru:"Дайте, пожалуйста, самгёпсаль на двоих.",en:"Two servings of samgyeopsal please.",uz:"Ikki porsiya samgyeopsal bering.",tr:"İki porsiyon samgyeopsal lütfen.",ar:"طبقين من السامغيوبسال من فضلك.",fa:"دو پرس سامگیوپسال لطفاً.",zh:"请来两份五花肉。",es:"Dos porciones de samgyeopsal por favor.",de:"Zwei Portionen Samgyeopsal bitte."},options:["이","삼","사","오"]},
      ]},
    { id:6, emoji:"🚇", titles:{ru:"Транспорт",en:"Transport",uz:"Transport",tr:"Ulaşım",ar:"المواصلات",fa:"حمل‌ونقل",zh:"交通",es:"Transporte",de:"Transport"},
      exercises:[
        {type:"choose",targetWord:"지하철",translations:{ru:"Метро",en:"Subway",uz:"Metro",tr:"Metro",ar:"مترو",fa:"مترو",zh:"地铁",es:"Metro",de:"U-Bahn"},distractors:{ru:["Автобус","Такси","Поезд"],en:["Bus","Taxi","Train"],uz:["Avtobus","Taksi","Poyezd"],tr:["Otobüs","Taksi","Tren"],ar:["حافلة","تاكسي","قطار"],fa:["اتوبوس","تاکسی","قطار"],zh:["公交","出租车","火车"],es:["Autobús","Taxi","Tren"],de:["Bus","Taxi","Zug"]}},
        {type:"arrange",sentence:{ru:"На метро быстрее",en:"The subway is faster",uz:"Metro tezroq",tr:"Metro daha hızlı",ar:"المترو أسرع",fa:"مترو سریع‌تره",zh:"坐地铁更快",es:"El metro es más rápido",de:"Die U-Bahn ist schneller"},answer:"지하철이 더 빨라요",words:["지하철이","더","빨라요","느려요","버스가","택시가"]},
        {type:"fill",sentence:"다음 ___ 은 어디서 타요?",blank:"버스",hint:{ru:"Где садиться на следующий автобус?",en:"Where do I take the next bus?",uz:"Keyingi avtobuska qayerda chiqaman?",tr:"Bir sonraki otobüse nereden binerim?",ar:"أين أركب الحافلة القادمة؟",fa:"اتوبوس بعدی رو از کجا سوار بشم؟",zh:"在哪里乘下一班公交车？",es:"¿Dónde tomo el próximo autobús?",de:"Wo steige ich in den nächsten Bus ein?"},options:["버스","지하철","기차","비행기"]},
      ]},
  ],

  "ko-intermediate": [
    { id:1, emoji:"💼", titles:{ru:"Работа",en:"Work",uz:"Ish",tr:"İş",ar:"العمل",fa:"کار",zh:"工作",es:"Trabajo",de:"Arbeit"},
      exercises:[
        {type:"choose",targetWord:"회의",translations:{ru:"Совещание",en:"Meeting",uz:"Yig'ilish",tr:"Toplantı",ar:"اجتماع",fa:"جلسه",zh:"会议",es:"Reunión",de:"Besprechung"},distractors:{ru:["Обед","Перерыв","Отчёт"],en:["Lunch","Break","Report"],uz:["Tushlik","Tanaffus","Hisobot"],tr:["Öğle","Mola","Rapor"],ar:["غداء","استراحة","تقرير"],fa:["ناهار","استراحت","گزارش"],zh:["午餐","休息","报告"],es:["Almuerzo","Descanso","Informe"],de:["Mittagessen","Pause","Bericht"]}},
        {type:"translate",source:{ru:"Когда у нас следующая встреча?",en:"When is our next meeting?",uz:"Keyingi yig'ilishimiz qachon?",tr:"Bir sonraki toplantımız ne zaman?",ar:"متى اجتماعنا القادم؟",fa:"جلسه بعدیمون کِیه؟",zh:"我们下次会议是什么时候？",es:"¿Cuándo es nuestra próxima reunión?",de:"Wann ist unser nächstes Meeting?"},answer:"다음 회의가 언제예요",accept:["다음 회의가 언제예요","다음 미팅이 언제예요"]},
        {type:"fill",sentence:"이 ___ 의 마감일은 금요일이에요.",blank:"프로젝트",hint:{ru:"Дедлайн этого проекта — пятница.",en:"The deadline for this project is Friday.",uz:"Bu loyihaning muddati juma.",tr:"Bu projenin son tarihi Cuma.",ar:"الموعد النهائي لهذا المشروع هو الجمعة.",fa:"ددلاین این پروژه جمعه‌ست.",zh:"这个项目的截止日期是周五。",es:"El plazo de este proyecto es el viernes.",de:"Die Frist für dieses Projekt ist Freitag."},options:["프로젝트","회의","보고서","계획"]},
        {type:"arrange",sentence:{ru:"Я работаю в этой компании три года",en:"I have worked at this company for three years",uz:"Men bu kompaniyada uch yildan beri ishlayman",tr:"Bu şirkette üç yıldır çalışıyorum",ar:"أعمل في هذه الشركة منذ ثلاث سنوات",fa:"سه ساله توی این شرکت کار می‌کنم",zh:"我在这家公司工作了三年",es:"Llevo tres años trabajando en esta empresa",de:"Ich arbeite seit drei Jahren in diesem Unternehmen"},answer:"저는 이 회사에서 3년째 일하고 있어요",words:["저는","이","회사에서","3년째","일하고","있어요","있었어요"]},
      ]},
  ],

  // ══ ARABIC more lessons ══════════════════════════════════════════════════════
  "ar-beginner-extra": [
    { id:4, emoji:"👨‍👩‍👧", titles:{ru:"Семья",en:"Family",uz:"Oila",tr:"Aile",ar:"العائلة",fa:"خانواده",zh:"家庭",es:"Familia",de:"Familie"},
      exercises:[
        {type:"choose",targetWord:"أم",translations:{ru:"Мама",en:"Mother",uz:"Ona",tr:"Anne",ar:"والدة",fa:"مادر",zh:"妈妈",es:"Madre",de:"Mutter"},distractors:{ru:["Папа","Брат","Сестра"],en:["Father","Brother","Sister"],uz:["Ota","Aka","Singil"],tr:["Baba","Erkek kardeş","Kız kardeş"],ar:["أب","أخ","أخت"],fa:["پدر","برادر","خواهر"],zh:["爸爸","兄弟","姐妹"],es:["Padre","Hermano","Hermana"],de:["Vater","Bruder","Schwester"]}},
        {type:"translate",source:{ru:"Моя семья живёт в Ташкенте.",en:"My family lives in Tashkent.",uz:"Oilam Toshkentda yashaydi.",tr:"Ailem Taşkent'te yaşıyor.",ar:"عائلتي تعيش في طشقند.",fa:"خانواده‌ام توی تاشکند زندگی می‌کنند.",zh:"我家住在塔什干。",es:"Mi familia vive en Tashkent.",de:"Meine Familie lebt in Taschkent."},answer:"عائلتي تعيش في طشقند",accept:["عائلتي تعيش في طشقند","أسرتي تسكن في طشقند"]},
        {type:"fill",sentence:"عندي ___ أخوات.",blank:"ثلاث",hint:{ru:"У меня три сестры.",en:"I have three sisters.",uz:"Mening uch singlim bor.",tr:"Üç kız kardeşim var.",ar:"عندي ثلاث أخوات.",fa:"سه تا خواهر دارم.",zh:"我有三个姐妹。",es:"Tengo tres hermanas.",de:"Ich habe drei Schwestern."},options:["ثلاث","عشر","واحدة","مئة"]},
      ]},
    { id:5, emoji:"🕌", titles:{ru:"Культура",en:"Culture",uz:"Madaniyat",tr:"Kültür",ar:"الثقافة",fa:"فرهنگ",zh:"文化",es:"Cultura",de:"Kultur"},
      exercises:[
        {type:"choose",targetWord:"مسجد",translations:{ru:"Мечеть",en:"Mosque",uz:"Masjid",tr:"Cami",ar:"معبد",fa:"مسجد",zh:"清真寺",es:"Mezquita",de:"Moschee"},distractors:{ru:["Церковь","Храм","Синагога"],en:["Church","Temple","Synagogue"],uz:["Cherkov","Ibodatxona","Sinagoga"],tr:["Kilise","Tapınak","Sinagog"],ar:["كنيسة","معبد","كنيس"],fa:["کلیسا","معبد","کنیسه"],zh:["教堂","寺庙","犹太教堂"],es:["Iglesia","Templo","Sinagoga"],de:["Kirche","Tempel","Synagoge"]}},
        {type:"arrange",sentence:{ru:"Рамадан — священный месяц",en:"Ramadan is the holy month",uz:"Ramazon muqaddas oy",tr:"Ramazan kutsal bir ay",ar:"رمضان هو الشهر المقدس",fa:"رمضان ماه مقدسه",zh:"斋月是神圣的月份",es:"Ramadán es el mes sagrado",de:"Ramadan ist der heilige Monat"},answer:"رمضان هو الشهر المقدس",words:["رمضان","هو","الشهر","المقدس","الكريم","الأول"]},
        {type:"fill",sentence:"أنا ___ المطعم العربي.",blank:"أحب",hint:{ru:"Я люблю арабский ресторан.",en:"I love the Arabic restaurant.",uz:"Men arab restoranini yaxshi ko'raman.",tr:"Arap restoranını seviyorum.",ar:"أنا أحب المطعم العربي.",fa:"رستوران عربی دوست دارم.",zh:"我喜欢阿拉伯餐厅。",es:"Me encanta el restaurante árabe.",de:"Ich liebe das arabische Restaurant."},options:["أحب","أكره","أزور","أترك"]},
      ]},
  ],

  "ar-intermediate": [
    { id:1, emoji:"💼", titles:{ru:"Работа",en:"Work",uz:"Ish",tr:"İş",ar:"العمل",fa:"کار",zh:"工作",es:"Trabajo",de:"Arbeit"},
      exercises:[
        {type:"choose",targetWord:"اجتماع",translations:{ru:"Встреча",en:"Meeting",uz:"Yig'ilish",tr:"Toplantı",ar:"لقاء",fa:"جلسه",zh:"会议",es:"Reunión",de:"Treffen"},distractors:{ru:["Перерыв","Вечеринка","Обед"],en:["Break","Party","Lunch"],uz:["Tanaffus","Ziyofat","Tushlik"],tr:["Mola","Parti","Öğle yemeği"],ar:["استراحة","حفلة","غداء"],fa:["استراحت","مهمانی","ناهار"],zh:["休息","派对","午餐"],es:["Descanso","Fiesta","Almuerzo"],de:["Pause","Party","Mittagessen"]}},
        {type:"translate",source:{ru:"Когда следующее совещание?",en:"When is the next meeting?",uz:"Keyingi yig'ilish qachon?",tr:"Bir sonraki toplantı ne zaman?",ar:"متى الاجتماع القادم؟",fa:"جلسه بعدی کِیه؟",zh:"下次会议是什么时候？",es:"¿Cuándo es la próxima reunión?",de:"Wann ist das nächste Meeting?"},answer:"متى الاجتماع القادم",accept:["متى الاجتماع القادم","متى الاجتماع التالي"]},
        {type:"arrange",sentence:{ru:"Мой коллега очень опытный",en:"My colleague is very experienced",uz:"Hamkashim juda tajribali",tr:"Meslektaşım çok deneyimli",ar:"زميلي ذو خبرة كبيرة",fa:"همکارم خیلی با تجربه‌ست",zh:"我的同事很有经验",es:"Mi colega tiene mucha experiencia",de:"Mein Kollege ist sehr erfahren"},answer:"زميلي لديه خبرة كبيرة",words:["زميلي","لديه","خبرة","كبيرة","قليلة","جديد"]},
        {type:"fill",sentence:"أحتاج إلى ___ التقرير اليوم.",blank:"إنهاء",hint:{ru:"Мне нужно закончить отчёт сегодня.",en:"I need to finish the report today.",uz:"Bugun hisobotni tugatishim kerak.",tr:"Bugün raporu bitirmem gerekiyor.",ar:"أحتاج إلى إنهاء التقرير اليوم.",fa:"باید امروز گزارش رو تموم کنم.",zh:"我今天需要完成报告。",es:"Necesito terminar el informe hoy.",de:"Ich muss heute den Bericht fertigstellen."},options:["إنهاء","بدء","تأجيل","حذف"]},
      ]},
    { id:2, emoji:"✈️", titles:{ru:"Путешествия",en:"Travel",uz:"Sayohat",tr:"Seyahat",ar:"السفر",fa:"سفر",zh:"旅行",es:"Viaje",de:"Reise"},
      exercises:[
        {type:"choose",targetWord:"مطار",translations:{ru:"Аэропорт",en:"Airport",uz:"Aeroport",tr:"Havalimanı",ar:"مطار رئيسي",fa:"فرودگاه",zh:"机场",es:"Aeropuerto",de:"Flughafen"},distractors:{ru:["Вокзал","Порт","Автостанция"],en:["Train station","Port","Bus station"],uz:["Vokzal","Port","Avtobekát"],tr:["Tren garı","Liman","Otobüs terminali"],ar:["محطة قطار","ميناء","محطة حافلات"],fa:["ایستگاه قطار","بندر","پایانه اتوبوس"],zh:["火车站","港口","汽车站"],es:["Estación de tren","Puerto","Terminal"],de:["Bahnhof","Hafen","Busbahnhof"]}},
        {type:"translate",source:{ru:"Мой самолёт вылетает в шесть утра.",en:"My flight departs at six in the morning.",uz:"Mening reysim ertalab oltida jo'naydi.",tr:"Uçuşum sabah altıda kalkıyor.",ar:"رحلتي تغادر في السادسة صباحاً.",fa:"پروازم ساعت شش صبح حرکت می‌کنه.",zh:"我的航班早上六点起飞。",es:"Mi vuelo sale a las seis de la mañana.",de:"Mein Flug startet um sechs Uhr morgens."},answer:"رحلتي تغادر في السادسة صباحاً",accept:["رحلتي تغادر في السادسة صباحاً","طائرتي تقلع في السادسة"]},
        {type:"fill",sentence:"أين ___ جواز السفر؟",blank:"أستطيع تجديد",hint:{ru:"Где я могу обновить паспорт?",en:"Where can I renew my passport?",uz:"Pasportimni qayerda yangilasam bo'ladi?",tr:"Pasaportumu nerede yenileyebilirim?",ar:"أين أستطيع تجديد جواز السفر؟",fa:"کجا می‌تونم پاسپورتم رو تمدید کنم؟",zh:"在哪里可以更新护照？",es:"¿Dónde puedo renovar mi pasaporte?",de:"Wo kann ich meinen Reisepass erneuern?"},options:["أستطيع تجديد","يمكن شراء","أريد بيع","أحتاج كسر"]},
      ]},
  ],

  // ══ FARSI more lessons ═══════════════════════════════════════════════════════
  "fa-beginner-extra": [
    { id:4, emoji:"👨‍👩‍👧", titles:{ru:"Семья",en:"Family",uz:"Oila",tr:"Aile",ar:"العائلة",fa:"خانواده",zh:"家庭",es:"Familia",de:"Familie"},
      exercises:[
        {type:"choose",targetWord:"مادر",translations:{ru:"Мама",en:"Mother",uz:"Ona",tr:"Anne",ar:"أم",fa:"مامان",zh:"妈妈",es:"Madre",de:"Mutter"},distractors:{ru:["Папа","Брат","Сестра"],en:["Father","Brother","Sister"],uz:["Ota","Aka","Singil"],tr:["Baba","Erkek kardeş","Kız kardeş"],ar:["أب","أخ","أخت"],fa:["پدر","برادر","خواهر"],zh:["爸爸","兄弟","姐妹"],es:["Padre","Hermano","Hermana"],de:["Vater","Bruder","Schwester"]}},
        {type:"arrange",sentence:{ru:"Моя мама готовит очень вкусно",en:"My mom cooks very well",uz:"Onam juda yaxshi taom pishiradi",tr:"Annem çok güzel yemek yapar",ar:"أمي تطبخ بشكل رائع",fa:"مامانم خیلی خوب آشپزی می‌کنه",zh:"我妈妈做饭很好吃",es:"Mi mamá cocina muy bien",de:"Meine Mutter kocht sehr gut"},answer:"مامانم خیلی خوب آشپزی می‌کنه",words:["مامانم","خیلی","خوب","آشپزی","می‌کنه","بدم","نمی‌کنه"]},
        {type:"fill",sentence:"دو تا ___ دارم.",blank:"خواهر",hint:{ru:"У меня две сестры.",en:"I have two sisters.",uz:"Ikki singlim bor.",tr:"İki kız kardeşim var.",ar:"عندي أختان.",fa:"دو تا خواهر دارم.",zh:"我有两个姐妹。",es:"Tengo dos hermanas.",de:"Ich habe zwei Schwestern."},options:["خواهر","برادر","دوست","همکار"]},
        {type:"translate",source:{ru:"Папа работает инженером.",en:"Dad works as an engineer.",uz:"Dada muhandis bo'lib ishlaydi.",tr:"Babam mühendis olarak çalışıyor.",ar:"أبي يعمل مهندساً.",fa:"بابام مهندسه.",zh:"爸爸是工程师。",es:"Papá trabaja como ingeniero.",de:"Papa arbeitet als Ingenieur."},answer:"بابام مهندسه",accept:["بابام مهندسه","پدرم مهندس است"]},
      ]},
    { id:5, emoji:"🍽️", titles:{ru:"Иранская кухня",en:"Iranian Food",uz:"Eron oshxonasi",tr:"İran mutfağı",ar:"المطبخ الإيراني",fa:"غذای ایرانی",zh:"伊朗食物",es:"Comida iraní",de:"Iranisches Essen"},
      exercises:[
        {type:"choose",targetWord:"چلو کباب",translations:{ru:"Чело-кебаб (рис с кебабом)",en:"Rice with kebab",uz:"Guruch va kabob",tr:"Pilavlı kebap",ar:"أرز مع الكباب",fa:"کباب با برنج",zh:"米饭配烤肉",es:"Arroz con kebab",de:"Reis mit Kebab"},distractors:{ru:["Суп","Салат","Плов"],en:["Soup","Salad","Pilaf"],uz:["Sho'rva","Salat","Palov"],tr:["Çorba","Salata","Pilav"],ar:["شوربة","سلطة","رز"],fa:["سوپ","سالاد","پلو"],zh:["汤","沙拉","抓饭"],es:["Sopa","Ensalada","Arroz"],de:["Suppe","Salat","Pilaw"]}},
        {type:"translate",source:{ru:"Это очень вкусно, приятного аппетита!",en:"This is delicious, enjoy your meal!",uz:"Bu juda mazali, xo'sh ishtaha!",tr:"Bu çok lezzetli, afiyet olsun!",ar:"هذا لذيذ، بالهناء والشفاء!",fa:"نوش جان!",zh:"这很美味，请慢用！",es:"¡Esto está delicioso, buen provecho!",de:"Das ist köstlich, guten Appetit!"},answer:"نوش جان",accept:["نوش جان","میل کنید"]},
        {type:"fill",sentence:"یه ___ چای می‌خوای؟",blank:"فنجون",hint:{ru:"Хочешь чашку чая?",en:"Do you want a cup of tea?",uz:"Bir piyola choy xohlaysanmi?",tr:"Bir fincan çay ister misin?",ar:"هل تريد فنجاناً من الشاي؟",fa:"یه فنجون چای می‌خوای؟",zh:"你要一杯茶吗？",es:"¿Quieres una taza de té?",de:"Möchtest du eine Tasse Tee?"},options:["فنجون","بطری","لیوان","کیلو"]},
      ]},
  ],

  // ══ UZBEK more lessons ════════════════════════════════════════════════════════
  "uz-beginner-extra": [
    { id:4, emoji:"👨‍👩‍👧", titles:{ru:"Семья",en:"Family",uz:"Oila",tr:"Aile",ar:"العائلة",fa:"خانواده",zh:"家庭",es:"Familia",de:"Familie"},
      exercises:[
        {type:"choose",targetWord:"Ona",translations:{ru:"Мама",en:"Mother",uz:"Onajon",tr:"Anne",ar:"أم",fa:"مادر",zh:"妈妈",es:"Madre",de:"Mutter"},distractors:{ru:["Папа","Брат","Сестра"],en:["Father","Brother","Sister"],uz:["Ota","Aka","Singil"],tr:["Baba","Erkek kardeş","Kız kardeş"],ar:["أب","أخ","أخت"],fa:["پدر","برادر","خواهر"],zh:["爸爸","兄弟","姐妹"],es:["Padre","Hermano","Hermana"],de:["Vater","Bruder","Schwester"]}},
        {type:"arrange",sentence:{ru:"Моя семья живёт в Ташкенте",en:"My family lives in Tashkent",uz:"Oilam Toshkentda yashaydi",tr:"Ailem Taşkent'te yaşıyor",ar:"عائلتي تعيش في طشقند",fa:"خانواده‌ام توی تاشکند زندگی می‌کنند",zh:"我家住在塔什干",es:"Mi familia vive en Tashkent",de:"Meine Familie lebt in Taschkent"},answer:"Oilam Toshkentda yashaydi",words:["Oilam","Toshkentda","yashaydi","Samarqandda","ishlaydi","o'qiydi"]},
        {type:"fill",sentence:"Mening ___ ikkita bor.",blank:"singlim",hint:{ru:"У меня две младшие сестры.",en:"I have two younger sisters.",uz:"Mening ikkita singlim bor.",tr:"İki küçük kız kardeşim var.",ar:"عندي أختان أصغر مني.",fa:"دو تا خواهر کوچکتر دارم.",zh:"我有两个妹妹。",es:"Tengo dos hermanas menores.",de:"Ich habe zwei jüngere Schwestern."},options:["singlim","akam","ukam","doʻstim"]},
        {type:"translate",source:{ru:"Папа — врач, мама — учитель.",en:"Dad is a doctor, mom is a teacher.",uz:"Dada shifokor, onam o'qituvchi.",tr:"Babam doktor, annem öğretmen.",ar:"أبي طبيب وأمي معلمة.",fa:"بابام دکتره، مامانم معلمه.",zh:"爸爸是医生，妈妈是老师。",es:"Papá es médico, mamá es profesora.",de:"Papa ist Arzt, Mama ist Lehrerin."},answer:"dada shifokor onam o'qituvchi",accept:["dada shifokor, onam o'qituvchi","otam shifokor, onam o'qituvchi"]},
      ]},
    { id:5, emoji:"🏙️", titles:{ru:"Ташкент",en:"Tashkent",uz:"Toshkent",tr:"Taşkent",ar:"طشقند",fa:"تاشکند",zh:"塔什干",es:"Tashkent",de:"Taschkent"},
      exercises:[
        {type:"choose",targetWord:"Chorsu",translations:{ru:"Чорсу (рынок)",en:"Chorsu market",uz:"Bozor",tr:"Çorsu Pazarı",ar:"سوق تشورسو",fa:"بازار چرسو",zh:"乔尔苏市场",es:"Mercado Chorsu",de:"Chorsu-Markt"},distractors:{ru:["Метро","Парк","Университет"],en:["Metro","Park","University"],uz:["Metro","Park","Universitet"],tr:["Metro","Park","Üniversite"],ar:["مترو","حديقة","جامعة"],fa:["مترو","پارک","دانشگاه"],zh:["地铁","公园","大学"],es:["Metro","Parque","Universidad"],de:["Metro","Park","Universität"]}},
        {type:"arrange",sentence:{ru:"Ташкент — красивый современный город",en:"Tashkent is a beautiful modern city",uz:"Toshkent chiroyli zamonaviy shahar",tr:"Taşkent güzel modern bir şehir",ar:"طشقند مدينة جميلة وحديثة",fa:"تاشکند یه شهر زیبا و مدرنه",zh:"塔什干是一个美丽的现代城市",es:"Tashkent es una hermosa ciudad moderna",de:"Taschkent ist eine schöne moderne Stadt"},answer:"Toshkent chiroyli zamonaviy shahar",words:["Toshkent","chiroyli","zamonaviy","shahar","katta","eski"]},
        {type:"fill",sentence:"Toshkentda ___ million kishi yashaydi.",blank:"ikki",hint:{ru:"В Ташкенте живёт два миллиона человек.",en:"Two million people live in Tashkent.",uz:"Toshkentda ikki million kishi yashaydi.",tr:"Taşkent'te iki milyon kişi yaşıyor.",ar:"يعيش مليونا شخص في طشقند.",fa:"دو میلیون نفر در تاشکند زندگی می‌کنند.",zh:"塔什干有两百万人口。",es:"Dos millones de personas viven en Tashkent.",de:"Zwei Millionen Menschen leben in Taschkent."},options:["ikki","besh","o'n","yuz"]},
      ]},
  ],

  // ══ CHINESE more lessons ══════════════════════════════════════════════════════
  "zh-beginner-extra": [
    { id:4, emoji:"👨‍👩‍👧", titles:{ru:"Семья",en:"Family",uz:"Oila",tr:"Aile",ar:"العائلة",fa:"خانواده",zh:"家庭",es:"Familia",de:"Familie"},
      exercises:[
        {type:"choose",targetWord:"妈妈",translations:{ru:"Мама",en:"Mother",uz:"Ona",tr:"Anne",ar:"أم",fa:"مادر",zh:"母亲",es:"Madre",de:"Mutter"},distractors:{ru:["Папа","Брат","Сестра"],en:["Father","Brother","Sister"],uz:["Ota","Aka","Singil"],tr:["Baba","Erkek kardeş","Kız kardeş"],ar:["أب","أخ","أخت"],fa:["پدر","برادر","خواهر"],zh:["爸爸","兄弟","姐妹"],es:["Padre","Hermano","Hermana"],de:["Vater","Bruder","Schwester"]}},
        {type:"arrange",sentence:{ru:"Моя семья очень дружная",en:"My family is very harmonious",uz:"Oilam juda tatuvli",tr:"Ailem çok uyumlu",ar:"عائلتي متناسقة جداً",fa:"خانواده‌ام خیلی صمیمیه",zh:"我家人关系很好",es:"Mi familia es muy unida",de:"Meine Familie ist sehr harmonisch"},answer:"我 家 很 幸福",words:["我","家","很","幸福","不","难"]},
        {type:"fill",sentence:"我 有 一 个 ___。",blank:"哥哥",hint:{ru:"У меня есть один старший брат.",en:"I have one older brother.",uz:"Bitta katta akam bor.",tr:"Bir büyük erkek kardeşim var.",ar:"عندي أخ أكبر واحد.",fa:"یه داداش بزرگتر دارم.",zh:"我有一个哥哥。",es:"Tengo un hermano mayor.",de:"Ich habe einen älteren Bruder."},options:["哥哥","弟弟","妹妹","朋友"]},
        {type:"translate",source:{ru:"Мой папа инженер.",en:"My father is an engineer.",uz:"Otam muhandis.",tr:"Babam mühendis.",ar:"أبي مهندس.",fa:"بابام مهندسه.",zh:"My dad is an engineer.",es:"Mi padre es ingeniero.",de:"Mein Vater ist Ingenieur."},answer:"我爸爸是工程师",accept:["我爸爸是工程师","爸爸是工程师"]},
      ]},
    { id:5, emoji:"🏮", titles:{ru:"Китайская культура",en:"Chinese Culture",uz:"Xitoy madaniyati",tr:"Çin kültürü",ar:"الثقافة الصينية",fa:"فرهنگ چینی",zh:"中国文化",es:"Cultura china",de:"Chinesische Kultur"},
      exercises:[
        {type:"choose",targetWord:"春节",translations:{ru:"Китайский Новый Год",en:"Chinese New Year",uz:"Xitoy yangi yili",tr:"Çin Yeni Yılı",ar:"رأس السنة الصينية",fa:"سال نو چینی",zh:"New Year festival",es:"Año Nuevo Chino",de:"Chinesisches Neujahr"},distractors:{ru:["Праздник середины осени","День рождения","Свадьба"],en:["Mid-Autumn Festival","Birthday","Wedding"],uz:["Kuz oʻrtasi bayrami","Tugʻilgan kun","Toʻy"],tr:["Sonbahar Ortası Festivali","Doğum günü","Düğün"],ar:["مهرجان منتصف الخريف","عيد ميلاد","زفاف"],fa:["جشن نیمه پاییز","تولد","عروسی"],zh:["中秋节","生日","婚礼"],es:["Festival del Medio Otoño","Cumpleaños","Boda"],de:["Mittherbstfest","Geburtstag","Hochzeit"]}},
        {type:"arrange",sentence:{ru:"Красный цвет приносит удачу",en:"Red colour brings good luck",uz:"Qizil rang baxt keltiradi",tr:"Kırmızı renk şans getirir",ar:"اللون الأحمر يجلب الحظ",fa:"رنگ قرمز خوش‌شانسی میاره",zh:"Red brings luck",es:"El color rojo trae buena suerte",de:"Die Farbe Rot bringt Glück"},answer:"红色 代表 好运",words:["红色","代表","好运","坏运","白色","黑色"]},
        {type:"fill",sentence:"新年 快乐！恭喜 ___！",blank:"发财",hint:{ru:"С Новым годом! Желаю богатства!",en:"Happy New Year! Wishing you wealth!",uz:"Yangi yil bilan! Boylik tilayman!",tr:"Mutlu Yıllar! Zenginlik diliyorum!",ar:"كل عام وأنتم بخير! أتمنى لك الثروة!",fa:"سال نو مبارک! ثروت آرزو می‌کنم!",zh:"Happy New Year! Best wishes!",es:"¡Feliz Año Nuevo! ¡Deseo riqueza!",de:"Frohes Neues Jahr! Ich wünsche dir Reichtum!"},options:["发财","失业","生病","倒霉"]},
      ]},
  ],

  // ══ RUSSIAN more lessons ══════════════════════════════════════════════════════
  "ru-beginner-extra": [
    { id:5, emoji:"🏫", titles:{ru:"Учёба",en:"Studies",uz:"O'qish",tr:"Çalışma",ar:"الدراسة",fa:"تحصیل",zh:"学习",es:"Estudio",de:"Studium"},
      exercises:[
        {type:"choose",targetWord:"Учебник",translations:{ru:"Textbook",en:"Textbook",uz:"Darslik",tr:"Ders kitabı",ar:"كتاب مدرسي",fa:"کتاب درسی",zh:"教科书",es:"Libro de texto",de:"Lehrbuch"},distractors:{ru:["Тетрадь","Ручка","Рюкзак"],en:["Notebook","Pen","Backpack"],uz:["Daftar","Ruchka","Ryukzak"],tr:["Defter","Kalem","Sırt çantası"],ar:["دفتر","قلم","حقيبة"],fa:["دفتر","خودکار","کوله‌پشتی"],zh:["笔记本","笔","背包"],es:["Cuaderno","Bolígrafo","Mochila"],de:["Heft","Stift","Rucksack"]}},
        {type:"arrange",sentence:{ru:"Я учусь в университете",en:"I study at university",uz:"Men universitetda o'qiyman",tr:"Üniversitede okuyorum",ar:"أنا أدرس في الجامعة",fa:"دانشگاه می‌خونم",zh:"我在大学学习",es:"Estudio en la universidad",de:"Ich studiere an der Universität"},answer:"Я учусь в университете",words:["Я","учусь","в","университете","школе","институте"]},
        {type:"fill",sentence:"Урок начинается в ___ часов.",blank:"восемь",hint:{ru:"Урок начинается в восемь часов.",en:"The lesson starts at eight.",uz:"Dars soat sakkizda boshlanadi.",tr:"Ders sekizde başlar.",ar:"الدرس يبدأ في الثامنة.",fa:"کلاس ساعت هشت شروع می‌شه.",zh:"课在八点开始。",es:"La clase empieza a las ocho.",de:"Die Stunde beginnt um acht Uhr."},options:["восемь","три","двенадцать","ноль"]},
        {type:"translate",source:{ru:"Study hard every day",en:"Study hard every day",uz:"Har kuni qattiq o'qi",tr:"Her gün çok çalış",ar:"ادرس بجد كل يوم",fa:"هر روز سخت بخون",zh:"每天努力学习",es:"Estudia duro cada día",de:"Lerne jeden Tag fleißig"},answer:"учись усердно каждый день",accept:["учись усердно каждый день","старайся учиться каждый день"]},
      ]},
    { id:6, emoji:"🌍", titles:{ru:"Страны",en:"Countries",uz:"Mamlakatlar",tr:"Ülkeler",ar:"الدول",fa:"کشورها",zh:"国家",es:"Países",de:"Länder"},
      exercises:[
        {type:"choose",targetWord:"Россия",translations:{ru:"Russia",en:"Russia",uz:"Rossiya",tr:"Rusya",ar:"روسيا",fa:"روسیه",zh:"俄罗斯",es:"Rusia",de:"Russland"},distractors:{ru:["Китай","Франция","Германия"],en:["China","France","Germany"],uz:["Xitoy","Fransiya","Germaniya"],tr:["Çin","Fransa","Almanya"],ar:["الصين","فرنسا","ألمانيا"],fa:["چین","فرانسه","آلمان"],zh:["中国","法国","德国"],es:["China","Francia","Alemania"],de:["China","Frankreich","Deutschland"]}},
        {type:"arrange",sentence:{ru:"Я хочу посетить Японию",en:"I want to visit Japan",uz:"Men Yaponiyaga bormoqchiman",tr:"Japonya'yı ziyaret etmek istiyorum",ar:"أريد زيارة اليابان",fa:"می‌خوام ژاپن رو ببینم",zh:"我想去日本",es:"Quiero visitar Japón",de:"Ich möchte Japan besuchen"},answer:"Я хочу посетить Японию",words:["Я","хочу","посетить","Японию","Китай","поехать"]},
        {type:"fill",sentence:"Москва — столица ___.",blank:"России",hint:{ru:"Москва — столица России.",en:"Moscow is the capital of Russia.",uz:"Moskva Rossiyaning poytaxti.",tr:"Moskova, Rusya'nın başkentidir.",ar:"موسكو عاصمة روسيا.",fa:"مسکو پایتخت روسیه‌ست.",zh:"莫斯科是俄罗斯的首都。",es:"Moscú es la capital de Rusia.",de:"Moskau ist die Hauptstadt Russlands."},options:["России","Китая","Франции","Германии"]},
      ]},
  ],

};

// Inject mega lessons
Object.entries(MEGA_LESSONS).forEach(([key, lessons]) => {
  const baseKey = key.replace(/-extra\d*$/, "");
  if (!LESSON_DATA[baseKey]) LESSON_DATA[baseKey] = [];
  LESSON_DATA[baseKey] = [...LESSON_DATA[baseKey], ...lessons];
});

// ─── EXERCISE GENERATOR ───────────────────────────────────────────────────────
const shuffleArray = arr => [...arr].sort(() => Math.random() - 0.5);

const buildExerciseUI = (exercise, nativeLang) => {
  switch (exercise.type) {
    case "choose": {
      const correct = exercise.translations[nativeLang] || exercise.translations.ru;
      const dist = (exercise.distractors[nativeLang] || exercise.distractors.ru || []).slice(0,3);
      const opts = shuffleArray([correct, ...dist]);
      return { ...exercise, correctAnswer: correct, options: opts };
    }
    case "arrange": {
      return { ...exercise, correctAnswer: exercise.answer, shuffledWords: shuffleArray(exercise.words) };
    }
    case "fill": {
      return { ...exercise, correctAnswer: exercise.blank };
    }
    case "translate": {
      return { ...exercise, correctAnswer: exercise.accept[0], displaySource: exercise.source[nativeLang] || exercise.source.ru };
    }
    default: return exercise;
  }
};

// ─── PRICING LOGIC ────────────────────────────────────────────────────────────
const calcPrice = (count) => {
  if (count === 0) return { total: 0, discount: 0, freeLangs: 0, paid: 0 };
  let paid = count;
  let freeLangs = 0;
  if (count >= 3) { paid = count - 1; freeLangs = 1; }
  if (count >= 5) { paid = count - 1; freeLangs = 1; }
  let subtotal = paid * PRICE_PER_LANG;
  let discount = 0;
  if (count >= 5) {
    discount = Math.round(subtotal * 0.1 * 100) / 100;
    subtotal = Math.round((subtotal - discount) * 100) / 100;
  }
  return { total: subtotal, discount, freeLangs, paid };
};

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function Lingra() {
  const [screen, setScreen] = useState("onboarding");
  const [nativeLang, setNativeLang] = useState("ru");
  const [selectedLang, setSelectedLang] = useState(null);
  const [currentLevel, setCurrentLevel] = useState("beginner");
  const [currentLesson, setCurrentLesson] = useState(null);

  // lesson state
  const [exercises, setExercises] = useState([]);
  const [exIdx, setExIdx] = useState(0);
  const [lives, setLives] = useState(MAX_LIVES);
  const [answer, setAnswer] = useState("");
  const [arranged, setArranged] = useState([]);
  const [remaining, setRemaining] = useState([]);
  const [chosenOption, setChosenOption] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [wrongAnim, setWrongAnim] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [hintUsed, setHintUsed] = useState(false);

  // global state
  const [xp, setXp] = useState(0);
  const [streak, setStreak] = useState(0);
  const [progress, setProgress] = useState({});
  const [pricingSelected, setPricingSelected] = useState([]);

  // ── AUTH STATE ────────────────────────────────────────────────────────────
  const [authToken, setAuthToken] = useState(() => localStorage.getItem("lingra_token") || null);
  const [authUser, setAuthUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");
  const [authMode, setAuthMode] = useState("login"); // "login" | "register"
  const [authForm, setAuthForm] = useState({ email: "", password: "", name: "" });
  const [subscription, setSubscription] = useState(null);
  const [subLoading, setSubLoading] = useState(false);

  // AI
  const [aiMessages, setAiMessages] = useState([]);
  const [aiInput, setAiInput] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const chatEndRef = useRef(null);

  const t = UI[nativeLang] || UI.ru;

  // Load saved user on mount
  useEffect(() => {
    if (authToken) {
      api.me(authToken)
        .then(data => {
          setAuthUser(data.user);
          setXp(data.user.xp || 0);
          setStreak(data.user.streak || 0);
          setProgress(data.user.progress || {});
          setNativeLang(data.user.nativeLang || "ru");
        })
        .catch(() => {
          localStorage.removeItem("lingra_token");
          setAuthToken(null);
        });
    }
  }, [authToken]);

  // Auth handlers
  const handleAuth = async () => {
    setAuthLoading(true);
    setAuthError("");
    try {
      const fn = authMode === "login" ? api.login : api.register;
      const body = authMode === "login"
        ? { email: authForm.email, password: authForm.password }
        : { email: authForm.email, password: authForm.password, name: authForm.name, nativeLang };
      const data = await fn(body);
      localStorage.setItem("lingra_token", data.token);
      setAuthToken(data.token);
      setAuthUser(data.user);
      setXp(data.user.xp || 0);
      setStreak(data.user.streak || 0);
      setProgress(data.user.progress || {});
      setScreen("home");
    } catch (e) {
      setAuthError(e.message);
    }
    setAuthLoading(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("lingra_token");
    setAuthToken(null);
    setAuthUser(null);
    setProgress({});
    setXp(0);
    setStreak(0);
    setScreen("home");
  };

  const handleCheckout = async () => {
    if (!authToken) { setScreen("auth"); return; }
    if (!pricingSelected.length) return;
    setSubLoading(true);
    try {
      const data = await api.createCheckout(
        { languages: ["en"], successUrl: window.location.href + "?success=1", cancelUrl: window.location.href },
        authToken
      );
      window.location.href = data.checkoutUrl;
    } catch (e) {
      alert("Ошибка оплаты: " + e.message);
    }
    setSubLoading(false);
  };

  const handleManageSub = async () => {
    if (!authToken) return;
    try {
      const data = await api.createPortal(authToken);
      window.location.href = data.portalUrl;
    } catch (e) {
      alert("Ошибка: " + e.message);
    }
  };

  useEffect(() => {
    if (chatEndRef.current) chatEndRef.current.scrollIntoView({ behavior: "smooth" });
  }, [aiMessages]);

  const startLesson = (langCode, level, lesson) => {
    const raw = lesson.exercises || [];
    const built = raw.map(ex => buildExerciseUI(ex, nativeLang));
    setSelectedLang(langCode);
    setCurrentLevel(level);
    setCurrentLesson(lesson);
    setExercises(built);
    setExIdx(0);
    setLives(MAX_LIVES);
    setAnswer("");
    setArranged([]);
    setFeedback(null);
    setChosenOption(null);
    setCorrectCount(0);
    setHintUsed(false);
    const first = buildExerciseUI(raw[0], nativeLang);
    if (first.type === "arrange") setRemaining(first.shuffledWords || []);
    setScreen("lesson");
  };

  const loadExercise = (idx, built) => {
    const ex = built[idx];
    setAnswer("");
    setArranged([]);
    setChosenOption(null);
    setFeedback(null);
    setHintUsed(false);
    if (ex && ex.type === "arrange") setRemaining(ex.shuffledWords || []);
  };

  const submitAnswer = useCallback(() => {
    const ex = exercises[exIdx];
    if (!ex || feedback) return;

    let userAnswer = "";
    if (ex.type === "choose") userAnswer = chosenOption || "";
    else if (ex.type === "arrange") userAnswer = arranged.join(" ");
    else if (ex.type === "fill" || ex.type === "translate") userAnswer = answer.trim().toLowerCase();

    const correct = ex.type === "translate"
      ? (ex.accept || [ex.correctAnswer]).some(a => userAnswer === a.toLowerCase())
      : userAnswer.toLowerCase() === (ex.correctAnswer || "").toLowerCase();

    if (correct) {
      setFeedback("correct");
      setCorrectCount(c => c + 1);
    } else {
      setFeedback("wrong");
      setWrongAnim(true);
      setLives(l => l - 1);
      setTimeout(() => setWrongAnim(false), 600);
    }
  }, [exercises, exIdx, feedback, chosenOption, arranged, answer]);

  const advance = useCallback(() => {
    if (lives <= 0 && feedback === "wrong") {
      setScreen("livesOut");
      return;
    }
    const next = exIdx + 1;
    if (next >= exercises.length) {
      const key = `${selectedLang}-${currentLevel}-${currentLesson?.id}`;
      setProgress(p => ({ ...p, [key]: true }));
      setXp(x => x + XP_PER_LESSON);
      // Save to backend if logged in
      if (authToken) {
        api.saveProgress({
          lang: selectedLang,
          level: currentLevel,
          lessonId: currentLesson?.id,
          correctCount,
          totalCount: exercises.length,
        }, authToken).then(d => {
          if (d.totalXp) setXp(d.totalXp);
        }).catch(() => {});
      }
      setScreen("lessonComplete");
    } else {
      setExIdx(next);
      loadExercise(next, exercises);
    }
  }, [exIdx, exercises, lives, feedback, selectedLang, currentLevel, currentLesson]);

  const sendAiMessage = async () => {
    if (!aiInput.trim() || aiLoading) return;
    const userMsg = aiInput.trim();
    setAiInput("");
    const lang = LANGUAGES.find(l => l.code === selectedLang);
    const msgs = [...aiMessages, { role: "user", content: userMsg }];
    setAiMessages(msgs);
    setAiLoading(true);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 500,
          system: `You are a ${lang?.name} tutor. Student's native language: ${nativeLang}. Level: ${currentLevel}. Always reply in BOTH the student's native language (${nativeLang}) AND ${lang?.name}. Keep replies to 2-3 sentences. Gently correct mistakes.`,
          messages: msgs.map(m => ({ role: m.role, content: m.content })),
        })
      });
      const data = await res.json();
      const text = data.content?.map(c => c.text || "").join("") || "...";
      setAiMessages(m => [...m, { role: "assistant", content: text }]);
    } catch { setAiMessages(m => [...m, { role: "assistant", content: "Error. Try again." }]); }
    setAiLoading(false);
  };

  // ── STYLES ────────────────────────────────────────────────────────────────
  const S = {
    app: { fontFamily:"'Outfit',sans-serif", background:"#080811", minHeight:"100vh", color:"#fff", position:"relative" },
    bg: { position:"fixed", inset:0, zIndex:0, background:"radial-gradient(ellipse at 15% 40%,rgba(99,102,241,.18) 0%,transparent 55%),radial-gradient(ellipse at 85% 15%,rgba(236,72,153,.12) 0%,transparent 50%),radial-gradient(ellipse at 50% 85%,rgba(16,185,129,.08) 0%,transparent 50%)" },
    wrap: { position:"relative", zIndex:1, maxWidth:430, margin:"0 auto", minHeight:"100vh", display:"flex", flexDirection:"column" },
    backBtn: { background:"rgba(255,255,255,.08)", border:"none", color:"#fff", width:40, height:40, borderRadius:12, cursor:"pointer", fontSize:18, flexShrink:0 },
    pill: (active, color="#6366F1") => ({ background: active ? `linear-gradient(135deg,${color},${color}99)` : "rgba(255,255,255,.05)", border:`1px solid ${active ? color : "rgba(255,255,255,.08)"}`, borderRadius:14, padding:"10px 6px", textAlign:"center", cursor:"pointer", transition:"all .2s" }),
  };

  const lc = (code) => (LANGUAGES.find(l=>l.code===code)||{}).color || "#6366F1";
  const levelColors = { beginner:"#10B981", intermediate:"#F59E0B", advanced:"#EF4444" };


  // ── AUTH SCREEN ─────────────────────────────────────────────────────────────
  if (screen === "auth") {
    const isLogin = authMode === "login";
    return (
      <div style={S.app}>
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet"/>
        <div style={S.bg}/>
        <div style={S.wrap}>
          <div style={{ padding:"52px 28px 32px" }}>
            <button onClick={()=>setScreen("home")} style={{ ...S.backBtn, marginBottom:28 }}>←</button>
            <div style={{ textAlign:"center", marginBottom:36 }}>
              <div style={{ fontSize:52 }}>🌍</div>
              <h2 style={{ fontSize:28, fontWeight:900, margin:"12px 0 4px", background:"linear-gradient(135deg,#fff,#A78BFA)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>
                {isLogin ? "Войти в Lingra" : "Создать аккаунт"}
              </h2>
              <p style={{ color:"#6B7280", fontSize:14, margin:0 }}>
                {isLogin ? "Продолжи обучение" : "Начни учить языки"}
              </p>
            </div>

            {/* Form */}
            <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
              {!isLogin && (
                <div>
                  <div style={{ fontSize:12, color:"#6B7280", fontWeight:600, marginBottom:6 }}>ИМЯ</div>
                  <input value={authForm.name} onChange={e=>setAuthForm(f=>({...f,name:e.target.value}))}
                    placeholder="Твоё имя"
                    style={{ width:"100%", background:"rgba(255,255,255,.06)", border:"1px solid rgba(255,255,255,.12)", borderRadius:14, padding:"14px 16px", color:"#fff", fontSize:15, outline:"none", fontFamily:"Outfit,sans-serif", boxSizing:"border-box" }}/>
                </div>
              )}
              <div>
                <div style={{ fontSize:12, color:"#6B7280", fontWeight:600, marginBottom:6 }}>EMAIL</div>
                <input value={authForm.email} onChange={e=>setAuthForm(f=>({...f,email:e.target.value}))}
                  type="email" placeholder="your@email.com"
                  style={{ width:"100%", background:"rgba(255,255,255,.06)", border:"1px solid rgba(255,255,255,.12)", borderRadius:14, padding:"14px 16px", color:"#fff", fontSize:15, outline:"none", fontFamily:"Outfit,sans-serif", boxSizing:"border-box" }}/>
              </div>
              <div>
                <div style={{ fontSize:12, color:"#6B7280", fontWeight:600, marginBottom:6 }}>ПАРОЛЬ</div>
                <input value={authForm.password} onChange={e=>setAuthForm(f=>({...f,password:e.target.value}))}
                  type="password" placeholder="Минимум 6 символов"
                  onKeyDown={e=>e.key==="Enter"&&handleAuth()}
                  style={{ width:"100%", background:"rgba(255,255,255,.06)", border:"1px solid rgba(255,255,255,.12)", borderRadius:14, padding:"14px 16px", color:"#fff", fontSize:15, outline:"none", fontFamily:"Outfit,sans-serif", boxSizing:"border-box" }}/>
              </div>
            </div>

            {authError && (
              <div style={{ marginTop:12, background:"rgba(239,68,68,.15)", border:"1px solid rgba(239,68,68,.4)", borderRadius:12, padding:"10px 14px", fontSize:13, color:"#EF4444" }}>
                ❌ {authError}
              </div>
            )}

            <button onClick={handleAuth} disabled={authLoading || !authForm.email || !authForm.password}
              style={{ width:"100%", marginTop:20, background: authLoading||!authForm.email||!authForm.password ? "rgba(255,255,255,.08)" : "linear-gradient(135deg,#6366F1,#A855F7)", border:"none", color: authLoading||!authForm.email||!authForm.password?"#4B5563":"#fff", borderRadius:16, padding:18, fontSize:16, fontWeight:800, cursor:"pointer", transition:"all .2s" }}>
              {authLoading ? "⏳ Загрузка..." : isLogin ? "Войти →" : "Создать аккаунт →"}
            </button>

            <div onClick={()=>{ setAuthMode(isLogin?"register":"login"); setAuthError(""); }}
              style={{ textAlign:"center", marginTop:20, color:"#A78BFA", fontSize:14, fontWeight:600, cursor:"pointer" }}>
              {isLogin ? "Нет аккаунта? Зарегистрироваться" : "Уже есть аккаунт? Войти"}
            </div>

            {/* Social login hint */}
            <div style={{ marginTop:28, textAlign:"center" }}>
              <div style={{ fontSize:12, color:"#374151", marginBottom:12 }}>— или —</div>
              <div style={{ display:"flex", gap:10 }}>
                {[["🍎","Apple"],["🇬","Google"]].map(([ic,name])=>(
                  <div key={name} style={{ flex:1, background:"rgba(255,255,255,.06)", border:"1px solid rgba(255,255,255,.1)", borderRadius:14, padding:"12px", textAlign:"center", cursor:"pointer", fontSize:13, fontWeight:600, color:"#9CA3AF" }}>
                    {ic} {name}
                    <div style={{ fontSize:10, color:"#4B5563", marginTop:2 }}>скоро</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── ONBOARDING ─────────────────────────────────────────────────────────────
  if (screen === "onboarding") return (
    <div style={S.app}>
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet"/>
      <div style={S.bg}/>
      <div style={S.wrap}>
        <div style={{ padding:"60px 28px 32px", textAlign:"center" }}>
          <div style={{ fontSize:70, marginBottom:8 }}>🌍</div>
          <h1 style={{ fontSize:52, fontWeight:900, margin:"0 0 4px", letterSpacing:-2, background:"linear-gradient(135deg,#fff 0%,#A78BFA 50%,#EC4899 100%)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>LINGRA</h1>
          <p style={{ color:"#6B7280", fontSize:15, margin:"0 0 40px" }}>Express language learning ⚡</p>
          <div style={{ background:"rgba(255,255,255,.05)", border:"1px solid rgba(255,255,255,.1)", borderRadius:24, padding:"20px", marginBottom:28, textAlign:"left" }}>
            <div style={{ fontSize:14, color:"#A78BFA", fontWeight:700, marginBottom:14, letterSpacing:.5 }}>🗣️ {UI.ru.selectNative}</div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8 }}>
              {NATIVE_LANGS.map(nl => (
                <div key={nl.code} onClick={() => setNativeLang(nl.code)} style={S.pill(nativeLang===nl.code)}>
                  <div style={{ fontSize:22 }}>{nl.flag}</div>
                  <div style={{ fontSize:10, marginTop:4, fontWeight:600, color: nativeLang===nl.code?"#fff":"#9CA3AF" }}>{nl.name}</div>
                </div>
              ))}
            </div>
          </div>
          <button onClick={() => setScreen("home")} style={{ width:"100%", background:"linear-gradient(135deg,#6366F1,#A855F7)", border:"none", color:"#fff", borderRadius:18, padding:18, fontSize:17, fontWeight:800, cursor:"pointer" }}>
            {t.next}
          </button>
        </div>
      </div>
    </div>
  );

  // ── HOME ───────────────────────────────────────────────────────────────────
  if (screen === "home") return (
    <div style={S.app}>
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet"/>
      <div style={S.bg}/>
      <div style={S.wrap}>
        <div style={{ padding:"48px 24px 14px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div>
            <h1 style={{ margin:0, fontSize:32, fontWeight:900, background:"linear-gradient(135deg,#fff,#A78BFA)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>LINGRA</h1>
            <p style={{ margin:"2px 0 0", fontSize:13, color:"#6B7280" }}>⚡ Английский язык с нуля</p>
          </div>
          <div style={{ display:"flex", gap:8 }}>
            <div onClick={() => setScreen("onboarding")} style={{ background:"rgba(255,255,255,.06)", border:"1px solid rgba(255,255,255,.1)", borderRadius:14, padding:"8px 12px", cursor:"pointer", textAlign:"center" }}>
              <div style={{ fontSize:20 }}>{NATIVE_LANGS.find(l=>l.code===nativeLang)?.flag}</div>
              <div style={{ fontSize:10, color:"#6B7280", marginTop:2 }}>{nativeLang.toUpperCase()}</div>
            </div>
            {authUser ? (
              <div onClick={()=>setScreen("profile")} style={{ background:"linear-gradient(135deg,rgba(99,102,241,.3),rgba(168,85,247,.3))", border:"1px solid rgba(99,102,241,.5)", borderRadius:14, padding:"8px 12px", cursor:"pointer", textAlign:"center" }}>
                <div style={{ fontSize:20 }}>👤</div>
                <div style={{ fontSize:10, color:"#A78BFA", marginTop:2, fontWeight:700 }}>{authUser.name?.slice(0,6)}</div>
              </div>
            ) : (
              <div onClick={()=>setScreen("auth")} style={{ background:"linear-gradient(135deg,rgba(99,102,241,.3),rgba(168,85,247,.3))", border:"1px solid rgba(99,102,241,.5)", borderRadius:14, padding:"8px 12px", cursor:"pointer", textAlign:"center" }}>
                <div style={{ fontSize:20 }}>🔑</div>
                <div style={{ fontSize:10, color:"#A78BFA", marginTop:2, fontWeight:700 }}>Войти</div>
              </div>
            )}
          </div>
        </div>
        <div style={{ display:"flex", gap:10, padding:"0 24px 18px" }}>
          {[["🔥",streak,t.days],["⚡",xp,t.xp],["🏆","A1-C1","уровни"]].map(([ic,v,lb])=>(
            <div key={lb} style={{ flex:1, background:"rgba(255,255,255,.05)", border:"1px solid rgba(255,255,255,.08)", borderRadius:16, padding:"12px 6px", textAlign:"center" }}>
              <div style={{ fontSize:18 }}>{ic}</div>
              <div style={{ fontSize:18, fontWeight:800, marginTop:2 }}>{v}</div>
              <div style={{ fontSize:10, color:"#6B7280" }}>{lb}</div>
            </div>
          ))}
        </div>
        <div style={{ padding:"0 24px", flex:1 }}>
          <div style={{ fontSize:12, fontWeight:700, color:"#6B7280", letterSpacing:2, marginBottom:12 }}>{t.chooseToLearn}</div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
            {LANGUAGES.map(lang => {
              const done = LEVELS.reduce((a,lv)=>a+(LESSON_DATA[`${lang.code}-${lv}`]||[]).filter(ls=>progress[`${lang.code}-${lv}-${ls.id}`]).length,0);
              return (
                <div key={lang.code} onClick={() => { setSelectedLang(lang.code); setScreen("levelSelect"); }}
                  style={{ background:"rgba(255,255,255,.04)", border:"1px solid rgba(255,255,255,.08)", borderRadius:18, padding:16, cursor:"pointer", transition:"all .2s", position:"relative", overflow:"hidden" }}
                  onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,.08)"}
                  onMouseLeave={e=>e.currentTarget.style.background="rgba(255,255,255,.04)"}>
                  <div style={{ position:"absolute", top:0, left:0, width:done>0?"50%":"0%", height:3, background:`linear-gradient(90deg,${lang.color},${lang.color}66)`, transition:"width .5s" }}/>
                  <div style={{ fontSize:28 }}>{lang.flag}</div>
                  <div style={{ fontSize:14, fontWeight:700, marginTop:8 }}>{lang.name}</div>
                  <div style={{ fontSize:11, color:"#6B7280", marginTop:2 }}>3 уровня {done>0&&<span style={{color:lang.color}}>• {done}✓</span>}</div>
                </div>
              );
            })}
          </div>
        </div>
        <div style={{ padding:"16px 24px 32px" }}>
          <button onClick={()=>setScreen("pricing")} style={{ width:"100%", background:"linear-gradient(135deg,#6366F1,#A855F7)", border:"none", color:"#fff", borderRadius:16, padding:16, fontSize:15, fontWeight:700, cursor:"pointer" }}>{t.pricingBtn}</button>
        </div>
      </div>
    </div>
  );

  // ── LEVEL SELECT ───────────────────────────────────────────────────────────
  if (screen === "levelSelect") {
    const lang = LANGUAGES.find(l=>l.code===selectedLang);
    return (
      <div style={S.app}>
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet"/>
        <div style={S.bg}/>
        <div style={S.wrap}>
          <div style={{ padding:"48px 24px 24px", display:"flex", alignItems:"center", gap:14 }}>
            <button onClick={()=>setScreen("home")} style={S.backBtn}>←</button>
            <div style={{ fontSize:28 }}>{lang?.flag}</div>
            <div><h2 style={{ margin:0, fontSize:22, fontWeight:800 }}>{lang?.name}</h2><div style={{ fontSize:13, color:"#6B7280" }}>{t.selectLevel}</div></div>
          </div>
          <div style={{ padding:"0 24px", flex:1 }}>
            {LEVELS.map((lv,i) => {
              const lessons = LESSON_DATA[`${selectedLang}-${lv}`]||[];
              const done = lessons.filter(ls=>progress[`${selectedLang}-${lv}-${ls.id}`]).length;
              const icons = ["🌱","🔥","⚡"]; const colors = [levelColors.beginner, levelColors.intermediate, levelColors.advanced];
              return (
                <div key={lv} onClick={() => { setCurrentLevel(lv); setScreen("course"); }}
                  style={{ background:"rgba(255,255,255,.04)", border:`1px solid rgba(255,255,255,.08)`, borderRadius:20, padding:"20px 22px", marginBottom:12, cursor:"pointer", display:"flex", alignItems:"center", gap:16, transition:"all .2s" }}
                  onMouseEnter={e=>e.currentTarget.style.transform="translateY(-2px)"}
                  onMouseLeave={e=>e.currentTarget.style.transform="translateY(0)"}>
                  <div style={{ fontSize:34, width:54, height:54, background:`${colors[i]}22`, borderRadius:16, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>{icons[i]}</div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:17, fontWeight:800, color:colors[i] }}>{t[lv]}</div>
                    <div style={{ fontSize:13, color:"#9CA3AF", marginTop:3 }}>{t[`levelDesc${i+1}`]}</div>
                    <div style={{ fontSize:12, color:"#6B7280", marginTop:4 }}>{lessons.length} {t.lessons?.toLowerCase()} {done>0&&<span style={{color:colors[i]}}>• {done}✓</span>}</div>
                  </div>
                  <div style={{ fontSize:18 }}>{done===lessons.length&&lessons.length>0?"✅":"▶"}</div>
                </div>
              );
            })}
          </div>
          <div style={{ height:32 }}/>
        </div>
      </div>
    );
  }

  // ── COURSE ─────────────────────────────────────────────────────────────────
  if (screen === "course") {
    const lang = LANGUAGES.find(l=>l.code===selectedLang);
    const lessons = LESSON_DATA[`${selectedLang}-${currentLevel}`]||[];
    const color = levelColors[currentLevel]||lc(selectedLang);
    return (
      <div style={S.app}>
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet"/>
        <div style={S.bg}/>
        <div style={S.wrap}>
          <div style={{ padding:"48px 24px 14px", display:"flex", alignItems:"center", gap:14 }}>
            <button onClick={()=>setScreen("levelSelect")} style={S.backBtn}>←</button>
            <div style={{ fontSize:26 }}>{lang?.flag}</div>
            <div style={{ flex:1 }}>
              <h2 style={{ margin:0, fontSize:20, fontWeight:800 }}>{lang?.name}</h2>
              <div style={{ fontSize:12, color, fontWeight:700 }}>{t[currentLevel]}</div>
            </div>
            <div style={{ background:"rgba(255,255,255,.06)", borderRadius:12, padding:"8px 12px", textAlign:"center" }}>
              <div style={{ fontSize:16, fontWeight:800, color:"#F59E0B" }}>⚡{xp}</div>
              <div style={{ fontSize:10, color:"#6B7280" }}>{t.xp}</div>
            </div>
          </div>
          <div style={{ margin:"0 24px 18px", background:"rgba(255,255,255,.06)", borderRadius:100, height:6 }}>
            <div style={{ height:"100%", width:`${Math.round((lessons.filter(ls=>progress[`${selectedLang}-${currentLevel}-${ls.id}`]).length/Math.max(lessons.length,1))*100)}%`, background:`linear-gradient(90deg,${color},${color}88)`, borderRadius:100, transition:"width .5s" }}/>
          </div>
          <div style={{ padding:"0 24px", flex:1 }}>
            <div style={{ fontSize:12, fontWeight:700, color:"#6B7280", letterSpacing:2, marginBottom:12 }}>{t.lessons}</div>
            {lessons.map((lesson,i) => {
              const done = progress[`${selectedLang}-${currentLevel}-${lesson.id}`];
              const title = lesson.titles?.[nativeLang]||lesson.titles?.en||"Lesson";
              const exCount = lesson.exercises?.length||0;
              return (
                <div key={lesson.id} onClick={()=>startLesson(selectedLang,currentLevel,lesson)}
                  style={{ background: done?`linear-gradient(135deg,${color}22,${color}11)`:"rgba(255,255,255,.04)", border:`1px solid ${done?color+"44":"rgba(255,255,255,.08)"}`, borderRadius:18, padding:"16px 18px", marginBottom:10, cursor:"pointer", display:"flex", alignItems:"center", gap:14, transition:"all .2s" }}
                  onMouseEnter={e=>e.currentTarget.style.transform="translateY(-2px)"}
                  onMouseLeave={e=>e.currentTarget.style.transform="translateY(0)"}>
                  <div style={{ fontSize:28, width:48, height:48, background:"rgba(255,255,255,.06)", borderRadius:14, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>{lesson.emoji}</div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:700, fontSize:15 }}>{i+1}. {title}</div>
                    <div style={{ fontSize:12, color:"#6B7280", marginTop:2 }}>{exCount} {t.questions} {done&&<span style={{color:"#10B981"}}>✓</span>}</div>
                  </div>
                  <div style={{ fontSize:20, color: done?"#10B981":"#374151" }}>{done?"✅":"▶"}</div>
                </div>
              );
            })}
            <div onClick={()=>{ setAiMessages([{role:"assistant",content:`${LANGUAGES.find(l=>l.code===selectedLang)?.flag} Let's practice ${LANGUAGES.find(l=>l.code===selectedLang)?.name}! / Давай попрактикуемся!`}]); setScreen("ai"); }}
              style={{ marginTop:8, background:"linear-gradient(135deg,rgba(99,102,241,.25),rgba(168,85,247,.25))", border:"1px solid rgba(99,102,241,.4)", borderRadius:18, padding:"16px 18px", cursor:"pointer", display:"flex", alignItems:"center", gap:14 }}>
              <div style={{ fontSize:28 }}>🤖</div>
              <div style={{ flex:1 }}><div style={{ fontWeight:700, fontSize:15 }}>{t.aiTitle}</div><div style={{ fontSize:12, color:"#9CA3AF", marginTop:2 }}>AI • {t[currentLevel]}</div></div>
              <div style={{ fontSize:12, color:"#A78BFA", fontWeight:700 }}>PRO ✨</div>
            </div>
          </div>
          <div style={{ height:32 }}/>
        </div>
      </div>
    );
  }

  // ── LESSON (exercise engine) ────────────────────────────────────────────────
  if (screen === "lesson") {
    const ex = exercises[exIdx];
    if (!ex) return null;
    const color = levelColors[currentLevel]||lc(selectedLang);
    const progress_pct = Math.round(((exIdx)/(exercises.length))*100);
    const isCorrect = feedback === "correct";
    const isWrong = feedback === "wrong";

    const handleArrangeWord = (word, fromArranged=false) => {
      if (feedback) return;
      if (fromArranged) {
        setArranged(a=>a.filter((_,i)=>i!==arranged.indexOf(word)||true).filter((w,i)=>{
          let found=false;
          return w!==word||(found?true:(found=true,false));
        }));
        setRemaining(r=>[...r,word]);
      } else {
        setRemaining(r=>{
          const idx=r.indexOf(word);
          const next=[...r];
          next.splice(idx,1);
          return next;
        });
        setArranged(a=>[...a,word]);
      }
    };

    // remove ONE instance of a word from arranged
    const removeFromArranged = (idx) => {
      if (feedback) return;
      const word = arranged[idx];
      setArranged(a=>a.filter((_,i)=>i!==idx));
      setRemaining(r=>[...r,word]);
    };

    const exType = ex.type;
    const typeLabel = t.exerciseTypes?.[exType] || exType;

    return (
      <div style={S.app}>
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet"/>
        <div style={S.bg}/>
        <style>{`
          @keyframes shake{0%,100%{transform:translateX(0)}20%,60%{transform:translateX(-8px)}40%,80%{transform:translateX(8px)}}
          @keyframes pop{0%{transform:scale(1)}50%{transform:scale(1.08)}100%{transform:scale(1)}}
          @keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        `}</style>
        <div style={S.wrap}>
          {/* Header */}
          <div style={{ padding:"48px 24px 12px", display:"flex", alignItems:"center", gap:12 }}>
            <button onClick={()=>setScreen("course")} style={S.backBtn}>✕</button>
            {/* Progress bar */}
            <div style={{ flex:1, background:"rgba(255,255,255,.06)", borderRadius:100, height:8, overflow:"hidden" }}>
              <div style={{ height:"100%", width:`${progress_pct}%`, background:`linear-gradient(90deg,${color},${color}99)`, borderRadius:100, transition:"width .4s" }}/>
            </div>
            {/* Lives */}
            <div style={{ display:"flex", gap:3, animation: wrongAnim?"shake .4s":"none" }}>
              {Array.from({length:MAX_LIVES}).map((_,i)=>(
                <span key={i} style={{ fontSize:18, opacity: i<lives?1:.25, transition:"opacity .3s" }}>❤️</span>
              ))}
            </div>
          </div>

          <div style={{ padding:"8px 24px 0", flex:1, display:"flex", flexDirection:"column" }}>
            {/* Exercise type label */}
            <div style={{ fontSize:12, fontWeight:700, color:"#6B7280", letterSpacing:2, marginBottom:20 }}>{typeLabel.toUpperCase()}</div>

            {/* ── CHOOSE exercise ── */}
            {exType === "choose" && (
              <>
                <div style={{ background:"rgba(255,255,255,.05)", border:"1px solid rgba(255,255,255,.08)", borderRadius:22, padding:28, textAlign:"center", marginBottom:24 }}>
                  <div style={{ fontSize:42, marginBottom:12 }}>🔤</div>
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:12 }}>
                    <div style={{ fontSize:34, fontWeight:900, letterSpacing:-1 }}>{ex.targetWord}</div>
                    <SpeakBtn text={ex.targetWord} lang={selectedLang} size={20}/>
                  </div>
                  {hintUsed && <div style={{ fontSize:13, color:"#F59E0B", marginTop:10, fontStyle:"italic" }}>💡 {ex.translations?.[nativeLang]||ex.translations?.ru}</div>}
                </div>
                <div style={{ display:"flex", flexDirection:"column", gap:10, flex:1 }}>
                  {(ex.options||[]).map((opt,i)=>{
                    let bg="rgba(255,255,255,.05)", border="1px solid rgba(255,255,255,.1)", textColor="#fff";
                    if (feedback) {
                      if (opt===ex.correctAnswer) { bg="rgba(16,185,129,.2)"; border="1px solid #10B981"; textColor="#10B981"; }
                      else if (opt===chosenOption && opt!==ex.correctAnswer) { bg="rgba(239,68,68,.2)"; border="1px solid #EF4444"; textColor="#EF4444"; }
                    } else if (opt===chosenOption) { bg=`rgba(99,102,241,.2)`; border="1px solid #6366F1"; }
                    return (
                      <div key={i} onClick={()=>{ if(!feedback){ setChosenOption(opt); } }}
                        style={{ background:bg, border, borderRadius:16, padding:"16px 20px", cursor:feedback?"default":"pointer", fontSize:16, fontWeight:600, transition:"all .15s", display:"flex", alignItems:"center", gap:12, color:textColor, animation:feedback&&opt===ex.correctAnswer?"pop .3s":"none" }}>
                        <div style={{ width:30,height:30,borderRadius:9,background:"rgba(255,255,255,.08)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:700,color:"#6B7280",flexShrink:0 }}>{["A","B","C","D"][i]}</div>
                        <span style={{ flex:1 }}>{opt}</span>
                        {feedback && opt===ex.correctAnswer && "✅"}
                        {feedback && opt===chosenOption && opt!==ex.correctAnswer && "❌"}
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            {/* ── ARRANGE exercise ── */}
            {exType === "arrange" && (
              <>
                <div style={{ background:"rgba(255,255,255,.05)", border:"1px solid rgba(255,255,255,.08)", borderRadius:22, padding:22, marginBottom:20 }}>
                  <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:10, marginBottom:8 }}>
                    <div style={{ fontSize:13, color:"#9CA3AF" }}>{ex.sentence?.[nativeLang]||ex.sentence?.ru}</div>
                    <SpeakBtn text={ex.answer} lang={selectedLang} size={16}/>
                  </div>
                  <div style={{ fontSize:13, color:"#6B7280" }}>{t.tapWords}</div>
                </div>
                {/* Answer area */}
                <div style={{ minHeight:52, background: feedback==="correct"?"rgba(16,185,129,.15)":feedback==="wrong"?"rgba(239,68,68,.15)":"rgba(255,255,255,.04)", border:`1px solid ${feedback==="correct"?"#10B981":feedback==="wrong"?"#EF4444":"rgba(255,255,255,.1)"}`, borderRadius:16, padding:"10px 12px", marginBottom:16, display:"flex", flexWrap:"wrap", gap:8, alignContent:"flex-start", animation:wrongAnim?"shake .4s":"none" }}>
                  {arranged.map((w,i)=>(
                    <div key={i} onClick={()=>removeFromArranged(i)} style={{ background:"rgba(99,102,241,.3)", border:"1px solid #6366F1", borderRadius:10, padding:"7px 14px", fontSize:14, fontWeight:600, cursor:feedback?"default":"pointer", transition:"all .15s" }}>{w}</div>
                  ))}
                  {arranged.length===0 && <div style={{ fontSize:13, color:"#4B5563", padding:"4px 4px" }}>...</div>}
                </div>
                {/* Word bank */}
                <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
                  {remaining.map((w,i)=>(
                    <div key={i} onClick={()=>handleArrangeWord(w)} style={{ background:"rgba(255,255,255,.07)", border:"1px solid rgba(255,255,255,.12)", borderRadius:10, padding:"9px 16px", fontSize:14, fontWeight:600, cursor:feedback?"default":"pointer", transition:"all .15s" }}
                      onMouseEnter={e=>{ if(!feedback) e.currentTarget.style.background="rgba(255,255,255,.15)"; }}
                      onMouseLeave={e=>e.currentTarget.style.background="rgba(255,255,255,.07)"}>{w}</div>
                  ))}
                </div>
                {feedback==="correct" && <div style={{ marginTop:12,fontSize:13,color:"#10B981",fontWeight:600 }}>✅ {ex.correctAnswer}</div>}
                {feedback==="wrong" && <div style={{ marginTop:12,fontSize:13,color:"#EF4444",fontWeight:600 }}>❌ {ex.correctAnswer}</div>}
              </>
            )}

            {/* ── FILL exercise ── */}
            {exType === "fill" && (
              <>
                <div style={{ background:"rgba(255,255,255,.05)", border:"1px solid rgba(255,255,255,.08)", borderRadius:22, padding:24, marginBottom:20, textAlign:"center" }}>
                  <div style={{ fontSize:15, color:"#9CA3AF", marginBottom:12 }}>{ex.hint?.[nativeLang]||ex.hint?.ru}</div>
                  <div style={{ fontSize:22, fontWeight:700, lineHeight:1.6 }}>
                    {ex.sentence?.split("___").map((part,i,arr)=>(
                      <span key={i}>{part}{i<arr.length-1&&<span style={{ color:feedback==="correct"?"#10B981":feedback==="wrong"?"#EF4444":"#A78BFA", borderBottom:`2px solid ${feedback==="correct"?"#10B981":feedback==="wrong"?"#EF4444":"#A78BFA"}`, paddingBottom:2 }}>{answer||"___"}</span>}</span>
                    ))}
                  </div>
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                  {(ex.options||[]).map((opt,i)=>{
                    let bg="rgba(255,255,255,.05)", border="1px solid rgba(255,255,255,.1)";
                    if (feedback) {
                      if (opt.toLowerCase()===ex.correctAnswer.toLowerCase()) { bg="rgba(16,185,129,.2)"; border="1px solid #10B981"; }
                      else if (opt===answer && opt.toLowerCase()!==ex.correctAnswer.toLowerCase()) { bg="rgba(239,68,68,.2)"; border="1px solid #EF4444"; }
                    } else if (opt===answer) { bg="rgba(99,102,241,.2)"; border="1px solid #6366F1"; }
                    return (
                      <div key={i} onClick={()=>{ if(!feedback) setAnswer(opt); }}
                        style={{ background:bg, border, borderRadius:14, padding:"14px", cursor:feedback?"default":"pointer", fontSize:15, fontWeight:600, textAlign:"center", transition:"all .15s" }}>
                        {opt}
                        {feedback && opt.toLowerCase()===ex.correctAnswer.toLowerCase() && " ✅"}
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            {/* ── TRANSLATE exercise ── */}
            {exType === "translate" && (
              <>
                <div style={{ background:"rgba(255,255,255,.05)", border:"1px solid rgba(255,255,255,.08)", borderRadius:22, padding:24, marginBottom:20, textAlign:"center" }}>
                  <div style={{ fontSize:13, color:"#9CA3AF", marginBottom:6 }}>{t.exerciseTypes?.translate}</div>
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:12 }}>
                    <div style={{ fontSize:22, fontWeight:800, lineHeight:1.4 }}>{ex.displaySource}</div>
                    <SpeakBtn text={ex.displaySource} lang={nativeLang} size={18}/>
                  </div>
                </div>
                <div style={{ position:"relative" }}>
                  <input value={answer} onChange={e=>setAnswer(e.target.value)}
                    onKeyDown={e=>e.key==="Enter"&&!feedback&&submitAnswer()}
                    placeholder={t.typeAnswer}
                    disabled={!!feedback}
                    style={{ width:"100%", background: feedback==="correct"?"rgba(16,185,129,.15)":feedback==="wrong"?"rgba(239,68,68,.15)":"rgba(255,255,255,.06)", border:`1px solid ${feedback==="correct"?"#10B981":feedback==="wrong"?"#EF4444":"rgba(255,255,255,.12)"}`, borderRadius:16, padding:"16px 20px", fontSize:16, color:"#fff", outline:"none", fontFamily:"Outfit,sans-serif", boxSizing:"border-box", animation:wrongAnim?"shake .4s":"none" }}/>
                  {feedback && <div style={{ marginTop:10, fontSize:14, color: feedback==="correct"?"#10B981":"#EF4444", fontWeight:600 }}>{feedback==="correct"?"✅":"❌"} {ex.accept?.[0]||ex.correctAnswer}</div>}
                </div>
              </>
            )}
          </div>

          {/* Footer */}
          <div style={{ padding:"16px 24px 32px", borderTop:"1px solid rgba(255,255,255,.06)" }}>
            {/* Feedback bar */}
            {feedback && (
              <div style={{ background: isCorrect?"rgba(16,185,129,.15)":"rgba(239,68,68,.12)", border:`1px solid ${isCorrect?"#10B981":"#EF4444"}`, borderRadius:16, padding:"12px 16px", marginBottom:12, display:"flex", alignItems:"center", gap:10, animation:"fadeUp .25s ease" }}>
                <div style={{ fontSize:24 }}>{isCorrect?"🎉":"💔"}</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:800, color: isCorrect?"#10B981":"#EF4444", fontSize:15 }}>{isCorrect?t.correct:t.wrong}</div>
                  {!isCorrect && (
                    <div style={{ display:"flex", alignItems:"center", gap:8, marginTop:4 }}>
                      <span style={{ fontSize:13, color:"#9CA3AF" }}>{ex.correctAnswer}</span>
                      <SpeakBtn text={ex.correctAnswer} lang={selectedLang} size={14}/>
                    </div>
                  )}
                </div>
                {isCorrect && (
                  <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <SpeakBtn text={ex.targetWord||ex.answer||ex.correctAnswer} lang={selectedLang} size={16}/>
                    <div style={{ color:"#F59E0B", fontWeight:700 }}>+{XP_PER_EXERCISE} XP</div>
                  </div>
                )}
              </div>
            )}

            <div style={{ display:"flex", gap:10 }}>
              {!feedback && !hintUsed && (exType==="choose"||exType==="translate") && (
                <button onClick={()=>setHintUsed(true)} style={{ flex:1, background:"rgba(245,158,11,.15)", border:"1px solid rgba(245,158,11,.4)", color:"#F59E0B", borderRadius:14, padding:"14px", fontSize:14, fontWeight:700, cursor:"pointer" }}>
                  💡 {t.hintBtn}
                </button>
              )}
              {!feedback ? (
                <button onClick={submitAnswer}
                  disabled={exType==="choose"?!chosenOption:exType==="arrange"?arranged.length===0:!answer.trim()}
                  style={{ flex:3, background: (exType==="choose"?chosenOption:exType==="arrange"?arranged.length>0:answer.trim()) ? `linear-gradient(135deg,${color},${color}99)` : "rgba(255,255,255,.08)", border:"none", color: (exType==="choose"?chosenOption:exType==="arrange"?arranged.length>0:answer.trim()) ? "#fff":"#4B5563", borderRadius:14, padding:"16px", fontSize:16, fontWeight:800, cursor:(exType==="choose"?chosenOption:exType==="arrange"?arranged.length>0:answer.trim())?"pointer":"not-allowed", transition:"all .2s" }}>
                  {t.check}
                </button>
              ) : (
                <button onClick={advance} style={{ flex:1, background: isCorrect?`linear-gradient(135deg,#10B981,#059669)`:`linear-gradient(135deg,${color},${color}99)`, border:"none", color:"#fff", borderRadius:14, padding:"16px", fontSize:16, fontWeight:800, cursor:"pointer" }}>
                  {t.continueBtn} →
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── LESSON COMPLETE ─────────────────────────────────────────────────────────
  if (screen === "lessonComplete") {
    const perfect = correctCount === exercises.length;
    return (
      <div style={S.app}>
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet"/>
        <div style={S.bg}/>
        <div style={S.wrap}>
          <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"40px 24px", textAlign:"center" }}>
            <div style={{ fontSize:90, marginBottom:16, animation:"pop .5s" }}>{perfect?"🏆":"🎉"}</div>
            <h2 style={{ fontSize:32, fontWeight:900, margin:"0 0 8px" }}>{perfect?t.perfect:t.lessonDone}</h2>
            <p style={{ color:"#9CA3AF", fontSize:16, margin:"0 0 32px" }}>{t.result}: {correctCount}/{exercises.length}</p>
            <div style={{ display:"flex", gap:16, marginBottom:32 }}>
              {[["⚡",`+${XP_PER_LESSON}`,t.xp],["❤️",lives,t.lives],["🔥",streak,t.streak]].map(([ic,v,lb])=>(
                <div key={lb} style={{ background:"rgba(255,255,255,.06)", borderRadius:20, padding:"20px 24px", textAlign:"center", minWidth:80 }}>
                  <div style={{ fontSize:28 }}>{ic}</div>
                  <div style={{ fontSize:22, fontWeight:900, marginTop:6 }}>{v}</div>
                  <div style={{ fontSize:11, color:"#6B7280", marginTop:2 }}>{lb}</div>
                </div>
              ))}
            </div>
            <button onClick={()=>setScreen("course")} style={{ width:"100%", maxWidth:320, background:"linear-gradient(135deg,#6366F1,#A855F7)", border:"none", color:"#fff", borderRadius:18, padding:18, fontSize:17, fontWeight:800, cursor:"pointer" }}>
              {t.continueBtn} →
            </button>
          </div>
        </div>
        <style>{`@keyframes pop{0%{transform:scale(.5);opacity:0}70%{transform:scale(1.15)}100%{transform:scale(1);opacity:1}}`}</style>
      </div>
    );
  }

  // ── LIVES OUT ───────────────────────────────────────────────────────────────
  if (screen === "livesOut") return (
    <div style={S.app}>
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet"/>
      <div style={S.bg}/>
      <div style={S.wrap}>
        <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:40, textAlign:"center" }}>
          <div style={{ fontSize:80, marginBottom:16 }}>💔</div>
          <h2 style={{ fontSize:28, fontWeight:900, margin:"0 0 8px" }}>{t.livesOut}</h2>
          <p style={{ color:"#9CA3AF", marginBottom:32 }}>{t.result}: {correctCount}/{exercises.length}</p>
          <button onClick={()=>startLesson(selectedLang,currentLevel,currentLesson)} style={{ width:"100%", maxWidth:300, background:"linear-gradient(135deg,#EF4444,#B91C1C)", border:"none", color:"#fff", borderRadius:18, padding:18, fontSize:16, fontWeight:800, cursor:"pointer", marginBottom:12 }}>
            🔄 {t.tryAgain}
          </button>
          <button onClick={()=>setScreen("course")} style={{ width:"100%", maxWidth:300, background:"rgba(255,255,255,.08)", border:"1px solid rgba(255,255,255,.1)", color:"#fff", borderRadius:18, padding:16, fontSize:15, fontWeight:600, cursor:"pointer" }}>
            {t.back}
          </button>
        </div>
      </div>
    </div>
  );

  // ── AI CHAT ─────────────────────────────────────────────────────────────────
  if (screen === "ai") {
    const lang = LANGUAGES.find(l=>l.code===selectedLang);
    return (
      <div style={{ ...S.app, display:"flex", flexDirection:"column" }}>
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet"/>
        <div style={S.bg}/>
        <div style={S.wrap}>
          <div style={{ padding:"48px 24px 14px", display:"flex", alignItems:"center", gap:12, borderBottom:"1px solid rgba(255,255,255,.06)" }}>
            <button onClick={()=>setScreen("course")} style={S.backBtn}>←</button>
            <div style={{ fontSize:26 }}>🤖</div>
            <div><div style={{ fontWeight:700, fontSize:16 }}>{t.aiTitle}</div><div style={{ fontSize:12, color:"#10B981" }}>{t.aiOnline} • {lang?.name}</div></div>
          </div>
          <div style={{ flex:1, overflowY:"auto", padding:"14px 24px", display:"flex", flexDirection:"column", gap:10 }}>
            {aiMessages.map((msg,i)=>(
              <div key={i} style={{ display:"flex", justifyContent:msg.role==="user"?"flex-end":"flex-start" }}>
                <div style={{ maxWidth:"82%", background:msg.role==="user"?"linear-gradient(135deg,#6366F1,#A855F7)":"rgba(255,255,255,.06)", border:msg.role==="assistant"?"1px solid rgba(255,255,255,.08)":"none", borderRadius:msg.role==="user"?"18px 18px 4px 18px":"18px 18px 18px 4px", padding:"11px 15px", fontSize:14, lineHeight:1.6, whiteSpace:"pre-wrap" }}>
                  {msg.content}
                </div>
              </div>
            ))}
            {aiLoading&&<div style={{ display:"flex", gap:5, padding:"11px 15px", background:"rgba(255,255,255,.06)", borderRadius:"18px 18px 18px 4px", width:"fit-content" }}>{[0,1,2].map(i=><div key={i} style={{ width:7,height:7,borderRadius:"50%",background:"#6B7280",animation:`bounce 1s ${i*.2}s infinite` }}/>)}</div>}
            <div ref={chatEndRef}/>
          </div>
          <div style={{ padding:"10px 24px 32px", borderTop:"1px solid rgba(255,255,255,.06)" }}>
            <div style={{ display:"flex", gap:10, background:"rgba(255,255,255,.06)", border:"1px solid rgba(255,255,255,.1)", borderRadius:18, padding:"8px 8px 8px 14px" }}>
              <input value={aiInput} onChange={e=>setAiInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&sendAiMessage()} placeholder={t.aiPlaceholder} style={{ flex:1, background:"transparent", border:"none", outline:"none", color:"#fff", fontSize:14, fontFamily:"Outfit,sans-serif" }}/>
              <button onClick={sendAiMessage} disabled={aiLoading||!aiInput.trim()} style={{ background:aiLoading||!aiInput.trim()?"rgba(255,255,255,.08)":"linear-gradient(135deg,#6366F1,#A855F7)", border:"none", color:"#fff", width:38, height:38, borderRadius:12, cursor:"pointer", fontSize:17, flexShrink:0 }}>↑</button>
            </div>
          </div>
        </div>
        <style>{`@keyframes bounce{0%,80%,100%{transform:scale(0)}40%{transform:scale(1)}}`}</style>
      </div>
    );
  }


  // ── PROFILE SCREEN ──────────────────────────────────────────────────────────
  if (screen === "profile") {
    const langsDone = LEVELS.reduce((acc, lv) =>
      acc + LANGUAGES.reduce((a2, lang) =>
        a2 + (LESSON_DATA[`${lang.code}-${lv}`]||[]).filter(ls => progress[`${lang.code}-${lv}-${ls.id}`]).length
      , 0), 0);
    const totalLessons = LEVELS.reduce((acc, lv) =>
      acc + LANGUAGES.reduce((a2, lang) =>
        a2 + (LESSON_DATA[`${lang.code}-${lv}`]||[]).length
      , 0), 0);

    return (
      <div style={S.app}>
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet"/>
        <div style={S.bg}/>
        <div style={S.wrap}>
          <div style={{ padding:"48px 24px 24px", display:"flex", alignItems:"center", gap:14 }}>
            <button onClick={()=>setScreen("home")} style={S.backBtn}>←</button>
            <h2 style={{ margin:0, fontSize:22, fontWeight:800 }}>Профиль</h2>
          </div>

          <div style={{ padding:"0 24px", flex:1 }}>
            {/* Avatar block */}
            <div style={{ background:"linear-gradient(135deg,rgba(99,102,241,.2),rgba(168,85,247,.2))", border:"1px solid rgba(99,102,241,.3)", borderRadius:24, padding:24, marginBottom:16, textAlign:"center" }}>
              <div style={{ width:72, height:72, borderRadius:"50%", background:"linear-gradient(135deg,#6366F1,#A855F7)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:32, margin:"0 auto 12px" }}>
                {authUser?.name?.[0]?.toUpperCase() || "👤"}
              </div>
              <div style={{ fontSize:20, fontWeight:800 }}>{authUser?.name || "Гость"}</div>
              <div style={{ fontSize:13, color:"#9CA3AF", marginTop:4 }}>{authUser?.email || ""}</div>
              {authUser?.hasActiveSubscription && (
                <div style={{ display:"inline-block", background:"linear-gradient(135deg,#F59E0B,#D97706)", borderRadius:100, padding:"4px 14px", fontSize:12, fontWeight:700, marginTop:10 }}>
                  💎 PRO
                </div>
              )}
            </div>

            {/* Stats */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10, marginBottom:16 }}>
              {[["⚡", xp, "XP"],["🔥", streak, "Дней"],["📚", langsDone, "Уроков"]].map(([ic,v,lb])=>(
                <div key={lb} style={{ background:"rgba(255,255,255,.05)", border:"1px solid rgba(255,255,255,.08)", borderRadius:16, padding:"14px 8px", textAlign:"center" }}>
                  <div style={{ fontSize:24 }}>{ic}</div>
                  <div style={{ fontSize:20, fontWeight:800, marginTop:4 }}>{v}</div>
                  <div style={{ fontSize:11, color:"#6B7280" }}>{lb}</div>
                </div>
              ))}
            </div>

            {/* Progress bar */}
            <div style={{ background:"rgba(255,255,255,.05)", border:"1px solid rgba(255,255,255,.08)", borderRadius:18, padding:18, marginBottom:16 }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
                <span style={{ fontSize:13, fontWeight:700 }}>Общий прогресс</span>
                <span style={{ fontSize:13, color:"#A78BFA", fontWeight:700 }}>{langsDone}/{totalLessons}</span>
              </div>
              <div style={{ background:"rgba(255,255,255,.08)", borderRadius:100, height:8 }}>
                <div style={{ height:"100%", width:`${Math.round((langsDone/Math.max(totalLessons,1))*100)}%`, background:"linear-gradient(90deg,#6366F1,#A855F7)", borderRadius:100, transition:"width .5s" }}/>
              </div>
            </div>

            {/* Subscribed languages */}
            {authUser?.subscribedLangs?.length > 0 && (
              <div style={{ background:"rgba(255,255,255,.04)", border:"1px solid rgba(255,255,255,.08)", borderRadius:18, padding:18, marginBottom:16 }}>
                <div style={{ fontSize:13, fontWeight:700, color:"#6B7280", letterSpacing:1, marginBottom:12 }}>МОИ ЯЗЫКИ (подписка)</div>
                <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
                  {authUser.subscribedLangs.map(lc => {
                    const lang = LANGUAGES.find(l=>l.code===lc);
                    return lang ? (
                      <div key={lc} style={{ background:`${lang.color}22`, border:`1px solid ${lang.color}44`, borderRadius:12, padding:"6px 14px", fontSize:13, fontWeight:600 }}>
                        {lang.flag} {lang.name}
                      </div>
                    ) : null;
                  })}
                </div>
              </div>
            )}

            {/* Actions */}
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              {!authUser?.hasActiveSubscription && (
                <button onClick={()=>setScreen("pricing")} style={{ background:"linear-gradient(135deg,#6366F1,#A855F7)", border:"none", color:"#fff", borderRadius:16, padding:16, fontSize:15, fontWeight:700, cursor:"pointer" }}>
                  💎 Оформить подписку
                </button>
              )}
              {authUser?.hasActiveSubscription && (
                <button onClick={handleManageSub} style={{ background:"rgba(99,102,241,.2)", border:"1px solid rgba(99,102,241,.4)", color:"#A78BFA", borderRadius:16, padding:16, fontSize:15, fontWeight:700, cursor:"pointer" }}>
                  ⚙️ Управление подпиской
                </button>
              )}
              <button onClick={handleLogout} style={{ background:"rgba(239,68,68,.1)", border:"1px solid rgba(239,68,68,.3)", color:"#EF4444", borderRadius:16, padding:14, fontSize:14, fontWeight:600, cursor:"pointer" }}>
                Выйти из аккаунта
              </button>
            </div>
          </div>
          <div style={{ height:32 }}/>
        </div>
      </div>
    );
  }

  // ── PRICING ─────────────────────────────────────────────────────────────────
  if (screen === "pricing") {
    const [selectedPlan, setSelectedPlan] = React.useState(null);
    const isUz = nativeLang === "uz";

    const STAGES = [
      {
        id: "beginner",
        level: isUz ? "Boshlang'ich" : "Начинающий",
        levelEn: "Beginner (A1-A2)",
        emoji: "🌱",
        color: "#10B981",
        duration: isUz ? "3 oy" : "3 месяца",
        desc: isUz ? "Alifbo, so'zlar, jumlalar, oddiy suhbat" : "Алфавит, слова, фразы, простой разговор",
        topics: isUz
          ? ["Salomlashish va tanishish","Raqamlar va ranglar","Oziq-ovqat va do'kon","Oila va uy","Vaqt va ob-havo"]
          : ["Приветствия и знакомство","Числа и цвета","Еда и магазин","Семья и дом","Время и погода"],
        plans: [
          { id:"b1", label: isUz ? "1 oy" : "1 месяц", months:1, price:10, perMonth:10, badge:null },
          { id:"b3", label: isUz ? "3 oy (tejam!)" : "3 месяца (выгодно!)", months:3, price:25, perMonth:8.33, badge: isUz ? "−17%" : "−17%", highlight:true },
        ]
      },
      {
        id: "intermediate",
        level: isUz ? "O'rta daraja" : "Средний",
        levelEn: "Intermediate (B1-B2)",
        emoji: "🔥",
        color: "#F59E0B",
        duration: isUz ? "3 oy" : "3 месяца",
        desc: isUz ? "Grammatika, dialoglar, ish va sayohat mavzulari" : "Грамматика, диалоги, темы работы и путешествий",
        topics: isUz
          ? ["Ish va karyera","Sayohat va transport","Sog'liq va tibbiyot","Xarid va pul","Ta'lim va fan"]
          : ["Работа и карьера","Путешествия и транспорт","Здоровье и медицина","Покупки и деньги","Образование и наука"],
        plans: [
          { id:"m1", label: isUz ? "1 oy" : "1 месяц", months:1, price:10, perMonth:10, badge:null },
          { id:"m3", label: isUz ? "3 oy (tejam!)" : "3 месяца (выгодно!)", months:3, price:25, perMonth:8.33, badge:"−17%", highlight:true },
        ]
      },
      {
        id: "advanced",
        level: isUz ? "Yuqori daraja" : "Продвинутый",
        levelEn: "Advanced (C1-C2)",
        emoji: "⚡",
        color: "#EF4444",
        duration: isUz ? "3 oy" : "3 месяца",
        desc: isUz ? "Biznes ingliz tili, idiomalar, ravon nutq" : "Деловой английский, идиомы, беглая речь",
        topics: isUz
          ? ["Biznes muloqot","Muzokaralar va taqdimotlar","Akademik yozish","Idiomalar va iboralar","Media va adabiyot"]
          : ["Деловая коммуникация","Переговоры и презентации","Академическое письмо","Идиомы и выражения","СМИ и литература"],
        plans: [
          { id:"a1", label: isUz ? "1 oy" : "1 месяц", months:1, price:10, perMonth:10, badge:null },
          { id:"a3", label: isUz ? "3 oy (tejam!)" : "3 месяца (выгодно!)", months:3, price:25, perMonth:8.33, badge:"−17%", highlight:true },
        ]
      },
    ];

    const FULL_COURSE = {
      id: "full",
      label: isUz ? "🎓 To'liq kurs — 9 oy" : "🎓 Полный курс — 9 месяцев",
      desc: isUz ? "A1 dan C2 gacha — barcha 3 bosqich" : "От A1 до C2 — все 3 этапа",
      price: 60,
      perMonth: 6.67,
      originalPrice: 90,
      save: 30,
      badge: isUz ? "−33% YAXSHI NARX" : "−33% ЛУЧШАЯ ЦЕНА",
    };

    return (
      <div style={S.app}>
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet"/>
        <div style={S.bg}/>
        <div style={S.wrap}>
          <div style={{ padding:"48px 24px 20px", display:"flex", alignItems:"center", gap:14 }}>
            <button onClick={()=>setScreen("home")} style={S.backBtn}>←</button>
            <div>
              <h2 style={{ margin:0, fontSize:22, fontWeight:800 }}>
                {isUz ? "Kurs narxlari" : "Стоимость курса"}
              </h2>
              <p style={{ margin:"3px 0 0", fontSize:13, color:"#6B7280" }}>
                🇬🇧 English · A1 → C2
              </p>
            </div>
          </div>

          {/* FULL COURSE BANNER */}
          <div style={{ margin:"0 24px 20px" }}>
            <div onClick={()=>setSelectedPlan(selectedPlan===FULL_COURSE.id ? null : FULL_COURSE.id)}
              style={{ background: selectedPlan===FULL_COURSE.id ? "linear-gradient(135deg,rgba(99,102,241,.4),rgba(168,85,247,.4))" : "linear-gradient(135deg,rgba(99,102,241,.2),rgba(168,85,247,.2))", border:`2px solid ${selectedPlan===FULL_COURSE.id?"#6366F1":"rgba(99,102,241,.5)"}`, borderRadius:20, padding:20, cursor:"pointer", position:"relative", transition:"all .2s" }}>
              <div style={{ position:"absolute", top:-12, left:"50%", transform:"translateX(-50%)", background:"linear-gradient(135deg,#6366F1,#A855F7)", borderRadius:100, padding:"4px 16px", fontSize:12, fontWeight:800, whiteSpace:"nowrap" }}>
                ⭐ {FULL_COURSE.badge}
              </div>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <div>
                  <div style={{ fontSize:17, fontWeight:800 }}>{FULL_COURSE.label}</div>
                  <div style={{ fontSize:13, color:"#9CA3AF", marginTop:4 }}>{FULL_COURSE.desc}</div>
                  <div style={{ display:"flex", alignItems:"baseline", gap:8, marginTop:8 }}>
                    <span style={{ fontSize:32, fontWeight:900, color:"#A78BFA" }}>${FULL_COURSE.price}</span>
                    <span style={{ fontSize:14, color:"#6B7280", textDecoration:"line-through" }}>${FULL_COURSE.originalPrice}</span>
                  </div>
                  <div style={{ fontSize:12, color:"#A78BFA", marginTop:2 }}>
                    ${FULL_COURSE.perMonth.toFixed(2)}{isUz ? "/oy" : "/мес"} · {isUz ? `${FULL_COURSE.save}$ tejaysiz` : `экономия $${FULL_COURSE.save}`}
                  </div>
                </div>
                <div style={{ fontSize:32 }}>{selectedPlan===FULL_COURSE.id ? "✅" : "⭕"}</div>
              </div>
            </div>
          </div>

          {/* DIVIDER */}
          <div style={{ display:"flex", alignItems:"center", gap:12, padding:"0 24px", marginBottom:16 }}>
            <div style={{ flex:1, height:1, background:"rgba(255,255,255,.08)" }}/>
            <span style={{ fontSize:12, color:"#6B7280", fontWeight:600 }}>{isUz ? "YOKI ALOHIDA BOSQICH" : "ИЛИ ОТДЕЛЬНЫЙ ЭТАП"}</span>
            <div style={{ flex:1, height:1, background:"rgba(255,255,255,.08)" }}/>
          </div>

          {/* STAGE CARDS */}
          <div style={{ padding:"0 24px", flex:1 }}>
            {STAGES.map((stage, si) => (
              <div key={stage.id} style={{ marginBottom:14 }}>
                <div style={{ background:"rgba(255,255,255,.04)", border:`1px solid ${stage.color}33`, borderRadius:20, overflow:"hidden" }}>
                  {/* Stage header */}
                  <div style={{ padding:"16px 18px 12px", borderBottom:"1px solid rgba(255,255,255,.06)" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                      <div style={{ fontSize:28, width:46, height:46, background:`${stage.color}22`, borderRadius:14, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>{stage.emoji}</div>
                      <div style={{ flex:1 }}>
                        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                          <span style={{ fontSize:16, fontWeight:800 }}>{isUz ? `${si+1}-bosqich:` : `Этап ${si+1}:`}</span>
                          <span style={{ fontSize:16, fontWeight:800, color:stage.color }}>{stage.level}</span>
                        </div>
                        <div style={{ fontSize:12, color:"#6B7280", marginTop:2 }}>{stage.levelEn} · {stage.duration}</div>
                      </div>
                    </div>
                    <div style={{ fontSize:13, color:"#9CA3AF", marginTop:10, lineHeight:1.5 }}>{stage.desc}</div>
                    {/* Topics */}
                    <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginTop:10 }}>
                      {stage.topics.map(topic => (
                        <span key={topic} style={{ background:`${stage.color}15`, border:`1px solid ${stage.color}33`, borderRadius:8, padding:"3px 10px", fontSize:11, color:stage.color, fontWeight:600 }}>{topic}</span>
                      ))}
                    </div>
                  </div>
                  {/* Plans */}
                  <div style={{ display:"flex", gap:10, padding:14 }}>
                    {stage.plans.map(plan => (
                      <div key={plan.id} onClick={()=>setSelectedPlan(selectedPlan===plan.id ? null : plan.id)}
                        style={{ flex:1, background:selectedPlan===plan.id?`${stage.color}22`:"rgba(255,255,255,.04)", border:`2px solid ${selectedPlan===plan.id?stage.color:"rgba(255,255,255,.1)"}`, borderRadius:14, padding:"12px 10px", cursor:"pointer", textAlign:"center", position:"relative", transition:"all .2s" }}>
                        {plan.badge && <div style={{ position:"absolute", top:-10, left:"50%", transform:"translateX(-50%)", background:stage.color, borderRadius:100, padding:"2px 10px", fontSize:10, fontWeight:800, whiteSpace:"nowrap", color:"#fff" }}>{plan.badge}</div>}
                        <div style={{ fontSize:13, fontWeight:700, marginBottom:6 }}>{plan.label}</div>
                        <div style={{ fontSize:22, fontWeight:900, color:selectedPlan===plan.id?stage.color:"#fff" }}>${plan.price}</div>
                        <div style={{ fontSize:11, color:"#6B7280", marginTop:2 }}>${plan.perMonth.toFixed(2)}{isUz?"/oy":"/мес"}</div>
                        {selectedPlan===plan.id && <div style={{ fontSize:16, marginTop:6 }}>✅</div>}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}

            {/* Guarantee */}
            <div style={{ background:"rgba(16,185,129,.08)", border:"1px solid rgba(16,185,129,.25)", borderRadius:16, padding:"14px 18px", marginBottom:20, display:"flex", alignItems:"center", gap:12 }}>
              <span style={{ fontSize:24 }}>🛡️</span>
              <div>
                <div style={{ fontWeight:700, fontSize:14, color:"#10B981" }}>{isUz ? "7 kunlik kafolat" : "7-дневная гарантия"}</div>
                <div style={{ fontSize:12, color:"#9CA3AF", marginTop:2 }}>{isUz ? "Yoqmasa — to'liq qaytaramiz, savol yo'q" : "Не понравится — полный возврат, без вопросов"}</div>
              </div>
            </div>

            {/* CTA */}
            {selectedPlan && (
              <button onClick={()=>{ if(!authToken){ setScreen("auth"); } else { handleCheckout(); } }}
                disabled={subLoading}
                style={{ width:"100%", background:"linear-gradient(135deg,#6366F1,#A855F7)", border:"none", color:"#fff", borderRadius:18, padding:20, fontSize:17, fontWeight:800, cursor:"pointer", marginBottom:10, animation:"fadeUp .25s ease" }}>
                {subLoading ? "⏳ ..." : authToken
                  ? `💳 ${isUz ? "To'lash" : "Оплатить"} — ${ selectedPlan===FULL_COURSE.id ? FULL_COURSE.price : [...STAGES.flatMap(s=>s.plans)].find(p=>p.id===selectedPlan)?.price || "" }`
                  : `🔑 ${isUz ? "Kirish va to'lash" : "Войти и оплатить"}`}
              </button>
            )}
            {!selectedPlan && (
              <div style={{ width:"100%", background:"rgba(255,255,255,.06)", border:"1px solid rgba(255,255,255,.1)", color:"#4B5563", borderRadius:18, padding:20, fontSize:15, fontWeight:700, textAlign:"center" }}>
                {isUz ? "⬆️ Rejani tanlang" : "⬆️ Выберите план"}
              </div>
            )}
            <div style={{ textAlign:"center", fontSize:12, color:"#4B5563", marginTop:10, marginBottom:8 }}>
              {isUz ? "Istalgan vaqtda bekor qilish mumkin" : "Отменить можно в любой момент"}
            </div>
          </div>
          <div style={{ height:32 }}/>
        </div>
        <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}`}</style>
      </div>
    );
  }

          <div style={{ padding:"0 24px", flex:1 }}>
            {/* Main product card */}
            <div style={{ background:"linear-gradient(135deg,rgba(59,130,246,.2),rgba(99,102,241,.2))", border:"2px solid rgba(59,130,246,.5)", borderRadius:24, padding:28, marginBottom:16, position:"relative", overflow:"hidden" }}>
              <div style={{ position:"absolute", top:16, right:16, background:"linear-gradient(135deg,#6366F1,#A855F7)", borderRadius:100, padding:"4px 14px", fontSize:12, fontWeight:700 }}>POPULAR</div>
              <div style={{ fontSize:52, marginBottom:12 }}>🇬🇧</div>
              <div style={{ fontSize:26, fontWeight:900, marginBottom:4 }}>English</div>
              <div style={{ fontSize:14, color:"#9CA3AF", marginBottom:20 }}>
                {nativeLang === "uz" ? "Ingliz tili — to'liq kurs" : "Английский язык — полный курс"}
              </div>
              <div style={{ fontSize:42, fontWeight:900, color:"#3B82F6", marginBottom:4 }}>$10<span style={{ fontSize:16, color:"#6B7280", fontWeight:400 }}>/мес</span></div>
            </div>

            {/* Features */}
            <div style={{ display:"flex", flexDirection:"column", gap:10, marginBottom:20 }}>
              {[
                ["✅", nativeLang==="uz" ? "Cheksiz darslar — boshlang'ichdan ilg'orgacha" : "Безлимитные уроки — с нуля до продвинутого"],
                ["🎯", nativeLang==="uz" ? "4 xil mashq turi: test, tarjima, gap tuzish" : "4 типа упражнений: тест, перевод, составь фразу"],
                ["🔊", nativeLang==="uz" ? "Audio talaffuz har bir so'z uchun" : "Аудио произношение для каждого слова"],
                ["🤖", nativeLang==="uz" ? "AI murabbiy — 24/7 inglizcha suhbat" : "AI-наставник — разговорная практика 24/7"],
                ["🔥", nativeLang==="uz" ? "Streak va XP tizimi — motivatsiya" : "Система стрик и XP — мотивация каждый день"],
                ["❤️", nativeLang==="uz" ? "Jonlar tizimi — o'yindek qiziqarli" : "Система жизней — учёба как игра"],
              ].map(([ic, text]) => (
                <div key={text} style={{ background:"rgba(255,255,255,.04)", border:"1px solid rgba(255,255,255,.08)", borderRadius:14, padding:"14px 16px", display:"flex", alignItems:"center", gap:12 }}>
                  <span style={{ fontSize:20 }}>{ic}</span>
                  <span style={{ fontSize:14, fontWeight:600 }}>{text}</span>
                </div>
              ))}
            </div>

            {/* Guarantee */}
            <div style={{ background:"linear-gradient(135deg,rgba(16,185,129,.15),rgba(5,150,105,.15))", border:"1px solid rgba(16,185,129,.3)", borderRadius:16, padding:"14px 18px", marginBottom:20, display:"flex", alignItems:"center", gap:12 }}>
              <span style={{ fontSize:24 }}>🛡️</span>
              <div>
                <div style={{ fontWeight:700, fontSize:14, color:"#10B981" }}>
                  {nativeLang==="uz" ? "7 kunlik kafolat" : "7-дневная гарантия"}
                </div>
                <div style={{ fontSize:12, color:"#9CA3AF", marginTop:2 }}>
                  {nativeLang==="uz" ? "Yoqmasa — to'liq qaytaramiz" : "Не понравится — вернём деньги"}
                </div>
              </div>
            </div>

            {/* CTA button */}
            <button onClick={()=>{ if(!authToken){ setScreen("auth"); } else { handleCheckout(); } }}
              disabled={subLoading}
              style={{ width:"100%", background:"linear-gradient(135deg,#3B82F6,#6366F1)", border:"none", color:"#fff", borderRadius:18, padding:20, fontSize:17, fontWeight:800, cursor:"pointer", marginBottom:12 }}>
              {subLoading ? "⏳ ..." : authToken ? `💳 ${nativeLang==="uz" ? "Obuna bo'lish — $10/oy" : "Подписаться — $10/мес"}` : `🔑 ${nativeLang==="uz" ? "Kirish va obuna" : "Войти и подписаться"}`}
            </button>

            <div style={{ textAlign:"center", fontSize:12, color:"#4B5563" }}>
              {nativeLang==="uz" ? "Istalgan vaqtda bekor qilish mumkin" : "Отменить можно в любой момент"}
            </div>
          </div>
          <div style={{ height:32 }}/>
        </div>
      </div>
    );
  }

  return null;
}
