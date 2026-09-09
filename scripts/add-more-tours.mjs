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

const additionalTours = [
  // Uffizi
  {
    id: "uffizi-guided-tour",
    museumId: "uffizi-gallery",
    title: "Florence: Uffizi Gallery Small Group Guided Tour",
    description: "Discover Renaissance masterpieces with a professional art historian guide and priority skip-the-line entrance.",
    price: 65,
    duration: "2 Hours",
    rating: 4.8,
    reviews: 8420,
    featured: true,
    badge: "Top Rated",
    image: "/images/uffizi-card.jpg",
    imageAlt: "Uffizi Gallery Guided Tour",
    hrefPath: "https://visit-museums.com/uffizi-gallery-museum-tickets-tour/",
    category: "Guided Tour",
    highlights: [
      "Priority skip-the-line group entrance",
      "Expert licensed art historian guide",
      "Headsets to hear the guide clearly"
    ],
    includes: ["Skip-the-line ticket", "Tour guide", "Headsets"],
    excludes: ["Hotel pickup"],
    bestFor: "Art enthusiasts seeking in-depth commentary",
    priceTableColumn1: "2 Hours",
    priceTableFeature: "Expert Guide"
  },
  {
    id: "uffizi-accademia-combo",
    museumId: "uffizi-gallery",
    title: "Florence: Uffizi & Accademia VIP Combo Tour",
    description: "Experience Florence's top two museums in one day: Michelangelo's David at Accademia and Botticelli at Uffizi.",
    price: 98,
    duration: "4 Hours",
    rating: 4.9,
    reviews: 6150,
    featured: true,
    badge: "Best Value",
    image: "/images/david-sculpture.jpg",
    imageAlt: "Uffizi and Accademia Combo Tour",
    hrefPath: "https://visit-museums.com/uffizi-gallery-museum-tickets-tour/",
    category: "Combo Tour",
    highlights: [
      "Skip-the-line access to both Uffizi & Accademia",
      "See Michelangelo's David & Botticelli's Venus",
      "Walking tour through historic Florence center"
    ],
    includes: ["Both museum tickets", "Guided tours", "City walk"],
    excludes: ["Meals"],
    bestFor: "First-time visitors to Florence",
    priceTableColumn1: "4 Hours",
    priceTableFeature: "Dual Museum VIP"
  },
  // Lindt
  {
    id: "lindt-cruise-combo",
    museumId: "lindt-home-of-chocolate",
    title: "Zurich: City Tour, Lake Cruise & Lindt Home of Chocolate",
    description: "Comprehensive Zurich sightseeing tour including old town, scenic lake boat ride, and Lindt chocolate museum entry.",
    price: 72,
    duration: "4.5 Hours",
    rating: 4.7,
    reviews: 5890,
    featured: true,
    badge: "Popular Combo",
    image: "/images/lindt-card.jpg",
    imageAlt: "Zurich City Tour and Lindt Chocolate",
    hrefPath: "https://visit-museums.com/lindt-home-of-chocolate/",
    category: "Day Tour",
    highlights: [
      "Guided Zurich city highlights tour",
      "Scenic Lake Zurich passenger boat cruise",
      "Admission to Lindt Home of Chocolate & tasting"
    ],
    includes: ["Bus tour", "Boat ticket", "Lindt entry"],
    excludes: ["Lunch"],
    bestFor: "Visitors wanting a full Zurich day out",
    priceTableColumn1: "4.5 Hours",
    priceTableFeature: "Cruise + Museum"
  },
  {
    id: "lindt-fondue-experience",
    museumId: "lindt-home-of-chocolate",
    title: "Zurich: Lindt Chocolate & Swiss Fondue Culinary Tour",
    description: "Indulge your sweet and savory cravings with Lindt interactive exhibits and a traditional Swiss cheese fondue dinner.",
    price: 89,
    duration: "5 Hours",
    rating: 4.9,
    reviews: 3120,
    featured: true,
    badge: "Culinary Experience",
    image: "/images/lindt-card.jpg",
    imageAlt: "Lindt Chocolate and Fondue Tour",
    hrefPath: "https://visit-museums.com/lindt-home-of-chocolate/",
    category: "Food Tour",
    highlights: [
      "Lindt museum entry & unlimited chocolate tastings",
      "Authentic Swiss cheese fondue dinner",
      "Private transfers from Zurich HB"
    ],
    includes: ["Lindt ticket", "Fondue dinner", "Transfers"],
    excludes: ["Extra drinks"],
    bestFor: "Foodies and couples",
    priceTableColumn1: "5 Hours",
    priceTableFeature: "Dinner Included"
  },
  // Duomo Florence
  {
    id: "duomo-dome-climb-guided",
    museumId: "duomo-florence",
    title: "Florence: Duomo Guided Tour with Brunelleschi's Dome Climb",
    description: "Climb the 463 steps of Brunelleschi's Dome for panoramic views of Florence with priority reserved entry and an expert guide.",
    price: 55,
    duration: "2.5 Hours",
    rating: 4.8,
    reviews: 15400,
    featured: true,
    badge: "Top Rated",
    image: "/images/uffizi-card.jpg",
    imageAlt: "Duomo Florence Dome Climb",
    hrefPath: "https://visit-museums.com/duomo-florence-tickets/",
    category: "Guided Climb",
    highlights: [
      "Priority skip-the-line Brunelleschi Dome entrance",
      "Expert guide explaining Vasari's Last Judgment frescoes",
      "Full access to the Duomo terraces & museum"
    ],
    includes: ["Dome climb pass", "Cathedral guide", "Duomo museum"],
    excludes: ["Transport"],
    bestFor: "Adventurous travelers and photographers",
    priceTableColumn1: "2.5 Hours",
    priceTableFeature: "Dome Climb VIP"
  }
];

