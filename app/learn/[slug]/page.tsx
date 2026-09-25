import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import ArticleShare from "./article-share";
import ArticleHeader from "./article-header";
import ArticleViewTracker from "./article-view-tracker";
import { localeAlternates, localePath, localeUrl } from "../../../lib/locale";
import { articlePublished } from "../../../lib/content-dates";
import { renderBody } from "../../../lib/posts";
import { loadPublishedPost } from "../../../lib/posts-store";
import { persianArticles, persianLearnUi } from "../../persian-copy";

type Lang = "hy" | "ru" | "en" | "fa";
type Copy = { title: string; description: string; sections: readonly (readonly [string, string])[] };

const ui = {
  hy: { back: "Բոլոր ուղեցույցները", eyebrow: "BUDDYLIFE ԿՐԹԱԿԱՆ ՀԱԲ", disclaimer: "Այս նյութը ընդհանուր կրթական տեղեկատվություն է և չի փոխարինում անասնաբույժի անհատական խորհրդին, ախտորոշմանը կամ բուժմանը։", ctaEyebrow: "BUDDYLIFE ՎԱՂ ՀԱՍԱՆԵԼԻՈՒԹՅՈՒՆ", ctaTitle: "Պատրա՞ստ ես կազմակերպել կենդանուդ խնամքը", ctaBody: "Միացի՛ր BuddyLife-ի վաղ հասանելիությանը և օգնիր մեզ ստեղծել Հայաստանի կենդանատերերի համար օգտակար հարթակ։", cta: "Միանալ վաղ հասանելիությանը" },
  ru: { back: "Все материалы", eyebrow: "ОБРАЗОВАТЕЛЬНЫЙ ХАБ BUDDYLIFE", disclaimer: "Этот материал носит общий образовательный характер и не заменяет индивидуальную консультацию, диагностику или лечение ветеринара.", ctaEyebrow: "РАННИЙ ДОСТУП BUDDYLIFE", ctaTitle: "Готовы организовать заботу о питомце?", ctaBody: "Присоединяйтесь к раннему доступу BuddyLife и помогите нам создать полезную платформу для владельцев питомцев в Армении.", cta: "Присоединиться к раннему доступу" },
  en: { back: "All guides", eyebrow: "BUDDYLIFE EDUCATION HUB", disclaimer: "This material provides general educational information and does not replace individual veterinary advice, diagnosis, or treatment.", ctaEyebrow: "BUDDYLIFE EARLY ACCESS", ctaTitle: "Ready to organize your pet’s care?", ctaBody: "Join BuddyLife early access and help us build a useful platform for pet parents in Armenia.", cta: "Join early access" },
  fa: persianLearnUi,
} as const;

