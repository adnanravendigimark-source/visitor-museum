import { getPrivacyPolicy } from "@/lib/legal";
import PrivacyPolicyForm from "@/components/admin/PrivacyPolicyForm";

export const dynamic = "force-dynamic";

export default async function AdminPrivacyPolicyPage() {
  const policy = await getPrivacyPolicy();

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-stone-900">Privacy Policy</h1>
      <p className="mt-1 text-sm text-stone-600">
        Shown at /privacy-policy, linked from the footer. This is a general starting template, not
        legal advice — have a lawyer review it before relying on it, especially for GDPR/CCPA.
      </p>
      <div className="mt-8 max-w-3xl">
        <PrivacyPolicyForm initial={policy} />
      </div>
    </div>
  );
}
