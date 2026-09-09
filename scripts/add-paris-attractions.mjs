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

const newAttractions = [
  {
    id: "musee-d-orsay",
    slug: "musee-d-orsay-tickets",
    name: "Musée d'Orsay",
    city: "Paris",
    country: "France",
    currencySymbol: "€",
    lat: 48.859961,
    lng: 2.326561,
    sortOrder: 11,
    featured: true,
    rating: 4.8,
    reviewsCount: "11.2k",
    cardImage: "/images/musee-orsay-card.jpg",
    cardImageAlt: "Musée d'Orsay Paris",
    cardTagline: "World's largest collection of Impressionist and Post-Impressionist masterpieces housed in a grand Beaux-Arts railway station.",
    heroBadge: "PARIS · TICKETS & TOURS",
    heroHeading: "Musée d'Orsay Tickets & Guided Tours",
    heroSubheading: "<p>Explore masterpieces by Monet, Renoir, Van Gogh, and Cézanne in one of Paris's most beloved and iconic museums.</p>",
    heroImage: "/images/musee-orsay-card.jpg",
    heroImageAlt: "Musée d'Orsay grand clock and Beaux-Arts station",
    highlightsEyebrow: "Highlights",
    highlightsHeading: "Impressionist Highlights",
    highlightsSubheading: "See world-renowned 19th and 20th century artwork.",
    highlights: [
      { icon: "🎨", title: "Monet & Renoir", body: "Immense galleries dedicated to French Impressionism." },
      { icon: "🌻", title: "Van Gogh Gallery", body: "Starry Night Over the Rhône and iconic self-portraits." },
      { icon: "🕰️", title: "Giant Station Clock", body: "Panoramic views of Paris framed through the historical clock face." }
    ],
    aboutHeading: "About Musée d'Orsay",
    aboutBody: "<p>Located on the Left Bank of the Seine, Musée d'Orsay holds internationally renowned collections of French art from 1848 to 1914.</p>",
    toursEyebrow: "Book Tickets",
    toursHeading: "Paris: Musée d'Orsay Dedicated Entry & Tours",
    toursSubheading: "Choose dedicated entry tickets or guided tours.",
    practicalHoursHeading: "Opening Hours",
    practicalHours: [
      { range: "Tuesday to Sunday", time: "9:30 AM – 6:00 PM (open until 9:45 PM Thursdays)" },
      { range: "Monday", time: "Closed" }
    ],
    practicalHoursNote: "Reservation highly recommended.",
    practicalAddressHeading: "How to Reach?",
    practicalAddress: "1 Rue de la Légion d'Honneur, 75007 Paris, France.",
    practicalGettingThere: "RER C (Musée d'Orsay station) or Metro Line 12 (Solférino).",
    practicalBestTimeHeading: "Ticket Prices",
    practicalBestTimeBody: "<p>Standard entry starts from €16 online.</p>",
    priceEyebrow: "Pricing",
    priceHeading: "Musée d'Orsay Entry Options",
    priceSubheading: "Individual tickets & combos.",
    priceNote: "Includes permanent collection.",
    faqEyebrow: "FAQ",
    faqHeading: "Frequently Asked Questions",
    ctaHeading: "Ready to visit Musée d'Orsay?",
    ctaSubtext: "Book your tickets online to guarantee entry.",
    ctaButtonText: "Book Musée d'Orsay Tickets",
    nearbyHeadingOverride: "Other Attractions in Paris",
    metaTitle: "Musée d'Orsay Tickets & Tours | Paris Impressionism",
    metaDescription: "Book Musée d'Orsay tickets in Paris. Skip the line for Monet, Van Gogh, and Renoir collections.",
    focusKeyword: "musee d orsay tickets",
    canonicalUrl: "https://visit-museums.com/musee-d-orsay-tickets/",
    noIndex: false,
    noFollow: false,
    ogTitle: "Musée d'Orsay Tickets & Tours | Paris Impressionism",
    ogDescription: "Book Musée d'Orsay tickets in Paris.",
    ogImage: "/images/musee-orsay-card.jpg",
    createdAt: "2026-09-01T00:00:00.000Z",
    updatedAt: "2026-09-01T00:00:00.000Z"
  },
  {
    id: "centre-pompidou",
    slug: "centre-pompidou-tickets",
    name: "Centre Pompidou",
    city: "Paris",
    country: "France",
    currencySymbol: "€",
    lat: 48.860642,
    lng: 2.352245,
    sortOrder: 12,
    featured: true,
    rating: 4.6,
    reviewsCount: "8.4k",
    cardImage: "/images/pompidou-card.jpg",
    cardImageAlt: "Centre Pompidou Paris",
    cardTagline: "Europe's largest museum for modern art featuring Picasso, Kandinsky, Matisse and breathtaking rooftop views.",
    heroBadge: "PARIS · MODERN ART",
    heroHeading: "Centre Pompidou Tickets & Entry",
    heroSubheading: "<p>Experience cutting-edge modern and contemporary art in Renzo Piano and Richard Rogers' revolutionary high-tech building.</p>",
    heroImage: "/images/pompidou-card.jpg",
    heroImageAlt: "Centre Pompidou high-tech architecture Paris",
    highlightsEyebrow: "Highlights",
    highlightsHeading: "Modern Art Masterpieces",
    highlightsSubheading: "20th and 21st century modern art.",
    highlights: [
      { icon: "🎨", title: "Modern Art Museum", body: "Over 100,000 works spanning Cubism, Surrealism, and Pop Art." },
      { icon: "🏙️", title: "Rooftop Panorama", body: "Sweeping views of the Parisian skyline, Sacré-Cœur, and the Eiffel Tower." }
    ],
    aboutHeading: "About Centre Pompidou",
    aboutBody: "<p>Centre Pompidou is a vibrant cultural center housing the National Museum of Modern Art.</p>",
    toursEyebrow: "Book Tickets",
    toursHeading: "Paris: Centre Pompidou Admission & Views",
    toursSubheading: "Permanent collection tickets and temporary exhibition passes.",
    practicalHoursHeading: "Opening Hours",
    practicalHours: [
      { range: "Wednesday to Monday", time: "11:00 AM – 9:00 PM" },
      { range: "Tuesday", time: "Closed" }
    ],
    practicalHoursNote: "Last admission 1 hour before closing.",
    practicalAddressHeading: "How to Reach?",
    practicalAddress: "Place Georges-Pompidou, 75004 Paris, France.",
    practicalGettingThere: "Rambuteau (Line 11), Hôtel de Ville (Lines 1 & 11), Châtelet (Lines 1, 4, 7, 11, 14).",
    practicalBestTimeHeading: "Ticket Info",
    practicalBestTimeBody: "<p>Standard admission from €15.</p>",
    priceEyebrow: "Pricing",
    priceHeading: "Centre Pompidou Ticket Options",
    priceSubheading: "Standard entry & rooftop pass.",
    priceNote: "Includes permanent collection.",
    faqEyebrow: "FAQ",
    faqHeading: "Frequently Asked Questions",
    ctaHeading: "Ready to visit Centre Pompidou?",
    ctaSubtext: "Book your tickets online today.",
    ctaButtonText: "Book Centre Pompidou Tickets",
    nearbyHeadingOverride: "Other Attractions in Paris",
    metaTitle: "Centre Pompidou Tickets | Paris Modern Art",
    metaDescription: "Book Centre Pompidou tickets in Paris. Discover Europe's leading modern art museum.",
    focusKeyword: "centre pompidou tickets",
    canonicalUrl: "https://visit-museums.com/centre-pompidou-tickets/",
    noIndex: false,
    noFollow: false,
    ogTitle: "Centre Pompidou Tickets | Paris Modern Art",
    ogDescription: "Book Centre Pompidou tickets in Paris.",
    ogImage: "/images/pompidou-card.jpg",
    createdAt: "2026-09-01T00:00:00.000Z",
    updatedAt: "2026-09-01T00:00:00.000Z"
  },
  {
    id: "eiffel-tower",
    slug: "eiffel-tower-tickets",
    name: "Eiffel Tower",
    city: "Paris",
    country: "France",
    currencySymbol: "€",
    lat: 48.858370,
    lng: 2.294481,
    sortOrder: 13,
    featured: true,
    rating: 4.9,
    reviewsCount: "28.5k",
    cardImage: "/images/eiffel-tower-card.jpg",
    cardImageAlt: "Eiffel Tower Paris",
    cardTagline: "The world-famous wrought-iron lattice tower offering unparalleled 360° views across Paris.",
    heroBadge: "PARIS · ICONIC LANDMARK",
    heroHeading: "Eiffel Tower Tickets & Summit Access",
    heroSubheading: "<p>Ascend Paris's most celebrated monument and gaze across the City of Light from the 2nd floor or the summit.</p>",
    heroImage: "/images/eiffel-tower-card.jpg",
    heroImageAlt: "Eiffel Tower view from Champ de Mars Paris",
    highlightsEyebrow: "Highlights",
    highlightsHeading: "Eiffel Tower Highlights",
    highlightsSubheading: "Panoramic observation decks and glass floors.",
    highlights: [
      { icon: "🗼", title: "The Summit (276m)", body: "Highest accessible observation deck in the European Union." },
      { icon: "✨", title: "Glass Floor (1st Floor)", body: "Walk across the transparent floor 57 meters above the ground." }
    ],
    aboutHeading: "About the Eiffel Tower",
    aboutBody: "<p>Built for the 1889 Exposition Universelle, the Eiffel Tower is the universal symbol of Paris and France.</p>",
    toursEyebrow: "Book Tickets",
    toursHeading: "Paris: Eiffel Tower Direct Access & Summit",
    toursSubheading: "Skip-the-line elevator tickets and guided tours.",
    practicalHoursHeading: "Opening Hours",
    practicalHours: [
      { range: "Daily", time: "9:00 AM – 11:45 PM" }
    ],
    practicalHoursNote: "Stairs and elevator closing times may vary.",
    practicalAddressHeading: "How to Reach?",
    practicalAddress: "Champ de Mars, 5 Av. Anatole France, 75007 Paris, France.",
    practicalGettingThere: "Bir-Hakeim (Line 6), Trocadéro (Line 9), Champ de Mars-Tour Eiffel (RER C).",
    practicalBestTimeHeading: "Ticket Prices",
    practicalBestTimeBody: "<p>Elevator tickets to 2nd floor from €18, summit access from €29.</p>",
    priceEyebrow: "Pricing",
    priceHeading: "Eiffel Tower Ticket Pricing",
    priceSubheading: "2nd Floor & Summit Access.",
    priceNote: "Advance booking required.",
    faqEyebrow: "FAQ",
    faqHeading: "Frequently Asked Questions",
    ctaHeading: "Ready to visit the Eiffel Tower?",
    ctaSubtext: "Book your timed entry tickets in advance.",
    ctaButtonText: "Book Eiffel Tower Tickets",
    nearbyHeadingOverride: "Other Attractions in Paris",
    metaTitle: "Eiffel Tower Tickets & Summit Access | Paris",
    metaDescription: "Book Eiffel Tower tickets in Paris. Direct access elevator tickets to the 2nd floor and summit.",
    focusKeyword: "eiffel tower tickets",
    canonicalUrl: "https://visit-museums.com/eiffel-tower-tickets/",
    noIndex: false,
    noFollow: false,
    ogTitle: "Eiffel Tower Tickets & Summit Access | Paris",
    ogDescription: "Book Eiffel Tower tickets in Paris.",
    ogImage: "/images/eiffel-tower-card.jpg",
    createdAt: "2026-09-01T00:00:00.000Z",
    updatedAt: "2026-09-01T00:00:00.000Z"
  }
];

async function main() {
  const dataPath = path.join(process.cwd(), "data", "museums.json");
  const existing = JSON.parse(fs.readFileSync(dataPath, "utf-8"));

  for (const item of newAttractions) {
    const idx = existing.findIndex((m) => m.id === item.id);
    if (idx >= 0) {
      existing[idx] = { ...existing[idx], ...item };
    } else {
      existing.push(item);
    }
  }

  fs.writeFileSync(dataPath, JSON.stringify(existing, null, 2), "utf-8");
  console.log("Updated data/museums.json successfully!");

  if (process.env.DATABASE_URL) {
    const sql = neon(process.env.DATABASE_URL);
    for (const item of newAttractions) {
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
