import BuddyPage from "./site";
import { localizedMetadata, resolveLanguage } from "./language";
import { loadPublicPosts } from "../lib/posts-store";
type PageProps = { searchParams: Promise<{ lang?: string | string[] }> };
export async function generateMetadata({ searchParams }: PageProps) {
  const lang = resolveLanguage((await searchParams).lang);
  return localizedMetadata("home", lang);
}
export default async function Home({ searchParams }: PageProps) {
  const [{ lang: requested }, posts] = await Promise.all([searchParams, loadPublicPosts()]);
  const lang = resolveLanguage(requested);
  return <BuddyPage view="home" initialLang={lang} posts={posts} />;
}
