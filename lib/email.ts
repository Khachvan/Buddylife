// Registration confirmation email, sent through Resend's REST API when RESEND_API_KEY and
// RESEND_FROM are configured. Without them the function is a no-op, so local development and
// Preview never send mail.
import { logEvent } from "./logging";
import { localeUrl } from "./locale";

export type EmailLanguage = "hy" | "ru" | "en" | "fa";
export type EmailRole = "parent" | "business";

const SITE = "https://buddylife.am";

// Three guides every new pet parent in Yerevan needs first; slugs are stable repository/static posts.
const CHECKLIST_GUIDES = [
  "microchip-register-pet-yerevan",
  "first-week-pet-information-starter-kit",
  "what-to-do-when-pet-goes-missing",
] as const;

const copy: Record<EmailLanguage, {
  subject: Record<EmailRole, string>;
  greeting: string;
  intro: Record<EmailRole, string>;
  checklistTitle: string;
  checklist: string[];
  guidesTitle: string;
  guides: Record<(typeof CHECKLIST_GUIDES)[number], string>;
  next: string;
  reply: string;
  signature: string;
}> = {
  hy: {
    subject: { parent: "BuddyLife․ դուք վաղ համայնքում եք — ահա ձեր ստուգաթերթը", business: "BuddyLife․ շնորհակալություն, որ միացաք որպես գործընկեր" },
    greeting: "Բարև",
    intro: {
      parent: "Շնորհակալություն, որ միացաք BuddyLife-ի վաղ հասանելիությանը։ Խոստացվածը՝ Երևանի կենդանատիրոջ ստուգաթերթը, ստորև է։",
      business: "Շնորհակալություն, որ գրանցեցիք ձեր բիզնեսը։ Մեր թիմը կապ կհաստատի ձեզ հետ գործընկերության մանրամասների համար։ Մինչ այդ՝ մի քանի օգտակար ուղեցույց ձեր հաճախորդների համար։",
    },
    checklistTitle: "Երևանի կենդանատիրոջ ստուգաթերթ",
    checklist: [
      "Չիպավորում անասնաբույժի մոտ և հաշվառում ձեր վարչական շրջանում",
      "Պատվաստումների օրացույց և հաջորդ այցի ամսաթիվը",
      "Կենդանու երկու հստակ լուսանկար՝ դեմքը և ամբողջ մարմինը",
      "Անասնաբույժի, հարևանի և ընտանիքի անդամի հեռախոսները՝ մեկ տեղում",
      "Խնամքի կարճ թերթիկ՝ սնունդ, դեղեր, սովորություններ",
    ],
    guidesTitle: "Կարդացեք հիմա",
    guides: {
      "microchip-register-pet-yerevan": "Որտե՞ղ չիպավորել և հաշվառել շանը կամ կատվին Երևանում",
      "first-week-pet-information-starter-kit": "Ինչ տեղեկություններ հավաքել կենդանու առաջին շաբաթում",
      "what-to-do-when-pet-goes-missing": "Ի՞նչ անել առաջին հերթին, եթե կենդանին կորել է",
    },
    next: "Ինչ կլինի հետո․ շաբաթական մեկ նոր ուղեցույց և առաջին հրավերը, երբ BuddyLife-ը բացվի Երևանում։ Ոչ մի գովազդ։",
    reply: "Հրաժարվելու համար պարզապես պատասխանեք այս նամակին «Հանել» բառով։",
    signature: "BuddyLife Armenia",
  },
  ru: {
    subject: { parent: "BuddyLife: вы в раннем сообществе — вот ваш чек-лист", business: "BuddyLife: спасибо, что присоединились как партнёр" },
    greeting: "Здравствуйте",
    intro: {
      parent: "Спасибо, что присоединились к раннему доступу BuddyLife. Обещанный чек-лист владельца питомца в Ереване — ниже.",
      business: "Спасибо за регистрацию вашего бизнеса. Наша команда свяжется с вами по деталям партнёрства. А пока — несколько полезных гидов для ваших клиентов.",
    },
    checklistTitle: "Чек-лист владельца питомца в Ереване",
    checklist: [
      "Чипирование у ветеринара и регистрация в вашем административном районе",
      "Календарь прививок и дата следующего визита",
      "Две чёткие фотографии питомца: морда и всё тело",
      "Телефоны ветеринара, соседа и члена семьи — в одном месте",
      "Короткая карточка ухода: корм, лекарства, привычки",
    ],
    guidesTitle: "Прочитайте сейчас",
    guides: {
      "microchip-register-pet-yerevan": "Где чипировать и зарегистрировать собаку или кошку в Ереване",
      "first-week-pet-information-starter-kit": "Какие данные о питомце собрать в первую неделю",
      "what-to-do-when-pet-goes-missing": "Что делать в первую очередь, если питомец пропал",
    },
    next: "Что дальше: один новый гид в неделю и первое приглашение, когда BuddyLife откроется в Ереване. Без рекламы.",
    reply: "Чтобы отписаться, просто ответьте на это письмо словом «Удалить».",
    signature: "BuddyLife Armenia",
  },
  en: {
    subject: { parent: "BuddyLife: you're in — here is your Yerevan pet-owner checklist", business: "BuddyLife: thank you for joining as a partner" },
    greeting: "Hello",
    intro: {
      parent: "Thank you for joining BuddyLife early access. The Yerevan pet-owner checklist we promised is below.",
      business: "Thank you for registering your business. Our team will contact you about partnership details. Meanwhile, a few useful guides for your customers.",
    },
    checklistTitle: "Yerevan pet-owner checklist",
    checklist: [
      "Microchip at the vet and registration with your administrative district",
      "Vaccination calendar and the date of the next visit",
      "Two clear photos of your pet: face and full body",
      "Vet, neighbour and family phone numbers in one place",
      "A short care sheet: food, medication, habits",
    ],
    guidesTitle: "Read now",
    guides: {
      "microchip-register-pet-yerevan": "Where to microchip and register a dog or cat in Yerevan",
      "first-week-pet-information-starter-kit": "Pet information to collect in the first week",
      "what-to-do-when-pet-goes-missing": "What to do first when a pet goes missing",
    },
    next: "What happens next: one new guide a week and the first invitation when BuddyLife opens in Yerevan. No ads.",
    reply: "To unsubscribe, simply reply to this email with the word \"Remove\".",
    signature: "BuddyLife Armenia",
  },
  fa: {
    subject: { parent: "BuddyLife: شما عضو جامعه اولیه هستید — این هم چک‌لیست شما", business: "BuddyLife: از پیوستن شما به‌عنوان شریک سپاسگزاریم" },
    greeting: "سلام",
    intro: {
      parent: "از اینکه به دسترسی زودهنگام BuddyLife پیوستید سپاسگزاریم. چک‌لیست سرپرست حیوان خانگی در ایروان که قول داده بودیم، در ادامه است.",
      business: "از ثبت‌نام کسب‌وکار شما سپاسگزاریم. تیم ما برای جزئیات همکاری با شما تماس خواهد گرفت. در این میان، چند راهنمای مفید برای مشتریان شما.",
    },
    checklistTitle: "چک‌لیست سرپرست حیوان خانگی در ایروان",
    checklist: [
      "ریزتراشه نزد دامپزشک و ثبت در منطقه اداری شما",
      "تقویم واکسیناسیون و تاریخ مراجعه بعدی",
      "دو عکس واضح از حیوان: صورت و تمام بدن",
      "شماره‌های دامپزشک، همسایه و یکی از اعضای خانواده در یک جا",
      "یک برگه کوتاه مراقبت: غذا، داروها، عادت‌ها",
    ],
    guidesTitle: "همین حالا بخوانید",
    guides: {
      "microchip-register-pet-yerevan": "کجا سگ یا گربه را در ایروان ریزتراشه و ثبت کنیم",
      "first-week-pet-information-starter-kit": "اطلاعات مهم حیوان که باید در هفته اول ثبت کنید",
      "what-to-do-when-pet-goes-missing": "اگر حیوان خانگی گم شد، ابتدا چه کار کنیم",
    },
    next: "در ادامه: هر هفته یک راهنمای تازه و نخستین دعوت‌نامه هنگام آغاز BuddyLife در ایروان. بدون تبلیغات.",
    reply: "برای لغو عضویت کافی است به این ایمیل با کلمه «حذف» پاسخ دهید.",
    signature: "BuddyLife Armenia",
  },
};

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char] as string);
}

