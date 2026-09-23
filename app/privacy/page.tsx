import BuddyPage from "../site";
import { localizedMetadata, resolveLanguage } from "../language";
type PageProps = { searchParams: Promise<{ lang?: string | string[] }> };
export async function generateMetadata({ searchParams }: PageProps) {
  const lang = resolveLanguage((await searchParams).lang);
  return localizedMetadata("privacy", lang);
}
export default async function Privacy({ searchParams }: PageProps) {
  const lang = resolveLanguage((await searchParams).lang);
  return <BuddyPage view="privacy" initialLang={lang} />;
}
