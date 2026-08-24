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
  ChevronDown,
  HeartPulse,
  Home,
  MapPin,
  MapPinned,
  Link2,
  Menu,
  PawPrint,
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
type Lang = "hy" | "ru" | "en";
type View =
  | "home"
  | "features"
  | "owners"
  | "business"
  | "learn"
  | "privacy"
  | "terms"
  | "verification";
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
};
const hub = {
  hy: {
    kicker: "BUDDYLIFE ԿՐԹԱԿԱՆ ՀԱԲ",
    title: "Ավելի տեղեկացված խնամք՝ ամեն օր։",
    lead: "Կարճ, հստակ և տեսողական ուղեցույցներ՝ ստեղծված վստահելի անասնաբուժական աղբյուրների հիման վրա։",
    latest: "Ընտրված ուղեցույցներ",
    all: "Տեսնել բոլոր թեմաները",
    disclaimer:
      "Կրթական նյութերը չեն փոխարինում անասնաբույժի ախտորոշմանը կամ բուժմանը։ Արտակարգ իրավիճակում անմիջապես դիմեք մասնագետի։",
    read: "4 րոպե ընթերցում",
    topics: [
      [
        "Կանխարգելում",
        "Ինչու տարեկան զննումն ու անհատական պատվաստումների պլանը կարևոր են",
        "Կանոնավոր զննումները կարող են խնդիրները նկատել ավելի վաղ, իսկ պատվաստումների ճիշտ պլանը կախված է տարիքից, կենսակերպից և տեղական ռիսկերից։",
        "/learn-preventive-care.webp",
      ],
      [
        "Սեզոնային անվտանգություն",
        "Շոգ եղանակին անվտանգ զբոսանքի պարզ կանոնները",
        "Ընտրեք զով ժամեր, ապահովեք մաքուր ջուր և ստվեր, ու երբեք կենդանուն մի թողեք փակ մեքենայում։",
        "/learn-summer-safety.webp",
      ],
      [
        "Կատուների բարեկեցություն",
        "Ինչպես տունը դարձնել հետաքրքիր և անվտանգ կատվի համար",
        "Թաքստոցները, բարձր տեղերը, մաքուր ռեսուրսները, խաղն ու կանխատեսելի միջավայրը նվազեցնում են սթրեսը։",
        "/learn-cat-enrichment.webp",
      ],
    ],
  },
  ru: {
    kicker: "ОБРАЗОВАТЕЛЬНЫЙ ХАБ BUDDYLIFE",
    title: "Более осознанная забота — каждый день.",
    lead: "Короткие, понятные и визуальные материалы на основе надёжных ветеринарных источников.",
    latest: "Избранные материалы",
    all: "Все темы",
    disclaimer:
      "Материалы носят образовательный характер и не заменяют диагностику или лечение ветеринара. В экстренной ситуации немедленно обратитесь к специалисту.",
    read: "4 минуты",
    topics: [
      [
        "Профилактика",
        "Почему важны ежегодный осмотр и индивидуальный план вакцинации",
        "Регулярные осмотры помогают заметить проблемы раньше, а план вакцинации зависит от возраста, образа жизни и местных рисков.",
        "/learn-preventive-care.webp",
      ],
      [
        "Сезонная безопасность",
        "Простые правила прогулок в жаркую погоду",
        "Выбирайте прохладные часы, обеспечьте воду и тень и никогда не оставляйте питомца в закрытой машине.",
        "/learn-summer-safety.webp",
      ],
      [
        "Благополучие кошек",
        "Как сделать дом интересным и безопасным для кошки",
        "Укрытия, вертикальные пространства, чистые ресурсы, игра и предсказуемая среда снижают стресс.",
        "/learn-cat-enrichment.webp",
      ],
    ],
  },
  en: {
    kicker: "BUDDYLIFE EDUCATION HUB",
    title: "Better-informed care, every day.",
    lead: "Short, clear and visual guides grounded in trusted veterinary sources.",
    latest: "Featured guides",
    all: "Explore every topic",
    disclaimer:
      "Educational content does not replace veterinary diagnosis or treatment. Contact a professional immediately in an emergency.",
    read: "4 min read",
    topics: [
      [
        "Preventive care",
        "Why annual checkups and an individual vaccination plan matter",
        "Regular exams can identify concerns earlier, while vaccination plans should reflect age, lifestyle and local risk.",
        "/learn-preventive-care.webp",
      ],
      [
        "Seasonal safety",
        "Simple rules for safer walks in hot weather",
        "Choose cooler hours, provide fresh water and shade, and never leave a pet inside a closed car.",
        "/learn-summer-safety.webp",
      ],
      [
        "Cat wellbeing",
        "How to make home engaging and safe for an indoor cat",
        "Hiding places, vertical space, clean resources, play and a predictable environment can reduce stress.",
        "/learn-cat-enrichment.webp",
      ],
    ],
  },
};
const legalContent = {
  hy: {
    privacy: [
      "Գաղտնիության քաղաքականություն",
      "BuddyLife-ը հավաքում է միայն վաղ հասանելիության գրանցման համար անհրաժեշտ տվյալները՝ անուն, կոնտակտ, օգտատիրոջ տեսակ և կամավոր տեղադրություն։ Տվյալներն օգտագործվում են մեկնարկի մասին կապի, ծառայության պլանավորման և անանուն պահանջարկի վերլուծության համար։ Մենք չենք վաճառում անձնական տվյալներ։ Դուք կարող եք խնդրել տվյալների ուղղում կամ հեռացում՝ կապվելով մեր պաշտոնական սոցիալական էջերի միջոցով։",
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
    privacy: [
      "Политика конфиденциальности",
      "BuddyLife собирает только данные, необходимые для ранней регистрации: имя, контакт, тип пользователя и необязательное местоположение. Они используются для связи о запуске, планирования сервиса и обезличенного анализа спроса. Мы не продаём персональные данные. Запросить исправление или удаление можно через наши официальные социальные страницы.",
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
    privacy: [
      "Privacy policy",
      "BuddyLife collects only the information needed for early-access registration: name, contact details, audience type and optional location. We use it for launch communication, service planning and aggregated demand analysis. We do not sell personal data. You may request correction or deletion through our official social channels.",
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
};
const images = [
  "/banner-organized.webp",
  "/banner-trusted-care.webp",
  "/banner-community.webp",
];
const educationSlugs = [
  "preventive-care",
  "summer-safety",
  "indoor-cat-enrichment",
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
  if (window.location.pathname !== href) {
    document.documentElement.classList.add("isNavigating");
    window.setTimeout(() => document.documentElement.classList.remove("isNavigating"), 4000);
    window.setTimeout(() => {
      window.location.href = new URL(href, window.location.origin).href;
    }, 120);
  }
}
function track(
  eventType: string,
  language: Lang,
  audience = "",
  metadata: Record<string, unknown> = {},
) {
  fetch("/api/track", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      eventType,
      page: window.location.pathname,
      language,
      audience,
      metadata,
    }),
    keepalive: true,
  }).catch(() => {});
}
export default function BuddyPage({ view }: { view: View }) {
  const [lang, setLang] = useState<Lang>("hy"),
    [slide, setSlide] = useState(0),
    [modal, setModal] = useState(false),
    [role, setRole] = useState<"parent" | "business">("parent"),
    [sent, setSent] = useState(false),
    [cms, setCms] = useState<Record<string, string>>({});
  const opener = useRef<HTMLElement | null>(null);
  const t = tr[lang];
  const h = hub[lang];
  useEffect(() => {
    const clearNavigationState = () => document.documentElement.classList.remove("isNavigating");
    clearNavigationState();
    window.addEventListener("pageshow", clearNavigationState);
    window.addEventListener("popstate", clearNavigationState);
    const visible = () => { if (document.visibilityState === "visible") clearNavigationState(); };
    document.addEventListener("visibilitychange", visible);
    const s = localStorage.getItem("buddylife-lang") as Lang | null;
    if (s && tr[s]) {
      setLang(s);
      document.documentElement.lang = s;
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
    localStorage.setItem("buddylife-lang", v);
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
  const title = cms[`banner_${slide + 1}_${lang}`] || t.slides[slide][0];
  return (
    <main id="main-content">
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
              {images.map((x, i) => (
                <Image
                  key={x}
                  src={x}
                  alt="BuddyLife Armenia"
                  fill
                  priority={i === 0}
                  className={i === slide ? "active" : ""}
                  sizes="100vw"
                />
              ))}
            </div>
            <div className="carouselShade" />
            <div className="shell carouselCopy">
              <p className="eyebrow">BUDDYLIFE ARMENIA</p>
              <h1>{title}</h1>
              <p>{t.slides[slide][1]}</p>
              <button className="button" onClick={() => open()}>
                {t.join}
              </button>
              <div className="carouselDots">
                {images.map((_, i) => (
                  <button
                    aria-label={`Slide ${i + 1}`}
                    className={i === slide ? "active" : ""}
                    onClick={() => setSlide(i)}
                    key={i}
                  />
                ))}
              </div>
            </div>
          </section>
          <AudienceSplit t={t} />
          <FeaturePreview t={t} />
          <TrustSection t={t} />
          <EducationPreview h={h} lang={lang} />
          <Press t={t} open={open} />
        </>
      )}
      {view === "owners" && <AudiencePage type="parent" t={t} open={open} />}{" "}
      {view === "business" && (
        <AudiencePage type="business" t={t} open={open} />
      )}{" "}
      {view === "features" && <Features t={t} open={open} />}
      {view === "learn" && <EducationHub h={h} />}
      {(view === "privacy" || view === "terms" || view === "verification") && (
        <LegalPage kind={view} content={legalContent[lang]} />
      )}
      <Footer t={t} />
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
  t: any;
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
        href="/"
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
            href={href}
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
            aria-label="Change language"
            aria-expanded={languageOpen}
            onClick={() => setLanguageOpen(!languageOpen)}
          >
            <span>{lang === "hy" ? "🇦🇲" : lang === "ru" ? "🇷🇺" : "🇬🇧"}</span>
            <ChevronDown size={13} />
          </button>
          {languageOpen && (
            <div className="languagePopover">
              {(
                [
                  ["hy", "🇦🇲", "Հայերեն"],
                  ["ru", "🇷🇺", "Русский"],
                  ["en", "🇬🇧", "English"],
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
          aria-label="Open menu"
          onClick={() => setMobileOpen(true)}
        >
          <Menu size={22} />
        </button>
      </div>
      {mobileOpen && (
        <div className="mobileDrawer">
          <button
            className="drawerClose"
            aria-label="Close menu"
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
                href={href}
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
function AudienceSplit({ t }: { t: any }) {
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
              href="/pet-parents"
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
              href="/for-business"
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
function FeaturePreview({ t }: { t: any }) {
  return (
    <section className="section featurePreview">
      <div className="shell">
        <div className="sectionIntro centered">
          <p className="eyebrow">BUDDYLIFE PRODUCT</p>
          <h2>{t.featureTitle}</h2>
          <p>{t.featureLead}</p>
        </div>
        <div className="previewCards">
          {t.parentCards.slice(0, 4).map((x: any, i: number) => (
            <article key={x[0]}>
              <span>
                {(() => {
                  const Icon = parentIcons[i];
                  return <Icon size={24} />;
                })()}
              </span>
              <small>0{i + 1}</small>
              <h3>{x[0]}</h3>
              <p>{x[1]}</p>
            </article>
          ))}
        </div>
        <a
          className="centerLink"
          href="/features"
          target="_top"
          onClick={(e) => openRoute(e, "/features")}
        >
          {t.learn} →
        </a>
      </div>
    </section>
  );
}
function TrustSection({ t }: { t: any }) {
  const icons = [BadgeCheck, ShieldCheck, UsersRound];
  return (
    <section className="section trustSection">
      <div className="shell">
        <div className="sectionIntro centered">
          <p className="eyebrow">BUDDYLIFE TRUST</p>
          <h2>{t.verificationTitle}</h2>
          <p>{t.verificationLead}</p>
        </div>
        <div className="trustGrid">
          {t.verificationCards.map((card: string[], i: number) => {
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
          href="/verification"
          target="_top"
          onClick={(e) => openRoute(e, "/verification")}
        >
          {t.verificationLink} →
        </a>
      </div>
    </section>
  );
}
function EducationShare({ title, slug }: { title: string; slug: string }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const url = `https://buddylife.am/learn/${slug}`;
  const shareEvent = (channel: string) => vaTrack("education_article_shared", { channel, article: url });
  async function copyLink() {
    await navigator.clipboard.writeText(url);
    shareEvent("copy_link");
    setCopied(true);
    window.setTimeout(() => { setCopied(false); setOpen(false); }, 1400);
  }
  return (
    <div className={`cardShare ${open ? "open" : ""}`} onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false); }}>
      <button type="button" className="cardShareTrigger" aria-label={`Կիսվել՝ ${title}`} aria-expanded={open} onClick={() => setOpen(!open)}><Share2 aria-hidden="true" /></button>
      {open && <div className="cardShareMenu" role="menu">
        <a role="menuitem" href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`} target="_blank" rel="noopener noreferrer" onClick={() => shareEvent("facebook")}><span className="facebookMark">f</span><span>Facebook</span></a>
        <a role="menuitem" href={`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`} target="_blank" rel="noopener noreferrer" onClick={() => shareEvent("telegram")}><Send aria-hidden="true" /><span>Telegram</span></a>
        <button type="button" role="menuitem" onClick={copyLink}><Link2 aria-hidden="true" /><span>{copied ? "Պատճենված է" : "Հղումը"}</span></button>
      </div>}
    </div>
  );
}
function EducationCards({ h }: { h: any }) {
  return (
    <div className="educationGrid">
      {h.topics.map((topic: any, index: number) => (
        <article
          className="educationCard"
          key={topic[1]}
        >
          <a className="educationCardLink" href={`/learn/${educationSlugs[index]}`} aria-label={`${topic[1]} — ${h.read}`}>
            <div className="educationImage">
              <Image src={topic[3]} alt={topic[1]} fill sizes="(max-width: 760px) 100vw, 33vw" />
            </div>
            <div className="educationBody">
              <span className="topicTag">{topic[0]}</span>
              <h3>{topic[1]}</h3>
              <p>{topic[2]}</p>
              <small><BookOpen size={15} /> {h.read}</small>
            </div>
          </a>
          <EducationShare title={topic[1]} slug={educationSlugs[index]} />
        </article>
      ))}
    </div>
  );
}
function EducationPreview({ h, lang }: { h: any; lang: Lang }) {
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
            href="/learn"
            target="_top"
            onClick={(e) => {
              track("education_opened", lang);
              openRoute(e, "/learn");
            }}
          >
            {h.all} →
          </a>
        </div>
        <EducationCards h={h} />
      </div>
    </section>
  );
}
function LegalPage({
  kind,
  content,
}: {
  kind: "privacy" | "terms" | "verification";
  content: any;
}) {
  const item = content[kind];
  return (
    <section className="legalPage">
      <div className="shell">
        <p className="eyebrow">BUDDYLIFE ARMENIA</p>
        <h1>{item[0]}</h1>
        <div className="legalCard">
          <p>{item[1]}</p>
          <hr />
          <p>{content.contact}</p>
          <div className="legalContacts">
            <a href="https://www.instagram.com/buddylifearmenia/">Instagram</a>
            <a href="https://www.facebook.com/profile.php?id=61593562114437">
              Facebook
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
function EducationHub({ h }: { h: any }) {
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
          <EducationCards h={h} />
          <div className="educationDisclaimer">
            <ShieldCheck size={22} />
            <p>{h.disclaimer}</p>
          </div>
        </div>
      </section>
    </>
  );
}
function Press({ t, open }: { t: any; open: () => void }) {
  return (
    <section className="pressBand">
      <div className="shell">
        <div>
          <p className="eyebrow light">PRESS LAUNCH</p>
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
}: {
  type: "parent" | "business";
  t: any;
  open: (r: any) => void;
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
            {cards.map((x: any, i: number) => (
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
      <Press t={t} open={() => open(type)} />
    </>
  );
}
function Features({ t, open }: { t: any; open: () => void }) {
  const visible = t.parentCards.slice(0, 4);
  return (
    <section className="innerPage">
      <div className="shell">
        <div className="pageIntro">
          <p className="eyebrow">BUDDYLIFE PRODUCT</p>
          <h1>{t.featureTitle}</h1>
          <p className="lead">{t.featureLead}</p>
        </div>
        <div className="featureRoadmap">
          {visible.map((x: any, i: number) => (
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
          {[0, 1, 2].map((i) => (
            <article className="secretFeature" key={i}>
              <div>
                <span>?</span>
                <b>{t.future}</b>
                <h3>BuddyLife</h3>
                <p>{t.blur}</p>
              </div>
              <span className="secretPaw">
                <PawPrint aria-hidden="true" />
              </span>
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
  options: string[];
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
  t: any;
  role: "parent" | "business";
  setRole: (r: any) => void;
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
    const escape = (e: KeyboardEvent) => e.key === "Escape" && close();
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("keydown", escape);
      document.documentElement.classList.remove("modalOpen");
      document.body.style.position = previous.position;
      document.body.style.top = previous.top;
      document.body.style.width = previous.width;
      document.body.style.overflow = previous.overflow;
      window.scrollTo(0, scrollY);
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
      body: JSON.stringify({ ...body, role }),
    });
    if (res.ok) {
      setSent(true);
      track("registration_completed", lang, role, { view });
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
        onKeyDown={(e) => {
          if (e.key !== "Tab" || !modalRef.current) return;
          const items = [
            ...modalRef.current.querySelectorAll<HTMLElement>(
              'button:not([disabled]),input:not([disabled]),a[href],[tabindex="0"]',
            ),
          ];
          if (!items.length) return;
          const first = items[0],
            last = items[items.length - 1];
          if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last.focus();
          } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }}
      >
        <button className="modalClose" aria-label={t.close} onClick={close}>
          ×
        </button>
        {sent ? (
          <div className="modalSuccess">
            <span>♥</span>
            <h2>{t.success}</h2>
            <p>{t.press}</p>
            <div className="successSocials">
              <a href="https://www.instagram.com/buddylifearmenia/">
                Instagram
              </a>
              <a href="https://www.facebook.com/profile.php?id=61593562114437">
                Facebook
              </a>
            </div>
            <button className="button" onClick={close}>
              OK
            </button>
          </div>
        ) : (
          <>
            <p className="eyebrow">EARLY ACCESS</p>
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
function Footer({ t }: { t: any }) {
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
              href="/privacy"
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
            href="/features"
            target="_top"
            onClick={(e) => openRoute(e, "/features")}
          >
            {t.nav[1]}
          </a>
          <a
            href="/pet-parents"
            target="_top"
            onClick={(e) => openRoute(e, "/pet-parents")}
          >
            {t.nav[2]}
          </a>
          <a
            href="/for-business"
            target="_top"
            onClick={(e) => openRoute(e, "/for-business")}
          >
            {t.nav[3]}
          </a>
          <a
            href="/learn"
            target="_top"
            onClick={(e) => openRoute(e, "/learn")}
          >
            {t.nav[4]}
          </a>
          <a
            href="/verification"
            target="_top"
            onClick={(e) => openRoute(e, "/verification")}
          >
            {t.verificationLink}
          </a>
        </div>
        <div className="footerColumn">
          <b>Community</b>
          <a href="https://www.instagram.com/buddylifearmenia/">
            <img
              className="socialMiniIcon"
              src="https://cdn.simpleicons.org/instagram/cdbfd5"
              alt=""
            />{" "}
            Instagram
          </a>
          <a href="https://www.facebook.com/profile.php?id=61593562114437">
            <span className="facebookLetter">f</span> Facebook
          </a>
        </div>
        <div className="footerColumn footerStatus">
          <b>{t.launchStatus}</b>
          <span>
            <i /> Early access preparation
          </span>
          <p>{t.press}</p>
        </div>
      </div>
      <div className="shell footerBottom">
        <small>© 2026 BuddyLife Armenia</small>
        <a href="/terms" target="_top" onClick={(e) => openRoute(e, "/terms")}>
          {t.termsLabel}
        </a>
      </div>
    </footer>
  );
}