export function isEmailLanguage(value: unknown): value is EmailLanguage {
  return value === "hy" || value === "ru" || value === "en" || value === "fa";
}

export function registrationEmail({ language, role, name }: { language: EmailLanguage; role: EmailRole; name: string }) {
  const c = copy[language];
  const dir = language === "fa" ? "rtl" : "ltr";
  const greeting = name ? `${c.greeting}, ${name}!` : `${c.greeting}!`;
  const guides = CHECKLIST_GUIDES.map((slug) => ({ title: c.guides[slug], url: localeUrl(language, `/learn/${slug}`) }));
  const text = [
    greeting,
    "",
    c.intro[role],
    "",
    `${c.checklistTitle}:`,
    ...c.checklist.map((item) => `- ${item}`),
    "",
    `${c.guidesTitle}:`,
    ...guides.map((guide) => `- ${guide.title}: ${guide.url}`),
    "",
    c.next,
    "",
    c.reply,
    "",
    `${c.signature} · ${SITE}`,
  ].join("\n");
  const html = `<!doctype html><html lang="${language}" dir="${dir}"><body style="margin:0;padding:24px;background:#f7f4fb;font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif;color:#2d163f">
<div style="max-width:560px;margin:0 auto;background:#fff;border-radius:18px;padding:28px;border:1px solid #e9e1f2">
<p style="margin:0 0 6px;font-size:12px;letter-spacing:.08em;color:#6f42c1;font-weight:800">BUDDYLIFE ARMENIA</p>
<h1 style="margin:0 0 14px;font-size:22px">${escapeHtml(greeting)}</h1>
<p style="margin:0 0 18px;line-height:1.55">${escapeHtml(c.intro[role])}</p>
<h2 style="margin:0 0 8px;font-size:16px">${escapeHtml(c.checklistTitle)}</h2>
<ul style="margin:0 0 18px;padding-${dir === "rtl" ? "right" : "left"}:20px;line-height:1.6">${c.checklist.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
<h2 style="margin:0 0 8px;font-size:16px">${escapeHtml(c.guidesTitle)}</h2>
<ul style="margin:0 0 18px;padding-${dir === "rtl" ? "right" : "left"}:20px;line-height:1.6">${guides.map((guide) => `<li><a href="${guide.url}" style="color:#6f42c1;font-weight:700">${escapeHtml(guide.title)}</a></li>`).join("")}</ul>
<p style="margin:0 0 14px;line-height:1.55">${escapeHtml(c.next)}</p>
<p style="margin:0 0 18px;font-size:13px;color:#6f6678;line-height:1.5">${escapeHtml(c.reply)}</p>
<p style="margin:0;font-size:13px;color:#6f6678">${escapeHtml(c.signature)} · <a href="${SITE}" style="color:#6f42c1">buddylife.am</a></p>
</div></body></html>`;
  return { subject: c.subject[role], text, html };
}

