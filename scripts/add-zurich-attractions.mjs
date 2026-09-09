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

const zurichAttractions = [
  {
    id: "fifa-museum-zurich",
    slug: "fifa-museum-zurich-tickets",
    name: "FIFA Museum Zurich",
    city: "Zurich",
    country: "Switzerland",
    currencySymbol: "CHF ",
    lat: 47.3626,
    lng: 8.5323,
    sortOrder: 14,
    featured: true,
    rating: 4.7,
    reviewsCount: "4.8k",
    cardImage: "/images/lindt-card.jpg",
    cardImageAlt: "FIFA Museum Zurich",
    cardTagline: "Celebrate the heritage of world football, see the original FIFA World Cup Trophy, and test your skills in interactive gaming zones.",
    heroBadge: "ZURICH · FOOTBALL HERITAGE",
    heroHeading: "FIFA Museum Zurich Tickets",
    heroSubheading: "<p>Explore three floors of football history, original memorabilia from every World Cup, and interactive multimedia stations.</p>",
    heroImage: "/images/lindt-card.jpg",
    heroImageAlt: "FIFA Museum Zurich",
    highlightsEyebrow: "Highlights",
    highlightsHeading: "FIFA Museum Highlights",
    highlightsSubheading: "World Cup trophy, historical jerseys, and pinball giant football arena.",
    highlights: [
      { icon: "🏆", title: "World Cup Trophy", body: "Original FIFA World Cup Trophy displayed in the central vault." },
      { icon: "⚽", title: "The Arena", body: "Giant interactive pinball football game testing your ball skills." }
    ],
    aboutHeading: "About FIFA Museum",
    aboutBody: "<p>Located at Tessinerplatz opposite Bahnhof Enge, the FIFA Museum celebrates the emotion and history of world football.</p>",
    toursEyebrow: "Book Entry",
    toursHeading: "FIFA Museum Zurich Admission Tickets",
    toursSubheading: "Instant confirmation admission tickets.",
    practicalHoursHeading: "Opening Hours",
    practicalHours: [
      { range: "Tuesday – Sunday", time: "10:00 AM – 6:00 PM" },
      { range: "Monday", time: "Closed" }
    ],
    practicalHoursNote: "Last entry at 5:00 PM.",
    practicalAddressHeading: "How to Reach?",
    practicalAddress: "Seestrasse 27, 8002 Zurich, Switzerland.",
    practicalGettingThere: "Directly opposite Zurich Enge train station (Trams 5, 6, 7).",
    practicalBestTimeHeading: "Ticket Prices",
    practicalBestTimeBody: "<p>Adult tickets from CHF 24, youth discounts available.</p>",
    priceEyebrow: "Pricing",
    priceHeading: "Admission Options",
    priceSubheading: "Entry ticket with interactive arena.",
    priceNote: "Includes all permanent exhibitions.",
    faqEyebrow: "FAQ",
    faqHeading: "Frequently Asked Questions",
    ctaHeading: "Ready to visit the FIFA Museum?",
    ctaSubtext: "Book your tickets online today.",
    ctaButtonText: "Book FIFA Museum Tickets",
    nearbyHeadingOverride: "Other Attractions in Zurich",
    metaTitle: "FIFA Museum Zurich Tickets | World Cup Heritage",
    metaDescription: "Book FIFA Museum tickets in Zurich.",
    focusKeyword: "fifa museum tickets",
    canonicalUrl: "https://visit-museums.com/fifa-museum-zurich-tickets/",
    noIndex: false,
    noFollow: false,
    ogTitle: "FIFA Museum Zurich Tickets",
    ogDescription: "Book FIFA Museum tickets in Zurich.",
    ogImage: "/images/lindt-card.jpg",
    createdAt: "2026-09-01T00:00:00.000Z",
    updatedAt: "2026-09-01T00:00:00.000Z"
  },
  {
    id: "kunsthaus-zurich",
    slug: "kunsthaus-zurich-tickets",
    name: "Kunsthaus Zurich",
    city: "Zurich",
    country: "Switzerland",
    currencySymbol: "CHF ",
    lat: 47.3705,
    lng: 8.5488,
    sortOrder: 15,
    featured: true,
    rating: 4.8,
    reviewsCount: "5.1k",
    cardImage: "/images/uffizi-card.jpg",
    cardImageAlt: "Kunsthaus Zurich art museum",
    cardTagline: "Switzerland's largest art museum featuring masterpieces by Giacometti, Munch, Monet, and modern masters in Chipperfield's extension.",
    heroBadge: "ZURICH · FINE ARTS",
    heroHeading: "Kunsthaus Zurich Tickets & Tours",
    heroSubheading: "<p>Experience world-class art collections from the Middle Ages to contemporary installations in central Zurich.</p>",
    heroImage: "/images/uffizi-card.jpg",
    heroImageAlt: "Kunsthaus Zurich architecture",
    highlightsEyebrow: "Highlights",
    highlightsHeading: "Kunsthaus Highlights",
    highlightsSubheading: "Alberto Giacometti collection and Impressionist paintings.",
    highlights: [
      { icon: "🎨", title: "Giacometti Collection", body: "The largest museum collection of sculptures by Alberto Giacometti." },
      { icon: "🏛️", title: "Chipperfield Building", body: "Award-winning luminous museum architecture opened in 2021." }
    ],
    aboutHeading: "About Kunsthaus Zurich",
    aboutBody: "<p>Kunsthaus Zurich is one of the most important art museums in Switzerland and Europe.</p>",
    toursEyebrow: "Book Entry",
    toursHeading: "Kunsthaus Zurich Entry Tickets",
    toursSubheading: "Permanent collection and temporary exhibitions.",
    practicalHoursHeading: "Opening Hours",
    practicalHours: [
      { range: "Tuesday, Friday, Saturday, Sunday", time: "10:00 AM – 6:00 PM" },
      { range: "Wednesday, Thursday", time: "10:00 AM – 8:00 PM" },
      { range: "Monday", time: "Closed" }
    ],
    practicalHoursNote: "Extended evening hours on Wednesdays and Thursdays.",
    practicalAddressHeading: "How to Reach?",
    practicalAddress: "Heimplatz 1/5, 8001 Zurich, Switzerland.",
    practicalGettingThere: "Trams 3, 5, 8, 9 to Kunsthaus station.",
    practicalBestTimeHeading: "Ticket Prices",
    practicalBestTimeBody: "<p>Standard collection entry CHF 24.</p>",
    priceEyebrow: "Pricing",
    priceHeading: "Kunsthaus Ticket Options",
    priceSubheading: "All exhibition pass.",
    priceNote: "Free audio guide app available.",
    faqEyebrow: "FAQ",
    faqHeading: "Frequently Asked Questions",
    ctaHeading: "Ready to visit Kunsthaus Zurich?",
    ctaSubtext: "Book your tickets online.",
    ctaButtonText: "Book Kunsthaus Tickets",
    nearbyHeadingOverride: "Other Attractions in Zurich",
    metaTitle: "Kunsthaus Zurich Tickets | Fine Arts Museum",
    metaDescription: "Book Kunsthaus Zurich tickets.",
    focusKeyword: "kunsthaus zurich tickets",
    canonicalUrl: "https://visit-museums.com/kunsthaus-zurich-tickets/",
    noIndex: false,
    noFollow: false,
    ogTitle: "Kunsthaus Zurich Tickets",
    ogDescription: "Book Kunsthaus Zurich tickets.",
    ogImage: "/images/uffizi-card.jpg",
    createdAt: "2026-09-01T00:00:00.000Z",
    updatedAt: "2026-09-01T00:00:00.000Z"
  }
];

