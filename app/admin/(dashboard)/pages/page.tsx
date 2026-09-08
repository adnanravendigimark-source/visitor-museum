import { getBlogSeoSettings } from "@/lib/settings";
import BlogSeoForm from "@/components/admin/BlogSeoForm";

export const dynamic = "force-dynamic";

export default async function AdminBlogSeoPage() {
  const settings = await getBlogSeoSettings();

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-stone-900">Blog Page SEO</h1>
      <p className="mt-1 text-sm text-stone-600">
        The Blog listing page (/blog) has no dedicated content editor — its body is generated
        automatically from your published posts — but every SEO field for the page itself is
        editable here. About and Contact now have their own full editors under Pages.
      </p>
      <div className="mt-8 max-w-2xl">
        <BlogSeoForm initial={settings} />
      </div>
    </div>
  );
}
