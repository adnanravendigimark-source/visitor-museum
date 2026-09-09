// Brings the Vatican Museums page in line with the same structure, section
// copy conventions, and content depth already established on the Louvre
// and Uffizi pages — same headings/eyebrows, plus the ticket (tour) and
// FAQ rows Vatican never had, which is why its page rendered with fewer
// sections than the others (MuseumTourGrid/MuseumPriceComparison/
// MuseumFaqSection all return null when their DB rows are empty).
//
// Run once locally: node scripts/normalize-vatican-content.mjs
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

const MUSEUM_ID = "vatican-museums";

const headingFields = {
  highlights_eyebrow: "What You'll See",
  highlights_heading: "Must-See Highlights at the Vatican Museums",
  about_heading: "About the Vatican Museums",
  about_body:
    "<p>Founded by Pope Julius II in the early 16th century, the Vatican Museums have grown into one of the world's largest and most-visited museum complexes, housing masterpieces collected by the Catholic Church over five centuries across more than 54 galleries.</p><p>Because the Vatican Museums are among the most visited sites in the world, timed-entry tickets regularly sell out days in advance during peak season. A skip-the-line ticket or guided tour is the easiest way to make sure your visit is spent admiring the Sistine Chapel rather than waiting in line outside St. Peter's Square.</p>",
  tours_eyebrow: "Compare & Book Tickets",
  tours_heading: "Choose Your Vatican Museums Experience",
  tours_subheading: "Timed-entry tickets and guided tours, including options that pair the Vatican Museums with St. Peter's Basilica.",
  practical_address_heading: "Address",
  practical_best_time_heading: "Best Time to Visit",
  practical_best_time_body:
    "<p>Wednesday and Friday mornings tend to be noticeably quieter than weekends. The last Sunday of the month offers free admission but draws very large crowds — avoid it if you prefer a calmer visit. Arrive right at 8:00 AM opening to beat tour groups to the Sistine Chapel.</p>",
  price_eyebrow: "Transparent Comparison",
  price_heading: "Compare Vatican Tickets & Tours",
  price_subheading: "Find the right ticket for your visit — from standard timed entry to small-group guided tours.",
  price_note: "Under-18s and EU/EEA residents aged 18–25 enter free with valid ID (booking fee may still apply on third-party tickets).",
  faq_eyebrow: "FAQs",
  faq_heading: "Vatican Museums Tickets — Frequently Asked Questions",
  cta_subtext: "Book your skip-the-line ticket or guided tour today.",
  cta_button_text: "Compare Vatican Tickets & Tours",
};

const tours = [
  {
    id: "vatican-museums-skip-the-line-entry",
    badge: "self-guided",
    title: "Vatican Museums Skip-the-Line Entry Ticket",
    description: "Timed-entry ticket to the Vatican Museums and Sistine Chapel, without the general admission queue.",
    includes: [
      "Skip the general admission queue",
      "Self-guided access to the Sistine Chapel and all permanent galleries",
      "Valid for one full day inside the museums",
      "Free cancellation up to 24 hours before your slot",
    ],
    duration: "Full day (single museum visit)",
    rating: 4.6,
    reviews: 21400,
    price: 32,
    image: "/images/vatican-card.jpg",
    imageAlt: "Vatican Museums Sistine Chapel ceiling",
    featured: false,
    bestFor: "First-time visitors who want to explore independently",
    priceTableColumn1: "1 day",
    priceTableFeature: "Skip-the-line entry",
    category: "Standard Ticket",
  },
  {
    id: "vatican-museums-sistine-chapel-guided-tour",
    badge: "guided",
    title: "Vatican Museums & Sistine Chapel Guided Tour",
    description: "Skip-the-line small-group tour through the Vatican Museums, Sistine Chapel, and Raphael Rooms with an expert guide.",
    includes: [
      "Skip-the-line entry included",
      "Licensed English-speaking art historian guide",
      "Small-group setting",
      "Covers the Sistine Chapel, Raphael Rooms, and Gallery of Maps",
    ],
    duration: "3 hours guided",
    rating: 4.8,
    reviews: 11200,
    price: 68,
    image: "/images/vatican-card.jpg",
    imageAlt: "Vatican Museums guided tour group",
    featured: true,
    bestFor: "Visitors who want context and stories behind the art",
    priceTableColumn1: "3 hours",
    priceTableFeature: "Guided with art historian",
    category: "Guided Tour",
  },
];