const articleBase = {
  "preventive-care": {
    image: "/learn-preventive-care-editorial-v5.jpg",
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
    image: "/learn-summer-safety-editorial-v5.jpg",
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
    image: "/learn-indoor-cat-enrichment-editorial-v5.jpg",
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
  "everyday-pet-parent-problems": {
    image: "/learn-everyday-pet-parent-problems-editorial-v5.jpg",
    hy: { title: "5 առօրյա խնդիր, որոնց բախվում են կենդանատերերը Հայաստանում", description: "Պարզ կազմակերպման ուղեցույց՝ փաստաթղթերը, խնամքի ամսաթվերը, վստահելի կոնտակտները և ընտանիքի պարտականությունները մեկ հստակ համակարգում պահելու համար։", sections: [
      ["1․ Կարևոր տեղեկությունները ցրված են", "Պատվաստումների գրքույկը մի տեղ է, բժշկի համարը՝ հաղորդագրությունների մեջ, իսկ սննդի կամ խնամքի նշումները՝ ուրիշ տեղ։ Սկսեք մեկ հիմնական թղթապանակից կամ թվային գրառումից՝ կենդանու անունով, որտեղ կպահեք միայն ամենաանհրաժեշտ տեղեկությունները։"],
      ["2․ Խնամքի ամսաթվերը հեշտ է մոռանալ", "Գրանցեք մոտակա այցերը, խնամքի գործողությունները և անհրաժեշտ գնումները մեկ օրացույցում։ Յուրաքանչյուր գրառման մեջ նշեք՝ ինչ պետք է անել, երբ և ով է պատասխանատու։ Այս պարզ ձևաչափը նվազեցնում է վերջին պահին հիշելու վտանգը։"],
      ["3․ Արտակարգ պահին կոնտակտները չեն գտնվում", "Պահեք ձեր սովորական անասնաբույժի, մոտակա շուրջօրյա կլինիկայի և ընտանիքի այն անդամի կոնտակտները, ով կարող է օգնել։ Համոզվեք, որ տեղեկությունը հասանելի է նաև այն մարդուն, ով երբեմն խնամում է կենդանուն։"],
      ["4․ Ընտանիքում պարտականությունները հստակ չեն", "Սնունդը, զբոսանքը, մաքրությունը կամ անհրաժեշտ գնումները բաժանեք մարդկանց միջև։ Կարճ շաբաթական ցանկը օգնում է տեսնել՝ ինչն է արդեն արված և ինչն է դեռ սպասում։"],
      ["5․ Նույն տեղեկությունը ամեն անգամ նորից է հավաքվում", "Ստեղծեք կենդանու կարճ պրոֆիլ՝ անուն, տարիք, լուսանկար, հիմնական կոնտակտներ, սովորություններ և առօրյա խնամքի նշումներ։ Թարմացրեք այն միայն փոփոխության դեպքում և կիսվեք վստահելի խնամողի հետ՝ անհրաժեշտության ժամանակ։"],
      ["Սկսեք փոքր քայլից", "Այսօր ընտրեք միայն մեկ տեղ՝ կենդանու կարևոր տեղեկությունների համար, ավելացրեք երեք հիմնական կոնտակտ և գրանցեք հաջորդ կարևոր ամսաթիվը։ Հստակ համակարգը ստեղծվում է փոքր, կրկնվող քայլերով։"],
    ] },
    ru: { title: "5 повседневных проблем владельцев питомцев в Армении", description: "Практическое руководство по организации документов, важных дат, надёжных контактов и семейных обязанностей в одной понятной системе.", sections: [
      ["1. Важная информация хранится в разных местах", "Ветеринарный паспорт лежит в одном месте, номер врача — в переписке, а заметки об уходе — где-то ещё. Создайте одну основную папку или цифровую запись с именем питомца и храните там только самое необходимое."],
      ["2. Важные даты легко забыть", "Добавьте предстоящие визиты, задачи по уходу и нужные покупки в один календарь. Для каждой записи укажите, что нужно сделать, когда и кто отвечает. Такой простой формат уменьшает риск вспомнить всё в последний момент."],
      ["3. В нужный момент не удаётся найти контакты", "Сохраните контакты вашего ветеринара, ближайшей круглосуточной клиники и члена семьи, который может помочь. Убедитесь, что информация доступна и тому, кто иногда присматривает за питомцем."],
      ["4. Семейные обязанности не распределены", "Распределите кормление, прогулки, уборку и покупки между членами семьи. Короткий недельный список помогает видеть, что уже сделано и что ещё осталось."],
      ["5. Одни и те же сведения приходится собирать заново", "Создайте короткий профиль питомца: имя, возраст, фото, основные контакты, привычки и повседневные заметки по уходу. Обновляйте его только при изменениях и при необходимости делитесь с доверенным человеком."],
      ["Начните с малого", "Сегодня выберите одно место для важных сведений о питомце, добавьте три главных контакта и запишите ближайшую важную дату. Понятная система создаётся небольшими повторяемыми шагами."],
    ] },
    en: { title: "5 everyday problems pet parents face in Armenia", description: "A practical guide to keeping records, important dates, trusted contacts, and family responsibilities in one clear system.", sections: [
      ["1. Important information is scattered", "The vaccination booklet is in one place, the veterinarian’s number is buried in messages, and care notes are somewhere else. Create one main folder or digital record named after your pet and keep only the essentials there."],
      ["2. Care dates are easy to forget", "Put upcoming visits, care tasks, and necessary purchases in one calendar. For every entry, note what needs to happen, when, and who is responsible. This simple format reduces last-minute surprises."],
      ["3. Trusted contacts are hard to find when needed", "Save the details of your regular veterinarian, a nearby 24-hour clinic, and a family member who can help. Make sure the information is also available to anyone who occasionally cares for your pet."],
      ["4. Family responsibilities are unclear", "Assign feeding, walks, cleaning, and necessary purchases to specific people. A short weekly checklist makes it easy to see what is complete and what still needs attention."],
      ["5. The same information gets collected again and again", "Create a short pet profile with a name, age, photo, key contacts, habits, and everyday care notes. Update it only when something changes and share it with a trusted carer when needed."],
      ["Start with one small step", "Today, choose one place for your pet’s important information, add three key contacts, and record the next important date. A clear system grows through small, repeatable steps."],
    ] },
  },
  "organize-pet-information-and-care-dates": {
    image: "/learn-organize-pet-information-and-care-dates-editorial-v5.jpg",
    hy: { title: "Ինչպես մեկ տեղում կազմակերպել կենդանուդ կարևոր տեղեկություններն ու խնամքի ամսաթվերը", description: "Պարզ համակարգ՝ կենդանուդ տվյալները, վստահելի կոնտակտները և կարևոր ամսաթվերը մեկ հասանելի վայրում պահելու համար։", sections: [
      ["1․ Ստեղծի՛ր կենդանուդ կարճ տեղեկաթերթը", "Գրանցի՛ր կենդանու անունը, տեսակը, ծննդյան ամսաթիվը կամ մոտավոր տարիքը, առօրյա խնամքի համար կարևոր նշումները, հիմնական կլինիկայի կոնտակտը և այն մարդու համարը, ով կարող է օգնել քո բացակայության ժամանակ։ Պահի՛ր միայն անհրաժեշտ տեղեկությունները և մի՛ տեղադրիր անձնական կամ զգայուն տվյալներ հրապարակային փաստաթղթերում։"],
      ["2․ Առանձնացրո՛ւ վստահելի կոնտակտները", "Նախապես հավաքի՛ր երեք հեշտ հասանելի կոնտակտ՝ քո սովորական անասնաբույժը կամ կլինիկան, մոտակա արտաժամյա օգնություն տրամադրող կլինիկան՝ նախապես ստուգված աշխատանքային ժամերով, և վստահելի ընտանիքի անդամը, ընկերը կամ խնամողը։ Ժամանակ առ ժամանակ ստուգի՛ր, որ տվյալները դեռ ճիշտ են։"],
      ["3․ Օգտագործի՛ր մեկ հիմնական օրացույց", "Մեկ օրացույցում գրանցի՛ր արդեն պայմանավորված այցերը, անհրաժեշտ գնումների հիշեցումները, փաստաթղթերի թարմացման ամսաթվերը և ընտանիքի ներսում համաձայնեցված խնամքի գործերը։ Յուրաքանչյուր գրառման մեջ ավելացրո՛ւ գործողությունը, ամսաթիվը և պատասխանատու անձին։ Առողջությանը վերաբերող որոշումները միշտ ճշտի՛ր որակավորված անասնաբույժի հետ։"],
      ["4․ Համակարգը հասանելի դարձրո՛ւ ընտանիքին", "Եթե կենդանու խնամքին մասնակցում են մի քանի հոգի, պայմանավորվե՛ք՝ որտեղ է պահվում հիմնական տեղեկությունը և ով է այն թարմացնում։ Օգտագործե՛ք մեկ հիմնական տարբերակ, կիսվե՛ք միայն նրանց հետ, ում հասանելիությունն իսկապես անհրաժեշտ է, և հեռացրե՛ք հնացած տվյալները։"],
      ["Սկսի՛ր երեք փոքր քայլից", "Այսօր ընտրի՛ր մեկ վայր կենդանուդ տեղեկությունների համար, ավելացրո՛ւ երեք վստահելի կոնտակտ և գրանցի՛ր հաջորդ կարևոր ամսաթիվը։ BuddyLife-ը ստեղծվում է, որպեսզի նման առօրյա կազմակերպումը հետագայում դառնա ավելի պարզ և միասնական։"],
    ] },
    ru: { title: "Как хранить важную информацию о питомце и даты ухода в одном месте", description: "Простая система для данных о питомце, проверенных контактов и важных дат — без лишней сложности.", sections: [
      ["1. Краткая карточка питомца", "Запишите имя, вид, дату рождения или примерный возраст, важные бытовые особенности, контакт основной клиники и человека, который сможет помочь в ваше отсутствие. Не храните личные или чувствительные данные в открытом документе."],
      ["2. Три проверенных контакта", "Добавьте обычного ветеринара или клинику, ближайшую клинику с помощью в нерабочее время — после проверки часов работы — и доверенного родственника, друга или ситтера. Периодически проверяйте актуальность данных."],
      ["3. Один основной календарь", "Внесите подтверждённые визиты, напоминания о необходимых покупках, сроки обновления документов и распределённые семейные задачи. Для каждой записи укажите действие, дату и ответственного человека. Решения, связанные со здоровьем, всегда уточняйте у квалифицированного ветеринарного специалиста."],
      ["4. Одна версия для семьи", "Если за питомцем ухаживают несколько человек, договоритесь, где хранится основная информация и кто её обновляет. Предоставляйте доступ только тем, кому он действительно необходим, и удаляйте устаревшие сведения."],
      ["Начните с трёх небольших шагов", "Выберите одно место, добавьте три доверенных контакта и внесите ближайшую важную дату. BuddyLife находится в разработке, чтобы в будущем сделать такую ежедневную организацию проще и удобнее."],
    ] },
    en: { title: "How to keep your pet’s important information and care dates organized", description: "A simple system for keeping essential pet details, trusted contacts and important dates in one accessible place.", sections: [
      ["1. Create a short pet information card", "Record your pet’s name, species, birth date or approximate age, practical day-to-day notes, the main clinic contact and someone who can help when you are away. Do not place private or sensitive information in a publicly accessible document."],
      ["2. Keep three trusted contacts", "Add your regular veterinarian or clinic, a nearby after-hours clinic after confirming its opening hours, and a trusted family member, friend or sitter. Check periodically that the details remain current."],
      ["3. Use one main calendar", "Add confirmed appointments, supply reminders, document-renewal dates and agreed household care tasks. Each entry should state the action, date and responsible person. Always confirm health-related decisions with a qualified veterinary professional."],
      ["4. Keep one shared family version", "If several people help care for your pet, agree on where the main information is stored and who updates it. Share access only with people who genuinely need it and remove outdated information."],
      ["Start with three small actions", "Choose one place, add three trusted contacts and record the next important date. BuddyLife is being developed to make this kind of everyday organization simpler and more connected in the future."],
    ] },
  },
  "weekly-pet-care-organization-routine": {
    image: "/learn-weekly-pet-care-organization-routine-editorial-v5.jpg",
    hy: { title: "Շաբաթական 10 րոպե՝ կենդանուդ խնամքը կազմակերպելու համար", description: "Պարզ շաբաթական ստուգաթերթ՝ կենդանու տեղեկությունները, պարագաները, կարևոր ամսաթվերն ու ընտանեկան պարտականությունները մեկ տեղում կազմակերպելու համար։", sections: [
      ["Ինչու ընտրել շաբաթական մեկ կարճ ստուգում", "Կենդանու խնամքի փոքր գործերը հաճախ բարդանում են ոչ թե այն պատճառով, որ դրանք շատ են, այլ որովհետև տեղեկությունները, հիշեցումներն ու պարտականությունները ցրված են տարբեր տեղերում։ Ընտրի՛ր շաբաթվա նույն օրը և հատկացրո՛ւ տասը րոպե։ Նպատակը կատարյալ համակարգ ստեղծելը չէ, այլ հաջորդ շաբաթը ավելի հանգիստ և կանխատեսելի դարձնելը։"],
      ["1․ Ստուգի՛ր կենդանուդ հիմնական տեղեկությունները", "Բացիր այն մեկ վայրը, որտեղ պահում ես կենդանուդ հիմնական տվյալները։ Համոզվի՛ր, որ անունը, տարիքը, առօրյա խնամքի նշումները և վստահելի կոնտակտները հասանելի ու արդիական են։ Մի՛ պահիր անձնական կամ զգայուն տվյալներ հրապարակային փաստաթղթերում։"],
      ["2․ Նայի՛ր առաջիկա յոթ օրվա օրացույցին", "Ստուգի՛ր արդեն պայմանավորված այցելությունները, խնամքի գործերը, փաստաթղթերի ժամկետները և անհրաժեշտ գնումների հիշեցումները։ Յուրաքանչյուր գրառման մեջ նշի՛ր գործողությունը, օրը և պատասխանատու մարդուն։ Առողջությանը վերաբերող ժամանակացույցերը ճշտի՛ր կենդանուդ անասնաբույժի հետ և գրանցի՛ր միայն հաստատված քայլերը։"],
      ["3․ Արագ ստուգի՛ր առօրյա պարագաները", "Նայի՛ր՝ արդյոք բավարար են առաջիկա շաբաթվա սնունդը, մաքրության պարագաները, զբոսանքի անհրաժեշտ իրերը և մյուս ամենօրյա պաշարները։ Գրանցի՛ր միայն այն, ինչ իսկապես պետք է գնել կամ լրացնել։"],
      ["4․ Բաժանի՛ր ընտանեկան պարտականությունները", "Եթե կենդանու խնամքին մասնակցում են մի քանի հոգի, հստակեցրե՛ք՝ ով ինչ է անում առաջիկա շաբաթվա ընթացքում։ Յուրաքանչյուր գործ պետք է ունենա մեկ պատասխանատու մարդ։ «Ինչ-որ մեկը կանի» ձևակերպումը հաճախ նշանակում է, որ գործը կարող է մոռացվել։"],
      ["5․ Ընտրի՛ր շաբաթվա մեկ առաջնահերթություն", "Վերջում ընտրի՛ր միայն մեկ գործ, որն ամենակարևորն է հաջորդ յոթ օրվա համար։ Դա կարող է լինել կոնտակտի թարմացում, անհրաժեշտ գնում, փաստաթղթի ստուգում կամ արդեն հաստատված այցելության պատրաստում։"],
      ["10-րոպեանոց շաբաթական ստուգաթերթ", "Հիմնական տեղեկությունները թարմացվա՞ծ են։ Առաջիկա յոթ օրվա հաստատված գործերը օրացույցո՞ւմ են։ Անհրաժեշտ պարագաները բավարա՞ր են։ Յուրաքանչյուր գործ ունի՞ պատասխանատու մարդ։ Շաբաթվա մեկ առաջնահերթությունը որոշվա՞ծ է։ Պահպանի՛ր այս ստուգաթերթը և ընտրի՛ր շաբաթվա մեկ հաստատուն օր։"],
    ] },
    ru: { title: "10 минут в неделю, чтобы организовать заботу о питомце", description: "Простой еженедельный список для информации о питомце, запасов, важных дат и семейных обязанностей.", sections: [
      ["Зачем нужна одна короткая проверка в неделю", "Повседневные задачи по уходу становятся сложнее, когда сведения, напоминания и обязанности хранятся в разных местах. Выберите один постоянный день и уделяйте десять минут подготовке к следующей неделе."],
      ["1. Проверьте основную информацию", "Убедитесь, что бытовые заметки и доверенные контакты актуальны и хранятся в одном основном месте. Не размещайте личные или чувствительные сведения в открытых документах."],
      ["2. Посмотрите календарь на семь дней вперёд", "Добавьте подтверждённые визиты, семейные задачи, сроки документов и необходимые покупки. Медицинские графики согласовывайте с ветеринарным специалистом и записывайте только подтверждённые действия."],
      ["3. Проверьте повседневные запасы", "Посмотрите, достаточно ли корма, средств для уборки, прогулочных принадлежностей и других регулярно используемых вещей на следующую неделю."],
      ["4. Распределите обязанности", "У каждой задачи должен быть один ответственный человек: кто покупает необходимое, сопровождает питомца на подтверждённый визит или обновляет общий список."],
      ["5. Выберите один приоритет недели", "Один конкретный следующий шаг полезнее длинного списка, который никто не открывает."],
      ["Еженедельный список", "Актуальная информация; подтверждённые дела в календаре; достаточные запасы; ответственный за каждую задачу; один главный приоритет. Сохраните список и выберите один постоянный день недели для короткой проверки."],
    ] },
    en: { title: "A 10-minute weekly routine for organizing your pet’s care", description: "A simple weekly checklist for pet information, everyday supplies, important dates and shared family responsibilities.", sections: [
      ["Why use one short weekly review", "Everyday pet-care tasks become harder when information, reminders and responsibilities are scattered. Choose one consistent day and spend ten minutes preparing for the week ahead."],
      ["1. Check the main information", "Confirm that practical notes and trusted contacts are current and stored in one primary place. Never place private or sensitive details in a public document."],
      ["2. Review the next seven days", "Add confirmed appointments, household care tasks, document deadlines and necessary purchases. Agree health-related schedules with your veterinarian and record only confirmed actions."],
      ["3. Check everyday supplies", "Make sure you have enough food, cleaning supplies, walking essentials and other routinely used items for the coming week."],
      ["4. Assign responsibilities", "Give every task one owner: the person buying supplies, handling a confirmed appointment or updating the shared list."],
      ["5. Choose one weekly priority", "One concrete next step is more useful than a long list that nobody reviews."],
      ["Weekly checklist", "Current information; confirmed tasks in the calendar; enough supplies; one owner for each task; one main priority. Save the checklist and choose one consistent day for your weekly review."],
    ] },
  },
  "five-minute-pet-admin-reset": {
    image: "/learn-five-minute-pet-admin-reset-editorial-v5.jpg",
    hy: { title: "5 րոպե՝ կենդանուդ խնամքի գրառումները վերադասավորելու համար", description: "Գործնական հինգ քայլ՝ ցրված գրառումներից մեկ կարճ, թարմ և պատասխանատուներով հստակեցված շաբաթական ցանկ ստանալու համար։", sections: [
      ["Սա նոր համակարգ չէ, այլ արագ վերադասավորում", "Այս հինգ րոպեի նպատակը բոլոր տեղեկությունները վերաշարադրելը չէ։ Դու պարզապես հավաքում ես այն, ինչ պետք է անել առաջիկա յոթ օրում, հեռացնում ես հին կամ կրկնվող գրառումները և ավարտում մեկ հստակ հաջորդ քայլով։"],
      ["1․ Հավաքի՛ր միայն այս շաբաթվա գործերը", "Բացիր չաթերը, թղթերը և օրացույցը, բայց տեղափոխիր միայն առաջիկա յոթ օրվան վերաբերող գործերը մեկ ժամանակավոր ցանկ։ Չհաստատված առողջական հարցերը գրանցիր որպես հարց մասնագետին, ոչ թե որպես ինքնուրույն որոշում։"],
      ["2․ Հեռացրո՛ւ կրկնություններն ու հին տարբերակները", "Եթե նույն գործը գրված է մի քանի տեղում, թող միայն մեկ գրառում։ Ջնջիր կամ արխիվացրու արդեն կատարված և այլևս պետք չեկող նշումները, որպեսզի ընտանիքը չօգտվի սխալ տարբերակից։"],
      ["3․ Ստուգի՛ր առօրյա պարագաները", "Արագ նայիր սննդին, մաքրության և զբոսանքի պարագաներին։ Ցանկում ավելացրու միայն իրական պակասը և խուսափիր «գուցե պետք գա» երկար գնումների ցանկից։"],
      ["4․ Յուրաքանչյուր գործի համար նշի՛ր մեկ պատասխանատու", "Եթե խնամքին մասնակցում են մի քանի հոգի, յուրաքանչյուր գործի կողքին գրիր մեկ անուն։ Այդպես «ինչ-որ մեկը կանի» ձևակերպումը փոխվում է հստակ պայմանավորվածությամբ։"],
      ["5․ Փակի՛ր վերադասավորումը մեկ հաջորդ քայլով", "Ընտրիր այն մեկ գործողությունը, որն այսօր կամ վաղը կարող ես ավարտել՝ օրինակ պարագա գնել, կոնտակտ թարմացնել կամ հաստատված հանդիպումը ավելացնել օրացույցում։ Մնացածը թող շաբաթական ցանկում։"],
      ["5-րոպեանոց արագ ցանկ", "Այս շաբաթվա գործերը մեկ տեղում են․ կրկնությունները հեռացված են․ պարագաները ստուգված են․ յուրաքանչյուր գործ ունի մեկ պատասխանատու․ ընտրված է մեկ հաջորդ քայլ։ Պահպանի՛ր այս ցանկը և նորից բացի՛ր շաբաթվա նույն օրը։"],
    ] },
    ru: { title: "Пять минут, чтобы привести в порядок заметки об уходе за питомцем", description: "Пять практических шагов, которые превращают разрозненные записи в короткий актуальный список на неделю с понятными ответственными.", sections: [
      ["Это не новая система, а быстрая перезагрузка", "Не нужно переписывать все сведения о питомце. Соберите только задачи на ближайшие семь дней, уберите старые и повторяющиеся записи и завершите проверку одним конкретным следующим шагом."],
      ["1. Соберите дела только на эту неделю", "Просмотрите чаты, бумажные заметки и календарь, но перенесите в один временный список лишь то, что относится к ближайшим семи дням. Неподтверждённые вопросы о здоровье запишите как вопросы специалисту, а не как самостоятельные решения."],
      ["2. Уберите дубли и старые версии", "Если одна задача записана в нескольких местах, оставьте одну актуальную запись. Выполненные или ненужные заметки удалите либо перенесите в архив, чтобы никто не ориентировался на устаревшую версию."],
      ["3. Проверьте повседневные запасы", "Быстро оцените корм, средства для уборки и прогулочные принадлежности. Добавляйте только то, чего действительно не хватает, без длинного списка покупок на всякий случай."],
      ["4. Назначьте одного ответственного", "Если питомцем занимаются несколько человек, укажите одно имя рядом с каждой задачей. Так расплывчатое «кто-нибудь сделает» превращается в понятную договорённость."],
      ["5. Выберите один следующий шаг", "Завершите проверку действием, которое можно выполнить сегодня или завтра: купить нужное, обновить контакт или добавить подтверждённую встречу в календарь. Остальные задачи оставьте в недельном списке."],
      ["Короткий список на пять минут", "Дела недели собраны в одном месте; дубли удалены; запасы проверены; у каждой задачи один ответственный; выбран один следующий шаг. Сохраните список и возвращайтесь к нему в один и тот же день недели."],
    ] },
    en: { title: "A five-minute reset for your pet-care notes", description: "Five practical steps that turn scattered notes into one short, current weekly list with clear owners.", sections: [
      ["This is a quick reset, not a new system", "You do not need to rewrite every detail about your pet. Gather only what matters during the next seven days, remove old or duplicate notes, and finish with one concrete next step."],
      ["1. Collect only this week’s tasks", "Check chats, paper notes, and calendars, then move only the next seven days of tasks into one temporary list. Record an unconfirmed health matter as a question for a professional, not a decision to make alone."],
      ["2. Remove duplicates and old versions", "If the same task appears in several places, keep one current entry. Delete or archive completed and outdated notes so nobody follows the wrong version."],
      ["3. Check everyday supplies", "Quickly review food, cleaning items, and walking essentials. Add only genuine gaps instead of building a long just-in-case shopping list."],
      ["4. Give every task one owner", "When several people share care, place one name beside each task. This turns ‘someone will do it’ into a clear agreement."],
      ["5. Close with one next step", "Choose one action you can complete today or tomorrow, such as buying an item, updating a contact, or adding a confirmed appointment to the calendar. Keep everything else on the weekly list."],
      ["Five-minute checklist", "This week’s tasks are in one place; duplicates are gone; supplies are checked; every task has one owner; one next step is selected. Save the list and reopen it on the same day next week."],
    ] },
  },
  "pet-care-handover-note": {
    image: "/learn-pet-care-handover-note-editorial-v5.jpg",
    hy: { title: "Երբ կենդանուդ խնամքը վստահում ես մեկ ուրիշին․ պարզ փոխանցման հուշաթերթ", description: "Կարճ ու գործնական հուշաթերթ, որպեսզի կենդանուդ ժամանակավոր խնամողը իմանա առօրյա ռեժիմը, անհրաժեշտ պարագաների տեղը, կարևոր կոնտակտներն ու տան կանոնները։", sections: [
      ["Ինչու պատրաստել փոխանցման հուշաթերթ", "Նույնիսկ մեկ օրվա համար կենդանու խնամքը ուրիշին վստահելիս մանրուքները հեշտ է բաց թողնել։ Կարճ ու հստակ հուշաթերթը ժամանակավոր խնամողին օգնում է հասկանալ կենդանու սովորական օրը՝ առանց գուշակելու։ Այն պահի՛ր փակ հասանելիությամբ և ներառի՛ր միայն անհրաժեշտ տեղեկությունը։"],
      ["1․ Սկսի՛ր կենդանու հիմնական տվյալներից", "Գրի՛ր կենդանուդ անունը և այն պարզ տեղեկությունը, որն օգնում է տարբերել նրան։ Եթե տանը մեկից ավելի կենդանի կա, յուրաքանչյուրի համար պատրաստի՛ր առանձին բաժին և նշի՛ր, թե որտեղ է պահվում հիմնական, թարմ գրառումը։"],
      ["2․ Նկարագրի՛ր սովորական օրվա ռիթմը", "Կարճ գրի՛ր, թե մոտավորապես երբ է կենդանին ուտում, զբոսնում, խաղում և հանգստանում։ Ավելացրո՛ւ գործնական մանրամասներ՝ օրինակ, որ դռները պետք է փակ մնան կամ որտեղ է հանգստի տարածքը։"],
      ["3․ Ցո՛ւյց տուր պարագաների տեղը", "Նշի՛ր, թե որտեղ են սնունդը, ջրի ամանը, զբոսանքի պարագաները, մաքրման միջոցներն ու մյուս ամենօրյա իրերը։ Վտանգավոր նյութերն ու անձնական փաստաթղթերը պահի՛ր անհասանելի վայրում։"],
      ["4․ Ավելացրո՛ւ տան և շփման կանոնները", "Գրի՛ր՝ որտեղ կարելի է զբոսնել, որ տարածքներն են փակ, ինչպես ապահով օգտագործել վզկապը կամ փոխադրիչը և ինչպիսի շփումն է կենդանին սովորաբար նախընտրում։ Նպատակը ծանոթ ու անվտանգ ռիթմ պահպանելն է։"],
      ["5․ Կոնտակտները փոխանցի՛ր փակ կերպով", "Տո՛ւր քո հեռախոսահամարը, մեկ վստահելի պահեստային կոնտակտ և, անհրաժեշտության դեպքում, կենդանուդ սպասարկող մասնագետի հաստատված կոնտակտը։ Մի՛ հրապարակիր դրանք Story-ում, բաց չաթում կամ ընդհանուր հասանելի հղումով։"],
      ["6․ Բժշկական հարցերում մի՛ թող գուշակելու տեղ", "Եթե կենդանին ունի անասնաբույժի կողմից սահմանված ընթացիկ հրահանգներ, փոխանցի՛ր միայն հաստատված գրավոր տարբերակը և մասնագիտական կոնտակտը։ Ժամանակավոր խնամողը չպետք է փոխի չափաբաժինը, ժամանակացույցը կամ որոշում ընդունի ենթադրությամբ։"],
      ["7․ Պայմանավորվի՛ր լուսանկարների և գաղտնիության մասին", "Հստակ ասա՝ կարելի՞ է կենդանու լուսանկարն ուղարկել, հրապարակել կամ փոխանցել ուրիշին։ Մի՛ հրապարակեք տան հասցեն, իրական ժամանակի գտնվելու վայրը, ճանապարհորդության մանրամասները կամ փաստաթղթերը։"],
      ["8․ Փոխանցումից առաջ անցե՛ք ցանկով միասին", "Ցույց տուր պարագաների տեղը, անցիր առօրյա հերթականությամբ և պատասխանեք բաց հարցերին։ Համոզվե՛ք, որ երկուսդ էլ ունեք նույն վերջնական տարբերակը, իսկ հին պատճեններն այլևս չեն օգտագործվում։"],
      ["Արագ փոխանցման ստուգաթերթ", "Կենդանու անունը և տարբերակիչ տեղեկությունը․ սովորական ռիթմը․ պարագաների տեղը․ տան կանոնները․ տիրոջ և պահեստային անձի կոնտակտները․ միայն հաստատված մասնագիտական հրահանգները․ լուսանկարների թույլտվությունը․ մեկ թարմ վերջնական տարբերակ։"],
    ] },
    ru: { title: "Простая памятка для временного ухода за питомцем", description: "Короткая практическая памятка о распорядке питомца, принадлежностях, важных контактах и домашних правилах для временного помощника.", sections: [
      ["Зачем нужна памятка", "Даже за один день легко упустить небольшие, но важные детали. Короткая памятка помогает сохранить привычный распорядок без догадок. Храните её в закрытом доступе и указывайте только необходимое."],
      ["1. Укажите основную информацию", "Запишите имя и сведения, необходимые для идентификации питомца. Если животных несколько, подготовьте отдельный раздел для каждого и укажите, где хранится актуальная основная запись."],
      ["2. Опишите привычный распорядок", "Кратко укажите обычное время кормления, прогулок, игры и отдыха. Добавьте практические детали: какие двери должны быть закрыты и где питомец обычно отдыхает."],
      ["3. Покажите принадлежности", "Укажите, где лежат корм, миски, прогулочное снаряжение, средства для уборки и другие необходимые вещи. Опасные материалы и личные документы храните отдельно."],
      ["4. Добавьте правила дома и общения", "Объясните разрешённые места для прогулок, закрытые комнаты, безопасное использование поводка или переноски и предпочитаемый питомцем способ общения."],
      ["5. Передайте контакты лично", "Оставьте свой номер, один доверенный резервный контакт и, при необходимости, подтверждённый контакт ветеринара или клиники. Не публикуйте эти данные в Stories, открытых чатах или общедоступных ссылках."],
      ["6. Исключите медицинские догадки", "Передавайте только подтверждённые письменные ветеринарные инструкции и контакт специалиста. Временный помощник не должен самостоятельно менять дозировку, график или решение по уходу."],
      ["7. Договоритесь о фото и конфиденциальности", "Уточните, можно ли отправлять, публиковать или пересылать фотографии. Не размещайте адрес дома, геолокацию в реальном времени, сведения о поездке или документы."],
      ["8. Просмотрите памятку вместе", "Покажите расположение вещей, пройдите по распорядку и ответьте на вопросы. У обеих сторон должна остаться одна актуальная версия."],
      ["Краткий список", "Данные питомца; привычный распорядок; расположение принадлежностей; правила дома; контакты владельца и доверенного человека; только подтверждённые инструкции; разрешение на фото; одна актуальная версия."],
    ] },
    en: { title: "A simple handover note for your pet’s temporary caregiver", description: "A short practical note covering your pet’s routine, supply locations, key contacts, and household rules for a temporary caregiver.", sections: [
      ["Why prepare a handover note", "Even for one day, small but important details are easy to miss. A short note helps a caregiver follow the familiar routine without guessing. Keep it private and include only what is genuinely needed."],
      ["1. Identify the pet", "Record the pet’s name and the basic information needed to identify them. If there is more than one animal, use a separate section for each and point to the current primary record."],
      ["2. Describe the usual daily rhythm", "Briefly explain the normal times for food, walks, play, and rest. Add practical details such as which doors must stay closed or where the pet usually settles."],
      ["3. Show where supplies are kept", "Identify food, water bowls, walking equipment, cleaning supplies, and other essentials. Keep hazardous materials and private documents out of reach."],
      ["4. Add household and interaction rules", "Explain permitted walking areas, restricted rooms, safe use of a lead or carrier, and how the pet normally prefers to interact."],
      ["5. Share contacts privately", "Provide your number, one trusted backup contact and, when relevant, the established veterinarian or clinic contact. Do not put this information in a public Story, open group chat, or public link."],
      ["6. Leave no room for medical guesswork", "Share only confirmed written veterinary instructions and the appropriate professional contact. A temporary caregiver should not improvise or change a dose, schedule, or care decision."],
      ["7. Agree on photos and privacy", "State whether the caregiver may send, publish, or forward photos. Avoid sharing a home address, real-time location, travel details, or documents."],
      ["8. Review the note together", "Show where supplies are kept, walk through the routine, and invite questions. Make sure both people hold the same current version."],
      ["Quick checklist", "Pet identification; usual routine; supply locations; household rules; owner and backup contacts; confirmed professional instructions only; photo permission; one current final version."],
    ] },
  },
  "first-week-pet-information-starter-kit": {
    image: "/learn-first-week-pet-information-starter-kit-editorial-v5.jpg",
    hy: { title: "Կենդանու մասին կարևոր տեղեկությունները․ ինչ հավաքել առաջին շաբաթում", description: "Գործնական մեկնարկային ցանկ՝ կենդանու հիմնական տվյալները, առօրյա ռիթմը, պարագաները, վստահելի կոնտակտները, փաստաթղթերն ու հիշեցումները մեկ փակ տեղեկաթերթում պահելու համար։", sections: [
      ["1․ Հիմնական տվյալներ", "Գրի՛ր կենդանու անունը, մոտավոր տարիքը, տեսակը և այն նշանները, որոնցով նրան հեշտ է տարբերել։ Եթե նույն տանը մի քանի կենդանի կա, յուրաքանչյուրի համար պահի՛ր առանձին բաժին։"],
      ["2․ Սովորական օրվա ռիթմը", "Նշի՛ր սննդի, զբոսանքի, խաղի և հանգստի սովորական ժամերը։ Երկար ժամանակացույց պետք չէ․ բավական է կարճ նկարագրություն, որը պարզ է ընտանիքի բոլոր անդամների համար։"],
      ["3․ Անհրաժեշտ պարագաների տեղը", "Գրի՛ր՝ որտեղ են պահվում սնունդը, ջրի ամանը, վզկապը կամ փոխադրիչը, մաքրման պարագաներն ու մյուս ամենօրյա իրերը։ Վտանգավոր նյութերը պահի՛ր կենդանու համար անհասանելի վայրում։"],
      ["4․ Վստահելի կոնտակտներ", "Ավելացրո՛ւ քո համարը, մեկ վստահելի պահեստային անձի տվյալները և այն մասնագետի հաստատված կոնտակտը, ում արդեն դիմում ես։ Պահի՛ր այս ցանկը փակ հասանելիությամբ։"],
      ["5․ Փաստաթղթերի հիմնական տեղը", "Ընտրի՛ր մեկ հիմնական թղթապանակ կամ պաշտպանված թվային տեղ և նշի՛ր, թե որտեղ է գտնվում թարմ տարբերակը։ Փաստաթղթերն ու անձնական տվյալները մի՛ տարածիր բաց հղումով։"],
      ["6․ Հիշեցումներ", "Մեկ օրացույցում գրանցի՛ր առաջիկա կարևոր գործերը՝ պարագաների գնում, խնամքի պայմանավորվածություն կամ փաստաթղթի թարմացում։ Մասնագետի հաստատում պահանջող գործողությունը նշի՛ր որպես հարց, ոչ թե ինքնուրույն որոշում։"],
      ["7․ Շաբաթվա վերջում թարմացրո՛ւ", "Առաջին շաբաթվա վերջում հինգ րոպե տրամադրի՛ր տեղեկաթերթին․ հեռացրո՛ւ կրկնությունները, լրացրո՛ւ բաց թողածը և թող միայն մեկ վերջնական տարբերակ։"],
      ["Արագ ցանկ", "Հիմնական տվյալներ․ առօրյա ռիթմ․ պարագաների տեղ․ վստահելի կոնտակտներ․ փաստաթղթերի տեղ․ հիշեցումներ․ մեկ թարմ տարբերակ։"],
    ] },
    ru: { title: "Важная информация о питомце: что собрать в первую неделю", description: "Практический стартовый список, который поможет хранить основные данные, распорядок, принадлежности, доверенные контакты, документы и напоминания в одной закрытой карточке.", sections: [
      ["1. Основные сведения", "Запишите имя, примерный возраст, вид животного и признаки, по которым его легко отличить. Если дома несколько питомцев, создайте отдельный раздел для каждого."],
      ["2. Привычный распорядок", "Укажите обычное время кормления, прогулок, игр и отдыха. Длинное расписание не требуется: достаточно короткого и понятного описания для всех членов семьи."],
      ["3. Где хранятся принадлежности", "Запишите, где находятся корм, миска для воды, поводок или переноска, средства для уборки и другие повседневные вещи. Опасные материалы держите вне доступа питомца."],
      ["4. Доверенные контакты", "Добавьте свой номер, контакт одного надёжного человека и подтверждённый контакт специалиста, к которому вы уже обращаетесь. Храните список в закрытом доступе."],
      ["5. Основное место для документов", "Выберите одну папку или защищённое цифровое хранилище и укажите, где находится актуальная версия. Не публикуйте документы или личные данные по открытой ссылке."],
      ["6. Напоминания", "Добавьте в один календарь ближайшие важные дела: покупку принадлежностей, согласованный уход или обновление документов. Действие, требующее подтверждения специалиста, запишите как вопрос, а не как самостоятельное решение."],
      ["7. Обновите карточку в конце недели", "Через неделю уделите карточке пять минут: удалите дубли, дополните пропущенное и оставьте одну актуальную версию."],
      ["Краткий список", "Основные сведения; распорядок; расположение принадлежностей; доверенные контакты; место документов; напоминания; одна актуальная версия."],
    ] },
    en: { title: "Important pet information to collect in the first week", description: "A practical starter checklist for keeping identity basics, routine, supplies, trusted contacts, documents and reminders in one private information sheet.", sections: [
      ["1. Record the basics", "Write down the pet’s name, approximate age, species and the features that make them easy to identify. If several pets live in the home, create a separate section for each."],
      ["2. Describe the familiar routine", "Note the usual times for food, walks, play and rest. You do not need a long timetable—just a short description that everyone in the household can understand."],
      ["3. Note where supplies are kept", "Record where food, the water bowl, lead or carrier, cleaning supplies and other everyday items are stored. Keep hazardous materials out of the pet’s reach."],
      ["4. Add trusted contacts", "Include your number, one trusted backup person and the confirmed contact for a professional you already use. Keep this list private."],
      ["5. Choose one place for documents", "Use one primary folder or protected digital location and note where the current version is stored. Never share documents or personal details through a public link."],
      ["6. Set clear reminders", "Put upcoming tasks—such as buying supplies, an agreed care arrangement or updating a document—in one calendar. Record anything that needs professional confirmation as a question, not a decision to make alone."],
      ["7. Review it at the end of the week", "After the first week, spend five minutes removing duplicates, filling gaps and keeping one final current version."],
      ["Quick checklist", "Identity basics; daily routine; supply locations; trusted contacts; document location; reminders; one current version."],
    ] },
  },
  "what-to-do-when-pet-goes-missing": {
    image: "/learn-what-to-do-when-pet-goes-missing-editorial-v5.jpg",
    hy: { title: "Ինչ անել առաջինը, երբ կենդանին կորում է", description: "Կազմակերպված առաջին քայլեր՝ տունն ու մոտակա տարածքը ստուգելու, վստահելի մարդկանց տեղեկացնելու և անվտանգ հայտարարություն տարածելու համար։", sections: [
      ["1․ Հստակեցրու վերջին ստուգված պահը", "Խոսիր ընտանիքի անդամների կամ ներկա մարդկանց հետ և գրանցիր՝ կենդանուն ով, որտեղ և երբ է վերջին անգամ տեսել։ Ստուգիր՝ արդյոք բաց է մնացել դուռ, պատուհան, պատշգամբի ելք կամ բակի դարպաս։ Պահիր մեկ կարճ գրառում, որպեսզի բոլոր որոնողները նույն տեղեկությունից օգտվեն։"],
      ["2․ Մանրակրկիտ ստուգիր տունն ու մոտակա տարածքը", "Նայիր մահճակալների տակ, պահարաններում, մութ անկյուններում, կահույքի հետևում և փոքր թաքստոցներում։ Դրսում հանգիստ ստուգիր մուտքերը, թփերը, աստիճանների տակ եղած տարածքները, ավտոտնակներն ու փակ շինությունները՝ սեփականատիրոջ թույլտվությամբ։ Վերցրու վզկապ կամ ապահով փոխադրիչ և կենդանուն ծանոթ ձայն կամ խաղալիք։"],
      ["3․ Խնդրիր տեսնողներին չհետապնդել", "Վախեցած կենդանին կարող է հեռանալ, եթե անծանոթ մարդիկ փորձեն արագ մոտենալ կամ բռնել նրան։ Խնդրիր մարդկանց նշել ճշգրիտ վայրը, ժամը և շարժման ուղղությունը, ապա անմիջապես կապվել քեզ հետ։ Եթե կենդանին մոտենում է, շարժումներդ պահիր հանգիստ և օգտագործիր նրա համար ծանոթ կանչը։"],
      ["4․ Տեղեկացրու վստահելի տեղական կապերին", "Կապվիր մոտակա անասնաբուժական կլինիկաների, կենդանիների ապաստարանների և փրկարարական խմբերի հետ, որոնց տվյալները կարող ես ստուգել։ Եթե կենդանին ունի միկրոչիպ կամ այլ գրանցված նույնականացում, կորուստը նշիր համապատասխան ծառայությունում և համոզվիր, որ կապի տվյալներդ թարմ են։"],
      ["5․ Տարածիր մեկ հստակ և անվտանգ հայտարարություն", "Օգտագործիր կենդանու վերջին, պարզ լուսանկարը։ Նշիր կենդանու տեսակը, գույնը, տարբերակիչ հատկանիշները, վերջին ստուգված վայրը և ժամը, ինչպես նաև մեկ հասանելի կապի միջոց։ Մի՛ հրապարակիր անձնական փաստաթղթեր, միկրոչիպի ամբողջ համարը, տան ճշգրիտ հասցեն կամ բանկային տվյալներ։"],
      ["6․ Գրանցիր նոր տեղեկությունները և զգուշացիր խարդախությունից", "Յուրաքանչյուր հաղորդագրության համար գրանցիր աղբյուրը, ժամը և վայրը։ Եթե անծանոթը պնդում է, որ գտել է կենդանուն, խնդրիր նկարագրել չհրապարակված տարբերակիչ հատկանիշը կամ ուղարկել ընթացիկ լուսանկար։ Մի՛ փոխանցիր գումար կամ բանկային տվյալներ միայն խոստման դիմաց։"],
    ] },
    ru: { title: "Что делать в первую очередь, если питомец пропал", description: "Организованные первые шаги: проверить дом и ближайшую территорию, предупредить проверенные контакты и безопасно распространить объявление.", sections: [
      ["1. Уточните последний подтверждённый момент", "Спросите членов семьи и тех, кто находился рядом, кто, где и когда видел питомца в последний раз. Проверьте двери, окна, выход на балкон и ворота во двор. Запишите одну короткую исходную версию, чтобы все участники поиска использовали одинаковые данные."],
      ["2. Тщательно проверьте дом и ближайшую территорию", "Осмотрите пространство под кроватями, шкафы, тёмные углы, места за мебелью и небольшие укрытия. Снаружи спокойно проверьте подъезды, кусты, пространство под лестницами, гаражи и закрытые помещения — с разрешения владельцев. Возьмите поводок или безопасную переноску и знакомую питомцу игрушку или звук."],
      ["3. Попросите очевидцев не преследовать животное", "Испуганный питомец может убежать дальше, если незнакомцы попытаются быстро приблизиться или схватить его. Попросите людей отметить точное место, время и направление движения, а затем сразу связаться с вами."],
      ["4. Сообщите проверенным местным контактам", "Свяжитесь с ближайшими ветеринарными клиниками, приютами и спасательными группами, чьи данные можно проверить. Если у питомца есть микрочип или другая зарегистрированная идентификация, отметьте его как пропавшего в соответствующей службе и проверьте актуальность контактов."],
      ["5. Распространите одно ясное и безопасное объявление", "Используйте недавнюю чёткую фотографию. Укажите вид животного, окрас, отличительные признаки, последнее подтверждённое место и время, а также один доступный способ связи. Не публикуйте личные документы, полный номер микрочипа, точный домашний адрес или банковские данные."],
      ["6. Фиксируйте новые сведения и остерегайтесь мошенников", "Для каждого сообщения записывайте источник, время и место. Если незнакомец утверждает, что нашёл питомца, попросите описать неопубликованный отличительный признак или прислать актуальную фотографию. Не переводите деньги и не сообщайте банковские данные только в обмен на обещание вернуть животное."],
    ] },
    en: { title: "What to do first when a pet goes missing", description: "Organized first steps for checking home and the immediate area, alerting trusted contacts, and sharing a clear notice safely.", sections: [
      ["1. Confirm the last reliable sighting", "Ask family members or anyone present who last saw the pet, where, and at what time. Check whether a door, window, balcony exit, or courtyard gate was left open. Keep one short shared note so everyone searches from the same confirmed information."],
      ["2. Search home and the immediate area carefully", "Look under beds, inside cupboards, in dark corners, behind furniture, and in small hiding places. Outside, calmly check entrances, shrubs, spaces beneath stairs, garages, and closed outbuildings with the owner's permission. Bring a lead or secure carrier and a familiar sound or toy."],
      ["3. Ask witnesses not to chase", "A frightened pet may move farther away if unfamiliar people rush toward or try to catch them. Ask anyone who sees the pet to record the exact place, time, and direction of travel, then contact you immediately."],
      ["4. Alert verified local contacts", "Contact nearby veterinary clinics, animal shelters, and rescue groups whose details you can verify. If your pet has a microchip or another registered form of identification, report them missing through the relevant service and confirm that your contact details are current."],
      ["5. Share one clear, privacy-safe notice", "Use a recent, clear photo. Include the species, colouring, distinctive features, last confirmed place and time, and one reachable contact method. Do not publish identity documents, the complete microchip number, your precise home address, or banking details."],
      ["6. Log new information and watch for scams", "For every report, record the source, time, and location. If a stranger says they found your pet, ask them to describe an unpublished identifying feature or send a current photo. Do not send money or banking information in exchange for a promise to return the animal."],
    ] },
  },
  "help-pet-when-guests-visit": {
    image: "/learn-help-pet-when-guests-visit.jpg",
    hy: { title: "Ինչպես օգնել կենդանուն, երբ տանը հյուրեր կան", description: "Հինգ պարզ քայլ, որոնք կենդանուդ ընտրության հնարավորություն և հանգիստ անկյուն են տալիս, երբ տուն են գալիս հյուրեր։", sections: [
      ["Ինչու է ընտրությունը կարևոր", "Դռան զանգը, անծանոթ ձայները, նոր հոտերն ու մարդկանց ակտիվ շարժը կարող են միանգամից փոխել կենդանուդ սովորական միջավայրը։ Նպատակը նրան շփվել ստիպելը չէ։ Ավելի օգտակար է ընտրության հնարավորություն տալ՝ մոտենալ, հեռանալ կամ հանգստանալ իր ապահով վայրում։"],
      ["1․ Նախօրոք պատրաստի՛ր հանգիստ անկյուն", "Ընտրի՛ր տան համեմատաբար լուռ հատվածը և այնտեղ դիր կենդանուդ ծանոթ մահճակալը կամ ծածկոցը, ջուրը և սիրելի խաղալիքը։ Կատվի համար օգտակար է նաև բարձր տեղը կամ բաց արկղը, որտեղից նա կարող է հետևել միջավայրին՝ առանց ուշադրության կենտրոնում լինելու։ Շան հանգստի վայրը պահի՛ր մարդկանց անցուդարձից հեռու։"],
      ["2․ Մուտքի պահը դարձրո՛ւ ավելի հանգիստ", "Հյուրերին նախապես խնդրի՛ր ներս մտնել առանց բարձր ձայնի և կենդանու շուրջ հավաքվելու։ Եթե կենդանին անհանգստանում է դռան զանգից, մինչև դուռը բացելը նրան հնարավորություն տուր գնալ իր հանգիստ անկյունը։ Պահի՛ր դեպի այդ վայրը տանող ճանապարհը բաց։"],
      ["3․ Հյուրերին տուր մեկ պարզ կանոն", "Թող կենդանին առաջինը մոտենա։ Պետք չէ կանչել, երկար նայել, գրկել, բարձրացնել կամ հետևից գնալ, եթե նա հեռանում է։ Հանգիստ նստած մարդը և փոքր-ինչ կողք շրջված դիրքը սովորաբար ավելի քիչ ճնշող են, քան անմիջական մոտեցումը։ Երեխաների շփումը միշտ վերահսկի՛ր։"],
      ["4․ Պահպանի՛ր սովորական օրվա ռիթմը", "Հնարավորության դեպքում մի՛ փոխիր կերակրման, զբոսանքի և հանգստի հիմնական ժամերը։ Ծանոթ առօրյան կենդանուն օգնում է հասկանալ, որ հյուրերի գալը չի փոխել ամբողջ օրը։ Կերակուրն ու ջուրը մի՛ տեղափոխիր աղմկոտ հատված։"],
      ["5․ Հետևի՛ր կենդանու ընտրությանը", "Եթե կենդանին թաքնվում է կամ հեռանում, մի՛ փորձիր նրան դուրս բերել միայն հյուրերին ներկայացնելու համար։ Եթե նա ինքն է մոտենում, պահի՛ր շփումը կարճ և հանգիստ։ Երբեմն լավագույն արդյունքն այն է, որ կենդանին պարզապես հանգիստ է մնում իր ընտրած վայրում։"],
      ["Երբ դիմել մասնագետի", "Եթե վախը ուժեղ է, վարքի փոփոխությունը երկար է տևում կամ կենդանին չի վերադառնում իր սովորական ռիթմին, դիմի՛ր անասնաբույժի կամ կենդանու վարքի որակավորված մասնագետի։"],
    ] },
    ru: { title: "Как помочь питомцу, когда дома гости", description: "Пять простых шагов, которые дают питомцу выбор и спокойное место, когда к вам приходят гости.", sections: [
      ["Почему важен выбор", "Звонок в дверь, незнакомые голоса, новые запахи и активное движение меняют привычную обстановку питомца. Задача не в том, чтобы заставить его общаться. Лучше дать ему выбор: подойти, отойти или отдохнуть в безопасном месте."],
      ["1. Заранее подготовьте тихое место", "Выберите спокойную часть дома и положите туда знакомую лежанку или плед, поставьте воду и любимую игрушку. Кошке пригодится высокая полка или открытая коробка, откуда можно наблюдать за комнатой. Место собаки лучше расположить подальше от прохода."],
      ["2. Сделайте момент прихода спокойнее", "Попросите гостей войти без громких приветствий и не окружать питомца. Если звонок в дверь его пугает, до открытия двери дайте ему возможность уйти в подготовленное место. Не перекрывайте путь к нему."],
      ["3. Объясните гостям одно правило", "Пусть питомец сам сделает первый шаг. Не нужно звать его, пристально смотреть, брать на руки или идти следом, если он отходит. Спокойно сидящий человек, слегка повернувшийся боком, обычно выглядит менее настойчиво. Общение детей с питомцем всегда контролируйте."],
      ["4. Сохраните привычный ритм дня", "По возможности не меняйте обычное время кормления, прогулки и отдыха. Знакомый распорядок помогает питомцу понять, что визит гостей не изменил весь день. Не переносите миски в шумную часть комнаты."],
      ["5. Уважайте выбор питомца", "Если питомец прячется или уходит, не выводите его только ради знакомства. Если он подошёл сам, пусть контакт будет коротким и спокойным. Для одного питомца удачный визит — это общение, а для другого — возможность спокойно оставаться в выбранном месте."],
      ["Когда обратиться к специалисту", "Если страх очень сильный, изменения поведения сохраняются долго или питомец не возвращается к привычному ритму, обратитесь к ветеринарному врачу или квалифицированному специалисту по поведению животных."],
    ] },
    en: { title: "How to help your pet when guests visit", description: "Five simple steps that give your pet choice and a calm retreat when guests visit.", sections: [
      ["Why choice matters", "A doorbell, unfamiliar voices, new scents and extra movement can quickly change your pet's familiar environment. The goal is not to make them socialise. It is more helpful to give them a choice: approach, move away or rest in a safe place."],
      ["1. Prepare a quiet retreat in advance", "Choose a calm area and add your pet's familiar bed or blanket, water and a favourite toy. A cat may appreciate a high perch or open box where they can observe without becoming the centre of attention. Keep a dog's resting place away from busy walkways."],
      ["2. Keep arrivals calm", "Ask guests to enter without loud greetings and not gather around your pet. If the doorbell is difficult for your pet, give them time to move to their retreat before opening the door. Keep the route to that space clear."],
      ["3. Give guests one simple rule", "Let the pet make the first move. Guests should not call, stare, pick up or follow an animal that moves away. Sitting calmly and turning slightly sideways is usually less pressuring than approaching directly. Always supervise interactions between children and pets."],
      ["4. Preserve the usual routine", "When possible, keep normal feeding, walking and rest times. A familiar routine helps communicate that a visit has not changed the entire day. Do not move food and water into the busiest part of the room."],
      ["5. Respect your pet's choice", "If your pet hides or leaves, do not bring them out just for an introduction. If they approach voluntarily, keep the interaction brief and calm. Sometimes success simply means your pet can remain relaxed in their chosen space."],
      ["When to seek help", "If fear is intense, behaviour changes persist or your pet does not return to their usual routine, contact a veterinarian or qualified animal behaviour professional."],
    ] },
  },
  "help-pet-adjust-to-changed-daily-routine": {
    image: "/learn-help-pet-adjust-to-changed-daily-routine.jpg",
    hy: { title: "Ինչպես օգնել կենդանուն հարմարվել փոխված օրվա ռեժիմին", description: "Հինգ պարզ քայլ՝ փոխված գրաֆիկի ընթացքում կենդանու համար ծանոթ վայրերն ու հանգիստ պահերը պահպանելու համար։", sections: [
      ["1․ Նշիր՝ ինչն է փոխվում", "Գրիր՝ ով է այդ օրը հոգալու սնունդը, ջուրը, զբոսանքը կամ խաղը։ Եթե խնամքը փոխանցվում է մեկ ուրիշին, համաձայնեցրեք նույն պարզ հերթականությունը։"],
      ["2․ Պահիր ծանոթ միջավայրը", "Ջրի ամանը, հանգստի վայրը և սիրելի իրերը թող մնան հասանելի։ Կատվի համար մի փոխիր զուգարանի տեղը միայն նոր գրաֆիկի պատճառով. շան համար նախապես կազմակերպիր զբոսանքի պատասխանատուին։"],
      ["3․ Ժամերը փոխիր փոքր քայլերով", "Եթե կերակրման, զբոսանքի կամ խաղի ժամը պիտի փոխվի, հնարավորության դեպքում անցիր նոր ժամանակացույցին աստիճանաբար՝ պահպանելով կենդանու անհրաժեշտ խնամքը։ Մի փորձիր բոլոր սովորությունները փոխել նույն օրը։"],
      ["4․ Թող լինի մեկ հանգիստ, ծանոթ պահ", "Կարճ խաղը կամ հանգիստ շփումը կարող են պահպանել ծանոթ կապը։ Թող կենդանին նաև հանգստանալու ընտրություն ունենա. մի ստիպիր շփվել կամ խաղալ։"],
      ["5․ Դիտիր և հարմարեցրու", "Նկատիր՝ ինչն է օգնում, և փոխանցիր դիտարկումները խնամքին մասնակցող մարդկանց։ Եթե վարքի փոփոխությունը շարունակվում է կամ առողջության նշաններ են անհանգստացնում, դիմիր անասնաբույժի։"],
    ] },
    ru: { title: "Как помочь питомцу привыкнуть к изменившемуся распорядку", description: "Пять простых шагов, чтобы сохранить знакомые места и спокойные моменты, когда домашний график меняется.", sections: [
      ["1. Уточните, что меняется", "Заранее договоритесь, кто отвечает за еду, воду, прогулку и спокойное общение. Если уход переходит другому человеку, согласуйте простой порядок действий."],
      ["2. Сохраните знакомую обстановку", "Оставьте доступными воду, место отдыха и любимые предметы. Не переносите кошачий лоток только из-за нового расписания; для собаки заранее определите ответственного за прогулку."],
      ["3. Меняйте время небольшими шагами", "Если возможно, сдвигайте кормление, прогулку или игру постепенно, не пропуская необходимый уход. Не меняйте все привычки в один день."],
      ["4. Оставьте один спокойный знакомый момент", "Короткая игра или тихое общение могут сохранить знакомый ритм, если питомец сам готов. Не навязывайте контакт."],
      ["5. Наблюдайте и корректируйте", "Делитесь наблюдениями со всеми, кто помогает ухаживать. Если изменения поведения сохраняются или появились тревожные признаки здоровья, обратитесь к ветеринару."],
    ] },
    en: { title: "Helping a pet adjust to a changed daily routine", description: "Five simple steps for keeping familiar places and calm moments when a household schedule changes.", sections: [
      ["1. Name what is changing", "Agree who will handle food, water, walks, and calm interaction each day. If care is handed to someone else, share the same simple sequence."],
      ["2. Keep familiar places available", "Preserve access to water, a resting spot, and favorite belongings. Do not move a cat’s litter box solely because your schedule changed; arrange a dog’s walk caregiver in advance."],
      ["3. Shift timing in small steps", "When possible, move meals, walks, or play gradually while maintaining necessary care. Avoid changing every habit on the same day."],
      ["4. Keep one calm, familiar moment", "A short game or quiet time together can preserve a familiar rhythm if your pet chooses to engage. Do not force interaction."],
      ["5. Observe and adjust", "Share observations with everyone involved in care. Contact a veterinarian if a behavior change persists or a health sign worries you."],
    ] },
  },
  "moving-home-with-a-pet": {
    image: "/learn-moving-home-with-a-pet.jpg",
    hy: { title: "Տեղափոխություն կենդանու հետ․ ինչպես պատրաստել ավելի հանգիստ առաջին օրը", description: "Գործնական քայլեր՝ առաջին օրվա պայուսակը, անվտանգ տեղափոխումը և նոր տան հանգիստ տարածքը նախապես պատրաստելու համար։", sections: [
      ["Ինչ պլանավորել նախապես", "Տեղափոխման օրը փոխվում են ձայները, հոտերը, մարդկանց շարժն ու կենդանու սովորական ռիթմը։ Նախապես որոշիր՝ որտեղ է կենդանին լինելու տեղափոխման պահին, ինչ է պետք առաջին ժամերին և որտեղից է սկսվելու նոր տան ուսումնասիրությունը։"],
      ["1․ Ընտրի՛ր անվտանգ տարածք երկու տներում", "Դեռ մինչև արկղերը հավաքելը որոշիր մեկ հանգիստ սենյակ հին տանը և մեկ սենյակ՝ նոր տանը։ Այնտեղ դիր ծանոթ մահճակալը կամ ծածկոցը, ջուրը և անհրաժեշտ պարագաները։ Տեղափոխողներին ու ընտանիքի անդամներին պարզ ասա, որ այդ դուռը պետք է փակ մնա։"],
      ["2․ Առանձին պատրաստի՛ր առաջին օրվա պայուսակը", "Առանձին պայուսակում պահիր ջուրը, սնունդը, ամանները, վզկապը կամ ամուր փոխադրիչը, մաքրման պարագաները, ծանոթ խաղալիքը կամ ծածկոցը և անհրաժեշտ փաստաթղթերը։ Եթե կենդանին ստանում է մասնագետի նշանակած դեղ, պահիր այն իր հաստատված ցուցման հետ միասին։"],
      ["3․ Տեղափոխման պահին ունեցի՛ր մեկ պատասխանատու", "Կենդանին թող մնա փակ, հանգիստ տարածքում կամ վստահելի խնամողի հետ, մինչև բաց դռների և մարդկանց ակտիվ շարժի փուլն ավարտվի։ Մեքենայում օգտագործիր կենդանու համար նախատեսված ամուր փոխադրիչ կամ անվտանգ ամրացման տարբերակ։ Կենդանուն երբեք մի՛ թող փակ մեքենայում առանց վերահսկողության։"],
      ["4․ Ճանապարհը պլանավորի՛ր կենդանուդ համար", "Նախապես մտածիր ջրի, հանգստի և անհրաժեշտ կանգառների մասին։ Շանը կանգառների ժամանակ պահիր վզկապով և մեքենաների շարժից հեռու։ Կատվի փոխադրիչը բացիր միայն փակ, անվտանգ տարածքում։ Եթե կենդանին դժվար է տանում ճանապարհը կամ ունի հատուկ խնամքի կարիք, նախապես խորհրդակցիր անասնաբույժի հետ։"],
      ["5․ Նոր տանը սկսի՛ր մեկ հանգիստ սենյակից", "Մինչև կենդանուն ներս բերելը պատրաստիր ընտրված սենյակը։ Սկզբում մի՛ բացիր ամբողջ տունը․ թող կենդանին իր արագությամբ ծանոթանա տարածքին և միշտ կարողանա վերադառնալ հանգիստ անկյուն։ Կատվի համար ավելացրու թաքստոց և բարձր տեղ, շան համար՝ անցուդարձից հեռու հանգստի տեղ։"],
      ["6․ Առաջին օրերին պահպանի՛ր ծանոթ ռիթմը", "Հնարավորության դեպքում պահպանիր կերակրման, զբոսանքի, խաղի և հանգստի սովորական ժամերը։ Մի՛ փոխիր միաժամանակ սնունդը, քնի տեղը և առօրյայի բոլոր կանոնները։ Ծանոթ իրերը և կանխատեսելի ռիթմը նոր միջավայրը դարձնում են ավելի հասկանալի։"],
      ["7․ Թարմացրո՛ւ կարևոր տվյալները", "Եթե հասցեն կամ հեռախոսահամարը փոխվել է, թարմացրու կենդանու նույնականացման տվյալները։ Պահիր քո սովորական անասնաբույժի և նոր տարածքին մոտ հաստատության ստուգված կոնտակտները։ Անձնական տվյալներն ու փաստաթղթերը մի՛ հրապարակիր բաց Story-ում կամ հանրային հղումով։"],
    ] },
    ru: { title: "Переезд с питомцем: как подготовить более спокойный первый день", description: "Практические шаги: заранее собрать сумку первого дня, организовать безопасный переезд и подготовить тихое место в новом доме.", sections: [
      ["Что спланировать заранее", "В день переезда меняются звуки, запахи, движение людей и привычный распорядок питомца. Заранее решите, где питомец будет находиться во время переезда, что понадобится ему в первые часы и с какого пространства начнётся знакомство с новым домом."],
      ["1. Подготовьте безопасное место в обоих домах", "До активной упаковки выберите тихую комнату в старом доме и одну — в новом. Положите туда знакомую лежанку или плед, поставьте воду и необходимые принадлежности. Предупредите семью и людей, помогающих с переездом, что дверь должна оставаться закрытой."],
      ["2. Отдельно соберите сумку первого дня", "Держите под рукой воду, корм, миски, поводок или прочную переноску, средства для уборки, знакомую игрушку или плед и необходимые документы. Если питомец получает назначенный специалистом препарат, положите его вместе с подтверждённой инструкцией."],
      ["3. Назначьте одного ответственного человека", "Во время открытых дверей и активного движения питомец должен находиться в закрытом тихом помещении или с доверенным человеком. Для поездки используйте подходящую прочную переноску или безопасное крепление. Никогда не оставляйте питомца без присмотра в закрытом автомобиле."],
      ["4. Спланируйте дорогу с учётом питомца", "Заранее продумайте воду, отдых и необходимые остановки. Собаку на остановках держите на поводке вдали от движения машин. Переноску кошки открывайте только в закрытом безопасном помещении. Если питомец тяжело переносит дорогу или нуждается в особом уходе, заранее обсудите поездку с ветеринарным врачом."],
      ["5. В новом доме начните с одной тихой комнаты", "Подготовьте её до приезда питомца. Не открывайте сразу весь дом: пусть животное осваивает пространство в своём темпе и может вернуться в тихое место. Кошке добавьте укрытие и высокую точку, собаке — лежанку вдали от прохода."],
      ["6. В первые дни сохраните привычный ритм", "По возможности придерживайтесь обычного времени кормления, прогулок, игр и отдыха. Не меняйте одновременно корм, место сна и все правила распорядка. Знакомые вещи и предсказуемый ритм делают новую обстановку понятнее."],
      ["7. Обновите важные данные", "Если адрес или телефон изменились, обновите сведения, связанные с идентификацией питомца. Сохраните проверенные контакты привычного ветеринарного врача и клиники рядом с новым домом. Не публикуйте личные данные и документы в открытых Stories или по публичной ссылке."],
    ] },
    en: { title: "Moving home with a pet: planning a calmer first day", description: "Practical steps for packing a first-day bag, managing the move safely and preparing a quiet space in the new home.", sections: [
      ["What to plan in advance", "Moving day changes familiar sounds, scents, people’s movement and the normal routine. Decide in advance where your pet will stay during the busiest part of the move, what they will need in the first few hours and which space they will explore first in the new home."],
      ["1. Choose a safe space in both homes", "Before heavy packing begins, choose one quiet room in the current home and one in the new home. Add a familiar bed or blanket, water and essential supplies. Tell family members and movers clearly that this door must remain closed."],
      ["2. Pack a separate first-day bag", "Keep water, food, bowls, a lead or secure carrier, cleaning supplies, a familiar toy or blanket and necessary documents together. If your pet takes professionally prescribed medication, keep it with the confirmed instructions."],
      ["3. Give one person clear responsibility", "While doors are open and people are moving in and out, keep your pet in the closed quiet room or with a trusted caregiver. Use a sturdy species-appropriate carrier or secure restraint for transport. Never leave a pet unattended in a closed vehicle."],
      ["4. Plan the journey around your pet", "Think ahead about water, rest and necessary stops. Keep dogs on lead and away from moving traffic during breaks. Open a cat carrier only inside a closed, secure space. If your pet struggles with travel or has specific care needs, ask your veterinarian for advice before the journey."],
      ["5. Start with one quiet room in the new home", "Set it up before your pet arrives. Do not open the whole home immediately; let your pet explore at their own pace and keep access to the quiet retreat. Add a hiding place and elevated option for a cat, and a resting place away from busy walkways for a dog."],
      ["6. Keep the familiar rhythm for the first few days", "When possible, keep usual feeding, walking, play and rest times. Avoid changing food, sleeping arrangements and every household rule at once. Familiar belongings and a predictable rhythm make the new environment easier to understand."],
      ["7. Update essential details", "If your address or phone number changed, update the details linked to your pet’s identification. Keep verified contact details for your usual veterinarian and a practice near the new home. Do not publish personal details or documents in a public Story or open link."],
    ] },
  },
} as const;

type Slug = keyof typeof articleBase;
const articles = Object.fromEntries(
  (Object.keys(articleBase) as Slug[]).map((slug) => [slug, { ...articleBase[slug], fa: persianArticles[slug] }]),
) as unknown as { [K in Slug]: typeof articleBase[K] & { fa: Copy } };
const validLang = (value: string | undefined): value is Lang => value === "hy" || value === "ru" || value === "en" || value === "fa";

export function generateStaticParams() { return Object.keys(articles).map((slug) => ({ slug })); }

export async function generateMetadata({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ lang?: string }> }): Promise<Metadata> {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const record = articles[slug as Slug];
  const requestedLang = typeof query.lang === "string" ? query.lang : undefined;
  const requested: Lang = validLang(requestedLang) ? requestedLang : "hy";
  if (!record) {
    const post = await loadPublishedPost(slug, requested);
    if (!post) return {};
    const postLocale = post.language === "hy" ? "hy_AM" : post.language === "ru" ? "ru_RU" : post.language === "fa" ? "fa_IR" : "en_US";
    const postUrl = localePath(post.language, `/learn/${slug}`);
    return { title: `${post.title} | BuddyLife Armenia`, description: post.excerpt, alternates: { canonical: postUrl }, openGraph: { title: post.title, description: post.excerpt, type: "article", locale: postLocale, url: postUrl, images: [{ url: post.coverUrl || "/og.webp" }] }, twitter: { card: "summary_large_image", title: post.title, description: post.excerpt } };
  }
  const lang = requested;
  const article: Copy = record[lang];
  const locale = lang === "hy" ? "hy_AM" : lang === "ru" ? "ru_RU" : lang === "fa" ? "fa_IR" : "en_US";
  return { title: `${article.title} | BuddyLife Armenia`, description: article.description, alternates: { canonical: localePath(lang, `/learn/${slug}`), languages: localeAlternates(`/learn/${slug}`) }, openGraph: { title: article.title, description: article.description, type: "article", locale, url: localePath(lang, `/learn/${slug}`) }, twitter: { card: "summary_large_image", title: article.title, description: article.description } };
}

