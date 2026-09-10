# Visit Museums

Independent museum & attraction ticket comparison portal — skip-the-line
tickets, guided tours, and combo passes for museums and cultural landmarks
worldwide, plus a real lat/lng-based "Nearby Attractions" feature on every
museum page.

Built on the same architecture, CMS, and database patterns as this
project's sibling single-attraction sites (e.g. `florence-cathedral-entry`),
extended to support many independent museum pages instead of one.

## Launch content

Seeded with real, researched content for four attractions:

- Louvre Museum — `/louvre-museum-tickets-tour`
- Duomo Florence — `/duomo-florence-tickets`
- Uffizi Gallery — `/uffizi-gallery-museum-tickets-tour`
- Lindt Home of Chocolate — `/lindt-home-of-chocolate`

More museums can be added at any time from the admin (`/admin/museums`) —
no code changes required. Every field (copy, images, tours, FAQs, hours,
address, lat/lng, SEO) is CMS-editable.

## Getting started

```bash
npm install
cp .env.example .env   # then fill in DATABASE_URL, ADMIN_EMAIL, ADMIN_PASSWORD at minimum
node scripts/setup-db.mjs --seed   # first time only — creates tables + seeds real launch content
npm run dev
```

Log in at `/admin/login` with the `ADMIN_EMAIL` / `ADMIN_PASSWORD` from your
`.env` file — this "owner" account always works, even before any user row
exists in the database.

On every later deploy or schema change, run `node scripts/setup-db.mjs`
**without** `--seed`. Seeding only ever runs when you explicitly pass
`--seed`, so it can never silently re-add content you deleted through the
admin.

See `.env.example` for every environment variable the app uses and what
each one enables or disables when left unset.

## Nearby Attractions

Each museum page shows "Nearby Attractions" — real points of interest
pulled from OpenStreetMap around that museum's stored latitude/longitude,
not hardcoded relationships and not this site's own museum list:

1. Candidates come from the Overpass API (OpenStreetMap), tried against a
   fixed list of free public mirrors in a fixed order — never raced against
   each other, so the result doesn't depend on which mirror happens to
   answer first.
2. Real routing distances come from OSRM (`lib/routing.ts`) — driving via
   the free public OSRM demo server by default, or your own `OSRM_BASE_URL`
   for both walking and driving. Attractions within **3km real walking
   distance** are labeled "walk"; within **10km real driving distance**,
   "drive"; anything farther is excluded.
3. Each place gets a genuine photo when one's available (`lib/nearbyPlaces.ts`'s
   `getPlaceImage`, checked in order: the OSM `image` tag, `wikimedia_commons`,
   Wikipedia, then Wikidata) — never a fake or placeholder image.

**This is resolved once and stored, not recomputed on every page view.**
`lib/museums.ts`'s `resolveAndPersistNearbyPlaces` runs — and writes the
result to the `museums.nearby_places_json` column — only when: a museum is
created, its coordinates change, or an admin clicks "Re-check now" on the
museum's Nearby Attractions panel. The admin panel and the public page both
read that same stored value, so they always match. A museum added before
this existed (or whose coordinates have never changed) won't have a
resolved list until one of those three things happens to it — use "Re-check
now" (or "Re-check all", from the museums list) to backfill it.

## Architecture notes

- **Admin → Database → Public site**, no hardcoded CMS content. Every
  `lib/*.ts` data function tries the database first and falls back to the
  matching `data/*.json` seed file, so the app is fully buildable and
  testable without a live `DATABASE_URL`.
- **Museums** (`lib/museums.ts`) replace the single-attraction "homepage IS
  the attraction" pattern used by this project's sibling sites — each
  museum has its own tours (`museum_tours`) and FAQs (`museum_faqs`), while
  `lib/homepage.ts` covers only the site-wide museums-listing landing page,
  header, footer, and theme.
- **Affiliate links**: every ticket links out via GetYourGuide using
  `GYG_PARTNER_ID` from your environment (`lib/museums.ts`'s `gygLink()`) —
  never a hardcoded partner ID.
- **Always-fresh content**: every content-reading page/route is
  `force-dynamic` with `cache: "no-store"` database reads, plus
  `staleTimes: { dynamic: 0, static: 0 }` in `next.config.mjs`, so admin
  edits appear immediately without a rebuild or hard refresh.

## Before you go live

A few things worth doing before pointing a real domain at this:

- **Museum photos**: `data/museums.json` and `data/museum-tours.json`
  reference `/images/*.jpg` paths that don't exist yet as files — upload
  real photos for each museum/tour through the admin's image fields (Media
  Library) before launch. `SafeImage` falls back gracefully in the
  meantime, but the placeholders shouldn't ship to production.
- **GetYourGuide links**: the seeded tours use real GetYourGuide city-hub
  URLs (e.g. `paris-l16/`, `florence-l32/`, `zurich-l55/`) as a starting
  point, not curated product-page links. Swap in your own tracked product
  URLs from your GetYourGuide partner account for real commission
  attribution.
- **Domain**: `lib/site.ts` currently sets `SITE_URL` to
  `https://www.visit-museums.com`. Confirm you control this domain (a
  search during content research surfaced what may be an existing,
  unrelated site at that address) before finalizing DNS and launching.
- **Color palette**: the site currently reuses the exact color tokens and
  hex values from the sibling reference sites (navy/marble/tuscan/
  terracotta/etc.) rather than a fresh brand palette, since most theming is
  baked into component-level hex literals rather than driven centrally by
  `lib/homepage.ts`'s theme fields. Ask if you'd like a full visual reskin
  as a follow-up.
# visitor-museum
