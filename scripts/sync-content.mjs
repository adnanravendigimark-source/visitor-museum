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
  console.error("DATABASE_URL is not set");
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);

async function main() {
  console.log("Checking homepage table...");
  const rows = await sql`SELECT * FROM homepage WHERE id = 1`;
  console.log("Current homepage row:", rows[0]);

  console.log("Updating homepage table with target design values...");
  const headerJson = {
    brandName: "Visit Museums",
    brandSubtitle: "Official Tickets & Guided Tours",
    navLinks: [
      { label: "Home", href: "/" },
      { label: "About Us", href: "/about" },
      { label: "Blog", href: "/blog" },
      { label: "Contact", href: "/contact" }
    ],
    buttonText: "Explore Museums",
    buttonHref: "#popular-museums",
    searchPlaceholder: "Search museums..."
  };

  await sql`
    UPDATE homepage SET
      hero_badge = 'WORLD-CLASS MUSEUMS, UNFORGETTABLE EXPERIENCES',
      hero_heading = 'Discover the World''s Most Iconic Museums',
      hero_subheading = 'From timeless masterpieces to fascinating cultural treasures, explore the world''s best museums and plan your visit with ease.',
      hero_image = '/images/hero-louvre.jpg',
      hero_image_alt = 'Louvre Museum Glass Pyramid at sunset Paris',
      header_json = ${JSON.stringify(headerJson)}::jsonb
    WHERE id = 1;
  `;

  // Also update museums table if card_image is missing or old
  console.log("Updating museum card images...");
  const museums = [
    { slug: 'louvre-museum', card_image: '/images/hero-louvre.jpg' },
    { slug: 'vatican-museums', card_image: '/images/vatican-card.jpg' },
    { slug: 'uffizi-gallery', card_image: '/images/uffizi-card.jpg' },
    { slug: 'british-museum', card_image: '/images/british-card.jpg' },
    { slug: 'lindt-home-of-chocolate', card_image: '/images/lindt-card.jpg' },
    { slug: 'van-gogh-museum', card_image: '/images/van-gogh-card.jpg' }
  ];

  for (const m of museums) {
    await sql`
      UPDATE museums SET card_image = ${m.card_image} WHERE slug = ${m.slug};
    `;
  }

  console.log("Sync complete!");
}

main().catch(console.error);
