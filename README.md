# Visit Museums

Independent museum & attraction ticket comparison portal — skip-the-line
tickets, guided tours, and combo passes for museums and cultural landmarks
worldwide, plus an admin-curated "Other Attractions" section (grouped by
city) on every museum page.

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

## Popular Countries (homepage)

A "Where to Go" destination grid on the homepage, below the museums grid,
edited from **Homepage → Popular Countries**. Two modes: leave it empty and
it auto-shows the top 6 countries by museum count (recomputed live from
`lib/museums.ts`'s `getPopularCountries()`, nothing to maintain); or add
countries by hand to hand-pick exactly which ones show and in what order,
each with an optional photo/caption override (blank falls back to that
country's own featured museum's photo and an auto "X museums · Y cities"
caption). See `components/PopularCountries.tsx`.

## Other Attractions

Each museum page can show an "Other Attractions in {city}" section — but
unlike the site's old auto-resolved "Nearby Attractions" feature (which
pulled real places from OpenStreetMap by coordinates), every card here is
typed in by hand by an admin, managed per museum exactly like that
museum's own Tours & Tickets: name, description, photo, price, rating, and
booking link, all admin-authored. Start from **Museums & Attractions →
Other Attractions** (`/admin/attractions`), pick a museum, then add/edit
its cards — see `lib/otherAttractions.ts`.

Rendered with the exact same `TourCard` component as the museum's own
tickets, just fed from `other_attractions` instead of `museum_tours`, so
the cards are visually identical.

## Tours & Tickets: city/country classification

Every ticket (`museum_tours`) carries its own `city`/`country`, independent
of — though normally defaulted from — its own museum's location, since a
combo ticket (e.g. "Paris + Versailles Day Trip") can genuinely span more
than one city. Set from the admin ticket form's City field
(`components/admin/MuseumTourForm.tsx`), which picks a city via
`components/admin/CityAutocomplete.tsx` — the exact same world-city
search behavior (and bundled reference dataset, `lib/data/worldCities.ts`)
as the attraction-travel-news sibling repo, backed by
`/api/admin/geo/cities` and `lib/geo.ts`'s `searchCities()`: a live global
geocoding API (Open-Meteo) first, falling back to the bundled dataset if
that's unreachable. Picking a result fills in Country automatically, so
the two fields can never drift out of sync.

This lets tickets be classified by location in the admin — each ticket's
city/country is visible right on its museum's own ticket list
(`/admin/museums/[id]/tours`). The public ticket card
(`components/TourCard.tsx`) also shows a small location line when a
ticket's city is set.

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
