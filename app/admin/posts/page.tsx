import PostsClient from "./posts-client";

export const dynamic = "force-dynamic";
export const metadata = { title: "Posts | BuddyLife CMS", robots: { index: false, follow: false } };

export default function PostsPage() {
  return <PostsClient />;
}