export default async function LearnArticle({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const record = articles[slug as Slug];
  const requestedLang = typeof query.lang === "string" ? query.lang : undefined;
  const requested: Lang = validLang(requestedLang) ? requestedLang : "hy";
  if (!record) {
    const post = await loadPublishedPost(slug, requested);
    if (!post) notFound();
    return <CmsArticle slug={slug} post={post} query={query} />;
  }
  const lang = requested;
  const article: Copy = record[lang];
  const labels = ui[lang];
  const joinParams = new URLSearchParams({ join: "parent" });
  for (const key of ["utm_source", "utm_medium", "utm_campaign", "utm_content"]) {
    const value = query[key];
    if (typeof value === "string" && value) joinParams.set(key, value);
  }
  joinParams.set("origin", `learn_${slug}`);
  const localizedUrl = localeUrl(lang, `/learn/${slug}`);
  const publicationDate = articlePublished(slug);
  const schema = { "@context": "https://schema.org", "@type": "Article", headline: article.title, description: article.description, image: `https://buddylife.am${record.image}`, inLanguage: lang, author: { "@type": "Organization", name: "BuddyLife Armenia" }, publisher: { "@id": "https://buddylife.am/#organization" }, mainEntityOfPage: localizedUrl, datePublished: publicationDate, dateModified: publicationDate, isAccessibleForFree: true };
  return <><ArticleHeader lang={lang} slug={slug} /><main className="articlePage" id="main-content" lang={lang} dir={lang === "fa" ? "rtl" : "ltr"}>
    <ArticleViewTracker slug={slug} language={lang} />
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }} />
    <article className="articleShell">
      <Link className="articleBack" href={localePath(lang, "/learn")}>← {labels.back}</Link>
      <p className="eyebrow">{labels.eyebrow}</p><h1>{article.title}</h1><p className="articleDeck">{article.description}</p>
      <Image className="articleHero" src={record.image} alt={article.title} width={1200} height={800} priority />
      <div className="articleBody">{article.sections.map(([heading, body]) => <section key={heading}><h2>{heading}</h2><p>{body}</p></section>)}<p className="articleDisclaimer">{labels.disclaimer}</p></div>
      <section className="articleConversionCta" aria-labelledby="article-join-title">
        <div><p className="eyebrow">{labels.ctaEyebrow}</p><h2 id="article-join-title">{labels.ctaTitle}</h2><p>{labels.ctaBody}</p></div>
        <Link className="button" href={localePath(lang, `/?${joinParams.toString()}`)}>{labels.cta}</Link>
      </section>
      <ArticleShare title={article.title} url={localizedUrl} lang={lang} />
    </article>
  </main></>;
}

