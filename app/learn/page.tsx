import BuddyPage from "../site";
import { localizedMetadata, resolveLanguage } from "../language";
type PageProps = { searchParams: Promise<{ lang?: string | string[] }> };
export async function generateMetadata({ searchParams }: PageProps) {
  const lang = resolveLanguage((await searchParams).lang);
  return localizedMetadata("learn", lang);
}
export default async function Learn({ searchParams }: PageProps) {
  const lang = resolveLanguage((await searchParams).lang);
  return <BuddyPage view="learn" initialLang={lang} />;
}
