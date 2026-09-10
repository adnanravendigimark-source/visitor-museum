import { permanentRedirect } from "next/navigation";

// A pure redirect with no data dependency — nothing here needs to be
// dynamic at all, let alone forced fresh on every request.
export default async function BlogSlugPage({
  params,
}: {
  params: { slug: string };
}) {
  permanentRedirect(`/${params.slug}`);
}
