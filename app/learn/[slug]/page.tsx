import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import ArticleShare from "./article-share";
import ArticleHeader from "./article-header";

const articles = {
  "preventive-care": {
    title: "Կանխարգելիչ խնամք․ ինչ հիշել տարվա ընթացքում",
    description:
      "Պարզ ուղեցույց՝ կենդանու կանոնավոր զննման, անհատական պատվաստումների պլանի, ատամների և քաշի վերահսկման մասին։",
    image: "/learn-preventive-care.webp",
    sections: [
      ["Սկսեք անհատական պլանից", "Կենդանու տարիքը, կենսակերպը, առողջական պատմությունը և միջավայրը տարբեր են։ Անասնաբույժի հետ կազմված անհատական պլանը ավելի օգտակար է, քան բոլորի համար նույն ժամանակացույցը։"],
      ["Պահեք կարևոր տեղեկությունները", "Մի վայրում հավաքեք նախորդ այցերը, պատվաստումների տվյալները, հետազոտությունների պատասխանները, օգտագործվող դեղերը և նկատած փոփոխությունները։ Այս տեղեկությունը օգնում է հաջորդ այցը դարձնել ավելի հստակ։"],
      ["Հետևեք առօրյա փոփոխություններին", "Ախորժակի, ջրի օգտագործման, քաշի, էներգիայի, վարքի կամ արտաթորանքի փոփոխությունները կարող են կարևոր լինել։ Գրանցեք նկատածը և անհանգստության դեպքում կապվեք մասնագետի հետ։"],
    ],
  },
  "summer-safety": {
    title: "Շոգ եղանակին անվտանգ զբոսանքի պարզ կանոններ",
    description:
      "Ինչպես ընտրել զբոսանքի ժամը, պաշտպանել թաթերը և ճանաչել շոգահարության վտանգավոր նշանները։",
    image: "/learn-summer-safety.webp",
    sections: [
      ["Ընտրեք զով ժամերը", "Զբոսանքը պլանավորեք վաղ առավոտյան կամ երեկոյան, երբ օդն ու մայթը ավելի զով են։ Ստվերը, մաքուր ջուրը և հանգստի հնարավորությունը պետք է միշտ հասանելի լինեն։"],
      ["Ստուգեք մակերեսը", "Տաք ասֆալտը կարող է վնասել թաթերը։ Եթե մակերեսը չափազանց տաք է ձեր ձեռքի համար, ընտրեք խոտածածկ կամ ավելի զով երթուղի և կրճատեք զբոսանքը։"],
      ["Իմացեք վտանգավոր նշանները", "Ուժեղ կամ դժվարացած շնչառությունը, թուլությունը, շփոթվածությունը, փսխումը կամ ընկնելը շտապ օգնության ազդակներ են։ Կենդանուն տեղափոխեք զով վայր և անմիջապես կապվեք անասնաբույժի հետ։ Կենդանուն երբեք մի թողեք փակ մեքենայում։"],
    ],
  },
  "indoor-cat-enrichment": {
    title: "Ինչպես տունը դարձնել հետաքրքիր և անվտանգ կատվի համար",
    description:
      "Պարզ գաղափարներ՝ խաղի, բարձր տարածքների, թաքստոցների և հանգիստ առօրյայի միջոցով կատվի բարեկեցությունն աջակցելու համար։",
    image: "/learn-cat-enrichment.webp",
    sections: [
      ["Ստեղծեք ընտրության հնարավորություն", "Կատուներին օգտակար են բարձր անվտանգ տեղերը, հանգիստ թաքստոցները և տարբեր սենյակներում տեղադրված ռեսուրսները։ Սա օգնում է վերահսկել միջավայրը և նվազեցնել լարվածությունը։"],
      ["Խաղացեք բնական վարքի նման", "Կարճ խաղերը, որոնք հիշեցնում են հետևել, թաքնվել և որսալ, կարող են ավելի հետաքրքիր լինել։ Խաղից հետո թողեք, որ կատուն հանգստանա, իսկ խաղալիքները պարբերաբար փոխեք։"],
      ["Պահպանեք կանխատեսելի ռիթմ", "Սննդի, խաղի և հանգստի մոտավոր կայուն ռեժիմը շատ կատուների օգնում է ավելի ապահով զգալ։ Վարքի հանկարծակի փոփոխության, ախորժակի կորստի կամ ցավի նշանների դեպքում դիմեք անասնաբույժի։"],
    ],
  },
} as const;

type Slug = keyof typeof articles;

export function generateStaticParams() {
  return Object.keys(articles).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const article = articles[slug as Slug];
  if (!article) return {};
  return {
    title: `${article.title} | BuddyLife Armenia`,
    description: article.description,
    alternates: { canonical: `/learn/${slug}` },
    keywords: ["կենդանիների խնամք", "կենդանիների խորհուրդներ", "BuddyLife Armenia", article.title],
    openGraph: { title: article.title, description: article.description, type: "article", locale: "hy_AM", url: `/learn/${slug}` },
    twitter: { card: "summary_large_image", title: article.title, description: article.description },
  };
}

export default async function LearnArticle({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = articles[slug as Slug];
  if (!article) notFound();
  const schema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.description,
    image: `https://buddylife.am${article.image}`,
    inLanguage: "hy",
    author: { "@type": "Organization", name: "BuddyLife Armenia" },
    publisher: { "@id": "https://buddylife.am/#organization" },
    mainEntityOfPage: `https://buddylife.am/learn/${slug}`,
    datePublished: "2026-08-24",
    dateModified: "2026-08-24",
    isAccessibleForFree: true,
    keywords: "կենդանիների խնամք, կենդանիների խորհուրդներ, BuddyLife Armenia",
  };
  return (
    <>
      <ArticleHeader />
      <main className="articlePage" id="main-content">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }} />
        <article className="articleShell">
          <Link className="articleBack" href="/learn">← Բոլոր ուղեցույցները</Link>
          <p className="eyebrow">BUDDYLIFE ԿՐԹԱԿԱՆ ՀԱԲ</p>
          <h1>{article.title}</h1>
          <p className="articleDeck">{article.description}</p>
          <Image className="articleHero" src={article.image} alt={article.title} width={1200} height={800} priority />
          <div className="articleBody">
            {article.sections.map(([heading, body]) => (
              <section key={heading}>
                <h2>{heading}</h2>
                <p>{body}</p>
              </section>
            ))}
            <p className="articleDisclaimer">Այս նյութը ընդհանուր կրթական տեղեկատվություն է և չի փոխարինում անասնաբույժի անհատական խորհրդին, ախտորոշմանը կամ բուժմանը։</p>
          </div>
          <ArticleShare title={article.title} url={`https://buddylife.am/learn/${slug}`} />
        </article>
      </main>
    </>
  );
}
