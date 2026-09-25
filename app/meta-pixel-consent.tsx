"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { localePath, splitLocale } from "../lib/locale";

type Consent = "accepted" | "declined" | null;
type Language = "hy" | "ru" | "en" | "fa";
type MetaEventDetail = { name: string; parameters?: Record<string, unknown>; custom?: boolean };
type MetaFbq = ((...args: unknown[]) => void) & { callMethod?: (...args: unknown[]) => void; queue: unknown[]; loaded: boolean; version: string };

declare global {
  interface Window {
    fbq?: MetaFbq;
    _fbq?: Window["fbq"];
  }
}

const CONSENT_KEY = "buddylife-meta-consent-v1";

const copy = {
  hy: {
    title: "Գովազդային չափումներ",
    body: "Ձեր համաձայնությամբ Meta-ի չափումները կօգնեն հասկանալ՝ որ նյութերն են օգտակար։ Կարող եք շարունակել առանց դրանց։",
    accept: "Թույլատրել",
    decline: "Չթույլատրել",
    privacy: "Գաղտնիություն",
    settings: "Չափումների կարգավորումներ",
  },
  ru: {
    title: "Рекламная аналитика",
    body: "С вашего согласия аналитика Meta поможет понять, какие материалы полезны. Сайт работает и без неё.",
    accept: "Разрешить",
    decline: "Не разрешать",
    privacy: "Конфиденциальность",
    settings: "Настройки аналитики",
  },
  en: {
    title: "Advertising measurement",
    body: "With your consent, Meta measurement helps us understand which content is useful. The site works without it.",
    accept: "Allow",
    decline: "Do not allow",
    privacy: "Privacy",
    settings: "Measurement settings",
  },
  fa: {
    title: "اندازه‌گیری تبلیغات",
    body: "با رضایت شما، ابزار اندازه‌گیری Meta به ما کمک می‌کند بفهمیم کدام مطالب مفیدترند. سایت بدون آن هم کار می‌کند.",
    accept: "اجازه می‌دهم",
    decline: "اجازه نمی‌دهم",
    privacy: "حریم خصوصی",
    settings: "تنظیمات اندازه‌گیری",
  },
} as const;

function currentLanguage(): Language {
  const fromPath = splitLocale(window.location.pathname).locale;
  if (fromPath) return fromPath;
  const language = document.documentElement.lang;
  return language === "ru" || language === "en" || language === "fa" ? language : "hy";
}

function installPixel(pixelId: string) {
  if (window.fbq) return;
  const fbq: MetaFbq = function (...args: unknown[]) {
    if (fbq.callMethod) fbq.callMethod(...args);
    else fbq.queue.push(args);
  } as MetaFbq;
  fbq.queue = [];
  fbq.loaded = true;
  fbq.version = "2.0";
  window.fbq = fbq;
  window._fbq = fbq;
  const script = document.createElement("script");
  script.async = true;
  script.src = "https://connect.facebook.net/en_US/fbevents.js";
  document.head.appendChild(script);
  fbq("init", pixelId);
}

export default function MetaPixelConsent({ pixelId, initialLanguage = "hy" }: { pixelId?: string; initialLanguage?: Language }) {
  const pathname = usePathname();
  const [consent, setConsent] = useState<Consent>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [language, setLanguage] = useState<Language>(initialLanguage);
  const t = copy[language];
  const viewContent = useMemo(() => pathname.startsWith("/learn/") && pathname.split("/").length > 2, [pathname]);
  const hostname = typeof window === "undefined" ? "" : window.location.hostname;
  const isBackofficeHost = hostname === "backoffice.buddylife.am" || hostname.startsWith("backoffice.");
  const isPrivateRoute = pathname === "/backoffice" || pathname.startsWith("/admin");
  const trackingEligible = !isBackofficeHost && !isPrivateRoute;

  useEffect(() => {
    const syncLanguage = () => queueMicrotask(() => setLanguage(currentLanguage()));
    syncLanguage();
    window.addEventListener("buddylife:language", syncLanguage);
    return () => window.removeEventListener("buddylife:language", syncLanguage);
  }, [pathname]);

  useEffect(() => {
    if (!trackingEligible) return;
    const saved = window.localStorage.getItem(CONSENT_KEY);
    const next = saved === "accepted" || saved === "declined" ? saved : null;
    queueMicrotask(() => setConsent(next));
  }, [trackingEligible]);

  useEffect(() => {
    if (!trackingEligible || consent !== "accepted" || !pixelId) return;
    installPixel(pixelId);
    window.fbq?.("track", "PageView");
    if (viewContent) window.fbq?.("track", "ViewContent", { content_type: "article", content_name: pathname });
  }, [consent, pathname, pixelId, trackingEligible, viewContent]);

  useEffect(() => {
    const handleMetaEvent = (event: Event) => {
      if (!trackingEligible || consent !== "accepted" || !pixelId) return;
      const { name, parameters = {}, custom = false } = (event as CustomEvent<MetaEventDetail>).detail;
      installPixel(pixelId);
      window.fbq?.(custom ? "trackCustom" : "track", name, parameters);
    };
    window.addEventListener("buddylife:meta", handleMetaEvent);
    return () => window.removeEventListener("buddylife:meta", handleMetaEvent);
  }, [consent, pixelId, trackingEligible]);

  const choose = (next: Exclude<Consent, null>) => {
    window.localStorage.setItem(CONSENT_KEY, next);
    setConsent(next);
    setSettingsOpen(false);
  };

  const showDialog = consent === null || settingsOpen;
  if (!trackingEligible) return null;

  return (
    <>
      {showDialog ? (
        <aside className="measurementConsent" role="dialog" aria-modal="false" aria-labelledby="measurement-title">
          <div>
            <strong id="measurement-title">{t.title}</strong>
            <p>{t.body} <Link href={localePath(language, "/privacy")}>{t.privacy}</Link></p>
          </div>
          <div className="measurementActions">
            <button type="button" className="measurementDecline" onClick={() => choose("declined")}>{t.decline}</button>
            <button type="button" className="button buttonSmall" onClick={() => choose("accepted")}>{t.accept}</button>
          </div>
        </aside>
      ) : (
        <button type="button" className="measurementSettings" onClick={() => setSettingsOpen(true)}>{t.settings}</button>
      )}
    </>
  );
}
