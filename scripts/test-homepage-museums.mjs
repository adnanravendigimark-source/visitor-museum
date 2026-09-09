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

async function test() {
  const sql = neon(process.env.DATABASE_URL);
  const rows = await sql`SELECT id, slug, name, city, country, card_image FROM museums`;
  
  const HOMEPAGE_FEATURED_SLUGS = [
    "louvre-museum-tickets-tour",
    "vatican-museums-tickets-tour",
    "uffizi-gallery-museum-tickets-tour",
    "van-gogh-museum-tickets-tour",
    "accademia-gallery-tickets",
    "rijksmuseum-tickets-tour",
  ];

  const homepageMuseums = HOMEPAGE_FEATURED_SLUGS.map(
    (slug) => rows.find((m) => m.slug === slug || m.id === slug || m.id === slug.replace(/-tickets.*$/, ""))
  ).filter(Boolean);

  console.log("Homepage Museums count:", homepageMuseums.length);
  homepageMuseums.forEach((m, i) => {
    console.log(`${i + 1}. ${m.name} (${m.city}, ${m.country}) - Image: ${m.card_image} - Slug: ${m.slug}`);
  });
}

test().catch(console.error);
