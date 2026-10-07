"use client";
import Image from "next/image";
import {
  FormEvent,
  MouseEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  BadgeCheck,
  BarChart3,
  BellRing,
  BookOpen,
  CalendarClock,
  CheckCircle2,
  ChevronDown,
  HeartPulse,
  Home,
  MapPin,
  MapPinned,
  Link2,
  Mail,
  Menu,
  MessageCircle,
  PawPrint,
  Phone,
  Search,
  Send,
  Share2,
  ShieldCheck,
  Sparkles,
  Store,
  UsersRound,
  X,
} from "lucide-react";
import { track as vaTrack } from "@vercel/analytics";
import { persianLegalCopy, persianSiteCopy } from "./persian-copy";
import { educationSlugs, hub } from "./learn-copy";
import { orderArticles, type ArticleSettings } from "../lib/article-settings";
import type { Lang } from "./language";
import { isLocale, localePath, localeUrl, splitLocale } from "../lib/locale";
import type { PublicPost } from "../lib/posts";
type View =
  | "home"
  | "features"
  | "owners"
  | "business"
  | "learn"
  | "privacy"
  | "terms"
  | "verification";
type Role = "parent" | "business";
type SiteCopy = (typeof tr)[Lang];
type HubCopy = (typeof hub)[Lang];
type LegalCopy = (typeof legalContent)[Lang];
const tr = {
  hy: {
    nav: [
      "Գլխավոր",
      "Հնարավորություններ",
      "Կենդանատերերին",
      "Բիզնեսին",
      "Սովորել",
    ],
    join: "Միանալ մեզ",
    loading: "Պատրաստում ենք ձեր հաջորդ քայլը…",
    slides: [
      [
        "Կենդանու ամբողջ խնամքը՝ մեկ վայրում",
        "Կենդանու առողջության պատմությունը, փաստաթղթերը և կարևոր օրերը այլևս չեն կորչի։",
      ],
      [
        "Վստահելի խնամք՝ ճիշտ պահին",
        "Բացահայտեք ստուգված մասնագետների և ընտրեք ձեր կենդանու համար լավագույն օգնությունը։",
      ],
      [
        "Հայաստանի կենդանասերների նոր տունը",
        "Կիսվեք փորձով, գտեք աջակցություն և կառուցեք ավելի հոգատար համայնք։",
      ],
    ],
    ownerTitle: "BuddyLife-ը կենդանատերերի համար",
    ownerLead:
      "Ավելի քիչ անհանգստություն, ավելի շատ ժամանակ միասին։ Կառավարեք ձեր կենդանու ամբողջ կյանքը պարզ և անվտանգ ձևով։",
    businessTitle: "BuddyLife-ը կենդանիների բիզնեսների համար",
    businessLead:
      "Դարձեք ավելի տեսանելի, կառուցեք վստահություն և հասեք այն մարդկանց, ովքեր հիմա փնտրում են ձեր ծառայությունը։",
    benefits: "Ինչ կստանաք",
    learn: "Բացահայտել ավելին",
    featureTitle: "Մեկ հարթակ։ Ամբողջ խնամքը։",
    featureLead:
      "Գործիքներ, որոնք լուծում են իրական առօրյա խնդիրներ՝ առանց ավելորդ բարդության։",
    launch: "Մեկնարկին",
    future: "Գաղտնի՝ շուտով",
    soon: "Շուտով",
    blur: "Մենք դեռ չենք բացահայտում այս հնարավորությունը։",
    press:
      "Վաղ գրանցված օգտատերերը կհրավիրվեն BuddyLife-ի առաջիկա մամուլի շնորհանդեսին։",
    role: "Ո՞վ եք դուք",
    parent: "Կենդանատեր",
    business: "Բիզնես",
    name: "Անուն",
    businessName: "Բիզնեսի անվանում",
    email: "Էլ․ փոստ",
    phone: "Հեռախոս",
    city: "Քաղաք (ոչ պարտադիր)",
    province: "Մարզ / նահանգ (ոչ պարտադիր)",
    petType: "Կենդանու տեսակ",
    petOptions: ["Ընտրել", "Շուն", "Կատու", "Երկուսն էլ"],
    categoryOptions: [
      "Ընտրել",
      "Անասնաբուժություն",
      "Գրումինգ",
      "Կենդանիների հյուրանոց",
      "Խանութ",
      "Վարժեցում",
      "Այլ",
    ],
    selectRequired: "Խնդրում ենք ընտրել տարբերակ։",
    contactRequired: "Նշեք էլ․ փոստը և հեռախոսահամարը։",
    locationParent: "Օգնում է գտնել ձեր տարածքի համապատասխան ծառայությունները։",
    locationBusiness: "Օգնում է կապվել ձեր տարածքի կենդանատերերի հետ։",
    locationInfo: "Ինչու ենք հարցնում տեղադրությունը",
    close: "Փակել",
    verificationTitle: "Վստահությունը կառուցում ենք թափանցիկ ձևով։",
    verificationLead:
      "BuddyLife-ի մեկնարկային ստուգման մոտեցումը՝ հստակ բիզնես տվյալներ, պրոֆիլի վերանայում և համայնքային հետադարձ կապ։",
    verificationCards: [
      [
        "Բիզնեսի նույնականացում",
        "Հաստատում ենք հիմնական տվյալներն ու պաշտոնական կապի միջոցները։",
      ],
      [
        "Պրոֆիլի վերանայում",
        "Ստուգում ենք ծառայությունների նկարագրությունն ու ներկայացված մասնագիտական տվյալները։",
      ],
      [
        "Շարունակական վստահություն",
        "Հաշվետվություններն ու համայնքային ազդակները օգնում են պահպանել որակը։",
      ],
    ],
    verificationLink: "Ինչպես է աշխատելու ստուգումը",
    launchStatus: "Հայաստան • Նախամեկնարկային փուլ",
    privacyLabel: "Գաղտնիության քաղաքականություն",
    termsLabel: "Օգտագործման պայմաններ",
    category: "Ծառայության տեսակ",
    social: "Instagram կամ կայք (ոչ պարտադիր)",
    submit: "Պահպանել իմ տեղը",
    success: "Շնորհակալություն։ Դուք BuddyLife-ի վաղ համայնքում եք 💜",
    privacy:
      "Ձեր տվյալները կօգտագործվեն միայն մեկնարկի կապի և անանուն հետաքրքրության վերլուծության համար։",
    footer: "Ձեր կենդանին։ Ձեր ընտանիքը։ Մեր հոգատարությունը։",
    brandEyebrow: "BUDDYLIFE ՀԱՅԱՍՏԱՆ",
    productEyebrow: "BUDDYLIFE ԱՐՏԱԴՐԱՆՔ",
    trustEyebrow: "BUDDYLIFE ՎՍՏԱՀՈՒԹՅՈՒՆ",
    pressEyebrow: "ՄԱՄՈՒԼԻ ՇՆՈՐՀԱՆԴԵՍ",
    earlyAccess: "ՎԱՂ ՀԱՍԱՆԵԼԻՈՒԹՅՈՒՆ",
    promise: "Վաղ հասանելիություն և Երևանի կենդանատիրոջ ստուգաթերթը՝ էլ․ փոստով։ Առանց գովազդի, կարող եք հրաժարվել ցանկացած պահի։",
    successNote: "Ստուգաթերթն արդեն ձեր էլ․ փոստում է (նայեք նաև «Սպամ» թղթապանակը)։",
    contactTitle: "Հարց ունե՞ք",
    contactLead: "Գրեք մեզ՝ պատասխանում ենք աշխատանքային օրերին։",
    contactLabels: ["Էլ․ փոստ", "WhatsApp", "Telegram", "Զանգել"],
    partnerTitle: "Դարձեք հիմնադիր գործընկեր",
    partnerLead: "Առաջին կլինիկաները, գրումերները և հյուրանոցները գրանցվում են անվճար, ստանում են վերիֆիկացված պրոֆիլ և տեղ գլխավոր էջում։ Թողեք կոնտակտ՝ մենք կզանգենք։",
    contactFormTitle: "Գրեք մեզ",
    contactFormLead: "Հարց, առաջարկ կամ գործընկերություն՝ գրեք, պատասխանում ենք աշխատանքային օրերին։",
    messageLabel: "Հաղորդագրություն",
    businessOptional: "Բիզնես (ոչ պարտադիր)",
    phoneOptional: "Հեռախոս (ոչ պարտադիր)",
    send: "Ուղարկել",
    sending: "Ուղարկվում է…",
    sentTitle: "Շնորհակալություն, ստացանք։",
    sentBody: "Կպատասխանենք ձեր էլ․ փոստին աշխատանքային օրերին։",
    contactFailed: "Հաղորդագրությունը չհաջողվեց ուղարկել։ Փորձեք կրկին մի փոքր ուշ։",
    writeToUs: "Գրել մեզ",
    partnersEyebrow: "ՀԻՄՆԱԴԻՐ ԳՈՐԾԸՆԿԵՐՆԵՐ",
    partnersTitle: "Նրանք, ովքեր առաջինն են վստահել BuddyLife-ին",
    communityLabel: "Համայնք",
    preparingLabel: "Վաղ հասանելիության նախապատրաստում",
    slideLabel: "Սլայդ",
    languageLabel: "Փոխել լեզուն",
    menuLabel: "Բացել ընտրացանկը",
    closeMenuLabel: "Փակել ընտրացանկը",
    ok: "Լավ",
    parentCards: [
      [
        "Առողջության անձնագիր",
        "Պահեք պատվաստումները, դեղորայքը, այցերն ու փաստաթղթերը մեկ պրոֆիլում։",
      ],
      [
        "Խելացի հիշեցումներ",
        "Ստացեք մեղմ հիշեցումներ ճիշտ պահին և երբեք մի բաց թողեք կարևոր խնամքը։",
      ],
      [
        "Վստահելի մասնագետներ",
        "Գտեք անասնաբույժների, գրումերների, հյուրանոցների և այլ ծառայությունների։",
      ],
      [
        "Համայնքի ուժը",
        "Խորհուրդ, իրական փորձ և տեղական օգնություն՝ Հայաստանի կենդանասերներից։",
      ],
      [
        "Արտակարգ պատրաստվածություն",
        "Կարևոր տվյալները հասանելի են, երբ յուրաքանչյուր րոպեն նշանակություն ունի։",
      ],
      ["Ընտանեկան խնամք", "Պահեք բոլոր հոգատարներին նույն տեղեկատվության վրա։"],
    ],
    businessCards: [
      [
        "Ճիշտ լսարան",
        "Ձեր ծառայությունը հայտնվում է այն մարդկանց առաջ, ովքեր իսկապես կենդանիների խնամք են փնտրում։",
      ],
      [
        "Վստահելի պրոֆիլ",
        "Ներկայացրեք թիմը, ծառայությունները, փորձը և հաճախորդների վստահության ազդակները։",
      ],
      [
        "Ավելի քիչ վարչարարություն",
        "Առաջիկա գործիքները կօգնեն կառավարել հարցումները, հիշեցումները և հաճախորդների կապը։",
      ],
      [
        "Վաղ գործընկերոջ առավելություն",
        "Մասնակցեք հարթակի ձևավորմանը և ստացեք մեկնարկային հատուկ պայմաններ։",
      ],
      ["Տեղական տեսանելիություն", "Հասեք ձեր քաղաքի և մարզի կենդանատերերին։"],
      [
        "Աճի պատկերացում",
        "Հետագայում տեսեք հետաքրքրության և հաճախորդների վարքի օգտակար տվյալներ։",
      ],
    ],
  },
  ru: {
    nav: ["Главная", "Возможности", "Владельцам", "Бизнесу", "Знания"],
    join: "Присоединиться",
    loading: "Готовим следующий шаг…",
    slides: [
      [
        "Здоровье питомца, забота и надёжные услуги — вместе",
        "История здоровья, документы и важные даты питомца больше не потеряются.",
      ],
      [
        "Надёжная забота в нужный момент",
        "Находите проверенных специалистов и выбирайте лучшую помощь для питомца.",
      ],
      [
        "Новый дом сообщества Армении",
        "Делитесь опытом, находите поддержку и создавайте более заботливое сообщество.",
      ],
    ],
    ownerTitle: "BuddyLife для владельцев",
    ownerLead:
      "Меньше тревог, больше времени вместе. Управляйте всей жизнью питомца просто и безопасно.",
    businessTitle: "BuddyLife для pet-бизнеса",
    businessLead:
      "Станьте заметнее, укрепляйте доверие и находите людей, которым нужны ваши услуги.",
    benefits: "Ваши преимущества",
    learn: "Узнать больше",
    featureTitle: "Одна платформа. Вся забота.",
    featureLead:
      "Инструменты для реальных ежедневных задач без лишней сложности.",
    launch: "На старте",
    future: "Секретно — скоро",
    soon: "Скоро",
    blur: "Эту возможность мы пока не раскрываем.",
    press:
      "Ранние пользователи будут приглашены на ближайшую пресс-презентацию BuddyLife.",
    role: "Кто вы?",
    parent: "Владелец",
    business: "Бизнес",
    name: "Имя",
    businessName: "Название бизнеса",
    email: "Эл. почта",
    phone: "Телефон",
    city: "Город (необязательно)",
    province: "Область / регион (необязательно)",
    petType: "Питомец",
    petOptions: ["Выберите", "Собака", "Кошка", "Оба"],
    categoryOptions: [
      "Выберите",
      "Ветеринария",
      "Груминг",
      "Зоогостиница",
      "Магазин",
      "Дрессировка",
      "Другое",
    ],
    selectRequired: "Пожалуйста, выберите вариант.",
    contactRequired: "Укажите электронную почту и телефон.",
    locationParent: "Помогает находить подходящие услуги рядом с вами.",
    locationBusiness: "Помогает связаться с владельцами питомцев рядом с вами.",
    locationInfo: "Зачем мы спрашиваем местоположение",
    close: "Закрыть",
    verificationTitle: "Мы создаём доверие прозрачно.",
    verificationLead:
      "Подход BuddyLife при запуске: проверка основных данных бизнеса, профиля и обратной связи сообщества.",
    verificationCards: [
      [
        "Идентификация бизнеса",
        "Проверяем основные сведения и официальные контакты.",
      ],
      [
        "Проверка профиля",
        "Рассматриваем описание услуг и заявленные профессиональные данные.",
      ],
      [
        "Постоянное доверие",
        "Обращения и сигналы сообщества помогают поддерживать качество.",
      ],
    ],
    verificationLink: "Как будет работать проверка",
    launchStatus: "Армения • Подготовка к запуску",
    privacyLabel: "Политика конфиденциальности",
    termsLabel: "Условия использования",
    category: "Категория услуги",
    social: "Instagram или сайт (необязательно)",
    submit: "Сохранить место",
    success: "Спасибо. Вы в раннем сообществе BuddyLife 💜",
    privacy:
      "Данные используются только для связи о запуске и обезличенного анализа интереса.",
    footer: "Ваш питомец. Ваша семья. Наша забота.",
    brandEyebrow: "BUDDYLIFE АРМЕНИЯ",
    productEyebrow: "ПРОДУКТ BUDDYLIFE",
    trustEyebrow: "ДОВЕРИЕ BUDDYLIFE",
    pressEyebrow: "ПРЕСС-ПРЕЗЕНТАЦИЯ",
    earlyAccess: "РАННИЙ ДОСТУП",
    promise: "Ранний доступ и чек-лист владельца питомца в Ереване — на почту. Без рекламы, отписаться можно в любой момент.",
    successNote: "Чек-лист уже в вашей почте (проверьте и папку «Спам»).",
    contactTitle: "Есть вопрос?",
    contactLead: "Напишите нам — отвечаем в рабочие дни.",
    contactLabels: ["Почта", "WhatsApp", "Telegram", "Позвонить"],
    partnerTitle: "Станьте партнёром-основателем",
    partnerLead: "Первые клиники, грумеры и гостиницы регистрируются бесплатно, получают проверенный профиль и место на главной странице. Оставьте контакт — мы перезвоним.",
    contactFormTitle: "Напишите нам",
    contactFormLead: "Вопрос, предложение или партнёрство — напишите, отвечаем в рабочие дни.",
    messageLabel: "Сообщение",
    businessOptional: "Бизнес (необязательно)",
    phoneOptional: "Телефон (необязательно)",
    send: "Отправить",
    sending: "Отправляем…",
    sentTitle: "Спасибо, получили.",
    sentBody: "Ответим на вашу почту в рабочие дни.",
    contactFailed: "Не удалось отправить сообщение. Попробуйте ещё раз чуть позже.",
    writeToUs: "Написать нам",
    partnersEyebrow: "ПАРТНЁРЫ-ОСНОВАТЕЛИ",
    partnersTitle: "Те, кто первыми доверились BuddyLife",
    communityLabel: "Сообщество",
    preparingLabel: "Подготовка раннего доступа",
    slideLabel: "Слайд",
    languageLabel: "Сменить язык",
    menuLabel: "Открыть меню",
    closeMenuLabel: "Закрыть меню",
    ok: "Хорошо",
    parentCards: [
      [
        "Паспорт здоровья",
        "Вакцины, лекарства, визиты и документы в одном профиле.",
      ],
      ["Умные напоминания", "Деликатные уведомления в нужный момент."],
      ["Надёжные специалисты", "Ветеринары, грумеры, отели и другие услуги."],
      ["Сила сообщества", "Советы, опыт и местная поддержка."],
      [
        "Готовность к экстренным ситуациям",
        "Важные данные доступны, когда дорога каждая минута.",
      ],
      ["Семейная забота", "Вся семья видит одну актуальную информацию."],
    ],
    businessCards: [
      [
        "Целевая аудитория",
        "Показывайтесь людям, которые действительно ищут услуги для питомцев.",
      ],
      [
        "Доверенный профиль",
        "Представьте команду, услуги, опыт и сигналы доверия.",
      ],
      [
        "Меньше администрирования",
        "Будущие инструменты для запросов, напоминаний и общения.",
      ],
      [
        "Преимущество раннего партнёра",
        "Влияйте на продукт и получите специальные стартовые условия.",
      ],
      ["Локальная видимость", "Находите владельцев в своём городе и регионе."],
      ["Понимание роста", "В будущем — полезные данные об интересе клиентов."],
    ],
  },
  en: {
    nav: ["Home", "Features", "Pet parents", "For business", "Learn"],
    join: "Join us",
    loading: "Preparing your next step…",
    slides: [
      [
        "Your pet’s health, care and trusted services—together",
        "Health history, documents and important dates will no longer get lost.",
      ],
      [
        "Trusted care at the right moment",
        "Discover vetted professionals and choose the best help for your pet.",
      ],
      [
        "A new home for Armenia’s pet community",
        "Share experience, find support and build a more caring community.",
      ],
    ],
    ownerTitle: "BuddyLife for pet parents",
    ownerLead:
      "Less worry, more time together. Manage your pet’s whole life simply and safely.",
    businessTitle: "BuddyLife for pet businesses",
    businessLead:
      "Become more visible, build trust and reach people actively looking for your services.",
    benefits: "What you gain",
    learn: "Discover more",
    featureTitle: "One platform. Complete care.",
    featureLead:
      "Tools that solve real everyday problems without unnecessary complexity.",
    launch: "At launch",
    future: "Secret — coming soon",
    soon: "Coming soon",
    blur: "We are not revealing this feature yet.",
    press:
      "Early registered users will be invited to BuddyLife’s upcoming press launch event.",
    role: "Who are you?",
    parent: "Pet parent",
    business: "Business",
    name: "Name",
    businessName: "Business name",
    email: "Email",
    phone: "Phone",
    city: "City (optional)",
    province: "Province / region (optional)",
    petType: "Pet type",
    petOptions: ["Choose pet type", "Dog", "Cat", "Both"],
    categoryOptions: [
      "Choose category",
      "Veterinary",
      "Grooming",
      "Pet hotel",
      "Shop",
      "Training",
      "Other",
    ],
    selectRequired: "Please choose an option.",
    contactRequired: "Please provide both an email address and phone number.",
    locationParent: "Helps us connect you with relevant services nearby.",
    locationBusiness: "Helps us connect you with nearby pet parents.",
    locationInfo: "Why we ask for location",
    close: "Close",
    verificationTitle: "Trust, built transparently.",
    verificationLead:
      "BuddyLife’s launch approach: clear business identity, profile review and ongoing community feedback.",
    verificationCards: [
      [
        "Business identity",
        "We review core business details and official contact channels.",
      ],
      [
        "Profile review",
        "We review service descriptions and submitted professional information.",
      ],
      [
        "Ongoing trust",
        "Reports and community signals help maintain quality over time.",
      ],
    ],
    verificationLink: "How verification will work",
    launchStatus: "Armenia • Pre-launch",
    privacyLabel: "Privacy policy",
    termsLabel: "Terms of use",
    category: "Service category",
    social: "Instagram or website (optional)",
    submit: "Save my place",
    success: "Thank you. You’re in BuddyLife’s early community 💜",
    privacy:
      "Your data is used only for launch communication and anonymous interest analysis.",
    footer: "Your pet. Your family. Our care.",
    brandEyebrow: "BUDDYLIFE ARMENIA",
    productEyebrow: "BUDDYLIFE PRODUCT",
    trustEyebrow: "BUDDYLIFE TRUST",
    pressEyebrow: "PRESS LAUNCH",
    earlyAccess: "EARLY ACCESS",
    promise: "Early access plus the Yerevan pet-owner checklist by email. No ads; unsubscribe any time.",
    successNote: "The checklist is already in your inbox (check the spam folder too).",
    contactTitle: "Have a question?",
    contactLead: "Write to us — we reply on working days.",
    contactLabels: ["Email", "WhatsApp", "Telegram", "Call"],
    partnerTitle: "Become a founding partner",
    partnerLead: "The first clinics, groomers and hotels register free, get a verified profile and a place on the home page. Leave a contact and we will call you.",
    contactFormTitle: "Write to us",
    contactFormLead: "A question, a suggestion or a partnership — write, we reply on working days.",
    messageLabel: "Message",
    businessOptional: "Business (optional)",
    phoneOptional: "Phone (optional)",
    send: "Send",
    sending: "Sending…",
    sentTitle: "Thank you, we got it.",
    sentBody: "We will reply to your email on working days.",
    contactFailed: "The message could not be sent. Please try again a little later.",
    writeToUs: "Write to us",
    partnersEyebrow: "FOUNDING PARTNERS",
    partnersTitle: "The first to trust BuddyLife",
    communityLabel: "Community",
    preparingLabel: "Preparing early access",
    slideLabel: "Slide",
    languageLabel: "Change language",
    menuLabel: "Open menu",
    closeMenuLabel: "Close menu",
    ok: "OK",
    parentCards: [
      [
        "Health passport",
        "Keep vaccinations, medication, visits and documents in one profile.",
      ],
      ["Smart reminders", "Receive gentle reminders at the right moment."],
      [
        "Trusted professionals",
        "Find vets, groomers, hotels and other services.",
      ],
      ["Community power", "Advice, real experience and local support."],
      [
        "Emergency readiness",
        "Essential information when every minute matters.",
      ],
      ["Family care", "Keep everyone caring for your pet on the same page."],
    ],
    businessCards: [
      [
        "The right audience",
        "Be seen by people actively looking for pet services.",
      ],
      [
        "Trusted profile",
        "Present your team, services, expertise and trust signals.",
      ],
      [
        "Less administration",
        "Upcoming tools for requests, reminders and client communication.",
      ],
      [
        "Early-partner advantage",
        "Help shape the platform and receive launch benefits.",
      ],
      ["Local visibility", "Reach pet parents in your city and region."],
      ["Growth insight", "Future insight into demand and client interest."],
    ],
  },
  fa: persianSiteCopy,
};
const legalContent = {
  hy: {
    brandEyebrow: "BUDDYLIFE ՀԱՅԱՍՏԱՆ",
    privacy: [
      "Գաղտնիության քաղաքականություն",
      "BuddyLife-ը հավաքում է միայն վաղ հասանելիության գրանցման համար անհրաժեշտ տվյալները՝ անուն, կոնտակտ, օգտատիրոջ տեսակ և կամավոր տեղադրություն։ Տվյալներն օգտագործվում են մեկնարկի մասին կապի, ծառայության պլանավորման և անանուն պահանջարկի վերլուծության համար։ Ձեր առանձին համաձայնությամբ Meta Pixel-ը կարող է չափել էջերի դիտումները, կրթական նյութերի դիտումները և հաջող գրանցման փաստը՝ առանց գրանցման ձևում մուտքագրված անվան, հեռախոսի կամ էլ. հասցեի փոխանցման։ Չափումները կարող եք մերժել կամ փոխել կայքի «Չափումների կարգավորումներ» կոճակով։ Մենք չենք վաճառում անձնական տվյալներ։ Դուք կարող եք խնդրել տվյալների ուղղում կամ հեռացում՝ կապվելով մեր պաշտոնական սոցիալական էջերի միջոցով։",
    ],
    terms: [
      "Օգտագործման պայմաններ",
      "BuddyLife-ը նախամեկնարկային ծառայություն է։ Կայքի նյութերը տեղեկատվական են և չեն փոխարինում անասնաբուժական ախտորոշմանը կամ բուժմանը։ Գործառույթները, ժամկետներն ու գործընկերային ստուգման ընթացակարգերը կարող են փոփոխվել մինչև հանրային մեկնարկը։",
    ],
    verification: [
      "Ինչպես է աշխատելու ստուգումը",
      "Մեկնարկին BuddyLife-ը կվերանայի բիզնեսի հիմնական տվյալները, պաշտոնական կապի միջոցները, ծառայությունների նկարագրությունն ու ներկայացված մասնագիտական տեղեկությունները։ Ստուգված նշանը չի հանդիսանում բժշկական երաշխիք։ Համայնքային հաղորդումները կօգնեն վերանայել պրոֆիլները և պահպանել հարթակի որակը։",
    ],
    contact: "Պաշտոնական կապ՝ BuddyLife Armenia-ի Instagram և Facebook էջերով։",
  },
  ru: {
    brandEyebrow: "BUDDYLIFE АРМЕНИЯ",
    privacy: [
      "Политика конфиденциальности",
      "BuddyLife собирает только данные, необходимые для ранней регистрации: имя, контакт, тип пользователя и необязательное местоположение. Они используются для связи о запуске, планирования сервиса и обезличенного анализа спроса. С отдельного согласия Meta Pixel может измерять просмотры страниц и материалов, а также факт успешной регистрации, не передавая имя, телефон или email из формы. От аналитики можно отказаться или изменить выбор через кнопку «Настройки аналитики». Мы не продаём персональные данные. Запросить исправление или удаление можно через наши официальные социальные страницы.",
    ],
    terms: [
      "Условия использования",
      "BuddyLife находится на этапе подготовки к запуску. Материалы сайта носят информационный характер и не заменяют диагностику или лечение ветеринара. Функции, сроки и процедуры проверки партнёров могут измениться до публичного запуска.",
    ],
    verification: [
      "Как будет работать проверка",
      "При запуске BuddyLife будет проверять основные сведения о бизнесе, официальные контакты, описание услуг и предоставленную профессиональную информацию. Значок проверки не является медицинской гарантией. Обращения сообщества помогут пересматривать профили и поддерживать качество платформы.",
    ],
    contact:
      "Официальная связь — через страницы BuddyLife Armenia в Instagram и Facebook.",
  },
  en: {
    brandEyebrow: "BUDDYLIFE ARMENIA",
    privacy: [
      "Privacy policy",
      "BuddyLife collects only the information needed for early-access registration: name, contact details, audience type and optional location. We use it for launch communication, service planning and aggregated demand analysis. With separate consent, Meta Pixel may measure page and educational-content views and whether a registration succeeded; it does not receive the name, phone number or email entered in the form. You can decline measurement or change your choice through the Measurement settings button. We do not sell personal data. You may request correction or deletion through our official social channels.",
    ],
    terms: [
      "Terms of use",
      "BuddyLife is a pre-launch service. Website materials are informational and do not replace veterinary diagnosis or treatment. Features, timelines and partner-review procedures may change before public launch.",
    ],
    verification: [
      "How verification will work",
      "At launch, BuddyLife will review core business details, official contact channels, service descriptions and submitted professional information. A verification badge is not a medical guarantee. Community reports will help us reassess profiles and maintain platform quality.",
    ],
    contact:
      "Official contact is available through BuddyLife Armenia on Instagram and Facebook.",
  },
  fa: persianLegalCopy,
};
const images = [
  "/banner-organized.webp",
  "/banner-trusted-care.webp",
  "/banner-community.webp",
];
const parentIcons = [
  HeartPulse,
  BellRing,
  MapPinned,
  UsersRound,
  ShieldCheck,
  Home,
];
const businessIcons = [
  Search,
  BadgeCheck,
  CalendarClock,
  Sparkles,
  Store,
  BarChart3,
];
function openRoute(e: MouseEvent<HTMLAnchorElement>, href: string) {
  e.preventDefault();
  if (splitLocale(window.location.pathname).path !== splitLocale(new URL(href, window.location.origin).pathname).path) {
    document.documentElement.classList.add("isNavigating");
    window.setTimeout(() => document.documentElement.classList.remove("isNavigating"), 4000);
    window.setTimeout(() => {
      const language = splitLocale(window.location.pathname).locale || localStorage.getItem("buddylife-lang");
      window.location.assign(localePath(isLocale(language) ? language : "hy", href));
    }, 120);
  }
}
function track(
  eventType: string,
  language: Lang,
  audience = "",
  metadata: Record<string, unknown> = {},
) {
  let sessionId = "";
  try {
    sessionId = sessionStorage.getItem("buddylife_session") || crypto.randomUUID();
    sessionStorage.setItem("buddylife_session", sessionId);
  } catch {
    sessionId = "unavailable";
  }
  const params = new URLSearchParams(window.location.search);
  const attribution = {
    source: params.get("utm_source") || "direct",
    medium: params.get("utm_medium") || "none",
    campaign: params.get("utm_campaign") || "none",
    content: params.get("utm_content") || "none",
  };
  fetch("/api/track", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      eventType,
      page: window.location.pathname,
      language,
      audience,
      metadata: { ...attribution, ...metadata, sessionId },
    }),
    keepalive: true,
  }).catch(() => {});
  // Mirror the funnel steps into Vercel Web Analytics so conversion sits next to traffic.
  if (["join_opened", "registration_completed", "language_changed", "audience_selected"].includes(eventType)) {
    vaTrack(eventType, { language, audience: audience || "none", source: attribution.source, campaign: attribution.campaign });
  }
}
export default function BuddyPage({ view, initialLang = "hy", posts = [], articleSettings = {} }: { view: View; initialLang?: Lang; posts?: PublicPost[]; articleSettings?: ArticleSettings }) {
  const [lang, setLang] = useState<Lang>(initialLang),
    [slide, setSlide] = useState(0),
    [modal, setModal] = useState(false),
    [role, setRole] = useState<"parent" | "business">("parent"),
    [sent, setSent] = useState(false),
    [cms, setCms] = useState<Record<string, string>>({});
  const opener = useRef<HTMLElement | null>(null);
  const qrJoinHandled = useRef(false);
  const t = tr[lang];
  const h = hub[lang];
  useEffect(() => {
    const clearNavigationState = () => document.documentElement.classList.remove("isNavigating");
    clearNavigationState();
    window.addEventListener("pageshow", clearNavigationState);
    window.addEventListener("popstate", clearNavigationState);
    const visible = () => { if (document.visibilityState === "visible") clearNavigationState(); };
    document.addEventListener("visibilitychange", visible);
    const { locale: requested, path: barePath } = splitLocale(window.location.pathname);
    const stored = localStorage.getItem("buddylife-lang");
    // Only follow the stored preference when arriving from inside the site; a shared or typed link keeps its own language.
    const internalNavigation = document.referrer.startsWith(window.location.origin);
    const s = requested || (internalNavigation && isLocale(stored) ? stored : null);
    if (s && tr[s]) {
      // An unprefixed (Armenian) URL with a saved non-Armenian preference: show the matching URL.
      if (!requested && s !== "hy") window.history.replaceState({}, "", localePath(s, `${barePath}${window.location.search}${window.location.hash}`));
      queueMicrotask(() => setLang(s));
      localStorage.setItem("buddylife-lang", s);
      document.documentElement.lang = s;
      document.documentElement.dir = s === "fa" ? "rtl" : "ltr";
    } else {
      document.documentElement.lang = "hy";
      document.documentElement.dir = "ltr";
    }
    fetch("/api/content")
      .then((r) => r.json())
      .then((x) => setCms(x.content || {}))
      .catch(() => {});
    return () => {
      window.removeEventListener("pageshow", clearNavigationState);
      window.removeEventListener("popstate", clearNavigationState);
      document.removeEventListener("visibilitychange", visible);
    };
  }, []);
  useEffect(() => {
    const id = setInterval(() => setSlide((x) => (x + 1) % 3), 6000);
    return () => clearInterval(id);
  }, []);
  const change = (v: Lang) => {
    setLang(v);
    document.documentElement.lang = v;
    document.documentElement.dir = v === "fa" ? "rtl" : "ltr";
    localStorage.setItem("buddylife-lang", v);
    window.history.replaceState({}, "", localePath(v, `${window.location.pathname}${window.location.search}${window.location.hash}`));
    window.dispatchEvent(new Event("buddylife:language"));
    track("language_changed", v, role);
  };
  const open = (r?: "parent" | "business") => {
    opener.current = document.activeElement as HTMLElement;
    if (r) setRole(r);
    setSent(false);
    setModal(true);
    track("join_opened", lang, r || role, { view });
  };
  const closeModal = useCallback(() => {
    setModal(false);
    window.setTimeout(() => opener.current?.focus(), 0);
  }, []);
  useEffect(() => {
    if (qrJoinHandled.current) return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("join") !== "parent") return;
    qrJoinHandled.current = true;
    queueMicrotask(() => {
      setRole("parent");
      setSent(false);
      setModal(true);
    });
    track("join_opened", lang, "parent", {
      view,
      source: params.get("utm_source") || "qr",
      campaign: params.get("utm_campaign") || "pet_friendly_places",
      venue: params.get("venue") || "generic",
    });
  }, [lang, view]);
  const title = cms[`banner_${slide + 1}_${lang}`] || t.slides[slide][0];
  return (
    <main id="main-content" lang={lang} dir={lang === "fa" ? "rtl" : "ltr"}>
      <div className="routeLoader" aria-live="polite">
        <div className="loaderOrbit">
          <PawPrint />
          <i />
          <i />
          <i />
        </div>
      </div>
      <Header
        t={t}
        lang={lang}
        change={change}
        join={() => open()}
        view={view}
      />
      {view === "home" && (
        <>
          <section className="carousel">
            <div className="carouselImage">
              {images.map((src, index) => (
                <Image
                  key={src}
                  src={src}
                  alt="BuddyLife Armenia"
                  fill
                  priority={index === 0}
                  loading={index === 0 ? undefined : "eager"}
                  className={index === slide ? "active" : ""}
                  sizes="100vw"
                />
              ))}
            </div>
            <div className="carouselShade" />
            <div className="shell carouselCopy">
              <p className="eyebrow">{t.brandEyebrow}</p>
              <h1>{title}</h1>
              <p>{t.slides[slide][1]}</p>
              <button className="button" onClick={() => open()}>
                {t.join}
              </button>
              <div className="carouselDots">
                {images.map((_, i) => (
                  <button
                    aria-label={`${t.slideLabel} ${i + 1}`}
                    className={i === slide ? "active" : ""}
                    onClick={() => setSlide(i)}
                    key={i}
                  />
                ))}
              </div>
            </div>
          </section>
          <AudienceSplit t={t} lang={lang} />
          <FoundingPartners t={t} cms={cms} />
          <EducationPreview h={h} lang={lang} posts={posts} settings={articleSettings} />
          <TrustSection t={t} lang={lang} />
          <Press t={t} open={open} />
        </>
      )}
      {view === "owners" && <AudiencePage type="parent" t={t} open={open} lang={lang} />}{" "}
      {view === "business" && (
        <AudiencePage type="business" t={t} open={open} cms={cms} lang={lang} />
      )}{" "}
      {view === "features" && <Features t={t} open={open} />}
      {view === "learn" && <EducationHub h={h} lang={lang} posts={posts} settings={articleSettings} />}
      {(view === "privacy" || view === "terms" || view === "verification") && (
        <LegalPage kind={view} content={legalContent[lang]} />
      )}
      <Footer t={t} lang={lang} cms={cms} />
      {modal && (
        <JoinModal
          t={t}
          role={role}
          setRole={setRole}
          close={closeModal}
          sent={sent}
          setSent={setSent}
          lang={lang}
          view={view}
        />
      )}
    </main>
  );
}
function Header({
  t,
  lang,
  change,
  join,
  view,
}: {
  t: SiteCopy;
  lang: Lang;
  change: (v: Lang) => void;
  join: () => void;
  view: View;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [languageOpen, setLanguageOpen] = useState(false);
  useEffect(() => {
    if (!mobileOpen) return;
    const scrollY = window.scrollY;
    const previous = {
      position: document.body.style.position,
      top: document.body.style.top,
      width: document.body.style.width,
      overflow: document.body.style.overflow,
    };
    document.documentElement.classList.add("menuOpen");
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = "100%";
    document.body.style.overflow = "hidden";
    return () => {
      document.documentElement.classList.remove("menuOpen");
      document.body.style.position = previous.position;
      document.body.style.top = previous.top;
      document.body.style.width = previous.width;
      document.body.style.overflow = previous.overflow;
      window.scrollTo(0, scrollY);
    };
  }, [mobileOpen]);
  const links = [
    ["features", "/features", t.nav[1]],
    ["owners", "/pet-parents", t.nav[2]],
    ["business", "/for-business", t.nav[3]],
    ["learn", "/learn", t.nav[4]],
  ];
  return (
    <header className="nav shell">
      <a
        className="brand"
        href={localePath(lang, "/")}
        target="_top"
        onClick={(e) => openRoute(e, "/")}
      >
        <Image
          src="/buddylife-logo-clean.webp"
          alt="BuddyLife"
          width={132}
          height={132}
        />
      </a>
      <nav className="navLinks">
        {links.map(([key, href, label]) => (
          <a
            key={key}
            href={localePath(lang, href)}
            target="_top"
            className={view === key ? "active" : ""}
            aria-current={view === key ? "page" : undefined}
            onClick={(e) => openRoute(e, href)}
          >
            {label}
          </a>
        ))}
      </nav>
      <div className="navRight">
        <div className="languageMenu">
          <button
            className="languageTrigger"
            aria-label={t.languageLabel}
            aria-expanded={languageOpen}
            onClick={() => setLanguageOpen(!languageOpen)}
          >
            <span>{lang === "hy" ? "🇦🇲" : lang === "ru" ? "🇷🇺" : lang === "fa" ? "🇮🇷" : "🇬🇧"}</span>
            <ChevronDown size={13} />
          </button>
          {languageOpen && (
            <div className="languagePopover">
              {(
                [
                  ["hy", "🇦🇲", "Հայերեն"],
                  ["ru", "🇷🇺", "Русский"],
                  ["en", "🇬🇧", "English"],
                  ["fa", "🇮🇷", "فارسی"],
                ] as const
              ).map(([code, flag, label]) => (
                <button
                  key={code}
                  className={lang === code ? "active" : ""}
                  onClick={() => {
                    change(code);
                    setLanguageOpen(false);
                  }}
                >
                  <span>{flag}</span>
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>
        <button className="button buttonSmall" onClick={join}>
          {t.join}
        </button>
        <button
          className="mobileMenuButton"
          aria-label={t.menuLabel}
          onClick={() => setMobileOpen(true)}
        >
          <Menu size={22} />
        </button>
      </div>
      {mobileOpen && (
        <div className="mobileDrawer">
          <button
            className="drawerClose"
            aria-label={t.closeMenuLabel}
            onClick={() => setMobileOpen(false)}
          >
            <X />
          </button>
          <Image
            src="/buddylife-logo-clean.webp"
            alt="BuddyLife"
            width={120}
            height={120}
          />
          <nav>
            {links.map(([key, href, label]) => (
              <a
                key={key}
                href={localePath(lang, href)}
                target="_top"
                className={view === key ? "active" : ""}
                onClick={(e) => {
                  openRoute(e, href);
                  setMobileOpen(false);
                }}
              >
                {label}
              </a>
            ))}
          </nav>
          <button
            className="button"
            onClick={() => {
              setMobileOpen(false);
              join();
            }}
          >
            {t.join}
          </button>
          <div className="drawerLanguages">
            {(
              [
                ["hy", "🇦🇲"],
                ["ru", "🇷🇺"],
                ["en", "🇬🇧"],
                ["fa", "🇮🇷"],
              ] as const
            ).map(([code, flag]) => (
              <button
                key={code}
                className={lang === code ? "active" : ""}
                onClick={() => change(code)}
              >
                {flag} {code.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
function AudienceSplit({ t, lang }: { t: SiteCopy; lang: Lang }) {
  return (
    <section className="audienceSplit shell">
      <article className="parentCard">
        <div className="audienceVisual">
          <HeartPulse size={32} />
          <span>01</span>
        </div>
        <div>
          <p className="eyebrow">{t.parent}</p>
          <h2>{t.ownerTitle}</h2>
          <p>{t.ownerLead}</p>
          <div className="audienceSignals">
            <span>
              <HeartPulse /> {t.parentCards[0][0]}
            </span>
            <span>
              <BellRing /> {t.parentCards[1][0]}
            </span>
            <span>
              <MapPinned /> {t.parentCards[2][0]}
            </span>
          </div>
          <div className="audienceActions">
            <a
              href={localePath(lang, "/pet-parents")}
              target="_top"
              onClick={(e) => openRoute(e, "/pet-parents")}
            >
              {t.learn} →
            </a>
          </div>
        </div>
      </article>
      <article className="businessCard">
        <div className="audienceVisual">
          <Store size={32} />
          <span>02</span>
        </div>
        <div>
          <p className="eyebrow">{t.business}</p>
          <h2>{t.businessTitle}</h2>
          <p>{t.businessLead}</p>
          <div className="audienceSignals">
            <span>
              <Search /> {t.businessCards[0][0]}
            </span>
            <span>
              <BadgeCheck /> {t.businessCards[1][0]}
            </span>
            <span>
              <BarChart3 /> {t.businessCards[5][0]}
            </span>
          </div>
          <div className="audienceActions">
            <a
              href={localePath(lang, "/for-business")}
              target="_top"
              onClick={(e) => openRoute(e, "/for-business")}
            >
              {t.learn} →
            </a>
          </div>
        </div>
      </article>
    </section>
  );
}
function TrustSection({ t, lang }: { t: SiteCopy; lang: Lang }) {
  const icons = [BadgeCheck, ShieldCheck, UsersRound];
  return (
    <section className="section trustSection">
      <div className="shell">
        <div className="sectionIntro centered">
          <p className="eyebrow">{t.trustEyebrow}</p>
          <h2>{t.verificationTitle}</h2>
          <p>{t.verificationLead}</p>
        </div>
        <div className="trustGrid">
          {t.verificationCards.map((card, i) => {
            const Icon = icons[i];
            return (
              <article key={card[0]}>
                <Icon />
                <h3>{card[0]}</h3>
                <p>{card[1]}</p>
              </article>
            );
          })}
        </div>
        <a
          className="centerLink"
          href={localePath(lang, "/verification")}
          target="_top"
          onClick={(e) => openRoute(e, "/verification")}
        >
          {t.verificationLink} →
        </a>
      </div>
    </section>
  );
}
function EducationShare({ title, slug, lang }: { title: string; slug: string; lang: Lang }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const labels = {
    hy: { share: "Կիսվել", link: "Հղումը", copied: "Պատճենված է" },
    ru: { share: "Поделиться", link: "Скопировать ссылку", copied: "Скопировано" },
    en: { share: "Share", link: "Copy link", copied: "Copied" },
    fa: { share: "اشتراک‌گذاری", link: "کپی پیوند", copied: "کپی شد" },
  }[lang];
  const url = localeUrl(lang, `/learn/${slug}`);
  const shareEvent = (channel: string) => vaTrack("education_article_shared", { channel, article: url });
  async function copyLink() {
    await navigator.clipboard.writeText(url);
    shareEvent("copy_link");
    setCopied(true);
    window.setTimeout(() => { setCopied(false); setOpen(false); }, 1400);
  }
  return (
    <div className={`cardShare ${open ? "open" : ""}`} onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false); }}>
      <button type="button" className="cardShareTrigger" aria-label={`${labels.share}: ${title}`} aria-expanded={open} onClick={() => setOpen(!open)}><Share2 aria-hidden="true" /></button>
      {open && <div className="cardShareMenu" role="menu">
        <a role="menuitem" href={`https://www.facebook.com/sharer/sharer.php?display=popup&u=${encodeURIComponent(url)}`} target="_blank" rel="noopener noreferrer" onClick={() => shareEvent("facebook")}><span className="facebookMark">f</span><span>Facebook</span></a>
        <a role="menuitem" href={`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`} target="_blank" rel="noopener noreferrer" onClick={() => shareEvent("telegram")}><Send aria-hidden="true" /><span>Telegram</span></a>
        <button type="button" role="menuitem" onClick={copyLink}><Link2 aria-hidden="true" /><span>{copied ? labels.copied : labels.link}</span></button>
      </div>}
    </div>
  );
}
function EducationCards({ h, lang, posts = [], newestFirst = false, limit, settings = {} }: { h: HubCopy; lang: Lang; posts?: PublicPost[]; newestFirst?: boolean; limit?: number; settings?: ArticleSettings }) {
  const builtIn = h.topics.map((topic, index) => ({ slug: educationSlugs[index], category: topic[0], title: topic[1], excerpt: topic[2], image: topic[3], unoptimized: false, key: `static:${educationSlugs[index]}` }));
  // Backoffice and repository posts lead (newest first), then the built-in guides; pinned articles
  // from the backoffice jump to the front and hidden ones are removed, whatever their source.
  const fromPosts = posts
    .filter((post) => post.language === lang)
    .map((post) => ({ slug: post.slug, category: post.category, title: post.title, excerpt: post.excerpt, image: post.coverUrl, unoptimized: post.coverUrl.startsWith("/media/") || !post.coverUrl.startsWith("/"), key: post.id }));
  const taken = new Set(fromPosts.map((card) => card.slug));
  const all = orderArticles([...fromPosts, ...(newestFirst ? builtIn.reverse() : builtIn).filter((card) => card.slug && !taken.has(card.slug))], settings);
  const cards = limit ? all.slice(0, limit) : all;

  return (
    <div className="educationGrid">
      {cards.map((card) => (
        <article className="educationCard" key={card.key}>
          <a className="educationCardLink" href={localePath(lang, `/learn/${card.slug}`)} aria-label={`${card.title} — ${h.read}`}>
            <div className="educationImage">
              <Image src={card.image} alt={card.title} fill sizes="(max-width: 760px) 100vw, 33vw" unoptimized={card.unoptimized} />
            </div>
            <div className="educationBody">
              {card.category && <span className="topicTag">{card.category}</span>}
              <h3>{card.title}</h3>
              <p>{card.excerpt}</p>
              <small><BookOpen size={15} /> {h.read}</small>
            </div>
          </a>
          <EducationShare title={card.title} slug={card.slug} lang={lang} />
        </article>
      ))}
    </div>
  );
}
function EducationPreview({ h, lang, posts = [], settings = {} }: { h: HubCopy; lang: Lang; posts?: PublicPost[]; settings?: ArticleSettings }) {
  return (
    <section className="section educationPreview">
      <div className="shell">
        <div className="educationHeader">
          <div>
            <p className="eyebrow">{h.kicker}</p>
            <h2>{h.title}</h2>
            <p>{h.lead}</p>
          </div>
          <a
            className="educationLink"
            href={localePath(lang, "/learn")}
            target="_top"
            onClick={(e) => {
              track("education_opened", lang);
              openRoute(e, "/learn");
            }}
          >
            {h.all} →
          </a>
        </div>
        <EducationCards h={h} lang={lang} posts={posts} newestFirst limit={3} settings={settings} />
      </div>
    </section>
  );
}
function LegalPage({
  kind,
  content,
}: {
  kind: "privacy" | "terms" | "verification";
  content: LegalCopy;
}) {
  const item = content[kind];
  return (
    <section className="legalPage">
      <div className="shell">
        <p className="eyebrow">{content.brandEyebrow}</p>
        <h1>{item[0]}</h1>
        <div className="legalCard">
          <p>{item[1]}</p>
          <hr />
          <p>{content.contact}</p>
          <div className="legalContacts">
            <a href="https://www.instagram.com/buddylifearmenia/" target="_blank" rel="noopener noreferrer">Instagram</a>
            <a href="https://www.facebook.com/buddylifearmenia" target="_blank" rel="noopener noreferrer">
              Facebook
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
function EducationHub({ h, lang, posts = [], settings = {} }: { h: HubCopy; lang: Lang; posts?: PublicPost[]; settings?: ArticleSettings }) {
  return (
    <>
      <section className="hubHero">
        <div className="shell hubIntro">
          <p className="eyebrow">{h.kicker}</p>
          <h1>{h.title}</h1>
          <p>{h.lead}</p>
        </div>
      </section>
      <section className="section hubPage">
        <div className="shell">
          <div className="educationHeader compact">
            <h2>{h.latest}</h2>
          </div>
          <EducationCards h={h} lang={lang} posts={posts} newestFirst settings={settings} />
          <div className="educationDisclaimer">
            <ShieldCheck size={22} />
            <p>{h.disclaimer}</p>
          </div>
        </div>
      </section>
    </>
  );
}
function Press({ t, open }: { t: SiteCopy; open: () => void }) {
  return (
    <section className="pressBand">
      <div className="shell">
        <div>
          <p className="eyebrow light">{t.pressEyebrow}</p>
          <h2>{t.press}</h2>
        </div>
        <button className="button whiteButton" onClick={open}>
          {t.join}
        </button>
      </div>
    </section>
  );
}
function AudiencePage({
  type,
  t,
  open,
  cms = {},
  lang,
}: {
  type: Role;
  t: SiteCopy;
  open: (r?: Role) => void;
  cms?: Record<string, string>;
  lang: Lang;
}) {
  const cards = type === "parent" ? t.parentCards : t.businessCards;
  const cardIcons = type === "parent" ? parentIcons : businessIcons;
  return (
    <>
      <section className={`audienceHero ${type}`}>
        <div className="shell">
          <p className="eyebrow">{type === "parent" ? t.parent : t.business}</p>
          <h1>{type === "parent" ? t.ownerTitle : t.businessTitle}</h1>
          <p>{type === "parent" ? t.ownerLead : t.businessLead}</p>
          <button className="button" onClick={() => open(type)}>
            {t.join}
          </button>
        </div>
      </section>
      <section className="section">
        <div className="shell">
          <div className="sectionIntro">
            <p className="eyebrow">{t.benefits}</p>
            <h2>{type === "parent" ? t.ownerTitle : t.businessTitle}</h2>
          </div>
          <div className="benefitGrid">
            {cards.map((x, i) => (
              <article key={x[0]}>
                <span>
                  {(() => {
                    const Icon = cardIcons[i];
                    return <Icon size={25} />;
                  })()}
                </span>
                <small>0{i + 1}</small>
                <h3>{x[0]}</h3>
                <p>{x[1]}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
      {type === "business" && (
        <section className="contactBand" aria-labelledby="partner-title">
          <div className="shell">
            <div>
              <h2 id="partner-title">{t.partnerTitle}</h2>
              <p>{t.partnerLead}</p>
            </div>
            <div className="contactLinks">
              <button type="button" className="button" onClick={() => open("business")}>{t.join}</button>
              <ContactLinks t={t} cms={cms} />
            </div>
          </div>
          <div className="shell contactFormShell" id="contact">
            <div className="sectionIntro">
              <h3>{t.contactFormTitle}</h3>
              <p>{t.contactFormLead}</p>
            </div>
            <ContactForm t={t} lang={lang} page="/for-business" />
          </div>
        </section>
      )}
      <Press t={t} open={() => open(type)} />
    </>
  );
}
function ContactForm({ t, lang, page }: { t: SiteCopy; lang: Lang; page: string }) {
  const [state, setState] = useState<"idle" | "sending" | "sent" | "failed">("idle");
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const body = Object.fromEntries(new FormData(e.currentTarget).entries());
    setState("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...body, language: lang, page, source: new URLSearchParams(window.location.search).get("utm_source") || "" }),
      });
      setState(res.ok ? "sent" : "failed");
    } catch {
      setState("failed");
    }
  }
  if (state === "sent") {
    return (
      <div className="contactSent" role="status">
        <CheckCircle2 size={22} aria-hidden="true" />
        <div><b>{t.sentTitle}</b><p>{t.sentBody}</p></div>
      </div>
    );
  }
  return (
    <form className="contactForm" onSubmit={submit}>
      <div className="formRow">
        <label><span className="fieldLabel">{t.name}<b className="requiredMark">*</b></span><input name="name" required maxLength={120} autoComplete="name" /></label>
        <label><span className="fieldLabel">{t.email}<b className="requiredMark">*</b></span><input name="email" type="email" required maxLength={200} autoComplete="email" /></label>
      </div>
      <div className="formRow">
        <label><span className="fieldLabel">{t.businessOptional}</span><input name="business" maxLength={160} autoComplete="organization" /></label>
        <label><span className="fieldLabel">{t.phoneOptional}</span><input name="phone" type="tel" maxLength={40} autoComplete="tel" /></label>
      </div>
      <label><span className="fieldLabel">{t.messageLabel}<b className="requiredMark">*</b></span><textarea name="message" required minLength={10} maxLength={2000} rows={5} /></label>
      <div className="honeypot" aria-hidden="true"><input name="website" tabIndex={-1} autoComplete="off" /></div>
      {state === "failed" && <p className="formError" role="alert">{t.contactFailed}</p>}
      <div className="contactFormActions">
        <button className="button" type="submit" disabled={state === "sending"}>{state === "sending" ? t.sending : t.send}</button>
        <small>{t.privacy}</small>
      </div>
    </form>
  );
}
// Founding partners are managed in the backoffice (partner_<n>_name / _city / _url); the section only renders once one exists.
function FoundingPartners({ t, cms }: { t: SiteCopy; cms: Record<string, string> }) {
  const partners = [1, 2, 3, 4, 5, 6]
    .map((index) => ({ name: (cms[`partner_${index}_name`] || "").trim(), city: (cms[`partner_${index}_city`] || "").trim(), url: (cms[`partner_${index}_url`] || "").trim() }))
    .filter((partner) => partner.name);
  if (!partners.length) return null;
  return (
    <section className="section partnersSection" aria-labelledby="partners-title">
      <div className="shell">
        <div className="sectionIntro centered">
          <p className="eyebrow">{t.partnersEyebrow}</p>
          <h2 id="partners-title">{t.partnersTitle}</h2>
        </div>
        <ul className="partnerGrid">
          {partners.map((partner) => (
            <li key={partner.name}>
              {/^https:\/\//.test(partner.url) ? <a href={partner.url} target="_blank" rel="noopener noreferrer"><b>{partner.name}</b>{partner.city && <span>{partner.city}</span>}</a> : <div><b>{partner.name}</b>{partner.city && <span>{partner.city}</span>}</div>}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
function ContactLinks({ t, cms }: { t: SiteCopy; cms: Record<string, string> }) {
  const email = (cms.contact_email || "").trim();
  const whatsapp = (cms.contact_whatsapp || "").replace(/[^\d+]/g, "");
  const telegram = (cms.contact_telegram || "").trim().replace(/^@/, "");
  const phone = (cms.contact_phone || "").replace(/[^\d+]/g, "");
  const [emailLabel, whatsappLabel, telegramLabel, callLabel] = t.contactLabels;
  return (
    <>
      {email && <a href={`mailto:${email}`}><Mail size={16} aria-hidden="true" /> {emailLabel}</a>}
      {whatsapp && <a href={`https://wa.me/${whatsapp.replace(/^\+/, "")}`} target="_blank" rel="noopener noreferrer"><MessageCircle size={16} aria-hidden="true" /> {whatsappLabel}</a>}
      {telegram && <a href={`https://t.me/${telegram}`} target="_blank" rel="noopener noreferrer"><Send size={16} aria-hidden="true" /> {telegramLabel}</a>}
      {phone && <a href={`tel:${phone}`}><Phone size={16} aria-hidden="true" /> {callLabel}</a>}
    </>
  );
}
function Features({ t, open }: { t: SiteCopy; open: () => void }) {
  const visible = t.parentCards.slice(0, 4);
  return (
    <section className="innerPage">
      <div className="shell">
        <div className="pageIntro">
          <p className="eyebrow">{t.productEyebrow}</p>
          <h1>{t.featureTitle}</h1>
          <p className="lead">{t.featureLead}</p>
        </div>
        <div className="featureRoadmap">
          {visible.map((x, i) => (
            <article key={x[0]}>
              <span>
                {(() => {
                  const Icon = parentIcons[i];
                  return <Icon size={25} />;
                })()}
              </span>
              <b>{t.launch}</b>
              <h3>{x[0]}</h3>
              <p>{x[1]}</p>
            </article>
          ))}
          {t.parentCards.slice(4, 6).map((x, i) => (
            <article className="upcomingFeature" key={x[0]}>
              <span>
                {(() => {
                  const Icon = parentIcons[4 + i];
                  return <Icon size={25} />;
                })()}
              </span>
              <b>{t.soon}</b>
              <h3>{x[0]}</h3>
              <p>{x[1]}</p>
              <strong className="soonLabel">{t.soon}</strong>
            </article>
          ))}
        </div>
        <div className="inlineAction">
          <h2>{t.press}</h2>
          <button className="button" onClick={open}>
            {t.join}
          </button>
        </div>
      </div>
    </section>
  );
}
function VisualSelect({
  name,
  options,
  onChoose,
}: {
  name: string;
  options: readonly string[];
  onChoose: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState("");
  return (
    <div
      className={`visualSelect ${open ? "open" : ""}`}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setOpen(false);
      }}
    >
      <input type="hidden" name={name} value={selected} />
      <button
        type="button"
        className={selected ? "selected" : ""}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
      >
        <span>{selected || options[0]}</span>
        <ChevronDown aria-hidden="true" />
      </button>
      {open && (
        <div className="visualSelectMenu" role="listbox">
          {options.slice(1).map((option) => (
            <button
              type="button"
              role="option"
              aria-selected={selected === option}
              key={option}
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                setSelected(option);
                setOpen(false);
                onChoose();
              }}
            >
              {option}
              <span>✓</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
function JoinModal({
  t,
  role,
  setRole,
  close,
  sent,
  setSent,
  lang,
  view,
}: {
  t: SiteCopy;
  role: Role;
  setRole: (r: Role) => void;
  close: () => void;
  sent: boolean;
  setSent: (x: boolean) => void;
  lang: Lang;
  view: View;
}) {
  const [contactError, setContactError] = useState(false);
  const [selectError, setSelectError] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const chooseRole = (nextRole: "parent" | "business") => {
    setRole(nextRole);
    setContactError(false);
    setSelectError(false);
    window.requestAnimationFrame(() => {
      modalRef.current?.scrollTo({ top: 0, behavior: "instant" });
    });
    track("audience_selected", lang, nextRole, { view });
  };
  useEffect(() => {
    const scrollY = window.scrollY;
    document.documentElement.classList.add("joinOpen");
    const previous = {
      position: document.body.style.position,
      top: document.body.style.top,
      width: document.body.style.width,
      overflow: document.body.style.overflow,
    };
    document.documentElement.classList.add("modalOpen");
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = "100%";
    document.body.style.overflow = "hidden";
    modalRef.current?.querySelector<HTMLButtonElement>(".modalClose")?.focus();
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        close();
        return;
      }
      if (e.key !== "Tab" || !modalRef.current) return;
      const items = [
        ...modalRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]),input:not([disabled]),a[href],[tabindex="0"]',
        ),
      ];
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.documentElement.classList.remove("modalOpen");
      document.body.style.position = previous.position;
      document.body.style.top = previous.top;
      document.body.style.width = previous.width;
      document.body.style.overflow = previous.overflow;
      window.scrollTo(0, scrollY);
      document.documentElement.classList.remove("joinOpen");
    };
  }, [close]);
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget),
      body = Object.fromEntries(fd.entries());
    if (
      (role === "parent" && !body.petType) ||
      (role === "business" && !body.category)
    ) {
      setSelectError(true);
      return;
    }
    if (!String(body.email || "").trim() || !String(body.phone || "").trim()) {
      setContactError(true);
      return;
    }
    setContactError(false);
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        ...body,
        role,
        language: lang,
        utmSource: new URLSearchParams(window.location.search).get("utm_source") || "",
        utmMedium: new URLSearchParams(window.location.search).get("utm_medium") || "",
        utmCampaign: new URLSearchParams(window.location.search).get("utm_campaign") || "",
        venue: new URLSearchParams(window.location.search).get("venue") || "",
      }),
    });
    if (res.ok) {
      setSent(true);
      track("registration_completed", lang, role, { view });
      window.dispatchEvent(new CustomEvent("buddylife:meta", {
        detail: { name: "Lead", parameters: { content_category: role, content_name: view } },
      }));
      if (role === "business") {
        window.dispatchEvent(new CustomEvent("buddylife:meta", {
          detail: { name: "ProviderLead", custom: true, parameters: { content_name: view } },
        }));
      }
    }
  }
  return (
    <div className="modalBackdrop">
      <div
        ref={modalRef}
        className="joinModal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="join-dialog-title"
      >
        <button type="button" className="modalClose" aria-label={t.close} onClick={close}>
          <X aria-hidden="true" />
        </button>
        {sent ? (
          <div className="modalSuccess">
            <span>♥</span>
            <h2>{t.success}</h2>
            <p className="successNote">{t.successNote}</p>
            <p>{t.press}</p>
            <div className="successSocials">
              <a href="https://www.instagram.com/buddylifearmenia/" target="_blank" rel="noopener noreferrer">
                Instagram
              </a>
              <a href="https://www.facebook.com/buddylifearmenia" target="_blank" rel="noopener noreferrer">
                Facebook
              </a>
            </div>
            <button className="button" onClick={close}>
              {t.ok}
            </button>
          </div>
        ) : (
          <>
            <p className="eyebrow">{t.earlyAccess}</p>
            <h2 id="join-dialog-title">{t.join}</h2>
            <div className="eventInvite">
              <Image
                src="/launch-ticket.webp"
                alt=""
                width={210}
                height={132}
              />
              <p>{t.press}</p>
            </div>
            <p className="modalPromise"><CheckCircle2 size={16} aria-hidden="true" /> {t.promise}</p>
            <div className="roleTabs">
              <button
                type="button"
                className={role === "parent" ? "active" : ""}
                onClick={() => chooseRole("parent")}
              >
                🐾 {t.parent}
              </button>
              <button
                type="button"
                className={role === "business" ? "active" : ""}
                onClick={() => chooseRole("business")}
              >
                ✦ {t.business}
              </button>
            </div>
            <form className="modalForm" onSubmit={submit}>
              {role === "parent" ? (
                <>
                  <label>
                    <span className="fieldLabel">
                      {t.name}
                      <b className="requiredMark">*</b>
                    </span>
                    <input name="name" required />
                  </label>
                  <label>
                    <span className="fieldLabel">
                      {t.petType}
                      <b className="requiredMark">*</b>
                    </span>
                    <VisualSelect
                      name="petType"
                      options={t.petOptions}
                      onChoose={() => setSelectError(false)}
                    />
                  </label>
                </>
              ) : (
                <>
                  <label>
                    <span className="fieldLabel">
                      {t.businessName}
                      <b className="requiredMark">*</b>
                    </span>
                    <input name="businessName" required />
                  </label>
                  <label>
                    <span className="fieldLabel">
                      {t.category}
                      <b className="requiredMark">*</b>
                    </span>
                    <VisualSelect
                      name="category"
                      options={t.categoryOptions}
                      onChoose={() => setSelectError(false)}
                    />
                  </label>
                  <label>
                    {t.social}
                    <input name="social" />
                  </label>
                </>
              )}
              {selectError && (
                <p className="contactError">{t.selectRequired}</p>
              )}
              <p className="contactRequirement">
                <b className="requiredMark">*</b> {t.contactRequired}
              </p>
              <div className="formRow">
                <label>
                  <span className="fieldLabel">
                    {t.email}
                    <b className="requiredMark">*</b>
                  </span>
                  <input
                    name="email"
                    type="email"
                    required
                    onInput={() => setContactError(false)}
                  />
                </label>
                <label>
                  <span className="fieldLabel">
                    {t.phone}
                    <b className="requiredMark">*</b>
                  </span>
                  <input
                    name="phone"
                    type="tel"
                    required
                    inputMode="numeric"
                    pattern="[0-9]*"
                    onInput={(event) => {
                      event.currentTarget.value = event.currentTarget.value.replace(
                        /\D/g,
                        "",
                      );
                      setContactError(false);
                    }}
                  />
                </label>
              </div>
              {contactError && (
                <p className="contactError">{t.contactRequired}</p>
              )}
              <div className="formRow">
                <label>
                  <span className="fieldLabel">
                    {t.city}
                    <button
                      type="button"
                      className="infoHint"
                      aria-label={t.locationInfo}
                      aria-describedby="city-location-tip"
                    >
                      i
                      <span role="tooltip" id="city-location-tip">
                        {role === "parent"
                          ? t.locationParent
                          : t.locationBusiness}
                      </span>
                    </button>
                  </span>
                  <input name="city" aria-describedby="city-location-tip" />
                </label>
                <label>
                  <span className="fieldLabel">
                    {t.province}
                    <button
                      type="button"
                      className="infoHint"
                      aria-label={t.locationInfo}
                      aria-describedby="province-location-tip"
                    >
                      i
                      <span role="tooltip" id="province-location-tip">
                        {role === "parent"
                          ? t.locationParent
                          : t.locationBusiness}
                      </span>
                    </button>
                  </span>
                  <input
                    name="province"
                    aria-describedby="province-location-tip"
                  />
                </label>
              </div>
              <small>{t.privacy}</small>
              <button className="button submit">{t.submit}</button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
function Footer({ t, lang, cms = {} }: { t: SiteCopy; lang: Lang; cms?: Record<string, string> }) {
  const hasContact = Boolean(cms.contact_email || cms.contact_whatsapp || cms.contact_telegram || cms.contact_phone);
  return (
    <footer className="trustFooter">
      <div className="shell footerMain">
        <div className="footerIdentity">
          <div className="footerLogo">
            <Image
              src="/buddylife-logo-clean.webp"
              alt="BuddyLife"
              width={108}
              height={108}
            />
          </div>
          <p>{t.footer}</p>
          <div className="trustMarks">
            <a
              href={localePath(lang, "/privacy")}
              target="_top"
              onClick={(e) => openRoute(e, "/privacy")}
            >
              <ShieldCheck /> {t.privacyLabel}
            </a>
            <span>
              <MapPin /> {t.launchStatus}
            </span>
          </div>
        </div>
        <div className="footerColumn">
          <b>BuddyLife</b>
          <a
            href={localePath(lang, "/features")}
            target="_top"
            onClick={(e) => openRoute(e, "/features")}
          >
            {t.nav[1]}
          </a>
          <a
            href={localePath(lang, "/pet-parents")}
            target="_top"
            onClick={(e) => openRoute(e, "/pet-parents")}
          >
            {t.nav[2]}
          </a>
          <a
            href={localePath(lang, "/for-business")}
            target="_top"
            onClick={(e) => openRoute(e, "/for-business")}
          >
            {t.nav[3]}
          </a>
          <a
            href={localePath(lang, "/learn")}
            target="_top"
            onClick={(e) => openRoute(e, "/learn")}
          >
            {t.nav[4]}
          </a>
          <a
            href={localePath(lang, "/verification")}
            target="_top"
            onClick={(e) => openRoute(e, "/verification")}
          >
            {t.verificationLink}
          </a>
          <a href={localePath(lang, "/for-business#contact")} target="_top" onClick={(e) => openRoute(e, "/for-business#contact")}>
            {t.writeToUs}
          </a>
        </div>
        {hasContact && (
          <div className="footerColumn">
            <b>{t.contactTitle}</b>
            <div className="contactLinks"><ContactLinks t={t} cms={cms} /></div>
          </div>
        )}
        <div className="footerColumn">
          <b>{t.communityLabel}</b>
          <a href="https://www.instagram.com/buddylifearmenia/" target="_blank" rel="noopener noreferrer">
            <svg className="socialMiniIcon" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="5" />
              <circle cx="12" cy="12" r="4" />
              <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
            </svg>{" "}
            Instagram
          </a>
          <a href="https://www.facebook.com/buddylifearmenia" target="_blank" rel="noopener noreferrer">
            <span className="facebookLetter">f</span> Facebook
          </a>
        </div>
        <div className="footerColumn footerStatus">
          <b>{t.launchStatus}</b>
          <span>
            <i /> {t.preparingLabel}
          </span>
          <p>{t.press}</p>
        </div>
      </div>
      <div className="shell footerBottom">
        <small>© 2026 BuddyLife Armenia</small>
        <a href={localePath(lang, "/terms")} target="_top" onClick={(e) => openRoute(e, "/terms")}>
          {t.termsLabel}
        </a>
      </div>
    </footer>
  );
}