const faqs = [
  {
    question: "Do I need to book Vatican Museums tickets in advance?",
    answer: "Yes. The Vatican Museums require a timed-entry reservation for every visitor. Tickets — especially for weekends and the last Sunday of the month — regularly sell out days in advance, so booking ahead is strongly recommended.",
  },
  {
    question: "How much does it cost to visit the Vatican Museums?",
    answer: "Standard timed entry starts around €29 online. Guided small-group tours that include the Sistine Chapel and Raphael Rooms typically start around €68 per person.",
  },
  {
    question: "Is the Vatican free on any day?",
    answer: "Yes — the last Sunday of every month offers free admission, but it is also the busiest day of the month by far. Tickets cannot be booked online for it, and queues are very long.",
  },
  {
    question: "How long should I plan for a Vatican Museums visit?",
    answer: "Most visitors spend 3 to 4 hours covering the main galleries, Gallery of Maps, and Sistine Chapel. Art lovers wanting to see the full collection should plan for closer to a full day.",
  },
  {
    question: "What is the closest metro station to the Vatican Museums?",
    answer: "Metro Line A to Ottaviano or Cipro stations, both about a 5–10 minute walk from the museum entrance.",
  },
];

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL is not set — cannot connect to the database.");
    process.exit(1);
  }
  const sql = neon(process.env.DATABASE_URL);

  await sql`
    UPDATE museums SET
      highlights_eyebrow = ${headingFields.highlights_eyebrow},
      highlights_heading = ${headingFields.highlights_heading},
      about_heading = ${headingFields.about_heading},
      about_body = ${headingFields.about_body},
      tours_eyebrow = ${headingFields.tours_eyebrow},
      tours_heading = ${headingFields.tours_heading},
      tours_subheading = ${headingFields.tours_subheading},
      practical_address_heading = ${headingFields.practical_address_heading},
      practical_best_time_heading = ${headingFields.practical_best_time_heading},
      practical_best_time_body = ${headingFields.practical_best_time_body},
      price_eyebrow = ${headingFields.price_eyebrow},
      price_heading = ${headingFields.price_heading},
      price_subheading = ${headingFields.price_subheading},
      price_note = ${headingFields.price_note},
      faq_eyebrow = ${headingFields.faq_eyebrow},
      faq_heading = ${headingFields.faq_heading},
      cta_subtext = ${headingFields.cta_subtext},
      cta_button_text = ${headingFields.cta_button_text},
      updated_at = now()
    WHERE id = ${MUSEUM_ID}
  `;
  console.log("Updated Vatican Museums heading/copy fields to match the site-wide convention.");

  const [{ count }] = await sql`SELECT count(*)::int AS count FROM museum_tours WHERE museum_id = ${MUSEUM_ID}`;
  let sortOrder = count;
  for (const t of tours) {
    await sql`
      INSERT INTO museum_tours (
        id, museum_id, badge, ribbon, title, description, includes, highlights, excludes,
        duration, rating, reviews, price, original_price, image, image_alt, href_path,
        href_extra, featured, best_for, price_table_column1, price_table_feature, category, sort_order
      ) VALUES (
        ${t.id}, ${MUSEUM_ID}, ${t.badge}, ${null}, ${t.title}, ${t.description},
        ${JSON.stringify(t.includes)}::jsonb, ${JSON.stringify([])}::jsonb, ${JSON.stringify([])}::jsonb,
        ${t.duration}, ${t.rating}, ${t.reviews}, ${t.price}, ${null},
        ${t.image}, ${t.imageAlt}, ${""}, ${null},
        ${!!t.featured}, ${t.bestFor}, ${t.priceTableColumn1}, ${t.priceTableFeature},
        ${t.category}, ${sortOrder}
      )
      ON CONFLICT (id) DO UPDATE SET
        title = EXCLUDED.title, description = EXCLUDED.description, includes = EXCLUDED.includes,
        duration = EXCLUDED.duration, rating = EXCLUDED.rating, reviews = EXCLUDED.reviews,
        price = EXCLUDED.price, image = EXCLUDED.image, image_alt = EXCLUDED.image_alt,
        featured = EXCLUDED.featured, best_for = EXCLUDED.best_for,
        price_table_column1 = EXCLUDED.price_table_column1, price_table_feature = EXCLUDED.price_table_feature,
        category = EXCLUDED.category
    `;
    sortOrder += 1;
    console.log(`Synced tour: ${t.title}`);
  }

  for (let i = 0; i < faqs.length; i++) {
    const f = faqs[i];
    const id = `${MUSEUM_ID}-faq-${i + 1}`;
    await sql`
      INSERT INTO museum_faqs (id, museum_id, question, answer, category, sort_order)
      VALUES (${id}, ${MUSEUM_ID}, ${f.question}, ${f.answer}, ${""}, ${i})
      ON CONFLICT (id) DO UPDATE SET
        question = EXCLUDED.question, answer = EXCLUDED.answer, sort_order = EXCLUDED.sort_order
    `;
  }
  console.log(`Synced ${faqs.length} FAQs for Vatican Museums.`);

  console.log("\nDone. Reload /vatican-museums-tickets-tour to see the ticket grid, price comparison, and FAQ sections now populated.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
