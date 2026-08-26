import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import ArticleShare from "./article-share";
import ArticleHeader from "./article-header";

type Lang = "hy" | "ru" | "en";
type Copy = { title: string; description: string; sections: readonly (readonly [string, string])[] };

const ui = {
  hy: { back: "Բոլոր ուղեցույցները", eyebrow: "BUDDYLIFE ԿՐԹԱԿԱՆ ՀԱԲ", disclaimer: "Այս նյութը ընդհանուր կրթական տեղեկատվություն է և չի փոխարինում անասնաբույժի անհատական խորհրդին, ախտորոշմանը կամ բուժմանը։" },
  ru: { back: "Все материалы", eyebrow: "ОБРАЗОВАТЕЛЬНЫЙ ХАБ BUDDYLIFE", disclaimer: "Этот материал носит общий образовательный характер и не заменяет индивидуальную консультацию, диагностику или лечение ветеринара." },
  en: { back: "All guides", eyebrow: "BUDDYLIFE EDUCATION HUB", disclaimer: "This material provides general educational information and does not replace individual veterinary advice, diagnosis, or treatment." },
} as const;

const articles = {
  "preventive-care": {
    image: "/learn-preventive-care.webp",
    hy: { title: "Կանխարգելիչ խնամք․ ինչ հիշել տարվա ընթացքում", description: "Պարզ ուղեցույց՝ կենդանու կանոնավոր զննման, անհատական պատվաստումների պլանի, ատամների և քաշի վերահսկման մասին։", sections: [
      ["Սկսեք անհատական պլանից", "Կենդանու տարիքը, կենսակերպը, առողջական պատմությունը և միջավայրը տարբեր են։ Անասնաբույժի հետ կազմված անհատական պլանը ավելի օգտակար է, քան բոլորի համար նույն ժամանակացույցը։"],
      ["Պահեք կարևոր տեղեկությունները", "Մի վայրում հավաքեք նախորդ այցերը, պատվաստումների տվյալները, հետազոտությունների պատասխանները, օգտագործվող դեղերը և նկատած փոփոխությունները։ Այս տեղեկությունը օգնում է հաջորդ այցը դարձնել ավելի հստակ։"],
      ["Հետևեք առօրյա փոփոխություններին", "Ախորժակի, ջրի օգտագործման, քաշի, էներգիայի, վարքի կամ արտաթորանքի փոփոխությունները կարող են կարևոր լինել։ Գրանցեք նկատածը և անհանգստության դեպքում կապվեք մասնագետի հետ։"],
    ] },
    ru: { title: "Профилактический уход: что важно помнить в течение года", description: "Простое руководство о регулярных осмотрах, индивидуальном плане вакцинации, здоровье зубов и контроле веса питомца.", sections: [
      ["Начните с индивидуального плана", "Возраст, образ жизни, история здоровья и условия содержания у каждого питомца разные. Индивидуальный план, составленный вместе с ветеринаром, полезнее единого расписания для всех."],
      ["Храните важную информацию", "Соберите в одном месте сведения о прошлых визитах, вакцинации, результатах обследований, принимаемых препаратах и замеченных изменениях. Так следующий приём будет более предметным."],
      ["Следите за ежедневными изменениями", "Изменения аппетита, потребления воды, веса, энергии, поведения или стула могут быть важны. Записывайте наблюдения и при беспокойстве обращайтесь к специалисту."],
    ] },
    en: { title: "Preventive care: what to remember throughout the year", description: "A simple guide to regular checkups, an individual vaccination plan, dental health, and weight monitoring.", sections: [
      ["Start with an individual plan", "Every pet has a different age, lifestyle, health history, and environment. A plan created with your veterinarian is more useful than a one-size-fits-all schedule."],
      ["Keep important information together", "Store past visit notes, vaccination records, test results, current medicines, and observed changes in one place. This helps make the next appointment more focused."],
      ["Watch for everyday changes", "Changes in appetite, water intake, weight, energy, behaviour, or stool can matter. Record what you notice and contact a professional if you are concerned."],
    ] },
  },
  "summer-safety": {
    image: "/learn-summer-safety.webp",
    hy: { title: "Շոգ եղանակին անվտանգ զբոսանքի պարզ կանոններ", description: "Ինչպես ընտրել զբոսանքի ժամը, պաշտպանել թաթերը և ճանաչել շոգահարության վտանգավոր նշանները։", sections: [
      ["Ընտրեք զով ժամերը", "Զբոսանքը պլանավորեք վաղ առավոտյան կամ երեկոյան, երբ օդն ու մայթը ավելի զով են։ Ստվերը, մաքուր ջուրը և հանգստի հնարավորությունը պետք է միշտ հասանելի լինեն։"],
      ["Ստուգեք մակերեսը", "Տաք ասֆալտը կարող է վնասել թաթերը։ Եթե մակերեսը չափազանց տաք է ձեր ձեռքի համար, ընտրեք խոտածածկ կամ ավելի զով երթուղի և կրճատեք զբոսանքը։"],
      ["Իմացեք վտանգավոր նշանները", "Ուժեղ կամ դժվարացած շնչառությունը, թուլությունը, շփոթվածությունը, փսխումը կամ ընկնելը շտապ օգնության ազդակներ են։ Կենդանուն տեղափոխեք զով վայր և անմիջապես կապվեք անասնաբույժի հետ։ Կենդանուն երբեք մի թողեք փակ մեքենայում։"],
    ] },
    ru: { title: "Простые правила безопасных прогулок в жару", description: "Как выбрать время прогулки, защитить лапы и распознать опасные признаки перегрева.", sections: [
      ["Выбирайте прохладные часы", "Планируйте прогулки ранним утром или вечером, когда воздух и тротуар прохладнее. У питомца всегда должны быть доступ к тени, свежей воде и возможность отдохнуть."],
      ["Проверяйте поверхность", "Горячий асфальт может повредить лапы. Если поверхность слишком горячая для вашей руки, выберите траву или более прохладный маршрут и сократите прогулку."],
      ["Знайте опасные признаки", "Сильная или затруднённая одышка, слабость, спутанность, рвота или потеря равновесия требуют срочной помощи. Перенесите питомца в прохладное место и немедленно свяжитесь с ветеринаром. Никогда не оставляйте животное в закрытой машине."],
    ] },
    en: { title: "Simple rules for safer walks in hot weather", description: "How to choose walking times, protect paws, and recognise dangerous signs of overheating.", sections: [
      ["Choose cooler hours", "Plan walks for early morning or evening, when the air and pavement are cooler. Shade, fresh water, and a chance to rest should always be available."],
      ["Check the surface", "Hot pavement can injure paws. If the surface is too hot for your hand, choose grass or a cooler route and shorten the walk."],
      ["Know the danger signs", "Heavy or difficult breathing, weakness, confusion, vomiting, or collapse need urgent attention. Move your pet to a cool place and contact a veterinarian immediately. Never leave a pet inside a closed car."],
    ] },
  },
  "indoor-cat-enrichment": {
    image: "/learn-cat-enrichment.webp",
    hy: { title: "Ինչպես տունը դարձնել հետաքրքիր և անվտանգ կատվի համար", description: "Պարզ գաղափարներ՝ խաղի, բարձր տարածքների, թաքստոցների և հանգիստ առօրյայի միջոցով կատվի բարեկեցությունն աջակցելու համար։", sections: [
      ["Ստեղծեք ընտրության հնարավորություն", "Կատուներին օգտակար են բարձր անվտանգ տեղերը, հանգիստ թաքստոցները և տարբեր սենյակներում տեղադրված ռեսուրսները։ Սա օգնում է վերահսկել միջավայրը և նվազեցնել լարվածությունը։"],
      ["Խաղացեք բնական վարքի նման", "Կարճ խաղերը, որոնք հիշեցնում են հետևել, թաքնվել և որսալ, կարող են ավելի հետաքրքիր լինել։ Խաղից հետո թողեք, որ կատուն հանգստանա, իսկ խաղալիքները պարբերաբար փոխեք։"],
      ["Պահպանեք կանխատեսելի ռիթմ", "Սննդի, խաղի և հանգստի մոտավոր կայուն ռեժիմը շատ կատուների օգնում է ավելի ապահով զգալ։ Վարքի հանկարծակի փոփոխության, ախորժակի կորստի կամ ցավի նշանների դեպքում դիմեք անասնաբույժի։"],
    ] },
    ru: { title: "Как сделать дом интересным и безопасным для кошки", description: "Простые идеи для благополучия кошки: игра, вертикальные пространства, укрытия и спокойный распорядок.", sections: [
      ["Предоставьте выбор", "Кошкам полезны безопасные высокие места, тихие укрытия и ресурсы, размещённые в разных комнатах. Это помогает контролировать среду и снижать напряжение."],
      ["Играйте с учётом естественного поведения", "Короткие игры, имитирующие выслеживание, прятки и охоту, могут быть интереснее. После игры дайте кошке отдохнуть и регулярно меняйте игрушки."],
      ["Поддерживайте предсказуемый ритм", "Примерно стабильный график кормления, игр и отдыха помогает многим кошкам чувствовать себя безопаснее. При резких изменениях поведения, потере аппетита или признаках боли обратитесь к ветеринару."],
    ] },
    en: { title: "How to make home engaging and safe for an indoor cat", description: "Simple ways to support a cat’s wellbeing through play, vertical space, hiding places, and a calm routine.", sections: [
      ["Offer meaningful choices", "Cats benefit from safe elevated places, quiet hiding spots, and resources placed in different rooms. This helps them control their environment and reduce tension."],
      ["Play in ways that reflect natural behaviour", "Short games that imitate stalking, hiding, and hunting can be more engaging. Let your cat rest afterwards and rotate toys regularly."],
      ["Keep a predictable rhythm", "A reasonably consistent routine for feeding, play, and rest helps many cats feel safer. Contact a veterinarian if you notice sudden behaviour changes, loss of appetite, or signs of pain."],
    ] },
  },
} as const;

