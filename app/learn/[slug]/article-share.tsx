"use client";

import { Link2, Send, Share2 } from "lucide-react";
import { useState } from "react";
import { track } from "@vercel/analytics";

export default function ArticleShare({ title, url }: { title: string; url: string }) {
  const [copied, setCopied] = useState(false);
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  async function share() {
    track("education_article_shared", { channel: "native", article: url });
    if (navigator.share) {
      await navigator.share({ title, url });
      return;
    }
    await copy();
  }

  async function copy() {
    track("education_article_shared", { channel: "copy_link", article: url });
    await navigator.clipboard.writeText(url);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <aside className="articleShare" aria-label="Կիսվել նյութով">
      <div>
        <Share2 aria-hidden="true" />
        <span><b>Կիսվել նյութով</b><small>Օգնեք այս ուղեցույցը հասնի այլ կենդանատերերի</small></span>
      </div>
      <nav>
        <a onClick={() => track("education_article_shared", { channel: "facebook", article: url })} href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`} target="_blank" rel="noopener noreferrer" aria-label="Կիսվել Facebook-ում"><span className="facebookMark" aria-hidden="true">f</span> Facebook</a>
        <a onClick={() => track("education_article_shared", { channel: "telegram", article: url })} href={`https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`} target="_blank" rel="noopener noreferrer" aria-label="Կիսվել Telegram-ում"><Send aria-hidden="true" /> Telegram</a>
        <button type="button" onClick={copy} aria-label="Պատճենել նյութի հղումը"><Link2 aria-hidden="true" /> {copied ? "Պատճենված է" : "Պատճենել հղումը"}</button>
        <button type="button" className="nativeShare" onClick={share}><Share2 aria-hidden="true" /> Կիսվել</button>
      </nav>
    </aside>
  );
}