type CmsPost = NonNullable<Awaited<ReturnType<typeof loadPublishedPost>>>;

function CmsArticle({ slug, post, query }: { slug: string; post: CmsPost; query: Record<string, string | string[] | undefined> }) {
  const lang = post.language;
  const labels = ui[lang];
  const joinParams = new URLSearchParams({ join: "parent" });
  for (const key of ["utm_source", "utm_medium", "utm_campaign", "utm_content"]) {
    const value = query[key];
    if (typeof value === "string" && value) joinParams.set(key, value);
  }
  joinParams.set("origin", `learn_${slug}`);
  const localizedUrl = localeUrl(lang, `/learn/${slug}`);
  const publishedAt = post.publishAt || post.createdAt;
  const image = post.coverUrl || "/og.webp";
  const schema = { "@context": "https://schema.org", "@type": "Article", headline: post.title, description: post.excerpt, image: `https://buddylife.am${image}`, inLanguage: lang, author: { "@type": "Organization", name: "BuddyLife Armenia" }, publisher: { "@id": "https://buddylife.am/#organization" }, mainEntityOfPage: localizedUrl, datePublished: publishedAt, dateModified: post.updatedAt || publishedAt, isAccessibleForFree: true };
  const blocks = renderBody(post.body);
  return <><ArticleHeader lang={lang} slug={slug} /><main className="articlePage" id="main-content" lang={lang} dir={lang === "fa" ? "rtl" : "ltr"}>
    <ArticleViewTracker slug={slug} language={lang} />
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }} />
    <article className="articleShell">
      <Link className="articleBack" href={localePath(lang, "/learn")}>← {labels.back}</Link>
      <p className="eyebrow">{post.category || labels.eyebrow}</p><h1>{post.title}</h1>{post.excerpt && <p className="articleDeck">{post.excerpt}</p>}
      <Image className="articleHero" src={image} alt={post.title} width={1200} height={800} priority unoptimized={image.startsWith("/media/")} />
      <div className="articleBody">
        {blocks.map((block, index) => block.type === "heading" ? <h2 key={index}>{block.text}</h2> : block.type === "list" ? <ul key={index}>{block.items.map((item, itemIndex) => <li key={itemIndex}>{item}</li>)}</ul> : <p key={index}>{block.text}</p>)}
        <p className="articleDisclaimer">{labels.disclaimer}</p>
      </div>
      <section className="articleConversionCta" aria-labelledby="article-join-title">
        <div><p className="eyebrow">{labels.ctaEyebrow}</p><h2 id="article-join-title">{labels.ctaTitle}</h2><p>{labels.ctaBody}</p></div>
        <Link className="button" href={localePath(lang, `/?${joinParams.toString()}`)}>{labels.cta}</Link>
      </section>
      <ArticleShare title={post.title} url={localizedUrl} lang={lang} />
    </article>
  </main></>;
}
