import Image from "next/image";
import Link from "next/link";
import { headers } from "next/headers";
import { resolveLanguage } from "./language";
import { localePath } from "../lib/locale";

const copy = {
  hy: { eyebrow: "ԷՋԸ ՉԻ ԳՏՆՎԵԼ", title: "Այս էջը գոյություն չունի", body: "Հղումը կարող է հնացած լինել կամ սխալ մուտքագրված։ Վերադարձեք գլխավոր էջ կամ դիտեք ուղեցույցները։", home: "Գլխավոր էջ", learn: "Ուղեցույցներ" },
  ru: { eyebrow: "СТРАНИЦА НЕ НАЙДЕНА", title: "Такой страницы нет", body: "Ссылка могла устареть или содержать опечатку. Вернитесь на главную или посмотрите материалы.", home: "На главную", learn: "Материалы" },
  en: { eyebrow: "PAGE NOT FOUND", title: "This page does not exist", body: "The link may be out of date or mistyped. Go back to the home page or browse the guides.", home: "Home", learn: "Guides" },
  fa: { eyebrow: "صفحه پیدا نشد", title: "این صفحه وجود ندارد", body: "ممکن است پیوند قدیمی یا اشتباه باشد. به صفحه اصلی برگردید یا راهنماها را ببینید.", home: "صفحه اصلی", learn: "راهنماها" },
} as const;

export default async function NotFound() {
  const lang = resolveLanguage((await headers()).get("x-buddylife-lang") || undefined);
  const t = copy[lang];
  return (
    <main className="notFound" id="main-content" lang={lang} dir={lang === "fa" ? "rtl" : "ltr"}>
      <section className="notFoundCard">
        <Image src="/buddylife-logo-clean.webp" alt="BuddyLife" width={150} height={150} priority />
        <p className="eyebrow">{t.eyebrow}</p>
        <h1>{t.title}</h1>
        <p>{t.body}</p>
        <div className="notFoundActions">
          <Link className="button" href={localePath(lang, "/")}>{t.home}</Link>
          <Link className="button secondary" href={localePath(lang, "/learn")}>{t.learn}</Link>
        </div>
      </section>
    </main>
  );
}
