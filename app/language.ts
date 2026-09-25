import type { Metadata } from "next";
import { localeAlternates, localePath } from "../lib/locale";

export type Lang = "hy" | "ru" | "en" | "fa";
export type PublicView = "home" | "features" | "owners" | "business" | "learn" | "privacy" | "terms" | "verification";

export function resolveLanguage(value: string | string[] | undefined): Lang {
  const language = Array.isArray(value) ? value[0] : value;
  return language === "ru" || language === "en" || language === "fa" ? language : "hy";
}

const routeByView: Record<PublicView, string> = {
  home: "/",
  features: "/features",
  owners: "/pet-parents",
  business: "/for-business",
  learn: "/learn",
  privacy: "/privacy",
  terms: "/terms",
  verification: "/verification",
};

const metadataCopy: Record<Lang, Record<PublicView, { title: string; description: string }>> = {
  hy: {
    home: { title: "BuddyLife Armenia | Կենդանիների խնամքը՝ մեկ վայրում", description: "Կենդանու առողջությունը, խնամքը, վստահելի ծառայություններն ու համայնքը՝ մեկ հարմար հարթակում։" },
    features: { title: "Հնարավորություններ | BuddyLife Armenia", description: "Բացահայտեք BuddyLife-ի մեկնարկային և շուտով հասանելի գործիքները կենդանատերերի ու բիզնեսների համար։" },
    owners: { title: "Կենդանատերերին | BuddyLife Armenia", description: "Կառավարեք ձեր կենդանու առողջությունը, հիշեցումները, փաստաթղթերն ու վստահելի ծառայությունները։" },
    business: { title: "Կենդանիների բիզնեսներին | BuddyLife Armenia", description: "Կառուցեք վստահություն, տեսանելիություն և կապ Հայաստանի կենդանատերերի հետ։" },
    learn: { title: "Կրթական հարթակ | BuddyLife Armenia", description: "Կարճ, տեսողական և պատասխանատու նյութեր կենդանիների առողջության, անվտանգության և բարեկեցության մասին։" },
    privacy: { title: "Գաղտնիության քաղաքականություն | BuddyLife Armenia", description: "Ինչ տվյալներ է հավաքում BuddyLife Armenia-ն և ինչպես է դրանք օգտագործում։" },
    terms: { title: "Օգտագործման պայմաններ | BuddyLife Armenia", description: "BuddyLife Armenia կայքի նախամեկնարկային օգտագործման պայմանները։" },
    verification: { title: "Ինչպես է աշխատելու ստուգումը | BuddyLife Armenia", description: "BuddyLife-ի բիզնես պրոֆիլների ստուգման և շարունակական վստահության մոտեցումը։" },
  },
  ru: {
    home: { title: "BuddyLife Armenia | Забота о питомце в одном месте", description: "Здоровье питомца, повседневный уход, надёжные услуги и сообщество на одной удобной платформе." },
    features: { title: "Возможности | BuddyLife Armenia", description: "Узнайте о стартовых и будущих инструментах BuddyLife для владельцев питомцев и бизнеса." },
    owners: { title: "Владельцам питомцев | BuddyLife Armenia", description: "Организуйте сведения о здоровье, напоминания, документы и поиск надёжных услуг для питомца." },
    business: { title: "Pet-бизнесу | BuddyLife Armenia", description: "Развивайте доверие, видимость и связь с владельцами питомцев в Армении." },
    learn: { title: "Образовательный центр | BuddyLife Armenia", description: "Короткие, наглядные и ответственные материалы о здоровье, безопасности и благополучии питомцев." },
    privacy: { title: "Политика конфиденциальности | BuddyLife Armenia", description: "Какие данные собирает BuddyLife Armenia и как они используются." },
    terms: { title: "Условия использования | BuddyLife Armenia", description: "Условия использования сайта BuddyLife Armenia на этапе подготовки к запуску." },
    verification: { title: "Как будет работать проверка | BuddyLife Armenia", description: "Подход BuddyLife к проверке бизнес-профилей и поддержанию доверия." },
  },
  en: {
    home: { title: "BuddyLife Armenia | Pet care in one place", description: "Pet health, everyday care, trusted services and community in one convenient platform." },
    features: { title: "Features | BuddyLife Armenia", description: "Explore BuddyLife’s launch and upcoming tools for pet parents and pet-care businesses." },
    owners: { title: "For pet parents | BuddyLife Armenia", description: "Organize pet health information, reminders, documents and access to trusted services." },
    business: { title: "For pet businesses | BuddyLife Armenia", description: "Build trust, visibility and stronger connections with pet parents in Armenia." },
    learn: { title: "Education hub | BuddyLife Armenia", description: "Short, visual and responsible guides to pet health, safety and wellbeing." },
    privacy: { title: "Privacy policy | BuddyLife Armenia", description: "Learn what information BuddyLife Armenia collects and how it is used." },
    terms: { title: "Terms of use | BuddyLife Armenia", description: "Pre-launch terms for using the BuddyLife Armenia website." },
    verification: { title: "How verification will work | BuddyLife Armenia", description: "BuddyLife’s approach to business-profile review and ongoing trust." },
  },
  fa: {
    home: { title: "BuddyLife Armenia | مراقبت از حیوان در یک جا", description: "سلامت حیوان، مراقبت روزمره، خدمات قابل‌اعتماد و جامعه همراه در یک پلتفرم ساده." },
    features: { title: "امکانات | BuddyLife Armenia", description: "با ابزارهای زمان راه‌اندازی و امکانات آینده BuddyLife برای سرپرستان حیوانات و کسب‌وکارها آشنا شوید." },
    owners: { title: "برای سرپرستان حیوانات | BuddyLife Armenia", description: "اطلاعات سلامت، یادآوری‌ها، مدارک و دسترسی به خدمات قابل‌اعتماد را منظم کنید." },
    business: { title: "برای کسب‌وکارهای حیوانات | BuddyLife Armenia", description: "اعتماد، دیده‌شدن و ارتباط با سرپرستان حیوانات در ارمنستان را تقویت کنید." },
    learn: { title: "مرکز آموزش | BuddyLife Armenia", description: "راهنماهای کوتاه، تصویری و مسئولانه درباره سلامت، ایمنی و رفاه حیوانات." },
    privacy: { title: "سیاست حفظ حریم خصوصی | BuddyLife Armenia", description: "BuddyLife Armenia چه اطلاعاتی دریافت می‌کند و چگونه از آن استفاده می‌کند." },
    terms: { title: "شرایط استفاده | BuddyLife Armenia", description: "شرایط استفاده از وب‌سایت BuddyLife Armenia در مرحله پیش از راه‌اندازی." },
    verification: { title: "فرایند بررسی چگونه انجام می‌شود؟ | BuddyLife Armenia", description: "رویکرد BuddyLife برای ارزیابی پروفایل کسب‌وکارها و حفظ اعتماد در طول زمان." },
  },
};

