import { useState, useEffect, useRef } from "react";

// в”Ђв”Ђ CONSTANTS в”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђ
const LEVELS = [
  { id:"beginner",     emoji:"рџЊ±", color:"#10B981",
    ru:{ name:"РќР°С‡РёРЅР°СЋС‰РёР№",   desc:"РђР»С„Р°РІРёС‚, СЃР»РѕРІР°, С„СЂР°Р·С‹",     tag:"A1вЂ“A2" },
    uz:{ name:"Boshlang'ich", desc:"Alifbo, so'zlar, jumlalar", tag:"A1вЂ“A2" } },
  { id:"intermediate", emoji:"рџ”Ґ", color:"#F59E0B",
    ru:{ name:"РЎСЂРµРґРЅРёР№",      desc:"Р“СЂР°РјРјР°С‚РёРєР°, РґРёР°Р»РѕРіРё",        tag:"B1вЂ“B2" },
    uz:{ name:"O'rta",        desc:"Grammatika, dialoglar",      tag:"B1вЂ“B2" } },
  { id:"advanced",     emoji:"вљЎ", color:"#EF4444",
    ru:{ name:"РџСЂРѕРґРІРёРЅСѓС‚С‹Р№",  desc:"Р‘РµРіР»РѕСЃС‚СЊ, Р±РёР·РЅРµСЃ-СЏР·С‹Рє",     tag:"C1вЂ“C2" },
    uz:{ name:"Yuqori",       desc:"Ravonlik, biznes tili",      tag:"C1вЂ“C2" } },
];

const PLANS = [
  { id:"m1", months:1, price:10, ru:"1 РјРµСЃСЏС†",           uz:"1 oy" },
  { id:"m3", months:3, price:25, ru:"3 РјРµСЃСЏС†Р° в€’17%",     uz:"3 oy в€’17%",  badge:true },
  { id:"m9", months:9, price:60, ru:"РџРѕР»РЅС‹Р№ РєСѓСЂСЃ в€’33%",  uz:"To'liq kurs в€’33%", best:true },
];

