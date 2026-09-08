// Syncs the header's nav links to the site's current *featured* museums,
// plus the standard utility links (About, Blog, Contact).
//
// Why this exists: the header's nav links (admin: Homepage -> Navbar ->
// "Nav links") are a manually-curated list, edited independently from the
// Museums admin. That's normal for a handful of links, but it means the
// header can quietly go stale — e.g. this script used to hardcode exactly
// the 4 museums the site launched with, so when more museums were added
// and marked "Featured" later, the header kept showing the original 4
// while the homepage grid (which reads the "Featured" flag live) moved on
// to 6. Nothing kept them in sync.
//
// Run it any time the header should be brought back in line with which
// museums are currently featured:
//   node scripts/sync-header-links.mjs
//
// This is a one-off convenience tool, not something to run automatically
// on every deploy — if you've manually customized the header's nav links
// in the admin (different labels, a different order, extra links), running
// this will overwrite that customization with the auto-generated list
// below. Prefer editing Admin -> Homepage -> Navbar directly for anything
// beyond "just match the featured museums."

import fs from "fs";
import path from "path";
import { neon } from "@neondatabase/serverless";

function loadDotEnv() {
  const envPath = path.join(process.cwd(), ".env");
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, "utf-8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf("=");
    if (idx === -1) continue;
    const key = trimmed.slice(0, idx).trim();
    let value = trimmed.slice(idx + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = value;
  }
}

loadDotEnv();

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL is not set. Add it to your .env file, then re-run.");
    process.exit(1);
  }
  const sql = neon(process.env.DATABASE_URL);

  const museums = await sql`
    SELECT name, slug FROM museums WHERE featured = true ORDER BY sort_order ASC, name ASC
  `;

  if (!museums.length) {
    console.log("No museums are marked \"Featured\" — nothing to sync. Mark museums as Featured in the admin first.");
    return;
  }

  const navLinks = [
    ...museums.map((m) => ({ label: m.name, href: `/${m.slug}` })),
    { label: "About Us", href: "/about" },
    { label: "Blog", href: "/blog" },
    { label: "Contact", href: "/contact" },
  ];

  const rows = await sql`SELECT header_json FROM homepage WHERE id = 1 LIMIT 1`;
  const header = rows[0]?.header_json || {};
  header.navLinks = navLinks;

  await sql`
    INSERT INTO homepage (id, header_json) VALUES (1, ${JSON.stringify(header)}::jsonb)
    ON CONFLICT (id) DO UPDATE SET header_json = EXCLUDED.header_json
  `;

  console.log(`Updated the header's nav links to match ${museums.length} featured museum(s), plus About/Blog/Contact:`);
  for (const link of navLinks) console.log(`  - ${link.label}  ->  ${link.href}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
