"use client";

import { useEffect } from "react";

export default function ArticleViewTracker({ slug, language }: { slug: string; language: string }) {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    let sessionId = "unavailable";
    try {
      sessionId = sessionStorage.getItem("buddylife_session") || crypto.randomUUID();
      sessionStorage.setItem("buddylife_session", sessionId);
    } catch {
      // sessionStorage can be unavailable in private browsing; the view still counts.
    }

    fetch("/api/track", {
      method: "POST",
      headers: { "content-type": "application/json" },
      keepalive: true,
      body: JSON.stringify({
        eventType: "view_content",
        page: window.location.pathname,
        language,
        audience: "parent",
        metadata: {
          sessionId,
          article: slug,
          source: params.get("utm_source") || "direct",
          medium: params.get("utm_medium") || "none",
          campaign: params.get("utm_campaign") || "none",
          content: params.get("utm_content") || "none",
        },
      }),
    }).catch(() => {});
  }, [language, slug]);

  return null;
}
