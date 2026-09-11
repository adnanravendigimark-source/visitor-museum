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
    if ((value.startsWith("\"") && value.endsWith("\"")) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = value;
  }
}

loadDotEnv();

const MUSEUM_IMAGE_MAP = {
  "louvre-museum": { card: "/images/louvre-card.jpg", hero: "/images/hero-louvre.jpg" },
  "vatican-museums": { card: "/images/vatican-card.jpg", hero: "/images/vatican-card.jpg" },
  "uffizi-gallery": { card: "/images/uffizi-card.jpg", hero: "/images/uffizi-card.jpg" },
  "van-gogh-museum": { card: "/images/van-gogh-card.jpg", hero: "/images/van-gogh-card.jpg" },
  "british-museum": { card: "/images/british-card.jpg", hero: "/images/british-card.jpg" },
  "centre-pompidou": { card: "/images/pompidou-card.jpg", hero: "/images/pompidou-card.jpg" },
  "rijksmuseum": { card: "/images/rijksmuseum-card.jpg", hero: "/images/rijksmuseum-card.jpg" },
  "lindt-home-of-chocolate": { card: "/images/lindt-card.jpg", hero: "/images/lindt-card.jpg" },
  "duomo-florence": { card: "/images/hero-duomo.jpg", hero: "/images/hero-duomo.jpg" },
  "vasa-museum": { card: "/images/vasa-card.jpg", hero: "/images/vasa-card.jpg" },
  "brussels-atomium": { card: "/images/atomium-card.jpg", hero: "/images/atomium-card.jpg" },
  "eiffel-tower": { card: "/images/eiffel-tower-card.jpg", hero: "/images/eiffel-tower-card.jpg" },
  "fifa-museum-zurich": { card: "/images/fifa-card.jpg", hero: "/images/fifa-card.jpg" },
  "kunsthaus-zurich": { card: "/images/kunsthaus-card.jpg", hero: "/images/kunsthaus-card.jpg" },
  "accademia-gallery": { card: "/images/accademia-card.jpg", hero: "/images/accademia-card.jpg" },
  "musee-d-orsay": { card: "/images/musee-orsay-card.jpg", hero: "/images/musee-orsay-card.jpg" },
};

const POST_IMAGE_MAP = {
  "duomo-florence-dome-climb-what-to-know": "/images/hero-duomo.jpg",
  "how-to-skip-the-line-at-the-louvre": "/images/louvre-card.jpg",
  "why-one-must-visit-museums": "/images/museums-hero.jpg",
  "best-time-to-visit-amsterdam": "/images/amsterdam-blog.jpg",
  "brussels-hop-on-hop-off-bus-tour": "/images/brussels-blog.jpg",
  "hop-on-hop-off-bus-tour-rome": "/images/rome-blog.jpg",
  "best-time-to-visit-rijksmuseum": "/images/rijksmuseum-card.jpg",
  "best-time-to-visit-uffizi-gallery": "/images/uffizi-card.jpg",
  "best-time-to-visit-louvre-museum": "/images/hero-louvre.jpg",
  "best-time-to-visit-prado-museum": "/images/prado-blog.jpg",
  "best-time-to-visit-vatican-museum": "/images/vatican-card.jpg",
  "best-time-to-visit-acropolis-museum": "/images/acropolis-blog.jpg",
  "the-best-time-to-visit-the-musee-d-orsay": "/images/musee-orsay-card.jpg",
};