const LESSONS = {
  beginner: [
    { id:1, emoji:"рџ‘‹", ru:"РџСЂРёРІРµС‚СЃС‚РІРёСЏ", uz:"Salomlashish",
      exercises:[
        { type:"choose", word:"Hello",    ru:"РџСЂРёРІРµС‚",       uz:"Salom",        wrong:["Goodbye","Sorry","Please"] },
        { type:"choose", word:"Goodbye",  ru:"Р”Рѕ СЃРІРёРґР°РЅРёСЏ",  uz:"Xayr",         wrong:["Hello","Thanks","Yes"] },
        { type:"choose", word:"Thank you",ru:"РЎРїР°СЃРёР±Рѕ",      uz:"Rahmat",       wrong:["Sorry","No","Hello"] },
        { type:"fill",   sentence:"___ are you?", answer:"How", options:["How","What","Where","Who"],
          ru:"РљР°Рє С‚С‹?", uz:"Qandaysiz?" },
        { type:"translate", source:{ru:"РњРµРЅСЏ Р·РѕРІСѓС‚ РќСѓСЃСЂР°С‚", uz:"Mening ismim Nusrat"}, answer:"My name is Nusrat" },
      ]},
    { id:2, emoji:"рџ”ў", ru:"Р§РёСЃР»Р°", uz:"Raqamlar",
      exercises:[
        { type:"choose", word:"One",   ru:"РћРґРёРЅ",  uz:"Bir",  wrong:["Two","Three","Four"] },
        { type:"choose", word:"Five",  ru:"РџСЏС‚СЊ",  uz:"Besh", wrong:["Six","Seven","Ten"] },
        { type:"choose", word:"Ten",   ru:"Р”РµСЃСЏС‚СЊ",uz:"O'n",  wrong:["One","Two","Five"] },
        { type:"fill",   sentence:"I have ___ apples.", answer:"three", options:["three","five","ten","one"],
          ru:"РЈ РјРµРЅСЏ С‚СЂРё СЏР±Р»РѕРєР°.", uz:"Menda uchta olma bor." },
        { type:"translate", source:{ru:"Р”РІР° РїР»СЋСЃ С‚СЂРё СЂР°РІРЅРѕ РїСЏС‚СЊ",uz:"Ikki tambla uch beshga teng"}, answer:"Two plus three equals five" },
      ]},
    { id:3, emoji:"рџЌЋ", ru:"Р•РґР°", uz:"Ovqat",
      exercises:[
        { type:"choose", word:"Water",  ru:"Р’РѕРґР°",   uz:"Suv",   wrong:["Milk","Juice","Tea"] },
        { type:"choose", word:"Bread",  ru:"РҐР»РµР±",   uz:"Non",   wrong:["Rice","Meat","Fish"] },
        { type:"choose", word:"Coffee", ru:"РљРѕС„Рµ",   uz:"Qahva", wrong:["Tea","Juice","Water"] },
        { type:"fill",   sentence:"This is very ___.", answer:"delicious", options:["delicious","terrible","cold","hot"],
          ru:"Р­С‚Рѕ РѕС‡РµРЅСЊ РІРєСѓСЃРЅРѕ.", uz:"Bu juda mazali." },
        { type:"translate", source:{ru:"РЇ С…РѕС‡Сѓ РєРѕС„Рµ РїРѕР¶Р°Р»СѓР№СЃС‚Р°",uz:"Menga qahva bering iltimos"}, answer:"I want coffee please" },
      ]},
    { id:4, emoji:"рџ‘ЁвЂЌрџ‘©вЂЌрџ‘§", ru:"РЎРµРјСЊСЏ", uz:"Oila",
      exercises:[
        { type:"choose", word:"Mother", ru:"РњР°РјР°",   uz:"Ona",     wrong:["Father","Sister","Brother"] },
        { type:"choose", word:"Father", ru:"РџР°РїР°",   uz:"Ota",     wrong:["Mother","Brother","Sister"] },
        { type:"choose", word:"Sister", ru:"РЎРµСЃС‚СЂР°", uz:"Singil",  wrong:["Brother","Mother","Father"] },
        { type:"fill",   sentence:"I have two ___.", answer:"sisters", options:["sisters","brothers","fathers","cats"],
          ru:"РЈ РјРµРЅСЏ РґРІРµ СЃРµСЃС‚СЂС‹.", uz:"Mening ikki singlim bor." },
        { type:"translate", source:{ru:"РњРѕСЏ СЃРµРјСЊСЏ Р±РѕР»СЊС€Р°СЏ",uz:"Mening oilam katta"}, answer:"My family is big" },
      ]},
    { id:5, emoji:"рџЋЁ", ru:"Р¦РІРµС‚Р°", uz:"Ranglar",
      exercises:[
        { type:"choose", word:"Red",   ru:"РљСЂР°СЃРЅС‹Р№", uz:"Qizil",  wrong:["Blue","Green","Yellow"] },
        { type:"choose", word:"Blue",  ru:"РЎРёРЅРёР№",   uz:"Ko'k",   wrong:["Red","Green","Black"] },
        { type:"choose", word:"Green", ru:"Р—РµР»С‘РЅС‹Р№", uz:"Yashil", wrong:["Red","Blue","White"] },
        { type:"fill",   sentence:"The sky is ___.", answer:"blue", options:["blue","red","green","black"],
          ru:"РќРµР±Рѕ РіРѕР»СѓР±РѕРµ.", uz:"Osmon ko'k." },
        { type:"translate", source:{ru:"РњРѕСЏ РјР°С€РёРЅР° РєСЂР°СЃРЅР°СЏ",uz:"Mening mashinam qizil"}, answer:"My car is red" },
      ]},
    { id:6, emoji:"вЏ°", ru:"Р’СЂРµРјСЏ", uz:"Vaqt",
      exercises:[
        { type:"choose", word:"Morning",   ru:"РЈС‚СЂРѕ",    uz:"Ertalab",   wrong:["Evening","Night","Day"] },
        { type:"choose", word:"Evening",   ru:"Р’РµС‡РµСЂ",   uz:"Kechqurun", wrong:["Morning","Night","Noon"] },
        { type:"choose", word:"Yesterday", ru:"Р’С‡РµСЂР°",   uz:"Kecha",     wrong:["Today","Tomorrow","Now"] },
        { type:"fill",   sentence:"See you ___!", answer:"tomorrow", options:["tomorrow","yesterday","never","now"],
          ru:"РЈРІРёРґРёРјСЃСЏ Р·Р°РІС‚СЂР°!", uz:"Ertaga ko'rishguncha!" },
        { type:"translate", source:{ru:"РљРѕС‚РѕСЂС‹Р№ С‡Р°СЃ?",uz:"Soat necha?"}, answer:"What time is it?" },
      ]},
  ],

    { id:7, emoji:"рџЏ™пёЏ", ru:"Р“РѕСЂРѕРґ", uz:"Shahar",
      exercises:[
        { type:"choose", word:"Street",   ru:"РЈР»РёС†Р°",    uz:"Ko'cha",    wrong:["Road","Park","Square"] },
        { type:"choose", word:"Hospital", ru:"Р‘РѕР»СЊРЅРёС†Р°", uz:"Kasalxona", wrong:["School","Bank","Hotel"] },
        { type:"choose", word:"Market",   ru:"Р С‹РЅРѕРє",    uz:"Bozor",     wrong:["Mall","Shop","Store"] },
        { type:"fill",   sentence:"Turn ___ at the corner.", answer:"left", options:["left","right","back","straight"],
          ru:"РџРѕРІРµСЂРЅСѓС‚СЊ РЅР°Р»РµРІРѕ РЅР° СѓРіР»Сѓ.", uz:"Burchakda chapga buring." },
        { type:"translate", source:{ru:"Р“РґРµ Р±Р»РёР¶Р°Р№С€РµРµ РјРµС‚СЂРѕ?",uz:"Eng yaqin metro qayerda?"}, answer:"Where is the nearest subway?" },
      ]},
    { id:8, emoji:"рџЊ¦пёЏ", ru:"РџРѕРіРѕРґР°", uz:"Ob-havo",
      exercises:[
        { type:"choose", word:"Sunny",  ru:"РЎРѕР»РЅРµС‡РЅРѕ", uz:"Quyoshli", wrong:["Rainy","Cloudy","Windy"] },
        { type:"choose", word:"Storm",  ru:"РЁС‚РѕСЂРј",    uz:"Bo'ron",   wrong:["Rain","Snow","Wind"] },
        { type:"choose", word:"Cloudy", ru:"РћР±Р»Р°С‡РЅРѕ",  uz:"Bulutli",  wrong:["Sunny","Rainy","Foggy"] },
        { type:"fill",   sentence:"It is very ___ today.", answer:"hot", options:["hot","cold","windy","rainy"],
          ru:"РЎРµРіРѕРґРЅСЏ РѕС‡РµРЅСЊ Р¶Р°СЂРєРѕ.", uz:"Bugun juda issiq." },
        { type:"translate", source:{ru:"РљР°РєР°СЏ РїРѕРіРѕРґР° Р·Р°РІС‚СЂР°?",uz:"Ertaga ob-havo qanday?"}, answer:"What is the weather tomorrow?" },
      ]},
    { id:9, emoji:"рџ’Є", ru:"РЎРїРѕСЂС‚", uz:"Sport",
      exercises:[
        { type:"choose", word:"Football",    ru:"Р¤СѓС‚Р±РѕР»",    uz:"Futbol",    wrong:["Tennis","Boxing","Golf"] },
        { type:"choose", word:"Swimming",    ru:"РџР»Р°РІР°РЅРёРµ",  uz:"Suzish",    wrong:["Running","Cycling","Skiing"] },
        { type:"choose", word:"Champion",    ru:"Р§РµРјРїРёРѕРЅ",   uz:"Chempion",  wrong:["Loser","Player","Coach"] },
        { type:"fill",   sentence:"I ___ every morning.", answer:"exercise", options:["exercise","sleep","eat","work"],
          ru:"РЇ Р·Р°РЅРёРјР°СЋСЃСЊ РєР°Р¶РґРѕРµ СѓС‚СЂРѕ.", uz:"Men har ertalab mashq qilaman." },
        { type:"translate", source:{ru:"РЇ Р»СЋР±Р»СЋ РёРіСЂР°С‚СЊ РІ С„СѓС‚Р±РѕР»",uz:"Men futbol o'ynashni yaxshi ko'raman"}, answer:"I love playing football" },
      ]},
    { id:10, emoji:"рџЋµ", ru:"РњСѓР·С‹РєР°", uz:"Musiqa",
      exercises:[
        { type:"choose", word:"Song",    ru:"РџРµСЃРЅСЏ",     uz:"Qo'shiq",  wrong:["Dance","Movie","Book"] },
        { type:"choose", word:"Guitar",  ru:"Р“РёС‚Р°СЂР°",    uz:"Gitara",   wrong:["Piano","Violin","Drum"] },
        { type:"choose", word:"Concert", ru:"РљРѕРЅС†РµСЂС‚",   uz:"Konsert",  wrong:["Festival","Party","Show"] },
        { type:"fill",   sentence:"She can ___ the piano.", answer:"play", options:["play","sing","dance","hear"],
          ru:"РћРЅР° СѓРјРµРµС‚ РёРіСЂР°С‚СЊ РЅР° РїРёР°РЅРёРЅРѕ.", uz:"U pianino chala oladi." },
        { type:"translate", source:{ru:"РљР°РєР°СЏ С‚РІРѕСЏ Р»СЋР±РёРјР°СЏ РїРµСЃРЅСЏ?",uz:"Sevimli qo'shig'ingiz qaysi?"}, answer:"What is your favourite song?" },
      ]},
    { id:11, emoji:"рџ“љ", ru:"РћР±СЂР°Р·РѕРІР°РЅРёРµ", uz:"Ta'lim",
      exercises:[
        { type:"choose", word:"Student",   ru:"РЎС‚СѓРґРµРЅС‚",  uz:"Talaba",    wrong:["Teacher","Doctor","Engineer"] },
        { type:"choose", word:"Library",   ru:"Р‘РёР±Р»РёРѕС‚РµРєР°",uz:"Kutubxona",wrong:["School","Office","Museum"] },
        { type:"choose", word:"Homework",  ru:"Р”РѕРјР°С€РЅРµРµ Р·Р°РґР°РЅРёРµ",uz:"Uy vazifasi",wrong:["Exam","Class","Book"] },
        { type:"fill",   sentence:"I study at ___.", answer:"university", options:["university","school","home","work"],
          ru:"РЇ СѓС‡СѓСЃСЊ РІ СѓРЅРёРІРµСЂСЃРёС‚РµС‚Рµ.", uz:"Men universitetda o'qiyman." },
        { type:"translate", source:{ru:"РњРЅРµ РЅСѓР¶РЅРѕ СЃРґР°С‚СЊ СЌРєР·Р°РјРµРЅ",uz:"Imtihon topshirishim kerak"}, answer:"I need to pass the exam" },
      ]},
    { id:12, emoji:"рџЏ–пёЏ", ru:"РћС‚РґС‹С…", uz:"Dam olish",
      exercises:[
        { type:"choose", word:"Beach",    ru:"РџР»СЏР¶",     uz:"Plyaj",   wrong:["Mountain","Forest","Desert"] },
        { type:"choose", word:"Hotel",    ru:"РћС‚РµР»СЊ",    uz:"Mehmonxona",wrong:["Airport","Station","Museum"] },
        { type:"choose", word:"Vacation", ru:"РћС‚РїСѓСЃРє",   uz:"Ta'til",  wrong:["Work","Study","Meeting"] },
        { type:"fill",   sentence:"I am going on ___.", answer:"vacation", options:["vacation","work","school","duty"],
          ru:"РЇ РёРґСѓ РІ РѕС‚РїСѓСЃРє.", uz:"Men ta'tilga ketaman." },
        { type:"translate", source:{ru:"РњРЅРµ РЅСЂР°РІРёС‚СЃСЏ РѕС‚РґС‹С…Р°С‚СЊ РЅР° РїР»СЏР¶Рµ",uz:"Men plyajda dam olishni yaxshi ko'raman"}, answer:"I love relaxing on the beach" },
      ]},
  intermediate: [
    { id:1, emoji:"рџ’ј", ru:"Р Р°Р±РѕС‚Р°", uz:"Ish",
      exercises:[
        { type:"choose", word:"Meeting",  ru:"РЎРѕРІРµС‰Р°РЅРёРµ", uz:"Yig'ilish", wrong:["Party","Break","Holiday"] },
        { type:"choose", word:"Deadline", ru:"Р”РµРґР»Р°Р№РЅ",   uz:"Muddat",    wrong:["Holiday","Meeting","Salary"] },
        { type:"choose", word:"Salary",   ru:"Р—Р°СЂРїР»Р°С‚Р°",  uz:"Maosh",     wrong:["Meeting","Break","Project"] },
        { type:"fill",   sentence:"The ___ is tomorrow.", answer:"deadline", options:["deadline","meeting","salary","office"],
          ru:"Р”РµРґР»Р°Р№РЅ Р·Р°РІС‚СЂР°.", uz:"Muddat ertaga." },
        { type:"translate", source:{ru:"РњРѕР№ РєРѕР»Р»РµРіР° РѕС‡РµРЅСЊ РїРѕР»РµР·РµРЅ",uz:"Hamkashim juda foydali"}, answer:"My colleague is very helpful" },
      ]},
    { id:2, emoji:"вњ€пёЏ", ru:"РџСѓС‚РµС€РµСЃС‚РІРёСЏ", uz:"Sayohat",
      exercises:[
        { type:"choose", word:"Passport", ru:"РџР°СЃРїРѕСЂС‚",   uz:"Pasport",  wrong:["Ticket","Visa","Bag"] },
        { type:"choose", word:"Airport",  ru:"РђСЌСЂРѕРїРѕСЂС‚",  uz:"Aeroport", wrong:["Hotel","Station","Port"] },
        { type:"choose", word:"Luggage",  ru:"Р‘Р°РіР°Р¶",     uz:"Bagaj",    wrong:["Ticket","Passport","Visa"] },
        { type:"fill",   sentence:"My flight is ___ by two hours.", answer:"delayed", options:["delayed","cancelled","early","late"],
          ru:"РњРѕР№ СЂРµР№СЃ Р·Р°РґРµСЂР¶Р°РЅ РЅР° РґРІР° С‡Р°СЃР°.", uz:"Mening reysim ikki soatga kechikdi." },
        { type:"translate", source:{ru:"Р“РґРµ РјРѕР№ Р±Р°РіР°Р¶?",uz:"Mening bagajim qayerda?"}, answer:"Where is my luggage?" },
      ]},
    { id:3, emoji:"рџЏҐ", ru:"Р—РґРѕСЂРѕРІСЊРµ", uz:"Salomatlik",
      exercises:[
        { type:"choose", word:"Doctor",    ru:"Р’СЂР°С‡",        uz:"Shifokor",  wrong:["Nurse","Patient","Dentist"] },
        { type:"choose", word:"Headache",  ru:"Р“РѕР»РѕРІРЅР°СЏ Р±РѕР»СЊ",uz:"Bosh og'riq",wrong:["Fever","Cough","Cold"] },
        { type:"choose", word:"Medicine",  ru:"Р›РµРєР°СЂСЃС‚РІРѕ",   uz:"Dori",      wrong:["Food","Water","Vitamin"] },
        { type:"fill",   sentence:"I need to see a ___.", answer:"doctor", options:["doctor","nurse","patient","dentist"],
          ru:"РњРЅРµ РЅСѓР¶РЅРѕ Рє РІСЂР°С‡Сѓ.", uz:"Shifokorga borishim kerak." },
        { type:"translate", source:{ru:"РЈ РјРµРЅСЏ Р±РѕР»РёС‚ РіРѕР»РѕРІР°",uz:"Boshim og'riyapti"}, answer:"I have a headache" },
      ]},
    { id:4, emoji:"рџ›ЌпёЏ", ru:"РџРѕРєСѓРїРєРё", uz:"Xarid",
      exercises:[
        { type:"choose", word:"Expensive", ru:"Р”РѕСЂРѕРіРѕР№",  uz:"Qimmat", wrong:["Cheap","New","Old"] },
        { type:"choose", word:"Discount",  ru:"РЎРєРёРґРєР°",   uz:"Chegirma",wrong:["Price","Size","Color"] },
        { type:"choose", word:"Receipt",   ru:"Р§РµРє",      uz:"Kvitansiya",wrong:["Card","Cash","Price"] },
        { type:"fill",   sentence:"Can I have the ___ please?", answer:"receipt", options:["receipt","discount","price","size"],
          ru:"Р”Р°Р№С‚Рµ С‡РµРє РїРѕР¶Р°Р»СѓР№СЃС‚Р°.", uz:"Kvitansiya bering iltimos." },
        { type:"translate", source:{ru:"Р­С‚Рѕ СЃР»РёС€РєРѕРј РґРѕСЂРѕРіРѕ",uz:"Bu juda qimmat"}, answer:"This is too expensive" },
      ]},
    { id:5, emoji:"рџ’»", ru:"РўРµС…РЅРѕР»РѕРіРёРё", uz:"Texnologiya",
      exercises:[
        { type:"choose", word:"Software", ru:"РџСЂРѕРіСЂР°РјРјР°",  uz:"Dastur",   wrong:["Hardware","Network","Data"] },
        { type:"choose", word:"Password", ru:"РџР°СЂРѕР»СЊ",     uz:"Parol",    wrong:["Username","Email","Account"] },
        { type:"choose", word:"Download", ru:"РЎРєР°С‡Р°С‚СЊ",    uz:"Yuklab olish",wrong:["Upload","Delete","Share"] },
        { type:"fill",   sentence:"My computer has ___.", answer:"crashed", options:["crashed","updated","started","stopped"],
          ru:"РњРѕР№ РєРѕРјРїСЊСЋС‚РµСЂ Р·Р°РІРёСЃ.", uz:"Kompyuterim ishlamay qoldi." },
        { type:"translate", source:{ru:"РћР±РЅРѕРІРё РїСЂРѕРіСЂР°РјРјСѓ",uz:"Dasturni yangilang"}, answer:"Update the software" },
      ]},
    { id:6, emoji:"рџЏ¦", ru:"Р‘Р°РЅРє", uz:"Bank",
      exercises:[
        { type:"choose", word:"Account",  ru:"РЎС‡С‘С‚",    uz:"Hisob",  wrong:["Card","Loan","Cash"] },
        { type:"choose", word:"Withdraw", ru:"РЎРЅСЏС‚СЊ",   uz:"Yechib olish",wrong:["Deposit","Transfer","Pay"] },
        { type:"choose", word:"Transfer", ru:"РџРµСЂРµРІРѕРґ", uz:"O'tkazma",wrong:["Withdraw","Deposit","Loan"] },
        { type:"fill",   sentence:"I want to ___ money.", answer:"withdraw", options:["withdraw","deposit","transfer","save"],
          ru:"РЇ С…РѕС‡Сѓ СЃРЅСЏС‚СЊ РґРµРЅСЊРіРё.", uz:"Pul yechib olmoqchiman." },
        { type:"translate", source:{ru:"РЇ С…РѕС‡Сѓ РѕС‚РєСЂС‹С‚СЊ СЃС‡С‘С‚",uz:"Hisob ochmoqchiman"}, answer:"I want to open an account" },
      ]},
  ],

    { id:7, emoji:"рџЌЅпёЏ", ru:"Р’ СЂРµСЃС‚РѕСЂР°РЅРµ", uz:"Restoranda",
      exercises:[
        { type:"choose", word:"Menu",    ru:"РњРµРЅСЋ",     uz:"Menyu",    wrong:["Bill","Waiter","Table"] },
        { type:"choose", word:"Waiter",  ru:"РћС„РёС†РёР°РЅС‚", uz:"Ofitsiant",wrong:["Chef","Menu","Bill"] },
        { type:"choose", word:"Tip",     ru:"Р§Р°РµРІС‹Рµ",   uz:"Divident", wrong:["Tax","Bill","Price"] },
        { type:"fill",   sentence:"A table for ___, please.", answer:"two", options:["two","five","ten","one"],
          ru:"РЎС‚РѕР»РёРє РЅР° РґРІРѕРёС… РїРѕР¶Р°Р»СѓР№СЃС‚Р°.", uz:"Ikki kishilik stol iltimos." },
        { type:"translate", source:{ru:"РџСЂРёРЅРµСЃРёС‚Рµ СЃС‡С‘С‚ РїРѕР¶Р°Р»СѓР№СЃС‚Р°",uz:"Hisobni olib keling iltimos"}, answer:"Can I have the bill please?" },
      ]},
    { id:8, emoji:"рџЏ ", ru:"Р–РёР»СЊРµ", uz:"Uy-joy",
      exercises:[
        { type:"choose", word:"Rent",       ru:"РђСЂРµРЅРґР°",   uz:"Ijara",     wrong:["Buy","Sell","Build"] },
        { type:"choose", word:"Landlord",   ru:"РҐРѕР·СЏРёРЅ",   uz:"Uy egasi",  wrong:["Tenant","Guest","Friend"] },
        { type:"choose", word:"Apartment",  ru:"РљРІР°СЂС‚РёСЂР°", uz:"Kvartira",  wrong:["House","Hotel","Office"] },
        { type:"fill",   sentence:"I am looking for an ___ to rent.", answer:"apartment", options:["apartment","office","hotel","school"],
          ru:"РЇ РёС‰Сѓ РєРІР°СЂС‚РёСЂСѓ РґР»СЏ Р°СЂРµРЅРґС‹.", uz:"Ijaraga kvartira izlayapman." },
        { type:"translate", source:{ru:"РЎРєРѕР»СЊРєРѕ СЃС‚РѕРёС‚ Р°СЂРµРЅРґР°?",uz:"Ijara narxi qancha?"}, answer:"How much is the rent?" },
      ]},
    { id:9, emoji:"рџ“§", ru:"РџРµСЂРµРїРёСЃРєР°", uz:"Yozishmalar",
      exercises:[
        { type:"choose", word:"Attach",  ru:"РџСЂРёРєСЂРµРїРёС‚СЊ", uz:"Biriktirish",wrong:["Send","Delete","Forward"] },
        { type:"choose", word:"Reply",   ru:"РћС‚РІРµС‚РёС‚СЊ",   uz:"Javob berish",wrong:["Forward","Delete","Archive"] },
        { type:"choose", word:"Subject", ru:"РўРµРјР°",       uz:"Mavzu",      wrong:["Body","Header","Footer"] },
        { type:"fill",   sentence:"Please ___ the document.", answer:"attach", options:["attach","delete","forward","reply"],
          ru:"РџРѕР¶Р°Р»СѓР№СЃС‚Р° РїСЂРёРєСЂРµРїРёС‚Рµ РґРѕРєСѓРјРµРЅС‚.", uz:"Iltimos hujjatni biriktiring." },
        { type:"translate", source:{ru:"РЇ РѕС‚РІРµС‡Сѓ РІР°Рј Р·Р°РІС‚СЂР°",uz:"Ertaga javob beraman"}, answer:"I will reply to you tomorrow" },
      ]},
    { id:10, emoji:"рџ¤ќ", ru:"Р’СЃС‚СЂРµС‡Рё", uz:"Uchrashuvlar",
      exercises:[
        { type:"choose", word:"Appointment", ru:"Р—Р°РїРёСЃСЊ",      uz:"Uchrashuv",   wrong:["Meeting","Event","Party"] },
        { type:"choose", word:"Postpone",    ru:"РћС‚Р»РѕР¶РёС‚СЊ",    uz:"Kechiktirish",wrong:["Cancel","Start","Join"] },
        { type:"choose", word:"Confirm",     ru:"РџРѕРґС‚РІРµСЂРґРёС‚СЊ", uz:"Tasdiqlash",  wrong:["Cancel","Deny","Ignore"] },
        { type:"fill",   sentence:"Let's ___ the meeting.", answer:"confirm", options:["confirm","cancel","postpone","skip"],
          ru:"Р”Р°РІР°Р№С‚Рµ РїРѕРґС‚РІРµСЂРґРёРј РІСЃС‚СЂРµС‡Сѓ.", uz:"Uchrashuvni tasdiqlaymiz." },
        { type:"translate", source:{ru:"РљРѕРіРґР° РјС‹ РјРѕР¶РµРј РІСЃС‚СЂРµС‚РёС‚СЊСЃСЏ?",uz:"Qachon uchrasha olamiz?"}, answer:"When can we meet?" },
      ]},
    { id:11, emoji:"рџЊђ", ru:"РРЅС‚РµСЂРЅРµС‚", uz:"Internet",
      exercises:[
        { type:"choose", word:"Browser",  ru:"Р‘СЂР°СѓР·РµСЂ",   uz:"Brauzer",  wrong:["Server","Router","Modem"] },
        { type:"choose", word:"Search",   ru:"РџРѕРёСЃРє",     uz:"Qidiruv",  wrong:["Browse","Click","Share"] },
        { type:"choose", word:"Website",  ru:"РЎР°Р№С‚",      uz:"Sayt",     wrong:["App","Game","Software"] },
        { type:"fill",   sentence:"I use the internet to ___ information.", answer:"find", options:["find","hide","delete","send"],
          ru:"РЇ РёСЃРїРѕР»СЊР·СѓСЋ РёРЅС‚РµСЂРЅРµС‚ РґР»СЏ РїРѕРёСЃРєР° РёРЅС„РѕСЂРјР°С†РёРё.", uz:"Ma'lumot topish uchun internetdan foydalanaman." },
        { type:"translate", source:{ru:"РљР°РєРѕР№ Сѓ С‚РµР±СЏ РїР°СЂРѕР»СЊ РѕС‚ WiFi?",uz:"WiFi parolingiz nima?"}, answer:"What is your WiFi password?" },
      ]},
    { id:12, emoji:"рџЋЇ", ru:"Р¦РµР»Рё", uz:"Maqsadlar",
      exercises:[
        { type:"choose", word:"Goal",    ru:"Р¦РµР»СЊ",     uz:"Maqsad",   wrong:["Dream","Wish","Hope"] },
        { type:"choose", word:"Achieve", ru:"Р”РѕСЃС‚РёС‡СЊ",  uz:"Erishmoq", wrong:["Fail","Lose","Skip"] },
        { type:"choose", word:"Plan",    ru:"РџР»Р°РЅ",     uz:"Reja",     wrong:["Idea","Dream","Wish"] },
        { type:"fill",   sentence:"I want to ___ my goal.", answer:"achieve", options:["achieve","avoid","ignore","skip"],
          ru:"РЇ С…РѕС‡Сѓ РґРѕСЃС‚РёС‡СЊ СЃРІРѕРµР№ С†РµР»Рё.", uz:"Maqsadimga erishmoqchiman." },
        { type:"translate", source:{ru:"РЈ РјРµРЅСЏ РµСЃС‚СЊ РїР»Р°РЅ РЅР° Р±СѓРґСѓС‰РµРµ",uz:"Kelajakka rejam bor"}, answer:"I have a plan for the future" },
      ]},
  advanced: [
    { id:1, emoji:"рџ“Љ", ru:"РџРµСЂРµРіРѕРІРѕСЂС‹", uz:"Muzokaralar",
      exercises:[
        { type:"choose", word:"Negotiate",    ru:"РџРµСЂРµРіРѕРІРѕСЂС‹",  uz:"Muzokaralar",  wrong:["Ignore","Accept","Reject"] },
        { type:"choose", word:"Stakeholder",  ru:"Р—Р°РёРЅС‚РµСЂРµСЃРѕРІР°РЅРЅР°СЏ СЃС‚РѕСЂРѕРЅР°",uz:"Manfaatdor tomon",wrong:["Investor","Client","Manager"] },
        { type:"choose", word:"Leverage",     ru:"Р С‹С‡Р°Рі РІР»РёСЏРЅРёСЏ",uz:"Ta'sir vositasi",wrong:["Weakness","Problem","Risk"] },
        { type:"fill",   sentence:"Let's ___ on the terms.", answer:"agree", options:["agree","disagree","ignore","skip"],
          ru:"Р”Р°РІР°Р№С‚Рµ СЃРѕРіР»Р°СЃСѓРµРј СѓСЃР»РѕРІРёСЏ.", uz:"Shartlarga kelishaylik." },
        { type:"translate", source:{ru:"РќР°Рј РЅСѓР¶РЅРѕ РѕР±СЃСѓРґРёС‚СЊ СѓСЃР»РѕРІРёСЏ",uz:"Shartlarni muhokama qilishimiz kerak"}, answer:"We need to discuss the terms" },
      ]},
    { id:2, emoji:"рџ’Ў", ru:"РџСЂРµР·РµРЅС‚Р°С†РёРё", uz:"Taqdimotlar",
      exercises:[
        { type:"choose", word:"Compelling",   ru:"РЈР±РµРґРёС‚РµР»СЊРЅС‹Р№",uz:"Ishontirarli",  wrong:["Boring","Weak","Short"] },
        { type:"choose", word:"Slide",        ru:"РЎР»Р°Р№Рґ",       uz:"Slayd",         wrong:["Video","Photo","Chart"] },
        { type:"choose", word:"Audience",     ru:"РђСѓРґРёС‚РѕСЂРёСЏ",   uz:"Auditoriya",    wrong:["Speaker","Stage","Screen"] },
        { type:"fill",   sentence:"Let me ___ to the next slide.", answer:"move", options:["move","go","jump","skip"],
          ru:"РџРµСЂРµР№РґС‘Рј Рє СЃР»РµРґСѓСЋС‰РµРјСѓ СЃР»Р°Р№РґСѓ.", uz:"Keyingi slaydga o'tamiz." },
        { type:"translate", source:{ru:"РџРѕР·РІРѕР»СЊС‚Рµ РїСЂРѕРёР»Р»СЋСЃС‚СЂРёСЂРѕРІР°С‚СЊ СЌС‚Рѕ",uz:"Buni ko'rsatib beraman"}, answer:"Let me illustrate this" },
      ]},
    { id:3, emoji:"рџ¤ќ", ru:"Р”РµР»РѕРІРѕР№ СЌС‚РёРєРµС‚", uz:"Biznes etiket",
      exercises:[
        { type:"choose", word:"Proactive",    ru:"РџСЂРѕР°РєС‚РёРІРЅС‹Р№",  uz:"Tashabbuskor",  wrong:["Passive","Lazy","Slow"] },
        { type:"choose", word:"Deadline",     ru:"РЎСЂРѕРє СЃРґР°С‡Рё",   uz:"Topshirish muddati",wrong:["Holiday","Weekend","Break"] },
        { type:"choose", word:"Agenda",       ru:"РџРѕРІРµСЃС‚РєР° РґРЅСЏ", uz:"Kun tartibi",   wrong:["Notes","Report","Summary"] },
        { type:"fill",   sentence:"I'd like to ___ a meeting.", answer:"schedule", options:["schedule","cancel","skip","miss"],
          ru:"РЇ С…РѕС‚РµР» Р±С‹ РЅР°Р·РЅР°С‡РёС‚СЊ РІСЃС‚СЂРµС‡Сѓ.", uz:"Uchrashuv belgilashni xohlayman." },
        { type:"translate", source:{ru:"РР·РІРёРЅРёС‚Рµ Р·Р° Р·Р°РґРµСЂР¶РєСѓ РѕС‚РІРµС‚Р°",uz:"Javobdagi kechikish uchun uzr so'rayman"}, answer:"I apologize for the delayed response" },
      ]},
    { id:4, emoji:"рџ“°", ru:"РЎРњР Рё РѕР±С‰РµСЃС‚РІРѕ", uz:"Ommaviy axborot",
      exercises:[
        { type:"choose", word:"Phenomenon",  ru:"Р¤РµРЅРѕРјРµРЅ",     uz:"Hodisa",       wrong:["Problem","Event","Story"] },
        { type:"choose", word:"Controversial",ru:"РЎРїРѕСЂРЅС‹Р№",    uz:"Munozarali",   wrong:["Clear","Simple","Easy"] },
        { type:"choose", word:"Perspective", ru:"РўРѕС‡РєР° Р·СЂРµРЅРёСЏ",uz:"Nuqtai nazar", wrong:["Opinion","Fact","News"] },
        { type:"fill",   sentence:"This is a ___ issue.", answer:"controversial", options:["controversial","simple","clear","easy"],
          ru:"Р­С‚Рѕ СЃРїРѕСЂРЅС‹Р№ РІРѕРїСЂРѕСЃ.", uz:"Bu munozarali masala." },
        { type:"translate", source:{ru:"РЎ РґСЂСѓРіРѕР№ С‚РѕС‡РєРё Р·СЂРµРЅРёСЏ",uz:"Boshqa nuqtai nazardan"}, answer:"From another perspective" },
      ]},
    { id:5, emoji:"рџЋ“", ru:"РђРєР°РґРµРјРёС‡РµСЃРєРёР№ СЏР·С‹Рє", uz:"Akademik til",
      exercises:[
        { type:"choose", word:"Hypothesis",  ru:"Р“РёРїРѕС‚РµР·Р°",    uz:"Gipoteza",     wrong:["Theory","Fact","Idea"] },
        { type:"choose", word:"Evidence",    ru:"Р”РѕРєР°Р·Р°С‚РµР»СЊСЃС‚РІРѕ",uz:"Dalil",       wrong:["Opinion","Guess","Theory"] },
        { type:"choose", word:"Conclude",    ru:"Р”РµР»Р°С‚СЊ РІС‹РІРѕРґ", uz:"Xulosa qilish",wrong:["Begin","Start","Open"] },
        { type:"fill",   sentence:"The ___ supports the theory.", answer:"evidence", options:["evidence","opinion","guess","idea"],
          ru:"Р”РѕРєР°Р·Р°С‚РµР»СЊСЃС‚РІР° РїРѕРґС‚РІРµСЂР¶РґР°СЋС‚ С‚РµРѕСЂРёСЋ.", uz:"Dalillar nazariyani tasdiqlaydi." },
        { type:"translate", source:{ru:"Р”Р°РЅРЅС‹Рµ РїРѕРєР°Р·С‹РІР°СЋС‚ С‡С‚Рѕ",uz:"Ma'lumotlar shuni ko'rsatadiki"}, answer:"The data shows that" },
      ]},
    { id:6, emoji:"рџЊЌ", ru:"Р“Р»РѕР±Р°Р»СЊРЅС‹Рµ С‚РµРјС‹", uz:"Global mavzular",
      exercises:[
        { type:"choose", word:"Sustainable",  ru:"РЈСЃС‚РѕР№С‡РёРІС‹Р№",  uz:"Barqaror",     wrong:["Temporary","Weak","Short"] },
        { type:"choose", word:"Innovation",   ru:"РРЅРЅРѕРІР°С†РёСЏ",   uz:"Innovatsiya",  wrong:["Tradition","Old","Past"] },
        { type:"choose", word:"Infrastructure",ru:"РРЅС„СЂР°СЃС‚СЂСѓРєС‚СѓСЂР°",uz:"Infratuzilma",wrong:["Building","Road","Bridge"] },
        { type:"fill",   sentence:"We need ___ solutions.", answer:"sustainable", options:["sustainable","temporary","quick","cheap"],
          ru:"РќР°Рј РЅСѓР¶РЅС‹ СѓСЃС‚РѕР№С‡РёРІС‹Рµ СЂРµС€РµРЅРёСЏ.", uz:"Bizga barqaror yechimlar kerak." },
        { type:"translate", source:{ru:"РР·РјРµРЅРµРЅРёРµ РєР»РёРјР°С‚Р° СЌС‚Рѕ РіР»РѕР±Р°Р»СЊРЅР°СЏ РїСЂРѕР±Р»РµРјР°",uz:"Iqlim o'zgarishi global muammo"}, answer:"Climate change is a global problem" },
      ]},
  ],

    { id:7, emoji:"вљ–пёЏ", ru:"РџСЂР°РІРѕ Рё Р·Р°РєРѕРЅ", uz:"Huquq va qonun",
      exercises:[
        { type:"choose", word:"Contract",  ru:"РљРѕРЅС‚СЂР°РєС‚",  uz:"Shartnoma", wrong:["Agreement","Deal","Promise"] },
        { type:"choose", word:"Liability", ru:"РћС‚РІРµС‚СЃС‚РІРµРЅРЅРѕСЃС‚СЊ",uz:"Javobgarlik",wrong:["Freedom","Rights","Duty"] },
        { type:"choose", word:"Clause",    ru:"РџСѓРЅРєС‚",     uz:"Band",      wrong:["Sentence","Paragraph","Chapter"] },
        { type:"fill",   sentence:"This ___ is legally binding.", answer:"contract", options:["contract","letter","email","note"],
          ru:"Р­С‚РѕС‚ РєРѕРЅС‚СЂР°РєС‚ СЋСЂРёРґРёС‡РµСЃРєРё РѕР±СЏР·Р°С‚РµР»РµРЅ.", uz:"Bu shartnoma yuridik jihatdan majburiy." },
        { type:"translate", source:{ru:"Р’Р°Рј РЅСѓР¶РЅРѕ РїСЂРѕРєРѕРЅСЃСѓР»СЊС‚РёСЂРѕРІР°С‚СЊСЃСЏ СЃ СЋСЂРёСЃС‚РѕРј",uz:"Yurist bilan maslahat olishingiz kerak"}, answer:"You need to consult a lawyer" },
      ]},
    { id:8, emoji:"рџ’№", ru:"Р¤РёРЅР°РЅСЃС‹", uz:"Moliya",
      exercises:[
        { type:"choose", word:"Investment", ru:"РРЅРІРµСЃС‚РёС†РёСЏ",  uz:"Investitsiya",wrong:["Spending","Loss","Cost"] },
        { type:"choose", word:"Revenue",    ru:"Р”РѕС…РѕРґ",       uz:"Daromad",    wrong:["Expense","Cost","Loss"] },
        { type:"choose", word:"Portfolio",  ru:"РџРѕСЂС‚С„РµР»СЊ",    uz:"Portfel",    wrong:["Budget","Profit","Asset"] },
        { type:"fill",   sentence:"We need to ___ our budget.", answer:"review", options:["review","ignore","delete","spend"],
          ru:"РќР°Рј РЅСѓР¶РЅРѕ РїРµСЂРµСЃРјРѕС‚СЂРµС‚СЊ Р±СЋРґР¶РµС‚.", uz:"Byudjetimizni ko'rib chiqishimiz kerak." },
        { type:"translate", source:{ru:"Р”РѕС…РѕРґС‹ РІС‹СЂРѕСЃР»Рё РЅР° 20 РїСЂРѕС†РµРЅС‚РѕРІ",uz:"Daromadlar 20 foizga oshdi"}, answer:"Revenue increased by 20 percent" },
      ]},
    { id:9, emoji:"рџ§ ", ru:"РџСЃРёС…РѕР»РѕРіРёСЏ", uz:"Psixologiya",
      exercises:[
        { type:"choose", word:"Mindset",     ru:"РњС‹С€Р»РµРЅРёРµ",  uz:"Tafakkur",    wrong:["Feeling","Mood","Emotion"] },
        { type:"choose", word:"Resilience",  ru:"РЈСЃС‚РѕР№С‡РёРІРѕСЃС‚СЊ",uz:"Bardoshlilik",wrong:["Weakness","Fragility","Fear"] },
        { type:"choose", word:"Empathy",     ru:"Р­РјРїР°С‚РёСЏ",   uz:"Empatiya",    wrong:["Sympathy","Pity","Anger"] },
        { type:"fill",   sentence:"A growth ___ helps you learn from mistakes.", answer:"mindset", options:["mindset","feeling","emotion","mood"],
          ru:"РњС‹С€Р»РµРЅРёРµ СЂРѕСЃС‚Р° РїРѕРјРѕРіР°РµС‚ СѓС‡РёС‚СЊСЃСЏ РЅР° РѕС€РёР±РєР°С….", uz:"O'sish tafakkuri xatolardan o'rganishga yordam beradi." },
        { type:"translate", source:{ru:"Р’Р°Р¶РЅРѕ СЂР°Р·РІРёРІР°С‚СЊ СЌРјРѕС†РёРѕРЅР°Р»СЊРЅС‹Р№ РёРЅС‚РµР»Р»РµРєС‚",uz:"Hissiy intellektni rivojlantirish muhim"}, answer:"It is important to develop emotional intelligence" },
      ]},
    { id:10, emoji:"рџЊї", ru:"Р­РєРѕР»РѕРіРёСЏ", uz:"Ekologiya",
      exercises:[
        { type:"choose", word:"Renewable",   ru:"Р’РѕР·РѕР±РЅРѕРІР»СЏРµРјС‹Р№",uz:"Qayta tiklanadigan",wrong:["Fossil","Nuclear","Coal"] },
        { type:"choose", word:"Emission",    ru:"Р’С‹Р±СЂРѕСЃ",     uz:"Chiqindi",   wrong:["Absorption","Collection","Storage"] },
        { type:"choose", word:"Recycle",     ru:"РџРµСЂРµСЂР°Р±Р°С‚С‹РІР°С‚СЊ",uz:"Qayta ishlash",wrong:["Burn","Dump","Waste"] },
        { type:"fill",   sentence:"We must reduce carbon ___.", answer:"emissions", options:["emissions","energy","water","waste"],
          ru:"РњС‹ РґРѕР»Р¶РЅС‹ СЃРѕРєСЂР°С‚РёС‚СЊ РІС‹Р±СЂРѕСЃС‹ СѓРіР»РµСЂРѕРґР°.", uz:"Karbon chiqindilarini kamaytirish kerak." },
        { type:"translate", source:{ru:"РР·РјРµРЅРµРЅРёРµ РєР»РёРјР°С‚Р° СѓРіСЂРѕР¶Р°РµС‚ РїР»Р°РЅРµС‚Рµ",uz:"Iqlim o'zgarishi sayyoramizga tahdid solmoqda"}, answer:"Climate change threatens the planet" },
      ]},
    { id:11, emoji:"рџљЂ", ru:"РўРµС…РЅРѕР»РѕРіРёРё Р±СѓРґСѓС‰РµРіРѕ", uz:"Kelajak texnologiyalari",
      exercises:[
        { type:"choose", word:"Artificial intelligence",ru:"РСЃРєСѓСЃСЃС‚РІРµРЅРЅС‹Р№ РёРЅС‚РµР»Р»РµРєС‚",uz:"Sun'iy intellekt",wrong:["Robotics","Automation","Software"] },
        { type:"choose", word:"Blockchain",  ru:"Р‘Р»РѕРєС‡РµР№РЅ",  uz:"Blokcheyn",  wrong:["Database","Network","Server"] },
        { type:"choose", word:"Disruption",  ru:"РџСЂРѕСЂС‹РІ",    uz:"Inqilob",    wrong:["Tradition","Stability","Order"] },
        { type:"fill",   sentence:"AI is ___ many industries.", answer:"transforming", options:["transforming","destroying","ignoring","slowing"],
          ru:"РР С‚СЂР°РЅСЃС„РѕСЂРјРёСЂСѓРµС‚ РјРЅРѕРіРёРµ РѕС‚СЂР°СЃР»Рё.", uz:"AI ko'plab sohalarni o'zgartirmoqda." },
        { type:"translate", source:{ru:"РўРµС…РЅРѕР»РѕРіРёРё РјРµРЅСЏСЋС‚ РЅР°С€ РѕР±СЂР°Р· Р¶РёР·РЅРё",uz:"Texnologiyalar hayot tarzimizni o'zgartirmoqda"}, answer:"Technology is changing our way of life" },
      ]},
    { id:12, emoji:"рџЋ­", ru:"РљСѓР»СЊС‚СѓСЂР° Рё РёСЃРєСѓСЃСЃС‚РІРѕ", uz:"Madaniyat va san'at",
      exercises:[
        { type:"choose", word:"Exhibition",  ru:"Р’С‹СЃС‚Р°РІРєР°",  uz:"Ko'rgazma",  wrong:["Concert","Festival","Museum"] },
        { type:"choose", word:"Heritage",    ru:"РќР°СЃР»РµРґРёРµ",  uz:"Meros",      wrong:["Culture","Tradition","History"] },
        { type:"choose", word:"Contemporary",ru:"РЎРѕРІСЂРµРјРµРЅРЅС‹Р№",uz:"Zamonaviy", wrong:["Ancient","Classic","Traditional"] },
        { type:"fill",   sentence:"Art can ___ emotions and ideas.", answer:"express", options:["express","hide","ignore","remove"],
          ru:"РСЃРєСѓСЃСЃС‚РІРѕ РјРѕР¶РµС‚ РІС‹СЂР°Р¶Р°С‚СЊ СЌРјРѕС†РёРё Рё РёРґРµРё.", uz:"San'at his-tuyg'ular va g'oyalarni ifoda etishi mumkin." },
        { type:"translate", source:{ru:"РљСѓР»СЊС‚СѓСЂРЅРѕРµ СЂР°Р·РЅРѕРѕР±СЂР°Р·РёРµ РѕР±РѕРіР°С‰Р°РµС‚ РѕР±С‰РµСЃС‚РІРѕ",uz:"Madaniy xilma-xillik jamiyatni boyitadi"}, answer:"Cultural diversity enriches society" },
      ]},
  ],
};

