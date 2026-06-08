import { useState, useEffect, useRef, useCallback } from "react";

// в”Ђв”Ђв”Ђ API в”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђ
const API_URL = "http://localhost:3001"; // Р·Р°РјРµРЅРё РЅР° Railway URL РІ РїСЂРѕРґРµ

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


// в”Ђв”Ђв”Ђ SPEECH SYNTHESIS в”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђ
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
    title="РџСЂРѕСЃР»СѓС€Р°С‚СЊ"
  >рџ”Љ</button>
);

// в”Ђв”Ђв”Ђ CONSTANTS в”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђ
const PRICE_PER_LANG = 10; // $10/month for English
const MAX_LIVES = 3;
const XP_PER_EXERCISE = 10;
const XP_PER_LESSON = 50;

const NATIVE_LANGS = [
  { code: "ru", name: "Русский", flag: "🇷🇺", img: "ru" },
  { code: "uz", name: "O'zbek", flag: "🇺🇿", img: "uz" },
];

// Flag colors map
const FLAG_COLORS = {
  ru: ["#FFFFFF","#0039A6","#D52B1E"],
  uz: ["#1EB53A","#FFFFFF","#CE1126"],
  gb: ["#012169","#FFFFFF","#C8102E"],
  en: ["#012169","#FFFFFF","#C8102E"],
  de: ["#000000","#DD0000","#FFCE00"],
  tr: ["#E30A17","#FFFFFF","#E30A17"],
  sa: ["#006C35","#FFFFFF","#006C35"],
  ir: ["#239F40","#FFFFFF","#DA0000"],
  cn: ["#DE2910","#FFDE00","#DE2910"],
  es: ["#AA151B","#F1BF00","#AA151B"],
};
const FLAG_EMOJI = {
  ru:"рџ‡·рџ‡є", uz:"рџ‡єрџ‡ї",
};
const FlagImg = ({ code, size = 32 }) => {
  const c = FLAG_COLORS[code] || ["#6366F1","#fff","#6366F1"];
  const h = Math.round(size * 0.67);
  const s3 = Math.round(h/3);
  return (
    <svg width={size} height={h} style={{ borderRadius:3, flexShrink:0 }} viewBox={`0 0 ${size} ${h}`}>
      <rect x="0" y="0" width={size} height={s3} fill={c[0]}/>
      <rect x="0" y={s3} width={size} height={s3} fill={c[1]}/>
      <rect x="0" y={s3*2} width={size} height={s3} fill={c[2]}/>
    </svg>
  );
};

const LANGUAGES = [
  { code: "en", name: "English", flag: "рџ‡¬рџ‡§", img: "gb", color: "#3B82F6" },
];

const LEVELS = ["beginner", "intermediate", "advanced"];

// в”Ђв”Ђв”Ђ UI STRINGS в”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђ
const UI = {
  ru: {
    selectNative:"Р’С‹Р±РµСЂРё СЂРѕРґРЅРѕР№ СЏР·С‹Рє", chooseToLearn:"РЇР—Р«РљР Р”Р›РЇ РР—РЈР§Р•РќРРЇ",
    days:"РґРЅРµР№", xp:"XP", langs:"СЏР·С‹РєРѕРІ", pricingBtn:"рџ’Ћ РўР°СЂРёС„С‹ Рё С†РµРЅС‹",
    lessons:"РЈР РћРљР", words:"СЃР»РѕРІ", questions:"Р·Р°РґР°РЅРёР№",
    aiTitle:"AI РќР°СЃС‚Р°РІРЅРёРє", aiOnline:"в—Џ РѕРЅР»Р°Р№РЅ", aiPlaceholder:"РќР°РїРёС€РёС‚Рµ...",
    pricing:"РўР°СЂРёС„С‹", langPrice:"$10/РјРµСЃ Р·Р° СЏР·С‹Рє",
    free4th:"3 СЏР·С‹РєР° в†’ 4-Р№ Р‘Р•РЎРџР›РђРўРќРћ (-$10)",
    free6th:"5 СЏР·С‹РєРѕРІ в†’ 6-Р№ Р‘Р•РЎРџР›РђРўРќРћ + СЃРєРёРґРєР° $5/РјРµСЃ",
    selectedLangs:"Р’С‹Р±СЂР°РЅРѕ", total:"РС‚РѕРіРѕ", discount:"РЎРєРёРґРєР°",
    free:"Р±РµСЃРїР»Р°С‚РЅРѕ", subscribe:"РџРѕРґРїРёСЃР°С‚СЊСЃСЏ",
    level:"РЈР РћР’Р•РќР¬", beginner:"РќР°С‡РёРЅР°СЋС‰РёР№", intermediate:"РЎСЂРµРґРЅРёР№", advanced:"РџСЂРѕРґРІРёРЅСѓС‚С‹Р№",
    levelDesc1:"РђР»С„Р°РІРёС‚, Р±Р°Р·РѕРІС‹Рµ СЃР»РѕРІР°", levelDesc2:"Р”РёР°Р»РѕРіРё, РіСЂР°РјРјР°С‚РёРєР°",
    levelDesc3:"Р‘РµРіР»РѕСЃС‚СЊ, РґРµР»РѕРІРѕР№ СЏР·С‹Рє", selectLevel:"Р’С‹Р±РµСЂРё СѓСЂРѕРІРµРЅСЊ",
    month:"/РјРµСЃ", next:"Р”Р°Р»РµРµ в†’", back:"в†ђ РќР°Р·Р°Рґ", check:"РџСЂРѕРІРµСЂРёС‚СЊ",
    correct:"Р’РµСЂРЅРѕ! рџЋ‰", wrong:"РќРµРІРµСЂРЅРѕ", lives:"Р–РёР·РЅРё",
    lessonDone:"РЈСЂРѕРє РїСЂРѕР№РґРµРЅ!", result:"Р РµР·СѓР»СЊС‚Р°С‚", continueBtn:"РџСЂРѕРґРѕР»Р¶РёС‚СЊ",
    exerciseTypes:{ translate:"РџРµСЂРµРІРµРґРё С„СЂР°Р·Сѓ", arrange:"РЎРѕСЃС‚Р°РІСЊ С„СЂР°Р·Сѓ", fill:"Р—Р°РїРѕР»РЅРё РїСЂРѕРїСѓСЃРє", choose:"Р’С‹Р±РµСЂРё РїРµСЂРµРІРѕРґ", listen:"РџСЂРѕСЃР»СѓС€Р°Р№ Рё РЅР°РїРёС€Рё" },
    tapWords:"РќР°Р¶РјРё РЅР° СЃР»РѕРІР° РїРѕ РїРѕСЂСЏРґРєСѓ", typeAnswer:"Р’РІРµРґРё РѕС‚РІРµС‚...",
    livesOut:"Р–РёР·РЅРё Р·Р°РєРѕРЅС‡РёР»РёСЃСЊ!", tryAgain:"РџРѕРїСЂРѕР±РѕРІР°С‚СЊ СЃРЅРѕРІР°",
    streak:"РЎРµСЂРёСЏ", perfect:"РРґРµР°Р»СЊРЅРѕ! в­ђ",
    hintBtn:"РџРѕРґСЃРєР°Р·РєР°", hintUsed:"РџРѕРґСЃРєР°Р·РєР° РёСЃРїРѕР»СЊР·РѕРІР°РЅР°",
  },
  en: {
    selectNative:"Choose your native language", chooseToLearn:"LANGUAGES TO LEARN",
    days:"days", xp:"XP", langs:"langs", pricingBtn:"рџ’Ћ Pricing",
    lessons:"LESSONS", words:"words", questions:"exercises",
    aiTitle:"AI Tutor", aiOnline:"в—Џ online", aiPlaceholder:"Type here...",
    pricing:"Pricing", langPrice:"$10/mo per language",
    free4th:"3 languages в†’ 4th FREE (-$10)",
    free6th:"5 languages в†’ 6th FREE + $5 off/mo",
    selectedLangs:"Selected", total:"Total", discount:"Discount",
    free:"free", subscribe:"Subscribe",
    level:"LEVEL", beginner:"Beginner", intermediate:"Intermediate", advanced:"Advanced",
    levelDesc1:"Alphabet, basic words", levelDesc2:"Dialogues, grammar",
    levelDesc3:"Fluency, business language", selectLevel:"Choose level",
    month:"/mo", next:"Next в†’", back:"в†ђ Back", check:"Check",
    correct:"Correct! рџЋ‰", wrong:"Wrong", lives:"Lives",
    lessonDone:"Lesson Complete!", result:"Score", continueBtn:"Continue",
    exerciseTypes:{ translate:"Translate the phrase", arrange:"Arrange the words", fill:"Fill in the blank", choose:"Choose translation", listen:"Listen and type" },
    tapWords:"Tap the words in order", typeAnswer:"Type your answer...",
    livesOut:"No lives left!", tryAgain:"Try again",
    streak:"Streak", perfect:"Perfect! в­ђ",
    hintBtn:"Hint", hintUsed:"Hint used",
  },
  uz: {
    selectNative:"Ona tilingizni tanlang", chooseToLearn:"O'RGANISH UCHUN TILLAR",
    days:"kun", xp:"XP", langs:"til", pricingBtn:"рџ’Ћ Kurs narxlari",
    lessons:"DARSLAR", words:"so'z", questions:"topshiriq",
    aiTitle:"AI Murabbiy", aiOnline:"в—Џ online", aiPlaceholder:"Yozing...",
    pricing:"Narxlar", langPrice:"$10/oy har bir til",
    free4th:"3 til в†’ 4-chi BEPUL (-$10)",
    free6th:"5 til в†’ 6-chi BEPUL + $5 chegirma/oy",
    selectedLangs:"Tanlangan", total:"Jami", discount:"Chegirma",
    free:"bepul", subscribe:"Obuna bo'lish",
    level:"DARAJA", beginner:"Boshlang'ich", intermediate:"O'rta", advanced:"Yuqori",
    levelDesc1:"Alifbo, asosiy so'zlar", levelDesc2:"Dialoglar, grammatika",
    levelDesc3:"Ravonlik, biznes tili", selectLevel:"Darajani tanlang",
    month:"/oy", next:"Keyingi в†’", back:"в†ђ Orqaga", check:"Tekshirish",
    correct:"To'g'ri! рџЋ‰", wrong:"Noto'g'ri", lives:"Jonlar",
    lessonDone:"Dars tugadi!", result:"Natija", continueBtn:"Davom etish",
    exerciseTypes:{ translate:"Iborani tarjima qiling", arrange:"So'zlarni tering", fill:"Bo'shliТ›ni to'ldiring", choose:"Tarjimani tanlang", listen:"Eshiting va yozing" },
    tapWords:"So'zlarga tartibda bosing", typeAnswer:"Javobingizni yozing...",
    livesOut:"Jonlar tugadi!", tryAgain:"Qayta urinib ko'ring",
    streak:"Seriya", perfect:"Mukammal! в­ђ",
    hintBtn:"Maslahat", hintUsed:"Maslahat ishlatildi",
  },
 

// в”Ђв”Ђв”Ђ LESSON DATA в”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђ
// Each lesson contains exercises. Exercise types:
// translate: given source phrase, type translation
// arrange: tap words in correct order to form translation
// fill: fill the blank in a sentence
// choose: multiple choice translation
const LESSON_DATA = {
  "en-beginner": [
    {
      id:1, emoji:"рџ‘‹", titles:{ ru:"РџСЂРёРІРµС‚СЃС‚РІРёСЏ", en:"Greetings", uz:"Salomlashish", tr:"SelamlaЕџma", ar:"Ш§Щ„ШЄШ­ЩЉШ§ШЄ", fa:"Ш§Ш­Щ€Ш§Щ„вЂЊЩѕШ±ШіЫЊ", zh:"й—®еЂ™", es:"Saludos", de:"BegrГјГџungen" },
      exercises: [
        { type:"choose", targetWord:"Hello", translations:{ ru:"РџСЂРёРІРµС‚", en:"Hi", uz:"Salom", tr:"Merhaba", ar:"Щ…Ш±Ш­ШЁШ§", fa:"ШіЩ„Ш§Щ…", zh:"дЅ еҐЅ", es:"Hola", de:"Hallo" }, distractors:{ ru:["РџРѕРєР°","РЎРїР°СЃРёР±Рѕ","РР·РІРёРЅРёС‚Рµ"], en:["Bye","Thanks","Sorry"], uz:["Xayr","Rahmat","Kechirasiz"], tr:["GГјle gГјle","TeЕџekkГјrler","Pardon"], ar:["Щ€ШЇШ§Ш№Ш§","ШґЩѓШ±Ш§","Щ…Ш№Ш°Ш±Ш©"], fa:["Ш®ШЇШ§Ш­Ш§ЩЃШё","Щ…Щ…Щ†Щ€Щ†","ШЁШЁШ®ШґЫЊШЇ"], zh:["е†Ќи§Ѓ","и°ўи°ў","еЇ№дёЌиµ·"], es:["AdiГіs","Gracias","PerdГіn"], de:["TschГјss","Danke","Entschuldigung"] } },
        { type:"arrange", sentence:{ ru:"РџСЂРёРІРµС‚ РєР°Рє РґРµР»Р°", en:"Hello how are you", uz:"Salom qanday siz", tr:"Merhaba nasД±lsД±n", ar:"Щ…Ш±Ш­ШЁШ§ ЩѓЩЉЩЃ Ш­Ш§Щ„Щѓ", fa:"ШіЩ„Ш§Щ… Ш­Ш§Щ„ШЄ Ъ†Ш·Щ€Ш±", zh:"дЅ еҐЅ дЅ  еҐЅеђ—", es:"Hola cГіmo estГЎs", de:"Hallo wie geht es dir" }, answer:"Hello how are you", words:["Hello","how","are","you","where","going"] },
        { type:"translate", source:{ ru:"РЎРїР°СЃРёР±Рѕ Р±РѕР»СЊС€РѕРµ!", en:"Thank you very much!", uz:"Katta rahmat!", tr:"Г‡ok teЕџekkГјrler!", ar:"ШґЩѓШ±Ш§ Ш¬ШІЩЉЩ„Ш§!", fa:"Ш®ЫЊЩ„ЫЊ Щ…Щ…Щ†Щ€Щ†!", zh:"йќћеёёж„џи°ўпјЃ", es:"ВЎMuchas gracias!", de:"Vielen Dank!" }, answer:"Thank you very much", accept:["thank you very much","thank you so much","thanks a lot"] },
        { type:"fill", sentence:"___ are you?", blank:"How", hint:{ ru:"РљР°Рє РґРµР»Р°?", en:"How are you?", uz:"Qandaysiz?", tr:"NasД±lsД±n?", ar:"ЩѓЩЉЩЃ Ш­Ш§Щ„ЩѓШџ", fa:"Ш­Ш§Щ„ШЄ Ъ†Ш·Щ€Ш±Щ‡Шџ", zh:"дЅ еҐЅеђ—пјџ", es:"ВїCГіmo estГЎs?", de:"Wie geht es dir?" }, options:["How","What","Where","Who"] },
        { type:"choose", targetWord:"Goodbye", translations:{ ru:"Р”Рѕ СЃРІРёРґР°РЅРёСЏ", en:"Farewell", uz:"Xayr", tr:"GГјle gГјle", ar:"Щ€ШЇШ§Ш№Ш§", fa:"Ш®ШЇШ§Ш­Ш§ЩЃШё", zh:"е†Ќи§Ѓ", es:"AdiГіs", de:"Auf Wiedersehen" }, distractors:{ ru:["РџСЂРёРІРµС‚","РЎРїР°СЃРёР±Рѕ","РџРѕР¶Р°Р»СѓР№СЃС‚Р°"], en:["Hello","Thanks","Please"], uz:["Salom","Rahmat","Iltimos"], tr:["Merhaba","TeЕџekkГјrler","LГјtfen"], ar:["Щ…Ш±Ш­ШЁШ§","ШґЩѓШ±Ш§","Щ…Щ† ЩЃШ¶Щ„Щѓ"], fa:["ШіЩ„Ш§Щ…","Щ…Щ…Щ†Щ€Щ†","Щ„Ш·ЩЃШ§Щ‹"], zh:["дЅ еҐЅ","и°ўи°ў","иЇ·"], es:["Hola","Gracias","Por favor"], de:["Hallo","Danke","Bitte"] } },
        { type:"arrange", sentence:{ ru:"РџРѕР¶Р°Р»СѓР№СЃС‚Р° РїРѕРјРѕРіРё РјРЅРµ", en:"Please help me", uz:"Iltimos menga yordam bering", tr:"LГјtfen bana yardД±m et", ar:"Щ…Щ† ЩЃШ¶Щ„Щѓ ШіШ§Ш№ШЇЩ†ЩЉ", fa:"Щ„Ш·ЩЃШ§Щ‹ Ъ©Щ…Ъ©Щ… Ъ©Щ†", zh:"иЇ·её®еЉ©ж€‘", es:"Por favor ayГєdame", de:"Bitte hilf mir" }, answer:"Please help me", words:["Please","help","me","take","give","you"] },
      ]
    },
    {
      id:2, emoji:"рџ”ў", titles:{ ru:"Р§РёСЃР»Р°", en:"Numbers", uz:"Raqamlar", tr:"SayД±lar", ar:"Ш§Щ„ШЈШ±Щ‚Ш§Щ…", fa:"Ш§Ш№ШЇШ§ШЇ", zh:"ж•°е­—", es:"NГєmeros", de:"Zahlen" },
      exercises: [
        { type:"choose", targetWord:"One", translations:{ ru:"РћРґРёРЅ", en:"1", uz:"Bir", tr:"Bir", ar:"Щ€Ш§Ш­ШЇ", fa:"ЫЊЪ©", zh:"дёЂ", es:"Uno", de:"Eins" }, distractors:{ ru:["Р”РІР°","РўСЂРё","Р§РµС‚С‹СЂРµ"], en:["Two","Three","Four"], uz:["Ikki","Uch","To'rt"], tr:["Д°ki","ГњГ§","DГ¶rt"], ar:["Ш§Ш«Щ†Ш§Щ†","Ш«Щ„Ш§Ш«Ш©","ШЈШ±ШЁШ№Ш©"], fa:["ШЇЩ€","ШіЩ‡","Ъ†Щ‡Ш§Ш±"], zh:["дєЊ","дё‰","е››"], es:["Dos","Tres","Cuatro"], de:["Zwei","Drei","Vier"] } },
        { type:"fill", sentence:"I have ___ apple.", blank:"one", hint:{ ru:"РЈ РјРµРЅСЏ РµСЃС‚СЊ РѕРґРЅРѕ СЏР±Р»РѕРєРѕ.", en:"I have one apple.", uz:"Menda bitta olma bor.", tr:"Bir elmam var.", ar:"Ш№Щ†ШЇЩЉ ШЄЩЃШ§Ш­Ш© Щ€Ш§Ш­ШЇШ©.", fa:"ЫЊЪ© ШіЫЊШЁ ШЇШ§Ш±Щ….", zh:"ж€‘жњ‰дёЂдёЄи‹№жћњгЂ‚", es:"Tengo una manzana.", de:"Ich habe einen Apfel." }, options:["one","two","ten","many"] },
        { type:"choose", targetWord:"Ten", translations:{ ru:"Р”РµСЃСЏС‚СЊ", en:"10", uz:"O'n", tr:"On", ar:"Ш№ШґШ±Ш©", fa:"ШЇЩ‡", zh:"еЌЃ", es:"Diez", de:"Zehn" }, distractors:{ ru:["РџСЏС‚СЊ","Р”РІР°","РўСЂРё"], en:["Five","Two","Three"], uz:["Besh","Ikki","Uch"], tr:["BeЕџ","Д°ki","ГњГ§"], ar:["Ш®Щ…ШіШ©","Ш§Ш«Щ†Ш§Щ†","Ш«Щ„Ш§Ш«Ш©"], fa:["ЩѕЩ†Ш¬","ШЇЩ€","ШіЩ‡"], zh:["дє”","дєЊ","дё‰"], es:["Cinco","Dos","Tres"], de:["FГјnf","Zwei","Drei"] } },
        { type:"arrange", sentence:{ ru:"РЈ РјРµРЅСЏ РїСЏС‚СЊ РєРЅРёРі", en:"I have five books", uz:"Menda beshta kitob bor", tr:"BeЕџ kitabД±m var", ar:"Ш№Щ†ШЇЩЉ Ш®Щ…ШіШ© ЩѓШЄШЁ", fa:"ЩѕЩ†Ш¬ Ъ©ШЄШ§ШЁ ШЇШ§Ш±Щ…", zh:"ж€‘жњ‰дє”жњ¬д№¦", es:"Tengo cinco libros", de:"Ich habe fГјnf BГјcher" }, answer:"I have five books", words:["I","have","five","books","ten","read"] },
        { type:"translate", source:{ ru:"РўСЂРё РґРЅСЏ", en:"Three days", uz:"Uch kun", tr:"ГњГ§ gГјn", ar:"Ш«Щ„Ш§Ш«Ш© ШЈЩЉШ§Щ…", fa:"ШіЩ‡ Ш±Щ€ШІ", zh:"дё‰е¤©", es:"Tres dГ­as", de:"Drei Tage" }, answer:"three days", accept:["three days"] },
      ]
    },
    {
      id:3, emoji:"рџЌ•", titles:{ ru:"Р•РґР°", en:"Food", uz:"Ovqat", tr:"Yiyecek", ar:"Ш§Щ„Ш·Ш№Ш§Щ…", fa:"ШєШ°Ш§", zh:"йЈџз‰©", es:"Comida", de:"Essen" },
      exercises: [
        { type:"choose", targetWord:"Water", translations:{ ru:"Р’РѕРґР°", en:"Hв‚‚O", uz:"Suv", tr:"Su", ar:"Щ…Ш§ШЎ", fa:"ШўШЁ", zh:"ж°ґ", es:"Agua", de:"Wasser" }, distractors:{ ru:["РљРѕС„Рµ","Р§Р°Р№","РЎРѕРє"], en:["Coffee","Tea","Juice"], uz:["Qahva","Choy","Sharbat"], tr:["Kahve","Г‡ay","Meyve suyu"], ar:["Щ‚Щ‡Щ€Ш©","ШґШ§ЩЉ","Ш№ШµЩЉШ±"], fa:["Щ‚Щ‡Щ€Щ‡","Ъ†Ш§ЫЊ","ШўШЁЩ…ЫЊЩ€Щ‡"], zh:["е’–е•Ў","иЊ¶","жћњж±Ѓ"], es:["CafГ©","TГ©","Jugo"], de:["Kaffee","Tee","Saft"] } },
        { type:"arrange", sentence:{ ru:"РЇ С…РѕС‡Сѓ РєРѕС„Рµ РїРѕР¶Р°Р»СѓР№СЃС‚Р°", en:"I want coffee please", uz:"Iltimos menga qahva bering", tr:"Kahve istiyorum lГјtfen", ar:"ШЈШ±ЩЉШЇ Щ‚Щ‡Щ€Ш© Щ…Щ† ЩЃШ¶Щ„Щѓ", fa:"Щ‚Щ‡Щ€Щ‡ Щ…ЫЊШ®Щ€Ш§Щ… Щ„Ш·ЩЃШ§Щ‹", zh:"ж€‘и¦Ѓе’–е•ЎиЇ·", es:"Quiero cafГ© por favor", de:"Ich mГ¶chte Kaffee bitte" }, answer:"I want coffee please", words:["I","want","coffee","please","eat","drink"] },
        { type:"fill", sentence:"This is ___!", blank:"delicious", hint:{ ru:"Р­С‚Рѕ РІРєСѓСЃРЅРѕ!", en:"This is delicious!", uz:"Bu mazali!", tr:"Bu lezzetli!", ar:"Щ‡Ш°Ш§ Щ„Ш°ЩЉШ°!", fa:"Ш§ЫЊЩ† Ш®Щ€ШґЩ…ШІЩ‡ Ш§ШіШЄ!", zh:"иї™еѕ€зѕЋе‘іпјЃ", es:"ВЎEsto es delicioso!", de:"Das ist lecker!" }, options:["delicious","terrible","small","old"] },
        { type:"translate", source:{ ru:"РЎРІРµР¶РёР№ С…Р»РµР±", en:"Fresh bread", uz:"Yangi non", tr:"Taze ekmek", ar:"Ш®ШЁШІ Ш·Ш§ШІШ¬", fa:"Щ†Ш§Щ† ШЄШ§ШІЩ‡", zh:"ж–°йІњйќўеЊ…", es:"Pan fresco", de:"Frisches Brot" }, answer:"fresh bread", accept:["fresh bread"] },
        { type:"choose", targetWord:"Breakfast", translations:{ ru:"Р—Р°РІС‚СЂР°Рє", en:"Morning meal", uz:"Nonushta", tr:"KahvaltД±", ar:"Щ€Ш¬ШЁШ© Ш§Щ„ЩЃШ·Щ€Ш±", fa:"ШµШЁШ­Ш§Щ†Щ‡", zh:"ж—©й¤ђ", es:"Desayuno", de:"FrГјhstГјck" }, distractors:{ ru:["РћР±РµРґ","РЈР¶РёРЅ","РџРµСЂРµРєСѓСЃ"], en:["Lunch","Dinner","Snack"], uz:["Tushlik","Kechki ovqat","Gazak"], tr:["Г–Дџle yemeДџi","AkЕџam yemeДџi","AtД±ЕџtД±rmalД±k"], ar:["ШєШЇШ§ШЎ","Ш№ШґШ§ШЎ","Щ€Ш¬ШЁШ© Ш®ЩЃЩЉЩЃШ©"], fa:["Щ†Ш§Щ‡Ш§Ш±","ШґШ§Щ…","Щ…ЫЊШ§Щ†вЂЊЩ€Ш№ШЇЩ‡"], zh:["еЌ€й¤ђ","ж™љй¤ђ","й›¶йЈџ"], es:["Almuerzo","Cena","Merienda"], de:["Mittagessen","Abendessen","Snack"] } },
      ]
    },
    {
      id:4, emoji:"рџЏ ", titles:{ ru:"Р”РѕРј", en:"Home", uz:"Uy", tr:"Ev", ar:"Ш§Щ„Щ…Щ†ШІЩ„", fa:"Ш®Ш§Щ†Щ‡", zh:"е®¶", es:"Hogar", de:"Zuhause" },
      exercises: [
        { type:"choose", targetWord:"House", translations:{ ru:"Р”РѕРј", en:"Building", uz:"Uy", tr:"Ev", ar:"Щ…Щ†ШІЩ„", fa:"Ш®Ш§Щ†Щ‡", zh:"ж€їе­ђ", es:"Casa", de:"Haus" }, distractors:{ ru:["РљРІР°СЂС‚РёСЂР°","РљРѕРјРЅР°С‚Р°","РћС„РёСЃ"], en:["Apartment","Room","Office"], uz:["Kvartira","Xona","Ofis"], tr:["Daire","Oda","Ofis"], ar:["ШґЩ‚Ш©","ШєШ±ЩЃШ©","Щ…ЩѓШЄШЁ"], fa:["ШўЩѕШ§Ш±ШЄЩ…Ш§Щ†","Ш§ШЄШ§Щ‚","ШЇЩЃШЄШ±"], zh:["е…¬еЇ“","ж€їй—ґ","еЉће…¬е®¤"], es:["Apartamento","HabitaciГіn","Oficina"], de:["Wohnung","Zimmer","BГјro"] } },
        { type:"arrange", sentence:{ ru:"РњРѕР№ РґРѕРј Р±РѕР»СЊС€РѕР№", en:"My house is big", uz:"Mening uyim katta", tr:"Evim bГјyГјk", ar:"ШЁЩЉШЄЩЉ ЩѓШЁЩЉШ±", fa:"Ш®Ш§Щ†Щ‡вЂЊШ§Щ… ШЁШІШ±ЪЇ Ш§ШіШЄ", zh:"ж€‘зљ„ж€їе­ђеѕ€е¤§", es:"Mi casa es grande", de:"Mein Haus ist groГџ" }, answer:"My house is big", words:["My","house","is","big","small","their"] },
        { type:"fill", sentence:"I live in a ___.", blank:"house", hint:{ ru:"РЇ Р¶РёРІСѓ РІ РґРѕРјРµ.", en:"I live in a house.", uz:"Men uyda yashayman.", tr:"Bir evde yaЕџД±yorum.", ar:"ШЈЩ†Ш§ ШЈШ№ЩЉШґ ЩЃЩЉ Щ…Щ†ШІЩ„.", fa:"ШЇШ± Ш®Ш§Щ†Щ‡вЂЊШ§ЫЊ ШІЩ†ШЇЪЇЫЊ Щ…ЫЊвЂЊЪ©Щ†Щ….", zh:"ж€‘дЅЏењЁдёЂж‰Ђж€їе­ђй‡ЊгЂ‚", es:"Vivo en una casa.", de:"Ich lebe in einem Haus." }, options:["house","car","tree","boat"] },
        { type:"translate", source:{ ru:"Р‘РѕР»СЊС€Р°СЏ РєРѕРјРЅР°С‚Р°", en:"Big room", uz:"Katta xona", tr:"BГјyГјk oda", ar:"ШєШ±ЩЃШ© ЩѓШЁЩЉШ±Ш©", fa:"Ш§ШЄШ§Щ‚ ШЁШІШ±ЪЇ", zh:"е¤§ж€їй—ґ", es:"HabitaciГіn grande", de:"GroГџes Zimmer" }, answer:"big room", accept:["big room","large room"] },
      ]
    },
  ],
  "en-intermediate": [
    {
      id:1, emoji:"рџ’ј", titles:{ ru:"Р Р°Р±РѕС‚Р°", en:"Work", uz:"Ish", tr:"Д°Еџ", ar:"Ш§Щ„Ш№Щ…Щ„", fa:"Ъ©Ш§Ш±", zh:"е·ҐдЅњ", es:"Trabajo", de:"Arbeit" },
      exercises: [
        { type:"choose", targetWord:"Meeting", translations:{ ru:"Р’СЃС‚СЂРµС‡Р°/РЎРѕРІРµС‰Р°РЅРёРµ", en:"Gathering", uz:"Yig'ilish", tr:"ToplantД±", ar:"Ш§Ш¬ШЄЩ…Ш§Ш№", fa:"Ш¬Щ„ШіЩ‡", zh:"дјљи®®", es:"ReuniГіn", de:"Besprechung" }, distractors:{ ru:["РџРµСЂРµСЂС‹РІ","Р’РµС‡РµСЂРёРЅРєР°","Р—РІРѕРЅРѕРє"], en:["Break","Party","Call"], uz:["Tanaffus","Ziyofat","Qo'ng'iroq"], tr:["Mola","Parti","Arama"], ar:["Ш§ШіШЄШ±Ш§Ш­Ш©","Ш­ЩЃЩ„Ш©","Щ…ЩѓШ§Щ„Щ…Ш©"], fa:["Ш§ШіШЄШ±Ш§Ш­ШЄ","Щ…Щ‡Щ…Ш§Щ†ЫЊ","ШЄЩ…Ш§Ші"], zh:["дј‘жЃЇ","жґѕеЇ№","з”µиЇќ"], es:["Descanso","Fiesta","Llamada"], de:["Pause","Party","Anruf"] } },
        { type:"translate", source:{ ru:"Р”РµРґР»Р°Р№РЅ Р·Р°РІС‚СЂР°.", en:"The deadline is tomorrow.", uz:"Muddat ertaga.", tr:"Son tarih yarД±n.", ar:"Ш§Щ„Щ…Щ€Ш№ШЇ Ш§Щ„Щ†Щ‡Ш§Ш¦ЩЉ ШєШЇШ§.", fa:"Щ…Щ‡Щ„ШЄ ЩЃШ±ШЇШ§ Ш§ШіШЄ.", zh:"ж€Єж­ўж—ҐжњџжЇжЋе¤©гЂ‚", es:"El plazo es maГ±ana.", de:"Die Frist ist morgen." }, answer:"the deadline is tomorrow", accept:["the deadline is tomorrow","deadline is tomorrow"] },
        { type:"arrange", sentence:{ ru:"РњРѕР№ РєРѕР»Р»РµРіР° РѕС‡РµРЅСЊ РїРѕР»РµР·РµРЅ", en:"My colleague is very helpful", uz:"Mening hamkashim juda foydali", tr:"MeslektaЕџД±m Г§ok yardД±msever", ar:"ШІЩ…ЩЉЩ„ЩЉ Щ…ЩЃЩЉШЇ Ш¬ШЇШ§", fa:"Щ‡Щ…Ъ©Ш§Ш±Щ… Ш®ЫЊЩ„ЫЊ Щ…ЩЃЫЊШЇ Ш§ШіШЄ", zh:"ж€‘зљ„еђЊдє‹йќћеёёжњ‰её®еЉ©", es:"Mi colega es muy Гєtil", de:"Mein Kollege ist sehr hilfreich" }, answer:"My colleague is very helpful", words:["My","colleague","is","very","helpful","lazy","meeting"] },
        { type:"fill", sentence:"What is your ___?", blank:"salary", hint:{ ru:"РљР°РєР°СЏ Сѓ С‚РµР±СЏ Р·Р°СЂРїР»Р°С‚Р°?", en:"What is your salary?", uz:"Maoshingiz qancha?", tr:"MaaЕџД±n ne kadar?", ar:"Щ…Ш§ Щ‡Щ€ Ш±Ш§ШЄШЁЩѓШџ", fa:"Ш­Щ‚Щ€Щ‚ШЄ Ъ†Щ‚ШЇШ±Щ‡Шџ", zh:"дЅ зљ„и–Єж°ґжЇе¤ље°‘пјџ", es:"ВїCuГЎl es tu salario?", de:"Was ist dein Gehalt?" }, options:["salary","name","house","car"] },
        { type:"choose", targetWord:"Project", translations:{ ru:"РџСЂРѕРµРєС‚", en:"Assignment", uz:"Loyiha", tr:"Proje", ar:"Щ…ШґШ±Щ€Ш№", fa:"ЩѕШ±Щ€ЪЩ‡", zh:"йЎ№з›®", es:"Proyecto", de:"Projekt" }, distractors:{ ru:["Р’СЃС‚СЂРµС‡Р°","РћС‚С‡С‘С‚","РћС„РёСЃ"], en:["Meeting","Report","Office"], uz:["Yig'ilish","Hisobot","Ofis"], tr:["ToplantД±","Rapor","Ofis"], ar:["Ш§Ш¬ШЄЩ…Ш§Ш№","ШЄЩ‚Ш±ЩЉШ±","Щ…ЩѓШЄШЁ"], fa:["Ш¬Щ„ШіЩ‡","ЪЇШІШ§Ш±Шґ","ШЇЩЃШЄШ±"], zh:["дјљи®®","жЉҐе‘Љ","еЉће…¬е®¤"], es:["ReuniГіn","Informe","Oficina"], de:["Besprechung","Bericht","BГјro"] } },
      ]
    },
    {
      id:2, emoji:"рџЏ™пёЏ", titles:{ ru:"Р“РѕСЂРѕРґ", en:"City", uz:"Shahar", tr:"Ећehir", ar:"Ш§Щ„Щ…ШЇЩЉЩ†Ш©", fa:"ШґЩ‡Ш±", zh:"еџЋеё‚", es:"Ciudad", de:"Stadt" },
      exercises: [
        { type:"choose", targetWord:"Subway", translations:{ ru:"РњРµС‚СЂРѕ", en:"Underground", uz:"Metro", tr:"Metro", ar:"Щ…ШЄШ±Щ€", fa:"Щ…ШЄШ±Щ€", zh:"ењ°й“Ѓ", es:"Metro", de:"U-Bahn" }, distractors:{ ru:["РђРІС‚РѕР±СѓСЃ","РўСЂР°РјРІР°Р№","РўР°РєСЃРё"], en:["Bus","Tram","Taxi"], uz:["Avtobus","Tramvay","Taksi"], tr:["OtobГјs","Tramvay","Taksi"], ar:["Ш­Ш§ЩЃЩ„Ш©","ШЄШ±Ш§Щ…","ШіЩЉШ§Ш±Ш© ШЈШ¬Ш±Ш©"], fa:["Ш§ШЄЩ€ШЁЩ€Ші","ШЄШ±Ш§Щ…Щ€Ш§","ШЄШ§Ъ©ШіЫЊ"], zh:["е…¬дє¤","з”µиЅ¦","е‡єз§џиЅ¦"], es:["AutobГєs","TranvГ­a","Taxi"], de:["Bus","StraГџenbahn","Taxi"] } },
        { type:"translate", source:{ ru:"Р—РґРµСЃСЊ РјРЅРѕРіРѕ РїСЂРѕР±РѕРє.", en:"There is heavy traffic here.", uz:"Bu yerda tiqilinch ko'p.", tr:"Burada yoДџun trafik var.", ar:"ЩЉЩ€Ш¬ШЇ Ш§ШІШЇШ­Ш§Щ… Щ…Ш±Щ€Ш±ЩЉ Щ‡Щ†Ш§.", fa:"Ш§ЫЊЩ†Ш¬Ш§ ШЄШ±Ш§ЩЃЫЊЪ© ШіЩ†ЪЇЫЊЩ† Ш§ШіШЄ.", zh:"иї™й‡Њдє¤йЂљеѕ€ж‹ҐжЊ¤гЂ‚", es:"Hay mucho trГЎfico aquГ­.", de:"Hier ist viel Verkehr." }, answer:"there is heavy traffic here", accept:["there is heavy traffic here","there is a lot of traffic here","there's heavy traffic here"] },
        { type:"arrange", sentence:{ ru:"РђРїС‚РµРєР° СЂСЏРґРѕРј СЃ Р±Р°РЅРєРѕРј", en:"The pharmacy is near the bank", uz:"Dorixona bankga yaqin", tr:"Eczane bankanД±n yanД±nda", ar:"Ш§Щ„ШµЩЉШЇЩ„ЩЉШ© Щ‚Ш±ЩЉШЁШ© Щ…Щ† Ш§Щ„ШЁЩ†Щѓ", fa:"ШЇШ§Ш±Щ€Ш®Ш§Щ†Щ‡ Щ†ШІШЇЫЊЪ© ШЁШ§Щ†Ъ© Ш§ШіШЄ", zh:"иЌЇеє—ењЁй“¶иЎЊй™„иї‘", es:"La farmacia estГЎ cerca del banco", de:"Die Apotheke ist nah an der Bank" }, answer:"The pharmacy is near the bank", words:["The","pharmacy","is","near","the","bank","far","store"] },
        { type:"fill", sentence:"I live in a nice ___.", blank:"neighborhood", hint:{ ru:"РЇ Р¶РёРІСѓ РІ С…РѕСЂРѕС€РµРј СЂР°Р№РѕРЅРµ.", en:"I live in a nice neighborhood.", uz:"Men yaxshi mahallada yashayman.", tr:"GГјzel bir mahallede yaЕџД±yorum.", ar:"ШЈШ№ЩЉШґ ЩЃЩЉ Ш­ЩЉ Ш¬Щ…ЩЉЩ„.", fa:"ШЇШ± Щ…Ш­Щ„Щ‡ Ш®Щ€ШЁЫЊ ШІЩ†ШЇЪЇЫЊ Щ…ЫЊвЂЊЪ©Щ†Щ….", zh:"ж€‘дЅЏењЁдёЂдёЄеҐЅиЎ—еЊєгЂ‚", es:"Vivo en un buen barrio.", de:"Ich lebe in einem schГ¶nen Viertel." }, options:["neighborhood","country","planet","ocean"] },
      ]
    },
  ],
  "en-advanced": [
    {
      id:1, emoji:"рџЋЇ", titles:{ ru:"Р‘РёР·РЅРµСЃ-СЏР·С‹Рє", en:"Business English", uz:"Biznes tili", tr:"Д°Еџ Д°ngilizcesi", ar:"Щ„ШєШ© Ш§Щ„ШЈШ№Щ…Ш§Щ„", fa:"Ш§Щ†ЪЇЩ„ЫЊШіЫЊ ШЄШ¬Ш§Ш±ЫЊ", zh:"е•†еЉЎи‹±иЇ­", es:"InglГ©s de negocios", de:"GeschГ¤ftsenglisch" },
      exercises: [
        { type:"choose", targetWord:"Leverage", translations:{ ru:"Р С‹С‡Р°Рі РІР»РёСЏРЅРёСЏ / РёСЃРїРѕР»СЊР·РѕРІР°С‚СЊ", en:"Use as advantage", uz:"Foydalanish", tr:"KaldД±raГ§ etkisi", ar:"Ш§Щ„Ш§ШіШЄЩЃШ§ШЇШ© Щ…Щ†", fa:"Ш§Щ‡Ш±Щ…", zh:"е€©з”ЁдјеЉї", es:"Aprovechar", de:"Hebel/Nutzen" }, distractors:{ ru:["РџРѕС‚РµСЂСЏС‚СЊ","РРіРЅРѕСЂРёСЂРѕРІР°С‚СЊ","РЎР»РѕРјР°С‚СЊ"], en:["Ignore","Break","Lose"], uz:["E'tiborsiz","Buzmoq","Yo'qotmoq"], tr:["GГ¶rmezden gel","KД±r","Kaybet"], ar:["ШЄШ¬Ш§Щ‡Щ„","ЩѓШіШ±","Ш®ШіШ±"], fa:["Щ†Ш§ШЇЫЊШЇЩ‡ ЪЇШ±ЩЃШЄЩ†","ШґЪ©ШіШЄЩ†","Ш§ШІ ШЇШіШЄ ШЇШ§ШЇЩ†"], zh:["еїЅз•Ґ","ж‰“з ґ","е¤±еЋ»"], es:["Ignorar","Romper","Perder"], de:["Ignorieren","Brechen","Verlieren"] } },
        { type:"translate", source:{ ru:"РќР°Рј РЅСѓР¶РЅРѕ РёСЃРїРѕР»СЊР·РѕРІР°С‚СЊ РЅР°С€Сѓ СЃРµС‚СЊ РєРѕРЅС‚Р°РєС‚РѕРІ.", en:"We need to leverage our network.", uz:"Biz tarmog'imizdan foydalanishimiz kerak.", tr:"AДџД±mД±zdan yararlanmamД±z gerekiyor.", ar:"Щ†Ш­ШЄШ§Ш¬ ШҐЩ„Щ‰ Ш§Щ„Ш§ШіШЄЩЃШ§ШЇШ© Щ…Щ† ШґШЁЩѓШЄЩ†Ш§.", fa:"ШЁШ§ЫЊШЇ Ш§ШІ ШґШЁЪ©Щ‡вЂЊЩ…Ш§Щ† Ш§ШіШЄЩЃШ§ШЇЩ‡ Ъ©Щ†ЫЊЩ….", zh:"ж€‘д»¬йњЂи¦Ѓе€©з”Ёж€‘д»¬зљ„зЅ‘з»њгЂ‚", es:"Necesitamos aprovechar nuestra red.", de:"Wir mГјssen unser Netzwerk nutzen." }, answer:"we need to leverage our network", accept:["we need to leverage our network","we must leverage our network"] },
        { type:"arrange", sentence:{ ru:"РЎРѕРІРјРµСЃС‚РЅР°СЏ СЂР°Р±РѕС‚Р° РєРѕРјР°РЅРґС‹ РґР°С‘С‚ СЂРµР·СѓР»СЊС‚Р°С‚С‹", en:"Team synergy drives results", uz:"Jamoa sinergiyasi natijalar beradi", tr:"TakД±m sinerjisi sonuГ§lar doДџurur", ar:"ШЄШўШІШ± Ш§Щ„ЩЃШ±ЩЉЩ‚ ЩЉШ­Щ‚Щ‚ Ш§Щ„Щ†ШЄШ§Ш¦Ш¬", fa:"Щ‡Щ…вЂЊШ§ЩЃШІШ§ЫЊЫЊ ШЄЫЊЩ… Щ†ШЄЫЊШ¬Щ‡ Щ…ЫЊвЂЊШЇЩ‡ШЇ", zh:"е›ўйџеЌЏеђЊжЋЁеЉЁз»“жћњ", es:"La sinergia del equipo impulsa los resultados", de:"Teamsynergie treibt Ergebnisse voran" }, answer:"Team synergy drives results", words:["Team","synergy","drives","results","blocks","loses","random"] },
        { type:"fill", sentence:"I don't have the ___ for that right now.", blank:"bandwidth", hint:{ ru:"РЈ РјРµРЅСЏ СЃРµР№С‡Р°СЃ РЅРµС‚ СЂРµСЃСѓСЂСЃРѕРІ РЅР° СЌС‚Рѕ.", en:"I don't have the bandwidth for that.", uz:"Bunga vaqtim yo'q.", tr:"Bunun iГ§in kapasitem yok.", ar:"Щ„ЩЉШі Щ„ШЇЩЉ Ш§Щ„Ш·Ш§Щ‚Ш© Щ„Ш°Щ„Щѓ Ш§Щ„ШўЩ†.", fa:"Ш§Щ„Ш§Щ† ШёШ±ЩЃЫЊШЄШґ Ш±Щ€ Щ†ШЇШ§Ш±Щ….", zh:"ж€‘зЋ°ењЁжІЎжњ‰зІѕеЉ›еЃљй‚Јд»¶дє‹гЂ‚", es:"No tengo capacidad para eso ahora.", de:"DafГјr habe ich gerade keine KapazitГ¤t." }, options:["bandwidth","coffee","time","money"] },
      ]
    },
  ],
  
    {
      id:2, emoji:"рџ”ў", titles:{ ru:"Р§РёСЃР»Р°", en:"Numbers", uz:"Raqamlar", tr:"SayД±lar", ar:"Ш§Щ„ШЈШ±Щ‚Ш§Щ…", fa:"Ш§Ш№ШЇШ§ШЇ", zh:"ж•°е­—", es:"NГєmeros", de:"Zahlen" },
      exercises: [
        { type:"choose", targetWord:"Bir", translations:{ ru:"РћРґРёРЅ", en:"One", uz:"Bir", tr:"1", ar:"Щ€Ш§Ш­ШЇ", fa:"ЫЊЪ©", zh:"дёЂ", es:"Uno", de:"Eins" }, distractors:{ ru:["Р”РІР°","РўСЂРё","РџСЏС‚СЊ"], en:["Two","Three","Five"], uz:["Ikki","Uch","Besh"], tr:["Д°ki","ГњГ§","BeЕџ"], ar:["Ш§Ш«Щ†Ш§Щ†","Ш«Щ„Ш§Ш«Ш©","Ш®Щ…ШіШ©"], fa:["ШЇЩ€","ШіЩ‡","ЩѕЩ†Ш¬"], zh:["дєЊ","дё‰","дє”"], es:["Dos","Tres","Cinco"], de:["Zwei","Drei","FГјnf"] } },
        { type:"arrange", sentence:{ ru:"РЈ РјРµРЅСЏ РґРІР° СЏР±Р»РѕРєР°", en:"I have two apples", uz:"Menda ikkita olma bor", tr:"Д°ki elmam var", ar:"Ш№Щ†ШЇЩЉ ШЄЩЃШ§Ш­ШЄШ§Щ†", fa:"ШЇЩ€ ШіЫЊШЁ ШЇШ§Ш±Щ…", zh:"ж€‘жњ‰дё¤дёЄи‹№жћњ", es:"Tengo dos manzanas", de:"Ich habe zwei Г„pfel" }, answer:"Д°ki elmam var", words:["Д°ki","elmam","var","ГјГ§","yok","beЕџ"] },
        { type:"fill", sentence:"___ dakika bekleyin.", blank:"On", hint:{ ru:"РџРѕРґРѕР¶РґРёС‚Рµ РґРµСЃСЏС‚СЊ РјРёРЅСѓС‚.", en:"Wait ten minutes.", uz:"O'n daqiqa kuting.", tr:"On dakika bekleyin.", ar:"Ш§Щ†ШЄШёШ± Ш№ШґШ± ШЇЩ‚Ш§Ш¦Щ‚.", fa:"ШЇЩ‡ ШЇЩ‚ЫЊЩ‚Щ‡ ШµШЁШ± Ъ©Щ†.", zh:"з­‰еЌЃе€†й’џгЂ‚", es:"Espera diez minutos.", de:"Warte zehn Minuten." }, options:["On","Bir","YГјz","BeЕџ bin"] },
        { type:"translate", source:{ ru:"РџСЏС‚СЊ С‡РµР»РѕРІРµРє", en:"Five people", uz:"Besh kishi", tr:"Five people", ar:"Ш®Щ…ШіШ© ШЈШґШ®Ш§Шµ", fa:"ЩѕЩ†Ш¬ Щ†ЩЃШ±", zh:"дє”дёЄдєє", es:"Cinco personas", de:"FГјnf Personen" }, answer:"beЕџ kiЕџi", accept:["beЕџ kiЕџi","beЕџ insan"] },
      ]
    },
    {
      id:3, emoji:"рџЌ•", titles:{ ru:"Р•РґР°", en:"Food", uz:"Ovqat", tr:"Yiyecek", ar:"Ш§Щ„Ш·Ш№Ш§Щ…", fa:"ШєШ°Ш§", zh:"йЈџз‰©", es:"Comida", de:"Essen" },
      exercises: [
        { type:"choose", targetWord:"Su", translations:{ ru:"Р’РѕРґР°", en:"Water", uz:"Suv", tr:"Hв‚‚O", ar:"Щ…Ш§ШЎ", fa:"ШўШЁ", zh:"ж°ґ", es:"Agua", de:"Wasser" }, distractors:{ ru:["РљРѕС„Рµ","Р§Р°Р№","РњРѕР»РѕРєРѕ"], en:["Coffee","Tea","Milk"], uz:["Qahva","Choy","Sut"], tr:["Kahve","Г‡ay","SГјt"], ar:["Щ‚Щ‡Щ€Ш©","ШґШ§ЩЉ","Ш­Щ„ЩЉШЁ"], fa:["Щ‚Щ‡Щ€Щ‡","Ъ†Ш§ЫЊ","ШґЫЊШ±"], zh:["е’–е•Ў","иЊ¶","з‰›еҐ¶"], es:["CafГ©","TГ©","Leche"], de:["Kaffee","Tee","Milch"] } },
        { type:"arrange", sentence:{ ru:"Р­С‚Рѕ РѕС‡РµРЅСЊ РІРєСѓСЃРЅРѕ", en:"This is very delicious", uz:"Bu juda mazali", tr:"This is very delicious", ar:"Щ‡Ш°Ш§ Щ„Ш°ЩЉШ° Ш¬ШЇШ§", fa:"Ш§ЫЊЩ† Ш®ЫЊЩ„ЫЊ Ш®Щ€ШґЩ…ШІЩ‡ Ш§ШіШЄ", zh:"иї™йќћеёёзѕЋе‘і", es:"Esto es muy delicioso", de:"Das ist sehr lecker" }, answer:"Bu Г§ok lezzetli", words:["Bu","Г§ok","lezzetli","gГјzel","kГ¶tГј","uzak"] },
        { type:"fill", sentence:"TГјrk ___ iГ§mek istiyorum.", blank:"kahvesi", hint:{ ru:"РҐРѕС‡Сѓ РІС‹РїРёС‚СЊ С‚СѓСЂРµС†РєРёР№ РєРѕС„Рµ.", en:"I want to drink Turkish coffee.", uz:"Turk qahvasi ichmoqchiman.", tr:"TГјrk kahvesi iГ§mek istiyorum.", ar:"ШЈШ±ЩЉШЇ ШґШ±ШЁ Ш§Щ„Щ‚Щ‡Щ€Ш© Ш§Щ„ШЄШ±ЩѓЩЉШ©.", fa:"Щ…ЫЊвЂЊШ®Щ€Ш§Щ… Щ‚Щ‡Щ€Щ‡ ШЄШ±Ъ©ЫЊ ШЁШ®Щ€Ш±Щ….", zh:"ж€‘жѓіе–ќењџиЂіе…¶е’–е•ЎгЂ‚", es:"Quiero beber cafГ© turco.", de:"Ich mГ¶chte tГјrkischen Kaffee trinken." }, options:["kahvesi","Г§ayД±","suyu","sГјtГј"] },
        { type:"translate", source:{ ru:"РЎРІРµР¶РёР№ С…Р»РµР± РєР°Р¶РґРѕРµ СѓС‚СЂРѕ", en:"Fresh bread every morning", uz:"Har kuni ertalab yangi non", tr:"Fresh bread every morning", ar:"Ш®ШЁШІ Ш·Ш§ШІШ¬ ЩѓЩ„ ШµШЁШ§Ш­", fa:"Щ‡Ш± Ш±Щ€ШІ ШµШЁШ­ Щ†Ш§Щ† ШЄШ§ШІЩ‡", zh:"жЇЏе¤©ж—©дёЉж–°йІњйќўеЊ…", es:"Pan fresco cada maГ±ana", de:"Frisches Brot jeden Morgen" }, answer:"her sabah taze ekmek", accept:["her sabah taze ekmek","her gГјn sabah taze ekmek"] },
      ]
    },
  ],
};


// в”Ђв”Ђв”Ђ EXPANDED LESSON CONTENT в”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђ
// Helper to build a lesson quickly
const mkLesson = (id, emoji, titles, exercises) => ({ id, emoji, titles, exercises });
const T = (ru,en,uz,tr,ar,fa,zh,es,de) => ({ru,en,uz,tr,ar,fa,zh,es,de});
const D = (ru,en,uz,tr,ar,fa,zh,es,de) => ({ru,en,uz,tr,ar,fa,zh,es,de});

const EXTRA_LESSONS = {

  // в”Ђв”Ђ RUSSIAN beginner в”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђ
  "ru-beginner": [
    mkLesson(1,"рџ‘‹", T("РџСЂРёРІРµС‚СЃС‚РІРёСЏ","Greetings","Salomlashish","SelamlaЕџma","Ш§Щ„ШЄШ­ЩЉШ§ШЄ","Ш§Ш­Щ€Ш§Щ„вЂЊЩѕШ±ШіЫЊ","й—®еЂ™","Saludos","BegrГјГџungen"), [
      { type:"choose", targetWord:"РџСЂРёРІРµС‚", translations:T("Hi!","Hello","Salom","Merhaba","Щ…Ш±Ш­ШЁШ§","ШіЩ„Ш§Щ…","дЅ еҐЅ","Hola","Hallo"), distractors:T(["РџРѕРєР°","РќРµС‚","Р”Р°"],["Bye","No","Yes"],["Xayr","Yo'q","Ha"],["GГјle gГјle","HayД±r","Evet"],["Щ€ШЇШ§Ш№Ш§","Щ„Ш§","Щ†Ш№Щ…"],["Ш®ШЇШ§Ш­Ш§ЩЃШё","Щ†Щ‡","ШЁЩ„Щ‡"],["е†Ќи§Ѓ","дёЌ","жЇ"],["AdiГіs","No","SГ­"],["TschГјss","Nein","Ja"]) },
      { type:"arrange", sentence:T("РљР°Рє С‚РµР±СЏ Р·РѕРІСѓС‚?","What is your name?","Ismingiz nima?","AdД±n ne?","Щ…Ш§ Ш§ШіЩ…ЩѓШџ","Ш§ШіЩ…ШЄ Ъ†ЫЊЩ‡Шџ","дЅ еЏ«д»Ђд№€еђЌе­—пјџ","ВїCГіmo te llamas?","Wie heiГџt du?"), answer:"РљР°Рє С‚РµР±СЏ Р·РѕРІСѓС‚", words:["РљР°Рє","С‚РµР±СЏ","Р·РѕРІСѓС‚","РіРґРµ","Р¶РёРІС‘С€СЊ","РєРѕРіРґР°"] },
      { type:"fill", sentence:"РњРµРЅСЏ ___ РќСѓСЃСЂР°С‚.", blank:"Р·РѕРІСѓС‚", hint:T("РњРµРЅСЏ Р·РѕРІСѓС‚ РќСѓСЃСЂР°С‚.","My name is Nusrat.","Mening ismim Nusrat.","AdД±m Nusrat.","Ш§ШіЩ…ЩЉ Щ†ШіШ±ШЄ.","Ш§ШіЩ…Щ… Щ†ШіШ±Ш§ШЄЩ‡.","ж€‘еЏ«еЉЄж–Їж‹‰з‰№гЂ‚","Me llamo Nusrat.","Ich heiГџe Nusrat."), options:["Р·РѕРІСѓС‚","РµСЃС‚СЊ","Р¶РёРІСѓ","С…РѕС‡Сѓ"] },
      { type:"translate", source:T("My name is...","My name is...","Mening ismim...","AdД±m...","Ш§ШіЩ…ЩЉ...","Ш§ШіЩ…Щ…...","ж€‘еЏ«...","Me llamo...","Ich heiГџe..."), answer:"РјРµРЅСЏ Р·РѕРІСѓС‚", accept:["РјРµРЅСЏ Р·РѕРІСѓС‚","РјРѕС‘ РёРјСЏ"] },
      { type:"choose", targetWord:"РџРѕР¶Р°Р»СѓР№СЃС‚Р°", translations:T("Please/You're welcome","Please","Iltimos","LГјtfen","Щ…Щ† ЩЃШ¶Щ„Щѓ","Щ„Ш·ЩЃШ§Щ‹","иЇ·","Por favor","Bitte"), distractors:T(["РЎРїР°СЃРёР±Рѕ","РќРµС‚","РџСЂРёРІРµС‚"],["Thanks","No","Hi"],["Rahmat","Yo'q","Salom"],["TeЕџekkГјr","HayД±r","Merhaba"],["ШґЩѓШ±Ш§","Щ„Ш§","Щ…Ш±Ш­ШЁШ§"],["Щ…Щ…Щ†Щ€Щ†","Щ†Щ‡","ШіЩ„Ш§Щ…"],["и°ўи°ў","дёЌ","дЅ еҐЅ"],["Gracias","No","Hola"],["Danke","Nein","Hallo"]) },
    ]),
    mkLesson(2,"рџ”ў", T("Р§РёСЃР»Р°","Numbers","Raqamlar","SayД±lar","Ш§Щ„ШЈШ±Щ‚Ш§Щ…","Ш§Ш№ШЇШ§ШЇ","ж•°е­—","NГєmeros","Zahlen"), [
      { type:"choose", targetWord:"РћРґРёРЅ", translations:T("One","One","Bir","Bir","Щ€Ш§Ш­ШЇ","ЫЊЪ©","дёЂ","Uno","Eins"), distractors:T(["Р”РІР°","РўСЂРё","РџСЏС‚СЊ"],["Two","Three","Five"],["Ikki","Uch","Besh"],["Д°ki","ГњГ§","BeЕџ"],["Ш§Ш«Щ†Ш§Щ†","Ш«Щ„Ш§Ш«Ш©","Ш®Щ…ШіШ©"],["ШЇЩ€","ШіЩ‡","ЩѕЩ†Ш¬"],["дєЊ","дё‰","дє”"],["Dos","Tres","Cinco"],["Zwei","Drei","FГјnf"]) },
      { type:"arrange", sentence:T("РЈ РјРµРЅСЏ С‚СЂРё СЏР±Р»РѕРєР°","I have three apples","Menda uchta olma bor","ГњГ§ elmam var","Ш№Щ†ШЇЩЉ Ш«Щ„Ш§Ш« ШЄЩЃШ§Ш­Ш§ШЄ","ШіЩ‡ ШЄШ§ ШіЫЊШЁ ШЇШ§Ш±Щ…","ж€‘жњ‰дё‰дёЄи‹№жћњ","Tengo tres manzanas","Ich habe drei Г„pfel"), answer:"РЈ РјРµРЅСЏ С‚СЂРё СЏР±Р»РѕРєР°", words:["РЈ","РјРµРЅСЏ","С‚СЂРё","СЏР±Р»РѕРєР°","РїСЏС‚СЊ","РєРЅРёРі"] },
      { type:"fill", sentence:"РќР°СЃ ___ С‡РµР»РѕРІРµРє.", blank:"РїСЏС‚СЊ", hint:T("РќР°СЃ РїСЏС‚СЊ С‡РµР»РѕРІРµРє.","There are five of us.","Bizda besh kishi.","BeЕџ kiЕџiyiz.","Щ†Ш­Щ† Ш®Щ…ШіШ© ШЈШґШ®Ш§Шµ.","Щ…Ш§ ЩѕЩ†Ш¬ Щ†ЩЃШ±ЫЊЩ….","ж€‘д»¬жњ‰дє”дёЄдєєгЂ‚","Somos cinco personas.","Wir sind fГјnf Personen."), options:["РїСЏС‚СЊ","РјРЅРѕРіРѕ","РјР°Р»Рѕ","РґРµСЃСЏС‚СЊ"] },
      { type:"translate", source:T("Ten minutes","Ten minutes","O'n daqiqa","On dakika","Ш№ШґШ± ШЇЩ‚Ш§Ш¦Щ‚","ШЇЩ‡ ШЇЩ‚ЫЊЩ‚Щ‡","еЌЃе€†й’џ","Diez minutos","Zehn Minuten"), answer:"РґРµСЃСЏС‚СЊ РјРёРЅСѓС‚", accept:["РґРµСЃСЏС‚СЊ РјРёРЅСѓС‚"] },
    ]),
    mkLesson(3,"рџЌЋ", T("Р•РґР°","Food","Ovqat","Yiyecek","Ш§Щ„Ш·Ш№Ш§Щ…","ШєШ°Ш§","йЈџз‰©","Comida","Essen"), [
      { type:"choose", targetWord:"РҐР»РµР±", translations:T("Bread","Bread","Non","Ekmek","Ш®ШЁШІ","Щ†Ш§Щ†","йќўеЊ…","Pan","Brot"), distractors:T(["Р’РѕРґР°","РњРѕР»РѕРєРѕ","РЎС‹СЂ"],["Water","Milk","Cheese"],["Suv","Sut","Pishloq"],["Su","SГјt","Peynir"],["Щ…Ш§ШЎ","Ш­Щ„ЩЉШЁ","Ш¬ШЁЩ†"],["ШўШЁ","ШґЫЊШ±","ЩѕЩ†ЫЊШ±"],["ж°ґ","з‰›еҐ¶","еҐ¶й…Є"],["Agua","Leche","Queso"],["Wasser","Milch","KГ¤se"]) },
      { type:"arrange", sentence:T("РЇ С…РѕС‡Сѓ РєРѕС„Рµ СЃ РјРѕР»РѕРєРѕРј","I want coffee with milk","Sutli qahva istayapman","SГјtlГј kahve istiyorum","ШЈШ±ЩЉШЇ Щ‚Щ‡Щ€Ш© ШЁШ§Щ„Ш­Щ„ЩЉШЁ","Щ‚Щ‡Щ€Щ‡ ШЁШ§ ШґЫЊШ± Щ…ЫЊШ®Щ€Ш§Щ…","ж€‘и¦ЃеЉ з‰›еҐ¶зљ„е’–е•Ў","Quiero cafГ© con leche","Ich mГ¶chte Kaffee mit Milch"), answer:"РЇ С…РѕС‡Сѓ РєРѕС„Рµ СЃ РјРѕР»РѕРєРѕРј", words:["РЇ","С…РѕС‡Сѓ","РєРѕС„Рµ","СЃ","РјРѕР»РѕРєРѕРј","Р±РµР·","СЃР°С…Р°СЂР°"] },
      { type:"fill", sentence:"Р­С‚Рѕ РѕС‡РµРЅСЊ ___!", blank:"РІРєСѓСЃРЅРѕ", hint:T("Р­С‚Рѕ РѕС‡РµРЅСЊ РІРєСѓСЃРЅРѕ!","This is very delicious!","Bu juda mazali!","Bu Г§ok lezzetli!","Щ‡Ш°Ш§ Щ„Ш°ЩЉШ° Ш¬ШЇШ§!","Ш§ЫЊЩ† Ш®ЫЊЩ„ЫЊ Ш®Щ€ШґЩ…ШІЩ‡ Ш§ШіШЄ!","иї™йќћеёёзѕЋе‘іпјЃ","ВЎEsto es muy delicioso!","Das ist sehr lecker!"), options:["РІРєСѓСЃРЅРѕ","РїР»РѕС…Рѕ","РґРѕСЂРѕРіРѕ","РґР°Р»РµРєРѕ"] },
      { type:"translate", source:T("Fresh juice","Fresh juice","Yangi sharbat","Taze meyve suyu","Ш№ШµЩЉШ± Ш·Ш§ШІШ¬","ШўШЁЩ…ЫЊЩ€Щ‡ ШЄШ§ШІЩ‡","ж–°йІњжћњж±Ѓ","Jugo fresco","Frischer Saft"), answer:"СЃРІРµР¶РёР№ СЃРѕРє", accept:["СЃРІРµР¶РёР№ СЃРѕРє"] },
    ]),
    mkLesson(4,"рџЏ™пёЏ", T("Р“РѕСЂРѕРґ","City","Shahar","Ећehir","Ш§Щ„Щ…ШЇЩЉЩ†Ш©","ШґЩ‡Ш±","еџЋеё‚","Ciudad","Stadt"), [
      { type:"choose", targetWord:"РњР°РіР°Р·РёРЅ", translations:T("Shop/Store","Shop","Do'kon","DГјkkan","Щ…ШЄШ¬Ш±","Щ…ШєШ§ШІЩ‡","е•†еє—","Tienda","GeschГ¤ft"), distractors:T(["Р‘Р°РЅРє","РЁРєРѕР»Р°","Р‘РѕР»СЊРЅРёС†Р°"],["Bank","School","Hospital"],["Bank","Maktab","Kasalxona"],["Banka","Okul","Hastane"],["ШЁЩ†Щѓ","Щ…ШЇШ±ШіШ©","Щ…ШіШЄШґЩЃЩ‰"],["ШЁШ§Щ†Ъ©","Щ…ШЇШ±ШіЩ‡","ШЁЫЊЩ…Ш§Ш±ШіШЄШ§Щ†"],["й“¶иЎЊ","е­¦ж Ў","еЊ»й™ў"],["Banco","Escuela","Hospital"],["Bank","Schule","Krankenhaus"]) },
      { type:"arrange", sentence:T("Р“РґРµ РЅР°С…РѕРґРёС‚СЃСЏ РјРµС‚СЂРѕ?","Where is the subway?","Metro qayerda?","Metro nerede?","ШЈЩЉЩ† Ш§Щ„Щ…ШЄШ±Щ€Шџ","Щ…ШЄШ±Щ€ Ъ©Ш¬Ш§ШіШЄШџ","ењ°й“ЃењЁе“Єй‡Њпјџ","ВїDГіnde estГЎ el metro?","Wo ist die U-Bahn?"), answer:"Р“РґРµ РЅР°С…РѕРґРёС‚СЃСЏ РјРµС‚СЂРѕ", words:["Р“РґРµ","РЅР°С…РѕРґРёС‚СЃСЏ","РјРµС‚СЂРѕ","Р°РІС‚РѕР±СѓСЃ","Р±Р°РЅРє","С€РєРѕР»Р°"] },
      { type:"fill", sentence:"РЇ Р¶РёРІСѓ РІ ___ РґРѕРјРµ.", blank:"Р±РѕР»СЊС€РѕРј", hint:T("РЇ Р¶РёРІСѓ РІ Р±РѕР»СЊС€РѕРј РґРѕРјРµ.","I live in a big house.","Men katta uyda yashayman.","BГјyГјk bir evde yaЕџД±yorum.","ШЈШ№ЩЉШґ ЩЃЩЉ Щ…Щ†ШІЩ„ ЩѓШЁЩЉШ±.","ШЇШ± Ш®Ш§Щ†Щ‡ ШЁШІШ±ЪЇЫЊ ШІЩ†ШЇЪЇЫЊ Щ…ЫЊвЂЊЪ©Щ†Щ….","ж€‘дЅЏењЁе¤§ж€їе­ђй‡ЊгЂ‚","Vivo en una casa grande.","Ich lebe in einem groГџen Haus."), options:["Р±РѕР»СЊС€РѕРј","РјР°Р»РµРЅСЊРєРѕРј","РєСЂР°СЃРёРІРѕРј","РЅРѕРІРѕРј"] },
      { type:"translate", source:T("Turn left","Turn left","Chapga buring","Sola dГ¶n","Ш§ШЄШ¬Щ‡ ЩЉШіШ§Ш±Ш§Щ‹","ШЁЩ‡ Ъ†Щѕ ШЁЩѕЫЊЪ†","еђ‘е·¦иЅ¬","Gira a la izquierda","Links abbiegen"), answer:"РїРѕРІРµСЂРЅСѓС‚СЊ РЅР°Р»РµРІРѕ", accept:["РїРѕРІРµСЂРЅСѓС‚СЊ РЅР°Р»РµРІРѕ","РЅР°Р»РµРІРѕ","РїРѕРІРµСЂРЅРёС‚Рµ РЅР°Р»РµРІРѕ"] },
    ]),
  ],

  // в”Ђв”Ђ JAPANESE beginner в”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђ
  "ja-beginner": [
    mkLesson(1,"рџ‘‹", T("жЊЁж‹¶","Greetings","Salomlashish","SelamlaЕџma","Ш§Щ„ШЄШ­ЩЉШ§ШЄ","Ш§Ш­Щ€Ш§Щ„вЂЊЩѕШ±ШіЫЊ","й—®еЂ™","Saludos","BegrГјГџungen"), [
      { type:"choose", targetWord:"гЃ“г‚“гЃ«гЃЎгЃЇ", translations:T("РџСЂРёРІРµС‚/Р—РґСЂР°РІСЃС‚РІСѓР№С‚Рµ","Hello","Salom","Merhaba","Щ…Ш±Ш­ШЁШ§","ШіЩ„Ш§Щ…","дЅ еҐЅ","Hola","Hallo"), distractors:T(["РџРѕРєР°","РЎРїР°СЃРёР±Рѕ","РР·РІРёРЅРё"],["Bye","Thanks","Sorry"],["Xayr","Rahmat","Kechirasiz"],["GГјle gГјle","TeЕџekkГјr","Г–zГјr"],["Щ€ШЇШ§Ш№Ш§","ШґЩѓШ±Ш§","ШўШіЩЃ"],["Ш®ШЇШ§Ш­Ш§ЩЃШё","Щ…Щ…Щ†Щ€Щ†","ШЁШЁШ®ШґЫЊШЇ"],["е†Ќи§Ѓ","и°ўи°ў","еЇ№дёЌиµ·"],["AdiГіs","Gracias","PerdГіn"],["TschГјss","Danke","Entschuldigung"]) },
      { type:"arrange", sentence:T("РњРµРЅСЏ Р·РѕРІСѓС‚ РўР°РЅР°РєР°","My name is Tanaka","Mening ismim Tanaka","AdД±m Tanaka","Ш§ШіЩ…ЩЉ ШЄШ§Щ†Ш§ЩѓШ§","Ш§ШіЩ…Щ… ШЄШ§Щ†Ш§Ъ©Ш§ШіШЄ","ж€‘еЏ«з”°дё­","Me llamo Tanaka","Ich heiГџe Tanaka"), answer:"г‚ЏгЃџгЃ—гЃЇ гЃџгЃЄгЃ‹ гЃ§гЃ™", words:["г‚ЏгЃџгЃ—гЃЇ","гЃџгЃЄгЃ‹","гЃ§гЃ™","гЃ©гЃ“","гЃ„гЃ¤","гЃЄгЃ«"] },
      { type:"fill", sentence:"___ гЃ”гЃ–гЃ„гЃѕгЃ™!", blank:"гЃ‚г‚ЉгЃЊгЃЁгЃ†", hint:T("Р‘РѕР»СЊС€РѕРµ СЃРїР°СЃРёР±Рѕ!","Thank you very much!","Katta rahmat!","Г‡ok teЕџekkГјrler!","ШґЩѓШ±Ш§ Ш¬ШІЩЉЩ„Ш§!","Ш®ЫЊЩ„ЫЊ Щ…Щ…Щ†Щ€Щ†!","йќћеёёж„џи°ўпјЃ","ВЎMuchas gracias!","Vielen Dank!"), options:["гЃ‚г‚ЉгЃЊгЃЁгЃ†","гЃ™гЃїгЃѕгЃ›г‚“","гЃЉгЃЇг‚€гЃ†","гЃ•г‚€гЃ†гЃЄг‚‰"] },
      { type:"translate", source:T("Good morning","Good morning","Xayrli tong","GГјnaydД±n","ШµШЁШ§Ш­ Ш§Щ„Ш®ЩЉШ±","ШµШЁШ­ ШЁШ®ЫЊШ±","ж—©дёЉеҐЅ","Buenos dГ­as","Guten Morgen"), answer:"гЃЉгЃЇг‚€гЃ†гЃ”гЃ–гЃ„гЃѕгЃ™", accept:["гЃЉгЃЇг‚€гЃ†гЃ”гЃ–гЃ„гЃѕгЃ™","гЃЉгЃЇг‚€гЃ†"] },
      { type:"choose", targetWord:"гЃ•г‚€гЃ†гЃЄг‚‰", translations:T("Р”Рѕ СЃРІРёРґР°РЅРёСЏ","Goodbye","Xayr","GГјle gГјle","Щ€ШЇШ§Ш№Ш§","Ш®ШЇШ§Ш­Ш§ЩЃШё","е†Ќи§Ѓ","AdiГіs","Auf Wiedersehen"), distractors:T(["РџСЂРёРІРµС‚","РЎРїР°СЃРёР±Рѕ","РџРѕР¶Р°Р»СѓР№СЃС‚Р°"],["Hello","Thanks","Please"],["Salom","Rahmat","Iltimos"],["Merhaba","TeЕџekkГјr","LГјtfen"],["Щ…Ш±Ш­ШЁШ§","ШґЩѓШ±Ш§","Щ…Щ† ЩЃШ¶Щ„Щѓ"],["ШіЩ„Ш§Щ…","Щ…Щ…Щ†Щ€Щ†","Щ„Ш·ЩЃШ§Щ‹"],["дЅ еҐЅ","и°ўи°ў","иЇ·"],["Hola","Gracias","Por favor"],["Hallo","Danke","Bitte"]) },
    ]),
    mkLesson(2,"рџ”ў", T("ж•°е­—","Numbers","Raqamlar","SayД±lar","Ш§Щ„ШЈШ±Щ‚Ш§Щ…","Ш§Ш№ШЇШ§ШЇ","ж•°е­—","NГєmeros","Zahlen"), [
      { type:"choose", targetWord:"гЃ„гЃЎ", translations:T("РћРґРёРЅ (1)","One","Bir","Bir","Щ€Ш§Ш­ШЇ","ЫЊЪ©","дёЂ","Uno","Eins"), distractors:T(["Р”РІР°","РўСЂРё","Р§РµС‚С‹СЂРµ"],["Two","Three","Four"],["Ikki","Uch","To'rt"],["Д°ki","ГњГ§","DГ¶rt"],["Ш§Ш«Щ†Ш§Щ†","Ш«Щ„Ш§Ш«Ш©","ШЈШ±ШЁШ№Ш©"],["ШЇЩ€","ШіЩ‡","Ъ†Щ‡Ш§Ш±"],["дєЊ","дё‰","е››"],["Dos","Tres","Cuatro"],["Zwei","Drei","Vier"]) },
      { type:"fill", sentence:"___ гЃ•г‚“гЃЊ гЃ„гЃѕгЃ™гЂ‚", blank:"гЃ•г‚“", hint:T("Р—РґРµСЃСЊ С‚СЂРё С‡РµР»РѕРІРµРєР°.","There are three people.","Uch kishi bor.","ГњГ§ kiЕџi var.","Щ‡Щ†Ш§Щѓ Ш«Щ„Ш§Ш«Ш© ШЈШґШ®Ш§Шµ.","ШіЩ‡ Щ†ЩЃШ± Щ‡ШіШЄЩ†ШЇ.","жњ‰дё‰дёЄдєєгЂ‚","Hay tres personas.","Es gibt drei Personen."), options:["гЃ•г‚“","гЃ«","гЃ”","гЃг‚…гЃ†"] },
      { type:"translate", source:T("Five apples","Five apples","Beshta olma","BeЕџ elma","Ш®Щ…Ші ШЄЩЃШ§Ш­Ш§ШЄ","ЩѕЩ†Ш¬ ШіЫЊШЁ","дє”дёЄи‹№жћњ","Cinco manzanas","FГјnf Г„pfel"), answer:"г‚Љг‚“гЃ” гЃЊ гЃ” гЃ¤", accept:["г‚Љг‚“гЃ”гЃЊгЃ”гЃ¤","г‚Љг‚“гЃ” гЃ” гЃ¤","гЃ”гЃ¤гЃ®г‚Љг‚“гЃ”"] },
    ]),
    mkLesson(3,"рџЌњ", T("йЈџгЃ№з‰©","Food","Ovqat","Yiyecek","Ш§Щ„Ш·Ш№Ш§Щ…","ШєШ°Ш§","йЈџз‰©","Comida","Essen"), [
      { type:"choose", targetWord:"гЃїгЃљ", translations:T("Р’РѕРґР°","Water","Suv","Su","Щ…Ш§ШЎ","ШўШЁ","ж°ґ","Agua","Wasser"), distractors:T(["Р§Р°Р№","РљРѕС„Рµ","РЎРѕРє"],["Tea","Coffee","Juice"],["Choy","Qahva","Sharbat"],["Г‡ay","Kahve","Meyve suyu"],["ШґШ§ЩЉ","Щ‚Щ‡Щ€Ш©","Ш№ШµЩЉШ±"],["Ъ†Ш§ЫЊ","Щ‚Щ‡Щ€Щ‡","ШўШЁЩ…ЫЊЩ€Щ‡"],["иЊ¶","е’–е•Ў","жћњж±Ѓ"],["TГ©","CafГ©","Jugo"],["Tee","Kaffee","Saft"]) },
      { type:"arrange", sentence:T("Р­С‚Рѕ РѕС‡РµРЅСЊ РІРєСѓСЃРЅРѕ","This is very delicious","Bu juda mazali","Bu Г§ok lezzetli","Щ‡Ш°Ш§ Щ„Ш°ЩЉШ° Ш¬ШЇШ§","Ш§ЫЊЩ† Ш®ЫЊЩ„ЫЊ Ш®Щ€ШґЩ…ШІЩ‡ Ш§ШіШЄ","иї™йќћеёёзѕЋе‘і","Esto es muy delicioso","Das ist sehr lecker"), answer:"гЃ“г‚ЊгЃЇ гЃЁгЃ¦г‚‚ гЃЉгЃ„гЃ—гЃ„ гЃ§гЃ™", words:["гЃ“г‚ЊгЃЇ","гЃЁгЃ¦г‚‚","гЃЉгЃ„гЃ—гЃ„","гЃ§гЃ™","гЃѕгЃљгЃ„","гЃџгЃ‹гЃ„"] },
      { type:"fill", sentence:"гЃ™гЃ— гЃЊ ___гЂ‚", blank:"гЃ™гЃЌ гЃ§гЃ™", hint:T("РЇ Р»СЋР±Р»СЋ СЃСѓС€Рё.","I like sushi.","Men sushini yaxshi ko'raman.","Sushi seviyorum.","ШЈШ­ШЁ Ш§Щ„ШіЩ€ШґЩЉ.","ШіЩ€ШґЫЊ ШЇЩ€ШіШЄ ШЇШ§Ш±Щ….","ж€‘е–њж¬ўеЇїеЏёгЂ‚","Me gusta el sushi.","Ich mag Sushi."), options:["гЃ™гЃЌ гЃ§гЃ™","гЃЌг‚‰гЃ„ гЃ§гЃ™","гЃџгЃ‹гЃ„ гЃ§гЃ™","г‚„гЃ™гЃ„ гЃ§гЃ™"] },
    ]),
  ],

  // в”Ђв”Ђ KOREAN beginner в”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђ
  "ko-beginner": [
    mkLesson(1,"рџ‘‹", T("мќём‚¬","Greetings","Salomlashish","SelamlaЕџma","Ш§Щ„ШЄШ­ЩЉШ§ШЄ","Ш§Ш­Щ€Ш§Щ„вЂЊЩѕШ±ШіЫЊ","й—®еЂ™","Saludos","BegrГјГџungen"), [
      { type:"choose", targetWord:"м•€л…•н•м„ёмљ”", translations:T("Р—РґСЂР°РІСЃС‚РІСѓР№С‚Рµ","Hello","Salom","Merhaba","Щ…Ш±Ш­ШЁШ§","ШіЩ„Ш§Щ…","дЅ еҐЅ","Hola","Hallo"), distractors:T(["РџРѕРєР°","РЎРїР°СЃРёР±Рѕ","РР·РІРёРЅРёС‚Рµ"],["Bye","Thanks","Sorry"],["Xayr","Rahmat","Kechirasiz"],["GГјle gГјle","TeЕџekkГјr","Г–zГјr"],["Щ€ШЇШ§Ш№Ш§","ШґЩѓШ±Ш§","ШўШіЩЃ"],["Ш®ШЇШ§Ш­Ш§ЩЃШё","Щ…Щ…Щ†Щ€Щ†","ШЁШЁШ®ШґЫЊШЇ"],["е†Ќи§Ѓ","и°ўи°ў","еЇ№дёЌиµ·"],["AdiГіs","Gracias","PerdГіn"],["TschГјss","Danke","Entschuldigung"]) },
      { type:"arrange", sentence:T("РњРµРЅСЏ Р·РѕРІСѓС‚ РљРёРј","My name is Kim","Mening ismim Kim","AdД±m Kim","Ш§ШіЩ…ЩЉ ЩѓЩЉЩ…","Ш§ШіЩ…Щ… Ъ©ЫЊЩ…Щ‡","ж€‘еЏ«й‡‘","Me llamo Kim","Ich heiГџe Kim"), answer:"м ЂлЉ” к№Ђ мћ…л‹€л‹¤", words:["м ЂлЉ”","к№Ђ","мћ…л‹€л‹¤","м–ґл””","м–ём њ","л¬ґм—‡"] },
      { type:"fill", sentence:"___ н•©л‹€л‹¤!", blank:"к°ђм‚¬", hint:T("РЎРїР°СЃРёР±Рѕ!","Thank you!","Rahmat!","TeЕџekkГјrler!","ШґЩѓШ±Ш§!","Щ…Щ…Щ†Щ€Щ†!","и°ўи°ўпјЃ","ВЎGracias!","Danke!"), options:["к°ђм‚¬","м•€л…•","лЇём•€","кґњм°®"] },
      { type:"translate", source:T("Good morning","Good morning","Xayrli tong","GГјnaydД±n","ШµШЁШ§Ш­ Ш§Щ„Ш®ЩЉШ±","ШµШЁШ­ ШЁШ®ЫЊШ±","ж—©дёЉеҐЅ","Buenos dГ­as","Guten Morgen"), answer:"мў‹мќЂ м•„м№Ё", accept:["мў‹мќЂ м•„м№Ё","м•€л…•н•м„ёмљ”"] },
      { type:"choose", targetWord:"лЇём•€н•©л‹€л‹¤", translations:T("РР·РІРёРЅРёС‚Рµ/РџСЂРѕСЃС‚РёС‚Рµ","Sorry","Kechirasiz","Г–zГјr dilerim","ШўШіЩЃ","ШЁШЁШ®ШґЫЊШЇ","еЇ№дёЌиµ·","Lo siento","Entschuldigung"), distractors:T(["РџСЂРёРІРµС‚","РџРѕРєР°","РЎРїР°СЃРёР±Рѕ"],["Hi","Bye","Thanks"],["Salom","Xayr","Rahmat"],["Merhaba","GГјle gГјle","TeЕџekkГјr"],["Щ…Ш±Ш­ШЁШ§","Щ€ШЇШ§Ш№Ш§","ШґЩѓШ±Ш§"],["ШіЩ„Ш§Щ…","Ш®ШЇШ§Ш­Ш§ЩЃШё","Щ…Щ…Щ†Щ€Щ†"],["дЅ еҐЅ","е†Ќи§Ѓ","и°ўи°ў"],["Hola","AdiГіs","Gracias"],["Hallo","TschГјss","Danke"]) },
    ]),
    mkLesson(2,"рџ”ў", T("м€«мћђ","Numbers","Raqamlar","SayД±lar","Ш§Щ„ШЈШ±Щ‚Ш§Щ…","Ш§Ш№ШЇШ§ШЇ","ж•°е­—","NГєmeros","Zahlen"), [
      { type:"choose", targetWord:"мќј", translations:T("РћРґРёРЅ (1)","One","Bir","Bir","Щ€Ш§Ш­ШЇ","ЫЊЪ©","дёЂ","Uno","Eins"), distractors:T(["Р”РІР°","РўСЂРё","РџСЏС‚СЊ"],["Two","Three","Five"],["Ikki","Uch","Besh"],["Д°ki","ГњГ§","BeЕџ"],["Ш§Ш«Щ†Ш§Щ†","Ш«Щ„Ш§Ш«Ш©","Ш®Щ…ШіШ©"],["ШЇЩ€","ШіЩ‡","ЩѕЩ†Ш¬"],["дєЊ","дё‰","дє”"],["Dos","Tres","Cinco"],["Zwei","Drei","FГјnf"]) },
      { type:"arrange", sentence:T("РЈ РјРµРЅСЏ РґРІР° Р±РёР»РµС‚Р°","I have two tickets","Menda ikkita chipta bor","Д°ki biletim var","Ш№Щ†ШЇЩЉ ШЄШ°ЩѓШ±ШЄШ§Щ†","ШЇЩ€ ШЄШ§ ШЁЩ„ЫЊШЄ ШЇШ§Ш±Щ…","ж€‘жњ‰дё¤еј зҐЁ","Tengo dos entradas","Ich habe zwei Tickets"), answer:"м ЂлЉ” н‘њк°Ђ л‘ђ мћҐ мћ€м–ґмљ”", words:["м ЂлЉ”","н‘њк°Ђ","л‘ђ","мћҐ","мћ€м–ґмљ”","м—†м–ґмљ”","м„ё"] },
      { type:"fill", sentence:"___ лЄ…мќґ мћ€м–ґмљ”.", blank:"л‹¤м„Ї", hint:T("Р—РґРµСЃСЊ РїСЏС‚СЊ С‡РµР»РѕРІРµРє.","There are five people.","Besh kishi bor.","BeЕџ kiЕџi var.","Щ‡Щ†Ш§Щѓ Ш®Щ…ШіШ© ШЈШґШ®Ш§Шµ.","ЩѕЩ†Ш¬ Щ†ЩЃШ± Щ‡ШіШЄЩ†ШЇ.","жњ‰дє”дёЄдєєгЂ‚","Hay cinco personas.","Es gibt fГјnf Personen."), options:["л‹¤м„Ї","н•л‚","м—ґ","л°±"] },
    ]),
    mkLesson(3,"рџЌљ", T("мќЊм‹ќ","Food","Ovqat","Yiyecek","Ш§Щ„Ш·Ш№Ш§Щ…","ШєШ°Ш§","йЈџз‰©","Comida","Essen"), [
      { type:"choose", targetWord:"л¬ј", translations:T("Р’РѕРґР°","Water","Suv","Su","Щ…Ш§ШЎ","ШўШЁ","ж°ґ","Agua","Wasser"), distractors:T(["Р§Р°Р№","РљРѕС„Рµ","РњРѕР»РѕРєРѕ"],["Tea","Coffee","Milk"],["Choy","Qahva","Sut"],["Г‡ay","Kahve","SГјt"],["ШґШ§ЩЉ","Щ‚Щ‡Щ€Ш©","Ш­Щ„ЩЉШЁ"],["Ъ†Ш§ЫЊ","Щ‚Щ‡Щ€Щ‡","ШґЫЊШ±"],["иЊ¶","е’–е•Ў","з‰›еҐ¶"],["TГ©","CafГ©","Leche"],["Tee","Kaffee","Milch"]) },
      { type:"translate", source:T("I like kimchi","I like kimchi","Kimchini yaxshi ko'raman","Kimchi seviyorum","ШЈШ­ШЁ Ш§Щ„ЩѓЩЉЩ…ШЄШґЩЉ","Ъ©ЫЊЩ…Ъ†ЫЊ ШЇЩ€ШіШЄ ШЇШ§Ш±Щ…","ж€‘е–њж¬ўжіЎиЏњ","Me gusta el kimchi","Ich mag Kimchi"), answer:"к№Ђм№лҐј мў‹м•„н•ґмљ”", accept:["к№Ђм№лҐј мў‹м•„н•ґмљ”","к№Ђм№ мў‹м•„н•ґмљ”"] },
      { type:"fill", sentence:"мќґ мќЊм‹ќмќґ ___ л§›мћ€м–ґмљ”.", blank:"м •л§ђ", hint:T("Р­С‚Р° РµРґР° РѕС‡РµРЅСЊ РІРєСѓСЃРЅР°СЏ.","This food is really delicious.","Bu ovqat juda mazali.","Bu yemek gerГ§ekten lezzetli.","Щ‡Ш°Ш§ Ш§Щ„Ш·Ш№Ш§Щ… Щ„Ш°ЩЉШ° Ш¬ШЇШ§Щ‹.","Ш§ЫЊЩ† ШєШ°Ш§ Щ€Ш§Щ‚Ш№Ш§Щ‹ Ш®Щ€ШґЩ…ШІЩ‡ Ш§ШіШЄ.","иї™йЃ“иЏњзњџзљ„еѕ€еҐЅеђѓгЂ‚","Esta comida estГЎ muy rica.","Dieses Essen ist wirklich lecker."), options:["м •л§ђ","лі„лЎњ","мЎ°кё€","л„€л¬ґ"] },
    ]),
  ],

  // в”Ђв”Ђ ARABIC beginner в”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђ
  "ar-beginner": [
    mkLesson(1,"рџ‘‹", T("Ш§Щ„ШЄШ­ЩЉШ§ШЄ","Greetings","Salomlashish","SelamlaЕџma","Ш§Щ„ШЄШ­ЩЉШ§ШЄ","Ш§Ш­Щ€Ш§Щ„вЂЊЩѕШ±ШіЫЊ","й—®еЂ™","Saludos","BegrГјГџungen"), [
      { type:"choose", targetWord:"Щ…Ш±Ш­ШЁШ§", translations:T("РџСЂРёРІРµС‚","Hello","Salom","Merhaba","ШЄШ­ЩЉШ©","ШіЩ„Ш§Щ…","дЅ еҐЅ","Hola","Hallo"), distractors:T(["РџРѕРєР°","РЎРїР°СЃРёР±Рѕ","РќРµС‚"],["Bye","Thanks","No"],["Xayr","Rahmat","Yo'q"],["GГјle gГјle","TeЕџekkГјr","HayД±r"],["Щ€ШЇШ§Ш№Ш§","ШґЩѓШ±Ш§","Щ„Ш§"],["Ш®ШЇШ§Ш­Ш§ЩЃШё","Щ…Щ…Щ†Щ€Щ†","Щ†Щ‡"],["е†Ќи§Ѓ","и°ўи°ў","дёЌ"],["AdiГіs","Gracias","No"],["TschГјss","Danke","Nein"]) },
      { type:"arrange", sentence:T("РљР°Рє С‚РµР±СЏ Р·РѕРІСѓС‚?","What is your name?","Ismingiz nima?","AdД±n ne?","Щ…Ш§ Ш§ШіЩ…ЩѓШџ","Ш§ШіЩ…ШЄ Ъ†ЫЊЩ‡Шџ","дЅ еЏ«д»Ђд№€еђЌе­—пјџ","ВїCГіmo te llamas?","Wie heiГџt du?"), answer:"Щ…Ш§ Ш§ШіЩ…Щѓ", words:["Щ…Ш§","Ш§ШіЩ…Щѓ","ШЈЩЉЩ†","Щ…ШЄЩ‰","ЩѓЩЉЩЃ","Щ„Щ…Ш§Ш°Ш§"] },
      { type:"fill", sentence:"___ Ш§Щ„Ш®ЩЉШ±!", blank:"ШµШЁШ§Ш­", hint:T("Р”РѕР±СЂРѕРµ СѓС‚СЂРѕ!","Good morning!","Xayrli tong!","GГјnaydД±n!","ШµШЁШ§Ш­ Ш§Щ„Ш®ЩЉШ±!","ШµШЁШ­ ШЁШ®ЫЊШ±!","ж—©дёЉеҐЅпјЃ","ВЎBuenos dГ­as!","Guten Morgen!"), options:["ШµШЁШ§Ш­","Щ…ШіШ§ШЎ","Щ„ЩЉЩ„","ЩЉЩ€Щ…"] },
      { type:"translate", source:T("Thank you very much","Thank you very much","Katta rahmat","Г‡ok teЕџekkГјrler","ШґЩѓШ±Ш§ Ш¬ШІЩЉЩ„Ш§","Ш®ЫЊЩ„ЫЊ Щ…Щ…Щ†Щ€Щ†","йќћеёёж„џи°ў","Muchas gracias","Vielen Dank"), answer:"ШґЩѓШ±Ш§ Ш¬ШІЩЉЩ„Ш§", accept:["ШґЩѓШ±Ш§ Ш¬ШІЩЉЩ„Ш§","ШґЩѓШ±Ш§Щ‹ Ш¬ШІЩЉЩ„Ш§Щ‹","ШґЩѓШ±Ш§"] },
      { type:"choose", targetWord:"Щ…Ш№ Ш§Щ„ШіЩ„Ш§Щ…Ш©", translations:T("Р”Рѕ СЃРІРёРґР°РЅРёСЏ","Goodbye","Xayr","GГјle gГјle","Щ€ШЇШ§Ш№Ш§","Ш®ШЇШ§Ш­Ш§ЩЃШё","е†Ќи§Ѓ","AdiГіs","Auf Wiedersehen"), distractors:T(["РџСЂРёРІРµС‚","РЎРїР°СЃРёР±Рѕ","Р”Р°"],["Hello","Thanks","Yes"],["Salom","Rahmat","Ha"],["Merhaba","TeЕџekkГјr","Evet"],["Щ…Ш±Ш­ШЁШ§","ШґЩѓШ±Ш§","Щ†Ш№Щ…"],["ШіЩ„Ш§Щ…","Щ…Щ…Щ†Щ€Щ†","ШЁЩ„Щ‡"],["дЅ еҐЅ","и°ўи°ў","жЇ"],["Hola","Gracias","SГ­"],["Hallo","Danke","Ja"]) },
    ]),
    mkLesson(2,"рџ”ў", T("Ш§Щ„ШЈШ±Щ‚Ш§Щ…","Numbers","Raqamlar","SayД±lar","Ш§Щ„ШЈШ±Щ‚Ш§Щ…","Ш§Ш№ШЇШ§ШЇ","ж•°е­—","NГєmeros","Zahlen"), [
      { type:"choose", targetWord:"Щ€Ш§Ш­ШЇ", translations:T("РћРґРёРЅ","One","Bir","Bir","1","ЫЊЪ©","дёЂ","Uno","Eins"), distractors:T(["Р”РІР°","РўСЂРё","РџСЏС‚СЊ"],["Two","Three","Five"],["Ikki","Uch","Besh"],["Д°ki","ГњГ§","BeЕџ"],["Ш§Ш«Щ†Ш§Щ†","Ш«Щ„Ш§Ш«Ш©","Ш®Щ…ШіШ©"],["ШЇЩ€","ШіЩ‡","ЩѕЩ†Ш¬"],["дєЊ","дё‰","дє”"],["Dos","Tres","Cinco"],["Zwei","Drei","FГјnf"]) },
      { type:"fill", sentence:"Ш№Щ†ШЇЩЉ ___ ЩѓШЄШЁ.", blank:"Ш«Щ„Ш§Ш«Ш©", hint:T("РЈ РјРµРЅСЏ С‚СЂРё РєРЅРёРіРё.","I have three books.","Menda uchta kitob bor.","ГњГ§ kitabД±m var.","Ш№Щ†ШЇЩЉ Ш«Щ„Ш§Ш«Ш© ЩѓШЄШЁ.","ШіЩ‡ ШЄШ§ Ъ©ШЄШ§ШЁ ШЇШ§Ш±Щ….","ж€‘жњ‰дё‰жњ¬д№¦гЂ‚","Tengo tres libros.","Ich habe drei BГјcher."), options:["Ш«Щ„Ш§Ш«Ш©","Ш№ШґШ±Ш©","Щ€Ш§Ш­ШЇ","Щ…Ш¦Ш©"] },
      { type:"translate", source:T("Ten days","Ten days","O'n kun","On gГјn","Ш№ШґШ±Ш© ШЈЩЉШ§Щ…","ШЇЩ‡ Ш±Щ€ШІ","еЌЃе¤©","Diez dГ­as","Zehn Tage"), answer:"Ш№ШґШ±Ш© ШЈЩЉШ§Щ…", accept:["Ш№ШґШ±Ш© ШЈЩЉШ§Щ…","ЩЎЩ  ШЈЩЉШ§Щ…"] },
    ]),
    mkLesson(3,"рџҐ™", T("Ш§Щ„Ш·Ш№Ш§Щ…","Food","Ovqat","Yiyecek","Ш§Щ„Ш·Ш№Ш§Щ…","ШєШ°Ш§","йЈџз‰©","Comida","Essen"), [
      { type:"choose", targetWord:"Щ…Ш§ШЎ", translations:T("Р’РѕРґР°","Water","Suv","Su","Hв‚‚O","ШўШЁ","ж°ґ","Agua","Wasser"), distractors:T(["Р§Р°Р№","РљРѕС„Рµ","РЎРѕРє"],["Tea","Coffee","Juice"],["Choy","Qahva","Sharbat"],["Г‡ay","Kahve","Meyve suyu"],["ШґШ§ЩЉ","Щ‚Щ‡Щ€Ш©","Ш№ШµЩЉШ±"],["Ъ†Ш§ЫЊ","Щ‚Щ‡Щ€Щ‡","ШўШЁЩ…ЫЊЩ€Щ‡"],["иЊ¶","е’–е•Ў","жћњж±Ѓ"],["TГ©","CafГ©","Jugo"],["Tee","Kaffee","Saft"]) },
      { type:"arrange", sentence:T("Р­С‚Рѕ РѕС‡РµРЅСЊ РІРєСѓСЃРЅРѕ","This is delicious","Bu mazali","Bu lezzetli","Щ‡Ш°Ш§ Щ„Ш°ЩЉШ°","Ш§ЫЊЩ† Ш®Щ€ШґЩ…ШІЩ‡ Ш§ШіШЄ","иї™еѕ€зѕЋе‘і","Esto estГЎ delicioso","Das ist lecker"), answer:"Щ‡Ш°Ш§ Щ„Ш°ЩЉШ° Ш¬ШЇШ§", words:["Щ‡Ш°Ш§","Щ„Ш°ЩЉШ°","Ш¬ШЇШ§","Ш±ШЇЩЉШЎ","ШєШ§Щ„ЩЉ","Щ‚ШЇЩЉЩ…"] },
      { type:"fill", sentence:"ШЈШ±ЩЉШЇ ___ Щ…Щ† ЩЃШ¶Щ„Щѓ.", blank:"Щ‚Щ‡Щ€Ш©", hint:T("РњРЅРµ РєРѕС„Рµ, РїРѕР¶Р°Р»СѓР№СЃС‚Р°.","Coffee please.","Qahva bering, iltimos.","Kahve lГјtfen.","ШЈШ±ЩЉШЇ Щ‚Щ‡Щ€Ш© Щ…Щ† ЩЃШ¶Щ„Щѓ.","Щ‚Щ‡Щ€Щ‡ Щ„Ш·ЩЃШ§Щ‹.","иЇ·з»™ж€‘е’–е•ЎгЂ‚","Un cafГ© por favor.","Kaffee bitte."), options:["Щ‚Щ‡Щ€Ш©","ЩѓШЄШ§ШЁ","ШіЩЉШ§Ш±Ш©","ШЁЩЉШЄ"] },
    ]),
  ],

  // в”Ђв”Ђ FARSI beginner в”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђ
  "fa-beginner": [
    mkLesson(1,"рџ‘‹", T("Ш§Ш­Щ€Ш§Щ„вЂЊЩѕШ±ШіЫЊ","Greetings","Salomlashish","SelamlaЕџma","Ш§Щ„ШЄШ­ЩЉШ§ШЄ","Ш§Ш­Щ€Ш§Щ„вЂЊЩѕШ±ШіЫЊ","й—®еЂ™","Saludos","BegrГјГџungen"), [
      { type:"choose", targetWord:"ШіЩ„Ш§Щ…", translations:T("РџСЂРёРІРµС‚","Hello","Salom","Merhaba","Щ…Ш±Ш­ШЁШ§","ШЇШ±Щ€ШЇ","дЅ еҐЅ","Hola","Hallo"), distractors:T(["РџРѕРєР°","РЎРїР°СЃРёР±Рѕ","РќРµС‚"],["Bye","Thanks","No"],["Xayr","Rahmat","Yo'q"],["GГјle gГјle","TeЕџekkГјr","HayД±r"],["Щ€ШЇШ§Ш№Ш§","ШґЩѓШ±Ш§","Щ„Ш§"],["Ш®ШЇШ§Ш­Ш§ЩЃШё","Щ…Щ…Щ†Щ€Щ†","Щ†Щ‡"],["е†Ќи§Ѓ","и°ўи°ў","дёЌ"],["AdiГіs","Gracias","No"],["TschГјss","Danke","Nein"]) },
      { type:"arrange", sentence:T("РљР°Рє С‚РµР±СЏ Р·РѕРІСѓС‚?","What is your name?","Ismingiz nima?","AdД±n ne?","Щ…Ш§ Ш§ШіЩ…ЩѓШџ","Ш§ШіЩ…ШЄ Ъ†ЫЊЩ‡Шџ","дЅ еЏ«д»Ђд№€еђЌе­—пјџ","ВїCГіmo te llamas?","Wie heiГџt du?"), answer:"Ш§ШіЩ… ШґЩ…Ш§ Ъ†ЫЊШіШЄ", words:["Ш§ШіЩ…","ШґЩ…Ш§","Ъ†ЫЊШіШЄ","Ъ©Ш¬Ш§","Ъ©ЫЊ","Ъ†Ш±Ш§"] },
      { type:"fill", sentence:"___ Щ…Щ…Щ†Щ€Щ†!", blank:"Ш®ЫЊЩ„ЫЊ", hint:T("Р‘РѕР»СЊС€РѕРµ СЃРїР°СЃРёР±Рѕ!","Thank you very much!","Katta rahmat!","Г‡ok teЕџekkГјrler!","ШґЩѓШ±Ш§ Ш¬ШІЩЉЩ„Ш§!","Ш®ЫЊЩ„ЫЊ Щ…Щ…Щ†Щ€Щ†!","йќћеёёж„џи°ўпјЃ","ВЎMuchas gracias!","Vielen Dank!"), options:["Ш®ЫЊЩ„ЫЊ","Ъ©Щ…ЫЊ","Щ‡Ш±ЪЇШІ","ШЁШ№ШЇШ§Щ‹"] },
      { type:"translate", source:T("Good night","Good night","Yaxshi tun","Д°yi geceler","ШЄШµШЁШ­ Ш№Щ„Щ‰ Ш®ЩЉШ±","ШґШЁ ШЁШ®ЫЊШ±","ж™ље®‰","Buenas noches","Gute Nacht"), answer:"ШґШЁ ШЁШ®ЫЊШ±", accept:["ШґШЁ ШЁШ®ЫЊШ±"] },
      { type:"choose", targetWord:"Ш®ШЇШ§Ш­Ш§ЩЃШё", translations:T("Р”Рѕ СЃРІРёРґР°РЅРёСЏ","Goodbye","Xayr","GГјle gГјle","Щ€ШЇШ§Ш№Ш§","ШЁШ§ЫЊ","е†Ќи§Ѓ","AdiГіs","Auf Wiedersehen"), distractors:T(["РџСЂРёРІРµС‚","РЎРїР°СЃРёР±Рѕ","Р”Р°"],["Hello","Thanks","Yes"],["Salom","Rahmat","Ha"],["Merhaba","TeЕџekkГјr","Evet"],["Щ…Ш±Ш­ШЁШ§","ШґЩѓШ±Ш§","Щ†Ш№Щ…"],["ШіЩ„Ш§Щ…","Щ…Щ…Щ†Щ€Щ†","ШЁЩ„Щ‡"],["дЅ еҐЅ","и°ўи°ў","жЇ"],["Hola","Gracias","SГ­"],["Hallo","Danke","Ja"]) },
    ]),
    mkLesson(2,"рџ”ў", T("Ш§Ш№ШЇШ§ШЇ","Numbers","Raqamlar","SayД±lar","Ш§Щ„ШЈШ±Щ‚Ш§Щ…","Ш§Ш№ШЇШ§ШЇ","ж•°е­—","NГєmeros","Zahlen"), [
      { type:"choose", targetWord:"ЫЊЪ©", translations:T("РћРґРёРЅ","One","Bir","Bir","Щ€Ш§Ш­ШЇ","1","дёЂ","Uno","Eins"), distractors:T(["Р”РІР°","РўСЂРё","РџСЏС‚СЊ"],["Two","Three","Five"],["Ikki","Uch","Besh"],["Д°ki","ГњГ§","BeЕџ"],["Ш§Ш«Щ†Ш§Щ†","Ш«Щ„Ш§Ш«Ш©","Ш®Щ…ШіШ©"],["ШЇЩ€","ШіЩ‡","ЩѕЩ†Ш¬"],["дєЊ","дё‰","дє”"],["Dos","Tres","Cinco"],["Zwei","Drei","FГјnf"]) },
      { type:"fill", sentence:"Щ…Щ† ___ Ъ©ШЄШ§ШЁ ШЇШ§Ш±Щ….", blank:"ШіЩ‡", hint:T("РЈ РјРµРЅСЏ С‚СЂРё РєРЅРёРіРё.","I have three books.","Menda uchta kitob bor.","ГњГ§ kitabД±m var.","Ш№Щ†ШЇЩЉ Ш«Щ„Ш§Ш«Ш© ЩѓШЄШЁ.","Щ…Щ† ШіЩ‡ Ъ©ШЄШ§ШЁ ШЇШ§Ш±Щ….","ж€‘жњ‰дё‰жњ¬д№¦гЂ‚","Tengo tres libros.","Ich habe drei BГјcher."), options:["ШіЩ‡","ЫЊЪ©","ШЇЩ‡","ШµШЇ"] },
      { type:"translate", source:T("Five people","Five people","Besh kishi","BeЕџ kiЕџi","Ш®Щ…ШіШ© ШЈШґШ®Ш§Шµ","ЩѕЩ†Ш¬ Щ†ЩЃШ±","дє”дёЄдєє","Cinco personas","FГјnf Personen"), answer:"ЩѕЩ†Ш¬ Щ†ЩЃШ±", accept:["ЩѕЩ†Ш¬ Щ†ЩЃШ±"] },
    ]),
    mkLesson(3,"рџҐ", T("ШєШ°Ш§","Food","Ovqat","Yiyecek","Ш§Щ„Ш·Ш№Ш§Щ…","ШєШ°Ш§","йЈџз‰©","Comida","Essen"), [
      { type:"choose", targetWord:"ШўШЁ", translations:T("Р’РѕРґР°","Water","Suv","Su","Щ…Ш§ШЎ","Hв‚‚O","ж°ґ","Agua","Wasser"), distractors:T(["Р§Р°Р№","РљРѕС„Рµ","РЁРµСЂР±РµС‚"],["Tea","Coffee","Sherbet"],["Choy","Qahva","Sharbat"],["Г‡ay","Kahve","Ећerbet"],["ШґШ§ЩЉ","Щ‚Щ‡Щ€Ш©","ШґШ±ШЁШ§ШЄ"],["Ъ†Ш§ЫЊ","Щ‚Щ‡Щ€Щ‡","ШґШ±ШЁШЄ"],["иЊ¶","е’–е•Ў","жћњж±Ѓ"],["TГ©","CafГ©","Refresco"],["Tee","Kaffee","Saft"]) },
      { type:"arrange", sentence:T("Р­С‚Рѕ РѕС‡РµРЅСЊ РІРєСѓСЃРЅРѕ","This is very tasty","Bu juda mazali","Bu Г§ok lezzetli","Щ‡Ш°Ш§ Щ„Ш°ЩЉШ° Ш¬ШЇШ§","Ш§ЫЊЩ† Ш®ЫЊЩ„ЫЊ Ш®Щ€ШґЩ…ШІЩ‡ Ш§ШіШЄ","иї™йќћеёёеҐЅеђѓ","Esto estГЎ muy rico","Das ist sehr lecker"), answer:"Ш§ЫЊЩ† Ш®ЫЊЩ„ЫЊ Ш®Щ€ШґЩ…ШІЩ‡ Ш§ШіШЄ", words:["Ш§ЫЊЩ†","Ш®ЫЊЩ„ЫЊ","Ш®Щ€ШґЩ…ШІЩ‡","Ш§ШіШЄ","ШЁШЇ","ЪЇШ±Ш§Щ†"] },
      { type:"fill", sentence:"ЫЊЪ© ___ Щ„Ш·ЩЃШ§Щ‹!", blank:"Ъ†Ш§ЫЊ", hint:T("РћРґРёРЅ С‡Р°Р№, РїРѕР¶Р°Р»СѓР№СЃС‚Р°!","One tea please!","Bir choy, iltimos!","Bir Г§ay lГјtfen!","ШґШ§ЩЉ Щ€Ш§Ш­ШЇ Щ…Щ† ЩЃШ¶Щ„Щѓ!","ЫЊЪ© Ъ†Ш§ЫЊ Щ„Ш·ЩЃШ§Щ‹!","дёЂжќЇиЊ¶иЇ·пјЃ","ВЎUn tГ© por favor!","Einen Tee bitte!"), options:["Ъ†Ш§ЫЊ","Ъ©ШЄШ§ШЁ","Щ…Ш§ШґЫЊЩ†","Ш®Ш§Щ†Щ‡"] },
    ]),
  ],

  // в”Ђв”Ђ UZBEK beginner в”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђ
  "uz-beginner": [
    mkLesson(1,"рџ‘‹", T("Salomlashish","Greetings","Salomlashish","SelamlaЕџma","Ш§Щ„ШЄШ­ЩЉШ§ШЄ","Ш§Ш­Щ€Ш§Щ„вЂЊЩѕШ±ШіЫЊ","й—®еЂ™","Saludos","BegrГјГџungen"), [
      { type:"choose", targetWord:"Salom", translations:T("РџСЂРёРІРµС‚","Hello","Salut","Merhaba","Щ…Ш±Ш­ШЁШ§","ШіЩ„Ш§Щ…","дЅ еҐЅ","Hola","Hallo"), distractors:T(["РџРѕРєР°","РЎРїР°СЃРёР±Рѕ","РќРµС‚"],["Bye","Thanks","No"],["Xayr","Rahmat","Yo'q"],["GГјle gГјle","TeЕџekkГјr","HayД±r"],["Щ€ШЇШ§Ш№Ш§","ШґЩѓШ±Ш§","Щ„Ш§"],["Ш®ШЇШ§Ш­Ш§ЩЃШё","Щ…Щ…Щ†Щ€Щ†","Щ†Щ‡"],["е†Ќи§Ѓ","и°ўи°ў","дёЌ"],["AdiГіs","Gracias","No"],["TschГјss","Danke","Nein"]) },
      { type:"arrange", sentence:T("РљР°Рє С‚РµР±СЏ Р·РѕРІСѓС‚?","What is your name?","Ismingiz nima?","AdД±n ne?","Щ…Ш§ Ш§ШіЩ…ЩѓШџ","Ш§ШіЩ…ШЄ Ъ†ЫЊЩ‡Шџ","дЅ еЏ«д»Ђд№€еђЌе­—пјџ","ВїCГіmo te llamas?","Wie heiГџt du?"), answer:"Ismingiz nima", words:["Ismingiz","nima","qayerda","qachon","necha","kim"] },
      { type:"fill", sentence:"___ ko'rishguncha!", blank:"Xayr", hint:T("Р”Рѕ СЃРІРёРґР°РЅРёСЏ!","Goodbye!","Xayr!","GГјle gГјle!","Щ€ШЇШ§Ш№Ш§!","Ш®ШЇШ§Ш­Ш§ЩЃШё!","е†Ќи§ЃпјЃ","ВЎAdiГіs!","Auf Wiedersehen!"), options:["Xayr","Salom","Rahmat","Iltimos"] },
      { type:"translate", source:T("Thank you","Thank you","Merci","TeЕџekkГјrler","ШґЩѓШ±Ш§","Щ…Щ…Щ†Щ€Щ†","и°ўи°ў","Gracias","Danke"), answer:"rahmat", accept:["rahmat","katta rahmat"] },
      { type:"choose", targetWord:"Kechirasiz", translations:T("РР·РІРёРЅРёС‚Рµ","Excuse me","Pardon","Г–zГјr","Ш№Ш°Ш±Ш§Щ‹","ШЁШЁШ®ШґЫЊШЇ","еЇ№дёЌиµ·","PerdГіn","Entschuldigung"), distractors:T(["РџСЂРёРІРµС‚","РЎРїР°СЃРёР±Рѕ","РџРѕР¶Р°Р»СѓР№СЃС‚Р°"],["Hello","Thanks","Please"],["Salom","Rahmat","Iltimos"],["Merhaba","TeЕџekkГјr","LГјtfen"],["Щ…Ш±Ш­ШЁШ§","ШґЩѓШ±Ш§","Щ…Щ† ЩЃШ¶Щ„Щѓ"],["ШіЩ„Ш§Щ…","Щ…Щ…Щ†Щ€Щ†","Щ„Ш·ЩЃШ§Щ‹"],["дЅ еҐЅ","и°ўи°ў","иЇ·"],["Hola","Gracias","Por favor"],["Hallo","Danke","Bitte"]) },
    ]),
    mkLesson(2,"рџ”ў", T("Raqamlar","Numbers","Raqamlar","SayД±lar","Ш§Щ„ШЈШ±Щ‚Ш§Щ…","Ш§Ш№ШЇШ§ШЇ","ж•°е­—","NГєmeros","Zahlen"), [
      { type:"choose", targetWord:"Bir", translations:T("РћРґРёРЅ","One","1","Bir","Щ€Ш§Ш­ШЇ","ЫЊЪ©","дёЂ","Uno","Eins"), distractors:T(["Р”РІР°","РўСЂРё","РџСЏС‚СЊ"],["Two","Three","Five"],["Ikki","Uch","Besh"],["Д°ki","ГњГ§","BeЕџ"],["Ш§Ш«Щ†Ш§Щ†","Ш«Щ„Ш§Ш«Ш©","Ш®Щ…ШіШ©"],["ШЇЩ€","ШіЩ‡","ЩѕЩ†Ш¬"],["дєЊ","дё‰","дє”"],["Dos","Tres","Cinco"],["Zwei","Drei","FГјnf"]) },
      { type:"arrange", sentence:T("РЈ РјРµРЅСЏ РїСЏС‚СЊ РєРЅРёРі","I have five books","Menda beshta kitob bor","BeЕџ kitabД±m var","Ш№Щ†ШЇЩЉ Ш®Щ…ШіШ© ЩѓШЄШЁ","ЩѕЩ†Ш¬ Ъ©ШЄШ§ШЁ ШЇШ§Ш±Щ…","ж€‘жњ‰дє”жњ¬д№¦","Tengo cinco libros","Ich habe fГјnf BГјcher"), answer:"Menda beshta kitob bor", words:["Menda","beshta","kitob","bor","yo'q","uchta"] },
      { type:"fill", sentence:"___ daqiqa kuting.", blank:"O'n", hint:T("РџРѕРґРѕР¶РґРёС‚Рµ РґРµСЃСЏС‚СЊ РјРёРЅСѓС‚.","Wait ten minutes.","O'n daqiqa kuting.","On dakika bekleyin.","Ш§Щ†ШЄШёШ± Ш№ШґШ± ШЇЩ‚Ш§Ш¦Щ‚.","ШЇЩ‡ ШЇЩ‚ЫЊЩ‚Щ‡ ШµШЁШ± Ъ©Щ†.","з­‰еЌЃе€†й’џгЂ‚","Espera diez minutos.","Warte zehn Minuten."), options:["O'n","Bir","Yuz","Ming"] },
    ]),
    mkLesson(3,"рџЌЅпёЏ", T("Ovqatlar","Food","Ovqat","Yiyecek","Ш§Щ„Ш·Ш№Ш§Щ…","ШєШ°Ш§","йЈџз‰©","Comida","Essen"), [
      { type:"choose", targetWord:"Suv", translations:T("Р’РѕРґР°","Water","Su","Su","Щ…Ш§ШЎ","ШўШЁ","ж°ґ","Agua","Wasser"), distractors:T(["Р§Р°Р№","РљРѕС„Рµ","РЁРµСЂР±РµС‚"],["Tea","Coffee","Juice"],["Choy","Qahva","Sharbat"],["Г‡ay","Kahve","Meyve suyu"],["ШґШ§ЩЉ","Щ‚Щ‡Щ€Ш©","Ш№ШµЩЉШ±"],["Ъ†Ш§ЫЊ","Щ‚Щ‡Щ€Щ‡","ШўШЁЩ…ЫЊЩ€Щ‡"],["иЊ¶","е’–е•Ў","жћњж±Ѓ"],["TГ©","CafГ©","Jugo"],["Tee","Kaffee","Saft"]) },
      { type:"arrange", sentence:T("Р­С‚Рѕ РѕС‡РµРЅСЊ РІРєСѓСЃРЅРѕ","This is very tasty","Bu juda mazali","Bu Г§ok lezzetli","Щ‡Ш°Ш§ Щ„Ш°ЩЉШ° Ш¬ШЇШ§","Ш§ЫЊЩ† Ш®ЫЊЩ„ЫЊ Ш®Щ€ШґЩ…ШІЩ‡ Ш§ШіШЄ","иї™йќћеёёзѕЋе‘і","Esto estГЎ muy rico","Das ist sehr lecker"), answer:"Bu juda mazali", words:["Bu","juda","mazali","yomon","arzon","qimmat"] },
      { type:"fill", sentence:"Non ___ yangi.", blank:"juda", hint:T("РҐР»РµР± РѕС‡РµРЅСЊ СЃРІРµР¶РёР№.","The bread is very fresh.","Non juda yangi.","Ekmek Г§ok taze.","Ш§Щ„Ш®ШЁШІ Ш·Ш§ШІШ¬ Ш¬ШЇШ§Щ‹.","Щ†Ш§Щ† Ш®ЫЊЩ„ЫЊ ШЄШ§ШІЩ‡ Ш§ШіШЄ.","йќўеЊ…йќћеёёж–°йІњгЂ‚","El pan estГЎ muy fresco.","Das Brot ist sehr frisch."), options:["juda","kam","ko'p","eski"] },
    ]),
  ],

  // в”Ђв”Ђ CHINESE beginner в”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђ
  "zh-beginner": [
    mkLesson(1,"рџ‘‹", T("й—®еЂ™","Greetings","Salomlashish","SelamlaЕџma","Ш§Щ„ШЄШ­ЩЉШ§ШЄ","Ш§Ш­Щ€Ш§Щ„вЂЊЩѕШ±ШіЫЊ","й—®еЂ™","Saludos","BegrГјГџungen"), [
      { type:"choose", targetWord:"дЅ еҐЅ", translations:T("РџСЂРёРІРµС‚","Hello","Salom","Merhaba","Щ…Ш±Ш­ШЁШ§","ШіЩ„Ш§Щ…","Hi","Hola","Hallo"), distractors:T(["РџРѕРєР°","РЎРїР°СЃРёР±Рѕ","РќРµС‚"],["Bye","Thanks","No"],["Xayr","Rahmat","Yo'q"],["GГјle gГјle","TeЕџekkГјr","HayД±r"],["Щ€ШЇШ§Ш№Ш§","ШґЩѓШ±Ш§","Щ„Ш§"],["Ш®ШЇШ§Ш­Ш§ЩЃШё","Щ…Щ…Щ†Щ€Щ†","Щ†Щ‡"],["Bye","Thanks","No"],["AdiГіs","Gracias","No"],["TschГјss","Danke","Nein"]) },
      { type:"arrange", sentence:T("РњРµРЅСЏ Р·РѕРІСѓС‚ Р›Рё","My name is Li","Mening ismim Li","AdД±m Li","Ш§ШіЩ…ЩЉ Щ„ЩЉ","Ш§ШіЩ…Щ… Щ„ЫЊЩ‡","ж€‘еЏ«жќЋ","Me llamo Li","Ich heiГџe Li"), answer:"ж€‘ еЏ« жќЋ", words:["ж€‘","еЏ«","жќЋ","дЅ ","д»–","еҐ№"] },
      { type:"fill", sentence:"___ и°ўи°ў!", blank:"йќћеёё", hint:T("Р‘РѕР»СЊС€РѕРµ СЃРїР°СЃРёР±Рѕ!","Thank you very much!","Katta rahmat!","Г‡ok teЕџekkГјrler!","ШґЩѓШ±Ш§ Ш¬ШІЩЉЩ„Ш§!","Ш®ЫЊЩ„ЫЊ Щ…Щ…Щ†Щ€Щ†!","йќћеёёж„џи°ўпјЃ","ВЎMuchas gracias!","Vielen Dank!"), options:["йќћеёё","дёЂз‚№","еѕ€е°‘","дёЌ"] },
      { type:"translate", source:T("Good morning","Good morning","Xayrli tong","GГјnaydД±n","ШµШЁШ§Ш­ Ш§Щ„Ш®ЩЉШ±","ШµШЁШ­ ШЁШ®ЫЊШ±","Morning greeting","Buenos dГ­as","Guten Morgen"), answer:"ж—©дёЉеҐЅ", accept:["ж—©дёЉеҐЅ","ж—©е®‰"] },
      { type:"choose", targetWord:"е†Ќи§Ѓ", translations:T("Р”Рѕ СЃРІРёРґР°РЅРёСЏ","Goodbye","Xayr","GГјle gГјle","Щ€ШЇШ§Ш№Ш§","Ш®ШЇШ§Ш­Ш§ЩЃШё","Bye","AdiГіs","Auf Wiedersehen"), distractors:T(["РџСЂРёРІРµС‚","РЎРїР°СЃРёР±Рѕ","Р”Р°"],["Hello","Thanks","Yes"],["Salom","Rahmat","Ha"],["Merhaba","TeЕџekkГјr","Evet"],["Щ…Ш±Ш­ШЁШ§","ШґЩѓШ±Ш§","Щ†Ш№Щ…"],["ШіЩ„Ш§Щ…","Щ…Щ…Щ†Щ€Щ†","ШЁЩ„Щ‡"],["Hi","Thanks","Yes"],["Hola","Gracias","SГ­"],["Hallo","Danke","Ja"]) },
    ]),
    mkLesson(2,"рџ”ў", T("ж•°е­—","Numbers","Raqamlar","SayД±lar","Ш§Щ„ШЈШ±Щ‚Ш§Щ…","Ш§Ш№ШЇШ§ШЇ","ж•°е­—","NГєmeros","Zahlen"), [
      { type:"choose", targetWord:"дёЂ", translations:T("РћРґРёРЅ","One","Bir","Bir","Щ€Ш§Ш­ШЇ","ЫЊЪ©","1","Uno","Eins"), distractors:T(["Р”РІР°","РўСЂРё","РџСЏС‚СЊ"],["Two","Three","Five"],["Ikki","Uch","Besh"],["Д°ki","ГњГ§","BeЕџ"],["Ш§Ш«Щ†Ш§Щ†","Ш«Щ„Ш§Ш«Ш©","Ш®Щ…ШіШ©"],["ШЇЩ€","ШіЩ‡","ЩѕЩ†Ш¬"],["дєЊ","дё‰","дє”"],["Dos","Tres","Cinco"],["Zwei","Drei","FГјnf"]) },
      { type:"fill", sentence:"ж€‘жњ‰ ___ жњ¬д№¦гЂ‚", blank:"дё‰", hint:T("РЈ РјРµРЅСЏ С‚СЂРё РєРЅРёРіРё.","I have three books.","Menda uchta kitob bor.","ГњГ§ kitabД±m var.","Ш№Щ†ШЇЩЉ Ш«Щ„Ш§Ш«Ш© ЩѓШЄШЁ.","ШіЩ‡ ШЄШ§ Ъ©ШЄШ§ШЁ ШЇШ§Ш±Щ….","ж€‘жњ‰дё‰жњ¬д№¦гЂ‚","Tengo tres libros.","Ich habe drei BГјcher."), options:["дё‰","дёЂ","еЌЃ","з™ѕ"] },
      { type:"translate", source:T("Ten minutes","Ten minutes","O'n daqiqa","On dakika","Ш№ШґШ± ШЇЩ‚Ш§Ш¦Щ‚","ШЇЩ‡ ШЇЩ‚ЫЊЩ‚Щ‡","10 minutes","Diez minutos","Zehn Minuten"), answer:"еЌЃе€†й’џ", accept:["еЌЃе€†й’џ","еЌЃ е€†й’џ"] },
    ]),
    mkLesson(3,"рџЌњ", T("йЈџз‰©","Food","Ovqat","Yiyecek","Ш§Щ„Ш·Ш№Ш§Щ…","ШєШ°Ш§","йЈџз‰©","Comida","Essen"), [
      { type:"choose", targetWord:"ж°ґ", translations:T("Р’РѕРґР°","Water","Suv","Su","Щ…Ш§ШЎ","ШўШЁ","Hв‚‚O","Agua","Wasser"), distractors:T(["Р§Р°Р№","РљРѕС„Рµ","РњРѕР»РѕРєРѕ"],["Tea","Coffee","Milk"],["Choy","Qahva","Sut"],["Г‡ay","Kahve","SГјt"],["ШґШ§ЩЉ","Щ‚Щ‡Щ€Ш©","Ш­Щ„ЩЉШЁ"],["Ъ†Ш§ЫЊ","Щ‚Щ‡Щ€Щ‡","ШґЫЊШ±"],["иЊ¶","е’–е•Ў","з‰›еҐ¶"],["TГ©","CafГ©","Leche"],["Tee","Kaffee","Milch"]) },
      { type:"arrange", sentence:T("Р­С‚Рѕ РѕС‡РµРЅСЊ РІРєСѓСЃРЅРѕ","This is very tasty","Bu juda mazali","Bu Г§ok lezzetli","Щ‡Ш°Ш§ Щ„Ш°ЩЉШ° Ш¬ШЇШ§","Ш§ЫЊЩ† Ш®ЫЊЩ„ЫЊ Ш®Щ€ШґЩ…ШІЩ‡ Ш§ШіШЄ","This is delicious","Esto estГЎ muy rico","Das ist sehr lecker"), answer:"иї™дёЄ еѕ€ еҐЅеђѓ", words:["иї™дёЄ","еѕ€","еҐЅеђѓ","йљѕеђѓ","иґµ","дѕїе®њ"] },
      { type:"fill", sentence:"ж€‘жѓіе–ќ ___гЂ‚", blank:"иЊ¶", hint:T("РЇ С…РѕС‡Сѓ РІС‹РїРёС‚СЊ С‡Р°Р№.","I want to drink tea.","Choy ichmoqchiman.","Г‡ay iГ§mek istiyorum.","ШЈШ±ЩЉШЇ ШґШ±ШЁ Ш§Щ„ШґШ§ЩЉ.","Щ…ЫЊвЂЊШ®Щ€Ш§Щ… Ъ†Ш§ЫЊ ШЁШ®Щ€Ш±Щ….","ж€‘жѓіе–ќиЊ¶гЂ‚","Quiero beber tГ©.","Ich mГ¶chte Tee trinken."), options:["иЊ¶","д№¦","иЅ¦","е®¶"] },
    ]),
  ],

  // в”Ђв”Ђ GERMAN intermediate в”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђ
  "de-intermediate": [
    mkLesson(1,"рџ’ј", T("Arbeit","Work","Ish","Д°Еџ","Ш§Щ„Ш№Щ…Щ„","Ъ©Ш§Ш±","е·ҐдЅњ","Trabajo","Arbeit"), [
      { type:"choose", targetWord:"Besprechung", translations:T("РЎРѕРІРµС‰Р°РЅРёРµ","Meeting","Yig'ilish","ToplantД±","Ш§Ш¬ШЄЩ…Ш§Ш№","Ш¬Щ„ШіЩ‡","дјљи®®","ReuniГіn","Meeting"), distractors:T(["РџРµСЂРµСЂС‹РІ","Р’РµС‡РµСЂРёРЅРєР°","РћС‚С‡С‘С‚"],["Break","Party","Report"],["Tanaffus","Ziyofat","Hisobot"],["Mola","Parti","Rapor"],["Ш§ШіШЄШ±Ш§Ш­Ш©","Ш­ЩЃЩ„Ш©","ШЄЩ‚Ш±ЩЉШ±"],["Ш§ШіШЄШ±Ш§Ш­ШЄ","Щ…Щ‡Щ…Ш§Щ†ЫЊ","ЪЇШІШ§Ш±Шґ"],["дј‘жЃЇ","жґѕеЇ№","жЉҐе‘Љ"],["Descanso","Fiesta","Informe"],["Pause","Party","Bericht"]) },
      { type:"translate", source:T("The deadline is tomorrow.","The deadline is tomorrow.","Muddat ertaga.","Son tarih yarД±n.","Ш§Щ„Щ…Щ€Ш№ШЇ Ш§Щ„Щ†Щ‡Ш§Ш¦ЩЉ ШєШЇШ§.","Щ…Щ‡Щ„ШЄ ЩЃШ±ШЇШ§ Ш§ШіШЄ.","ж€Єж­ўж—ҐжњџжЇжЋе¤©гЂ‚","El plazo es maГ±ana.","Die Frist ist morgen."), answer:"die frist ist morgen", accept:["die frist ist morgen","der termin ist morgen"] },
      { type:"arrange", sentence:T("РњРѕР№ РєРѕР»Р»РµРіР° РѕС‡РµРЅСЊ РїРѕР»РµР·РµРЅ","My colleague is very helpful","Mening hamkashim foydali","MeslektaЕџД±m yardД±msever","ШІЩ…ЩЉЩ„ЩЉ Щ…ЩЃЩЉШЇ Ш¬ШЇШ§","Щ‡Щ…Ъ©Ш§Ш±Щ… Щ…ЩЃЫЊШЇ Ш§ШіШЄ","ж€‘зљ„еђЊдє‹еѕ€жњ‰её®еЉ©","Mi colega es muy Гєtil","Mein Kollege ist sehr hilfsbereit"), answer:"Mein Kollege ist sehr hilfsbereit", words:["Mein","Kollege","ist","sehr","hilfsbereit","faul","selten"] },
      { type:"fill", sentence:"Was ist dein ___?", blank:"Gehalt", hint:T("РљР°РєР°СЏ Сѓ С‚РµР±СЏ Р·Р°СЂРїР»Р°С‚Р°?","What is your salary?","Maoshingiz qancha?","MaaЕџД±n ne kadar?","Щ…Ш§ Щ‡Щ€ Ш±Ш§ШЄШЁЩѓШџ","Ш­Щ‚Щ€Щ‚ШЄ Ъ†Щ‚ШЇШ±Щ‡Шџ","дЅ зљ„и–Єж°ґжЇе¤ље°‘пјџ","ВїCuГЎl es tu salario?","Was ist dein Gehalt?"), options:["Gehalt","Name","Haus","Auto"] },
    ]),
    mkLesson(2,"рџЏ™пёЏ", T("Stadt","City","Shahar","Ећehir","Ш§Щ„Щ…ШЇЩЉЩ†Ш©","ШґЩ‡Ш±","еџЋеё‚","Ciudad","Stadt"), [
      { type:"choose", targetWord:"U-Bahn", translations:T("РњРµС‚СЂРѕ","Subway","Metro","Metro","Щ…ШЄШ±Щ€","Щ…ШЄШ±Щ€","ењ°й“Ѓ","Metro","Underground"), distractors:T(["РђРІС‚РѕР±СѓСЃ","РўСЂР°РјРІР°Р№","РўР°РєСЃРё"],["Bus","Tram","Taxi"],["Avtobus","Tramvay","Taksi"],["OtobГјs","Tramvay","Taksi"],["Ш­Ш§ЩЃЩ„Ш©","ШЄШ±Ш§Щ…","ШіЩЉШ§Ш±Ш© ШЈШ¬Ш±Ш©"],["Ш§ШЄЩ€ШЁЩ€Ші","ШЄШ±Ш§Щ…Щ€Ш§","ШЄШ§Ъ©ШіЫЊ"],["е…¬дє¤","з”µиЅ¦","е‡єз§џиЅ¦"],["AutobГєs","TranvГ­a","Taxi"],["Bus","StraГџenbahn","Taxi"]) },
      { type:"translate", source:T("There is heavy traffic here.","There is heavy traffic here.","Bu yerda tiqilinch ko'p.","Burada yoДџun trafik var.","ЩЉЩ€Ш¬ШЇ Ш§ШІШЇШ­Ш§Щ… Щ…Ш±Щ€Ш±ЩЉ Щ‡Щ†Ш§.","Ш§ЫЊЩ†Ш¬Ш§ ШЄШ±Ш§ЩЃЫЊЪ© ШіЩ†ЪЇЫЊЩ† Ш§ШіШЄ.","иї™й‡Њдє¤йЂљеѕ€ж‹ҐжЊ¤гЂ‚","Hay mucho trГЎfico aquГ­.","Hier ist viel Verkehr."), answer:"hier ist viel verkehr", accept:["hier ist viel verkehr","hier gibt es viel verkehr"] },
      { type:"fill", sentence:"Die Apotheke ist ___ der Bank.", blank:"neben", hint:T("РђРїС‚РµРєР° СЂСЏРґРѕРј СЃ Р±Р°РЅРєРѕРј.","The pharmacy is near the bank.","Dorixona bank yonida.","Eczane bankanД±n yanД±nda.","Ш§Щ„ШµЩЉШЇЩ„ЩЉШ© ШЁШ¬Ш§Щ†ШЁ Ш§Щ„ШЁЩ†Щѓ.","ШЇШ§Ш±Щ€Ш®Ш§Щ†Щ‡ Ъ©Щ†Ш§Ш± ШЁШ§Щ†Ъ© Ш§ШіШЄ.","иЌЇеє—ењЁй“¶иЎЊж—Ѓиѕ№гЂ‚","La farmacia estГЎ junto al banco.","Die Apotheke ist neben der Bank."), options:["neben","unter","Гјber","hinter"] },
    ]),
  ],

  // в”Ђв”Ђ SPANISH intermediate в”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђ
  "es-intermediate": [
    mkLesson(1,"рџ’ј", T("Trabajo","Work","Ish","Д°Еџ","Ш§Щ„Ш№Щ…Щ„","Ъ©Ш§Ш±","е·ҐдЅњ","Trabajo","Arbeit"), [
      { type:"choose", targetWord:"ReuniГіn", translations:T("Р’СЃС‚СЂРµС‡Р°","Meeting","Yig'ilish","ToplantД±","Ш§Ш¬ШЄЩ…Ш§Ш№","Ш¬Щ„ШіЩ‡","дјљи®®","Meeting","Besprechung"), distractors:T(["РџРµСЂРµСЂС‹РІ","Р’РµС‡РµСЂРёРЅРєР°","РћС‚С‡С‘С‚"],["Break","Party","Report"],["Tanaffus","Ziyofat","Hisobot"],["Mola","Parti","Rapor"],["Ш§ШіШЄШ±Ш§Ш­Ш©","Ш­ЩЃЩ„Ш©","ШЄЩ‚Ш±ЩЉШ±"],["Ш§ШіШЄШ±Ш§Ш­ШЄ","Щ…Щ‡Щ…Ш§Щ†ЫЊ","ЪЇШІШ§Ш±Шґ"],["дј‘жЃЇ","жґѕеЇ№","жЉҐе‘Љ"],["Descanso","Fiesta","Informe"],["Pause","Party","Bericht"]) },
      { type:"translate", source:T("The deadline is tomorrow.","The deadline is tomorrow.","Muddat ertaga.","Son tarih yarД±n.","Ш§Щ„Щ…Щ€Ш№ШЇ Ш§Щ„Щ†Щ‡Ш§Ш¦ЩЉ ШєШЇШ§.","Щ…Щ‡Щ„ШЄ ЩЃШ±ШЇШ§ Ш§ШіШЄ.","ж€Єж­ўж—ҐжњџжЇжЋе¤©гЂ‚","El plazo es maГ±ana.","Die Frist ist morgen."), answer:"el plazo es maГ±ana", accept:["el plazo es maГ±ana","la fecha lГ­mite es maГ±ana"] },
      { type:"arrange", sentence:T("РњРѕР№ РєРѕР»Р»РµРіР° РѕС‡РµРЅСЊ РїРѕР»РµР·РµРЅ","My colleague is very helpful","Mening hamkashim foydali","MeslektaЕџД±m yardД±msever","ШІЩ…ЩЉЩ„ЩЉ Щ…ЩЃЩЉШЇ Ш¬ШЇШ§","Щ‡Щ…Ъ©Ш§Ш±Щ… Щ…ЩЃЫЊШЇ Ш§ШіШЄ","ж€‘зљ„еђЊдє‹еѕ€жњ‰её®еЉ©","Mi colega es muy Гєtil","Mein Kollege ist sehr hilfsbereit"), answer:"Mi colega es muy Гєtil", words:["Mi","colega","es","muy","Гєtil","perezoso","malo"] },
      { type:"fill", sentence:"ВїCuГЎl es tu ___?", blank:"salario", hint:T("РљР°РєР°СЏ Сѓ С‚РµР±СЏ Р·Р°СЂРїР»Р°С‚Р°?","What is your salary?","Maoshingiz qancha?","MaaЕџД±n ne kadar?","Щ…Ш§ Щ‡Щ€ Ш±Ш§ШЄШЁЩѓШџ","Ш­Щ‚Щ€Щ‚ШЄ Ъ†Щ‚ШЇШ±Щ‡Шџ","дЅ зљ„и–Єж°ґжЇе¤ље°‘пјџ","ВїCuГЎl es tu salario?","Was ist dein Gehalt?"), options:["salario","nombre","casa","coche"] },
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
        id:1, emoji:"рџ“љ",
        titles:{ ru:"РЎРєРѕСЂРѕ", en:"Coming soon", uz:"Tez kunda", tr:"YakД±nda", ar:"Щ‚Ш±ЩЉШЁШ§Щ‹", fa:"ШЁЩ‡ ШІЩ€ШЇЫЊ", zh:"еЌіе°†жЋЁе‡є", es:"PrГіximamente", de:"DemnГ¤chst" },
        exercises:[
          { type:"choose", targetWord:"Soon", translations:{ ru:"РЎРєРѕСЂРѕ", en:"Coming soon", uz:"Tez kunda", tr:"YakД±nda", ar:"Щ‚Ш±ЩЉШЁШ§Щ‹", fa:"ШЁЩ‡ ШІЩ€ШЇЫЊ", zh:"еЌіе°†жЋЁе‡є", es:"PrГіximamente", de:"DemnГ¤chst" }, distractors:{ ru:["Р”Р°","РќРµС‚","РњРѕР¶РµС‚"], en:["Yes","No","Maybe"], uz:["Ha","Yo'q","Balki"], tr:["Evet","HayД±r","Belki"], ar:["Щ†Ш№Щ…","Щ„Ш§","Ш±ШЁЩ…Ш§"], fa:["ШЁЩ„Щ‡","Щ†Щ‡","ШґШ§ЫЊШЇ"], zh:["жЇ","еђ¦","д№џи®ё"], es:["SГ­","No","QuizГЎs"], de:["Ja","Nein","Vielleicht"] } },
        ]
      }
    ];
  }
});


// в”Ђв”Ђв”Ђ ADDITIONAL LESSONS (injected after LESSON_DATA) в”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђ
const ADDITIONAL_LESSONS = {

  // в•ђв•ђ ENGLISH вЂ” more lessons в•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђ
  "en-beginner-extra": [
    { id:5, emoji:"рџ‘ЁвЂЌрџ‘©вЂЌрџ‘§", titles:{ru:"РЎРµРјСЊСЏ",en:"Family",uz:"Oila",tr:"Aile",ar:"Ш§Щ„Ш№Ш§Ш¦Щ„Ш©",fa:"Ш®Ш§Щ†Щ€Ш§ШЇЩ‡",zh:"е®¶еє­",es:"Familia",de:"Familie"},
      exercises:[
        {type:"choose",targetWord:"Mother",translations:{ru:"РњР°РјР°",en:"Mom",uz:"Ona",tr:"Anne",ar:"ШЈЩ…",fa:"Щ…Ш§ШЇШ±",zh:"е¦€е¦€",es:"Madre",de:"Mutter"},distractors:{ru:["РџР°РїР°","Р‘СЂР°С‚","РЎРµСЃС‚СЂР°"],en:["Father","Brother","Sister"],uz:["Ota","Aka","Singil"],tr:["Baba","Erkek kardeЕџ","KД±z kardeЕџ"],ar:["ШЈШЁ","ШЈШ®","ШЈШ®ШЄ"],fa:["ЩѕШЇШ±","ШЁШ±Ш§ШЇШ±","Ш®Щ€Ш§Щ‡Ш±"],zh:["з€ёз€ё","е…„ејџ","е§ђе¦№"],es:["Padre","Hermano","Hermana"],de:["Vater","Bruder","Schwester"]}},
        {type:"arrange",sentence:{ru:"РњРѕСЏ СЃРµРјСЊСЏ Р±РѕР»СЊС€Р°СЏ",en:"My family is big",uz:"Mening oilam katta",tr:"Ailem bГјyГјk",ar:"Ш№Ш§Ш¦Щ„ШЄЩЉ ЩѓШЁЩЉШ±Ш©",fa:"Ш®Ш§Щ†Щ€Ш§ШЇЩ‡вЂЊШ§Щ… ШЁШІШ±ЪЇ Ш§ШіШЄ",zh:"ж€‘зљ„е®¶еє­еѕ€е¤§",es:"Mi familia es grande",de:"Meine Familie ist groГџ"},answer:"My family is big",words:["My","family","is","big","small","their"]},
        {type:"fill",sentence:"I have two ___.",blank:"sisters",hint:{ru:"РЈ РјРµРЅСЏ РґРІРµ СЃРµСЃС‚СЂС‹.",en:"I have two sisters.",uz:"Mening ikki singlim bor.",tr:"Д°ki kД±z kardeЕџim var.",ar:"Ш№Щ†ШЇЩЉ ШЈШ®ШЄШ§Щ†.",fa:"ШЇЩ€ Ш®Щ€Ш§Щ‡Ш± ШЇШ§Ш±Щ….",zh:"ж€‘жњ‰дё¤дёЄе§ђе¦№гЂ‚",es:"Tengo dos hermanas.",de:"Ich habe zwei Schwestern."},options:["sisters","brothers","fathers","mothers"]},
        {type:"translate",source:{ru:"РњРѕР№ РїР°РїР° РІСЂР°С‡.",en:"My father is a doctor.",uz:"Otam shifokor.",tr:"Babam doktor.",ar:"ШЈШЁЩЉ Ш·ШЁЩЉШЁ.",fa:"ЩѕШЇШ±Щ… ШЇЪ©ШЄШ±Щ‡.",zh:"ж€‘з€ёз€ёжЇеЊ»з”џгЂ‚",es:"Mi padre es mГ©dico.",de:"Mein Vater ist Arzt."},answer:"my father is a doctor",accept:["my father is a doctor","my dad is a doctor"]},
        {type:"choose",targetWord:"Children",translations:{ru:"Р”РµС‚Рё",en:"Kids",uz:"Bolalar",tr:"Г‡ocuklar",ar:"ШЈШ·ЩЃШ§Щ„",fa:"ШЁЪ†Щ‡вЂЊЩ‡Ш§",zh:"е­©е­ђд»¬",es:"NiГ±os",de:"Kinder"},distractors:{ru:["Р’Р·СЂРѕСЃР»С‹Рµ","РЎС‚Р°СЂРёРєРё","Р РѕРґРёС‚РµР»Рё"],en:["Adults","Elderly","Parents"],uz:["Kattalar","Qariyalar","Ota-onalar"],tr:["YetiЕџkinler","YaЕџlД±lar","Ebeveynler"],ar:["ШЁШ§Щ„ШєЩ€Щ†","ЩѓШЁШ§Ш±","Щ€Ш§Щ„ШЇШ§Щ†"],fa:["ШЁШІШ±ЪЇШіШ§Щ„Ш§Щ†","ШіШ§Щ„Щ…Щ†ШЇШ§Щ†","Щ€Ш§Щ„ШЇЫЊЩ†"],zh:["ж€ђе№ґдєє","иЂЃдєє","з€¶жЇЌ"],es:["Adultos","Ancianos","Padres"],de:["Erwachsene","Senioren","Eltern"]}},
      ]},
    { id:6, emoji:"рџЋЁ", titles:{ru:"Р¦РІРµС‚Р°",en:"Colors",uz:"Ranglar",tr:"Renkler",ar:"Ш§Щ„ШЈЩ„Щ€Ш§Щ†",fa:"Ш±Щ†ЪЇвЂЊЩ‡Ш§",zh:"йўњи‰І",es:"Colores",de:"Farben"},
      exercises:[
        {type:"choose",targetWord:"Red",translations:{ru:"РљСЂР°СЃРЅС‹Р№",en:"Crimson",uz:"Qizil",tr:"KД±rmД±zД±",ar:"ШЈШ­Щ…Ш±",fa:"Щ‚Ш±Щ…ШІ",zh:"зєўи‰І",es:"Rojo",de:"Rot"},distractors:{ru:["РЎРёРЅРёР№","Р—РµР»С‘РЅС‹Р№","Р–С‘Р»С‚С‹Р№"],en:["Blue","Green","Yellow"],uz:["Ko'k","Yashil","Sariq"],tr:["Mavi","YeЕџil","SarД±"],ar:["ШЈШІШ±Щ‚","ШЈШ®Ш¶Ш±","ШЈШµЩЃШ±"],fa:["ШўШЁЫЊ","ШіШЁШІ","ШІШ±ШЇ"],zh:["и“ќи‰І","з»їи‰І","й»„и‰І"],es:["Azul","Verde","Amarillo"],de:["Blau","GrГјn","Gelb"]}},
        {type:"arrange",sentence:{ru:"РњРѕСЏ РјР°С€РёРЅР° СЃРёРЅСЏСЏ",en:"My car is blue",uz:"Mening mashinam ko'k",tr:"Arabam mavi",ar:"ШіЩЉШ§Ш±ШЄЩЉ ШІШ±Щ‚Ш§ШЎ",fa:"Щ…Ш§ШґЫЊЩ†Щ… ШўШЁЫЊ Ш§ШіШЄ",zh:"ж€‘зљ„иЅ¦жЇи“ќи‰Ізљ„",es:"Mi coche es azul",de:"Mein Auto ist blau"},answer:"My car is blue",words:["My","car","is","blue","red","green"]},
        {type:"fill",sentence:"The sky is ___.",blank:"blue",hint:{ru:"РќРµР±Рѕ РіРѕР»СѓР±РѕРµ.",en:"The sky is blue.",uz:"Osmon ko'k.",tr:"GГ¶kyГјzГј mavi.",ar:"Ш§Щ„ШіЩ…Ш§ШЎ ШІШ±Щ‚Ш§ШЎ.",fa:"ШўШіЩ…Ш§Щ† ШўШЁЫЊ Ш§ШіШЄ.",zh:"е¤©з©єжЇи“ќи‰Ізљ„гЂ‚",es:"El cielo es azul.",de:"Der Himmel ist blau."},options:["blue","red","black","white"]},
        {type:"translate",source:{ru:"Р‘РµР»С‹Р№ Рё С‡С‘СЂРЅС‹Р№",en:"White and black",uz:"Oq va qora",tr:"Beyaz ve siyah",ar:"ШЈШЁЩЉШ¶ Щ€ШЈШіЩ€ШЇ",fa:"ШіЩЃЫЊШЇ Щ€ Щ…ШґЪ©ЫЊ",zh:"й»‘з™Ѕ",es:"Blanco y negro",de:"WeiГџ und Schwarz"},answer:"white and black",accept:["white and black","black and white"]},
      ]},
    { id:7, emoji:"вЏ°", titles:{ru:"Р’СЂРµРјСЏ",en:"Time",uz:"Vaqt",tr:"Zaman",ar:"Ш§Щ„Щ€Щ‚ШЄ",fa:"ШІЩ…Ш§Щ†",zh:"ж—¶й—ґ",es:"Tiempo",de:"Zeit"},
      exercises:[
        {type:"choose",targetWord:"Morning",translations:{ru:"РЈС‚СЂРѕ",en:"Dawn time",uz:"Ertalab",tr:"Sabah",ar:"ШµШЁШ§Ш­",fa:"ШµШЁШ­",zh:"ж—©дёЉ",es:"MaГ±ana",de:"Morgen"},distractors:{ru:["Р’РµС‡РµСЂ","РќРѕС‡СЊ","Р”РµРЅСЊ"],en:["Evening","Night","Day"],uz:["Kechqurun","Tun","Kun"],tr:["AkЕџam","Gece","GГјn"],ar:["Щ…ШіШ§ШЎ","Щ„ЩЉЩ„","Щ†Щ‡Ш§Ш±"],fa:["Ш№ШµШ±","ШґШЁ","Ш±Щ€ШІ"],zh:["ж™љдёЉ","е¤њж™љ","з™Ѕе¤©"],es:["Tarde","Noche","DГ­a"],de:["Abend","Nacht","Tag"]}},
        {type:"arrange",sentence:{ru:"РЎРµР№С‡Р°СЃ С‚СЂРё С‡Р°СЃР° РґРЅСЏ",en:"It is three o clock now",uz:"Hozir soat uch",tr:"Ећu an saat ГјГ§",ar:"Ш§Щ„ШўЩ† Ш§Щ„ШіШ§Ш№Ш© Ш§Щ„Ш«Ш§Щ„Ш«Ш©",fa:"Ш§Щ„Ш§Щ† ШіШ§Ш№ШЄ ШіЩ‡ Ш§ШіШЄ",zh:"зЋ°ењЁжЇдё‰з‚№й’џ",es:"Ahora son las tres",de:"Es ist jetzt drei Uhr"},answer:"It is three o clock now",words:["It","is","three","o","clock","now","five","morning"]},
        {type:"fill",sentence:"See you ___!",blank:"tomorrow",hint:{ru:"РЈРІРёРґРёРјСЃСЏ Р·Р°РІС‚СЂР°!",en:"See you tomorrow!",uz:"Ertaga ko'rishguncha!",tr:"YarД±n gГ¶rГјЕџГјrГјz!",ar:"ШЈШ±Ш§Щѓ ШєШЇШ§Щ‹!",fa:"ЩЃШ±ШЇШ§ Щ…ЫЊвЂЊШЁЫЊЩ†Щ…ШЄ!",zh:"жЋе¤©и§ЃпјЃ",es:"ВЎHasta maГ±ana!",de:"Bis morgen!"},options:["tomorrow","yesterday","never","soon"]},
        {type:"translate",source:{ru:"РљРѕС‚РѕСЂС‹Р№ С‡Р°СЃ?",en:"What time is it?",uz:"Soat necha?",tr:"Saat kaГ§?",ar:"ЩѓЩ… Ш§Щ„ШіШ§Ш№Ш©Шџ",fa:"ШіШ§Ш№ШЄ Ъ†Щ†ШЇЩ‡Шџ",zh:"зЋ°ењЁе‡ з‚№пјџ",es:"ВїQuГ© hora es?",de:"Wie spГ¤t ist es?"},answer:"what time is it",accept:["what time is it","what's the time"]},
      ]},
    { id:8, emoji:"рџЊ¦пёЏ", titles:{ru:"РџРѕРіРѕРґР°",en:"Weather",uz:"Ob-havo",tr:"Hava durumu",ar:"Ш§Щ„Ш·Щ‚Ші",fa:"ШўШЁвЂЊЩ€Щ‡Щ€Ш§",zh:"е¤©ж°”",es:"Clima",de:"Wetter"},
      exercises:[
        {type:"choose",targetWord:"Hot",translations:{ru:"Р–Р°СЂРєРѕ",en:"Warm",uz:"Issiq",tr:"SД±cak",ar:"Ш­Ш§Ш±",fa:"ЪЇШ±Щ…",zh:"зѓ­",es:"Caliente",de:"HeiГџ"},distractors:{ru:["РҐРѕР»РѕРґРЅРѕ","РўРµРїР»Рѕ","Р’РµС‚СЂРµРЅРѕ"],en:["Cold","Warm","Windy"],uz:["Sovuq","Iliq","ShamolР»Рё"],tr:["SoДџuk","IlД±k","RГјzgarlД±"],ar:["ШЁШ§Ш±ШЇ","ШЇШ§ЩЃШ¦","Ш№Ш§ШµЩЃ"],fa:["ШіШ±ШЇ","ЪЇШ±Щ…","ШЁШ§ШЇЫЊ"],zh:["е†·","жљ–","жњ‰йЈЋ"],es:["FrГ­o","Tibio","Ventoso"],de:["Kalt","Warm","Windig"]}},
        {type:"arrange",sentence:{ru:"РЎРµРіРѕРґРЅСЏ РѕС‡РµРЅСЊ С…РѕР»РѕРґРЅРѕ",en:"It is very cold today",uz:"Bugun juda sovuq",tr:"BugГјn Г§ok soДџuk",ar:"Ш§Щ„ЩЉЩ€Щ… ШЁШ§Ш±ШЇ Ш¬ШЇШ§Щ‹",fa:"Ш§Щ…Ш±Щ€ШІ Ш®ЫЊЩ„ЫЊ ШіШ±ШЇ Ш§ШіШЄ",zh:"д»Ље¤©еѕ€е†·",es:"Hoy hace mucho frГ­o",de:"Heute ist es sehr kalt"},answer:"It is very cold today",words:["It","is","very","cold","today","hot","tomorrow"]},
        {type:"fill",sentence:"It is ___ outside.",blank:"raining",hint:{ru:"РќР° СѓР»РёС†Рµ РґРѕР¶РґСЊ.",en:"It is raining outside.",uz:"Tashqarida yomg'ir yog'yapti.",tr:"DД±ЕџarД±da yaДџmur yaДџД±yor.",ar:"Ш§Щ„Щ…Ш·Ш± ЩЉЩ†ШІЩ„ Ш®Ш§Ш±Ш¬Ш§Щ‹.",fa:"ШЁЫЊШ±Щ€Щ† ШЁШ§Ш±Ш§Щ† Щ…ЫЊШ§ШЇ.",zh:"е¤–йќўењЁдё‹й›ЁгЂ‚",es:"EstГЎ lloviendo afuera.",de:"Es regnet drauГџen."},options:["raining","sunny","snowing","cloudy"]},
        {type:"translate",source:{ru:"РљР°РєР°СЏ РїРѕРіРѕРґР° СЃРµРіРѕРґРЅСЏ?",en:"What is the weather today?",uz:"Bugun ob-havo qanday?",tr:"BugГјn hava nasД±l?",ar:"ЩѓЩЉЩЃ Ш§Щ„Ш·Щ‚Ші Ш§Щ„ЩЉЩ€Щ…Шџ",fa:"Ш§Щ…Ш±Щ€ШІ Щ‡Щ€Ш§ Ъ†Ш·Щ€Ш±Щ‡Шџ",zh:"д»Ље¤©е¤©ж°”жЂЋд№€ж ·пјџ",es:"ВїCГіmo estГЎ el clima hoy?",de:"Wie ist das Wetter heute?"},answer:"what is the weather today",accept:["what is the weather today","how is the weather today","what's the weather today"]},
      ]},
  ],

  "en-intermediate-extra": [
    { id:3, emoji:"вњ€пёЏ", titles:{ru:"РџСѓС‚РµС€РµСЃС‚РІРёСЏ",en:"Travel",uz:"Sayohat",tr:"Seyahat",ar:"Ш§Щ„ШіЩЃШ±",fa:"ШіЩЃШ±",zh:"ж—…иЎЊ",es:"Viaje",de:"Reise"},
      exercises:[
        {type:"choose",targetWord:"Passport",translations:{ru:"РџР°СЃРїРѕСЂС‚",en:"Travel document",uz:"Pasport",tr:"Pasaport",ar:"Ш¬Щ€Ш§ШІ ШіЩЃШ±",fa:"ЩѕШ§ШіЩѕЩ€Ш±ШЄ",zh:"жЉ¤з…§",es:"Pasaporte",de:"Reisepass"},distractors:{ru:["Р‘РёР»РµС‚","Р’РёР·Р°","РЎСѓРјРєР°"],en:["Ticket","Visa","Bag"],uz:["Chipta","Viza","Sumka"],tr:["Bilet","Vize","Г‡anta"],ar:["ШЄШ°ЩѓШ±Ш©","ШЄШЈШґЩЉШ±Ш©","Ш­Щ‚ЩЉШЁШ©"],fa:["ШЁЩ„ЫЊШЄ","Щ€ЫЊШІШ§","Ъ©ЫЊЩЃ"],zh:["зҐЁ","з­ѕиЇЃ","еЊ…"],es:["Boleto","Visa","Bolsa"],de:["Ticket","Visum","Tasche"]}},
        {type:"translate",source:{ru:"Р“РґРµ РјРѕР№ Р±Р°РіР°Р¶?",en:"Where is my luggage?",uz:"Mening bagajim qayerda?",tr:"BagajД±m nerede?",ar:"ШЈЩЉЩ† ШЈЩ…ШЄШ№ШЄЩЉШџ",fa:"Ъ†Щ…ШЇЩ€Щ†Щ… Ъ©Ш¬Ш§ШіШЄШџ",zh:"ж€‘зљ„иЎЊжќЋењЁе“Єй‡Њпјџ",es:"ВїDГіnde estГЎ mi equipaje?",de:"Wo ist mein GepГ¤ck?"},answer:"where is my luggage",accept:["where is my luggage","where is my baggage"]},
        {type:"arrange",sentence:{ru:"РњРѕР№ СЂРµР№СЃ Р·Р°РґРµСЂР¶Р°РЅ РЅР° РґРІР° С‡Р°СЃР°",en:"My flight is delayed by two hours",uz:"Mening reysim ikki soatga kechikdi",tr:"UГ§uЕџum iki saat gecikti",ar:"Ш±Ш­Щ„ШЄЩЉ Щ…ШЄШЈШ®Ш±Ш© ШіШ§Ш№ШЄЩЉЩ†",fa:"ЩѕШ±Щ€Ш§ШІЩ… ШЇЩ€ ШіШ§Ш№ШЄ ШЄШЈШ®ЫЊШ± ШЇШ§Ш±Щ‡",zh:"ж€‘зљ„и€ЄзЏ­е»¶иЇЇдє†дё¤дёЄе°Џж—¶",es:"Mi vuelo estГЎ retrasado dos horas",de:"Mein Flug hat zwei Stunden VerspГ¤tung"},answer:"My flight is delayed by two hours",words:["My","flight","is","delayed","by","two","hours","minutes"]},
        {type:"fill",sentence:"I need to ___ my ticket.",blank:"book",hint:{ru:"РњРЅРµ РЅСѓР¶РЅРѕ Р·Р°Р±СЂРѕРЅРёСЂРѕРІР°С‚СЊ Р±РёР»РµС‚.",en:"I need to book my ticket.",uz:"Chiptamni band qilishim kerak.",tr:"Biletimi rezerve etmem gerekiyor.",ar:"ШЈШ­ШЄШ§Ш¬ Ш­Ш¬ШІ ШЄШ°ЩѓШ±ШЄЩЉ.",fa:"ШЁШ§ЫЊШЇ ШЁЩ„ЫЊШЄЩ… Ш±Щ€ Ш±ШІШ±Щ€ Ъ©Щ†Щ….",zh:"ж€‘йњЂи¦Ѓйў„и®ўж€‘зљ„зҐЁгЂ‚",es:"Necesito reservar mi boleto.",de:"Ich muss mein Ticket buchen."},options:["book","cook","look","take"]},
      ]},
    { id:4, emoji:"рџЏҐ", titles:{ru:"Р—РґРѕСЂРѕРІСЊРµ",en:"Health",uz:"Salomatlik",tr:"SaДџlД±k",ar:"Ш§Щ„ШµШ­Ш©",fa:"ШіЩ„Ш§Щ…ШЄ",zh:"еЃҐеє·",es:"Salud",de:"Gesundheit"},
      exercises:[
        {type:"choose",targetWord:"Doctor",translations:{ru:"Р’СЂР°С‡",en:"Physician",uz:"Shifokor",tr:"Doktor",ar:"Ш·ШЁЩЉШЁ",fa:"ШЇЪ©ШЄШ±",zh:"еЊ»з”џ",es:"MГ©dico",de:"Arzt"},distractors:{ru:["РњРµРґСЃРµСЃС‚СЂР°","РџР°С†РёРµРЅС‚","РђРїС‚РµРєР°СЂСЊ"],en:["Nurse","Patient","Pharmacist"],uz:["Hamshira","Bemor","Dorixonachi"],tr:["HemЕџire","Hasta","EczacД±"],ar:["Щ…Щ…Ш±Ш¶Ш©","Щ…Ш±ЩЉШ¶","ШµЩЉШЇЩ„Ш§Щ†ЩЉ"],fa:["ЩѕШ±ШіШЄШ§Ш±","ШЁЫЊЩ…Ш§Ш±","ШЇШ§Ш±Щ€ШіШ§ШІ"],zh:["жЉ¤еЈ«","з—…дєє","иЌЇе‰‚её€"],es:["Enfermera","Paciente","FarmacГ©utico"],de:["Krankenschwester","Patient","Apotheker"]}},
        {type:"translate",source:{ru:"РЈ РјРµРЅСЏ Р±РѕР»РёС‚ РіРѕР»РѕРІР°.",en:"I have a headache.",uz:"Boshim og'riyapti.",tr:"BaЕџД±m aДџrД±yor.",ar:"Ш№Щ†ШЇЩЉ ШµШЇШ§Ш№.",fa:"ШіШ±ШЇШ±ШЇ ШЇШ§Ш±Щ….",zh:"ж€‘е¤ґз—›гЂ‚",es:"Me duele la cabeza.",de:"Ich habe Kopfschmerzen."},answer:"i have a headache",accept:["i have a headache","my head hurts"]},
        {type:"arrange",sentence:{ru:"РњРЅРµ РЅСѓР¶РЅРѕ Рє РІСЂР°С‡Сѓ",en:"I need to see a doctor",uz:"Shifokorga borishim kerak",tr:"Doktora gitmem gerekiyor",ar:"ШЈШ­ШЄШ§Ш¬ Ш±Ш¤ЩЉШ© Ш·ШЁЩЉШЁ",fa:"ШЁШ§ЫЊШЇ ШЇЪ©ШЄШ± ШЁШ±Щ…",zh:"ж€‘йњЂи¦Ѓзњ‹еЊ»з”џ",es:"Necesito ver a un mГ©dico",de:"Ich muss einen Arzt aufsuchen"},answer:"I need to see a doctor",words:["I","need","to","see","a","doctor","dentist","nurse"]},
        {type:"fill",sentence:"Take this ___ twice a day.",blank:"medicine",hint:{ru:"РџСЂРёРЅРёРјР°Р№С‚Рµ СЌС‚Рѕ Р»РµРєР°СЂСЃС‚РІРѕ РґРІР°Р¶РґС‹ РІ РґРµРЅСЊ.",en:"Take this medicine twice a day.",uz:"Bu doriРЅРё kuniga ikki marta qabul qiling.",tr:"Bu ilacД± gГјnde iki kez alД±n.",ar:"Ш®Ш° Щ‡Ш°Ш§ Ш§Щ„ШЇЩ€Ш§ШЎ Щ…Ш±ШЄЩЉЩ† ЩЉЩ€Щ…ЩЉШ§Щ‹.",fa:"Ш§ЫЊЩ† ШЇШ§Ш±Щ€ Ш±Щ€ Ш±Щ€ШІЫЊ ШЇЩ€ ШЁШ§Ш± ШЁШ®Щ€Ш±.",zh:"жЇЏе¤©жњЌз”Ёдё¤ж¬Ўиї™з§ЌиЌЇгЂ‚",es:"Tome esta medicina dos veces al dГ­a.",de:"Nehmen Sie diese Medizin zweimal tГ¤glich."},options:["medicine","food","water","book"]},
      ]},
    { id:5, emoji:"рџ›ЌпёЏ", titles:{ru:"РџРѕРєСѓРїРєРё",en:"Shopping",uz:"Xarid",tr:"AlД±ЕџveriЕџ",ar:"Ш§Щ„ШЄШіЩ€Щ‚",fa:"Ш®Ш±ЫЊШЇ",zh:"иґ­з‰©",es:"Compras",de:"Einkaufen"},
      exercises:[
        {type:"choose",targetWord:"Expensive",translations:{ru:"Р”РѕСЂРѕРіРѕР№",en:"Costly",uz:"Qimmat",tr:"PahalД±",ar:"ШєШ§Щ„ЩЉ",fa:"ЪЇШ±Щ€Щ†",zh:"иґµ",es:"Caro",de:"Teuer"},distractors:{ru:["Р”РµС€С‘РІС‹Р№","РќРѕРІС‹Р№","РЎС‚Р°СЂС‹Р№"],en:["Cheap","New","Old"],uz:["Arzon","Yangi","Eski"],tr:["Ucuz","Yeni","Eski"],ar:["Ш±Ш®ЩЉШµ","Ш¬ШЇЩЉШЇ","Щ‚ШЇЩЉЩ…"],fa:["Ш§Ш±ШІШ§Щ†","Ш¬ШЇЫЊШЇ","Щ‚ШЇЫЊЩ…ЫЊ"],zh:["дѕїе®њ","ж–°","ж—§"],es:["Barato","Nuevo","Viejo"],de:["Billig","Neu","Alt"]}},
        {type:"translate",source:{ru:"РњРѕР¶РЅРѕ РґРµС€РµРІР»Рµ?",en:"Can you make it cheaper?",uz:"Arzonroq bo'ladimi?",tr:"Daha ucuz olabilir mi?",ar:"Щ‡Щ„ ЩЉЩ…ЩѓЩ† ШЈШ±Ш®ШµШџ",fa:"Ш§Ш±ШІЩ€Щ†вЂЊШЄШ± Щ†Щ…ЫЊШґЩ‡Шџ",zh:"иѓЅдѕїе®њз‚№еђ—пјџ",es:"ВїPuede ser mГЎs barato?",de:"KГ¶nnen Sie es billiger machen?"},answer:"can you make it cheaper",accept:["can you make it cheaper","can it be cheaper","is there a discount"]},
        {type:"fill",sentence:"Do you have this in my ___?",blank:"size",hint:{ru:"Р•СЃС‚СЊ СЌС‚Рѕ РІ РјРѕС‘Рј СЂР°Р·РјРµСЂРµ?",en:"Do you have this in my size?",uz:"Mening o'lchamimda bormi?",tr:"Benim bedenimde var mД±?",ar:"Щ‡Щ„ Ш№Щ†ШЇЩѓ Щ‡Ш°Ш§ ШЁЩ…Щ‚Ш§ШіЩЉШџ",fa:"Ш§ЫЊЩ† ШЁЩ‡ ШіШ§ЫЊШІ Щ…Щ† Щ‡ШіШЄШџ",zh:"дЅ д»¬жњ‰ж€‘зљ„е°єз Ѓеђ—пјџ",es:"ВїTienen esto en mi talla?",de:"Haben Sie das in meiner GrГ¶Гџe?"},options:["size","color","price","style"]},
        {type:"arrange",sentence:{ru:"РЇ С…РѕС‚РµР» Р±С‹ РІРµСЂРЅСѓС‚СЊ СЌС‚Рѕ",en:"I would like to return this",uz:"Buni qaytarmoqchiman",tr:"Bunu iade etmek istiyorum",ar:"ШЈШ±ЩЉШЇ ШҐШ±Ш¬Ш§Ш№ Щ‡Ш°Ш§",fa:"Щ…ЫЊвЂЊШ®Щ€Ш§Щ… Ш§ЫЊЩ† Ш±Щ€ ЩѕШі ШЁШЇЩ…",zh:"ж€‘жѓійЂЂе›ћиї™дёЄ",es:"Me gustarГ­a devolver esto",de:"Ich mГ¶chte das zurГјckgeben"},answer:"I would like to return this",words:["I","would","like","to","return","this","buy","keep"]},
      ]},
    { id:6, emoji:"рџЌЅпёЏ", titles:{ru:"Р’ СЂРµСЃС‚РѕСЂР°РЅРµ",en:"At the Restaurant",uz:"Restoranda",tr:"Restoranda",ar:"ЩЃЩЉ Ш§Щ„Щ…Ш·Ш№Щ…",fa:"ШЇШ± Ш±ШіШЄЩ€Ш±Ш§Щ†",zh:"ењЁй¤ђеЋ…",es:"En el restaurante",de:"Im Restaurant"},
      exercises:[
        {type:"choose",targetWord:"Menu",translations:{ru:"РњРµРЅСЋ",en:"Bill of fare",uz:"Menyu",tr:"MenГј",ar:"Щ‚Ш§Ш¦Щ…Ш© Ш§Щ„Ш·Ш№Ш§Щ…",fa:"Щ…Щ†Щ€",zh:"иЏњеЌ•",es:"MenГє",de:"Speisekarte"},distractors:{ru:["РЎС‡С‘С‚","РћС„РёС†РёР°РЅС‚","РЎС‚РѕР»"],en:["Bill","Waiter","Table"],uz:["Hisob","Ofitsiant","Stol"],tr:["Hesap","Garson","Masa"],ar:["ЩЃШ§ШЄЩ€Ш±Ш©","Щ†Ш§ШЇЩ„","Ш·Ш§Щ€Щ„Ш©"],fa:["ШµЩ€Ш±ШЄвЂЊШ­ШіШ§ШЁ","ЪЇШ§Ш±ШіЩ€Щ†","Щ…ЫЊШІ"],zh:["иґ¦еЌ•","жњЌеЉЎе‘","жЎЊе­ђ"],es:["Cuenta","Mesero","Mesa"],de:["Rechnung","Kellner","Tisch"]}},
        {type:"translate",source:{ru:"РџСЂРёРЅРµСЃРёС‚Рµ СЃС‡С‘С‚, РїРѕР¶Р°Р»СѓР№СЃС‚Р°.",en:"Can I have the bill please?",uz:"Hisobni olib keling, iltimos.",tr:"HesabД± getirir misiniz?",ar:"Ш§Щ„Ш­ШіШ§ШЁ Щ…Щ† ЩЃШ¶Щ„Щѓ.",fa:"ШµЩ€Ш±ШЄвЂЊШ­ШіШ§ШЁ Щ„Ш·ЩЃШ§Щ‹.",zh:"иЇ·з»™ж€‘иґ¦еЌ•гЂ‚",es:"La cuenta por favor.",de:"Die Rechnung bitte."},answer:"can i have the bill please",accept:["can i have the bill please","the bill please","check please"]},
        {type:"fill",sentence:"A table for ___, please.",blank:"two",hint:{ru:"РЎС‚РѕР»РёРє РЅР° РґРІРѕРёС…, РїРѕР¶Р°Р»СѓР№СЃС‚Р°.",en:"A table for two, please.",uz:"Ikki kishilik stol, iltimos.",tr:"Д°ki kiЕџilik masa, lГјtfen.",ar:"Ш·Ш§Щ€Щ„Ш© Щ„ШґШ®ШµЩЉЩ† Щ…Щ† ЩЃШ¶Щ„Щѓ.",fa:"ЫЊЩ‡ Щ…ЫЊШІ ШЁШ±Ш§ЫЊ ШЇЩ€ Щ†ЩЃШ± Щ„Ш·ЩЃШ§Щ‹.",zh:"иЇ·з»™дё¤дёЄдєєзљ„жЎЊе­ђгЂ‚",es:"Una mesa para dos, por favor.",de:"Einen Tisch fГјr zwei, bitte."},options:["two","five","ten","many"]},
      ]},
  ],

  "en-advanced-extra": [
    { id:2, emoji:"рџ“Љ", titles:{ru:"РџРµСЂРµРіРѕРІРѕСЂС‹",en:"Negotiations",uz:"Muzokaralar",tr:"MГјzakereler",ar:"Щ…ЩЃШ§Щ€Ш¶Ш§ШЄ",fa:"Щ…Ш°Ш§Ъ©Ш±Ш§ШЄ",zh:"и°€е€¤",es:"Negociaciones",de:"Verhandlungen"},
      exercises:[
        {type:"choose",targetWord:"Stakeholder",translations:{ru:"Р—Р°РёРЅС‚РµСЂРµСЃРѕРІР°РЅРЅР°СЏ СЃС‚РѕСЂРѕРЅР°",en:"Interested party",uz:"Manfaatdor tomon",tr:"PaydaЕџ",ar:"ШµШ§Ш­ШЁ Щ…ШµЩ„Ш­Ш©",fa:"Ш°ЫЊЩ†ЩЃШ№",zh:"е€©з›Љз›ёе…іиЂ…",es:"Parte interesada",de:"Interessenvertreter"},distractors:{ru:["РРЅРІРµСЃС‚РѕСЂ","РљР»РёРµРЅС‚","РџР°СЂС‚РЅС‘СЂ"],en:["Investor","Client","Partner"],uz:["Investor","Mijoz","Sherik"],tr:["YatД±rД±mcД±","MГјЕџteri","Ortak"],ar:["Щ…ШіШЄШ«Щ…Ш±","Ш№Щ…ЩЉЩ„","ШґШ±ЩЉЩѓ"],fa:["ШіШ±Щ…Ш§ЫЊЩ‡вЂЊЪЇШ°Ш§Ш±","Щ…ШґШЄШ±ЫЊ","ШґШ±ЫЊЪ©"],zh:["жЉ•иµ„иЂ…","е®ўж€·","еђ€дј™дєє"],es:["Inversor","Cliente","Socio"],de:["Investor","Kunde","Partner"]}},
        {type:"translate",source:{ru:"РќР°Рј РЅСѓР¶РЅРѕ СЃРѕРіР»Р°СЃРѕРІР°С‚СЊ СѓСЃР»РѕРІРёСЏ.",en:"We need to align on the terms.",uz:"Shartlarni muvofiqlashtirish kerak.",tr:"Ећartlar Гјzerinde anlaЕџmamД±z gerekiyor.",ar:"Щ†Ш­ШЄШ§Ш¬ ШҐЩ„Щ‰ Ш§Щ„Ш§ШЄЩЃШ§Щ‚ Ш№Щ„Щ‰ Ш§Щ„ШґШ±Щ€Ш·.",fa:"ШЁШ§ЫЊШЇ Ш±Щ€ЫЊ ШґШ±Ш§ЫЊШ· ШЄЩ€Ш§ЩЃЩ‚ Ъ©Щ†ЫЊЩ….",zh:"ж€‘д»¬йњЂи¦Ѓе°±жќЎж¬ѕиѕѕж€ђдёЂи‡ґгЂ‚",es:"Necesitamos ponernos de acuerdo en los tГ©rminos.",de:"Wir mГјssen uns Гјber die Bedingungen einigen."},answer:"we need to align on the terms",accept:["we need to align on the terms","we need to agree on the terms"]},
        {type:"arrange",sentence:{ru:"Р­С‚Рѕ РІР·Р°РёРјРѕРІС‹РіРѕРґРЅРѕРµ РїР°СЂС‚РЅС‘СЂСЃС‚РІРѕ",en:"This is a mutually beneficial partnership",uz:"Bu o'zaro foydali hamkorlik",tr:"Bu karЕџД±lД±klД± yarar saДџlayan bir ortaklД±k",ar:"Щ‡Ш°Щ‡ ШґШ±Ш§ЩѓШ© Щ…ЩЃЩЉШЇШ© Щ„Щ„Ш·Ш±ЩЃЩЉЩ†",fa:"Ш§ЫЊЩ† ЫЊЪ© ШґШ±Ш§Ъ©ШЄ ШіЩ€ШЇЩ…Щ†ШЇ Щ…ШЄЩ‚Ш§ШЁЩ„ Ш§ШіШЄ",zh:"иї™жЇдє’е€©еђ€дЅњ",es:"Esta es una asociaciГіn mutuamente beneficiosa",de:"Dies ist eine gegenseitig vorteilhafte Partnerschaft"},answer:"This is a mutually beneficial partnership",words:["This","is","a","mutually","beneficial","partnership","risky","failed"]},
        {type:"fill",sentence:"Let's ___ on this issue.",blank:"circle back",hint:{ru:"Р”Р°РІР°Р№С‚Рµ РІРµСЂРЅС‘РјСЃСЏ Рє СЌС‚РѕРјСѓ РІРѕРїСЂРѕСЃСѓ.",en:"Let's circle back on this issue.",uz:"Bu masalaga qaytaylik.",tr:"Bu konuya geri dГ¶nelim.",ar:"Щ„Щ†Ш№Щ€ШЇ ШҐЩ„Щ‰ Щ‡Ш°Щ‡ Ш§Щ„Щ…ШіШЈЩ„Ш©.",fa:"ШЁЫЊШ§ЫЊШЇ ШЁЩ‡ Ш§ЫЊЩ† Щ…Щ€Ш¶Щ€Ш№ ШЁШ±ЪЇШ±ШЇЫЊЩ….",zh:"и®©ж€‘д»¬й‡Ќж–°е›ће€°иї™дёЄй—®йўгЂ‚",es:"Volvamos a este tema.",de:"Lassen Sie uns auf dieses Thema zurГјckkommen."},options:["circle back","give up","move on","skip"]},
      ]},
    { id:3, emoji:"рџ’Ў", titles:{ru:"РџСЂРµР·РµРЅС‚Р°С†РёРё",en:"Presentations",uz:"Taqdimotlar",tr:"Sunumlar",ar:"Ш№Ш±Щ€Ш¶ ШЄЩ‚ШЇЩЉЩ…ЩЉШ©",fa:"Ш§Ш±Ш§Ш¦Щ‡вЂЊЩ‡Ш§",zh:"жј”з¤єж–‡зЁї",es:"Presentaciones",de:"PrГ¤sentationen"},
      exercises:[
        {type:"choose",targetWord:"Compelling",translations:{ru:"РЈР±РµРґРёС‚РµР»СЊРЅС‹Р№",en:"Convincing",uz:"Ishontirarli",tr:"Д°kna edici",ar:"Щ…Щ‚Щ†Ш№",fa:"Щ…ШЄЩ‚Ш§Ш№ШЇЪ©Щ†Щ†ШЇЩ‡",zh:"жњ‰иЇґжњЌеЉ›",es:"Convincente",de:"Гњberzeugend"},distractors:{ru:["РЎРєСѓС‡РЅС‹Р№","РЎР»Р°Р±С‹Р№","РљРѕСЂРѕС‚РєРёР№"],en:["Boring","Weak","Short"],uz:["Zerikarli","Zaif","Qisqa"],tr:["SД±kД±cД±","ZayД±f","KД±sa"],ar:["Щ…Щ…Щ„","Ш¶Ш№ЩЉЩЃ","Щ‚ШµЩЉШ±"],fa:["Ъ©ШіЩ„вЂЊЪ©Щ†Щ†ШЇЩ‡","Ш¶Ш№ЫЊЩЃ","Ъ©Щ€ШЄШ§Щ‡"],zh:["ж— иЃЉ","еј±","зџ­"],es:["Aburrido","DГ©bil","Corto"],de:["Langweilig","Schwach","Kurz"]}},
        {type:"translate",source:{ru:"РџРѕР·РІРѕР»СЊС‚Рµ РјРЅРµ РїРµСЂРµР№С‚Рё Рє СЃР»РµРґСѓСЋС‰РµРјСѓ СЃР»Р°Р№РґСѓ.",en:"Let me take you to the next slide.",uz:"Keling, keyingi slaydga o'tamiz.",tr:"Bir sonraki slayta geГ§elim.",ar:"ШЇШ№Щ†ЩЉ ШЈЩ†ШЄЩ‚Щ„ ШҐЩ„Щ‰ Ш§Щ„ШґШ±ЩЉШ­Ш© Ш§Щ„ШЄШ§Щ„ЩЉШ©.",fa:"ШЁШ°Ш§Ш±ЫЊШЇ ШЁЩ‡ Ш§ШіЩ„Ш§ЫЊШЇ ШЁШ№ШЇЫЊ ШЁШ±ЫЊЩ….",zh:"и®©ж€‘её¦дЅ е€°дё‹дёЂеј е№»зЃЇз‰‡гЂ‚",es:"PermГ­tame pasar a la siguiente diapositiva.",de:"Lassen Sie mich zur nГ¤chsten Folie gehen."},answer:"let me take you to the next slide",accept:["let me take you to the next slide","let's move to the next slide"]},
        {type:"fill",sentence:"To ___ my point, here is the data.",blank:"illustrate",hint:{ru:"Р§С‚РѕР±С‹ РїСЂРѕРёР»Р»СЋСЃС‚СЂРёСЂРѕРІР°С‚СЊ РјРѕСЋ С‚РѕС‡РєСѓ Р·СЂРµРЅРёСЏ, РІРѕС‚ РґР°РЅРЅС‹Рµ.",en:"To illustrate my point, here is the data.",uz:"Fikrimni tasvirlash uchun, mana ma'lumotlar.",tr:"NoktamД± gГ¶stermek iГ§in iЕџte veriler.",ar:"Щ„ШЄЩ€Ш¶ЩЉШ­ Щ€Ш¬Щ‡Ш© Щ†ШёШ±ЩЉШЊ ШҐЩ„ЩЉЩѓ Ш§Щ„ШЁЩЉШ§Щ†Ш§ШЄ.",fa:"ШЁШ±Ш§ЫЊ Щ†ШґШ§Щ† ШЇШ§ШЇЩ† Щ†ШёШ±Щ…ШЊ Ш§ЫЊЩ†Ш¬Ш§ ШЇШ§ШЇЩ‡вЂЊЩ‡Ш§ Щ‡ШіШЄЩ†ШЇ.",zh:"дёєдє†иЇґжЋж€‘зљ„и§‚з‚№пјЊиї™й‡ЊжЇж•°жЌ®гЂ‚",es:"Para ilustrar mi punto, aquГ­ estГЎn los datos.",de:"Um meinen Punkt zu veranschaulichen, hier sind die Daten."},options:["illustrate","ignore","avoid","hide"]},
      ]},
    { id:4, emoji:"рџ¤ќ", titles:{ru:"Р”РµР»РѕРІРѕРµ РѕР±С‰РµРЅРёРµ",en:"Business Communication",uz:"Biznes muloqot",tr:"Д°Еџ iletiЕџimi",ar:"Ш§Щ„ШЄЩ€Ш§ШµЩ„ Ш§Щ„ШЄШ¬Ш§Ш±ЩЉ",fa:"Ш§Ш±ШЄШЁШ§Ш·Ш§ШЄ ШЄШ¬Ш§Ш±ЫЊ",zh:"е•†еЉЎжІџйЂљ",es:"ComunicaciГіn empresarial",de:"GeschГ¤ftskommunikation"},
      exercises:[
        {type:"choose",targetWord:"Proactive",translations:{ru:"РџСЂРѕР°РєС‚РёРІРЅС‹Р№",en:"Initiative-taking",uz:"Tashabbuskor",tr:"Proaktif",ar:"Ш§ШіШЄШЁШ§Щ‚ЩЉ",fa:"ЩѕЫЊШґвЂЊШЇШіШЄШ§Щ†Щ‡",zh:"дё»еЉЁзљ„",es:"Proactivo",de:"Proaktiv"},distractors:{ru:["РџР°СЃСЃРёРІРЅС‹Р№","Р›РµРЅРёРІС‹Р№","РњРµРґР»РµРЅРЅС‹Р№"],en:["Passive","Lazy","Slow"],uz:["Passiv","Dangasa","Sekin"],tr:["Pasif","Tembel","YavaЕџ"],ar:["ШіЩ„ШЁЩЉ","ЩѓШіЩ€Щ„","ШЁШ·ЩЉШЎ"],fa:["Щ…Щ†ЩЃШ№Щ„","ШЄЩ†ШЁЩ„","Ъ©Щ†ШЇ"],zh:["иў«еЉЁ","ж‡’","ж…ў"],es:["Pasivo","Perezoso","Lento"],de:["Passiv","Faul","Langsam"]}},
        {type:"translate",source:{ru:"РЇ С…РѕС‚РµР» Р±С‹ Р·Р°РїР»Р°РЅРёСЂРѕРІР°С‚СЊ Р·РІРѕРЅРѕРє.",en:"I'd like to schedule a call.",uz:"Qo'ng'iroq rejalashtirmoqchiman.",tr:"Bir gГ¶rГјЕџme planlamak istiyorum.",ar:"ШЈЩ€ШЇ Ш¬ШЇЩ€Щ„Ш© Щ…ЩѓШ§Щ„Щ…Ш©.",fa:"Щ…ЫЊвЂЊШ®Щ€Ш§Щ… ЫЊЩ‡ ШЄЩ…Ш§Ші ШЁШ±Щ†Ш§Щ…Щ‡вЂЊШ±ЫЊШІЫЊ Ъ©Щ†Щ….",zh:"ж€‘жѓіе®‰жЋ’дёЂдёЄз”µиЇќдјљи®®гЂ‚",es:"Me gustarГ­a programar una llamada.",de:"Ich mГ¶chte einen Anruf planen."},answer:"i'd like to schedule a call",accept:["i'd like to schedule a call","i would like to schedule a call"]},
        {type:"arrange",sentence:{ru:"РџСЂРѕС€Сѓ РїСЂРѕС‰РµРЅРёСЏ Р·Р° Р·Р°РґРµСЂР¶РєСѓ РѕС‚РІРµС‚Р°",en:"I apologize for the delayed response",uz:"Kechikkan javob uchun uzr so'rayman",tr:"GeГ§ cevap iГ§in Г¶zГјr dilerim",ar:"ШЈШ№ШЄШ°Ш± Ш№Щ† Ш§Щ„ШЄШЈШ®Ш± ЩЃЩЉ Ш§Щ„Ш±ШЇ",fa:"ШЁШ±Ш§ЫЊ ШЄШЈШ®ЫЊШ± ШЇШ± ЩѕШ§ШіШ® Ш№Ш°Ш±Ш®Щ€Ш§Щ‡ЫЊ Щ…ЫЊвЂЊЪ©Щ†Щ…",zh:"дёєе›ће¤Ќиїџзј“йЃ“ж­‰",es:"Me disculpo por la demora en responder",de:"Ich entschuldige mich fГјr die verzГ¶gerte Antwort"},answer:"I apologize for the delayed response",words:["I","apologize","for","the","delayed","response","quick","early"]},
      ]},
  ],

  // в•ђв•ђ TURKISH вЂ” more lessons в•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђ
  "tr-intermediate-extra": [
    { id:2, emoji:"вњ€пёЏ", titles:{ru:"РџСѓС‚РµС€РµСЃС‚РІРёСЏ",en:"Travel",uz:"Sayohat",tr:"Seyahat",ar:"Ш§Щ„ШіЩЃШ±",fa:"ШіЩЃШ±",zh:"ж—…иЎЊ",es:"Viaje",de:"Reise"},
      exercises:[
        {type:"choose",targetWord:"UГ§ak",translations:{ru:"РЎР°РјРѕР»С‘С‚",en:"Airplane",uz:"Samolyot",tr:"Tayyare",ar:"Ш·Ш§Ш¦Ш±Ш©",fa:"Щ‡Щ€Ш§ЩѕЫЊЩ…Ш§",zh:"йЈћжњє",es:"AviГіn",de:"Flugzeug"},distractors:{ru:["РџРѕРµР·Рґ","РђРІС‚РѕР±СѓСЃ","РљРѕСЂР°Р±Р»СЊ"],en:["Train","Bus","Ship"],uz:["Poyezd","Avtobus","Kema"],tr:["Tren","OtobГјs","Gemi"],ar:["Щ‚Ш·Ш§Ш±","Ш­Ш§ЩЃЩ„Ш©","ШіЩЃЩЉЩ†Ш©"],fa:["Щ‚Ш·Ш§Ш±","Ш§ШЄЩ€ШЁЩ€Ші","Ъ©ШґШЄЫЊ"],zh:["зЃ«иЅ¦","е…¬дє¤","и€№"],es:["Tren","AutobГєs","Barco"],de:["Zug","Bus","Schiff"]}},
        {type:"translate",source:{ru:"Р“РґРµ РєР°СЃСЃР°?",en:"Where is the ticket counter?",uz:"Kassa qayerda?",tr:"Where is the ticket counter?",ar:"ШЈЩЉЩ† ШґШЁШ§Щѓ Ш§Щ„ШЄШ°Ш§ЩѓШ±Шџ",fa:"ШЁШ§Ш¬Щ‡ Ъ©Ш¬Ш§ШіШЄШџ",zh:"е”®зҐЁе¤„ењЁе“Єй‡Њпјџ",es:"ВїDГіnde estГЎ la taquilla?",de:"Wo ist der Ticketschalter?"},answer:"bilet giЕџesi nerede",accept:["bilet giЕџesi nerede","kasa nerede"]},
        {type:"fill",sentence:"Pasaportumu ___ ettim.",blank:"kaybettim",hint:{ru:"РЇ РїРѕС‚РµСЂСЏР» РїР°СЃРїРѕСЂС‚.",en:"I lost my passport.",uz:"Pasportimni yo'qotdim.",tr:"Pasaportumu kaybettim.",ar:"ЩЃЩ‚ШЇШЄ Ш¬Щ€Ш§ШІ ШіЩЃШ±ЩЉ.",fa:"ЩѕШ§ШіЩѕЩ€Ш±ШЄЩ… Ш±Щ€ ЪЇЩ… Ъ©Ш±ШЇЩ….",zh:"ж€‘жЉЉжЉ¤з…§дёўдє†гЂ‚",es:"PerdГ­ mi pasaporte.",de:"Ich habe meinen Reisepass verloren."},options:["kaybettim","buldum","aldД±m","verdim"]},
      ]},
    { id:3, emoji:"рџЏҐ", titles:{ru:"Р—РґРѕСЂРѕРІСЊРµ",en:"Health",uz:"Salomatlik",tr:"SaДџlД±k",ar:"Ш§Щ„ШµШ­Ш©",fa:"ШіЩ„Ш§Щ…ШЄ",zh:"еЃҐеє·",es:"Salud",de:"Gesundheit"},
      exercises:[
        {type:"choose",targetWord:"Hasta",translations:{ru:"Р‘РѕР»СЊРЅРѕР№/РџР°С†РёРµРЅС‚",en:"Patient/Sick",uz:"Bemor",tr:"Doktor",ar:"Щ…Ш±ЩЉШ¶",fa:"ШЁЫЊЩ…Ш§Ш±",zh:"з—…дєє",es:"Enfermo",de:"Krank/Patient"},distractors:{ru:["Р—РґРѕСЂРѕРІС‹Р№","Р’СЂР°С‡","РњРµРґСЃРµСЃС‚СЂР°"],en:["Healthy","Doctor","Nurse"],uz:["Sog'lom","Shifokor","Hamshira"],tr:["SaДџlД±klД±","Doktor","HemЕџire"],ar:["ШµШ­ЩЉШ­","Ш·ШЁЩЉШЁ","Щ…Щ…Ш±Ш¶Ш©"],fa:["ШіШ§Щ„Щ…","ШЇЪ©ШЄШ±","ЩѕШ±ШіШЄШ§Ш±"],zh:["еЃҐеє·","еЊ»з”џ","жЉ¤еЈ«"],es:["Sano","MГ©dico","Enfermera"],de:["Gesund","Arzt","Krankenschwester"]}},
        {type:"translate",source:{ru:"РЈ РјРµРЅСЏ Р±РѕР»РёС‚ Р¶РёРІРѕС‚.",en:"My stomach hurts.",uz:"Qornim og'riyapti.",tr:"My stomach hurts.",ar:"ШЁШ·Щ†ЩЉ ЩЉШ¤Щ„Щ…Щ†ЩЉ.",fa:"ШґЪ©Щ…Щ… ШЇШ±ШЇ Щ…ЫЊвЂЊЪ©Щ†Щ‡.",zh:"ж€‘и‚ље­ђз—›гЂ‚",es:"Me duele el estГіmago.",de:"Mein Bauch tut weh."},answer:"karnД±m aДџrД±yor",accept:["karnД±m aДџrД±yor","midem aДџrД±yor"]},
        {type:"fill",sentence:"Doktora ___ lazД±m.",blank:"gitmem",hint:{ru:"РњРЅРµ РЅСѓР¶РЅРѕ РїРѕР№С‚Рё Рє РІСЂР°С‡Сѓ.",en:"I need to go to the doctor.",uz:"Shifokorga borishim kerak.",tr:"Doktora gitmem lazД±m.",ar:"ЩЉШ¬ШЁ ШЈЩ† ШЈШ°Щ‡ШЁ Щ„Щ„Ш·ШЁЩЉШЁ.",fa:"ШЁШ§ЫЊШЇ ШЇЪ©ШЄШ± ШЁШ±Щ….",zh:"ж€‘йњЂи¦ЃеЋ»зњ‹еЊ»з”џгЂ‚",es:"Necesito ir al mГ©dico.",de:"Ich muss zum Arzt."},options:["gitmem","kalmam","yemem","iГ§mem"]},
      ]},
  ],

  "tr-advanced": [
    { id:1, emoji:"рџ“°", titles:{ru:"РЎРњР Рё РїРѕР»РёС‚РёРєР°",en:"Media & Politics",uz:"OAV va siyosat",tr:"Medya ve Siyaset",ar:"Ш§Щ„ШҐШ№Щ„Ш§Щ… Щ€Ш§Щ„ШіЩЉШ§ШіШ©",fa:"Ш±ШіШ§Щ†Щ‡ Щ€ ШіЫЊШ§ШіШЄ",zh:"еЄ’дЅ“дёЋж”їжІ»",es:"Medios y polГ­tica",de:"Medien und Politik"},
      exercises:[
        {type:"choose",targetWord:"HГјkГјmet",translations:{ru:"РџСЂР°РІРёС‚РµР»СЊСЃС‚РІРѕ",en:"Government",uz:"Hukumat",tr:"Д°dare",ar:"Ш­ЩѓЩ€Щ…Ш©",fa:"ШЇЩ€Щ„ШЄ",zh:"ж”їеєњ",es:"Gobierno",de:"Regierung"},distractors:{ru:["РћРїРїРѕР·РёС†РёСЏ","РџР°СЂР»Р°РјРµРЅС‚","РЎСѓРґ"],en:["Opposition","Parliament","Court"],uz:["Muxolafat","Parlament","Sud"],tr:["Muhalefet","Parlamento","Mahkeme"],ar:["Щ…Ш№Ш§Ш±Ш¶Ш©","ШЁШ±Щ„Щ…Ш§Щ†","Щ…Ш­ЩѓЩ…Ш©"],fa:["Щ…Ш®Ш§Щ„ЩЃШ§Щ†","ЩѕШ§Ш±Щ„Щ…Ш§Щ†","ШЇШ§ШЇЪЇШ§Щ‡"],zh:["еЏЌеЇ№жґѕ","и®®дјљ","жі•й™ў"],es:["OposiciГіn","Parlamento","Tribunal"],de:["Opposition","Parlament","Gericht"]}},
        {type:"translate",source:{ru:"Р’С‹Р±РѕСЂС‹ СЃРѕСЃС‚РѕСЏС‚СЃСЏ РІ СЃР»РµРґСѓСЋС‰РµРј РјРµСЃСЏС†Рµ.",en:"Elections will take place next month.",uz:"Saylov kelasi oy bo'ladi.",tr:"Elections will take place next month.",ar:"Ш§Щ„Ш§Щ†ШЄШ®Ш§ШЁШ§ШЄ ШіШЄШ¬Ш±ЩЉ Ш§Щ„ШґЩ‡Ш± Ш§Щ„Щ‚Ш§ШЇЩ….",fa:"Ш§Щ†ШЄШ®Ш§ШЁШ§ШЄ Щ…Ш§Щ‡ ШўЫЊЩ†ШЇЩ‡ ШЁШ±ЪЇШІШ§Ш± Щ…ЫЊвЂЊШґЩ‡.",zh:"йЂ‰дёѕе°†ењЁдё‹дёЄжњ€дёѕиЎЊгЂ‚",es:"Las elecciones se realizarГЎn el prГіximo mes.",de:"Die Wahlen finden nГ¤chsten Monat statt."},answer:"seГ§imler gelecek ay yapД±lacak",accept:["seГ§imler gelecek ay yapД±lacak","seГ§im gelecek ay"]},
        {type:"arrange",sentence:{ru:"Р­РєРѕРЅРѕРјРёРєР° СЂР°СЃС‚С‘С‚ РєР°Р¶РґС‹Р№ РіРѕРґ",en:"The economy grows every year",uz:"Iqtisodiyot har yili o'sadi",tr:"The economy grows every year",ar:"Ш§Щ„Ш§Щ‚ШЄШµШ§ШЇ ЩЉЩ†Щ…Щ€ ЩѓЩ„ Ш№Ш§Щ…",fa:"Ш§Щ‚ШЄШµШ§ШЇ Щ‡Ш± ШіШ§Щ„ Ш±ШґШЇ Щ…ЫЊвЂЊЪ©Щ†Щ‡",zh:"з»ЏжµЋжЇЏе№ґйѓЅењЁеўћй•ї",es:"La economГ­a crece cada aГ±o",de:"Die Wirtschaft wГ¤chst jedes Jahr"},answer:"Ekonomi her yД±l bГјyГјyor",words:["Ekonomi","her","yД±l","bГјyГјyor","kГјГ§ГјlГјyor","durdu"]},
        {type:"fill",sentence:"MГјzakereler ___ sГјrdГј.",blank:"uzun",hint:{ru:"РџРµСЂРµРіРѕРІРѕСЂС‹ С€Р»Рё РґРѕР»РіРѕ.",en:"The negotiations went on for a long time.",uz:"Muzokaralar uzoq davom etdi.",tr:"MГјzakereler uzun sГјrdГј.",ar:"Ш§ШіШЄЩ…Ш±ШЄ Ш§Щ„Щ…ЩЃШ§Щ€Ш¶Ш§ШЄ Ш·Щ€ЩЉЩ„Ш§Щ‹.",fa:"Щ…Ш°Ш§Ъ©Ш±Ш§ШЄ Щ…ШЇШЄ Ш·Щ€Щ„Ш§Щ†ЫЊ Ш§ШЇШ§Щ…Щ‡ ЫЊШ§ЩЃШЄ.",zh:"и°€е€¤жЊЃз»­дє†еѕ€й•їж—¶й—ґгЂ‚",es:"Las negociaciones duraron mucho tiempo.",de:"Die Verhandlungen dauerten lange."},options:["uzun","kД±sa","hД±zlД±","ani"]},
      ]},
    { id:2, emoji:"рџ’ј", titles:{ru:"Р”РµР»РѕРІРѕР№ С‚СѓСЂРµС†РєРёР№",en:"Business Turkish",uz:"Biznes turk tili",tr:"Д°Еџ TГјrkГ§esi",ar:"Ш§Щ„ШЄШ±ЩѓЩЉШ© Щ„Щ„ШЈШ№Щ…Ш§Щ„",fa:"ШЄШ±Ъ©ЫЊ ШЄШ¬Ш§Ш±ЫЊ",zh:"е•†еЉЎењџиЂіе…¶иЇ­",es:"Turco de negocios",de:"GeschГ¤ftstГјrkisch"},
      exercises:[
        {type:"choose",targetWord:"SГ¶zleЕџme",translations:{ru:"РљРѕРЅС‚СЂР°РєС‚/Р”РѕРіРѕРІРѕСЂ",en:"Contract",uz:"Shartnoma",tr:"AnlaЕџma",ar:"Ш№Щ‚ШЇ",fa:"Щ‚Ш±Ш§Ш±ШЇШ§ШЇ",zh:"еђ€еђЊ",es:"Contrato",de:"Vertrag"},distractors:{ru:["РЎС‡С‘С‚","РћС‚С‡С‘С‚","РџРёСЃСЊРјРѕ"],en:["Invoice","Report","Letter"],uz:["Hisob","Hisobot","Xat"],tr:["Fatura","Rapor","Mektup"],ar:["ЩЃШ§ШЄЩ€Ш±Ш©","ШЄЩ‚Ш±ЩЉШ±","Ш±ШіШ§Щ„Ш©"],fa:["ЩЃШ§Ъ©ШЄЩ€Ш±","ЪЇШІШ§Ш±Шґ","Щ†Ш§Щ…Щ‡"],zh:["еЏ‘зҐЁ","жЉҐе‘Љ","дїЎд»¶"],es:["Factura","Informe","Carta"],de:["Rechnung","Bericht","Brief"]}},
        {type:"translate",source:{ru:"РќР°Рј РЅСѓР¶РЅРѕ РїРѕРґРїРёСЃР°С‚СЊ РєРѕРЅС‚СЂР°РєС‚.",en:"We need to sign the contract.",uz:"Shartnomani imzolashimiz kerak.",tr:"We need to sign the contract.",ar:"Щ†Ш­ШЄШ§Ш¬ ШҐЩ„Щ‰ ШЄЩ€Щ‚ЩЉШ№ Ш§Щ„Ш№Щ‚ШЇ.",fa:"ШЁШ§ЫЊШЇ Щ‚Ш±Ш§Ш±ШЇШ§ШЇ Ш±Щ€ Ш§Щ…Ш¶Ш§ Ъ©Щ†ЫЊЩ….",zh:"ж€‘д»¬йњЂи¦Ѓз­ѕзЅІеђ€еђЊгЂ‚",es:"Necesitamos firmar el contrato.",de:"Wir mГјssen den Vertrag unterzeichnen."},answer:"sГ¶zleЕџmeyi imzalamamД±z gerekiyor",accept:["sГ¶zleЕџmeyi imzalamamД±z gerekiyor","kontratД± imzalamamД±z lazД±m"]},
        {type:"fill",sentence:"Bu teklif ___ geГ§erlidir.",blank:"bir hafta",hint:{ru:"Р­С‚Рѕ РїСЂРµРґР»РѕР¶РµРЅРёРµ РґРµР№СЃС‚РІРёС‚РµР»СЊРЅРѕ РѕРґРЅСѓ РЅРµРґРµР»СЋ.",en:"This offer is valid for one week.",uz:"Bu taklif bir hafta amal qiladi.",tr:"Bu teklif bir hafta geГ§erlidir.",ar:"Щ‡Ш°Ш§ Ш§Щ„Ш№Ш±Ш¶ ШµШ§Щ„Ш­ Щ„Щ…ШЇШ© ШЈШіШЁЩ€Ш№.",fa:"Ш§ЫЊЩ† ЩѕЫЊШґЩ†Щ‡Ш§ШЇ ЫЊЪ© Щ‡ЩЃШЄЩ‡ Ш§Ш№ШЄШЁШ§Ш± ШЇШ§Ш±ШЇ.",zh:"иї™дёЄжЉҐд»·жњ‰ж•€жњџдёєдёЂе‘ЁгЂ‚",es:"Esta oferta es vГЎlida por una semana.",de:"Dieses Angebot gilt fГјr eine Woche."},options:["bir hafta","bir yД±l","bir gГјn","bir saat"]},
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


// в”Ђв”Ђв”Ђ MEGA CONTENT PACK в”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђ
const MEGA_LESSONS = {

  // в•ђв•ђ ENGLISH beginner extra pack 2 в•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђ
  "en-beginner-extra2": [
    { id:9, emoji:"рџЏ«", titles:{ru:"РЁРєРѕР»Р°",en:"School",uz:"Maktab",tr:"Okul",ar:"Ш§Щ„Щ…ШЇШ±ШіШ©",fa:"Щ…ШЇШ±ШіЩ‡",zh:"е­¦ж Ў",es:"Escuela",de:"Schule"},
      exercises:[
        {type:"choose",targetWord:"Teacher",translations:{ru:"РЈС‡РёС‚РµР»СЊ",en:"Educator",uz:"O'qituvchi",tr:"Г–Дџretmen",ar:"Щ…Ш№Щ„Щ…",fa:"Щ…Ш№Щ„Щ…",zh:"иЂЃеё€",es:"Profesor",de:"Lehrer"},distractors:{ru:["РЈС‡РµРЅРёРє","Р”РёСЂРµРєС‚РѕСЂ","Р РѕРґРёС‚РµР»СЊ"],en:["Student","Principal","Parent"],uz:["O'quvchi","Direktor","Ota-ona"],tr:["Г–Дџrenci","MГјdГјr","Ebeveyn"],ar:["Ш·Ш§Щ„ШЁ","Щ…ШЇЩЉШ±","Щ€Ш§Щ„ШЇ"],fa:["ШЇШ§Щ†ШґвЂЊШўЩ…Щ€ШІ","Щ…ШЇЫЊШ±","Щ€Ш§Щ„ШЇЫЊЩ†"],zh:["е­¦з”џ","ж Ўй•ї","е®¶й•ї"],es:["Estudiante","Director","Padre"],de:["SchГјler","Direktor","Eltern"]}},
        {type:"arrange",sentence:{ru:"РЇ РёРґСѓ РІ С€РєРѕР»Сѓ РєР°Р¶РґС‹Р№ РґРµРЅСЊ",en:"I go to school every day",uz:"Men har kuni maktabga boraman",tr:"Her gГјn okula gidiyorum",ar:"ШЈШ°Щ‡ШЁ ШҐЩ„Щ‰ Ш§Щ„Щ…ШЇШ±ШіШ© ЩѓЩ„ ЩЉЩ€Щ…",fa:"Щ‡Ш± Ш±Щ€ШІ Щ…ШЇШ±ШіЩ‡ Щ…ЫЊвЂЊШ±Щ…",zh:"ж€‘жЇЏе¤©еЋ»е­¦ж Ў",es:"Voy a la escuela todos los dГ­as",de:"Ich gehe jeden Tag zur Schule"},answer:"I go to school every day",words:["I","go","to","school","every","day","week","month"]},
        {type:"fill",sentence:"I study ___ at school.",blank:"English",hint:{ru:"РЇ СѓС‡Сѓ Р°РЅРіР»РёР№СЃРєРёР№ РІ С€РєРѕР»Рµ.",en:"I study English at school.",uz:"Men maktabda ingliz tilini o'rganaman.",tr:"Okulda Д°ngilizce Г§alД±ЕџД±yorum.",ar:"ШЈШЇШ±Ші Ш§Щ„Щ„ШєШ© Ш§Щ„ШҐЩ†Ш¬Щ„ЩЉШІЩЉШ© ЩЃЩЉ Ш§Щ„Щ…ШЇШ±ШіШ©.",fa:"ШЇШ± Щ…ШЇШ±ШіЩ‡ Ш§Щ†ЪЇЩ„ЫЊШіЫЊ Щ…ЫЊвЂЊШ®Щ€Щ†Щ….",zh:"ж€‘ењЁе­¦ж Ўе­¦и‹±иЇ­гЂ‚",es:"Estudio inglГ©s en la escuela.",de:"Ich lerne Englisch in der Schule."},options:["English","lunch","sports","music"]},
        {type:"translate",source:{ru:"РћС‚РєСЂРѕР№ РєРЅРёРіСѓ РЅР° СЃС‚СЂР°РЅРёС†Рµ РґРµСЃСЏС‚СЊ.",en:"Open your book to page ten.",uz:"Kitobingizni o'ninchi sahifaga oching.",tr:"KitabД±nД±zД± onuncu sayfaya aГ§Д±n.",ar:"Ш§ЩЃШЄШ­ ЩѓШЄШ§ШЁЩѓ Ш№Щ„Щ‰ Ш§Щ„ШµЩЃШ­Ш© Ш§Щ„Ш№Ш§ШґШ±Ш©.",fa:"Ъ©ШЄШ§ШЁШЄ Ш±Щ€ ШµЩЃШ­Щ‡ ШЇЩ‡ ШЁШ§ШІ Ъ©Щ†.",zh:"жЉЉд№¦зї»е€°з¬¬еЌЃйЎµгЂ‚",es:"Abre tu libro en la pГЎgina diez.",de:"Г–ffne dein Buch auf Seite zehn."},answer:"open your book to page ten",accept:["open your book to page ten","open the book to page ten"]},
      ]},
    { id:10, emoji:"рџђ¶", titles:{ru:"Р–РёРІРѕС‚РЅС‹Рµ",en:"Animals",uz:"Hayvonlar",tr:"Hayvanlar",ar:"Ш§Щ„Ш­ЩЉЩ€Ш§Щ†Ш§ШЄ",fa:"Ш­ЫЊЩ€Ш§Щ†Ш§ШЄ",zh:"еЉЁз‰©",es:"Animales",de:"Tiere"},
      exercises:[
        {type:"choose",targetWord:"Dog",translations:{ru:"РЎРѕР±Р°РєР°",en:"Canine",uz:"It",tr:"KГ¶pek",ar:"ЩѓЩ„ШЁ",fa:"ШіЪЇ",zh:"з‹—",es:"Perro",de:"Hund"},distractors:{ru:["РљРѕС€РєР°","РџС‚РёС†Р°","Р С‹Р±Р°"],en:["Cat","Bird","Fish"],uz:["Mushuk","Qush","Baliq"],tr:["Kedi","KuЕџ","BalД±k"],ar:["Щ‚Ш·Ш©","Ш·Ш§Ш¦Ш±","ШіЩ…ЩѓШ©"],fa:["ЪЇШ±ШЁЩ‡","ЩѕШ±Щ†ШЇЩ‡","Щ…Ш§Щ‡ЫЊ"],zh:["зЊ«","йёџ","й±ј"],es:["Gato","PГЎjaro","Pez"],de:["Katze","Vogel","Fisch"]}},
        {type:"arrange",sentence:{ru:"РЈ РјРµРЅСЏ РµСЃС‚СЊ Р±РѕР»СЊС€Р°СЏ СЃРѕР±Р°РєР°",en:"I have a big dog",uz:"Mening katta itim bor",tr:"BГјyГјk bir kГ¶peДџim var",ar:"Ш№Щ†ШЇЩЉ ЩѓЩ„ШЁ ЩѓШЁЩЉШ±",fa:"ЫЊЩ‡ ШіЪЇ ШЁШІШ±ЪЇ ШЇШ§Ш±Щ…",zh:"ж€‘жњ‰дёЂеЏЄе¤§з‹—",es:"Tengo un perro grande",de:"Ich habe einen groГџen Hund"},answer:"I have a big dog",words:["I","have","a","big","dog","small","cat"]},
        {type:"fill",sentence:"The ___ is sleeping on the sofa.",blank:"cat",hint:{ru:"РљРѕС€РєР° СЃРїРёС‚ РЅР° РґРёРІР°РЅРµ.",en:"The cat is sleeping on the sofa.",uz:"Mushuk divanda uxlayapti.",tr:"Kedi kanepede uyuyor.",ar:"Ш§Щ„Щ‚Ш·Ш© Щ†Ш§Ш¦Щ…Ш© Ш№Щ„Щ‰ Ш§Щ„ШЈШ±ЩЉЩѓШ©.",fa:"ЪЇШ±ШЁЩ‡ Ш±Щ€ЫЊ Щ…ШЁЩ„ Ш®Щ€Ш§ШЁЫЊШЇЩ‡.",zh:"зЊ«ењЁжІ™еЏ‘дёЉзќЎи§‰гЂ‚",es:"El gato estГЎ durmiendo en el sofГЎ.",de:"Die Katze schlГ¤ft auf dem Sofa."},options:["cat","fish","bird","horse"]},
        {type:"translate",source:{ru:"РљР°РєРѕРµ С‚РІРѕС‘ Р»СЋР±РёРјРѕРµ Р¶РёРІРѕС‚РЅРѕРµ?",en:"What is your favourite animal?",uz:"Sevimli hayvoning nima?",tr:"En sevdiДџin hayvan ne?",ar:"Щ…Ш§ Щ‡Щ€ Ш­ЩЉЩ€Ш§Щ†Щѓ Ш§Щ„Щ…ЩЃШ¶Щ„Шџ",fa:"Ш­ЫЊЩ€Ш§Щ† Щ…Щ€Ш±ШЇ Ш№Щ„Ш§Щ‚Щ‡вЂЊШ§ШЄ Ъ†ЫЊЩ‡Шџ",zh:"дЅ жњЂе–њж¬ўд»Ђд№€еЉЁз‰©пјџ",es:"ВїCuГЎl es tu animal favorito?",de:"Was ist dein Lieblingstier?"},answer:"what is your favourite animal",accept:["what is your favourite animal","what is your favorite animal"]},
      ]},
    { id:11, emoji:"рџЏ ", titles:{ru:"РљРѕРјРЅР°С‚С‹ РґРѕРјР°",en:"Rooms",uz:"Xonalar",tr:"Odalar",ar:"ШєШ±ЩЃ Ш§Щ„Щ…Щ†ШІЩ„",fa:"Ш§ШЄШ§Щ‚вЂЊЩ‡Ш§ЫЊ Ш®Ш§Щ†Щ‡",zh:"ж€їй—ґ",es:"Habitaciones",de:"Zimmer"},
      exercises:[
        {type:"choose",targetWord:"Kitchen",translations:{ru:"РљСѓС…РЅСЏ",en:"Cooking room",uz:"Oshxona",tr:"Mutfak",ar:"Щ…Ш·ШЁШ®",fa:"ШўШґЩѕШІШ®Ш§Щ†Щ‡",zh:"еЋЁж€ї",es:"Cocina",de:"KГјche"},distractors:{ru:["РЎРїР°Р»СЊРЅСЏ","Р’Р°РЅРЅР°СЏ","Р“РѕСЃС‚РёРЅР°СЏ"],en:["Bedroom","Bathroom","Living room"],uz:["Yotoqxona","Hammom","Mehmonxona"],tr:["Yatak odasД±","Banyo","Oturma odasД±"],ar:["ШєШ±ЩЃШ© Щ†Щ€Щ…","Ш­Щ…Ш§Щ…","ШєШ±ЩЃШ© Щ…Ш№ЩЉШґШ©"],fa:["Ш§ШЄШ§Щ‚ Ш®Щ€Ш§ШЁ","Ш­Щ…Ш§Щ…","Ш§ШЄШ§Щ‚ Щ†ШґЫЊЩ…Щ†"],zh:["еЌ§е®¤","жµґе®¤","е®ўеЋ…"],es:["Dormitorio","BaГ±o","Sala"],de:["Schlafzimmer","Badezimmer","Wohnzimmer"]}},
        {type:"arrange",sentence:{ru:"Р’Р°РЅРЅР°СЏ РєРѕРјРЅР°С‚Р° РЅР°РІРµСЂС…Сѓ",en:"The bathroom is upstairs",uz:"Hammom yuqorida",tr:"Banyo yukarД±da",ar:"Ш§Щ„Ш­Щ…Ш§Щ… ЩЃЩЉ Ш§Щ„Ш·Ш§ШЁЩ‚ Ш§Щ„Ш№Щ„Щ€ЩЉ",fa:"Ш­Щ…Ш§Щ… Ш·ШЁЩ‚Щ‡ ШЁШ§Щ„Ш§ШіШЄ",zh:"жµґе®¤ењЁжҐјдёЉ",es:"El baГ±o estГЎ arriba",de:"Das Badezimmer ist oben"},answer:"The bathroom is upstairs",words:["The","bathroom","is","upstairs","downstairs","kitchen","bedroom"]},
        {type:"fill",sentence:"We eat in the ___.",blank:"dining room",hint:{ru:"РњС‹ РµРґРёРј РІ СЃС‚РѕР»РѕРІРѕР№.",en:"We eat in the dining room.",uz:"Biz ovqat xonasida ovqatlanamiz.",tr:"Yemek odasД±nda yiyoruz.",ar:"Щ†ШЈЩѓЩ„ ЩЃЩЉ ШєШ±ЩЃШ© Ш§Щ„Ш·Ш№Ш§Щ….",fa:"ШЄЩ€ЫЊ Ш§ШЄШ§Щ‚ Щ†Ш§Щ‡Ш§Ш±Ш®Щ€Ш±ЫЊ ШєШ°Ш§ Щ…ЫЊвЂЊШ®Щ€Ш±ЫЊЩ….",zh:"ж€‘д»¬ењЁй¤ђеЋ…еђѓйҐ­гЂ‚",es:"Comemos en el comedor.",de:"Wir essen im Esszimmer."},options:["dining room","garage","garden","roof"]},
        {type:"translate",source:{ru:"РњРѕСЏ СЃРїР°Р»СЊРЅСЏ РЅР° РІС‚РѕСЂРѕРј СЌС‚Р°Р¶Рµ.",en:"My bedroom is on the second floor.",uz:"Yotoqxonam ikkinchi qavatda.",tr:"Yatak odam ikinci katta.",ar:"ШєШ±ЩЃШЄЩЉ ЩЃЩЉ Ш§Щ„Ш·Ш§ШЁЩ‚ Ш§Щ„Ш«Ш§Щ†ЩЉ.",fa:"Ш§ШЄШ§Щ‚ Ш®Щ€Ш§ШЁЩ… Ш·ШЁЩ‚Щ‡ ШЇЩ€Щ…Щ‡.",zh:"ж€‘зљ„еЌ§е®¤ењЁдєЊжҐјгЂ‚",es:"Mi dormitorio estГЎ en el segundo piso.",de:"Mein Schlafzimmer ist im zweiten Stock."},answer:"my bedroom is on the second floor",accept:["my bedroom is on the second floor","my room is on the second floor"]},
      ]},
    { id:12, emoji:"рџ’Є", titles:{ru:"РЎРїРѕСЂС‚",en:"Sports",uz:"Sport",tr:"Spor",ar:"Ш§Щ„Ш±ЩЉШ§Ш¶Ш©",fa:"Щ€Ш±ШІШґ",zh:"дЅ“и‚І",es:"Deportes",de:"Sport"},
      exercises:[
        {type:"choose",targetWord:"Football",translations:{ru:"Р¤СѓС‚Р±РѕР»",en:"Soccer",uz:"Futbol",tr:"Futbol",ar:"ЩѓШ±Ш© Ш§Щ„Щ‚ШЇЩ…",fa:"ЩЃЩ€ШЄШЁШ§Щ„",zh:"и¶ізђѓ",es:"FГєtbol",de:"FuГџball"},distractors:{ru:["Р‘Р°СЃРєРµС‚Р±РѕР»","РўРµРЅРЅРёСЃ","РџР»Р°РІР°РЅРёРµ"],en:["Basketball","Tennis","Swimming"],uz:["Basketbol","Tennis","Suzish"],tr:["Basketbol","Tenis","YГјzme"],ar:["ЩѓШ±Ш© Ш§Щ„ШіЩ„Ш©","ШЄЩ†Ші","Ш§Щ„ШіШЁШ§Ш­Ш©"],fa:["ШЁШіЪ©ШЄШЁШ§Щ„","ШЄЩ†ЫЊШі","ШґЩ†Ш§"],zh:["зЇ®зђѓ","зЅ‘зђѓ","жёёжіі"],es:["Baloncesto","Tenis","NataciГіn"],de:["Basketball","Tennis","Schwimmen"]}},
        {type:"arrange",sentence:{ru:"РЇ РёРіСЂР°СЋ РІ С„СѓС‚Р±РѕР» РєР°Р¶РґСѓСЋ СЃСѓР±Р±РѕС‚Сѓ",en:"I play football every Saturday",uz:"Men har shanba kuni futbol o'ynayman",tr:"Her Cumartesi futbol oynuyorum",ar:"ШЈЩ†Ш§ ШЈЩ„Ш№ШЁ ЩѓШ±Ш© Ш§Щ„Щ‚ШЇЩ… ЩѓЩ„ ШіШЁШЄ",fa:"Щ‡Ш± ШґЩ†ШЁЩ‡ ЩЃЩ€ШЄШЁШ§Щ„ ШЁШ§ШІЫЊ Щ…ЫЊвЂЊЪ©Щ†Щ…",zh:"ж€‘жЇЏе‘Ёе…­иёўи¶ізђѓ",es:"Juego fГєtbol todos los sГЎbados",de:"Ich spiele jeden Samstag FuГџball"},answer:"I play football every Saturday",words:["I","play","football","every","Saturday","Sunday","basketball"]},
        {type:"fill",sentence:"She runs ___ kilometres every morning.",blank:"five",hint:{ru:"РћРЅР° Р±РµРіР°РµС‚ РїСЏС‚СЊ РєРёР»РѕРјРµС‚СЂРѕРІ РєР°Р¶РґРѕРµ СѓС‚СЂРѕ.",en:"She runs five kilometres every morning.",uz:"U har ertalab besh kilometr yuguradi.",tr:"Her sabah beЕџ kilometre koЕџuyor.",ar:"ШЄШ¬Ш±ЩЉ Ш®Щ…ШіШ© ЩѓЩЉЩ„Щ€Щ…ШЄШ±Ш§ШЄ ЩѓЩ„ ШµШЁШ§Ш­.",fa:"Щ‡Ш± ШµШЁШ­ ЩѕЩ†Ш¬ Ъ©ЫЊЩ„Щ€Щ…ШЄШ± Щ…ЫЊвЂЊШЇЩ€Щ‡.",zh:"еҐ№жЇЏе¤©ж—©дёЉи·‘дє”е…¬й‡ЊгЂ‚",es:"Corre cinco kilГіmetros cada maГ±ana.",de:"Sie lГ¤uft jeden Morgen fГјnf Kilometer."},options:["five","ten","one","hundred"]},
        {type:"translate",source:{ru:"РљС‚Рѕ С‚РІРѕР№ Р»СЋР±РёРјС‹Р№ СЃРїРѕСЂС‚СЃРјРµРЅ?",en:"Who is your favourite athlete?",uz:"Sevimli sportchingiz kim?",tr:"En sevdiДџin sporcu kim?",ar:"Щ…Щ† Щ‡Щ€ Ш±ЩЉШ§Ш¶ЩЉЩѓ Ш§Щ„Щ…ЩЃШ¶Щ„Шџ",fa:"Щ€Ш±ШІШґЪ©Ш§Ш± Щ…Щ€Ш±ШЇ Ш№Щ„Ш§Щ‚Щ‡вЂЊШ§ШЄ Ъ©ЫЊЩ‡Шџ",zh:"дЅ жњЂе–њж¬ўзљ„иїђеЉЁе‘жЇи°Ѓпјџ",es:"ВїQuiГ©n es tu deportista favorito?",de:"Wer ist dein Lieblingssportler?"},answer:"who is your favourite athlete",accept:["who is your favourite athlete","who is your favorite athlete","who is your favourite sportsman"]},
      ]},
  ],

  // в•ђв•ђ ENGLISH intermediate extra pack 2 в•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђ
  "en-intermediate-extra2": [
    { id:7, emoji:"рџ’»", titles:{ru:"РўРµС…РЅРѕР»РѕРіРёРё",en:"Technology",uz:"Texnologiya",tr:"Teknoloji",ar:"Ш§Щ„ШЄЩѓЩ†Щ€Щ„Щ€Ш¬ЩЉШ§",fa:"ЩЃЩ†Ш§Щ€Ш±ЫЊ",zh:"жЉЂжњЇ",es:"TecnologГ­a",de:"Technologie"},
      exercises:[
        {type:"choose",targetWord:"Software",translations:{ru:"РџСЂРѕРіСЂР°РјРјРЅРѕРµ РѕР±РµСЃРїРµС‡РµРЅРёРµ",en:"Computer program",uz:"Dasturiy ta'minot",tr:"YazД±lД±m",ar:"ШЁШ±Щ†Ш§Щ…Ш¬",fa:"Щ†Ш±Щ…вЂЊШ§ЩЃШІШ§Ш±",zh:"иЅЇд»¶",es:"Software",de:"Software"},distractors:{ru:["Р–РµР»РµР·Рѕ","РЎРµС‚СЊ","Р”Р°РЅРЅС‹Рµ"],en:["Hardware","Network","Data"],uz:["Texnik vosita","Tarmoq","Ma'lumot"],tr:["DonanД±m","AДџ","Veri"],ar:["Ш¬Щ‡Ш§ШІ","ШґШЁЩѓШ©","ШЁЩЉШ§Щ†Ш§ШЄ"],fa:["ШіШ®ШЄвЂЊШ§ЩЃШІШ§Ш±","ШґШЁЪ©Щ‡","ШЇШ§ШЇЩ‡"],zh:["зЎ¬д»¶","зЅ‘з»њ","ж•°жЌ®"],es:["Hardware","Red","Datos"],de:["Hardware","Netzwerk","Daten"]}},
        {type:"translate",source:{ru:"РњРѕР№ РєРѕРјРїСЊСЋС‚РµСЂ Р·Р°РІРёСЃ.",en:"My computer has crashed.",uz:"Kompyuterim ishlamay qoldi.",tr:"BilgisayarД±m Г§Г¶ktГј.",ar:"ШЄШ№Ш·Щ‘Щ„ Ш¬Щ‡Ш§ШІЩЉ.",fa:"Ъ©Ш§Щ…ЩѕЫЊЩ€ШЄШ±Щ… Щ‡Щ†ЪЇ Ъ©Ш±ШЇЩ‡.",zh:"ж€‘зљ„з”µи„‘еґ©жєѓдє†гЂ‚",es:"Mi computadora se bloqueГі.",de:"Mein Computer ist abgestГјrzt."},answer:"my computer has crashed",accept:["my computer has crashed","my computer crashed"]},
        {type:"arrange",sentence:{ru:"РњРЅРµ РЅСѓР¶РЅРѕ РѕР±РЅРѕРІРёС‚СЊ РїСЂРѕРіСЂР°РјРјСѓ",en:"I need to update the software",uz:"Dasturni yangilashim kerak",tr:"YazД±lД±mД± gГјncellemem gerekiyor",ar:"ШЈШ­ШЄШ§Ш¬ ШЄШ­ШЇЩЉШ« Ш§Щ„ШЁШ±Щ†Ш§Щ…Ш¬",fa:"ШЁШ§ЫЊШЇ Щ†Ш±Щ…вЂЊШ§ЩЃШІШ§Ш± Ш±Щ€ ШўЩѕШЇЫЊШЄ Ъ©Щ†Щ…",zh:"ж€‘йњЂи¦Ѓж›ґж–°иЅЇд»¶",es:"Necesito actualizar el software",de:"Ich muss die Software aktualisieren"},answer:"I need to update the software",words:["I","need","to","update","the","software","delete","install"]},
        {type:"fill",sentence:"Can you ___ me the file?",blank:"send",hint:{ru:"РњРѕР¶РµС€СЊ РѕС‚РїСЂР°РІРёС‚СЊ РјРЅРµ С„Р°Р№Р»?",en:"Can you send me the file?",uz:"Menga faylni yubora olasizmi?",tr:"DosyayД± bana gГ¶nderebilir misin?",ar:"Щ‡Щ„ ЩЉЩ…ЩѓЩ†Щѓ ШҐШ±ШіШ§Щ„ Ш§Щ„Щ…Щ„ЩЃ Щ„ЩЉШџ",fa:"Щ…ЫЊвЂЊШЄЩ€Щ†ЫЊ ЩЃШ§ЫЊЩ„ Ш±Щ€ ШЁШ±Ш§Щ… ШЁЩЃШ±ШіШЄЫЊШџ",zh:"дЅ иѓЅжЉЉж–‡д»¶еЏ‘з»™ж€‘еђ—пјџ",es:"ВїPuedes enviarme el archivo?",de:"Kannst du mir die Datei schicken?"},options:["send","eat","buy","hide"]},
      ]},
    { id:8, emoji:"рџЏ¦", titles:{ru:"Р‘Р°РЅРє Рё РґРµРЅСЊРіРё",en:"Bank & Money",uz:"Bank va pul",tr:"Banka ve Para",ar:"Ш§Щ„ШЁЩ†Щѓ Щ€Ш§Щ„Щ…Ш§Щ„",fa:"ШЁШ§Щ†Ъ© Щ€ ЩѕЩ€Щ„",zh:"й“¶иЎЊе’Њй’±",es:"Banco y dinero",de:"Bank und Geld"},
      exercises:[
        {type:"choose",targetWord:"Account",translations:{ru:"РЎС‡С‘С‚",en:"Bank record",uz:"Hisob",tr:"Hesap",ar:"Ш­ШіШ§ШЁ",fa:"Ш­ШіШ§ШЁ",zh:"иґ¦ж€·",es:"Cuenta",de:"Konto"},distractors:{ru:["РљСЂРµРґРёС‚","РќР°Р»РёС‡РЅС‹Рµ","РљР°СЂС‚Р°"],en:["Credit","Cash","Card"],uz:["Kredit","Naqd","Karta"],tr:["Kredi","Nakit","Kart"],ar:["Ш§Ш¦ШЄЩ…Ш§Щ†","Щ†Щ‚ШЇ","ШЁШ·Ш§Щ‚Ш©"],fa:["Ш§Ш№ШЄШЁШ§Ш±","Щ†Щ‚ШЇ","Ъ©Ш§Ш±ШЄ"],zh:["дїЎз”Ё","зЋ°й‡‘","еЌЎ"],es:["CrГ©dito","Efectivo","Tarjeta"],de:["Kredit","Bargeld","Karte"]}},
        {type:"translate",source:{ru:"РЇ С…РѕС‡Сѓ РѕС‚РєСЂС‹С‚СЊ СЃС‡С‘С‚.",en:"I would like to open an account.",uz:"Hisob ochmoqchiman.",tr:"Hesap aГ§mak istiyorum.",ar:"ШЈШ±ЩЉШЇ ЩЃШЄШ­ Ш­ШіШ§ШЁ.",fa:"Щ…ЫЊвЂЊШ®Щ€Ш§Щ… Ш­ШіШ§ШЁ ШЁШ§ШІ Ъ©Щ†Щ….",zh:"ж€‘жѓіејЂдёЂдёЄиґ¦ж€·гЂ‚",es:"Me gustarГ­a abrir una cuenta.",de:"Ich mГ¶chte ein Konto erГ¶ffnen."},answer:"i would like to open an account",accept:["i would like to open an account","i want to open an account"]},
        {type:"fill",sentence:"Can I ___ some money please?",blank:"withdraw",hint:{ru:"РњРѕР¶РЅРѕ СЃРЅСЏС‚СЊ РґРµРЅСЊРіРё?",en:"Can I withdraw some money please?",uz:"Pul yechib olsam bo'ladimi?",tr:"Para Г§ekebilir miyim?",ar:"Щ‡Щ„ ЩЉЩ…ЩѓЩ†Щ†ЩЉ ШіШ­ШЁ ШЁШ№Ш¶ Ш§Щ„Щ…Ш§Щ„Шџ",fa:"Щ…ЫЊвЂЊШЄЩ€Щ†Щ… ЩѕЩ€Щ„ ШЁШ±ШЇШ§ШґШЄ Ъ©Щ†Щ…Шџ",zh:"ж€‘еЏЇд»ҐеЏ–дёЂдє›й’±еђ—пјџ",es:"ВїPuedo retirar algo de dinero?",de:"Kann ich etwas Geld abheben?"},options:["withdraw","deposit","hide","spend"]},
        {type:"arrange",sentence:{ru:"РћР±РјРµРЅРЅС‹Р№ РєСѓСЂСЃ СЃРµРіРѕРґРЅСЏ РїР»РѕС…РѕР№",en:"The exchange rate is bad today",uz:"Bugun valyuta kursi yomon",tr:"DГ¶viz kuru bugГјn kГ¶tГј",ar:"ШіШ№Ш± Ш§Щ„ШµШ±ЩЃ ШіЩЉШЎ Ш§Щ„ЩЉЩ€Щ…",fa:"Щ†Ш±Ш® Ш§Ш±ШІ Ш§Щ…Ш±Щ€ШІ ШЁШЇЩ‡",zh:"д»Ље¤©зљ„ж±‡зЋ‡еѕ€е·®",es:"El tipo de cambio estГЎ malo hoy",de:"Der Wechselkurs ist heute schlecht"},answer:"The exchange rate is bad today",words:["The","exchange","rate","is","bad","today","good","tomorrow"]},
      ]},
    { id:9, emoji:"рџЋ“", titles:{ru:"РћР±СЂР°Р·РѕРІР°РЅРёРµ",en:"Education",uz:"Ta'lim",tr:"EДџitim",ar:"Ш§Щ„ШЄШ№Щ„ЩЉЩ…",fa:"ШўЩ…Щ€ШІШґ",zh:"ж•™и‚І",es:"EducaciГіn",de:"Bildung"},
      exercises:[
        {type:"choose",targetWord:"University",translations:{ru:"РЈРЅРёРІРµСЂСЃРёС‚РµС‚",en:"College",uz:"Universitet",tr:"Гњniversite",ar:"Ш¬Ш§Щ…Ш№Ш©",fa:"ШЇШ§Щ†ШґЪЇШ§Щ‡",zh:"е¤§е­¦",es:"Universidad",de:"UniversitГ¤t"},distractors:{ru:["РЁРєРѕР»Р°","РљРѕР»Р»РµРґР¶","Р”РµС‚СЃРєРёР№ СЃР°Рґ"],en:["School","High school","Kindergarten"],uz:["Maktab","Kollej","Bog'cha"],tr:["Okul","Lise","Anaokulu"],ar:["Щ…ШЇШ±ШіШ©","Ш«Ш§Щ†Щ€ЩЉШ©","Ш±Щ€Ш¶Ш©"],fa:["Щ…ШЇШ±ШіЩ‡","ШЇШЁЫЊШ±ШіШЄШ§Щ†","Щ…Щ‡ШЇЪ©Щ€ШЇЪ©"],zh:["е­¦ж Ў","й«дё­","е№је„їе›­"],es:["Escuela","Instituto","JardГ­n"],de:["Schule","Gymnasium","Kindergarten"]}},
        {type:"translate",source:{ru:"РЇ РёР·СѓС‡Р°СЋ РјРµРґРёС†РёРЅСѓ РІ СѓРЅРёРІРµСЂСЃРёС‚РµС‚Рµ.",en:"I study medicine at university.",uz:"Men universitetda tibbiyot o'qiyman.",tr:"Гњniversitede tД±p okuyorum.",ar:"ШЈШЇШ±Ші Ш§Щ„Ш·ШЁ ЩЃЩЉ Ш§Щ„Ш¬Ш§Щ…Ш№Ш©.",fa:"ШЇШ± ШЇШ§Щ†ШґЪЇШ§Щ‡ ЩѕШІШґЪ©ЫЊ Щ…ЫЊвЂЊШ®Щ€Щ†Щ….",zh:"ж€‘ењЁе¤§е­¦е­¦еЊ»гЂ‚",es:"Estudio medicina en la universidad.",de:"Ich studiere Medizin an der UniversitГ¤t."},answer:"i study medicine at university",accept:["i study medicine at university","i study medicine at the university"]},
        {type:"fill",sentence:"I ___ my exam last week.",blank:"passed",hint:{ru:"РЇ СЃРґР°Р» СЌРєР·Р°РјРµРЅ РЅР° РїСЂРѕС€Р»РѕР№ РЅРµРґРµР»Рµ.",en:"I passed my exam last week.",uz:"O'tgan hafta imtihondan o'tdim.",tr:"GeГ§en hafta sД±navД±mД± geГ§tim.",ar:"Ш§Ш¬ШЄШІШЄ Ш§Щ…ШЄШ­Ш§Щ†ЩЉ Ш§Щ„ШЈШіШЁЩ€Ш№ Ш§Щ„Щ…Ш§Ш¶ЩЉ.",fa:"Щ‡ЩЃШЄЩ‡ ЩѕЫЊШґ Ш§Щ…ШЄШ­Ш§Щ†Щ… Ш±Щ€ ЩѕШ§Ші Ъ©Ш±ШЇЩ….",zh:"ж€‘дёЉе‘ЁйЂљиї‡дє†иЂѓиЇ•гЂ‚",es:"AprobГ© mi examen la semana pasada.",de:"Ich habe letzte Woche meine PrГјfung bestanden."},options:["passed","failed","missed","forgot"]},
      ]},
  ],

  // в•ђв•ђ JAPANESE more lessons в•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђ
  "ja-beginner-extra": [
    { id:4, emoji:"рџ‘ЁвЂЌрџ‘©вЂЌрџ‘§", titles:{ru:"РЎРµРјСЊСЏ",en:"Family",uz:"Oila",tr:"Aile",ar:"Ш§Щ„Ш№Ш§Ш¦Щ„Ш©",fa:"Ш®Ш§Щ†Щ€Ш§ШЇЩ‡",zh:"е®¶еє­",es:"Familia",de:"Familie"},
      exercises:[
        {type:"choose",targetWord:"гЃЉгЃ‹гЃ‚гЃ•г‚“",translations:{ru:"РњР°РјР°",en:"Mother",uz:"Ona",tr:"Anne",ar:"ШЈЩ…",fa:"Щ…Ш§ШЇШ±",zh:"е¦€е¦€",es:"Madre",de:"Mutter"},distractors:{ru:["РџР°РїР°","Р‘СЂР°С‚","РЎРµСЃС‚СЂР°"],en:["Father","Brother","Sister"],uz:["Ota","Aka","Singil"],tr:["Baba","Erkek kardeЕџ","KД±z kardeЕџ"],ar:["ШЈШЁ","ШЈШ®","ШЈШ®ШЄ"],fa:["ЩѕШЇШ±","ШЁШ±Ш§ШЇШ±","Ш®Щ€Ш§Щ‡Ш±"],zh:["з€ёз€ё","е…„ејџ","е§ђе¦№"],es:["Padre","Hermano","Hermana"],de:["Vater","Bruder","Schwester"]}},
        {type:"arrange",sentence:{ru:"РњРѕСЏ СЃРµРјСЊСЏ Р±РѕР»СЊС€Р°СЏ",en:"My family is big",uz:"Oilam katta",tr:"Ailem bГјyГјk",ar:"Ш№Ш§Ш¦Щ„ШЄЩЉ ЩѓШЁЩЉШ±Ш©",fa:"Ш®Ш§Щ†Щ€Ш§ШЇЩ‡вЂЊШ§Щ… ШЁШІШ±ЪЇЩ‡",zh:"ж€‘е®¶дєєеѕ€е¤љ",es:"Mi familia es grande",de:"Meine Familie ist groГџ"},answer:"г‚ЏгЃџгЃ—гЃ® гЃ‹гЃћгЃЏ гЃЇ гЃЉгЃЉгЃЌгЃ„ гЃ§гЃ™", words:["г‚ЏгЃџгЃ—гЃ®","гЃ‹гЃћгЃЏ","гЃЇ","гЃЉгЃЉгЃЌгЃ„","гЃ§гЃ™","гЃЎгЃ„гЃ•гЃ„","гЃџгЃ®гЃ—гЃ„"]},
        {type:"fill",sentence:"гЃЉгЃЁгЃ†гЃ•г‚“ гЃЇ ___ гЃ§гЃ™гЂ‚",blank:"гЃ„гЃ—г‚ѓ",hint:{ru:"РџР°РїР° вЂ” РІСЂР°С‡.",en:"Father is a doctor.",uz:"Otam shifokor.",tr:"Babam doktor.",ar:"ШЈШЁЩЉ Ш·ШЁЩЉШЁ.",fa:"ШЁШ§ШЁШ§Щ… ШЇЪ©ШЄШ±Щ‡.",zh:"з€ёз€ёжЇеЊ»з”џгЂ‚",es:"Mi padre es mГ©dico.",de:"Vater ist Arzt."},options:["гЃ„гЃ—г‚ѓ","гЃ›г‚“гЃ›гЃ„","гЃЊгЃЏгЃ›гЃ„","гЃ‹гЃ„гЃ—г‚ѓгЃ„г‚“"]},
      ]},
    { id:5, emoji:"рџЊ†", titles:{ru:"Р“РѕСЂРѕРґ",en:"City",uz:"Shahar",tr:"Ећehir",ar:"Ш§Щ„Щ…ШЇЩЉЩ†Ш©",fa:"ШґЩ‡Ш±",zh:"еџЋеё‚",es:"Ciudad",de:"Stadt"},
      exercises:[
        {type:"choose",targetWord:"гЃ€гЃЌ",translations:{ru:"Р’РѕРєР·Р°Р»/РЎС‚Р°РЅС†РёСЏ",en:"Station",uz:"Stansiya",tr:"Д°stasyon",ar:"Щ…Ш­Ш·Ш©",fa:"Ш§ЫЊШіШЄЪЇШ§Щ‡",zh:"иЅ¦з«™",es:"EstaciГіn",de:"Bahnhof"},distractors:{ru:["РњР°РіР°Р·РёРЅ","РЁРєРѕР»Р°","Р‘РѕР»СЊРЅРёС†Р°"],en:["Shop","School","Hospital"],uz:["Do'kon","Maktab","Kasalxona"],tr:["DГјkkan","Okul","Hastane"],ar:["Щ…ШЄШ¬Ш±","Щ…ШЇШ±ШіШ©","Щ…ШіШЄШґЩЃЩ‰"],fa:["Щ…ШєШ§ШІЩ‡","Щ…ШЇШ±ШіЩ‡","ШЁЫЊЩ…Ш§Ш±ШіШЄШ§Щ†"],zh:["е•†еє—","е­¦ж Ў","еЊ»й™ў"],es:["Tienda","Escuela","Hospital"],de:["GeschГ¤ft","Schule","Krankenhaus"]}},
        {type:"translate",source:{ru:"Р“РґРµ Р±Р»РёР¶Р°Р№С€Р°СЏ СЃС‚Р°РЅС†РёСЏ РјРµС‚СЂРѕ?",en:"Where is the nearest station?",uz:"Eng yaqin stansiya qayerda?",tr:"En yakД±n istasyon nerede?",ar:"ШЈЩЉЩ† ШЈЩ‚Ш±ШЁ Щ…Ш­Ш·Ш©Шџ",fa:"Щ†ШІШЇЫЊЪ©вЂЊШЄШ±ЫЊЩ† Ш§ЫЊШіШЄЪЇШ§Щ‡ Ъ©Ш¬Ш§ШіШЄШџ",zh:"жњЂиї‘зљ„иЅ¦з«™ењЁе“Єй‡Њпјџ",es:"ВїDГіnde estГЎ la estaciГіn mГЎs cercana?",de:"Wo ist die nГ¤chste Station?"},answer:"гЃ€гЃЌ гЃЇ гЃ©гЃ“ гЃ§гЃ™гЃ‹",accept:["гЃ€гЃЌгЃЇгЃ©гЃ“гЃ§гЃ™гЃ‹","гЃ€гЃЌ гЃЇ гЃ©гЃ“ гЃ§гЃ™гЃ‹"]},
        {type:"fill",sentence:"гЃ“гЃ“гЃ‹г‚‰ ___ гЃѕгЃ§ гЃ©гЃ®гЃЏг‚‰гЃ„гЃ§гЃ™гЃ‹гЂ‚",blank:"гЃ€гЃЌ",hint:{ru:"РљР°Рє РґР°Р»РµРєРѕ РѕС‚СЃСЋРґР° РґРѕ СЃС‚Р°РЅС†РёРё?",en:"How far is it from here to the station?",uz:"Bu yerdan stansiyagacha qancha?",tr:"Buradan istasyona ne kadar uzak?",ar:"ЩѓЩ… Ш§Щ„Щ…ШіШ§ЩЃШ© Щ…Щ† Щ‡Щ†Ш§ ШҐЩ„Щ‰ Ш§Щ„Щ…Ш­Ш·Ш©Шџ",fa:"Ш§ШІ Ш§ЫЊЩ†Ш¬Ш§ ШЄШ§ Ш§ЫЊШіШЄЪЇШ§Щ‡ Ъ†Щ‚ШЇШ±Щ‡Шџ",zh:"д»Ћиї™й‡Ње€°иЅ¦з«™жњ‰е¤љиїњпјџ",es:"ВїQuГ© tan lejos estГЎ la estaciГіn desde aquГ­?",de:"Wie weit ist es von hier bis zur Station?"},options:["гЃ€гЃЌ","гЃ†гЃї","г‚„гЃѕ","гЃќг‚‰"]},
      ]},
    { id:6, emoji:"вЏ°", titles:{ru:"Р’СЂРµРјСЏ",en:"Time",uz:"Vaqt",tr:"Zaman",ar:"Ш§Щ„Щ€Щ‚ШЄ",fa:"ШІЩ…Ш§Щ†",zh:"ж—¶й—ґ",es:"Tiempo",de:"Zeit"},
      exercises:[
        {type:"choose",targetWord:"гЃ‚гЃ•",translations:{ru:"РЈС‚СЂРѕ",en:"Morning",uz:"Ertalab",tr:"Sabah",ar:"ШµШЁШ§Ш­",fa:"ШµШЁШ­",zh:"ж—©дёЉ",es:"MaГ±ana",de:"Morgen"},distractors:{ru:["Р’РµС‡РµСЂ","РќРѕС‡СЊ","Р”РµРЅСЊ"],en:["Evening","Night","Afternoon"],uz:["Kechqurun","Tun","Tushdan keyin"],tr:["AkЕџam","Gece","Г–Дџleden sonra"],ar:["Щ…ШіШ§ШЎ","Щ„ЩЉЩ„","ШЁШ№ШЇ Ш§Щ„ШёЩ‡Ш±"],fa:["Ш№ШµШ±","ШґШЁ","ШЁШ№ШЇШ§ШІШёЩ‡Ш±"],zh:["ж™љдёЉ","е¤њж™љ","дё‹еЌ€"],es:["Tarde","Noche","MediodГ­a"],de:["Abend","Nacht","Nachmittag"]}},
        {type:"arrange",sentence:{ru:"РЎРµР№С‡Р°СЃ РІРѕСЃРµРјСЊ С‡Р°СЃРѕРІ СѓС‚СЂР°",en:"It is eight in the morning",uz:"Hozir ertalab soat sakkiz",tr:"Ећu an sabah sekiz",ar:"Ш§Щ„ШўЩ† Ш§Щ„Ш«Ш§Щ…Щ†Ш© ШµШЁШ§Ш­Ш§Щ‹",fa:"Ш§Щ„Ш§Щ† ШіШ§Ш№ШЄ Щ‡ШґШЄ ШµШЁШ­Щ‡",zh:"зЋ°ењЁжЇж—©дёЉе…«з‚№",es:"Son las ocho de la maГ±ana",de:"Es ist acht Uhr morgens"},answer:"гЃ„гЃѕ гЃЇ гЃ‚гЃ• гЃ® гЃЇгЃЎ гЃ гЃ§гЃ™",words:["гЃ„гЃѕ","гЃЇ","гЃ‚гЃ•","гЃ®","гЃЇгЃЎ","гЃ","гЃ§гЃ™","гЃ”","г‚ЌгЃЏ"]},
        {type:"translate",source:{ru:"РљРѕС‚РѕСЂС‹Р№ С‡Р°СЃ?",en:"What time is it?",uz:"Soat necha?",tr:"Saat kaГ§?",ar:"ЩѓЩ… Ш§Щ„ШіШ§Ш№Ш©Шџ",fa:"ШіШ§Ш№ШЄ Ъ†Щ†ШЇЩ‡Шџ",zh:"зЋ°ењЁе‡ з‚№пјџ",es:"ВїQuГ© hora es?",de:"Wie spГ¤t ist es?"},answer:"гЃ„гЃѕ гЃЄг‚“гЃ гЃ§гЃ™гЃ‹",accept:["гЃ„гЃѕгЃЄг‚“гЃгЃ§гЃ™гЃ‹","гЃ„гЃѕ гЃЄг‚“гЃ гЃ§гЃ™гЃ‹"]},
      ]},
  ],

  "ja-intermediate": [
    { id:1, emoji:"рџ’ј", titles:{ru:"Р Р°Р±РѕС‚Р°",en:"Work",uz:"Ish",tr:"Д°Еџ",ar:"Ш§Щ„Ш№Щ…Щ„",fa:"Ъ©Ш§Ш±",zh:"е·ҐдЅњ",es:"Trabajo",de:"Arbeit"},
      exercises:[
        {type:"choose",targetWord:"гЃ‹гЃ„гЃЋ",translations:{ru:"РЎРѕРІРµС‰Р°РЅРёРµ",en:"Meeting",uz:"Yig'ilish",tr:"ToplantД±",ar:"Ш§Ш¬ШЄЩ…Ш§Ш№",fa:"Ш¬Щ„ШіЩ‡",zh:"дјљи®®",es:"ReuniГіn",de:"Besprechung"},distractors:{ru:["РџРµСЂРµСЂС‹РІ","РћР±РµРґ","РћС‚С‡С‘С‚"],en:["Break","Lunch","Report"],uz:["Tanaffus","Tushlik","Hisobot"],tr:["Mola","Г–Дџle yemeДџi","Rapor"],ar:["Ш§ШіШЄШ±Ш§Ш­Ш©","ШєШЇШ§ШЎ","ШЄЩ‚Ш±ЩЉШ±"],fa:["Ш§ШіШЄШ±Ш§Ш­ШЄ","Щ†Ш§Щ‡Ш§Ш±","ЪЇШІШ§Ш±Шґ"],zh:["дј‘жЃЇ","еЌ€й¤ђ","жЉҐе‘Љ"],es:["Descanso","Almuerzo","Informe"],de:["Pause","Mittagessen","Bericht"]}},
        {type:"translate",source:{ru:"РЎРµРіРѕРґРЅСЏ Сѓ РјРµРЅСЏ РјРЅРѕРіРѕ СЂР°Р±РѕС‚С‹.",en:"I have a lot of work today.",uz:"Bugun ko'p ishim bor.",tr:"BugГјn Г§ok iЕџim var.",ar:"Ш№Щ†ШЇЩЉ Ш№Щ…Щ„ ЩѓШ«ЩЉШ± Ш§Щ„ЩЉЩ€Щ….",fa:"Ш§Щ…Ш±Щ€ШІ Ъ©Ш§Ш± ШІЫЊШ§ШЇЫЊ ШЇШ§Ш±Щ….",zh:"ж€‘д»Ље¤©жњ‰еѕ€е¤ље·ҐдЅњгЂ‚",es:"Hoy tengo mucho trabajo.",de:"Ich habe heute viel Arbeit."},answer:"гЃЌг‚‡гЃ† гЃЇ гЃ—гЃ”гЃЁ гЃЊ гЃџгЃЏгЃ•г‚“ гЃ‚г‚ЉгЃѕгЃ™",accept:["гЃЌг‚‡гЃ†гЃЇгЃ—гЃ”гЃЁгЃЊгЃџгЃЏгЃ•г‚“гЃ‚г‚ЉгЃѕгЃ™","гЃЌг‚‡гЃ† гЃ—гЃ”гЃЁ гЃџгЃЏгЃ•г‚“"]},
        {type:"arrange",sentence:{ru:"Р’СЃС‚СЂРµС‡Р° РЅР°С‡РЅС‘С‚СЃСЏ РІ С‚СЂРё С‡Р°СЃР°",en:"The meeting starts at three",uz:"Yig'ilish uchda boshlanadi",tr:"ToplantД± ГјГ§te baЕџlar",ar:"Ш§Щ„Ш§Ш¬ШЄЩ…Ш§Ш№ ЩЉШЁШЇШЈ ЩЃЩЉ Ш§Щ„Ш«Ш§Щ„Ш«Ш©",fa:"Ш¬Щ„ШіЩ‡ ШіШ§Ш№ШЄ ШіЩ‡ ШґШ±Щ€Ш№ Щ…ЫЊвЂЊШґЩ‡",zh:"дјљи®®дё‰з‚№ејЂе§‹",es:"La reuniГіn empieza a las tres",de:"Das Meeting beginnt um drei Uhr"},answer:"гЃ‹гЃ„гЃЋ гЃЇ гЃ•г‚“гЃ гЃ« гЃЇгЃгЃѕг‚ЉгЃѕгЃ™",words:["гЃ‹гЃ„гЃЋ","гЃЇ","гЃ•г‚“гЃ","гЃ«","гЃЇгЃгЃѕг‚ЉгЃѕгЃ™","гЃЉг‚Џг‚ЉгЃѕгЃ™","г‚€гЃ"]},
        {type:"fill",sentence:"гЃ“гЃ® гѓ—гѓ­г‚ёг‚§г‚Їгѓ€ гЃ® ___ гЃЇ г‚‰гЃ„гЃ—г‚…гЃ† гЃ§гЃ™гЂ‚",blank:"гЃ—г‚ЃгЃЌг‚Љ",hint:{ru:"Р”РµРґР»Р°Р№РЅ СЌС‚РѕРіРѕ РїСЂРѕРµРєС‚Р° вЂ” РЅР° СЃР»РµРґСѓСЋС‰РµР№ РЅРµРґРµР»Рµ.",en:"The deadline for this project is next week.",uz:"Bu loyihaning muddati keyingi hafta.",tr:"Bu projenin son tarihi gelecek hafta.",ar:"Ш§Щ„Щ…Щ€Ш№ШЇ Ш§Щ„Щ†Щ‡Ш§Ш¦ЩЉ Щ„Щ‡Ш°Ш§ Ш§Щ„Щ…ШґШ±Щ€Ш№ Щ‡Щ€ Ш§Щ„ШЈШіШЁЩ€Ш№ Ш§Щ„Щ‚Ш§ШЇЩ….",fa:"ШЇШЇЩ„Ш§ЫЊЩ† Ш§ЫЊЩ† ЩѕШ±Щ€ЪЩ‡ Щ‡ЩЃШЄЩ‡ ШЇЫЊЪЇЩ‡вЂЊШіШЄ.",zh:"иї™дёЄйЎ№з›®зљ„ж€Єж­ўж—ҐжњџжЇдё‹е‘ЁгЂ‚",es:"El plazo de este proyecto es la prГіxima semana.",de:"Die Frist fГјr dieses Projekt ist nГ¤chste Woche."},options:["гЃ—г‚ЃгЃЌг‚Љ","гЃ‹гЃ„гЃЋ","г‚„гЃ™гЃї","гЃ—гЃ”гЃЁ"]},
      ]},
    { id:2, emoji:"рџ›’", titles:{ru:"РџРѕРєСѓРїРєРё",en:"Shopping",uz:"Xarid",tr:"AlД±ЕџveriЕџ",ar:"Ш§Щ„ШЄШіЩ€Щ‚",fa:"Ш®Ш±ЫЊШЇ",zh:"иґ­з‰©",es:"Compras",de:"Einkaufen"},
      exercises:[
        {type:"choose",targetWord:"гЃ„гЃЏг‚‰",translations:{ru:"РЎРєРѕР»СЊРєРѕ СЃС‚РѕРёС‚?",en:"How much?",uz:"Qancha?",tr:"Ne kadar?",ar:"ШЁЩѓЩ…Шџ",fa:"Ъ†Щ‚ШЇШ±Щ‡Шџ",zh:"е¤ље°‘й’±пјџ",es:"ВїCuГЎnto?",de:"Wie viel?"},distractors:{ru:["Р“РґРµ?","РљРѕРіРґР°?","РџРѕС‡РµРјСѓ?"],en:["Where?","When?","Why?"],uz:["Qayerda?","Qachon?","Nima uchun?"],tr:["Nerede?","Ne zaman?","Neden?"],ar:["ШЈЩЉЩ†Шџ","Щ…ШЄЩ‰Шџ","Щ„Щ…Ш§Ш°Ш§Шџ"],fa:["Ъ©Ш¬Ш§Шџ","Ъ©ЩђЫЊШџ","Ъ†Ш±Ш§Шџ"],zh:["е“Єй‡Њпјџ","д»Ђд№€ж—¶еЂ™пјџ","дёєд»Ђд№€пјџ"],es:["ВїDГіnde?","ВїCuГЎndo?","ВїPor quГ©?"],de:["Wo?","Wann?","Warum?"]}},
        {type:"translate",source:{ru:"Р­С‚Рѕ СЃР»РёС€РєРѕРј РґРѕСЂРѕРіРѕ.",en:"This is too expensive.",uz:"Bu juda qimmat.",tr:"Bu Г§ok pahalД±.",ar:"Щ‡Ш°Ш§ ШєШ§Щ„ЩЌ Ш¬ШЇШ§Щ‹.",fa:"Ш§ЫЊЩ† Ш®ЫЊЩ„ЫЊ ЪЇШ±Щ€Щ†Щ‡.",zh:"иї™е¤Єиґµдє†гЂ‚",es:"Esto es demasiado caro.",de:"Das ist zu teuer."},answer:"гЃ“г‚Њ гЃЇ гЃџгЃ‹гЃ™гЃЋгЃѕгЃ™",accept:["гЃ“г‚ЊгЃЇгЃџгЃ‹гЃ™гЃЋгЃѕгЃ™","гЃџгЃ‹гЃ™гЃЋгЃѕгЃ™"]},
        {type:"fill",sentence:"г‚‚гЃЈгЃЁ ___ гЃ® гЃЇ гЃ‚г‚ЉгЃѕгЃ™гЃ‹гЂ‚",blank:"г‚„гЃ™гЃ„",hint:{ru:"Р•СЃС‚СЊ С‡С‚Рѕ-С‚Рѕ РїРѕРґРµС€РµРІР»Рµ?",en:"Do you have something cheaper?",uz:"Arzonroq narsa bormi?",tr:"Daha ucuz bir Еџey var mД±?",ar:"Щ‡Щ„ Ш№Щ†ШЇЩѓ ШґЩЉШЎ ШЈШ±Ш®ШµШџ",fa:"Ъ†ЫЊШІ Ш§Ш±ШІЩ€Щ†вЂЊШЄШ±ЫЊ ШЇШ§Ш±ЫЊШЇШџ",zh:"жњ‰ж›ґдѕїе®њзљ„еђ—пјџ",es:"ВїTiene algo mГЎs barato?",de:"Haben Sie etwas GГјnstigeres?"},options:["г‚„гЃ™гЃ„","гЃџгЃ‹гЃ„","гЃЉгЃЉгЃЌгЃ„","гЃЎгЃ„гЃ•гЃ„"]},
      ]},
  ],

  // в•ђв•ђ KOREAN more lessons в•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђ
  "ko-beginner-extra": [
    { id:4, emoji:"рџ‘ЁвЂЌрџ‘©вЂЌрџ‘§", titles:{ru:"РЎРµРјСЊСЏ",en:"Family",uz:"Oila",tr:"Aile",ar:"Ш§Щ„Ш№Ш§Ш¦Щ„Ш©",fa:"Ш®Ш§Щ†Щ€Ш§ШЇЩ‡",zh:"е®¶еє­",es:"Familia",de:"Familie"},
      exercises:[
        {type:"choose",targetWord:"м–ґлЁёл‹€",translations:{ru:"РњР°РјР°",en:"Mother",uz:"Ona",tr:"Anne",ar:"ШЈЩ…",fa:"Щ…Ш§ШЇШ±",zh:"е¦€е¦€",es:"Madre",de:"Mutter"},distractors:{ru:["РџР°РїР°","Р‘СЂР°С‚","РЎРµСЃС‚СЂР°"],en:["Father","Brother","Sister"],uz:["Ota","Aka","Singil"],tr:["Baba","Erkek kardeЕџ","KД±z kardeЕџ"],ar:["ШЈШЁ","ШЈШ®","ШЈШ®ШЄ"],fa:["ЩѕШЇШ±","ШЁШ±Ш§ШЇШ±","Ш®Щ€Ш§Щ‡Ш±"],zh:["з€ёз€ё","е…„ејџ","е§ђе¦№"],es:["Padre","Hermano","Hermana"],de:["Vater","Bruder","Schwester"]}},
        {type:"arrange",sentence:{ru:"РњРѕСЏ СЃРµРјСЊСЏ РѕС‡РµРЅСЊ РґРѕР±СЂР°СЏ",en:"My family is very kind",uz:"Oilam juda mehribon",tr:"Ailem Г§ok nazik",ar:"Ш№Ш§Ш¦Щ„ШЄЩЉ Ш·ЩЉШЁШ© Ш¬ШЇШ§Щ‹",fa:"Ш®Ш§Щ†Щ€Ш§ШЇЩ‡вЂЊШ§Щ… Ш®ЫЊЩ„ЫЊ Щ…Щ‡Ш±ШЁЩ€Щ†Щ†",zh:"ж€‘е®¶дєєеѕ€е–„и‰Ї",es:"Mi familia es muy amable",de:"Meine Familie ist sehr nett"},answer:"мљ°л¦¬ к°ЂмЎ±мќЂ м •л§ђ м№њм €н•ґмљ”",words:["мљ°л¦¬","к°ЂмЎ±мќЂ","м •л§ђ","м№њм €н•ґмљ”","л‚л№ мљ”","мћ‘м•„мљ”"]},
        {type:"fill",sentence:"м ЂлЉ” ___ к°Ђ н•њ лЄ… мћ€м–ґмљ”.",blank:"н•",hint:{ru:"РЈ РјРµРЅСЏ РµСЃС‚СЊ РѕРґРёРЅ СЃС‚Р°СЂС€РёР№ Р±СЂР°С‚.",en:"I have one older brother.",uz:"Mening bitta katta akam bor.",tr:"Bir bГјyГјk erkek kardeЕџim var.",ar:"Ш№Щ†ШЇЩЉ ШЈШ® ШЈЩѓШЁШ± Щ€Ш§Ш­ШЇ.",fa:"ЫЊЩ‡ ШЇШ§ШЇШ§Шґ ШЁШІШ±ЪЇШЄШ± ШЇШ§Ш±Щ….",zh:"ж€‘жњ‰дёЂдёЄе“Ґе“ҐгЂ‚",es:"Tengo un hermano mayor.",de:"Ich habe einen Г¤lteren Bruder."},options:["н•","м–ёл‹€","лЏ™мѓќ","м№њкµ¬"]},
      ]},
    { id:5, emoji:"рџЌљ", titles:{ru:"РљРѕСЂРµР№СЃРєР°СЏ РµРґР°",en:"Korean Food",uz:"Koreya ovqati",tr:"Kore yemeДџi",ar:"Ш§Щ„Ш·Ш№Ш§Щ… Ш§Щ„ЩѓЩ€Ш±ЩЉ",fa:"ШєШ°Ш§ЫЊ Ъ©Ш±Щ‡вЂЊШ§ЫЊ",zh:"йџ©е›ЅйЈџз‰©",es:"Comida coreana",de:"Koreanisches Essen"},
      exercises:[
        {type:"choose",targetWord:"л№„л№”л°Ґ",translations:{ru:"РџРёР±РёРјРїР°Р± (СЂРёСЃ СЃ РѕРІРѕС‰Р°РјРё)",en:"Mixed rice bowl",uz:"Aralash guruch taomi",tr:"KarД±ЕџД±k pirinГ§ yemeДџi",ar:"ШЈШ±ШІ Щ…Ш®Щ„Щ€Ш·",fa:"ШЁШ±Щ†Ш¬ Щ…Ш®Щ„Щ€Ш·",zh:"ж‹ЊйҐ­",es:"Arroz mezclado",de:"Gemischter Reis"},distractors:{ru:["РЎСѓРї","Р›Р°РїС€Р°","Р‘Р°СЂР±РµРєСЋ"],en:["Soup","Noodles","BBQ"],uz:["Sho'rva","Noodle","Barbekyu"],tr:["Г‡orba","Noodle","BarbekГј"],ar:["ШґЩ€Ш±ШЁШ©","Щ†Щ€ШЇЩ„ШІ","ШґЩ€Ш§ШЎ"],fa:["ШіЩ€Щѕ","Щ†Щ€ШЇЩ„","ШЁШ§Ш±ШЁЫЊЪ©ЫЊЩ€"],zh:["ж±¤","йќўжќЎ","зѓ§зѓ¤"],es:["Sopa","Fideos","Barbacoa"],de:["Suppe","Nudeln","Barbecue"]}},
        {type:"translate",source:{ru:"Р­С‚Рѕ РѕС‡РµРЅСЊ РѕСЃС‚СЂРѕРµ!",en:"This is very spicy!",uz:"Bu juda achchiq!",tr:"Bu Г§ok baharatlД±!",ar:"Щ‡Ш°Ш§ Ш­Ш§Ш± Ш¬ШЇШ§Щ‹!",fa:"Ш§ЫЊЩ† Ш®ЫЊЩ„ЫЊ ШЄЩ†ШЇЩ‡!",zh:"иї™йќћеёёиѕЈпјЃ",es:"ВЎEsto estГЎ muy picante!",de:"Das ist sehr scharf!"},answer:"мќґк±° м •л§ђ л§¤м›Њмљ”",accept:["мќґк±° м •л§ђ л§¤м›Њмљ”","мќґкІѓмќЂ л§¤мљ° л§µмЉµл‹€л‹¤"]},
        {type:"fill",sentence:"м‚јкІ№м‚ґ ___ мќёл¶„ мЈјм„ёмљ”.",blank:"мќґ",hint:{ru:"Р”Р°Р№С‚Рµ, РїРѕР¶Р°Р»СѓР№СЃС‚Р°, СЃР°РјРіС‘РїСЃР°Р»СЊ РЅР° РґРІРѕРёС….",en:"Two servings of samgyeopsal please.",uz:"Ikki porsiya samgyeopsal bering.",tr:"Д°ki porsiyon samgyeopsal lГјtfen.",ar:"Ш·ШЁЩ‚ЩЉЩ† Щ…Щ† Ш§Щ„ШіШ§Щ…ШєЩЉЩ€ШЁШіШ§Щ„ Щ…Щ† ЩЃШ¶Щ„Щѓ.",fa:"ШЇЩ€ ЩѕШ±Ші ШіШ§Щ…ЪЇЫЊЩ€ЩѕШіШ§Щ„ Щ„Ш·ЩЃШ§Щ‹.",zh:"иЇ·жќҐдё¤д»Ѕдє”иЉ±и‚‰гЂ‚",es:"Dos porciones de samgyeopsal por favor.",de:"Zwei Portionen Samgyeopsal bitte."},options:["мќґ","м‚ј","м‚¬","м¤"]},
      ]},
    { id:6, emoji:"рџљ‡", titles:{ru:"РўСЂР°РЅСЃРїРѕСЂС‚",en:"Transport",uz:"Transport",tr:"UlaЕџД±m",ar:"Ш§Щ„Щ…Щ€Ш§ШµЩ„Ш§ШЄ",fa:"Ш­Щ…Щ„вЂЊЩ€Щ†Щ‚Щ„",zh:"дє¤йЂљ",es:"Transporte",de:"Transport"},
      exercises:[
        {type:"choose",targetWord:"м§Ђн•мІ ",translations:{ru:"РњРµС‚СЂРѕ",en:"Subway",uz:"Metro",tr:"Metro",ar:"Щ…ШЄШ±Щ€",fa:"Щ…ШЄШ±Щ€",zh:"ењ°й“Ѓ",es:"Metro",de:"U-Bahn"},distractors:{ru:["РђРІС‚РѕР±СѓСЃ","РўР°РєСЃРё","РџРѕРµР·Рґ"],en:["Bus","Taxi","Train"],uz:["Avtobus","Taksi","Poyezd"],tr:["OtobГјs","Taksi","Tren"],ar:["Ш­Ш§ЩЃЩ„Ш©","ШЄШ§ЩѓШіЩЉ","Щ‚Ш·Ш§Ш±"],fa:["Ш§ШЄЩ€ШЁЩ€Ші","ШЄШ§Ъ©ШіЫЊ","Щ‚Ш·Ш§Ш±"],zh:["е…¬дє¤","е‡єз§џиЅ¦","зЃ«иЅ¦"],es:["AutobГєs","Taxi","Tren"],de:["Bus","Taxi","Zug"]}},
        {type:"arrange",sentence:{ru:"РќР° РјРµС‚СЂРѕ Р±С‹СЃС‚СЂРµРµ",en:"The subway is faster",uz:"Metro tezroq",tr:"Metro daha hД±zlД±",ar:"Ш§Щ„Щ…ШЄШ±Щ€ ШЈШіШ±Ш№",fa:"Щ…ШЄШ±Щ€ ШіШ±ЫЊШ№вЂЊШЄШ±Щ‡",zh:"еќђењ°й“Ѓж›ґеї«",es:"El metro es mГЎs rГЎpido",de:"Die U-Bahn ist schneller"},answer:"м§Ђн•мІ мќґ лЌ” л№Ёлќјмљ”",words:["м§Ђн•мІ мќґ","лЌ”","л№Ёлќјмљ”","лЉђл ¤мљ”","лІ„мЉ¤к°Ђ","нѓќм‹њк°Ђ"]},
        {type:"fill",sentence:"л‹¤мќЊ ___ мќЂ м–ґл””м„њ нѓЂмљ”?",blank:"лІ„мЉ¤",hint:{ru:"Р“РґРµ СЃР°РґРёС‚СЊСЃСЏ РЅР° СЃР»РµРґСѓСЋС‰РёР№ Р°РІС‚РѕР±СѓСЃ?",en:"Where do I take the next bus?",uz:"Keyingi avtobuska qayerda chiqaman?",tr:"Bir sonraki otobГјse nereden binerim?",ar:"ШЈЩЉЩ† ШЈШ±ЩѓШЁ Ш§Щ„Ш­Ш§ЩЃЩ„Ш© Ш§Щ„Щ‚Ш§ШЇЩ…Ш©Шџ",fa:"Ш§ШЄЩ€ШЁЩ€Ші ШЁШ№ШЇЫЊ Ш±Щ€ Ш§ШІ Ъ©Ш¬Ш§ ШіЩ€Ш§Ш± ШЁШґЩ…Шџ",zh:"ењЁе“Єй‡Њд№дё‹дёЂзЏ­е…¬дє¤иЅ¦пјџ",es:"ВїDГіnde tomo el prГіximo autobГєs?",de:"Wo steige ich in den nГ¤chsten Bus ein?"},options:["лІ„мЉ¤","м§Ђн•мІ ","кё°м°Ё","л№„н–‰кё°"]},
      ]},
  ],

  "ko-intermediate": [
    { id:1, emoji:"рџ’ј", titles:{ru:"Р Р°Р±РѕС‚Р°",en:"Work",uz:"Ish",tr:"Д°Еџ",ar:"Ш§Щ„Ш№Щ…Щ„",fa:"Ъ©Ш§Ш±",zh:"е·ҐдЅњ",es:"Trabajo",de:"Arbeit"},
      exercises:[
        {type:"choose",targetWord:"нљЊмќ",translations:{ru:"РЎРѕРІРµС‰Р°РЅРёРµ",en:"Meeting",uz:"Yig'ilish",tr:"ToplantД±",ar:"Ш§Ш¬ШЄЩ…Ш§Ш№",fa:"Ш¬Щ„ШіЩ‡",zh:"дјљи®®",es:"ReuniГіn",de:"Besprechung"},distractors:{ru:["РћР±РµРґ","РџРµСЂРµСЂС‹РІ","РћС‚С‡С‘С‚"],en:["Lunch","Break","Report"],uz:["Tushlik","Tanaffus","Hisobot"],tr:["Г–Дџle","Mola","Rapor"],ar:["ШєШЇШ§ШЎ","Ш§ШіШЄШ±Ш§Ш­Ш©","ШЄЩ‚Ш±ЩЉШ±"],fa:["Щ†Ш§Щ‡Ш§Ш±","Ш§ШіШЄШ±Ш§Ш­ШЄ","ЪЇШІШ§Ш±Шґ"],zh:["еЌ€й¤ђ","дј‘жЃЇ","жЉҐе‘Љ"],es:["Almuerzo","Descanso","Informe"],de:["Mittagessen","Pause","Bericht"]}},
        {type:"translate",source:{ru:"РљРѕРіРґР° Сѓ РЅР°СЃ СЃР»РµРґСѓСЋС‰Р°СЏ РІСЃС‚СЂРµС‡Р°?",en:"When is our next meeting?",uz:"Keyingi yig'ilishimiz qachon?",tr:"Bir sonraki toplantД±mД±z ne zaman?",ar:"Щ…ШЄЩ‰ Ш§Ш¬ШЄЩ…Ш§Ш№Щ†Ш§ Ш§Щ„Щ‚Ш§ШЇЩ…Шџ",fa:"Ш¬Щ„ШіЩ‡ ШЁШ№ШЇЫЊЩ…Щ€Щ† Ъ©ЩђЫЊЩ‡Шџ",zh:"ж€‘д»¬дё‹ж¬Ўдјљи®®жЇд»Ђд№€ж—¶еЂ™пјџ",es:"ВїCuГЎndo es nuestra prГіxima reuniГіn?",de:"Wann ist unser nГ¤chstes Meeting?"},answer:"л‹¤мќЊ нљЊмќк°Ђ м–ём њм€мљ”",accept:["л‹¤мќЊ нљЊмќк°Ђ м–ём њм€мљ”","л‹¤мќЊ лЇёнЊ…мќґ м–ём њм€мљ”"]},
        {type:"fill",sentence:"мќґ ___ мќ л§€к°ђмќјмќЂ кё€мљ”мќјмќґм—ђмљ”.",blank:"н”„лЎњм ќнЉё",hint:{ru:"Р”РµРґР»Р°Р№РЅ СЌС‚РѕРіРѕ РїСЂРѕРµРєС‚Р° вЂ” РїСЏС‚РЅРёС†Р°.",en:"The deadline for this project is Friday.",uz:"Bu loyihaning muddati juma.",tr:"Bu projenin son tarihi Cuma.",ar:"Ш§Щ„Щ…Щ€Ш№ШЇ Ш§Щ„Щ†Щ‡Ш§Ш¦ЩЉ Щ„Щ‡Ш°Ш§ Ш§Щ„Щ…ШґШ±Щ€Ш№ Щ‡Щ€ Ш§Щ„Ш¬Щ…Ш№Ш©.",fa:"ШЇШЇЩ„Ш§ЫЊЩ† Ш§ЫЊЩ† ЩѕШ±Щ€ЪЩ‡ Ш¬Щ…Ш№Щ‡вЂЊШіШЄ.",zh:"иї™дёЄйЎ№з›®зљ„ж€Єж­ўж—ҐжњџжЇе‘Ёдє”гЂ‚",es:"El plazo de este proyecto es el viernes.",de:"Die Frist fГјr dieses Projekt ist Freitag."},options:["н”„лЎњм ќнЉё","нљЊмќ","ліґкі м„њ","кі„нљЌ"]},
        {type:"arrange",sentence:{ru:"РЇ СЂР°Р±РѕС‚Р°СЋ РІ СЌС‚РѕР№ РєРѕРјРїР°РЅРёРё С‚СЂРё РіРѕРґР°",en:"I have worked at this company for three years",uz:"Men bu kompaniyada uch yildan beri ishlayman",tr:"Bu Еџirkette ГјГ§ yД±ldД±r Г§alД±ЕџД±yorum",ar:"ШЈШ№Щ…Щ„ ЩЃЩЉ Щ‡Ш°Щ‡ Ш§Щ„ШґШ±ЩѓШ© Щ…Щ†Ш° Ш«Щ„Ш§Ш« ШіЩ†Щ€Ш§ШЄ",fa:"ШіЩ‡ ШіШ§Щ„Щ‡ ШЄЩ€ЫЊ Ш§ЫЊЩ† ШґШ±Ъ©ШЄ Ъ©Ш§Ш± Щ…ЫЊвЂЊЪ©Щ†Щ…",zh:"ж€‘ењЁиї™е®¶е…¬еЏёе·ҐдЅњдє†дё‰е№ґ",es:"Llevo tres aГ±os trabajando en esta empresa",de:"Ich arbeite seit drei Jahren in diesem Unternehmen"},answer:"м ЂлЉ” мќґ нљЊм‚¬м—ђм„њ 3л…„м§ё мќјн•кі  мћ€м–ґмљ”",words:["м ЂлЉ”","мќґ","нљЊм‚¬м—ђм„њ","3л…„м§ё","мќјн•кі ","мћ€м–ґмљ”","мћ€м—€м–ґмљ”"]},
      ]},
  ],

  // в•ђв•ђ ARABIC more lessons в•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђ
  "ar-beginner-extra": [
    { id:4, emoji:"рџ‘ЁвЂЌрџ‘©вЂЌрџ‘§", titles:{ru:"РЎРµРјСЊСЏ",en:"Family",uz:"Oila",tr:"Aile",ar:"Ш§Щ„Ш№Ш§Ш¦Щ„Ш©",fa:"Ш®Ш§Щ†Щ€Ш§ШЇЩ‡",zh:"е®¶еє­",es:"Familia",de:"Familie"},
      exercises:[
        {type:"choose",targetWord:"ШЈЩ…",translations:{ru:"РњР°РјР°",en:"Mother",uz:"Ona",tr:"Anne",ar:"Щ€Ш§Щ„ШЇШ©",fa:"Щ…Ш§ШЇШ±",zh:"е¦€е¦€",es:"Madre",de:"Mutter"},distractors:{ru:["РџР°РїР°","Р‘СЂР°С‚","РЎРµСЃС‚СЂР°"],en:["Father","Brother","Sister"],uz:["Ota","Aka","Singil"],tr:["Baba","Erkek kardeЕџ","KД±z kardeЕџ"],ar:["ШЈШЁ","ШЈШ®","ШЈШ®ШЄ"],fa:["ЩѕШЇШ±","ШЁШ±Ш§ШЇШ±","Ш®Щ€Ш§Щ‡Ш±"],zh:["з€ёз€ё","е…„ејџ","е§ђе¦№"],es:["Padre","Hermano","Hermana"],de:["Vater","Bruder","Schwester"]}},
        {type:"translate",source:{ru:"РњРѕСЏ СЃРµРјСЊСЏ Р¶РёРІС‘С‚ РІ РўР°С€РєРµРЅС‚Рµ.",en:"My family lives in Tashkent.",uz:"Oilam Toshkentda yashaydi.",tr:"Ailem TaЕџkent'te yaЕџД±yor.",ar:"Ш№Ш§Ш¦Щ„ШЄЩЉ ШЄШ№ЩЉШґ ЩЃЩЉ Ш·ШґЩ‚Щ†ШЇ.",fa:"Ш®Ш§Щ†Щ€Ш§ШЇЩ‡вЂЊШ§Щ… ШЄЩ€ЫЊ ШЄШ§ШґЪ©Щ†ШЇ ШІЩ†ШЇЪЇЫЊ Щ…ЫЊвЂЊЪ©Щ†Щ†ШЇ.",zh:"ж€‘е®¶дЅЏењЁеЎ”д»Ђе№ІгЂ‚",es:"Mi familia vive en Tashkent.",de:"Meine Familie lebt in Taschkent."},answer:"Ш№Ш§Ш¦Щ„ШЄЩЉ ШЄШ№ЩЉШґ ЩЃЩЉ Ш·ШґЩ‚Щ†ШЇ",accept:["Ш№Ш§Ш¦Щ„ШЄЩЉ ШЄШ№ЩЉШґ ЩЃЩЉ Ш·ШґЩ‚Щ†ШЇ","ШЈШіШ±ШЄЩЉ ШЄШіЩѓЩ† ЩЃЩЉ Ш·ШґЩ‚Щ†ШЇ"]},
        {type:"fill",sentence:"Ш№Щ†ШЇЩЉ ___ ШЈШ®Щ€Ш§ШЄ.",blank:"Ш«Щ„Ш§Ш«",hint:{ru:"РЈ РјРµРЅСЏ С‚СЂРё СЃРµСЃС‚СЂС‹.",en:"I have three sisters.",uz:"Mening uch singlim bor.",tr:"ГњГ§ kД±z kardeЕџim var.",ar:"Ш№Щ†ШЇЩЉ Ш«Щ„Ш§Ш« ШЈШ®Щ€Ш§ШЄ.",fa:"ШіЩ‡ ШЄШ§ Ш®Щ€Ш§Щ‡Ш± ШЇШ§Ш±Щ….",zh:"ж€‘жњ‰дё‰дёЄе§ђе¦№гЂ‚",es:"Tengo tres hermanas.",de:"Ich habe drei Schwestern."},options:["Ш«Щ„Ш§Ш«","Ш№ШґШ±","Щ€Ш§Ш­ШЇШ©","Щ…Ш¦Ш©"]},
      ]},
    { id:5, emoji:"рџ•Њ", titles:{ru:"РљСѓР»СЊС‚СѓСЂР°",en:"Culture",uz:"Madaniyat",tr:"KГјltГјr",ar:"Ш§Щ„Ш«Щ‚Ш§ЩЃШ©",fa:"ЩЃШ±Щ‡Щ†ЪЇ",zh:"ж–‡еЊ–",es:"Cultura",de:"Kultur"},
      exercises:[
        {type:"choose",targetWord:"Щ…ШіШ¬ШЇ",translations:{ru:"РњРµС‡РµС‚СЊ",en:"Mosque",uz:"Masjid",tr:"Cami",ar:"Щ…Ш№ШЁШЇ",fa:"Щ…ШіШ¬ШЇ",zh:"жё…зњџеЇє",es:"Mezquita",de:"Moschee"},distractors:{ru:["Р¦РµСЂРєРѕРІСЊ","РҐСЂР°Рј","РЎРёРЅР°РіРѕРіР°"],en:["Church","Temple","Synagogue"],uz:["Cherkov","Ibodatxona","Sinagoga"],tr:["Kilise","TapД±nak","Sinagog"],ar:["ЩѓЩ†ЩЉШіШ©","Щ…Ш№ШЁШЇ","ЩѓЩ†ЩЉШі"],fa:["Ъ©Щ„ЫЊШіШ§","Щ…Ш№ШЁШЇ","Ъ©Щ†ЫЊШіЩ‡"],zh:["ж•™е ‚","еЇєеє™","зЉ№е¤Єж•™е ‚"],es:["Iglesia","Templo","Sinagoga"],de:["Kirche","Tempel","Synagoge"]}},
        {type:"arrange",sentence:{ru:"Р Р°РјР°РґР°РЅ вЂ” СЃРІСЏС‰РµРЅРЅС‹Р№ РјРµСЃСЏС†",en:"Ramadan is the holy month",uz:"Ramazon muqaddas oy",tr:"Ramazan kutsal bir ay",ar:"Ш±Щ…Ш¶Ш§Щ† Щ‡Щ€ Ш§Щ„ШґЩ‡Ш± Ш§Щ„Щ…Щ‚ШЇШі",fa:"Ш±Щ…Ш¶Ш§Щ† Щ…Ш§Щ‡ Щ…Щ‚ШЇШіЩ‡",zh:"ж–‹жњ€жЇзҐћењЈзљ„жњ€д»Ѕ",es:"RamadГЎn es el mes sagrado",de:"Ramadan ist der heilige Monat"},answer:"Ш±Щ…Ш¶Ш§Щ† Щ‡Щ€ Ш§Щ„ШґЩ‡Ш± Ш§Щ„Щ…Щ‚ШЇШі",words:["Ш±Щ…Ш¶Ш§Щ†","Щ‡Щ€","Ш§Щ„ШґЩ‡Ш±","Ш§Щ„Щ…Щ‚ШЇШі","Ш§Щ„ЩѓШ±ЩЉЩ…","Ш§Щ„ШЈЩ€Щ„"]},
        {type:"fill",sentence:"ШЈЩ†Ш§ ___ Ш§Щ„Щ…Ш·Ш№Щ… Ш§Щ„Ш№Ш±ШЁЩЉ.",blank:"ШЈШ­ШЁ",hint:{ru:"РЇ Р»СЋР±Р»СЋ Р°СЂР°Р±СЃРєРёР№ СЂРµСЃС‚РѕСЂР°РЅ.",en:"I love the Arabic restaurant.",uz:"Men arab restoranini yaxshi ko'raman.",tr:"Arap restoranД±nД± seviyorum.",ar:"ШЈЩ†Ш§ ШЈШ­ШЁ Ш§Щ„Щ…Ш·Ш№Щ… Ш§Щ„Ш№Ш±ШЁЩЉ.",fa:"Ш±ШіШЄЩ€Ш±Ш§Щ† Ш№Ш±ШЁЫЊ ШЇЩ€ШіШЄ ШЇШ§Ш±Щ….",zh:"ж€‘е–њж¬ўйїж‹‰дјЇй¤ђеЋ…гЂ‚",es:"Me encanta el restaurante ГЎrabe.",de:"Ich liebe das arabische Restaurant."},options:["ШЈШ­ШЁ","ШЈЩѓШ±Щ‡","ШЈШІЩ€Ш±","ШЈШЄШ±Щѓ"]},
      ]},
  ],

  "ar-intermediate": [
    { id:1, emoji:"рџ’ј", titles:{ru:"Р Р°Р±РѕС‚Р°",en:"Work",uz:"Ish",tr:"Д°Еџ",ar:"Ш§Щ„Ш№Щ…Щ„",fa:"Ъ©Ш§Ш±",zh:"е·ҐдЅњ",es:"Trabajo",de:"Arbeit"},
      exercises:[
        {type:"choose",targetWord:"Ш§Ш¬ШЄЩ…Ш§Ш№",translations:{ru:"Р’СЃС‚СЂРµС‡Р°",en:"Meeting",uz:"Yig'ilish",tr:"ToplantД±",ar:"Щ„Щ‚Ш§ШЎ",fa:"Ш¬Щ„ШіЩ‡",zh:"дјљи®®",es:"ReuniГіn",de:"Treffen"},distractors:{ru:["РџРµСЂРµСЂС‹РІ","Р’РµС‡РµСЂРёРЅРєР°","РћР±РµРґ"],en:["Break","Party","Lunch"],uz:["Tanaffus","Ziyofat","Tushlik"],tr:["Mola","Parti","Г–Дџle yemeДџi"],ar:["Ш§ШіШЄШ±Ш§Ш­Ш©","Ш­ЩЃЩ„Ш©","ШєШЇШ§ШЎ"],fa:["Ш§ШіШЄШ±Ш§Ш­ШЄ","Щ…Щ‡Щ…Ш§Щ†ЫЊ","Щ†Ш§Щ‡Ш§Ш±"],zh:["дј‘жЃЇ","жґѕеЇ№","еЌ€й¤ђ"],es:["Descanso","Fiesta","Almuerzo"],de:["Pause","Party","Mittagessen"]}},
        {type:"translate",source:{ru:"РљРѕРіРґР° СЃР»РµРґСѓСЋС‰РµРµ СЃРѕРІРµС‰Р°РЅРёРµ?",en:"When is the next meeting?",uz:"Keyingi yig'ilish qachon?",tr:"Bir sonraki toplantД± ne zaman?",ar:"Щ…ШЄЩ‰ Ш§Щ„Ш§Ш¬ШЄЩ…Ш§Ш№ Ш§Щ„Щ‚Ш§ШЇЩ…Шџ",fa:"Ш¬Щ„ШіЩ‡ ШЁШ№ШЇЫЊ Ъ©ЩђЫЊЩ‡Шџ",zh:"дё‹ж¬Ўдјљи®®жЇд»Ђд№€ж—¶еЂ™пјџ",es:"ВїCuГЎndo es la prГіxima reuniГіn?",de:"Wann ist das nГ¤chste Meeting?"},answer:"Щ…ШЄЩ‰ Ш§Щ„Ш§Ш¬ШЄЩ…Ш§Ш№ Ш§Щ„Щ‚Ш§ШЇЩ…",accept:["Щ…ШЄЩ‰ Ш§Щ„Ш§Ш¬ШЄЩ…Ш§Ш№ Ш§Щ„Щ‚Ш§ШЇЩ…","Щ…ШЄЩ‰ Ш§Щ„Ш§Ш¬ШЄЩ…Ш§Ш№ Ш§Щ„ШЄШ§Щ„ЩЉ"]},
        {type:"arrange",sentence:{ru:"РњРѕР№ РєРѕР»Р»РµРіР° РѕС‡РµРЅСЊ РѕРїС‹С‚РЅС‹Р№",en:"My colleague is very experienced",uz:"Hamkashim juda tajribali",tr:"MeslektaЕџД±m Г§ok deneyimli",ar:"ШІЩ…ЩЉЩ„ЩЉ Ш°Щ€ Ш®ШЁШ±Ш© ЩѓШЁЩЉШ±Ш©",fa:"Щ‡Щ…Ъ©Ш§Ш±Щ… Ш®ЫЊЩ„ЫЊ ШЁШ§ ШЄШ¬Ш±ШЁЩ‡вЂЊШіШЄ",zh:"ж€‘зљ„еђЊдє‹еѕ€жњ‰з»ЏйЄЊ",es:"Mi colega tiene mucha experiencia",de:"Mein Kollege ist sehr erfahren"},answer:"ШІЩ…ЩЉЩ„ЩЉ Щ„ШЇЩЉЩ‡ Ш®ШЁШ±Ш© ЩѓШЁЩЉШ±Ш©",words:["ШІЩ…ЩЉЩ„ЩЉ","Щ„ШЇЩЉЩ‡","Ш®ШЁШ±Ш©","ЩѓШЁЩЉШ±Ш©","Щ‚Щ„ЩЉЩ„Ш©","Ш¬ШЇЩЉШЇ"]},
        {type:"fill",sentence:"ШЈШ­ШЄШ§Ш¬ ШҐЩ„Щ‰ ___ Ш§Щ„ШЄЩ‚Ш±ЩЉШ± Ш§Щ„ЩЉЩ€Щ….",blank:"ШҐЩ†Щ‡Ш§ШЎ",hint:{ru:"РњРЅРµ РЅСѓР¶РЅРѕ Р·Р°РєРѕРЅС‡РёС‚СЊ РѕС‚С‡С‘С‚ СЃРµРіРѕРґРЅСЏ.",en:"I need to finish the report today.",uz:"Bugun hisobotni tugatishim kerak.",tr:"BugГјn raporu bitirmem gerekiyor.",ar:"ШЈШ­ШЄШ§Ш¬ ШҐЩ„Щ‰ ШҐЩ†Щ‡Ш§ШЎ Ш§Щ„ШЄЩ‚Ш±ЩЉШ± Ш§Щ„ЩЉЩ€Щ….",fa:"ШЁШ§ЫЊШЇ Ш§Щ…Ш±Щ€ШІ ЪЇШІШ§Ш±Шґ Ш±Щ€ ШЄЩ…Щ€Щ… Ъ©Щ†Щ….",zh:"ж€‘д»Ље¤©йњЂи¦Ѓе®Њж€ђжЉҐе‘ЉгЂ‚",es:"Necesito terminar el informe hoy.",de:"Ich muss heute den Bericht fertigstellen."},options:["ШҐЩ†Щ‡Ш§ШЎ","ШЁШЇШЎ","ШЄШЈШ¬ЩЉЩ„","Ш­Ш°ЩЃ"]},
      ]},
    { id:2, emoji:"вњ€пёЏ", titles:{ru:"РџСѓС‚РµС€РµСЃС‚РІРёСЏ",en:"Travel",uz:"Sayohat",tr:"Seyahat",ar:"Ш§Щ„ШіЩЃШ±",fa:"ШіЩЃШ±",zh:"ж—…иЎЊ",es:"Viaje",de:"Reise"},
      exercises:[
        {type:"choose",targetWord:"Щ…Ш·Ш§Ш±",translations:{ru:"РђСЌСЂРѕРїРѕСЂС‚",en:"Airport",uz:"Aeroport",tr:"HavalimanД±",ar:"Щ…Ш·Ш§Ш± Ш±Ш¦ЩЉШіЩЉ",fa:"ЩЃШ±Щ€ШЇЪЇШ§Щ‡",zh:"жњєењє",es:"Aeropuerto",de:"Flughafen"},distractors:{ru:["Р’РѕРєР·Р°Р»","РџРѕСЂС‚","РђРІС‚РѕСЃС‚Р°РЅС†РёСЏ"],en:["Train station","Port","Bus station"],uz:["Vokzal","Port","AvtobekГЎt"],tr:["Tren garД±","Liman","OtobГјs terminali"],ar:["Щ…Ш­Ш·Ш© Щ‚Ш·Ш§Ш±","Щ…ЩЉЩ†Ш§ШЎ","Щ…Ш­Ш·Ш© Ш­Ш§ЩЃЩ„Ш§ШЄ"],fa:["Ш§ЫЊШіШЄЪЇШ§Щ‡ Щ‚Ш·Ш§Ш±","ШЁЩ†ШЇШ±","ЩѕШ§ЫЊШ§Щ†Щ‡ Ш§ШЄЩ€ШЁЩ€Ші"],zh:["зЃ«иЅ¦з«™","жёЇеЏЈ","ж±ЅиЅ¦з«™"],es:["EstaciГіn de tren","Puerto","Terminal"],de:["Bahnhof","Hafen","Busbahnhof"]}},
        {type:"translate",source:{ru:"РњРѕР№ СЃР°РјРѕР»С‘С‚ РІС‹Р»РµС‚Р°РµС‚ РІ С€РµСЃС‚СЊ СѓС‚СЂР°.",en:"My flight departs at six in the morning.",uz:"Mening reysim ertalab oltida jo'naydi.",tr:"UГ§uЕџum sabah altД±da kalkД±yor.",ar:"Ш±Ш­Щ„ШЄЩЉ ШЄШєШ§ШЇШ± ЩЃЩЉ Ш§Щ„ШіШ§ШЇШіШ© ШµШЁШ§Ш­Ш§Щ‹.",fa:"ЩѕШ±Щ€Ш§ШІЩ… ШіШ§Ш№ШЄ ШґШґ ШµШЁШ­ Ш­Ш±Ъ©ШЄ Щ…ЫЊвЂЊЪ©Щ†Щ‡.",zh:"ж€‘зљ„и€ЄзЏ­ж—©дёЉе…­з‚№иµ·йЈћгЂ‚",es:"Mi vuelo sale a las seis de la maГ±ana.",de:"Mein Flug startet um sechs Uhr morgens."},answer:"Ш±Ш­Щ„ШЄЩЉ ШЄШєШ§ШЇШ± ЩЃЩЉ Ш§Щ„ШіШ§ШЇШіШ© ШµШЁШ§Ш­Ш§Щ‹",accept:["Ш±Ш­Щ„ШЄЩЉ ШЄШєШ§ШЇШ± ЩЃЩЉ Ш§Щ„ШіШ§ШЇШіШ© ШµШЁШ§Ш­Ш§Щ‹","Ш·Ш§Ш¦Ш±ШЄЩЉ ШЄЩ‚Щ„Ш№ ЩЃЩЉ Ш§Щ„ШіШ§ШЇШіШ©"]},
        {type:"fill",sentence:"ШЈЩЉЩ† ___ Ш¬Щ€Ш§ШІ Ш§Щ„ШіЩЃШ±Шџ",blank:"ШЈШіШЄШ·ЩЉШ№ ШЄШ¬ШЇЩЉШЇ",hint:{ru:"Р“РґРµ СЏ РјРѕРіСѓ РѕР±РЅРѕРІРёС‚СЊ РїР°СЃРїРѕСЂС‚?",en:"Where can I renew my passport?",uz:"Pasportimni qayerda yangilasam bo'ladi?",tr:"Pasaportumu nerede yenileyebilirim?",ar:"ШЈЩЉЩ† ШЈШіШЄШ·ЩЉШ№ ШЄШ¬ШЇЩЉШЇ Ш¬Щ€Ш§ШІ Ш§Щ„ШіЩЃШ±Шџ",fa:"Ъ©Ш¬Ш§ Щ…ЫЊвЂЊШЄЩ€Щ†Щ… ЩѕШ§ШіЩѕЩ€Ш±ШЄЩ… Ш±Щ€ ШЄЩ…ШЇЫЊШЇ Ъ©Щ†Щ…Шџ",zh:"ењЁе“Єй‡ЊеЏЇд»Ґж›ґж–°жЉ¤з…§пјџ",es:"ВїDГіnde puedo renovar mi pasaporte?",de:"Wo kann ich meinen Reisepass erneuern?"},options:["ШЈШіШЄШ·ЩЉШ№ ШЄШ¬ШЇЩЉШЇ","ЩЉЩ…ЩѓЩ† ШґШ±Ш§ШЎ","ШЈШ±ЩЉШЇ ШЁЩЉШ№","ШЈШ­ШЄШ§Ш¬ ЩѓШіШ±"]},
      ]},
  ],

  // в•ђв•ђ FARSI more lessons в•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђ
  "fa-beginner-extra": [
    { id:4, emoji:"рџ‘ЁвЂЌрџ‘©вЂЌрџ‘§", titles:{ru:"РЎРµРјСЊСЏ",en:"Family",uz:"Oila",tr:"Aile",ar:"Ш§Щ„Ш№Ш§Ш¦Щ„Ш©",fa:"Ш®Ш§Щ†Щ€Ш§ШЇЩ‡",zh:"е®¶еє­",es:"Familia",de:"Familie"},
      exercises:[
        {type:"choose",targetWord:"Щ…Ш§ШЇШ±",translations:{ru:"РњР°РјР°",en:"Mother",uz:"Ona",tr:"Anne",ar:"ШЈЩ…",fa:"Щ…Ш§Щ…Ш§Щ†",zh:"е¦€е¦€",es:"Madre",de:"Mutter"},distractors:{ru:["РџР°РїР°","Р‘СЂР°С‚","РЎРµСЃС‚СЂР°"],en:["Father","Brother","Sister"],uz:["Ota","Aka","Singil"],tr:["Baba","Erkek kardeЕџ","KД±z kardeЕџ"],ar:["ШЈШЁ","ШЈШ®","ШЈШ®ШЄ"],fa:["ЩѕШЇШ±","ШЁШ±Ш§ШЇШ±","Ш®Щ€Ш§Щ‡Ш±"],zh:["з€ёз€ё","е…„ејџ","е§ђе¦№"],es:["Padre","Hermano","Hermana"],de:["Vater","Bruder","Schwester"]}},
        {type:"arrange",sentence:{ru:"РњРѕСЏ РјР°РјР° РіРѕС‚РѕРІРёС‚ РѕС‡РµРЅСЊ РІРєСѓСЃРЅРѕ",en:"My mom cooks very well",uz:"Onam juda yaxshi taom pishiradi",tr:"Annem Г§ok gГјzel yemek yapar",ar:"ШЈЩ…ЩЉ ШЄШ·ШЁШ® ШЁШґЩѓЩ„ Ш±Ш§Ш¦Ш№",fa:"Щ…Ш§Щ…Ш§Щ†Щ… Ш®ЫЊЩ„ЫЊ Ш®Щ€ШЁ ШўШґЩѕШІЫЊ Щ…ЫЊвЂЊЪ©Щ†Щ‡",zh:"ж€‘е¦€е¦€еЃљйҐ­еѕ€еҐЅеђѓ",es:"Mi mamГЎ cocina muy bien",de:"Meine Mutter kocht sehr gut"},answer:"Щ…Ш§Щ…Ш§Щ†Щ… Ш®ЫЊЩ„ЫЊ Ш®Щ€ШЁ ШўШґЩѕШІЫЊ Щ…ЫЊвЂЊЪ©Щ†Щ‡",words:["Щ…Ш§Щ…Ш§Щ†Щ…","Ш®ЫЊЩ„ЫЊ","Ш®Щ€ШЁ","ШўШґЩѕШІЫЊ","Щ…ЫЊвЂЊЪ©Щ†Щ‡","ШЁШЇЩ…","Щ†Щ…ЫЊвЂЊЪ©Щ†Щ‡"]},
        {type:"fill",sentence:"ШЇЩ€ ШЄШ§ ___ ШЇШ§Ш±Щ….",blank:"Ш®Щ€Ш§Щ‡Ш±",hint:{ru:"РЈ РјРµРЅСЏ РґРІРµ СЃРµСЃС‚СЂС‹.",en:"I have two sisters.",uz:"Ikki singlim bor.",tr:"Д°ki kД±z kardeЕџim var.",ar:"Ш№Щ†ШЇЩЉ ШЈШ®ШЄШ§Щ†.",fa:"ШЇЩ€ ШЄШ§ Ш®Щ€Ш§Щ‡Ш± ШЇШ§Ш±Щ….",zh:"ж€‘жњ‰дё¤дёЄе§ђе¦№гЂ‚",es:"Tengo dos hermanas.",de:"Ich habe zwei Schwestern."},options:["Ш®Щ€Ш§Щ‡Ш±","ШЁШ±Ш§ШЇШ±","ШЇЩ€ШіШЄ","Щ‡Щ…Ъ©Ш§Ш±"]},
        {type:"translate",source:{ru:"РџР°РїР° СЂР°Р±РѕС‚Р°РµС‚ РёРЅР¶РµРЅРµСЂРѕРј.",en:"Dad works as an engineer.",uz:"Dada muhandis bo'lib ishlaydi.",tr:"Babam mГјhendis olarak Г§alД±ЕџД±yor.",ar:"ШЈШЁЩЉ ЩЉШ№Щ…Щ„ Щ…Щ‡Щ†ШЇШіШ§Щ‹.",fa:"ШЁШ§ШЁШ§Щ… Щ…Щ‡Щ†ШЇШіЩ‡.",zh:"з€ёз€ёжЇе·ҐзЁ‹её€гЂ‚",es:"PapГЎ trabaja como ingeniero.",de:"Papa arbeitet als Ingenieur."},answer:"ШЁШ§ШЁШ§Щ… Щ…Щ‡Щ†ШЇШіЩ‡",accept:["ШЁШ§ШЁШ§Щ… Щ…Щ‡Щ†ШЇШіЩ‡","ЩѕШЇШ±Щ… Щ…Щ‡Щ†ШЇШі Ш§ШіШЄ"]},
      ]},
    { id:5, emoji:"рџЌЅпёЏ", titles:{ru:"РСЂР°РЅСЃРєР°СЏ РєСѓС…РЅСЏ",en:"Iranian Food",uz:"Eron oshxonasi",tr:"Д°ran mutfaДџД±",ar:"Ш§Щ„Щ…Ш·ШЁШ® Ш§Щ„ШҐЩЉШ±Ш§Щ†ЩЉ",fa:"ШєШ°Ш§ЫЊ Ш§ЫЊШ±Ш§Щ†ЫЊ",zh:"дјЉжњ—йЈџз‰©",es:"Comida iranГ­",de:"Iranisches Essen"},
      exercises:[
        {type:"choose",targetWord:"Ъ†Щ„Щ€ Ъ©ШЁШ§ШЁ",translations:{ru:"Р§РµР»Рѕ-РєРµР±Р°Р± (СЂРёСЃ СЃ РєРµР±Р°Р±РѕРј)",en:"Rice with kebab",uz:"Guruch va kabob",tr:"PilavlД± kebap",ar:"ШЈШ±ШІ Щ…Ш№ Ш§Щ„ЩѓШЁШ§ШЁ",fa:"Ъ©ШЁШ§ШЁ ШЁШ§ ШЁШ±Щ†Ш¬",zh:"з±ійҐ­й…Ќзѓ¤и‚‰",es:"Arroz con kebab",de:"Reis mit Kebab"},distractors:{ru:["РЎСѓРї","РЎР°Р»Р°С‚","РџР»РѕРІ"],en:["Soup","Salad","Pilaf"],uz:["Sho'rva","Salat","Palov"],tr:["Г‡orba","Salata","Pilav"],ar:["ШґЩ€Ш±ШЁШ©","ШіЩ„Ш·Ш©","Ш±ШІ"],fa:["ШіЩ€Щѕ","ШіШ§Щ„Ш§ШЇ","ЩѕЩ„Щ€"],zh:["ж±¤","жІ™ж‹‰","жЉ“йҐ­"],es:["Sopa","Ensalada","Arroz"],de:["Suppe","Salat","Pilaw"]}},
        {type:"translate",source:{ru:"Р­С‚Рѕ РѕС‡РµРЅСЊ РІРєСѓСЃРЅРѕ, РїСЂРёСЏС‚РЅРѕРіРѕ Р°РїРїРµС‚РёС‚Р°!",en:"This is delicious, enjoy your meal!",uz:"Bu juda mazali, xo'sh ishtaha!",tr:"Bu Г§ok lezzetli, afiyet olsun!",ar:"Щ‡Ш°Ш§ Щ„Ш°ЩЉШ°ШЊ ШЁШ§Щ„Щ‡Щ†Ш§ШЎ Щ€Ш§Щ„ШґЩЃШ§ШЎ!",fa:"Щ†Щ€Шґ Ш¬Ш§Щ†!",zh:"иї™еѕ€зѕЋе‘іпјЊиЇ·ж…ўз”ЁпјЃ",es:"ВЎEsto estГЎ delicioso, buen provecho!",de:"Das ist kГ¶stlich, guten Appetit!"},answer:"Щ†Щ€Шґ Ш¬Ш§Щ†",accept:["Щ†Щ€Шґ Ш¬Ш§Щ†","Щ…ЫЊЩ„ Ъ©Щ†ЫЊШЇ"]},
        {type:"fill",sentence:"ЫЊЩ‡ ___ Ъ†Ш§ЫЊ Щ…ЫЊвЂЊШ®Щ€Ш§ЫЊШџ",blank:"ЩЃЩ†Ш¬Щ€Щ†",hint:{ru:"РҐРѕС‡РµС€СЊ С‡Р°С€РєСѓ С‡Р°СЏ?",en:"Do you want a cup of tea?",uz:"Bir piyola choy xohlaysanmi?",tr:"Bir fincan Г§ay ister misin?",ar:"Щ‡Щ„ ШЄШ±ЩЉШЇ ЩЃЩ†Ш¬Ш§Щ†Ш§Щ‹ Щ…Щ† Ш§Щ„ШґШ§ЩЉШџ",fa:"ЫЊЩ‡ ЩЃЩ†Ш¬Щ€Щ† Ъ†Ш§ЫЊ Щ…ЫЊвЂЊШ®Щ€Ш§ЫЊШџ",zh:"дЅ и¦ЃдёЂжќЇиЊ¶еђ—пјџ",es:"ВїQuieres una taza de tГ©?",de:"MГ¶chtest du eine Tasse Tee?"},options:["ЩЃЩ†Ш¬Щ€Щ†","ШЁШ·Ш±ЫЊ","Щ„ЫЊЩ€Ш§Щ†","Ъ©ЫЊЩ„Щ€"]},
      ]},
  ],

  // в•ђв•ђ UZBEK more lessons в•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђ
  "uz-beginner-extra": [
    { id:4, emoji:"рџ‘ЁвЂЌрџ‘©вЂЌрџ‘§", titles:{ru:"РЎРµРјСЊСЏ",en:"Family",uz:"Oila",tr:"Aile",ar:"Ш§Щ„Ш№Ш§Ш¦Щ„Ш©",fa:"Ш®Ш§Щ†Щ€Ш§ШЇЩ‡",zh:"е®¶еє­",es:"Familia",de:"Familie"},
      exercises:[
        {type:"choose",targetWord:"Ona",translations:{ru:"РњР°РјР°",en:"Mother",uz:"Onajon",tr:"Anne",ar:"ШЈЩ…",fa:"Щ…Ш§ШЇШ±",zh:"е¦€е¦€",es:"Madre",de:"Mutter"},distractors:{ru:["РџР°РїР°","Р‘СЂР°С‚","РЎРµСЃС‚СЂР°"],en:["Father","Brother","Sister"],uz:["Ota","Aka","Singil"],tr:["Baba","Erkek kardeЕџ","KД±z kardeЕџ"],ar:["ШЈШЁ","ШЈШ®","ШЈШ®ШЄ"],fa:["ЩѕШЇШ±","ШЁШ±Ш§ШЇШ±","Ш®Щ€Ш§Щ‡Ш±"],zh:["з€ёз€ё","е…„ејџ","е§ђе¦№"],es:["Padre","Hermano","Hermana"],de:["Vater","Bruder","Schwester"]}},
        {type:"arrange",sentence:{ru:"РњРѕСЏ СЃРµРјСЊСЏ Р¶РёРІС‘С‚ РІ РўР°С€РєРµРЅС‚Рµ",en:"My family lives in Tashkent",uz:"Oilam Toshkentda yashaydi",tr:"Ailem TaЕџkent'te yaЕџД±yor",ar:"Ш№Ш§Ш¦Щ„ШЄЩЉ ШЄШ№ЩЉШґ ЩЃЩЉ Ш·ШґЩ‚Щ†ШЇ",fa:"Ш®Ш§Щ†Щ€Ш§ШЇЩ‡вЂЊШ§Щ… ШЄЩ€ЫЊ ШЄШ§ШґЪ©Щ†ШЇ ШІЩ†ШЇЪЇЫЊ Щ…ЫЊвЂЊЪ©Щ†Щ†ШЇ",zh:"ж€‘е®¶дЅЏењЁеЎ”д»Ђе№І",es:"Mi familia vive en Tashkent",de:"Meine Familie lebt in Taschkent"},answer:"Oilam Toshkentda yashaydi",words:["Oilam","Toshkentda","yashaydi","Samarqandda","ishlaydi","o'qiydi"]},
        {type:"fill",sentence:"Mening ___ ikkita bor.",blank:"singlim",hint:{ru:"РЈ РјРµРЅСЏ РґРІРµ РјР»Р°РґС€РёРµ СЃРµСЃС‚СЂС‹.",en:"I have two younger sisters.",uz:"Mening ikkita singlim bor.",tr:"Д°ki kГјГ§Гјk kД±z kardeЕџim var.",ar:"Ш№Щ†ШЇЩЉ ШЈШ®ШЄШ§Щ† ШЈШµШєШ± Щ…Щ†ЩЉ.",fa:"ШЇЩ€ ШЄШ§ Ш®Щ€Ш§Щ‡Ш± Ъ©Щ€Ъ†Ъ©ШЄШ± ШЇШ§Ш±Щ….",zh:"ж€‘жњ‰дё¤дёЄе¦№е¦№гЂ‚",es:"Tengo dos hermanas menores.",de:"Ich habe zwei jГјngere Schwestern."},options:["singlim","akam","ukam","doК»stim"]},
        {type:"translate",source:{ru:"РџР°РїР° вЂ” РІСЂР°С‡, РјР°РјР° вЂ” СѓС‡РёС‚РµР»СЊ.",en:"Dad is a doctor, mom is a teacher.",uz:"Dada shifokor, onam o'qituvchi.",tr:"Babam doktor, annem Г¶Дџretmen.",ar:"ШЈШЁЩЉ Ш·ШЁЩЉШЁ Щ€ШЈЩ…ЩЉ Щ…Ш№Щ„Щ…Ш©.",fa:"ШЁШ§ШЁШ§Щ… ШЇЪ©ШЄШ±Щ‡ШЊ Щ…Ш§Щ…Ш§Щ†Щ… Щ…Ш№Щ„Щ…Щ‡.",zh:"з€ёз€ёжЇеЊ»з”џпјЊе¦€е¦€жЇиЂЃеё€гЂ‚",es:"PapГЎ es mГ©dico, mamГЎ es profesora.",de:"Papa ist Arzt, Mama ist Lehrerin."},answer:"dada shifokor onam o'qituvchi",accept:["dada shifokor, onam o'qituvchi","otam shifokor, onam o'qituvchi"]},
      ]},
    { id:5, emoji:"рџЏ™пёЏ", titles:{ru:"РўР°С€РєРµРЅС‚",en:"Tashkent",uz:"Toshkent",tr:"TaЕџkent",ar:"Ш·ШґЩ‚Щ†ШЇ",fa:"ШЄШ§ШґЪ©Щ†ШЇ",zh:"еЎ”д»Ђе№І",es:"Tashkent",de:"Taschkent"},
      exercises:[
        {type:"choose",targetWord:"Chorsu",translations:{ru:"Р§РѕСЂСЃСѓ (СЂС‹РЅРѕРє)",en:"Chorsu market",uz:"Bozor",tr:"Г‡orsu PazarД±",ar:"ШіЩ€Щ‚ ШЄШґЩ€Ш±ШіЩ€",fa:"ШЁШ§ШІШ§Ш± Ъ†Ш±ШіЩ€",zh:"д№”е°”и‹Џеё‚ењє",es:"Mercado Chorsu",de:"Chorsu-Markt"},distractors:{ru:["РњРµС‚СЂРѕ","РџР°СЂРє","РЈРЅРёРІРµСЂСЃРёС‚РµС‚"],en:["Metro","Park","University"],uz:["Metro","Park","Universitet"],tr:["Metro","Park","Гњniversite"],ar:["Щ…ШЄШ±Щ€","Ш­ШЇЩЉЩ‚Ш©","Ш¬Ш§Щ…Ш№Ш©"],fa:["Щ…ШЄШ±Щ€","ЩѕШ§Ш±Ъ©","ШЇШ§Щ†ШґЪЇШ§Щ‡"],zh:["ењ°й“Ѓ","е…¬е›­","е¤§е­¦"],es:["Metro","Parque","Universidad"],de:["Metro","Park","UniversitГ¤t"]}},
        {type:"arrange",sentence:{ru:"РўР°С€РєРµРЅС‚ вЂ” РєСЂР°СЃРёРІС‹Р№ СЃРѕРІСЂРµРјРµРЅРЅС‹Р№ РіРѕСЂРѕРґ",en:"Tashkent is a beautiful modern city",uz:"Toshkent chiroyli zamonaviy shahar",tr:"TaЕџkent gГјzel modern bir Еџehir",ar:"Ш·ШґЩ‚Щ†ШЇ Щ…ШЇЩЉЩ†Ш© Ш¬Щ…ЩЉЩ„Ш© Щ€Ш­ШЇЩЉШ«Ш©",fa:"ШЄШ§ШґЪ©Щ†ШЇ ЫЊЩ‡ ШґЩ‡Ш± ШІЫЊШЁШ§ Щ€ Щ…ШЇШ±Щ†Щ‡",zh:"еЎ”д»Ђе№ІжЇдёЂдёЄзѕЋдёЅзљ„зЋ°д»ЈеџЋеё‚",es:"Tashkent es una hermosa ciudad moderna",de:"Taschkent ist eine schГ¶ne moderne Stadt"},answer:"Toshkent chiroyli zamonaviy shahar",words:["Toshkent","chiroyli","zamonaviy","shahar","katta","eski"]},
        {type:"fill",sentence:"Toshkentda ___ million kishi yashaydi.",blank:"ikki",hint:{ru:"Р’ РўР°С€РєРµРЅС‚Рµ Р¶РёРІС‘С‚ РґРІР° РјРёР»Р»РёРѕРЅР° С‡РµР»РѕРІРµРє.",en:"Two million people live in Tashkent.",uz:"Toshkentda ikki million kishi yashaydi.",tr:"TaЕџkent'te iki milyon kiЕџi yaЕџД±yor.",ar:"ЩЉШ№ЩЉШґ Щ…Щ„ЩЉЩ€Щ†Ш§ ШґШ®Шµ ЩЃЩЉ Ш·ШґЩ‚Щ†ШЇ.",fa:"ШЇЩ€ Щ…ЫЊЩ„ЫЊЩ€Щ† Щ†ЩЃШ± ШЇШ± ШЄШ§ШґЪ©Щ†ШЇ ШІЩ†ШЇЪЇЫЊ Щ…ЫЊвЂЊЪ©Щ†Щ†ШЇ.",zh:"еЎ”д»Ђе№Іжњ‰дё¤з™ѕдё‡дєєеЏЈгЂ‚",es:"Dos millones de personas viven en Tashkent.",de:"Zwei Millionen Menschen leben in Taschkent."},options:["ikki","besh","o'n","yuz"]},
      ]},
  ],

  // в•ђв•ђ CHINESE more lessons в•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђ
  "zh-beginner-extra": [
    { id:4, emoji:"рџ‘ЁвЂЌрџ‘©вЂЌрџ‘§", titles:{ru:"РЎРµРјСЊСЏ",en:"Family",uz:"Oila",tr:"Aile",ar:"Ш§Щ„Ш№Ш§Ш¦Щ„Ш©",fa:"Ш®Ш§Щ†Щ€Ш§ШЇЩ‡",zh:"е®¶еє­",es:"Familia",de:"Familie"},
      exercises:[
        {type:"choose",targetWord:"е¦€е¦€",translations:{ru:"РњР°РјР°",en:"Mother",uz:"Ona",tr:"Anne",ar:"ШЈЩ…",fa:"Щ…Ш§ШЇШ±",zh:"жЇЌдєІ",es:"Madre",de:"Mutter"},distractors:{ru:["РџР°РїР°","Р‘СЂР°С‚","РЎРµСЃС‚СЂР°"],en:["Father","Brother","Sister"],uz:["Ota","Aka","Singil"],tr:["Baba","Erkek kardeЕџ","KД±z kardeЕџ"],ar:["ШЈШЁ","ШЈШ®","ШЈШ®ШЄ"],fa:["ЩѕШЇШ±","ШЁШ±Ш§ШЇШ±","Ш®Щ€Ш§Щ‡Ш±"],zh:["з€ёз€ё","е…„ејџ","е§ђе¦№"],es:["Padre","Hermano","Hermana"],de:["Vater","Bruder","Schwester"]}},
        {type:"arrange",sentence:{ru:"РњРѕСЏ СЃРµРјСЊСЏ РѕС‡РµРЅСЊ РґСЂСѓР¶РЅР°СЏ",en:"My family is very harmonious",uz:"Oilam juda tatuvli",tr:"Ailem Г§ok uyumlu",ar:"Ш№Ш§Ш¦Щ„ШЄЩЉ Щ…ШЄЩ†Ш§ШіЩ‚Ш© Ш¬ШЇШ§Щ‹",fa:"Ш®Ш§Щ†Щ€Ш§ШЇЩ‡вЂЊШ§Щ… Ш®ЫЊЩ„ЫЊ ШµЩ…ЫЊЩ…ЫЊЩ‡",zh:"ж€‘е®¶дєєе…ізі»еѕ€еҐЅ",es:"Mi familia es muy unida",de:"Meine Familie ist sehr harmonisch"},answer:"ж€‘ е®¶ еѕ€ е№ёз¦Џ",words:["ж€‘","е®¶","еѕ€","е№ёз¦Џ","дёЌ","йљѕ"]},
        {type:"fill",sentence:"ж€‘ жњ‰ дёЂ дёЄ ___гЂ‚",blank:"е“Ґе“Ґ",hint:{ru:"РЈ РјРµРЅСЏ РµСЃС‚СЊ РѕРґРёРЅ СЃС‚Р°СЂС€РёР№ Р±СЂР°С‚.",en:"I have one older brother.",uz:"Bitta katta akam bor.",tr:"Bir bГјyГјk erkek kardeЕџim var.",ar:"Ш№Щ†ШЇЩЉ ШЈШ® ШЈЩѓШЁШ± Щ€Ш§Ш­ШЇ.",fa:"ЫЊЩ‡ ШЇШ§ШЇШ§Шґ ШЁШІШ±ЪЇШЄШ± ШЇШ§Ш±Щ….",zh:"ж€‘жњ‰дёЂдёЄе“Ґе“ҐгЂ‚",es:"Tengo un hermano mayor.",de:"Ich habe einen Г¤lteren Bruder."},options:["е“Ґе“Ґ","ејџејџ","е¦№е¦№","жњ‹еЏ‹"]},
        {type:"translate",source:{ru:"РњРѕР№ РїР°РїР° РёРЅР¶РµРЅРµСЂ.",en:"My father is an engineer.",uz:"Otam muhandis.",tr:"Babam mГјhendis.",ar:"ШЈШЁЩЉ Щ…Щ‡Щ†ШЇШі.",fa:"ШЁШ§ШЁШ§Щ… Щ…Щ‡Щ†ШЇШіЩ‡.",zh:"My dad is an engineer.",es:"Mi padre es ingeniero.",de:"Mein Vater ist Ingenieur."},answer:"ж€‘з€ёз€ёжЇе·ҐзЁ‹её€",accept:["ж€‘з€ёз€ёжЇе·ҐзЁ‹её€","з€ёз€ёжЇе·ҐзЁ‹её€"]},
      ]},
    { id:5, emoji:"рџЏ®", titles:{ru:"РљРёС‚Р°Р№СЃРєР°СЏ РєСѓР»СЊС‚СѓСЂР°",en:"Chinese Culture",uz:"Xitoy madaniyati",tr:"Г‡in kГјltГјrГј",ar:"Ш§Щ„Ш«Щ‚Ш§ЩЃШ© Ш§Щ„ШµЩЉЩ†ЩЉШ©",fa:"ЩЃШ±Щ‡Щ†ЪЇ Ъ†ЫЊЩ†ЫЊ",zh:"дё­е›Ѕж–‡еЊ–",es:"Cultura china",de:"Chinesische Kultur"},
      exercises:[
        {type:"choose",targetWord:"жҐиЉ‚",translations:{ru:"РљРёС‚Р°Р№СЃРєРёР№ РќРѕРІС‹Р№ Р“РѕРґ",en:"Chinese New Year",uz:"Xitoy yangi yili",tr:"Г‡in Yeni YД±lД±",ar:"Ш±ШЈШі Ш§Щ„ШіЩ†Ш© Ш§Щ„ШµЩЉЩ†ЩЉШ©",fa:"ШіШ§Щ„ Щ†Щ€ Ъ†ЫЊЩ†ЫЊ",zh:"New Year festival",es:"AГ±o Nuevo Chino",de:"Chinesisches Neujahr"},distractors:{ru:["РџСЂР°Р·РґРЅРёРє СЃРµСЂРµРґРёРЅС‹ РѕСЃРµРЅРё","Р”РµРЅСЊ СЂРѕР¶РґРµРЅРёСЏ","РЎРІР°РґСЊР±Р°"],en:["Mid-Autumn Festival","Birthday","Wedding"],uz:["Kuz oК»rtasi bayrami","TugК»ilgan kun","ToК»y"],tr:["Sonbahar OrtasД± Festivali","DoДџum gГјnГј","DГјДџГјn"],ar:["Щ…Щ‡Ш±Ш¬Ш§Щ† Щ…Щ†ШЄШµЩЃ Ш§Щ„Ш®Ш±ЩЉЩЃ","Ш№ЩЉШЇ Щ…ЩЉЩ„Ш§ШЇ","ШІЩЃШ§ЩЃ"],fa:["Ш¬ШґЩ† Щ†ЫЊЩ…Щ‡ ЩѕШ§ЫЊЫЊШІ","ШЄЩ€Щ„ШЇ","Ш№Ш±Щ€ШіЫЊ"],zh:["дё­з§‹иЉ‚","з”џж—Ґ","е©љз¤ј"],es:["Festival del Medio OtoГ±o","CumpleaГ±os","Boda"],de:["Mittherbstfest","Geburtstag","Hochzeit"]}},
        {type:"arrange",sentence:{ru:"РљСЂР°СЃРЅС‹Р№ С†РІРµС‚ РїСЂРёРЅРѕСЃРёС‚ СѓРґР°С‡Сѓ",en:"Red colour brings good luck",uz:"Qizil rang baxt keltiradi",tr:"KД±rmД±zД± renk Еџans getirir",ar:"Ш§Щ„Щ„Щ€Щ† Ш§Щ„ШЈШ­Щ…Ш± ЩЉШ¬Щ„ШЁ Ш§Щ„Ш­Шё",fa:"Ш±Щ†ЪЇ Щ‚Ш±Щ…ШІ Ш®Щ€ШґвЂЊШґШ§Щ†ШіЫЊ Щ…ЫЊШ§Ш±Щ‡",zh:"Red brings luck",es:"El color rojo trae buena suerte",de:"Die Farbe Rot bringt GlГјck"},answer:"зєўи‰І д»ЈиЎЁ еҐЅиїђ",words:["зєўи‰І","д»ЈиЎЁ","еҐЅиїђ","еќЏиїђ","з™Ѕи‰І","й»‘и‰І"]},
        {type:"fill",sentence:"ж–°е№ґ еї«д№ђпјЃжЃ­е–њ ___пјЃ",blank:"еЏ‘иґў",hint:{ru:"РЎ РќРѕРІС‹Рј РіРѕРґРѕРј! Р–РµР»Р°СЋ Р±РѕРіР°С‚СЃС‚РІР°!",en:"Happy New Year! Wishing you wealth!",uz:"Yangi yil bilan! Boylik tilayman!",tr:"Mutlu YД±llar! Zenginlik diliyorum!",ar:"ЩѓЩ„ Ш№Ш§Щ… Щ€ШЈЩ†ШЄЩ… ШЁШ®ЩЉШ±! ШЈШЄЩ…Щ†Щ‰ Щ„Щѓ Ш§Щ„Ш«Ш±Щ€Ш©!",fa:"ШіШ§Щ„ Щ†Щ€ Щ…ШЁШ§Ш±Ъ©! Ш«Ш±Щ€ШЄ ШўШ±ШІЩ€ Щ…ЫЊвЂЊЪ©Щ†Щ…!",zh:"Happy New Year! Best wishes!",es:"ВЎFeliz AГ±o Nuevo! ВЎDeseo riqueza!",de:"Frohes Neues Jahr! Ich wГјnsche dir Reichtum!"},options:["еЏ‘иґў","е¤±дёљ","з”џз—…","еЂ’йњ‰"]},
      ]},
  ],

  // в•ђв•ђ RUSSIAN more lessons в•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђв•ђ
  "ru-beginner-extra": [
    { id:5, emoji:"рџЏ«", titles:{ru:"РЈС‡С‘Р±Р°",en:"Studies",uz:"O'qish",tr:"Г‡alД±Еџma",ar:"Ш§Щ„ШЇШ±Ш§ШіШ©",fa:"ШЄШ­ШµЫЊЩ„",zh:"е­¦д№ ",es:"Estudio",de:"Studium"},
      exercises:[
        {type:"choose",targetWord:"РЈС‡РµР±РЅРёРє",translations:{ru:"Textbook",en:"Textbook",uz:"Darslik",tr:"Ders kitabД±",ar:"ЩѓШЄШ§ШЁ Щ…ШЇШ±ШіЩЉ",fa:"Ъ©ШЄШ§ШЁ ШЇШ±ШіЫЊ",zh:"ж•™з§‘д№¦",es:"Libro de texto",de:"Lehrbuch"},distractors:{ru:["РўРµС‚СЂР°РґСЊ","Р СѓС‡РєР°","Р СЋРєР·Р°Рє"],en:["Notebook","Pen","Backpack"],uz:["Daftar","Ruchka","Ryukzak"],tr:["Defter","Kalem","SД±rt Г§antasД±"],ar:["ШЇЩЃШЄШ±","Щ‚Щ„Щ…","Ш­Щ‚ЩЉШЁШ©"],fa:["ШЇЩЃШЄШ±","Ш®Щ€ШЇЪ©Ш§Ш±","Ъ©Щ€Щ„Щ‡вЂЊЩѕШґШЄЫЊ"],zh:["з¬”и®°жњ¬","з¬”","иѓЊеЊ…"],es:["Cuaderno","BolГ­grafo","Mochila"],de:["Heft","Stift","Rucksack"]}},
        {type:"arrange",sentence:{ru:"РЇ СѓС‡СѓСЃСЊ РІ СѓРЅРёРІРµСЂСЃРёС‚РµС‚Рµ",en:"I study at university",uz:"Men universitetda o'qiyman",tr:"Гњniversitede okuyorum",ar:"ШЈЩ†Ш§ ШЈШЇШ±Ші ЩЃЩЉ Ш§Щ„Ш¬Ш§Щ…Ш№Ш©",fa:"ШЇШ§Щ†ШґЪЇШ§Щ‡ Щ…ЫЊвЂЊШ®Щ€Щ†Щ…",zh:"ж€‘ењЁе¤§е­¦е­¦д№ ",es:"Estudio en la universidad",de:"Ich studiere an der UniversitГ¤t"},answer:"РЇ СѓС‡СѓСЃСЊ РІ СѓРЅРёРІРµСЂСЃРёС‚РµС‚Рµ",words:["РЇ","СѓС‡СѓСЃСЊ","РІ","СѓРЅРёРІРµСЂСЃРёС‚РµС‚Рµ","С€РєРѕР»Рµ","РёРЅСЃС‚РёС‚СѓС‚Рµ"]},
        {type:"fill",sentence:"РЈСЂРѕРє РЅР°С‡РёРЅР°РµС‚СЃСЏ РІ ___ С‡Р°СЃРѕРІ.",blank:"РІРѕСЃРµРјСЊ",hint:{ru:"РЈСЂРѕРє РЅР°С‡РёРЅР°РµС‚СЃСЏ РІ РІРѕСЃРµРјСЊ С‡Р°СЃРѕРІ.",en:"The lesson starts at eight.",uz:"Dars soat sakkizda boshlanadi.",tr:"Ders sekizde baЕџlar.",ar:"Ш§Щ„ШЇШ±Ші ЩЉШЁШЇШЈ ЩЃЩЉ Ш§Щ„Ш«Ш§Щ…Щ†Ш©.",fa:"Ъ©Щ„Ш§Ші ШіШ§Ш№ШЄ Щ‡ШґШЄ ШґШ±Щ€Ш№ Щ…ЫЊвЂЊШґЩ‡.",zh:"иЇѕењЁе…«з‚№ејЂе§‹гЂ‚",es:"La clase empieza a las ocho.",de:"Die Stunde beginnt um acht Uhr."},options:["РІРѕСЃРµРјСЊ","С‚СЂРё","РґРІРµРЅР°РґС†Р°С‚СЊ","РЅРѕР»СЊ"]},
        {type:"translate",source:{ru:"Study hard every day",en:"Study hard every day",uz:"Har kuni qattiq o'qi",tr:"Her gГјn Г§ok Г§alД±Еџ",ar:"Ш§ШЇШ±Ші ШЁШ¬ШЇ ЩѓЩ„ ЩЉЩ€Щ…",fa:"Щ‡Ш± Ш±Щ€ШІ ШіШ®ШЄ ШЁШ®Щ€Щ†",zh:"жЇЏе¤©еЉЄеЉ›е­¦д№ ",es:"Estudia duro cada dГ­a",de:"Lerne jeden Tag fleiГџig"},answer:"СѓС‡РёСЃСЊ СѓСЃРµСЂРґРЅРѕ РєР°Р¶РґС‹Р№ РґРµРЅСЊ",accept:["СѓС‡РёСЃСЊ СѓСЃРµСЂРґРЅРѕ РєР°Р¶РґС‹Р№ РґРµРЅСЊ","СЃС‚Р°СЂР°Р№СЃСЏ СѓС‡РёС‚СЊСЃСЏ РєР°Р¶РґС‹Р№ РґРµРЅСЊ"]},
      ]},
    { id:6, emoji:"рџЊЌ", titles:{ru:"РЎС‚СЂР°РЅС‹",en:"Countries",uz:"Mamlakatlar",tr:"Гњlkeler",ar:"Ш§Щ„ШЇЩ€Щ„",fa:"Ъ©ШґЩ€Ш±Щ‡Ш§",zh:"е›Ѕе®¶",es:"PaГ­ses",de:"LГ¤nder"},
      exercises:[
        {type:"choose",targetWord:"Р РѕСЃСЃРёСЏ",translations:{ru:"Russia",en:"Russia",uz:"Rossiya",tr:"Rusya",ar:"Ш±Щ€ШіЩЉШ§",fa:"Ш±Щ€ШіЫЊЩ‡",zh:"дї„зЅ—ж–Ї",es:"Rusia",de:"Russland"},distractors:{ru:["РљРёС‚Р°Р№","Р¤СЂР°РЅС†РёСЏ","Р“РµСЂРјР°РЅРёСЏ"],en:["China","France","Germany"],uz:["Xitoy","Fransiya","Germaniya"],tr:["Г‡in","Fransa","Almanya"],ar:["Ш§Щ„ШµЩЉЩ†","ЩЃШ±Щ†ШіШ§","ШЈЩ„Щ…Ш§Щ†ЩЉШ§"],fa:["Ъ†ЫЊЩ†","ЩЃШ±Ш§Щ†ШіЩ‡","ШўЩ„Щ…Ш§Щ†"],zh:["дё­е›Ѕ","жі•е›Ѕ","еѕ·е›Ѕ"],es:["China","Francia","Alemania"],de:["China","Frankreich","Deutschland"]}},
        {type:"arrange",sentence:{ru:"РЇ С…РѕС‡Сѓ РїРѕСЃРµС‚РёС‚СЊ РЇРїРѕРЅРёСЋ",en:"I want to visit Japan",uz:"Men Yaponiyaga bormoqchiman",tr:"Japonya'yД± ziyaret etmek istiyorum",ar:"ШЈШ±ЩЉШЇ ШІЩЉШ§Ш±Ш© Ш§Щ„ЩЉШ§ШЁШ§Щ†",fa:"Щ…ЫЊвЂЊШ®Щ€Ш§Щ… ЪШ§ЩѕЩ† Ш±Щ€ ШЁШЁЫЊЩ†Щ…",zh:"ж€‘жѓіеЋ»ж—Ґжњ¬",es:"Quiero visitar JapГіn",de:"Ich mГ¶chte Japan besuchen"},answer:"РЇ С…РѕС‡Сѓ РїРѕСЃРµС‚РёС‚СЊ РЇРїРѕРЅРёСЋ",words:["РЇ","С…РѕС‡Сѓ","РїРѕСЃРµС‚РёС‚СЊ","РЇРїРѕРЅРёСЋ","РљРёС‚Р°Р№","РїРѕРµС…Р°С‚СЊ"]},
        {type:"fill",sentence:"РњРѕСЃРєРІР° вЂ” СЃС‚РѕР»РёС†Р° ___.",blank:"Р РѕСЃСЃРёРё",hint:{ru:"РњРѕСЃРєРІР° вЂ” СЃС‚РѕР»РёС†Р° Р РѕСЃСЃРёРё.",en:"Moscow is the capital of Russia.",uz:"Moskva Rossiyaning poytaxti.",tr:"Moskova, Rusya'nД±n baЕџkentidir.",ar:"Щ…Щ€ШіЩѓЩ€ Ш№Ш§ШµЩ…Ш© Ш±Щ€ШіЩЉШ§.",fa:"Щ…ШіЪ©Щ€ ЩѕШ§ЫЊШЄШ®ШЄ Ш±Щ€ШіЫЊЩ‡вЂЊШіШЄ.",zh:"иЋ«ж–Їз§‘жЇдї„зЅ—ж–Їзљ„й¦–йѓЅгЂ‚",es:"MoscГє es la capital de Rusia.",de:"Moskau ist die Hauptstadt Russlands."},options:["Р РѕСЃСЃРёРё","РљРёС‚Р°СЏ","Р¤СЂР°РЅС†РёРё","Р“РµСЂРјР°РЅРёРё"]},
      ]},
  ],

};

// Inject mega lessons
Object.entries(MEGA_LESSONS).forEach(([key, lessons]) => {
  const baseKey = key.replace(/-extra\d*$/, "");
  if (!LESSON_DATA[baseKey]) LESSON_DATA[baseKey] = [];
  LESSON_DATA[baseKey] = [...LESSON_DATA[baseKey], ...lessons];
});

// в”Ђв”Ђв”Ђ EXERCISE GENERATOR в”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђ
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

// в”Ђв”Ђв”Ђ PRICING LOGIC в”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђ
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

// в”Ђв”Ђв”Ђ MAIN APP в”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђ
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

  // в”Ђв”Ђ PRICING STATE в”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђ
  const [selectedPlan, setSelectedPlan] = useState(null);

  // в”Ђв”Ђ AUTH STATE в”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђ
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
      alert("РћС€РёР±РєР° РѕРїР»Р°С‚С‹: " + e.message);
    }
    setSubLoading(false);
  };

  const handleManageSub = async () => {
    if (!authToken) return;
    try {
      const data = await api.createPortal(authToken);
      window.location.href = data.portalUrl;
    } catch (e) {
      alert("РћС€РёР±РєР°: " + e.message);
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

  // в”Ђв”Ђ STYLES в”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђ
  const S = {
    app: { fontFamily:"'Outfit',sans-serif", background:"#080811", minHeight:"100vh", color:"#fff", position:"relative" },
    bg: { position:"fixed", inset:0, zIndex:0, background:"radial-gradient(ellipse at 15% 40%,rgba(99,102,241,.18) 0%,transparent 55%),radial-gradient(ellipse at 85% 15%,rgba(236,72,153,.12) 0%,transparent 50%),radial-gradient(ellipse at 50% 85%,rgba(16,185,129,.08) 0%,transparent 50%)" },
    wrap: { position:"relative", zIndex:1, maxWidth:430, margin:"0 auto", minHeight:"100vh", display:"flex", flexDirection:"column" },
    backBtn: { background:"rgba(255,255,255,.08)", border:"none", color:"#fff", width:40, height:40, borderRadius:12, cursor:"pointer", fontSize:18, flexShrink:0 },
    pill: (active, color="#6366F1") => ({ background: active ? `linear-gradient(135deg,${color},${color}99)` : "rgba(255,255,255,.05)", border:`1px solid ${active ? color : "rgba(255,255,255,.08)"}`, borderRadius:14, padding:"10px 6px", textAlign:"center", cursor:"pointer", transition:"all .2s" }),
  };

  const lc = (code) => (LANGUAGES.find(l=>l.code===code)||{}).color || "#6366F1";
  const levelColors = { beginner:"#10B981", intermediate:"#F59E0B", advanced:"#EF4444" };


  // в”Ђв”Ђ AUTH SCREEN в”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђ
  if (screen === "auth") {
    const isLogin = authMode === "login";
    return (
      <div style={S.app}>
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet"/>
        <div style={S.bg}/>
        <div style={S.wrap}>
          <div style={{ padding:"52px 28px 32px" }}>
            <button onClick={()=>setScreen("home")} style={{ ...S.backBtn, marginBottom:28 }}>в†ђ</button>
            <div style={{ textAlign:"center", marginBottom:36 }}>
              <div style={{ fontSize:52 }}>рџЊЌ</div>
              <h2 style={{ fontSize:28, fontWeight:900, margin:"12px 0 4px", background:"linear-gradient(135deg,#fff,#A78BFA)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>
                {isLogin ? "Р’РѕР№С‚Рё РІ Lingra" : "РЎРѕР·РґР°С‚СЊ Р°РєРєР°СѓРЅС‚"}
              </h2>
              <p style={{ color:"#6B7280", fontSize:14, margin:0 }}>
                {isLogin ? "РџСЂРѕРґРѕР»Р¶Рё РѕР±СѓС‡РµРЅРёРµ" : "РќР°С‡РЅРё СѓС‡РёС‚СЊ СЏР·С‹РєРё"}
              </p>
            </div>

            {/* Form */}
            <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
              {!isLogin && (
                <div>
                  <div style={{ fontSize:12, color:"#6B7280", fontWeight:600, marginBottom:6 }}>РРњРЇ</div>
                  <input value={authForm.name} onChange={e=>setAuthForm(f=>({...f,name:e.target.value}))}
                    placeholder="РўРІРѕС‘ РёРјСЏ"
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
                <div style={{ fontSize:12, color:"#6B7280", fontWeight:600, marginBottom:6 }}>РџРђР РћР›Р¬</div>
                <input value={authForm.password} onChange={e=>setAuthForm(f=>({...f,password:e.target.value}))}
                  type="password" placeholder="РњРёРЅРёРјСѓРј 6 СЃРёРјРІРѕР»РѕРІ"
                  onKeyDown={e=>e.key==="Enter"&&handleAuth()}
                  style={{ width:"100%", background:"rgba(255,255,255,.06)", border:"1px solid rgba(255,255,255,.12)", borderRadius:14, padding:"14px 16px", color:"#fff", fontSize:15, outline:"none", fontFamily:"Outfit,sans-serif", boxSizing:"border-box" }}/>
              </div>
            </div>

            {authError && (
              <div style={{ marginTop:12, background:"rgba(239,68,68,.15)", border:"1px solid rgba(239,68,68,.4)", borderRadius:12, padding:"10px 14px", fontSize:13, color:"#EF4444" }}>
                вќЊ {authError}
              </div>
            )}

            <button onClick={handleAuth} disabled={authLoading || !authForm.email || !authForm.password}
              style={{ width:"100%", marginTop:20, background: authLoading||!authForm.email||!authForm.password ? "rgba(255,255,255,.08)" : "linear-gradient(135deg,#6366F1,#A855F7)", border:"none", color: authLoading||!authForm.email||!authForm.password?"#4B5563":"#fff", borderRadius:16, padding:18, fontSize:16, fontWeight:800, cursor:"pointer", transition:"all .2s" }}>
              {authLoading ? "вЏі Р—Р°РіСЂСѓР·РєР°..." : isLogin ? "Р’РѕР№С‚Рё в†’" : "РЎРѕР·РґР°С‚СЊ Р°РєРєР°СѓРЅС‚ в†’"}
            </button>

            <div onClick={()=>{ setAuthMode(isLogin?"register":"login"); setAuthError(""); }}
              style={{ textAlign:"center", marginTop:20, color:"#A78BFA", fontSize:14, fontWeight:600, cursor:"pointer" }}>
              {isLogin ? "РќРµС‚ Р°РєРєР°СѓРЅС‚Р°? Р—Р°СЂРµРіРёСЃС‚СЂРёСЂРѕРІР°С‚СЊСЃСЏ" : "РЈР¶Рµ РµСЃС‚СЊ Р°РєРєР°СѓРЅС‚? Р’РѕР№С‚Рё"}
            </div>

            {/* Social login hint */}
            <div style={{ marginTop:28, textAlign:"center" }}>
              <div style={{ fontSize:12, color:"#374151", marginBottom:12 }}>вЂ” РёР»Рё вЂ”</div>
              <div style={{ display:"flex", gap:10 }}>
                {[["рџЌЋ","Apple"],["рџ‡¬","Google"]].map(([ic,name])=>(
                  <div key={name} style={{ flex:1, background:"rgba(255,255,255,.06)", border:"1px solid rgba(255,255,255,.1)", borderRadius:14, padding:"12px", textAlign:"center", cursor:"pointer", fontSize:13, fontWeight:600, color:"#9CA3AF" }}>
                    {ic} {name}
                    <div style={{ fontSize:10, color:"#4B5563", marginTop:2 }}>СЃРєРѕСЂРѕ</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // в”Ђв”Ђ ONBOARDING в”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђ
  if (screen === "onboarding") return (
    <div style={S.app}>
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet"/>
      <div style={S.bg}/>
      <div style={S.wrap}>
        <div style={{ padding:"60px 28px 32px", textAlign:"center" }}>
          <div style={{ fontSize:70, marginBottom:8 }}>рџЊЌ</div>
          <h1 style={{ fontSize:52, fontWeight:900, margin:"0 0 4px", letterSpacing:-2, background:"linear-gradient(135deg,#fff 0%,#A78BFA 50%,#EC4899 100%)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>LINGRA</h1>
          <p style={{ color:"#6B7280", fontSize:15, margin:"0 0 40px" }}>Express language learning вљЎ</p>
          <div style={{ background:"rgba(255,255,255,.05)", border:"1px solid rgba(255,255,255,.1)", borderRadius:24, padding:"20px", marginBottom:28, textAlign:"left" }}>
            <div style={{ fontSize:14, color:"#A78BFA", fontWeight:700, marginBottom:14, letterSpacing:.5 }}>рџ—ЈпёЏ {UI.ru.selectNative}</div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8 }}>
              {NATIVE_LANGS.map(nl => (
                <div key={nl.code} onClick={() => setNativeLang(nl.code)} style={S.pill(nativeLang===nl.code)}>
                  <div style={{ display:"flex", justifyContent:"center", marginBottom:4 }}>
                    <FlagImg code={nl.img || nl.code} size={28}/>
                  </div>
                  <div style={{ fontSize:10, fontWeight:600, color: nativeLang===nl.code?"#fff":"#9CA3AF" }}>{nl.name}</div>
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

  // в”Ђв”Ђ HOME в”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђ
  if (screen === "home") return (
    <div style={S.app}>
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet"/>
      <div style={S.bg}/>
      <div style={S.wrap}>
        <div style={{ padding:"48px 24px 14px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div>
            <h1 style={{ margin:0, fontSize:32, fontWeight:900, background:"linear-gradient(135deg,#fff,#A78BFA)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>LINGRA</h1>
            <p style={{ margin:"2px 0 0", fontSize:13, color:"#6B7280" }}>вљЎ РђРЅРіР»РёР№СЃРєРёР№ СЏР·С‹Рє СЃ РЅСѓР»СЏ</p>
          </div>
          <div style={{ display:"flex", gap:8 }}>
            <div onClick={() => setScreen("onboarding")} style={{ background:"rgba(255,255,255,.06)", border:"1px solid rgba(255,255,255,.1)", borderRadius:14, padding:"8px 12px", cursor:"pointer", textAlign:"center" }}>
              <div style={{ fontSize:20 }}>{NATIVE_LANGS.find(l=>l.code===nativeLang)?.flag}</div>
              <div style={{ fontSize:10, color:"#6B7280", marginTop:2 }}>{nativeLang.toUpperCase()}</div>
            </div>
            {authUser ? (
              <div onClick={()=>setScreen("profile")} style={{ background:"linear-gradient(135deg,rgba(99,102,241,.3),rgba(168,85,247,.3))", border:"1px solid rgba(99,102,241,.5)", borderRadius:14, padding:"8px 12px", cursor:"pointer", textAlign:"center" }}>
                <div style={{ fontSize:20 }}>рџ‘¤</div>
                <div style={{ fontSize:10, color:"#A78BFA", marginTop:2, fontWeight:700 }}>{authUser.name?.slice(0,6)}</div>
              </div>
            ) : (
              <div onClick={()=>setScreen("auth")} style={{ background:"linear-gradient(135deg,rgba(99,102,241,.3),rgba(168,85,247,.3))", border:"1px solid rgba(99,102,241,.5)", borderRadius:14, padding:"8px 12px", cursor:"pointer", textAlign:"center" }}>
                <div style={{ fontSize:20 }}>рџ”‘</div>
                <div style={{ fontSize:10, color:"#A78BFA", marginTop:2, fontWeight:700 }}>Р’РѕР№С‚Рё</div>
              </div>
            )}
          </div>
        </div>
        <div style={{ display:"flex", gap:10, padding:"0 24px 18px" }}>
          {[["рџ”Ґ",streak,t.days],["вљЎ",xp,t.xp],["рџЏ†","A1-C1","СѓСЂРѕРІРЅРё"]].map(([ic,v,lb])=>(
            <div key={lb} style={{ flex:1, background:"rgba(255,255,255,.05)", border:"1px solid rgba(255,255,255,.08)", borderRadius:16, padding:"12px 6px", textAlign:"center" }}>
              <div style={{ fontSize:18 }}>{ic}</div>
              <div style={{ fontSize:18, fontWeight:800, marginTop:2 }}>{v}</div>
              <div style={{ fontSize:10, color:"#6B7280" }}>{lb}</div>
            </div>
          ))}
        </div>
        <div style={{ padding:"0 24px", flex:1 }}>
          <div style={{ fontSize:12, fontWeight:700, color:"#6B7280", letterSpacing:2, marginBottom:12 }}>{t.chooseToLearn}</div>
          {/* Single English course card */}
          <div onClick={() => { setSelectedLang("en"); setScreen("levelSelect"); }}
            style={{ background:"linear-gradient(135deg,rgba(59,130,246,.15),rgba(99,102,241,.15))", border:"2px solid rgba(59,130,246,.4)", borderRadius:22, padding:24, cursor:"pointer", transition:"all .2s", position:"relative", overflow:"hidden" }}
            onMouseEnter={e=>e.currentTarget.style.transform="translateY(-3px)"}
            onMouseLeave={e=>e.currentTarget.style.transform="translateY(0)"}>
            <div style={{ position:"absolute", top:16, right:16, background:"linear-gradient(135deg,#6366F1,#A855F7)", borderRadius:100, padding:"4px 14px", fontSize:12, fontWeight:700 }}>
              {nativeLang==="uz" ? "MAVJUD" : "Р”РћРЎРўРЈРџРќРћ"}
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:16, marginBottom:16 }}>
              <FlagImg code="gb" size={52}/>
              <div>
                <div style={{ fontSize:26, fontWeight:900 }}>English</div>
                <div style={{ fontSize:13, color:"#9CA3AF", marginTop:2 }}>A1 в†’ C2 В· 9 {nativeLang==="uz"?"oy":"РјРµСЃСЏС†РµРІ"}</div>
              </div>
            </div>
            <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:16 }}>
              {(nativeLang==="uz"
                ? ["рџЊ± Boshlang'ich","рџ”Ґ O'rta","вљЎ Yuqori"]
                : ["рџЊ± РќР°С‡РёРЅР°СЋС‰РёР№","рџ”Ґ РЎСЂРµРґРЅРёР№","вљЎ РџСЂРѕРґРІРёРЅСѓС‚С‹Р№"]
              ).map(s => (
                <span key={s} style={{ background:"rgba(59,130,246,.2)", border:"1px solid rgba(59,130,246,.3)", borderRadius:8, padding:"4px 12px", fontSize:12, fontWeight:600, color:"#93C5FD" }}>{s}</span>
              ))}
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8 }}>
              {[
                ["рџ“љ", nativeLang==="uz"?"Darslar":"РЈСЂРѕРєРё", "36+"],
                ["рџ”Љ", nativeLang==="uz"?"Audio":"РђСѓРґРёРѕ", "вњ“"],
                ["рџ¤–", "AI", nativeLang==="uz"?"Murabbiy":"РќР°СЃС‚Р°РІРЅРёРє"],
              ].map(([ic,lb,val]) => (
                <div key={lb} style={{ background:"rgba(255,255,255,.05)", borderRadius:12, padding:"10px 8px", textAlign:"center" }}>
                  <div style={{ fontSize:18 }}>{ic}</div>
                  <div style={{ fontSize:10, color:"#6B7280", marginTop:2 }}>{lb}</div>
                  <div style={{ fontSize:12, fontWeight:700, marginTop:1 }}>{val}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div style={{ padding:"16px 24px 32px" }}>
          <button onClick={()=>setScreen("pricing")} style={{ width:"100%", background:"linear-gradient(135deg,#6366F1,#A855F7)", border:"none", color:"#fff", borderRadius:16, padding:16, fontSize:15, fontWeight:700, cursor:"pointer" }}>{t.pricingBtn}</button>
        </div>
      </div>
    </div>
  );

  // в”Ђв”Ђ LEVEL SELECT в”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђ
  if (screen === "levelSelect") {
    const lang = LANGUAGES.find(l=>l.code===selectedLang);
    return (
      <div style={S.app}>
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet"/>
        <div style={S.bg}/>
        <div style={S.wrap}>
          <div style={{ padding:"48px 24px 24px", display:"flex", alignItems:"center", gap:14 }}>
            <button onClick={()=>setScreen("home")} style={S.backBtn}>в†ђ</button>
            <FlagImg code={lang?.img || lang?.code} size={32}/>
            <div><h2 style={{ margin:0, fontSize:22, fontWeight:800 }}>{lang?.name}</h2><div style={{ fontSize:13, color:"#6B7280" }}>{t.selectLevel}</div></div>
          </div>
          <div style={{ padding:"0 24px", flex:1 }}>
            {LEVELS.map((lv,i) => {
              const lessons = LESSON_DATA[`${selectedLang}-${lv}`]||[];
              const done = lessons.filter(ls=>progress[`${selectedLang}-${lv}-${ls.id}`]).length;
              const icons = ["рџЊ±","рџ”Ґ","вљЎ"]; const colors = [levelColors.beginner, levelColors.intermediate, levelColors.advanced];
              return (
                <div key={lv} onClick={() => { setCurrentLevel(lv); setScreen("course"); }}
                  style={{ background:"rgba(255,255,255,.04)", border:`1px solid rgba(255,255,255,.08)`, borderRadius:20, padding:"20px 22px", marginBottom:12, cursor:"pointer", display:"flex", alignItems:"center", gap:16, transition:"all .2s" }}
                  onMouseEnter={e=>e.currentTarget.style.transform="translateY(-2px)"}
                  onMouseLeave={e=>e.currentTarget.style.transform="translateY(0)"}>
                  <div style={{ fontSize:34, width:54, height:54, background:`${colors[i]}22`, borderRadius:16, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>{icons[i]}</div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:17, fontWeight:800, color:colors[i] }}>{t[lv]}</div>
                    <div style={{ fontSize:13, color:"#9CA3AF", marginTop:3 }}>{t[`levelDesc${i+1}`]}</div>
                    <div style={{ fontSize:12, color:"#6B7280", marginTop:4 }}>{lessons.length} {t.lessons?.toLowerCase()} {done>0&&<span style={{color:colors[i]}}>вЂў {done}вњ“</span>}</div>
                  </div>
                  <div style={{ fontSize:18 }}>{done===lessons.length&&lessons.length>0?"вњ…":"в–¶"}</div>
                </div>
              );
            })}
          </div>
          <div style={{ height:32 }}/>
        </div>
      </div>
    );
  }

  // в”Ђв”Ђ COURSE в”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђ
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
            <button onClick={()=>setScreen("levelSelect")} style={S.backBtn}>в†ђ</button>
            <FlagImg code={lang?.img || lang?.code} size={32}/>
            <div style={{ flex:1 }}>
              <h2 style={{ margin:0, fontSize:20, fontWeight:800 }}>{lang?.name}</h2>
              <div style={{ fontSize:12, color, fontWeight:700 }}>{t[currentLevel]}</div>
            </div>
            <div style={{ background:"rgba(255,255,255,.06)", borderRadius:12, padding:"8px 12px", textAlign:"center" }}>
              <div style={{ fontSize:16, fontWeight:800, color:"#F59E0B" }}>вљЎ{xp}</div>
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
                    <div style={{ fontSize:12, color:"#6B7280", marginTop:2 }}>{exCount} {t.questions} {done&&<span style={{color:"#10B981"}}>вњ“</span>}</div>
                  </div>
                  <div style={{ fontSize:20, color: done?"#10B981":"#374151" }}>{done?"вњ…":"в–¶"}</div>
                </div>
              );
            })}
            <div onClick={()=>{ setAiMessages([{role:"assistant",content:`${LANGUAGES.find(l=>l.code===selectedLang)?.flag} Let's practice ${LANGUAGES.find(l=>l.code===selectedLang)?.name}! / Р”Р°РІР°Р№ РїРѕРїСЂР°РєС‚РёРєСѓРµРјСЃСЏ!`}]); setScreen("ai"); }}
              style={{ marginTop:8, background:"linear-gradient(135deg,rgba(99,102,241,.25),rgba(168,85,247,.25))", border:"1px solid rgba(99,102,241,.4)", borderRadius:18, padding:"16px 18px", cursor:"pointer", display:"flex", alignItems:"center", gap:14 }}>
              <div style={{ fontSize:28 }}>рџ¤–</div>
              <div style={{ flex:1 }}><div style={{ fontWeight:700, fontSize:15 }}>{t.aiTitle}</div><div style={{ fontSize:12, color:"#9CA3AF", marginTop:2 }}>AI вЂў {t[currentLevel]}</div></div>
              <div style={{ fontSize:12, color:"#A78BFA", fontWeight:700 }}>PRO вњЁ</div>
            </div>
          </div>
          <div style={{ height:32 }}/>
        </div>
      </div>
    );
  }

  // в”Ђв”Ђ LESSON (exercise engine) в”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђ
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
            <button onClick={()=>setScreen("course")} style={S.backBtn}>вњ•</button>
            {/* Progress bar */}
            <div style={{ flex:1, background:"rgba(255,255,255,.06)", borderRadius:100, height:8, overflow:"hidden" }}>
              <div style={{ height:"100%", width:`${progress_pct}%`, background:`linear-gradient(90deg,${color},${color}99)`, borderRadius:100, transition:"width .4s" }}/>
            </div>
            {/* Lives */}
            <div style={{ display:"flex", gap:3, animation: wrongAnim?"shake .4s":"none" }}>
              {Array.from({length:MAX_LIVES}).map((_,i)=>(
                <span key={i} style={{ fontSize:18, opacity: i<lives?1:.25, transition:"opacity .3s" }}>вќ¤пёЏ</span>
              ))}
            </div>
          </div>

          <div style={{ padding:"8px 24px 0", flex:1, display:"flex", flexDirection:"column" }}>
            {/* Exercise type label */}
            <div style={{ fontSize:12, fontWeight:700, color:"#6B7280", letterSpacing:2, marginBottom:20 }}>{typeLabel.toUpperCase()}</div>

            {/* в”Ђв”Ђ CHOOSE exercise в”Ђв”Ђ */}
            {exType === "choose" && (
              <>
                <div style={{ background:"rgba(255,255,255,.05)", border:"1px solid rgba(255,255,255,.08)", borderRadius:22, padding:28, textAlign:"center", marginBottom:24 }}>
                  <div style={{ fontSize:42, marginBottom:12 }}>рџ”¤</div>
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:12 }}>
                    <div style={{ fontSize:34, fontWeight:900, letterSpacing:-1 }}>{ex.targetWord}</div>
                    <SpeakBtn text={ex.targetWord} lang={selectedLang} size={20}/>
                  </div>
                  {hintUsed && <div style={{ fontSize:13, color:"#F59E0B", marginTop:10, fontStyle:"italic" }}>рџ’Ў {ex.translations?.[nativeLang]||ex.translations?.ru}</div>}
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
                        {feedback && opt===ex.correctAnswer && "вњ…"}
                        {feedback && opt===chosenOption && opt!==ex.correctAnswer && "вќЊ"}
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            {/* в”Ђв”Ђ ARRANGE exercise в”Ђв”Ђ */}
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
                {feedback==="correct" && <div style={{ marginTop:12,fontSize:13,color:"#10B981",fontWeight:600 }}>вњ… {ex.correctAnswer}</div>}
                {feedback==="wrong" && <div style={{ marginTop:12,fontSize:13,color:"#EF4444",fontWeight:600 }}>вќЊ {ex.correctAnswer}</div>}
              </>
            )}

            {/* в”Ђв”Ђ FILL exercise в”Ђв”Ђ */}
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
                        {feedback && opt.toLowerCase()===ex.correctAnswer.toLowerCase() && " вњ…"}
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            {/* в”Ђв”Ђ TRANSLATE exercise в”Ђв”Ђ */}
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
                  {feedback && <div style={{ marginTop:10, fontSize:14, color: feedback==="correct"?"#10B981":"#EF4444", fontWeight:600 }}>{feedback==="correct"?"вњ…":"вќЊ"} {ex.accept?.[0]||ex.correctAnswer}</div>}
                </div>
              </>
            )}
          </div>

          {/* Footer */}
          <div style={{ padding:"16px 24px 32px", borderTop:"1px solid rgba(255,255,255,.06)" }}>
            {/* Feedback bar */}
            {feedback && (
              <div style={{ background: isCorrect?"rgba(16,185,129,.15)":"rgba(239,68,68,.12)", border:`1px solid ${isCorrect?"#10B981":"#EF4444"}`, borderRadius:16, padding:"12px 16px", marginBottom:12, display:"flex", alignItems:"center", gap:10, animation:"fadeUp .25s ease" }}>
                <div style={{ fontSize:24 }}>{isCorrect?"рџЋ‰":"рџ’”"}</div>
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
                  рџ’Ў {t.hintBtn}
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
                  {t.continueBtn} в†’
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // в”Ђв”Ђ LESSON COMPLETE в”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђ
  if (screen === "lessonComplete") {
    const perfect = correctCount === exercises.length;
    return (
      <div style={S.app}>
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet"/>
        <div style={S.bg}/>
        <div style={S.wrap}>
          <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"40px 24px", textAlign:"center" }}>
            <div style={{ fontSize:90, marginBottom:16, animation:"pop .5s" }}>{perfect?"рџЏ†":"рџЋ‰"}</div>
            <h2 style={{ fontSize:32, fontWeight:900, margin:"0 0 8px" }}>{perfect?t.perfect:t.lessonDone}</h2>
            <p style={{ color:"#9CA3AF", fontSize:16, margin:"0 0 32px" }}>{t.result}: {correctCount}/{exercises.length}</p>
            <div style={{ display:"flex", gap:16, marginBottom:32 }}>
              {[["вљЎ",`+${XP_PER_LESSON}`,t.xp],["вќ¤пёЏ",lives,t.lives],["рџ”Ґ",streak,t.streak]].map(([ic,v,lb])=>(
                <div key={lb} style={{ background:"rgba(255,255,255,.06)", borderRadius:20, padding:"20px 24px", textAlign:"center", minWidth:80 }}>
                  <div style={{ fontSize:28 }}>{ic}</div>
                  <div style={{ fontSize:22, fontWeight:900, marginTop:6 }}>{v}</div>
                  <div style={{ fontSize:11, color:"#6B7280", marginTop:2 }}>{lb}</div>
                </div>
              ))}
            </div>
            <button onClick={()=>setScreen("course")} style={{ width:"100%", maxWidth:320, background:"linear-gradient(135deg,#6366F1,#A855F7)", border:"none", color:"#fff", borderRadius:18, padding:18, fontSize:17, fontWeight:800, cursor:"pointer" }}>
              {t.continueBtn} в†’
            </button>
          </div>
        </div>
        <style>{`@keyframes pop{0%{transform:scale(.5);opacity:0}70%{transform:scale(1.15)}100%{transform:scale(1);opacity:1}}`}</style>
      </div>
    );
  }

  // в”Ђв”Ђ LIVES OUT в”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђ
  if (screen === "livesOut") return (
    <div style={S.app}>
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet"/>
      <div style={S.bg}/>
      <div style={S.wrap}>
        <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:40, textAlign:"center" }}>
          <div style={{ fontSize:80, marginBottom:16 }}>рџ’”</div>
          <h2 style={{ fontSize:28, fontWeight:900, margin:"0 0 8px" }}>{t.livesOut}</h2>
          <p style={{ color:"#9CA3AF", marginBottom:32 }}>{t.result}: {correctCount}/{exercises.length}</p>
          <button onClick={()=>startLesson(selectedLang,currentLevel,currentLesson)} style={{ width:"100%", maxWidth:300, background:"linear-gradient(135deg,#EF4444,#B91C1C)", border:"none", color:"#fff", borderRadius:18, padding:18, fontSize:16, fontWeight:800, cursor:"pointer", marginBottom:12 }}>
            рџ”„ {t.tryAgain}
          </button>
          <button onClick={()=>setScreen("course")} style={{ width:"100%", maxWidth:300, background:"rgba(255,255,255,.08)", border:"1px solid rgba(255,255,255,.1)", color:"#fff", borderRadius:18, padding:16, fontSize:15, fontWeight:600, cursor:"pointer" }}>
            {t.back}
          </button>
        </div>
      </div>
    </div>
  );

  // в”Ђв”Ђ AI CHAT в”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђ
  if (screen === "ai") {
    const lang = LANGUAGES.find(l=>l.code===selectedLang);
    return (
      <div style={{ ...S.app, display:"flex", flexDirection:"column" }}>
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet"/>
        <div style={S.bg}/>
        <div style={S.wrap}>
          <div style={{ padding:"48px 24px 14px", display:"flex", alignItems:"center", gap:12, borderBottom:"1px solid rgba(255,255,255,.06)" }}>
            <button onClick={()=>setScreen("course")} style={S.backBtn}>в†ђ</button>
            <div style={{ fontSize:26, lineHeight:1 }}>рџ¤–</div>
            <div><div style={{ fontWeight:700, fontSize:16 }}>{t.aiTitle}</div><div style={{ fontSize:12, color:"#10B981" }}>{t.aiOnline} вЂў {lang?.name}</div></div>
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
              <button onClick={sendAiMessage} disabled={aiLoading||!aiInput.trim()} style={{ background:aiLoading||!aiInput.trim()?"rgba(255,255,255,.08)":"linear-gradient(135deg,#6366F1,#A855F7)", border:"none", color:"#fff", width:38, height:38, borderRadius:12, cursor:"pointer", fontSize:17, flexShrink:0 }}>в†‘</button>
            </div>
          </div>
        </div>
        <style>{`@keyframes bounce{0%,80%,100%{transform:scale(0)}40%{transform:scale(1)}}`}</style>
      </div>
    );
  }


  // в”Ђв”Ђ PROFILE SCREEN в”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђ
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
            <button onClick={()=>setScreen("home")} style={S.backBtn}>в†ђ</button>
            <h2 style={{ margin:0, fontSize:22, fontWeight:800 }}>РџСЂРѕС„РёР»СЊ</h2>
          </div>

          <div style={{ padding:"0 24px", flex:1 }}>
            {/* Avatar block */}
            <div style={{ background:"linear-gradient(135deg,rgba(99,102,241,.2),rgba(168,85,247,.2))", border:"1px solid rgba(99,102,241,.3)", borderRadius:24, padding:24, marginBottom:16, textAlign:"center" }}>
              <div style={{ width:72, height:72, borderRadius:"50%", background:"linear-gradient(135deg,#6366F1,#A855F7)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:32, margin:"0 auto 12px" }}>
                {authUser?.name?.[0]?.toUpperCase() || "рџ‘¤"}
              </div>
              <div style={{ fontSize:20, fontWeight:800 }}>{authUser?.name || "Р“РѕСЃС‚СЊ"}</div>
              <div style={{ fontSize:13, color:"#9CA3AF", marginTop:4 }}>{authUser?.email || ""}</div>
              {authUser?.hasActiveSubscription && (
                <div style={{ display:"inline-block", background:"linear-gradient(135deg,#F59E0B,#D97706)", borderRadius:100, padding:"4px 14px", fontSize:12, fontWeight:700, marginTop:10 }}>
                  рџ’Ћ PRO
                </div>
              )}
            </div>

            {/* Stats */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10, marginBottom:16 }}>
              {[["вљЎ", xp, "XP"],["рџ”Ґ", streak, "Р”РЅРµР№"],["рџ“љ", langsDone, "РЈСЂРѕРєРѕРІ"]].map(([ic,v,lb])=>(
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
                <span style={{ fontSize:13, fontWeight:700 }}>РћР±С‰РёР№ РїСЂРѕРіСЂРµСЃСЃ</span>
                <span style={{ fontSize:13, color:"#A78BFA", fontWeight:700 }}>{langsDone}/{totalLessons}</span>
              </div>
              <div style={{ background:"rgba(255,255,255,.08)", borderRadius:100, height:8 }}>
                <div style={{ height:"100%", width:`${Math.round((langsDone/Math.max(totalLessons,1))*100)}%`, background:"linear-gradient(90deg,#6366F1,#A855F7)", borderRadius:100, transition:"width .5s" }}/>
              </div>
            </div>

            {/* Subscribed languages */}
            {authUser?.subscribedLangs?.length > 0 && (
              <div style={{ background:"rgba(255,255,255,.04)", border:"1px solid rgba(255,255,255,.08)", borderRadius:18, padding:18, marginBottom:16 }}>
                <div style={{ fontSize:13, fontWeight:700, color:"#6B7280", letterSpacing:1, marginBottom:12 }}>РњРћР РЇР—Р«РљР (РїРѕРґРїРёСЃРєР°)</div>
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
                  рџ’Ћ РћС„РѕСЂРјРёС‚СЊ РїРѕРґРїРёСЃРєСѓ
                </button>
              )}
              {authUser?.hasActiveSubscription && (
                <button onClick={handleManageSub} style={{ background:"rgba(99,102,241,.2)", border:"1px solid rgba(99,102,241,.4)", color:"#A78BFA", borderRadius:16, padding:16, fontSize:15, fontWeight:700, cursor:"pointer" }}>
                  вљ™пёЏ РЈРїСЂР°РІР»РµРЅРёРµ РїРѕРґРїРёСЃРєРѕР№
                </button>
              )}
              <button onClick={handleLogout} style={{ background:"rgba(239,68,68,.1)", border:"1px solid rgba(239,68,68,.3)", color:"#EF4444", borderRadius:16, padding:14, fontSize:14, fontWeight:600, cursor:"pointer" }}>
                Р’С‹Р№С‚Рё РёР· Р°РєРєР°СѓРЅС‚Р°
              </button>
            </div>
          </div>
          <div style={{ height:32 }}/>
        </div>
      </div>
    );
  }

  // в”Ђв”Ђ PRICING в”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђ
  if (screen === "pricing") {
    const isUz = nativeLang === "uz";

    const STAGES = [
      {
        id: "beginner",
        level: isUz ? "Boshlang'ich" : "РќР°С‡РёРЅР°СЋС‰РёР№",
        levelEn: "Beginner (A1-A2)",
        emoji: "рџЊ±",
        color: "#10B981",
        duration: isUz ? "3 oy" : "3 РјРµСЃСЏС†Р°",
        desc: isUz ? "Alifbo, so'zlar, jumlalar, oddiy suhbat" : "РђР»С„Р°РІРёС‚, СЃР»РѕРІР°, С„СЂР°Р·С‹, РїСЂРѕСЃС‚РѕР№ СЂР°Р·РіРѕРІРѕСЂ",
        topics: isUz
          ? ["Salomlashish va tanishish","Raqamlar va ranglar","Oziq-ovqat va do'kon","Oila va uy","Vaqt va ob-havo"]
          : ["РџСЂРёРІРµС‚СЃС‚РІРёСЏ Рё Р·РЅР°РєРѕРјСЃС‚РІРѕ","Р§РёСЃР»Р° Рё С†РІРµС‚Р°","Р•РґР° Рё РјР°РіР°Р·РёРЅ","РЎРµРјСЊСЏ Рё РґРѕРј","Р’СЂРµРјСЏ Рё РїРѕРіРѕРґР°"],
        plans: [
          { id:"b1", label: isUz ? "1 oy" : "1 РјРµСЃСЏС†", months:1, price:10, perMonth:10, badge:null },
          { id:"b3", label: isUz ? "3 oy (tejam!)" : "3 РјРµСЃСЏС†Р° (РІС‹РіРѕРґРЅРѕ!)", months:3, price:25, perMonth:8.33, badge: isUz ? "в€’17%" : "в€’17%", highlight:true },
        ]
      },
      {
        id: "intermediate",
        level: isUz ? "O'rta daraja" : "РЎСЂРµРґРЅРёР№",
        levelEn: "Intermediate (B1-B2)",
        emoji: "рџ”Ґ",
        color: "#F59E0B",
        duration: isUz ? "3 oy" : "3 РјРµСЃСЏС†Р°",
        desc: isUz ? "Grammatika, dialoglar, ish va sayohat mavzulari" : "Р“СЂР°РјРјР°С‚РёРєР°, РґРёР°Р»РѕРіРё, С‚РµРјС‹ СЂР°Р±РѕС‚С‹ Рё РїСѓС‚РµС€РµСЃС‚РІРёР№",
        topics: isUz
          ? ["Ish va karyera","Sayohat va transport","Sog'liq va tibbiyot","Xarid va pul","Ta'lim va fan"]
          : ["Р Р°Р±РѕС‚Р° Рё РєР°СЂСЊРµСЂР°","РџСѓС‚РµС€РµСЃС‚РІРёСЏ Рё С‚СЂР°РЅСЃРїРѕСЂС‚","Р—РґРѕСЂРѕРІСЊРµ Рё РјРµРґРёС†РёРЅР°","РџРѕРєСѓРїРєРё Рё РґРµРЅСЊРіРё","РћР±СЂР°Р·РѕРІР°РЅРёРµ Рё РЅР°СѓРєР°"],
        plans: [
          { id:"m1", label: isUz ? "1 oy" : "1 РјРµСЃСЏС†", months:1, price:10, perMonth:10, badge:null },
          { id:"m3", label: isUz ? "3 oy (tejam!)" : "3 РјРµСЃСЏС†Р° (РІС‹РіРѕРґРЅРѕ!)", months:3, price:25, perMonth:8.33, badge:"в€’17%", highlight:true },
        ]
      },
      {
        id: "advanced",
        level: isUz ? "Yuqori daraja" : "РџСЂРѕРґРІРёРЅСѓС‚С‹Р№",
        levelEn: "Advanced (C1-C2)",
        emoji: "вљЎ",
        color: "#EF4444",
        duration: isUz ? "3 oy" : "3 РјРµСЃСЏС†Р°",
        desc: isUz ? "Biznes ingliz tili, idiomalar, ravon nutq" : "Р”РµР»РѕРІРѕР№ Р°РЅРіР»РёР№СЃРєРёР№, РёРґРёРѕРјС‹, Р±РµРіР»Р°СЏ СЂРµС‡СЊ",
        topics: isUz
          ? ["Biznes muloqot","Muzokaralar va taqdimotlar","Akademik yozish","Idiomalar va iboralar","Media va adabiyot"]
          : ["Р”РµР»РѕРІР°СЏ РєРѕРјРјСѓРЅРёРєР°С†РёСЏ","РџРµСЂРµРіРѕРІРѕСЂС‹ Рё РїСЂРµР·РµРЅС‚Р°С†РёРё","РђРєР°РґРµРјРёС‡РµСЃРєРѕРµ РїРёСЃСЊРјРѕ","РРґРёРѕРјС‹ Рё РІС‹СЂР°Р¶РµРЅРёСЏ","РЎРњР Рё Р»РёС‚РµСЂР°С‚СѓСЂР°"],
        plans: [
          { id:"a1", label: isUz ? "1 oy" : "1 РјРµСЃСЏС†", months:1, price:10, perMonth:10, badge:null },
          { id:"a3", label: isUz ? "3 oy (tejam!)" : "3 РјРµСЃСЏС†Р° (РІС‹РіРѕРґРЅРѕ!)", months:3, price:25, perMonth:8.33, badge:"в€’17%", highlight:true },
        ]
      },
    ];

    const FULL_COURSE = {
      id: "full",
      label: isUz ? "рџЋ“ To'liq kurs вЂ” 9 oy" : "рџЋ“ РџРѕР»РЅС‹Р№ РєСѓСЂСЃ вЂ” 9 РјРµСЃСЏС†РµРІ",
      desc: isUz ? "A1 dan C2 gacha вЂ” barcha 3 bosqich" : "РћС‚ A1 РґРѕ C2 вЂ” РІСЃРµ 3 СЌС‚Р°РїР°",
      price: 60,
      perMonth: 6.67,
      originalPrice: 90,
      save: 30,
      badge: isUz ? "в€’33% YAXSHI NARX" : "в€’33% Р›РЈР§РЁРђРЇ Р¦Р•РќРђ",
    };

    return (
      <div style={S.app}>
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet"/>
        <div style={S.bg}/>
        <div style={S.wrap}>
          <div style={{ padding:"48px 24px 20px", display:"flex", alignItems:"center", gap:14 }}>
            <button onClick={()=>setScreen("home")} style={S.backBtn}>в†ђ</button>
            <div>
              <h2 style={{ margin:0, fontSize:22, fontWeight:800 }}>
                {isUz ? "Kurs narxlari" : "РЎС‚РѕРёРјРѕСЃС‚СЊ РєСѓСЂСЃР°"}
              </h2>
              <p style={{ margin:"3px 0 0", fontSize:13, color:"#6B7280" }}>
                рџ‡¬рџ‡§ English В· A1 в†’ C2
              </p>
            </div>
          </div>

          {/* FULL COURSE BANNER */}
          <div style={{ margin:"0 24px 20px" }}>
            <div onClick={()=>setSelectedPlan(selectedPlan===FULL_COURSE.id ? null : FULL_COURSE.id)}
              style={{ background: selectedPlan===FULL_COURSE.id ? "linear-gradient(135deg,rgba(99,102,241,.4),rgba(168,85,247,.4))" : "linear-gradient(135deg,rgba(99,102,241,.2),rgba(168,85,247,.2))", border:`2px solid ${selectedPlan===FULL_COURSE.id?"#6366F1":"rgba(99,102,241,.5)"}`, borderRadius:20, padding:20, cursor:"pointer", position:"relative", transition:"all .2s" }}>
              <div style={{ position:"absolute", top:-12, left:"50%", transform:"translateX(-50%)", background:"linear-gradient(135deg,#6366F1,#A855F7)", borderRadius:100, padding:"4px 16px", fontSize:12, fontWeight:800, whiteSpace:"nowrap" }}>
                в­ђ {FULL_COURSE.badge}
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
                    ${FULL_COURSE.perMonth.toFixed(2)}{isUz ? "/oy" : "/РјРµСЃ"} В· {isUz ? `${FULL_COURSE.save}$ tejaysiz` : `СЌРєРѕРЅРѕРјРёСЏ $${FULL_COURSE.save}`}
                  </div>
                </div>
                <div style={{ fontSize:32 }}>{selectedPlan===FULL_COURSE.id ? "вњ…" : "в­•"}</div>
              </div>
            </div>
          </div>

          {/* DIVIDER */}
          <div style={{ display:"flex", alignItems:"center", gap:12, padding:"0 24px", marginBottom:16 }}>
            <div style={{ flex:1, height:1, background:"rgba(255,255,255,.08)" }}/>
            <span style={{ fontSize:12, color:"#6B7280", fontWeight:600 }}>{isUz ? "YOKI ALOHIDA BOSQICH" : "РР›Р РћРўР”Р•Р›Р¬РќР«Р™ Р­РўРђРџ"}</span>
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
                          <span style={{ fontSize:16, fontWeight:800 }}>{isUz ? `${si+1}-bosqich:` : `Р­С‚Р°Рї ${si+1}:`}</span>
                          <span style={{ fontSize:16, fontWeight:800, color:stage.color }}>{stage.level}</span>
                        </div>
                        <div style={{ fontSize:12, color:"#6B7280", marginTop:2 }}>{stage.levelEn} В· {stage.duration}</div>
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
                        <div style={{ fontSize:11, color:"#6B7280", marginTop:2 }}>${plan.perMonth.toFixed(2)}{isUz?"/oy":"/РјРµСЃ"}</div>
                        {selectedPlan===plan.id && <div style={{ fontSize:16, marginTop:6 }}>вњ…</div>}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}

            {/* Guarantee */}
            <div style={{ background:"rgba(16,185,129,.08)", border:"1px solid rgba(16,185,129,.25)", borderRadius:16, padding:"14px 18px", marginBottom:20, display:"flex", alignItems:"center", gap:12 }}>
              <span style={{ fontSize:24 }}>рџ›ЎпёЏ</span>
              <div>
                <div style={{ fontWeight:700, fontSize:14, color:"#10B981" }}>{isUz ? "7 kunlik kafolat" : "7-РґРЅРµРІРЅР°СЏ РіР°СЂР°РЅС‚РёСЏ"}</div>
                <div style={{ fontSize:12, color:"#9CA3AF", marginTop:2 }}>{isUz ? "Yoqmasa вЂ” to'liq qaytaramiz, savol yo'q" : "РќРµ РїРѕРЅСЂР°РІРёС‚СЃСЏ вЂ” РїРѕР»РЅС‹Р№ РІРѕР·РІСЂР°С‚, Р±РµР· РІРѕРїСЂРѕСЃРѕРІ"}</div>
              </div>
            </div>

            {/* CTA */}
            {selectedPlan && (
              <button onClick={()=>{ if(!authToken){ setScreen("auth"); } else { handleCheckout(); } }}
                disabled={subLoading}
                style={{ width:"100%", background:"linear-gradient(135deg,#6366F1,#A855F7)", border:"none", color:"#fff", borderRadius:18, padding:20, fontSize:17, fontWeight:800, cursor:"pointer", marginBottom:10, animation:"fadeUp .25s ease" }}>
                {subLoading ? "вЏі ..." : authToken
                  ? `рџ’і ${isUz ? "To'lash" : "РћРїР»Р°С‚РёС‚СЊ"} вЂ” ${ selectedPlan===FULL_COURSE.id ? FULL_COURSE.price : [...STAGES.flatMap(s=>s.plans)].find(p=>p.id===selectedPlan)?.price || "" }`
                  : `рџ”‘ ${isUz ? "Kirish va to'lash" : "Р’РѕР№С‚Рё Рё РѕРїР»Р°С‚РёС‚СЊ"}`}
              </button>
            )}
            {!selectedPlan && (
              <div style={{ width:"100%", background:"rgba(255,255,255,.06)", border:"1px solid rgba(255,255,255,.1)", color:"#4B5563", borderRadius:18, padding:20, fontSize:15, fontWeight:700, textAlign:"center" }}>
                {isUz ? "в¬†пёЏ Rejani tanlang" : "в¬†пёЏ Р’С‹Р±РµСЂРёС‚Рµ РїР»Р°РЅ"}
              </div>
            )}
            <div style={{ textAlign:"center", fontSize:12, color:"#4B5563", marginTop:10, marginBottom:8 }}>
              {isUz ? "Istalgan vaqtda bekor qilish mumkin" : "РћС‚РјРµРЅРёС‚СЊ РјРѕР¶РЅРѕ РІ Р»СЋР±РѕР№ РјРѕРјРµРЅС‚"}
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
              <div style={{ fontSize:52, marginBottom:12 }}>рџ‡¬рџ‡§</div>
              <div style={{ fontSize:26, fontWeight:900, marginBottom:4 }}>English</div>
              <div style={{ fontSize:14, color:"#9CA3AF", marginBottom:20 }}>
                {nativeLang === "uz" ? "Ingliz tili вЂ” to'liq kurs" : "РђРЅРіР»РёР№СЃРєРёР№ СЏР·С‹Рє вЂ” РїРѕР»РЅС‹Р№ РєСѓСЂСЃ"}
              </div>
              <div style={{ fontSize:42, fontWeight:900, color:"#3B82F6", marginBottom:4 }}>$10<span style={{ fontSize:16, color:"#6B7280", fontWeight:400 }}>/РјРµСЃ</span></div>
            </div>

            {/* Features */}
            <div style={{ display:"flex", flexDirection:"column", gap:10, marginBottom:20 }}>
              {[
                ["вњ…", nativeLang==="uz" ? "Cheksiz darslar вЂ” boshlang'ichdan ilg'orgacha" : "Р‘РµР·Р»РёРјРёС‚РЅС‹Рµ СѓСЂРѕРєРё вЂ” СЃ РЅСѓР»СЏ РґРѕ РїСЂРѕРґРІРёРЅСѓС‚РѕРіРѕ"],
                ["рџЋЇ", nativeLang==="uz" ? "4 xil mashq turi: test, tarjima, gap tuzish" : "4 С‚РёРїР° СѓРїСЂР°Р¶РЅРµРЅРёР№: С‚РµСЃС‚, РїРµСЂРµРІРѕРґ, СЃРѕСЃС‚Р°РІСЊ С„СЂР°Р·Сѓ"],
                ["рџ”Љ", nativeLang==="uz" ? "Audio talaffuz har bir so'z uchun" : "РђСѓРґРёРѕ РїСЂРѕРёР·РЅРѕС€РµРЅРёРµ РґР»СЏ РєР°Р¶РґРѕРіРѕ СЃР»РѕРІР°"],
                ["рџ¤–", nativeLang==="uz" ? "AI murabbiy вЂ” 24/7 inglizcha suhbat" : "AI-РЅР°СЃС‚Р°РІРЅРёРє вЂ” СЂР°Р·РіРѕРІРѕСЂРЅР°СЏ РїСЂР°РєС‚РёРєР° 24/7"],
                ["рџ”Ґ", nativeLang==="uz" ? "Streak va XP tizimi вЂ” motivatsiya" : "РЎРёСЃС‚РµРјР° СЃС‚СЂРёРє Рё XP вЂ” РјРѕС‚РёРІР°С†РёСЏ РєР°Р¶РґС‹Р№ РґРµРЅСЊ"],
                ["вќ¤пёЏ", nativeLang==="uz" ? "Jonlar tizimi вЂ” o'yindek qiziqarli" : "РЎРёСЃС‚РµРјР° Р¶РёР·РЅРµР№ вЂ” СѓС‡С‘Р±Р° РєР°Рє РёРіСЂР°"],
              ].map(([ic, text]) => (
                <div key={text} style={{ background:"rgba(255,255,255,.04)", border:"1px solid rgba(255,255,255,.08)", borderRadius:14, padding:"14px 16px", display:"flex", alignItems:"center", gap:12 }}>
                  <span style={{ fontSize:20 }}>{ic}</span>
                  <span style={{ fontSize:14, fontWeight:600 }}>{text}</span>
                </div>
              ))}
            </div>

            {/* Guarantee */}
            <div style={{ background:"linear-gradient(135deg,rgba(16,185,129,.15),rgba(5,150,105,.15))", border:"1px solid rgba(16,185,129,.3)", borderRadius:16, padding:"14px 18px", marginBottom:20, display:"flex", alignItems:"center", gap:12 }}>
              <span style={{ fontSize:24 }}>рџ›ЎпёЏ</span>
              <div>
                <div style={{ fontWeight:700, fontSize:14, color:"#10B981" }}>
                  {nativeLang==="uz" ? "7 kunlik kafolat" : "7-РґРЅРµРІРЅР°СЏ РіР°СЂР°РЅС‚РёСЏ"}
                </div>
                <div style={{ fontSize:12, color:"#9CA3AF", marginTop:2 }}>
                  {nativeLang==="uz" ? "Yoqmasa вЂ” to'liq qaytaramiz" : "РќРµ РїРѕРЅСЂР°РІРёС‚СЃСЏ вЂ” РІРµСЂРЅС‘Рј РґРµРЅСЊРіРё"}
                </div>
              </div>
            </div>

            {/* CTA button */}
            <button onClick={()=>{ if(!authToken){ setScreen("auth"); } else { handleCheckout(); } }}
              disabled={subLoading}
              style={{ width:"100%", background:"linear-gradient(135deg,#3B82F6,#6366F1)", border:"none", color:"#fff", borderRadius:18, padding:20, fontSize:17, fontWeight:800, cursor:"pointer", marginBottom:12 }}>
              {subLoading ? "вЏі ..." : authToken ? `рџ’і ${nativeLang==="uz" ? "Obuna bo'lish вЂ” $10/oy" : "РџРѕРґРїРёСЃР°С‚СЊСЃСЏ вЂ” $10/РјРµСЃ"}` : `рџ”‘ ${nativeLang==="uz" ? "Kirish va obuna" : "Р’РѕР№С‚Рё Рё РїРѕРґРїРёСЃР°С‚СЊСЃСЏ"}`}
            </button>

            <div style={{ textAlign:"center", fontSize:12, color:"#4B5563" }}>
              {nativeLang==="uz" ? "Istalgan vaqtda bekor qilish mumkin" : "РћС‚РјРµРЅРёС‚СЊ РјРѕР¶РЅРѕ РІ Р»СЋР±РѕР№ РјРѕРјРµРЅС‚"}
            </div>
          </div>
          <div style={{ height:32 }}/>
        </div>
      </div>
    );
  }

  return null;
}
