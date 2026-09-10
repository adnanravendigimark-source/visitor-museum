// Read-only. Scans every content table for the word "official" so you can
// find and fix any live-DB text that still claims/implies Visit Museums is
// an official ticket seller (it isn't — it's an independent affiliate
// guide linking out to authorized providers). This does NOT touch the
// database — it only prints where to go fix each match in the admin.
//
// Why this script exists instead of just fixing the wording in code: this
// project's seed files (data/museums.json etc.) and default copy
// (lib/*.ts) have already been swept for "official" — but any museum,
// post, or page you've since edited through the admin UI has its own text
// saved directly in the database, which isn't reachable from source code
// at all. Run this against your real DATABASE_URL to find those.
//
// Usage:
//   node scripts/find-official-wording.mjs
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

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is not set.");
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);

// table -> { label, rowLabel(row): string, adminHint: string }. rowLabel
// identifies which specific row a match is on (museum name, post title,
// etc.) so you know exactly where to go fix it.
const TABLES = [
  { table: "museums", label: "Museums", rowLabel: (r) => `${r.name} (${r.slug})`, adminHint: "Admin → Museums → this museum" },
  { table: "museum_tours", label: "Museum tours", rowLabel: (r) => `${r.title} (tour id: ${r.id})`, adminHint: "Admin → Museums → this museum → Tours & Tickets" },
  { table: "museum_faqs", label: "Museum FAQs", rowLabel: (r) => `FAQ on museum_id ${r.museum_id} (faq id: ${r.id})`, adminHint: "Admin → Museums → this museum → FAQs" },
  { table: "posts", label: "Blog posts", rowLabel: (r) => `${r.title} (${r.slug})`, adminHint: "Admin → Blog → this post" },
  { table: "homepage", label: "Homepage / site chrome", rowLabel: () => "the single homepage row", adminHint: "Admin → Homepage" },
  { table: "about_page", label: "About page", rowLabel: () => "the single About row", adminHint: "Admin → About" },
  { table: "contact_page", label: "Contact page", rowLabel: () => "the single Contact row", adminHint: "Admin → Contact" },
  { table: "privacy_policy", label: "Privacy Policy", rowLabel: () => "the single Privacy row", adminHint: "Admin → Privacy" },
];

function findMatches(value, path, hits) {
  if (value === null || value === undefined) return;
  if (typeof value === "string") {
    if (/official/i.test(value)) {
      const idx = value.toLowerCase().indexOf("official");
      const start = Math.max(0, idx - 40);
      const end = Math.min(value.length, idx + 50);
      const snippet = (start > 0 ? "…" : "") + value.slice(start, end).replace(/\s+/g, " ") + (end < value.length ? "…" : "");
      hits.push({ path, snippet });
    }
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((v, i) => findMatches(v, `${path}[${i}]`, hits));
    return;
  }
  if (typeof value === "object") {
    for (const [k, v] of Object.entries(value)) findMatches(v, path ? `${path}.${k}` : k, hits);
  }
}

async function main() {
  let totalHits = 0;

  for (const { table, label, rowLabel, adminHint } of TABLES) {
    let rows;
    try {
      rows = await sql.query(`SELECT * FROM ${table}`);
    } catch (err) {
      console.log(`\n[skip] ${label} (${table}): ${err.message}`);
      continue;
    }

    const tableHits = [];
    for (const row of rows) {
      const hits = [];
      for (const [col, val] of Object.entries(row)) {
        findMatches(val, col, hits);
      }
      if (hits.length) tableHits.push({ row, hits });
    }

    if (tableHits.length) {
      console.log(`\n=== ${label} — ${tableHits.length} row(s) with "official" ===`);
      for (const { row, hits } of tableHits) {
        console.log(`  ${rowLabel(row)}  —  fix in: ${adminHint}`);
        for (const h of hits) {
          console.log(`    · ${h.path}: "${h.snippet}"`);
          totalHits++;
        }
      }
    }
  }

  if (totalHits === 0) {
    console.log("\nNo remaining \"official\" wording found in any content table. Nothing to fix.");
  } else {
    console.log(`\n${totalHits} occurrence(s) found across the tables above. Note: "officially known as <name>" (describing a place's formal/alternate name) is fine to leave — it's only wording that implies Visit Museums itself is an official seller/partner that should change (e.g. "official tickets" → "verified tickets", "an official confirmation" → "a confirmed booking").`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
