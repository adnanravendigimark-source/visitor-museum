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

const dataPath = path.join(process.cwd(), "data", "museums.json");
const museums = JSON.parse(fs.readFileSync(dataPath, "utf-8"));

// Ensure images and proper details for all 6 home museums
const updates = {
  "louvre-museum": {
    name: "Louvre Museum",
    cardImage: "/images/hero-louvre.jpg",
    cardImageAlt: "Louvre Museum Paris glass pyramid sunset",
    cardTagline: "Home to the Mona Lisa, the Venus de Milo, and 35,000+ timeless masterworks.",
    rating: 4.8,
    reviewsCount: "12.4k",
    sortOrder: 0
  },
  "vatican-museums": {
    name: "Vatican Museum",
    cardImage: "/images/vatican-card.jpg",
    cardImageAlt: "Vatican Museums and St. Peter's Basilica",
    cardTagline: "Discover centuries of papal art, the Sistine Chapel, and Raphael Rooms.",
    rating: 4.8,
    reviewsCount: "14.2k",
    sortOrder: 1
  },
  "uffizi-gallery": {
    name: "Uffizi Gallery",
    cardImage: "/images/uffizi-card.jpg",
    cardImageAlt: "Uffizi Gallery Florence Renaissance Hall",
    cardTagline: "Botticelli's Birth of Venus, Renaissance masterworks, and Florence's finest art collection.",
    rating: 4.8,
    reviewsCount: "10.2k",
    sortOrder: 2
  },
  "van-gogh-museum": {
    name: "Van Gogh Museum",
    cardImage: "/images/van-gogh-card.jpg",
    cardImageAlt: "Van Gogh Museum Amsterdam",
    cardTagline: "The world's largest collection of artworks and letters by Vincent van Gogh.",
    rating: 4.8,
    reviewsCount: "11.5k",
    sortOrder: 3
  },
  "accademia-gallery": {
    name: "Accademia Gallery",
    cardImage: "/images/accademia-card.jpg",
    cardImageAlt: "Galleria dell'Accademia Florence Michelangelo David",
    cardTagline: "Gaze upon Michelangelo's iconic David and renowned Renaissance sculptures in Florence.",
    rating: 4.8,
    reviewsCount: "8.9k",
    sortOrder: 4
  },
  "rijksmuseum": {
    name: "Rijksmuseum",
    cardImage: "/images/rijksmuseum-card.jpg",
    cardImageAlt: "Rijksmuseum Amsterdam historic facade",
    cardTagline: "Explore 800 years of Dutch history, Rembrandt's Night Watch, and Vermeer masterpieces.",
    rating: 4.8,
    reviewsCount: "9.7k",
    sortOrder: 5
  }
};

for (const m of museums) {
  if (updates[m.id]) {
    Object.assign(m, updates[m.id]);
  }
}

fs.writeFileSync(dataPath, JSON.stringify(museums, null, 2), "utf-8");
console.log("Updated data/museums.json successfully!");

async function syncToDb() {
  if (!process.env.DATABASE_URL) return;
  const sql = neon(process.env.DATABASE_URL);

  for (const item of museums) {
    await sql`
      INSERT INTO museums (
        id, slug, name, city, country, currency_symbol, lat, lng,
        sort_order, featured, card_image, card_image_alt, card_tagline,
        hero_badge, hero_heading, hero_subheading, hero_image, hero_image_alt,
        highlights_eyebrow, highlights_heading, highlights_subheading, highlights,
        about_heading, about_body, tours_eyebrow, tours_heading, tours_subheading,
        practical_hours_heading, practical_hours, practical_hours_note,
        practical_address_heading, practical_address, practical_getting_there,
        practical_best_time_heading, practical_best_time_body,
        price_eyebrow, price_heading, price_subheading, price_note,
        faq_eyebrow, faq_heading, cta_heading, cta_subtext, cta_button_text,
        nearby_heading_override, meta_title, meta_description, focus_keyword,
        canonical_url, no_index, no_follow, og_title, og_description, og_image
      ) VALUES (
        ${item.id}, ${item.slug}, ${item.name}, ${item.city}, ${item.country},
        ${item.currencySymbol || "€"}, ${item.lat || 0}, ${item.lng || 0}, ${item.sortOrder || 0},
        ${item.featured ?? true}, ${item.cardImage || ""}, ${item.cardImageAlt || ""}, ${item.cardTagline || ""},
        ${item.heroBadge || ""}, ${item.heroHeading || ""}, ${item.heroSubheading || ""}, ${item.heroImage || ""},
        ${item.heroImageAlt || ""}, ${item.highlightsEyebrow || ""}, ${item.highlightsHeading || ""},
        ${item.highlightsSubheading || ""}, ${JSON.stringify(item.highlights || [])}::jsonb,
        ${item.aboutHeading || ""}, ${item.aboutBody || ""}, ${item.toursEyebrow || ""}, ${item.toursHeading || ""},
        ${item.toursSubheading || ""}, ${item.practicalHoursHeading || ""},
        ${JSON.stringify(item.practicalHours || [])}::jsonb, ${item.practicalHoursNote || ""},
        ${item.practicalAddressHeading || ""}, ${item.practicalAddress || ""}, ${item.practicalGettingThere || ""},
        ${item.practicalBestTimeHeading || ""}, ${item.practicalBestTimeBody || ""},
        ${item.priceEyebrow || ""}, ${item.priceHeading || ""}, ${item.priceSubheading || ""}, ${item.priceNote || ""},
        ${item.faqEyebrow || ""}, ${item.faqHeading || ""}, ${item.ctaHeading || ""}, ${item.ctaSubtext || ""},
        ${item.ctaButtonText || ""}, ${item.nearbyHeadingOverride || ""}, ${item.metaTitle || ""},
        ${item.metaDescription || ""}, ${item.focusKeyword || ""}, ${item.canonicalUrl || ""},
        ${item.noIndex ?? false}, ${item.noFollow ?? false}, ${item.ogTitle || ""}, ${item.ogDescription || ""},
        ${item.ogImage || ""}
      ) ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        slug = EXCLUDED.slug,
        city = EXCLUDED.city,
        country = EXCLUDED.country,
        lat = EXCLUDED.lat,
        lng = EXCLUDED.lng,
        sort_order = EXCLUDED.sort_order,
        card_image = EXCLUDED.card_image,
        card_image_alt = EXCLUDED.card_image_alt,
        card_tagline = EXCLUDED.card_tagline,
        hero_image = EXCLUDED.hero_image,
        hero_image_alt = EXCLUDED.hero_image_alt;
    `;
    console.log(`Synced ${item.name} (${item.id}) into database!`);
  }
}

syncToDb().catch(console.error);