async function main() {
  const dataPath = path.join(process.cwd(), "data", "museum-tours.json");
  const existing = JSON.parse(fs.readFileSync(dataPath, "utf-8"));

  for (const item of additionalTours) {
    const idx = existing.findIndex((t) => t.id === item.id);
    if (idx >= 0) {
      existing[idx] = { ...existing[idx], ...item };
    } else {
      existing.push(item);
    }
  }

  fs.writeFileSync(dataPath, JSON.stringify(existing, null, 2), "utf-8");
  console.log("Updated data/museum-tours.json successfully!");

  if (process.env.DATABASE_URL) {
    const sql = neon(process.env.DATABASE_URL);
    for (const item of additionalTours) {
      await sql`
        INSERT INTO museum_tours (
          id, museum_id, title, description, price, duration, rating, reviews,
          featured, badge, image, image_alt, href_path, category, highlights,
          includes, excludes, best_for, price_table_column1, price_table_feature
        ) VALUES (
          ${item.id}, ${item.museumId}, ${item.title}, ${item.description}, ${item.price},
          ${item.duration}, ${item.rating}, ${item.reviews}, ${item.featured}, ${item.badge},
          ${item.image}, ${item.imageAlt}, ${item.hrefPath}, ${item.category},
          ${JSON.stringify(item.highlights)}::jsonb, ${JSON.stringify(item.includes)}::jsonb,
          ${JSON.stringify(item.excludes)}::jsonb, ${item.bestFor}, ${item.priceTableColumn1},
          ${item.priceTableFeature}
        ) ON CONFLICT (id) DO UPDATE SET
          title = EXCLUDED.title,
          description = EXCLUDED.description,
          price = EXCLUDED.price,
          rating = EXCLUDED.rating,
          reviews = EXCLUDED.reviews,
          image = EXCLUDED.image,
          highlights = EXCLUDED.highlights;
      `;
      console.log(`Synced tour ${item.title} into database!`);
    }
  }
}

main().catch(console.error);