export function localizedMetadata(view: PublicView, lang: Lang): Metadata {
  const route = routeByView[view];
  const copy = metadataCopy[lang][view];
  return {
    ...copy,
    keywords: lang === "hy"
      ? ["կենդանիների խնամք Հայաստան", "կենդանիների ծառայություններ Երևան", "BuddyLife Armenia"]
      : lang === "ru"
        ? ["уход за питомцами Армения", "услуги для животных Ереван", "BuddyLife Armenia"]
        : lang === "fa"
          ? ["مراقبت از حیوانات در ارمنستان", "خدمات حیوانات در ایروان", "BuddyLife Armenia"]
          : ["pet care Armenia", "pet services Yerevan", "BuddyLife Armenia"],
    alternates: {
      canonical: localePath(lang, route),
      languages: localeAlternates(route),
    },
    openGraph: {
      title: copy.title,
      description: copy.description,
      type: "website",
      locale: lang === "hy" ? "hy_AM" : lang === "ru" ? "ru_RU" : lang === "fa" ? "fa_IR" : "en_US",
      url: localePath(lang, route),
      images: [{ url: "/og.webp", width: 1200, height: 630, alt: "BuddyLife Armenia" }],
    },
    twitter: {
      card: "summary_large_image",
      title: copy.title,
      description: copy.description,
      images: ["/og.webp"],
    },
  };
}
