"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronDown, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";

type Lang = "hy" | "ru" | "en";
const copy = {
  hy: { links: [["/features", "Հնարավորություններ"], ["/pet-parents", "Կենդանատերերին"], ["/for-business", "Բիզնեսին"], ["/learn", "Սովորել"]], join: "Միանալ մեզ", home: "BuddyLife գլխավոր էջ", nav: "Գլխավոր նավարկում", menu: "Բացել ընտրացանկը", close: "Փակել ընտրացանկը" },
  ru: { links: [["/features", "Возможности"], ["/pet-parents", "Владельцам"], ["/for-business", "Бизнесу"], ["/learn", "Материалы"]], join: "Присоединиться", home: "Главная BuddyLife", nav: "Основная навигация", menu: "Открыть меню", close: "Закрыть меню" },
  en: { links: [["/features", "Features"], ["/pet-parents", "Pet parents"], ["/for-business", "For business"], ["/learn", "Learn"]], join: "Join us", home: "BuddyLife home", nav: "Main navigation", menu: "Open menu", close: "Close menu" },
} as const;

export default function ArticleHeader({ lang, slug }: { lang: Lang; slug: string }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [languageOpen, setLanguageOpen] = useState(false);
  const t = copy[lang];

  useEffect(() => { localStorage.setItem("buddylife-lang", lang); document.documentElement.lang = lang; }, [lang]);
  useEffect(() => {
    if (!mobileOpen) return;
    const scrollY = window.scrollY;
    document.documentElement.classList.add("menuOpen");
    document.body.style.position = "fixed"; document.body.style.top = `-${scrollY}px`; document.body.style.width = "100%";
    return () => { document.documentElement.classList.remove("menuOpen"); document.body.style.position = ""; document.body.style.top = ""; document.body.style.width = ""; window.scrollTo(0, scrollY); };
  }, [mobileOpen]);

  const changeLanguage = (next: Lang) => { localStorage.setItem("buddylife-lang", next); window.location.href = `/learn/${slug}?lang=${next}`; };
  return <header className="nav shell articleNav">
    <Link className="brand" href={`/?lang=${lang}`} aria-label={t.home}><Image src="/buddylife-logo-clean.webp" alt="BuddyLife" width={132} height={132} priority /></Link>
    <nav className="navLinks" aria-label={t.nav}>{t.links.map(([href, label]) => <Link key={href} href={`${href}?lang=${lang}`} className={href === "/learn" ? "active" : ""} aria-current={href === "/learn" ? "page" : undefined}>{label}</Link>)}</nav>
    <div className="navRight">
      <div className="languageMenu">
        <button className="languageTrigger" aria-label="Change language" aria-expanded={languageOpen} onClick={() => setLanguageOpen(!languageOpen)}><span>{lang === "hy" ? "🇦🇲" : lang === "ru" ? "🇷🇺" : "🇬🇧"}</span><ChevronDown size={13} /></button>
        {languageOpen && <div className="languagePopover">{([ ["hy", "🇦🇲", "Հայերեն"], ["ru", "🇷🇺", "Русский"], ["en", "🇬🇧", "English"] ] as const).map(([code, flag, label]) => <button key={code} className={lang === code ? "active" : ""} onClick={() => changeLanguage(code)}><span>{flag}</span>{label}</button>)}</div>}
      </div>
      <Link className="button buttonSmall" href={`/?join=parent&lang=${lang}`}>{t.join}</Link>
      <button className="mobileMenuButton" aria-label={t.menu} aria-expanded={mobileOpen} onClick={() => setMobileOpen(true)}><Menu size={22} /></button>
    </div>
    {mobileOpen && <div className="mobileDrawer">
      <button className="drawerClose" aria-label={t.close} onClick={() => setMobileOpen(false)}><X /></button>
      <Image src="/buddylife-logo-clean.webp" alt="BuddyLife" width={120} height={120} />
      <nav aria-label={t.nav}>{t.links.map(([href, label]) => <Link key={href} href={`${href}?lang=${lang}`} className={href === "/learn" ? "active" : ""}>{label}</Link>)}</nav>
      <Link className="button" href={`/?join=parent&lang=${lang}`}>{t.join}</Link>
      <div className="drawerLanguages">{([ ["hy", "🇦🇲"], ["ru", "🇷🇺"], ["en", "🇬🇧"] ] as const).map(([code, flag]) => <button key={code} className={lang === code ? "active" : ""} onClick={() => changeLanguage(code)}>{flag} {code.toUpperCase()}</button>)}</div>
    </div>}
  </header>;
}