const TOUR_IMAGE_MAP = {
  "louvre-museum-tickets-std": "/images/louvre-card.jpg",
  "louvre-guided-masterpieces": "/images/louvre-card.jpg",
  "louvre-mona-lisa-host": "/images/louvre-card.jpg",
  "louvre-skip-the-line-standard": "/images/louvre-card.jpg",
  "louvre-guided-masterpieces-tour": "/images/louvre-card.jpg",
  "duomo-florence-brunelleschi": "/images/hero-duomo.jpg",
  "duomo-florence-guided": "/images/hero-duomo.jpg",
  "duomo-dome-climb-guided": "/images/hero-duomo.jpg",
  "uffizi-gallery-tickets-std": "/images/uffizi-card.jpg",
  "uffizi-afternoon-discount": "/images/uffizi-card.jpg",
  "uffizi-skip-the-line-standard": "/images/uffizi-card.jpg",
  "uffizi-guided-tour": "/images/uffizi-card.jpg",
  "uffizi-accademia-combo": "/images/david-sculpture.jpg",
  "lindt-home-of-chocolate-std": "/images/lindt-card.jpg",
  "lindt-home-chocolate-std": "/images/lindt-card.jpg",
  "lindt-cruise-combo": "/images/lindt-card.jpg",
  "lindt-fondue-experience": "/images/lindt-card.jpg",
  "van-gogh-std": "/images/van-gogh-card.jpg",
  "van-gogh-guided": "/images/van-gogh-card.jpg",
  "van-gogh-cruise": "/images/van-gogh-card.jpg",
  "rijksmuseum-tickets-std": "/images/rijksmuseum-card.jpg",
  "vasa-museum-std": "/images/vasa-card.jpg",
  "accademia-gallery-std": "/images/accademia-card.jpg",
  "brussels-atomium-std": "/images/atomium-card.jpg",
  "vatican-museums-skip-the-line-entry": "/images/vatican-card.jpg",
  "vatican-museums-sistine-chapel-guided-tour": "/images/vatican-card.jpg",
};

async function updateJsonFiles() {
  console.log("Updating JSON files...");
  
  // 1. Update museums.json
  const museumsPath = path.join(process.cwd(), "data", "museums.json");
  const museums = JSON.parse(fs.readFileSync(museumsPath, "utf-8"));
  for (const m of museums) {
    if (MUSEUM_IMAGE_MAP[m.id]) {
      m.cardImage = MUSEUM_IMAGE_MAP[m.id].card;
      m.heroImage = MUSEUM_IMAGE_MAP[m.id].hero;
    }
  }
  fs.writeFileSync(museumsPath, JSON.stringify(museums, null, 2));
  console.log("Updated data/museums.json");

  // 2. Update posts.json
  const postsPath = path.join(process.cwd(), "data", "posts.json");
  const posts = JSON.parse(fs.readFileSync(postsPath, "utf-8"));
  for (const p of posts) {
    if (POST_IMAGE_MAP[p.slug]) {
      p.image = POST_IMAGE_MAP[p.slug];
    }
  }
  fs.writeFileSync(postsPath, JSON.stringify(posts, null, 2));
  console.log("Updated data/posts.json");

  // 3. Update museum-tours.json
  const toursPath = path.join(process.cwd(), "data", "museum-tours.json");
  const tours = JSON.parse(fs.readFileSync(toursPath, "utf-8"));
  for (const t of tours) {
    if (TOUR_IMAGE_MAP[t.id]) {
      t.image = TOUR_IMAGE_MAP[t.id];
    }
  }
  fs.writeFileSync(toursPath, JSON.stringify(tours, null, 2));
  console.log("Updated data/museum-tours.json");
}

async function updateDatabase() {
  if (!process.env.DATABASE_URL) {
    console.log("No DATABASE_URL found, skipping DB update.");
    return;
  }
  console.log("Updating Neon database...");
  const sql = neon(process.env.DATABASE_URL);

  // 1. Update museums table
  for (const [id, imgs] of Object.entries(MUSEUM_IMAGE_MAP)) {
    await sql`
      UPDATE museums 
      SET card_image = ${imgs.card}, hero_image = ${imgs.hero}
      WHERE id = ${id}
    `;
  }
  console.log("Updated DB museums table");

  // 2. Update posts table
  for (const [slug, img] of Object.entries(POST_IMAGE_MAP)) {
    await sql`
      UPDATE posts 
      SET image = ${img}
      WHERE slug = ${slug}
    `;
  }
  console.log("Updated DB posts table");

  // 3. Update museum_tours table
  for (const [id, img] of Object.entries(TOUR_IMAGE_MAP)) {
    await sql`
      UPDATE museum_tours 
      SET image = ${img}
      WHERE id = ${id}
    `;
  }
  console.log("Updated DB museum_tours table");
}

async function main() {
  await updateJsonFiles();
  await updateDatabase();
  console.log("Sync complete!");
}

main().catch(console.error);