async function main() {
  const dataPath = path.join(process.cwd(), "data", "museums.json");
  const existing = JSON.parse(fs.readFileSync(dataPath, "utf-8"));

  for (const item of zurichAttractions) {
    const idx = existing.findIndex((m) => m.id === item.id);
    if (idx >= 0) {
      existing[idx] = { ...existing[idx], ...item };
    } else {
      existing.push(item);
    }
  }

  fs.writeFileSync(dataPath, JSON.stringify(existing, null, 2), "utf-8");
  console.log("Updated data/museums.json with Zurich attractions!");

  if (process.env.DATABASE_URL) {
    const sql = neon(process.env.DATABASE_URL);
    for (const item of zurichAttractions) {
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
          ${item.currencySymbol}, ${item.lat}, ${item.lng}, ${item.sortOrder},
          ${item.featured}, ${item.cardImage}, ${item.cardImageAlt}, ${item.cardTagline},
          ${item.heroBadge}, ${item.heroHeading}, ${item.heroSubheading}, ${item.heroImage},
          ${item.heroImageAlt}, ${item.highlightsEyebrow}, ${item.highlightsHeading},
          ${item.highlightsSubheading}, ${JSON.stringify(item.highlights)}::jsonb,
          ${item.aboutHeading}, ${item.aboutBody}, ${item.toursEyebrow}, ${item.toursHeading},
          ${item.toursSubheading}, ${item.practicalHoursHeading},
          ${JSON.stringify(item.practicalHours)}::jsonb, ${item.practicalHoursNote},
          ${item.practicalAddressHeading}, ${item.practicalAddress}, ${item.practicalGettingThere},
          ${item.practicalBestTimeHeading}, ${item.practicalBestTimeBody},
          ${item.priceEyebrow}, ${item.priceHeading}, ${item.priceSubheading}, ${item.priceNote},
          ${item.faqEyebrow}, ${item.faqHeading}, ${item.ctaHeading}, ${item.ctaSubtext},
          ${item.ctaButtonText}, ${item.nearbyHeadingOverride}, ${item.metaTitle},
          ${item.metaDescription}, ${item.focusKeyword}, ${item.canonicalUrl},
          ${item.noIndex}, ${item.noFollow}, ${item.ogTitle}, ${item.ogDescription},
          ${item.ogImage}
        ) ON CONFLICT (id) DO UPDATE SET
          lat = EXCLUDED.lat,
          lng = EXCLUDED.lng,
          card_image = EXCLUDED.card_image,
          card_image_alt = EXCLUDED.card_image_alt,
          card_tagline = EXCLUDED.card_tagline,
          hero_image = EXCLUDED.hero_image,
          name = EXCLUDED.name,
          city = EXCLUDED.city,
          country = EXCLUDED.country,
          slug = EXCLUDED.slug;
      `;
      console.log(`Synced ${item.name} into database!`);
    }
  }
}

main().catch(console.error);
