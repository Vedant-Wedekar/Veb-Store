import { type ReactNode } from "react";

function LegalLayout({ title, updated, children }: { title: string; updated: string; children: ReactNode }) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-extrabold text-ink">{title}</h1>
      <p className="mt-1 text-sm text-ink/40">Last updated: {updated}</p>
      <div className="mt-4 rounded-xl border border-brand-orange/20 bg-brand-orange/5 px-4 py-3 text-sm text-brand-orange">
        This is a starter template, not legal advice. Review and customize it with a qualified professional before real commercial launch.
      </div>
      <div className="prose prose-sm mt-8 max-w-none space-y-5 text-sm leading-relaxed text-ink/65">{children}</div>
    </div>
  );
}

export function Privacy() {
  return (
    <LegalLayout title="Privacy Policy" updated="2026">
      <p>WebStore collects the information you provide when creating an account and publishing products: your name, username, email, and any profile or product details you choose to add.</p>
      <p>We use Firebase Authentication and Cloud Firestore to store your account and product data. Media (logos, screenshots) is referenced by URL only — WebStore does not host or store your media files.</p>
      <p>We track basic, non-invasive analytics: product views and website-click counts, used to power your dashboard and the platform's discovery features. We do not sell personal data to third parties.</p>
      <p>You may request deletion of your account and associated data at any time by contacting the platform administrator.</p>
    </LegalLayout>
  );
}

export function Terms() {
  return (
    <LegalLayout title="Terms of Service" updated="2026">
      <p>By using WebStore, you agree to publish only products and content you have the right to share, and to keep listed information accurate.</p>
      <p>WebStore is a discovery platform. We do not verify the safety, security, or legality of externally linked websites. Use judgment before visiting external links, and use the report feature if you encounter something concerning.</p>
      <p>Accounts found to be publishing spam, malicious links, or abusive content may be suspended.</p>
      <p>The service is provided "as is" without warranties of any kind.</p>
    </LegalLayout>
  );
}

export function Guidelines() {
  return (
    <LegalLayout title="Community Guidelines" updated="2026">
      <ul className="list-disc space-y-2 pl-5">
        <li>Publish products you actually built or are meaningfully involved in.</li>
        <li>Keep descriptions, screenshots, and links accurate and up to date.</li>
        <li>Be respectful in reviews — critique the product, not the person.</li>
        <li>No spam, malware, phishing, or deceptive links.</li>
        <li>Report content that violates these guidelines using the Report button.</li>
      </ul>
    </LegalLayout>
  );
}
