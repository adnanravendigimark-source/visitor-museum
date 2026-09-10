// One-time seed for the header's saved nav links.
//
// The header's 4 museum ticket links used to be computed live on every
// request from whichever museums are marked "Featured" (Header.tsx), with
// no way to edit them directly. That's changed: they're now just plain
// entries in the same "Nav links" list as About Us/Blog (admin: Homepage ->
// Navbar -> "Nav links"), editable the same way.
//
// Header.tsx no longer auto-generates anything, so on its own this change
// would make the header's museum ticket links disappear until an admin
// manually re-adds them. This script prepends the site's *current* top 4
// featured museums (same selection Header.tsx used to compute) into the
// saved header_json.navLinks, so the header keeps showing exactly what it
// shows today, now as editable entries in the admin.
//
// Run it once after deploying this change:
//   node scripts/seed-header-museum-links.mjs
//
// Safe to run again — it skips any museum link that's already present.

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

  const museums = await sql`SELECT slug, name, featured FROM museums ORDER BY sort_order ASC, name ASC`;
  const featured = museums.filter((m) => m.featured);
  const spotlight = (featured.length ? featured : museums).slice(0, 4);
  const museumLinks = spotlight.map((m) => ({ label: m.name, href: `/${m.slug}` }));

  const rows = await sql`SELECT header_json FROM homepage WHERE id = 1 LIMIT 1`;
  const header = rows[0]?.header_json || {};
  const existing = Array.isArray(header.navLinks) ? header.navLinks : [];

  const existingHrefs = new Set(existing.map((l) => l?.href));
  const toAdd = museumLinks.filter((l) => !existingHrefs.has(l.href));

  if (!toAdd.length) {
    console.log("Every current top-4-featured museum already has a matching entry in the header's Nav links. Nothing to do.");
    return;
  }

  header.navLinks = [...toAdd, ...existing];

  await sql`
    INSERT INTO homepage (id, header_json) VALUES (1, ${JSON.stringify(header)}::jsonb)
    ON CONFLICT (id) DO UPDATE SET header_json = EXCLUDED.header_json
  `;

  console.log(`Added ${toAdd.length} museum link${toAdd.length === 1 ? "" : "s"} to the header's saved Nav links:`);
  for (const link of toAdd) console.log(`  - ${link.label}  ->  ${link.href}`);
  console.log("\nThese are now plain, editable entries in Homepage admin -> Navbar -> Nav links, same as About Us/Blog.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
