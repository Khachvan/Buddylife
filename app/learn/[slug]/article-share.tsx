"use client";

import { Link2, Share2 } from "lucide-react";
import { useState } from "react";
import { track } from "@vercel/analytics";

type Lang = "hy" | "ru" | "en";
const labels = {
  hy: { title: "Կիսվել նյութով", help: "Օգնեք այս ուղեցույցը հասնի այլ կենդանատերերի", opened: "Կիսման պատուհանը բացվել է։", failed: "Չհաջողվեց բացել կիսման պատուհանը։ Փորձեք պատճենել հղումը։", copied: "Հղումը պատճենված է։", copyFailed: "Չհաջողվեց պատճենել հղումը։", facebook: "Facebook-ը բացվել է․ ավարտեք հրապարակումը այնտեղ։", telegram: "Telegram-ի կիսման պատուհանը բացվել է։", copy: "Պատճենել հղումը", copiedButton: "Պատճենված է", share: "Կիսվել" },
  ru: { title: "Поделиться материалом", help: "Помогите другим владельцам питомцев увидеть этот материал", opened: "Окно публикации открыто.", failed: "Не удалось открыть окно публикации. Попробуйте скопировать ссылку.", copied: "Ссылка скопирована.", copyFailed: "Не удалось скопировать ссылку.", facebook: "Facebook открыт — завершите публикацию там.", telegram: "Окно публикации Telegram открыто.", copy: "Копировать ссылку", copiedButton: "Скопировано", share: "Поделиться" },
  en: { title: "Share this guide", help: "Help this guide reach other pet parents", opened: "The sharing window is open.", failed: "Could not open the sharing window. Try copying the link.", copied: "Link copied.", copyFailed: "Could not copy the link.", facebook: "Facebook is open—finish publishing there.", telegram: "The Telegram sharing window is open.", copy: "Copy link", copiedButton: "Copied", share: "Share" },
} as const;

export default function ArticleShare({ title, url, lang }: { title: string; url: string; lang: Lang }) {
  const [copied, setCopied] = useState(false);
  const [status, setStatus] = useState("");
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const t = labels[lang];
  async function share() {
    track("education_article_shared", { channel: "native", article: url });
    try {
      if (navigator.share) {
        await navigator.share({ title, url });
        setStatus(t.opened);
        return;
      }
      await copy();
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      setStatus(t.failed);
    }
  }

  async function copy() {
    track("education_article_shared", { channel: "copy_link", article: url });
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setStatus(t.copied);
      window.setTimeout(() => { setCopied(false); setStatus(""); }, 1800);
    } catch {
      setStatus(t.copyFailed);
    }
  }

  return (
    <aside className="articleShare" aria-label={t.title}>
      <div>
        <Share2 aria-hidden="true" />
        <span><b>{t.title}</b><small>{t.help}</small></span>
      </div>
      <nav>
        <a className="shareLogoButton facebookShareButton" href={`https://www.facebook.com/sharer/sharer.php?display=popup&u=${encodedUrl}`} target="_blank" rel="noopener noreferrer" onClick={() => { track("education_article_shared", { channel: "facebook", article: url }); setStatus(t.facebook); }} aria-label={`${t.share} Facebook`} title="Facebook">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.099 4.388 23.094 10.125 24v-8.438H7.078v-3.489h3.047V9.413c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.974h-1.513c-1.49 0-1.956.931-1.956 1.887v2.26h3.328l-.532 3.489h-2.796V24C19.612 23.094 24 18.099 24 12.073Z" /></svg>
        </a>
        <a className="shareLogoButton telegramShareButton" href={`https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`} target="_blank" rel="noopener noreferrer" onClick={() => { track("education_article_shared", { channel: "telegram", article: url }); setStatus(t.telegram); }} aria-label={`${t.share} Telegram`} title="Telegram">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M23.91 3.79 20.3 20.81c-.27 1.2-.98 1.49-1.99.93l-5.5-4.05-2.65 2.55c-.29.29-.54.54-1.11.54l.4-5.6 10.19-9.21c.44-.39-.1-.61-.69-.22L6.36 13.67.94 11.98c-1.18-.37-1.2-1.18.25-1.74L22.4 2.07c.98-.36 1.84.24 1.51 1.72Z" /></svg>
        </a>
        <button type="button" onClick={copy} aria-label={t.copy}><Link2 aria-hidden="true" /> {copied ? t.copiedButton : t.copy}</button>
        <button type="button" className="nativeShare" onClick={share}><Share2 aria-hidden="true" /> {t.share}</button>
      </nav>
      <p className="shareStatus" aria-live="polite">{status}</p>
    </aside>
  );
}