type Slug = keyof typeof articles;
const validLang = (value: string | undefined): value is Lang => value === "hy" || value === "ru" || value === "en";

export function generateStaticParams() { return Object.keys(articles).map((slug) => ({ slug })); }

export async function generateMetadata({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ lang?: string }> }): Promise<Metadata> {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const record = articles[slug as Slug];
  if (!record) return {};
  const lang: Lang = validLang(query.lang) ? query.lang : "hy";
  const article: Copy = record[lang];
  const locale = lang === "hy" ? "hy_AM" : lang === "ru" ? "ru_RU" : "en_US";
  return { title: `${article.title} | BuddyLife Armenia`, description: article.description, alternates: { canonical: `/learn/${slug}?lang=${lang}`, languages: { hy: `/learn/${slug}?lang=hy`, ru: `/learn/${slug}?lang=ru`, en: `/learn/${slug}?lang=en` } }, openGraph: { title: article.title, description: article.description, type: "article", locale, url: `/learn/${slug}?lang=${lang}` }, twitter: { card: "summary_large_image", title: article.title, description: article.description } };
}

export default async function LearnArticle({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ lang?: string }> }) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const record = articles[slug as Slug];
  if (!record) notFound();
  const lang: Lang = validLang(query.lang) ? query.lang : "hy";
  const article: Copy = record[lang];
  const labels = ui[lang];
  const localizedUrl = `https://buddylife.am/learn/${slug}?lang=${lang}`;
  const schema = { "@context": "https://schema.org", "@type": "Article", headline: article.title, description: article.description, image: `https://buddylife.am${record.image}`, inLanguage: lang, author: { "@type": "Organization", name: "BuddyLife Armenia" }, publisher: { "@id": "https://buddylife.am/#organization" }, mainEntityOfPage: localizedUrl, datePublished: "2026-08-24", dateModified: "2026-08-26", isAccessibleForFree: true };
  return <><ArticleHeader lang={lang} slug={slug} /><main className="articlePage" id="main-content">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }} />
    <article className="articleShell">
      <Link className="articleBack" href={`/learn?lang=${lang}`}>← {labels.back}</Link>
      <p className="eyebrow">{labels.eyebrow}</p><h1>{article.title}</h1><p className="articleDeck">{article.description}</p>
      <Image className="articleHero" src={record.image} alt={article.title} width={1200} height={800} priority />
      <div className="articleBody">{article.sections.map(([heading, body]) => <section key={heading}><h2>{heading}</h2><p>{body}</p></section>)}<p className="articleDisclaimer">{labels.disclaimer}</p></div>
      <ArticleShare title={article.title} url={localizedUrl} lang={lang} />
    </article>
  </main></>;
}
