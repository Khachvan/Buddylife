import BuddyPage from "./site";
import { localizedMetadata, resolveLanguage } from "./language";
type PageProps = { searchParams: Promise<{ lang?: string | string[] }> };
export async function generateMetadata({ searchParams }: PageProps) {
  const lang = resolveLanguage((await searchParams).lang);
  return localizedMetadata("home", lang);
}
export default async function Home({ searchParams }: PageProps) {
  const lang = resolveLanguage((await searchParams).lang);
  return <BuddyPage view="home" initialLang={lang} />;
}
