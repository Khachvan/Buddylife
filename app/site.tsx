"use client";
import Image from "next/image";
import { FormEvent, useEffect, useState } from "react";
import {
  BadgeCheck,
  BarChart3,
  BellRing,
  BookOpen,
  CalendarClock,
  ChevronDown,
  HeartPulse,
  Home,
  Mail,
  MapPin,
  MapPinned,
  Menu,
  Search,
  ShieldCheck,
  Sparkles,
  Store,
  UsersRound,
  X,
} from "lucide-react";
type Lang = "hy" | "ru" | "en";
type View = "home" | "features" | "owners" | "business" | "learn";
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
    slides: [
      [
        "Ամեն կարևոր բան՝ մեկ վայրում",
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
    blur: "Մենք դեռ չենք բացահայտում այս հնարավորությունը։",
    press:
      "Վաղ գրանցված օգտատերերը կհրավիրվեն BuddyLife-ի առաջիկա մամուլի շնորհանդեսին։",
    role: "Ո՞վ եք դուք",
    parent: "Կենդանատեր",
    business: "Բիզնես",
    name: "Անուն (ոչ պարտադիր)",
    businessName: "Բիզնեսի անվանում",
    email: "Էլ․ փոստ",
    phone: "Հեռախոս (ոչ պարտադիր)",
    city: "Քաղաք",
    province: "Մարզ / նահանգ (ոչ պարտադիր)",
    petType: "Կենդանու տեսակ",
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
    slides: [
      [
        "Всё важное — в одном месте",
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
    blur: "Эту возможность мы пока не раскрываем.",
    press:
      "Ранние пользователи будут приглашены на ближайшую пресс-презентацию BuddyLife.",
    role: "Кто вы?",
    parent: "Владелец",
    business: "Бизнес",
    name: "Имя (необязательно)",
    businessName: "Название бизнеса",
    email: "Эл. почта",
    phone: "Телефон (необязательно)",
    city: "Город",
    province: "Область / регион (необязательно)",
    petType: "Питомец",
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
    slides: [
      [
        "Everything important, in one place",
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
    blur: "We are not revealing this feature yet.",
    press:
      "Early registered users will be invited to BuddyLife’s upcoming press launch event.",
    role: "Who are you?",
    parent: "Pet parent",
    business: "Business",
    name: "Name (optional)",
    businessName: "Business name",
    email: "Email",
    phone: "Phone (optional)",
    city: "City",
    province: "Province / region (optional)",
    petType: "Pet type",
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
        "/learn-preventive-care.png",
      ],
      [
        "Սեզոնային անվտանգություն",
        "Շոգ եղանակին անվտանգ զբոսանքի պարզ կանոնները",
        "Ընտրեք զով ժամեր, ապահովեք մաքուր ջուր և ստվեր, ու երբեք կենդանուն մի թողեք փակ մեքենայում։",
        "/learn-summer-safety.png",
      ],
      [
        "Կատուների բարեկեցություն",
        "Ինչպես տունը դարձնել հետաքրքիր և անվտանգ կատվի համար",
        "Թաքստոցները, բարձր տեղերը, մաքուր ռեսուրսները, խաղն ու կանխատեսելի միջավայրը նվազեցնում են սթրեսը։",
        "/learn-cat-enrichment.png",
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
        "/learn-preventive-care.png",
      ],
      [
        "Сезонная безопасность",
        "Простые правила прогулок в жаркую погоду",
        "Выбирайте прохладные часы, обеспечьте воду и тень и никогда не оставляйте питомца в закрытой машине.",
        "/learn-summer-safety.png",
      ],
      [
        "Благополучие кошек",
        "Как сделать дом интересным и безопасным для кошки",
        "Укрытия, вертикальные пространства, чистые ресурсы, игра и предсказуемая среда снижают стресс.",
        "/learn-cat-enrichment.png",
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
        "/learn-preventive-care.png",
      ],
      [
        "Seasonal safety",
        "Simple rules for safer walks in hot weather",
        "Choose cooler hours, provide fresh water and shade, and never leave a pet inside a closed car.",
        "/learn-summer-safety.png",
      ],
      [
        "Cat wellbeing",
        "How to make home engaging and safe for an indoor cat",
        "Hiding places, vertical space, clean resources, play and a predictable environment can reduce stress.",
        "/learn-cat-enrichment.png",
      ],
    ],
  },
};
const images = [
  "/banner-organized.png",
  "/banner-trusted-care.png",
  "/banner-community.png",
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
export default function BuddyPage({ view }: { view: View }) {
  const [lang, setLang] = useState<Lang>("hy"),
    [slide, setSlide] = useState(0),
    [modal, setModal] = useState(false),
    [role, setRole] = useState<"parent" | "business">("parent"),
    [sent, setSent] = useState(false),
    [cms, setCms] = useState<Record<string, string>>({});
  const t = tr[lang];
  const h = hub[lang];
  useEffect(() => {
    const s = localStorage.getItem("buddylife-lang") as Lang | null;
    if (s && tr[s]) setLang(s);
    fetch("/api/content")
      .then((r) => r.json())
      .then((x) => setCms(x.content || {}))
      .catch(() => {});
  }, []);
  useEffect(() => {
    const id = setInterval(() => setSlide((x) => (x + 1) % 3), 6000);
    return () => clearInterval(id);
  }, []);
  const change = (v: Lang) => {
    setLang(v);
    localStorage.setItem("buddylife-lang", v);
  };
  const open = (r?: "parent" | "business") => {
    if (r) setRole(r);
    setSent(false);
    setModal(true);
  };
  const title = cms[`banner_${slide + 1}_${lang}`] || t.slides[slide][0];
  return (
    <main>
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
          <EducationPreview h={h} />
          <Press t={t} open={open} />
        </>
      )}
      {view === "owners" && <AudiencePage type="parent" t={t} open={open} />}{" "}
      {view === "business" && (
        <AudiencePage type="business" t={t} open={open} />
      )}{" "}
      {view === "features" && <Features t={t} open={open} />}
      {view === "learn" && <EducationHub h={h} />}
      <Footer t={t} />
      {modal && (
        <JoinModal
          t={t}
          role={role}
          setRole={setRole}
          close={() => setModal(false)}
          sent={sent}
          setSent={setSent}
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
  const links = [
    ["home", "/", t.nav[0]],
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
        onClick={(e) => view === "home" && e.preventDefault()}
      >
        <Image
          src="/buddylife-logo-transparent.png"
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
            className={view === key ? "active" : ""}
            aria-current={view === key ? "page" : undefined}
            onClick={(e) => view === key && e.preventDefault()}
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
            src="/buddylife-logo-transparent.png"
            alt="BuddyLife"
            width={120}
            height={120}
          />
          <nav>
            {links.map(([key, href, label]) => (
              <a
                key={key}
                href={href}
                className={view === key ? "active" : ""}
                onClick={(e) => {
                  if (view === key) e.preventDefault();
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
            <a href="/pet-parents">{t.learn} →</a>
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
            <a href="/for-business">{t.learn} →</a>
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
        <a className="centerLink" href="/features">
          {t.learn} →
        </a>
      </div>
    </section>
  );
}
function EducationCards({ h }: { h: any }) {
  return (
    <div className="educationGrid">
      {h.topics.map((topic: any) => (
        <article className="educationCard" key={topic[1]}>
          <div className="educationImage">
            <Image
              src={topic[3]}
              alt=""
              fill
              sizes="(max-width: 760px) 100vw, 33vw"
            />
          </div>
          <div className="educationBody">
            <span className="topicTag">{topic[0]}</span>
            <h3>{topic[1]}</h3>
            <p>{topic[2]}</p>
            <small>
              <BookOpen size={15} /> {h.read}
            </small>
          </div>
        </article>
      ))}
    </div>
  );
}
function EducationPreview({ h }: { h: any }) {
  return (
    <section className="section educationPreview">
      <div className="shell">
        <div className="educationHeader">
          <div>
            <p className="eyebrow">{h.kicker}</p>
            <h2>{h.title}</h2>
            <p>{h.lead}</p>
          </div>
          <a className="educationLink" href="/learn">
            {h.all} →
          </a>
        </div>
        <EducationCards h={h} />
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
                <h3>BuddyLife •••••••</h3>
                <p>{t.blur}</p>
              </div>
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
function JoinModal({
  t,
  role,
  setRole,
  close,
  sent,
  setSent,
}: {
  t: any;
  role: "parent" | "business";
  setRole: (r: any) => void;
  close: () => void;
  sent: boolean;
  setSent: (x: boolean) => void;
}) {
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget),
      body = Object.fromEntries(fd.entries());
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ...body, role }),
    });
    if (res.ok) setSent(true);
  }
  return (
    <div
      className="modalBackdrop"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <div className="joinModal" role="dialog" aria-modal="true">
        <button className="modalClose" aria-label="Close" onClick={close}>
          ×
        </button>
        {sent ? (
          <div className="modalSuccess">
            <span>♥</span>
            <h2>{t.success}</h2>
            <p>{t.press}</p>
            <button className="button" onClick={close}>
              OK
            </button>
          </div>
        ) : (
          <>
            <p className="eyebrow">EARLY ACCESS</p>
            <h2>{t.join}</h2>
            <p className="pressTip">✦ {t.press}</p>
            <div className="roleTabs">
              <button
                className={role === "parent" ? "active" : ""}
                onClick={() => setRole("parent")}
              >
                🐾 {t.parent}
              </button>
              <button
                className={role === "business" ? "active" : ""}
                onClick={() => setRole("business")}
              >
                ✦ {t.business}
              </button>
            </div>
            <form className="modalForm" onSubmit={submit}>
              {role === "parent" ? (
                <>
                  <label>
                    {t.name}
                    <input name="name" />
                  </label>
                  <label>
                    {t.petType}
                    <select name="petType" required>
                      <option value="">—</option>
                      <option>Dog</option>
                      <option>Cat</option>
                      <option>Both</option>
                    </select>
                  </label>
                </>
              ) : (
                <>
                  <label>
                    {t.businessName}
                    <input name="businessName" required />
                  </label>
                  <label>
                    {t.category}
                    <select name="category" required>
                      <option value="">—</option>
                      <option>Veterinary</option>
                      <option>Grooming</option>
                      <option>Pet hotel</option>
                      <option>Shop</option>
                      <option>Training</option>
                      <option>Other</option>
                    </select>
                  </label>
                  <label>
                    {t.social}
                    <input name="social" />
                  </label>
                </>
              )}
              <div className="formRow">
                <label>
                  {t.email}
                  <input name="email" type="email" required />
                </label>
                <label>
                  {t.phone}
                  <input name="phone" type="tel" />
                </label>
              </div>
              <div className="formRow">
                <label>
                  {t.city}
                  <input name="city" required />
                </label>
                <label>
                  {t.province}
                  <input name="province" />
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
              src="/buddylife-logo-transparent.png"
              alt="BuddyLife"
              width={108}
              height={108}
            />
          </div>
          <p>{t.footer}</p>
          <div className="trustMarks">
            <span>
              <ShieldCheck /> Privacy-minded
            </span>
            <span>
              <MapPin /> Built for Armenia
            </span>
          </div>
        </div>
        <div className="footerColumn">
          <b>BuddyLife</b>
          <a href="/features">{t.nav[1]}</a>
          <a href="/pet-parents">{t.nav[2]}</a>
          <a href="/for-business">{t.nav[3]}</a>
          <a href="/learn">{t.nav[4]}</a>
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
          <b>Launch status</b>
          <span>
            <i /> Early access preparation
          </span>
          <p>{t.press}</p>
        </div>
      </div>
      <div className="shell footerBottom">
        <small>© 2026 BuddyLife Armenia</small>
        <small>{t.privacy}</small>
        <a href="/admin" aria-label="Website management">
          <Mail /> Website management
        </a>
      </div>
    </footer>
  );
}