// в”Ђв”Ђ MAIN APP в”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђ
export default function App() {
  const [lang, setLang]     = useState("ru"); // ru | uz
  const [screen, setScreen] = useState("onboarding");
  const [level, setLevel]   = useState(null);
  const [lesson, setLesson] = useState(null);
  const [exIdx, setExIdx]   = useState(0);
  const [lives, setLives]   = useState(3);
  const [xp, setXp]         = useState(0);
  const [streak, setStreak] = useState(0);
  const [done, setDone]     = useState({}); // key: levelId-lessonId
  const [chosen, setChosen] = useState(null);
  const [typed, setTyped]   = useState("");
  const [feedback, setFeedback] = useState(null); // null | "ok" | "wrong"
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [shake, setShake]   = useState(false);
  const [aiMsgs, setAiMsgs] = useState([]);
  const [aiInput, setAiInput] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const chatEnd = useRef(null);

  const isUz = lang === "uz";
  const T = (ru, uz) => isUz ? uz : ru;

  useEffect(() => {
    if (chatEnd.current) chatEnd.current.scrollIntoView({ behavior:"smooth" });
  }, [aiMsgs]);

  const currentExercises = lesson ? LESSONS[level][lesson - 1].exercises : [];
  const currentEx = currentExercises[exIdx];

  const startLesson = (lvl, lessonId) => {
    setLevel(lvl);
    setLesson(lessonId);
    setExIdx(0);
    setLives(3);
    setChosen(null);
    setTyped("");
    setFeedback(null);
    setScreen("lesson");
  };

  const checkAnswer = () => {
    if (feedback) return;
    let correct = false;
    if (currentEx.type === "choose") correct = chosen === currentEx.word;
    if (currentEx.type === "fill") correct = chosen === currentEx.answer;
    if (currentEx.type === "translate") correct = typed.trim().toLowerCase() === currentEx.answer.toLowerCase();

    if (correct) {
      setFeedback("ok");
      setXp(x => x + 10);
    } else {
      setFeedback("wrong");
      setLives(l => l - 1);
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  };

  const next = () => {
    if (lives <= 0 && feedback === "wrong") { setScreen("fail"); return; }
    if (exIdx + 1 >= currentExercises.length) {
      setDone(d => ({ ...d, [`${level}-${lesson}`]: true }));
      setXp(x => x + 50);
      setStreak(s => s + 1);
      setScreen("complete");
    } else {
      setExIdx(i => i + 1);
      setChosen(null);
      setTyped("");
      setFeedback(null);
    }
  };

  const sendAi = async () => {
    if (!aiInput.trim() || aiLoading) return;
    const msg = aiInput.trim();
    setAiInput("");
    const msgs = [...aiMsgs, { role:"user", content:msg }];
    setAiMsgs(msgs);
    setAiLoading(true);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({
          model:"claude-sonnet-4-20250514",
          max_tokens:400,
          system:`You are a friendly English tutor. Student speaks ${isUz?"Uzbek":"Russian"}. Level: ${level}. Always reply in the student's language AND English. Keep it short and encouraging.`,
          messages: msgs.map(m => ({ role:m.role, content:m.content }))
        })
      });
      const data = await res.json();
      const text = data.content?.map(c=>c.text||"").join("") || "...";
      setAiMsgs(m => [...m, { role:"assistant", content:text }]);
    } catch { setAiMsgs(m => [...m, { role:"assistant", content:"Error. Try again." }]); }
    setAiLoading(false);
  };

  // в”Ђв”Ђ STYLES в”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђ
  const bg = { fontFamily:"'Outfit',sans-serif", background:"#09090f", minHeight:"100vh", color:"#fff", maxWidth:420, margin:"0 auto", position:"relative" };
  const card = (border="#ffffff14") => ({ background:"#12121a", border:`1px solid ${border}`, borderRadius:20, padding:20 });
  const btn = (color="#6366f1", full=true) => ({
    width: full?"100%":"auto", background:`linear-gradient(135deg,${color},${color}cc)`,
    border:"none", color:"#fff", borderRadius:14, padding:"15px 20px",
    fontSize:16, fontWeight:700, cursor:"pointer", fontFamily:"'Outfit',sans-serif",
  });
  const ghost = { background:"#ffffff08", border:"1px solid #ffffff14", color:"#fff", borderRadius:14, padding:"14px 20px", fontSize:15, fontWeight:600, cursor:"pointer", fontFamily:"'Outfit',sans-serif", width:"100%" };

  // в”Ђв”Ђ ONBOARDING в”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђ
  if (screen === "onboarding") return (
    <div style={{ ...bg, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", minHeight:"100vh", padding:"0 24px" }}>
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800;900&display=swap" rel="stylesheet"/>
      <div style={{ textAlign:"center", marginBottom:40 }}>
        <div style={{ fontSize:64, marginBottom:8 }}>рџЊЌ</div>
        <h1 style={{ fontSize:48, fontWeight:900, margin:"0 0 6px", background:"linear-gradient(135deg,#fff,#a78bfa)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>LINGRA</h1>
        <p style={{ color:"#6b7280", fontSize:15, margin:0 }}>Express language learning вљЎ</p>
      </div>

      <div style={{ width:"100%", background:"#12121a", border:"1px solid #ffffff14", borderRadius:24, padding:24, marginBottom:24 }}>
        <p style={{ fontSize:14, fontWeight:700, color:"#a78bfa", letterSpacing:1, marginBottom:16, margin:"0 0 16px" }}>рџ—ЈпёЏ {T("Р’С‹Р±РµСЂРё СЂРѕРґРЅРѕР№ СЏР·С‹Рє", "Ona tilingizni tanlang")}</p>
        <div style={{ display:"flex", gap:12 }}>
          {[
            { code:"ru", name:"Р СѓСЃСЃРєРёР№",  flag:"рџ‡·рџ‡є" },
            { code:"uz", name:"O'zbek",   flag:"рџ‡єрџ‡ї" },
          ].map(l => (
            <div key={l.code} onClick={() => setLang(l.code)}
              style={{ flex:1, background: lang===l.code ? "linear-gradient(135deg,#6366f133,#a855f733)" : "#ffffff08", border:`2px solid ${lang===l.code?"#6366f1":"#ffffff14"}`, borderRadius:16, padding:"20px 12px", textAlign:"center", cursor:"pointer", transition:"all .2s" }}>
              <div style={{ fontSize:32, marginBottom:8 }}>{l.flag}</div>
              <div style={{ fontWeight:700, fontSize:15 }}>{l.name}</div>
              {lang===l.code && <div style={{ fontSize:12, color:"#a78bfa", marginTop:4 }}>вњ“</div>}
            </div>
          ))}
        </div>
      </div>

      <button style={{ ...btn(), fontSize:17 }} onClick={() => setScreen("home")}>
        {T("Р”Р°Р»РµРµ в†’", "Keyingi в†’")}
      </button>
    </div>
  );

  // в”Ђв”Ђ HOME в”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђ
  if (screen === "home") return (
    <div style={{ ...bg, padding:"0 0 32px" }}>
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800;900&display=swap" rel="stylesheet"/>

      {/* Header */}
      <div style={{ padding:"48px 24px 16px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <div>
          <h1 style={{ margin:0, fontSize:28, fontWeight:900, background:"linear-gradient(135deg,#fff,#a78bfa)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>LINGRA</h1>
          <p style={{ margin:"2px 0 0", fontSize:13, color:"#6b7280" }}>вљЎ {T("РЈС‡Рё Р°РЅРіР»РёР№СЃРєРёР№", "Ingliz tilini o'rgan")}</p>
        </div>
        <div style={{ display:"flex", gap:8 }}>
          <div style={{ background:"#12121a", border:"1px solid #ffffff14", borderRadius:14, padding:"8px 14px", textAlign:"center", cursor:"pointer" }} onClick={() => setScreen("onboarding")}>
            <div style={{ fontSize:18 }}>{isUz ? "рџ‡єрџ‡ї" : "рџ‡·рџ‡є"}</div>
            <div style={{ fontSize:10, color:"#6b7280", marginTop:2 }}>{lang.toUpperCase()}</div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display:"flex", gap:10, padding:"0 24px 20px" }}>
        {[["рџ”Ґ", streak, T("РґРЅРµР№","kun")], ["вљЎ", xp, "XP"], ["вќ¤пёЏ", 3, T("Р¶РёР·РЅРё","jon")]].map(([ic,v,lb]) => (
          <div key={lb} style={{ flex:1, background:"#12121a", border:"1px solid #ffffff14", borderRadius:16, padding:"12px 8px", textAlign:"center" }}>
            <div style={{ fontSize:18 }}>{ic}</div>
            <div style={{ fontSize:18, fontWeight:800 }}>{v}</div>
            <div style={{ fontSize:10, color:"#6b7280" }}>{lb}</div>
          </div>
        ))}
      </div>

      {/* English course card */}
      <div style={{ padding:"0 24px 20px" }}>
        <div style={{ background:"linear-gradient(135deg,#1e293b,#0f172a)", border:"2px solid #3b82f633", borderRadius:24, padding:24, position:"relative", overflow:"hidden" }}>
          <div style={{ position:"absolute", top:16, right:16, background:"linear-gradient(135deg,#6366f1,#a855f7)", borderRadius:100, padding:"4px 14px", fontSize:12, fontWeight:700 }}>
            {T("Р”РћРЎРўРЈРџРќРћ","MAVJUD")}
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:16, marginBottom:20 }}>
            <div style={{ fontSize:48 }}>рџ‡¬рџ‡§</div>
            <div>
              <div style={{ fontSize:24, fontWeight:900 }}>English</div>
              <div style={{ fontSize:13, color:"#9ca3af" }}>A1 в†’ C2 В· 9 {T("РјРµСЃСЏС†РµРІ","oy")}</div>
            </div>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8, marginBottom:20 }}>
            {[["рџ“љ","36+",T("СѓСЂРѕРєРѕРІ","dars")],["рџ”Љ","вњ“","Audio"],["рџ¤–","AI",T("РЅР°СЃС‚Р°РІРЅРёРє","murabbiy")]].map(([ic,v,lb]) => (
              <div key={lb} style={{ background:"#ffffff08", borderRadius:12, padding:"10px 6px", textAlign:"center" }}>
                <div style={{ fontSize:18 }}>{ic}</div>
                <div style={{ fontSize:12, fontWeight:700 }}>{v}</div>
                <div style={{ fontSize:10, color:"#6b7280" }}>{lb}</div>
              </div>
            ))}
          </div>
          <button style={{ ...btn(), fontSize:15 }} onClick={() => setScreen("levels")}>
            {T("РќР°С‡Р°С‚СЊ СѓС‡РёС‚СЊ в†’", "O'rganishni boshlash в†’")}
          </button>
        </div>
      </div>

      {/* Pricing button */}
      <div style={{ padding:"0 24px" }}>
        <button style={ghost} onClick={() => setScreen("pricing")}>
          рџ’Ћ {T("РўР°СЂРёС„С‹ Рё С†РµРЅС‹", "Narxlar")}
        </button>
      </div>
    </div>
  );

  // в”Ђв”Ђ LEVELS в”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђ
  if (screen === "levels") return (
    <div style={{ ...bg, padding:"0 0 32px" }}>
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800;900&display=swap" rel="stylesheet"/>
      <div style={{ padding:"48px 24px 24px", display:"flex", alignItems:"center", gap:14 }}>
        <button onClick={() => setScreen("home")} style={{ background:"#ffffff0a", border:"none", color:"#fff", width:40, height:40, borderRadius:12, cursor:"pointer", fontSize:18 }}>в†ђ</button>
        <div style={{ fontSize:28 }}>рџ‡¬рџ‡§</div>
        <div><h2 style={{ margin:0, fontSize:22, fontWeight:800 }}>English</h2><p style={{ margin:0, fontSize:13, color:"#6b7280" }}>{T("Р’С‹Р±РµСЂРё СѓСЂРѕРІРµРЅСЊ","Darajani tanlang")}</p></div>
      </div>
      <div style={{ padding:"0 24px", display:"flex", flexDirection:"column", gap:12 }}>
        {LEVELS.map(lv => {
          const lessons = LESSONS[lv.id];
          const doneCount = lessons.filter(l => done[`${lv.id}-${l.id}`]).length;
          return (
            <div key={lv.id} onClick={() => { setLevel(lv.id); setScreen("course"); }}
              style={{ background:"#12121a", border:`1px solid ${lv.color}33`, borderRadius:20, padding:20, cursor:"pointer", display:"flex", alignItems:"center", gap:16, transition:"all .15s" }}>
              <div style={{ fontSize:32, width:52, height:52, background:`${lv.color}22`, borderRadius:14, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>{lv.emoji}</div>
              <div style={{ flex:1 }}>
                <div style={{ fontWeight:800, fontSize:17, color:lv.color }}>{isUz ? lv.uz.name : lv.ru.name}</div>
                <div style={{ fontSize:13, color:"#9ca3af", marginTop:2 }}>{isUz ? lv.uz.desc : lv.ru.desc}</div>
                <div style={{ fontSize:12, color:"#6b7280", marginTop:4 }}>{doneCount}/{lessons.length} {T("СѓСЂРѕРєРѕРІ","dars")} {lv.uz.tag}</div>
              </div>
              <div style={{ fontSize:18 }}>в–¶</div>
            </div>
          );
        })}
      </div>
    </div>
  );

  // в”Ђв”Ђ COURSE в”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђ
  if (screen === "course") {
    const lv = LEVELS.find(l => l.id === level);
    const lessons = LESSONS[level];
    return (
      <div style={{ ...bg, padding:"0 0 32px" }}>
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800;900&display=swap" rel="stylesheet"/>
        <div style={{ padding:"48px 24px 16px", display:"flex", alignItems:"center", gap:14 }}>
          <button onClick={() => setScreen("levels")} style={{ background:"#ffffff0a", border:"none", color:"#fff", width:40, height:40, borderRadius:12, cursor:"pointer", fontSize:18 }}>в†ђ</button>
          <div style={{ fontSize:24 }}>{lv.emoji}</div>
          <div><h2 style={{ margin:0, fontSize:20, fontWeight:800 }}>{isUz ? lv.uz.name : lv.ru.name}</h2><p style={{ margin:0, fontSize:13, color:lv.color }}>{lv.uz.tag} В· English</p></div>
        </div>
        <div style={{ padding:"0 24px", display:"flex", flexDirection:"column", gap:10 }}>
          {lessons.map((l, i) => {
            const isDone = done[`${level}-${l.id}`];
            return (
              <div key={l.id} onClick={() => startLesson(level, l.id)}
                style={{ background: isDone ? `${lv.color}18` : "#12121a", border:`1px solid ${isDone ? lv.color+"44" : "#ffffff14"}`, borderRadius:18, padding:"16px 20px", cursor:"pointer", display:"flex", alignItems:"center", gap:14 }}>
                <div style={{ fontSize:26, width:46, height:46, background:"#ffffff0a", borderRadius:12, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>{l.emoji}</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:700, fontSize:15 }}>{i+1}. {isUz ? l.uz : l.ru}</div>
                  <div style={{ fontSize:12, color:"#6b7280", marginTop:2 }}>{l.exercises.length} {T("СѓРїСЂР°Р¶РЅРµРЅРёР№","mashq")}</div>
                </div>
                <div style={{ fontSize:20 }}>{isDone ? "вњ…" : "в–¶"}</div>
              </div>
            );
          })}
          {/* AI button */}
          <div onClick={() => { setAiMsgs([{role:"assistant",content:`Hello! Let's practice English! рџЉ / Keling inglizcha mashq qilamiz!`}]); setScreen("ai"); }}
            style={{ background:"linear-gradient(135deg,#6366f122,#a855f722)", border:"1px solid #6366f144", borderRadius:18, padding:"16px 20px", cursor:"pointer", display:"flex", alignItems:"center", gap:14 }}>
            <div style={{ fontSize:28 }}>рџ¤–</div>
            <div style={{ flex:1 }}>
              <div style={{ fontWeight:700, fontSize:15 }}>AI {T("РќР°СЃС‚Р°РІРЅРёРє","Murabbiy")}</div>
              <div style={{ fontSize:12, color:"#9ca3af" }}>{T("РџСЂР°РєС‚РёРєСѓР№ СЂР°Р·РіРѕРІРѕСЂРЅС‹Р№ Р°РЅРіР»РёР№СЃРєРёР№","Suhbat inglizchani mashq qil")}</div>
            </div>
            <div style={{ fontSize:12, color:"#a78bfa", fontWeight:700 }}>PRO</div>
          </div>
        </div>
      </div>
    );
  }

  // в”Ђв”Ђ LESSON в”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђ
  if (screen === "lesson" && currentEx) {
    const lv = LEVELS.find(l => l.id === level);
    const progress = Math.round((exIdx / currentExercises.length) * 100);
    const ok = feedback === "ok";
    const wrong = feedback === "wrong";

    return (
      <div style={{ ...bg, display:"flex", flexDirection:"column", minHeight:"100vh" }}>
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800;900&display=swap" rel="stylesheet"/>
        <style>{`@keyframes shake{0%,100%{transform:translateX(0)}25%{transform:translateX(-8px)}75%{transform:translateX(8px)}}`}</style>

        {/* Header */}
        <div style={{ padding:"48px 24px 16px", display:"flex", alignItems:"center", gap:12 }}>
          <button onClick={() => setScreen("course")} style={{ background:"#ffffff0a", border:"none", color:"#fff", width:36, height:36, borderRadius:10, cursor:"pointer", fontSize:16 }}>вњ•</button>
          <div style={{ flex:1, background:"#ffffff0a", borderRadius:100, height:8, overflow:"hidden" }}>
            <div style={{ height:"100%", width:`${progress}%`, background:`linear-gradient(90deg,${lv.color},${lv.color}88)`, transition:"width .4s", borderRadius:100 }}/>
          </div>
          <div style={{ display:"flex", gap:2 }}>
            {[0,1,2].map(i => <span key={i} style={{ fontSize:16, opacity: i < lives ? 1 : .2 }}>вќ¤пёЏ</span>)}
          </div>
        </div>

        {/* Exercise */}
        <div style={{ flex:1, padding:"8px 24px 0" }}>

          {/* CHOOSE */}
          {(currentEx.type === "choose" || currentEx.type === "fill") && (() => {
            const isChoose = currentEx.type === "choose";
            const options = isChoose
              ? [currentEx.word, ...currentEx.wrong].sort(() => Math.random() - 0.5)
              : currentEx.options;
            const correctAnswer = isChoose ? currentEx.word : currentEx.answer;

            return (
              <>
                <div style={{ background:"#12121a", border:"1px solid #ffffff14", borderRadius:20, padding:24, textAlign:"center", marginBottom:24, animation: shake?"shake .4s":"none" }}>
                  {isChoose ? (
                    <>
                      <div style={{ fontSize:13, color:"#6b7280", marginBottom:8 }}>{T("Р’С‹Р±РµСЂРё РїРµСЂРµРІРѕРґ","Tarjimani tanlang")}</div>
                      <div style={{ fontSize:13, color:"#9ca3af", marginBottom:4 }}>{isUz ? currentEx.uz : currentEx.ru}</div>
                    </>
                  ) : (
                    <>
                      <div style={{ fontSize:13, color:"#6b7280", marginBottom:8 }}>{T("Р—Р°РїРѕР»РЅРё РїСЂРѕРїСѓСЃРє","Bo'shliqni to'ldiring")}</div>
                      <div style={{ fontSize:18, fontWeight:700, marginBottom:4 }}>{currentEx.sentence.replace("___","___")}</div>
                      <div style={{ fontSize:13, color:"#9ca3af" }}>{isUz ? currentEx.uz : currentEx.ru}</div>
                    </>
                  )}
                </div>
                <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                  {options.map((opt,i) => {
                    let bg = "#12121a", border = "1px solid #ffffff14", color = "#fff";
                    if (feedback) {
                      if (opt === correctAnswer) { bg="#10b98122"; border="1px solid #10b981"; color="#10b981"; }
                      else if (opt === chosen) { bg="#ef444422"; border="1px solid #ef4444"; color="#ef4444"; }
                    } else if (opt === chosen) { bg="#6366f122"; border="1px solid #6366f1"; }
                    return (
                      <div key={i} onClick={() => !feedback && setChosen(opt)}
                        style={{ background:bg, border, borderRadius:14, padding:"15px 20px", cursor:feedback?"default":"pointer", fontSize:15, fontWeight:600, color, transition:"all .15s", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                        <span>{opt}</span>
                        {feedback && opt === correctAnswer && "вњ…"}
                        {feedback && opt === chosen && opt !== correctAnswer && "вќЊ"}
                      </div>
                    );
                  })}
                </div>
              </>
            );
          })()}

          {/* TRANSLATE */}
          {currentEx.type === "translate" && (
            <>
              <div style={{ background:"#12121a", border:"1px solid #ffffff14", borderRadius:20, padding:24, textAlign:"center", marginBottom:24 }}>
                <div style={{ fontSize:13, color:"#6b7280", marginBottom:8 }}>{T("РџРµСЂРµРІРµРґРё РЅР° Р°РЅРіР»РёР№СЃРєРёР№","Inglizchaga tarjima qiling")}</div>
                <div style={{ fontSize:20, fontWeight:700 }}>{isUz ? currentEx.source.uz : currentEx.source.ru}</div>
              </div>
              <input value={typed} onChange={e => setTyped(e.target.value)}
                onKeyDown={e => e.key==="Enter" && !feedback && checkAnswer()}
                disabled={!!feedback}
                placeholder={T("Р’РІРµРґРё РїРµСЂРµРІРѕРґ...","Tarjimani yozing...")}
                style={{ width:"100%", background: ok?"#10b98122":wrong?"#ef444422":"#12121a", border:`1px solid ${ok?"#10b981":wrong?"#ef4444":"#ffffff1a"}`, borderRadius:14, padding:"15px 18px", color:"#fff", fontSize:16, outline:"none", fontFamily:"Outfit,sans-serif", boxSizing:"border-box", animation:shake?"shake .4s":"none" }}/>
              {wrong && <div style={{ marginTop:8, fontSize:13, color:"#ef4444" }}>вњ“ {currentEx.answer}</div>}
            </>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding:"16px 24px 32px", borderTop:"1px solid #ffffff0a" }}>
          {feedback && (
            <div style={{ background: ok?"#10b98115":"#ef444415", border:`1px solid ${ok?"#10b981":"#ef4444"}`, borderRadius:14, padding:"12px 16px", marginBottom:12, display:"flex", alignItems:"center", gap:10 }}>
              <span style={{ fontSize:22 }}>{ok ? "рџЋ‰" : "рџ’”"}</span>
              <div style={{ flex:1, fontWeight:700, color: ok?"#10b981":"#ef4444", fontSize:15 }}>
                {ok ? T("Р’РµСЂРЅРѕ!","To'g'ri!") : T("РќРµРІРµСЂРЅРѕ","Noto'g'ri")}
              </div>
              {ok && <span style={{ color:"#f59e0b", fontWeight:700 }}>+10 XP</span>}
            </div>
          )}
          {!feedback
            ? <button style={{ ...btn(lv.color), opacity: (currentEx.type==="translate"?typed.trim():chosen) ? 1 : .4 }} onClick={checkAnswer}>{T("РџСЂРѕРІРµСЂРёС‚СЊ","Tekshirish")}</button>
            : <button style={btn(ok?"#10b981":lv.color)} onClick={next}>{T("РџСЂРѕРґРѕР»Р¶РёС‚СЊ в†’","Davom etish в†’")}</button>
          }
        </div>
      </div>
    );
  }

  // в”Ђв”Ђ COMPLETE в”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђ
  if (screen === "complete") return (
    <div style={{ ...bg, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", minHeight:"100vh", padding:"0 24px", textAlign:"center" }}>
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800;900&display=swap" rel="stylesheet"/>
      <div style={{ fontSize:80, marginBottom:16 }}>рџЋ‰</div>
      <h2 style={{ fontSize:32, fontWeight:900, margin:"0 0 8px" }}>{T("РЈСЂРѕРє РїСЂРѕР№РґРµРЅ!","Dars tugadi!")}</h2>
      <p style={{ color:"#9ca3af", marginBottom:32 }}>+50 XP В· {T("РћС‚Р»РёС‡РЅР°СЏ СЂР°Р±РѕС‚Р°!","Zo'r ish!")}</p>
      <div style={{ display:"flex", gap:12, marginBottom:32, width:"100%" }}>
        <button style={{ ...btn(), flex:1 }} onClick={() => setScreen("course")}>{T("РџСЂРѕРґРѕР»Р¶РёС‚СЊ","Davom etish")}</button>
        <button style={{ ...ghost, flex:1 }} onClick={() => setScreen("home")}>{T("Р“Р»Р°РІРЅР°СЏ","Bosh sahifa")}</button>
      </div>
    </div>
  );

  // в”Ђв”Ђ FAIL в”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђ
  if (screen === "fail") return (
    <div style={{ ...bg, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", minHeight:"100vh", padding:"0 24px", textAlign:"center" }}>
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800;900&display=swap" rel="stylesheet"/>
      <div style={{ fontSize:80, marginBottom:16 }}>рџ’”</div>
      <h2 style={{ fontSize:28, fontWeight:900, margin:"0 0 8px" }}>{T("Р–РёР·РЅРё Р·Р°РєРѕРЅС‡РёР»РёСЃСЊ!","Jonlar tugadi!")}</h2>
      <p style={{ color:"#9ca3af", marginBottom:32 }}>{T("РџРѕРїСЂРѕР±СѓР№ РµС‰С‘ СЂР°Р·","Qayta urinib ko'r")}</p>
      <button style={{ ...btn("#ef4444"), marginBottom:12 }} onClick={() => startLesson(level, lesson)}>{T("РџРѕРїСЂРѕР±РѕРІР°С‚СЊ СЃРЅРѕРІР°","Qayta urinish")}</button>
      <button style={ghost} onClick={() => setScreen("course")}>{T("РќР°Р·Р°Рґ","Orqaga")}</button>
    </div>
  );

  // в”Ђв”Ђ AI в”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђ
  if (screen === "ai") return (
    <div style={{ ...bg, display:"flex", flexDirection:"column", minHeight:"100vh" }}>
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800;900&display=swap" rel="stylesheet"/>
      <div style={{ padding:"48px 24px 14px", display:"flex", alignItems:"center", gap:12, borderBottom:"1px solid #ffffff0a" }}>
        <button onClick={() => setScreen("course")} style={{ background:"#ffffff0a", border:"none", color:"#fff", width:36, height:36, borderRadius:10, cursor:"pointer", fontSize:16 }}>в†ђ</button>
        <div style={{ fontSize:24 }}>рџ¤–</div>
        <div><div style={{ fontWeight:700 }}>AI {T("РќР°СЃС‚Р°РІРЅРёРє","Murabbiy")}</div><div style={{ fontSize:12, color:"#10b981" }}>в—Џ {T("РѕРЅР»Р°Р№РЅ","online")}</div></div>
      </div>
      <div style={{ flex:1, overflowY:"auto", padding:"14px 24px", display:"flex", flexDirection:"column", gap:10 }}>
        {aiMsgs.map((m,i) => (
          <div key={i} style={{ display:"flex", justifyContent: m.role==="user"?"flex-end":"flex-start" }}>
            <div style={{ maxWidth:"80%", background: m.role==="user"?"linear-gradient(135deg,#6366f1,#a855f7)":"#12121a", border: m.role==="assistant"?"1px solid #ffffff14":"none", borderRadius: m.role==="user"?"18px 18px 4px 18px":"18px 18px 18px 4px", padding:"11px 15px", fontSize:14, lineHeight:1.6, whiteSpace:"pre-wrap" }}>{m.content}</div>
          </div>
        ))}
        {aiLoading && <div style={{ display:"flex", gap:4, padding:"11px 15px", background:"#12121a", border:"1px solid #ffffff14", borderRadius:"18px 18px 18px 4px", width:"fit-content" }}>{[0,1,2].map(i=><div key={i} style={{ width:7,height:7,borderRadius:"50%",background:"#6b7280",animation:`bounce 1s ${i*.2}s infinite` }}/>)}</div>}
        <div ref={chatEnd}/>
      </div>
      <div style={{ padding:"10px 24px 32px", borderTop:"1px solid #ffffff0a", display:"flex", gap:10 }}>
        <input value={aiInput} onChange={e=>setAiInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&sendAi()}
          placeholder={T("РќР°РїРёС€Рё...","Yozing...")}
          style={{ flex:1, background:"#12121a", border:"1px solid #ffffff14", borderRadius:14, padding:"12px 16px", color:"#fff", fontSize:14, outline:"none", fontFamily:"Outfit,sans-serif" }}/>
        <button onClick={sendAi} disabled={aiLoading||!aiInput.trim()} style={{ background:"linear-gradient(135deg,#6366f1,#a855f7)", border:"none", color:"#fff", width:44, height:44, borderRadius:12, cursor:"pointer", fontSize:18 }}>в†’</button>
      </div>
      <style>{`@keyframes bounce{0%,80%,100%{transform:scale(0)}40%{transform:scale(1)}}`}</style>
    </div>
  );

  // в”Ђв”Ђ PRICING в”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђ
  if (screen === "pricing") return (
    <div style={{ ...bg, padding:"0 0 32px" }}>
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800;900&display=swap" rel="stylesheet"/>
      <div style={{ padding:"48px 24px 24px", display:"flex", alignItems:"center", gap:14 }}>
        <button onClick={() => setScreen("home")} style={{ background:"#ffffff0a", border:"none", color:"#fff", width:40, height:40, borderRadius:12, cursor:"pointer", fontSize:18 }}>в†ђ</button>
        <div>
          <h2 style={{ margin:0, fontSize:22, fontWeight:800 }}>{T("РЎС‚РѕРёРјРѕСЃС‚СЊ РєСѓСЂСЃР°","Kurs narxlari")}</h2>
          <p style={{ margin:0, fontSize:13, color:"#6b7280" }}>рџ‡¬рџ‡§ English В· A1 в†’ C2</p>
        </div>
      </div>

      <div style={{ padding:"0 24px", display:"flex", flexDirection:"column", gap:12 }}>
        {/* Stages */}
        {LEVELS.map((lv, i) => (
          <div key={lv.id} style={{ background:"#12121a", border:`1px solid ${lv.color}33`, borderRadius:20, padding:20 }}>
            <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:14 }}>
              <div style={{ fontSize:26, width:46, height:46, background:`${lv.color}22`, borderRadius:12, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>{lv.emoji}</div>
              <div>
                <div style={{ fontWeight:800, fontSize:16 }}>{T(`Р­С‚Р°Рї ${i+1}:`,`${i+1}-bosqich:`)} <span style={{ color:lv.color }}>{isUz ? lv.uz.name : lv.ru.name}</span></div>
                <div style={{ fontSize:12, color:"#6b7280" }}>{lv.uz.tag} В· 3 {T("РјРµСЃСЏС†Р°","oy")}</div>
              </div>
            </div>
            <div style={{ display:"flex", gap:10 }}>
              {[
                { label: T("1 РјРµСЃСЏС†","1 oy"), price:"$10", id:`${lv.id}-1` },
                { label: T("3 РјРµСЃСЏС†Р°","3 oy"), price:"$25", id:`${lv.id}-3`, badge:T("в€’17%","в€’17%") },
              ].map(plan => (
                <div key={plan.id} onClick={() => setSelectedPlan(selectedPlan===plan.id?null:plan.id)}
                  style={{ flex:1, background: selectedPlan===plan.id?`${lv.color}22`:"#ffffff06", border:`2px solid ${selectedPlan===plan.id?lv.color:"#ffffff14"}`, borderRadius:14, padding:"12px 10px", textAlign:"center", cursor:"pointer", position:"relative", transition:"all .2s" }}>
                  {plan.badge && <div style={{ position:"absolute", top:-10, left:"50%", transform:"translateX(-50%)", background:lv.color, borderRadius:100, padding:"2px 10px", fontSize:10, fontWeight:800, whiteSpace:"nowrap" }}>{plan.badge}</div>}
                  <div style={{ fontSize:13, fontWeight:700, marginBottom:4 }}>{plan.label}</div>
                  <div style={{ fontSize:22, fontWeight:900 }}>{plan.price}</div>
                  {selectedPlan===plan.id && <div style={{ fontSize:14, marginTop:4 }}>вњ…</div>}
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Full course */}
        <div onClick={() => setSelectedPlan(selectedPlan==="full"?null:"full")}
          style={{ background: selectedPlan==="full"?"linear-gradient(135deg,#6366f122,#a855f722)":"#12121a", border:`2px solid ${selectedPlan==="full"?"#6366f1":"#6366f144"}`, borderRadius:20, padding:20, cursor:"pointer", position:"relative", transition:"all .2s", marginTop:4 }}>
          <div style={{ position:"absolute", top:-12, left:"50%", transform:"translateX(-50%)", background:"linear-gradient(135deg,#6366f1,#a855f7)", borderRadius:100, padding:"4px 16px", fontSize:12, fontWeight:800, whiteSpace:"nowrap" }}>
            в­ђ {T("в€’33% Р›РЈР§РЁРђРЇ Р¦Р•РќРђ","в€’33% ENG YAXSHI NARX")}
          </div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <div>
              <div style={{ fontSize:17, fontWeight:800 }}>рџЋ“ {T("РџРѕР»РЅС‹Р№ РєСѓСЂСЃ вЂ” 9 РјРµСЃСЏС†РµРІ","To'liq kurs вЂ” 9 oy")}</div>
              <div style={{ fontSize:13, color:"#9ca3af", marginTop:4 }}>{T("A1 в†’ C2, РІСЃРµ 3 СЌС‚Р°РїР°","A1 в†’ C2, barcha 3 bosqich")}</div>
              <div style={{ display:"flex", alignItems:"baseline", gap:8, marginTop:8 }}>
                <span style={{ fontSize:32, fontWeight:900, color:"#a78bfa" }}>$60</span>
                <span style={{ fontSize:14, color:"#6b7280", textDecoration:"line-through" }}>$90</span>
              </div>
            </div>
            <div style={{ fontSize:28 }}>{selectedPlan==="full"?"вњ…":"в­•"}</div>
          </div>
        </div>

        {/* Guarantee */}
        <div style={{ background:"#10b98112", border:"1px solid #10b98133", borderRadius:16, padding:"14px 18px", display:"flex", alignItems:"center", gap:12 }}>
          <span style={{ fontSize:24 }}>рџ›ЎпёЏ</span>
          <div>
            <div style={{ fontWeight:700, fontSize:14, color:"#10b981" }}>{T("7-РґРЅРµРІРЅР°СЏ РіР°СЂР°РЅС‚РёСЏ","7 kunlik kafolat")}</div>
            <div style={{ fontSize:12, color:"#9ca3af" }}>{T("РќРµ РїРѕРЅСЂР°РІРёС‚СЃСЏ вЂ” РІРµСЂРЅС‘Рј РґРµРЅСЊРіРё","Yoqmasa вЂ” pulni qaytaramiz")}</div>
          </div>
        </div>

        {/* CTA */}
        {selectedPlan
          ? <button style={btn()} onClick={() => alert(T("РћРїР»Р°С‚Р° СЃРєРѕСЂРѕ Р±СѓРґРµС‚ РґРѕСЃС‚СѓРїРЅР°!","To'lov tez kunda mavjud bo'ladi!"))}>{T("РћРїР»Р°С‚РёС‚СЊ в†’","To'lash в†’")}</button>
          : <div style={{ ...ghost, textAlign:"center", cursor:"default", color:"#4b5563" }}>{T("в¬†пёЏ Р’С‹Р±РµСЂРёС‚Рµ РїР»Р°РЅ","в¬†пёЏ Rejani tanlang")}</div>
        }
        <div style={{ textAlign:"center", fontSize:12, color:"#4b5563" }}>{T("РћС‚РјРµРЅРёС‚СЊ РјРѕР¶РЅРѕ РІ Р»СЋР±РѕР№ РјРѕРјРµРЅС‚","Istalgan vaqtda bekor qilish mumkin")}</div>
      </div>
    </div>
  );

  return null;
}
