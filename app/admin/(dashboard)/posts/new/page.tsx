import PostForm from "@/components/admin/PostForm";
import { getAllTours } from "@/lib/museums";
import type { Post } from "@/lib/posts";

export const dynamic = "force-dynamic";

export default async function NewPostPage() {
  const tours = await getAllTours();

  const today = new Date().toISOString().slice(0, 10);
  const blank: Post = {
    slug: "",
    title: "",
    metaTitle: "",
    metaDescription: "",
    category: "",
    excerpt: "",
    quickAnswer: "",
    readTime: "",
    date: today,
    updatedAt: today,
    image: "",
    imageAlt: "",
    author: "",
    recommendedTourId: "",
    recommendedTourAfterBlock: 0,
    content: "",
    ctaHeading: "Ready to plan your museum visit?",
    ctaBody: "Compare skip-the-line tickets, guided tours, and combo passes for top museums and attractions.",
    ctaButtonText: "Browse Museum Tickets",
    ctaButtonHref: "/",
    focusKeyword: "",
    noIndex: false,
    noFollow: false,
    canonicalUrl: "",
    ogTitle: "",
    ogDescription: "",
    ogImage: "",
  };

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-stone-900">New Post</h1>
      <p className="mt-1 text-sm text-stone-600">Fill in the basics, then write the article section by section.</p>
      <div className="mt-8 max-w-7xl">
        <PostForm initial={blank} isNew tours={tours} />
      </div>
    </div>
  );
}