export function emailConfigured() {
  return Boolean(process.env.RESEND_API_KEY && process.env.RESEND_FROM);
}

type SendResult = { sent: true } | { sent: false; reason: "not_configured" | "rejected" | "failed" };

/** Sends through Resend and never throws: a mail failure must not fail the request that triggered it. */
async function sendEmail(route: string, label: string, payload: { to: string; subject: string; text: string; html: string; replyTo?: string }): Promise<SendResult> {
  if (!emailConfigured()) return { sent: false, reason: "not_configured" };
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { authorization: `Bearer ${process.env.RESEND_API_KEY}`, "content-type": "application/json" },
      body: JSON.stringify({ from: process.env.RESEND_FROM, to: [payload.to], subject: payload.subject, text: payload.text, html: payload.html, reply_to: payload.replyTo || process.env.RESEND_REPLY_TO || undefined }),
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) {
      logEvent("error", route, `${label} rejected`, { status: response.status });
      return { sent: false, reason: "rejected" };
    }
    return { sent: true };
  } catch (error) {
    logEvent("error", route, `${label} failed`, { error: error instanceof Error ? error.message : "Unknown error" });
    return { sent: false, reason: "failed" };
  }
}

export function sendRegistrationEmail(input: { to: string; language: EmailLanguage; role: EmailRole; name: string }) {
  const message = registrationEmail(input);
  return sendEmail("/api/register", "Confirmation email", { to: input.to, ...message });
}

/** Forwards a "Write to us" message to the owner (CONTACT_NOTIFY_TO) with the sender as reply-to. */
export function sendContactNotification(input: { id: string; name: string; email: string; phone: string | null; business: string | null; message: string; language: string; page: string | null }) {
  const to = process.env.CONTACT_NOTIFY_TO?.trim();
  if (!to) return Promise.resolve<SendResult>({ sent: false, reason: "not_configured" });
  const subject = `BuddyLife message from ${input.name}${input.business ? ` (${input.business})` : ""}`;
  const lines = [
    `From: ${input.name} <${input.email}>`,
    input.phone ? `Phone: ${input.phone}` : null,
    input.business ? `Business: ${input.business}` : null,
    `Language: ${input.language}${input.page ? ` · Page: ${input.page}` : ""}`,
    "",
    input.message,
    "",
    `Reply to this email to answer. Backoffice → Messages (${input.id}).`,
  ].filter((line): line is string => line !== null);
  const text = lines.join("\n");
  const html = `<pre style="font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif;white-space:pre-wrap;font-size:15px;line-height:1.5;color:#2d163f">${escapeHtml(text)}</pre>`;
  return sendEmail("/api/contact", "Contact notification", { to, subject, text, html, replyTo: input.email });
}
