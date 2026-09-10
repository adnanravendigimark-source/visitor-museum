// ⚠️ SUPERSEDED — do not run this anymore.
//
// This script strips museum links OUT of the header's saved nav links, back
// to when Header.tsx auto-generated them from "Featured" museums. That's no
// longer how the header works: museum ticket links are now plain, editable
// entries in header_json.navLinks (see scripts/seed-header-museum-links.mjs
// instead). Running this script today would delete those entries.
//
// Kept only for history. Original comment below.
//
// One-time cleanup for the header's saved nav links.
//
// The header's 4 museum ticket links used to be a manually-curated list
// (admin: Homepage -> Navbar -> "Nav links") that this same script kept in
// sync by re-writing it from the site's current *featured* museums. That
// meant the header could quietly go stale between runs — e.g. it used to
// hardcode exactly the museums the site launched with, so when more
// museums were added and marked "Featured" later, the header kept showing
// the original set while the homepage grid (which reads the "Featured"
// flag live, every request) moved on.
//
// Header.tsx no longer stores museum links at all — it computes the top 4
// featured museums itself, live, on every request. So this script now only
// has one job: strip any leftover museum entries (and the old "Contact"
// entry, which is no longer shown in the header) out of the saved
// header_json, leaving just the non-museum links (About Us, Blog, or
// anything else you've added) that Header.tsx layers in after the 4
// dynamic museum links.
//
// Run it once to clean up old saved data:
//   node scripts/sync-header-links.mjs
//
// Safe to run again any time — it's idempotent.

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

  const museums = await sql`SELECT slug FROM museums`;
  const museumHrefs = new Set(museums.map((m) => `/${m.slug}`));

  const rows = await sql`SELECT header_json FROM homepage WHERE id = 1 LIMIT 1`;
  const header = rows[0]?.header_json || {};
  const before = Array.isArray(header.navLinks) ? header.navLinks : [];

  const navLinks = before.filter(
    (l) => l && !museumHrefs.has(l.href) && l.href !== "/contact" && l.href !== "/"
  );

  // If nothing is left (e.g. the header had never been customized), fall
  // back to the same default Header.tsx itself would use.
  const finalLinks = navLinks.length
    ? navLinks
    : [
        { label: "About Us", href: "/about" },
        { label: "Blog", href: "/blog" },
      ];

  header.navLinks = finalLinks;

  await sql`
    INSERT INTO homepage (id, header_json) VALUES (1, ${JSON.stringify(header)}::jsonb)
    ON CONFLICT (id) DO UPDATE SET header_json = EXCLUDED.header_json
  `;

  const removed = before.length - finalLinks.length;
  console.log(`Removed ${removed} stale/museum/contact/home entr${removed === 1 ? "y" : "ies"} from the header's saved nav links.`);
  console.log("Remaining non-museum links in the header:");
  for (const link of finalLinks) console.log(`  - ${link.label}  ->  ${link.href}`);
  console.log("\nThe 4 museum ticket links now come automatically from whichever museums are marked \"Featured\" — nothing to sync there anymore.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
