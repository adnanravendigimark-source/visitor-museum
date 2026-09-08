import { getContactPage } from "@/lib/contact";
import ContactForm from "@/components/admin/ContactForm";

export const dynamic = "force-dynamic";

export default async function AdminContactPage() {
  const contact = await getContactPage();

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-stone-900">Contact Page</h1>
      <p className="mt-1 text-sm text-stone-600">
        Every section of /contact — hero, email, help cards, and SEO — edited here.
      </p>
      <div className="mt-8 max-w-3xl">
        <ContactForm initial={contact} />
      </div>
    </div>
  );
}
