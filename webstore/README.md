# WebStore

**Discover. Build. Launch. Get Discovered.**

WebStore is a community-driven marketplace and discovery platform where developers, students, and indie creators publish their web products and get found by other developers and visitors. Think Product Hunt energy with an App Store-style product page, built for the web.

Developed by **Vedant Vaidhekar**.

---

## Features

- **Auth** - email/password + Google sign-in, password reset, persistent sessions (Firebase Authentication)
- **Developer profiles** - bio, skills, socials, profile completeness meter, public `/developer/:username` pages
- **Product publishing** - multi-section product form (basic info, description, media, links, tech stack, pricing), draft/publish flow, preview modal, launch success page
- **Discovery** - home rails (trending / newest / highly rated), full catalog browse, categories, technology explorer, client-side search with filters and sort
- **Ratings & reviews** - 1-5 star ratings with atomic Firestore-transaction aggregation, rating distribution bars, text reviews (create/edit/delete, one per user per product)
- **Bookmarks** - save products to a personal `/saved` collection
- **Analytics** - product view + website-click tracking, per-product and account-wide dashboard with a Recharts bar chart
- **Trending algorithm** - deterministic, documented score (see `src/utils/trending.ts`) combining views, clicks, ratings, reviews and launch recency - no ML involved
- **Reporting** - lightweight content reporting for products/reviews, stored for future moderation tooling
- **Cloudinary-URL media** - no file uploads; logo/screenshot/video fields accept and validate Cloudinary (or any https) URLs with live preview, reordering, and broken-image fallbacks
- **Empty / loading / error states** everywhere, skeleton loaders, friendly Firebase error messages
- **Responsive** mobile-first layouts, keyboard-accessible controls, `prefers-reduced-motion` respected
- **SEO basics** - meta tags, Open Graph tags, `robots.txt`, custom 404
- Custom **Firestore Security Rules** - ownership-scoped writes, no `allow read, write: if true`

---

## Tech stack

- React 19 + Vite + TypeScript
- Tailwind CSS
- Firebase Authentication + Cloud Firestore
- React Router v7
- Framer Motion (animation)
- Recharts (dashboard charts)
- Lucide React (icons)
- react-hot-toast (notifications)
- Media hosting: **Cloudinary** (URL-only - the app never uploads files itself)
- Deployment target: **Vercel**

No backend server is required. Architecture is simply:

```
React (Vite) -> Firebase Auth -> Cloud Firestore
```

---

## Project structure

```
webstore/
├── public/                  # favicon, robots.txt
├── scripts/
│   └── seed.mjs              # demo data seeder (uses firebase-admin)
├── src/
│   ├── components/
│   │   ├── common/           # Button, FormControls, Primitives, RatingStars...
│   │   ├── layout/            # Navbar, Footer, AppLayout, ProtectedRoute
│   │   ├── product/           # ProductCard, ProductGrid, carousel, reviews...
│   │   ├── developer/         # DeveloperCard
│   │   ├── dashboard/         # StatCard, analytics chart
│   │   └── forms/             # TagInput, media URL fields
│   ├── pages/                 # one file per route
│   ├── context/                # AuthContext
│   ├── services/                # Firestore/Auth service layer (all DB access lives here)
│   ├── hooks/                    # useProductSort
│   ├── utils/                     # slug, url validation, trending score, formatting
│   ├── types/                      # shared TypeScript models
│   ├── constants/                   # categories, technologies, pricing types
│   ├── firebase/                     # Firebase app/config init
│   ├── App.tsx
│   └── main.tsx
├── firestore.rules
├── firestore.indexes.json
├── vercel.json
├── .env.example
└── package.json
```

---

## 1. Firebase setup

1. Create a project at console.firebase.google.com.
2. **Authentication** -> Sign-in method -> enable **Email/Password** and **Google**.
3. **Firestore Database** -> Create database (start in production mode - the rules in this repo handle access control).
4. **Project settings** -> General -> "Your apps" -> add a **Web app** -> copy the config values.
5. Deploy the security rules and indexes (requires the Firebase CLI):
   ```bash
   npm install -g firebase-tools
   firebase login
   firebase init firestore   # point it at this repo's firestore.rules / firestore.indexes.json when asked, or just:
   firebase deploy --only firestore:rules,firestore:indexes
   ```

## 2. Environment variables

```bash
cp .env.example .env
```

Fill in the six `VITE_FIREBASE_*` values from step 4 above. Never commit `.env`.

## 3. Local development

```bash
npm install
npm run dev
```

Visit `http://localhost:5173`.

## 4. Seed demo data (optional but recommended)

The app looks empty on a fresh Firestore project. To populate ~8 demo developers and ~14 demo products across categories/technologies:

1. Firebase Console -> Project Settings -> **Service Accounts** -> **Generate new private key**.
2. Save the downloaded file as `scripts/serviceAccountKey.json` (already gitignored - never commit it).
3. Run:
   ```bash
   npm run seed
   ```

Seed data is flagged with `isSeed: true` so it's easy to distinguish from real user data later.

## 5. Production build

```bash
npm run build
npm run preview   # sanity-check the production build locally
```

## 6. Deploying to Vercel

1. Push this repo to GitHub.
2. Import it in vercel.com/new.
3. Framework preset: **Vite**. Build command `npm run build`, output directory `dist` (Vercel detects these automatically).
4. Add the six `VITE_FIREBASE_*` environment variables in the Vercel project settings.
5. Deploy. `vercel.json` in this repo rewrites all routes to `index.html` so client-side routes like `/product/my-app`, `/developer/vedant`, and `/dashboard` work correctly on refresh/direct visit.

---

## Firestore data model

| Collection   | Notes |
|---|---|
| `users`      | One doc per account, keyed by Firebase `uid`. Public profile fields + cached aggregate stats. |
| `usernames`  | `{ username: uid }` reservation docs, enforces unique usernames at write time. |
| `products`   | One doc per product. `status` is `draft` \| `published` \| `archived`; only `published` products appear in public discovery. |
| `reviews`    | One doc per (product, author) pair in practice - enforced at the application layer, one edit per user per product. |
| `ratings`    | Doc id is `${productId}_${userId}` - guarantees one rating per user per product at the *data model* level, not just in application code. |
| `bookmarks`  | Doc id is `${productId}_${userId}`. |
| `reports`    | Write-only from the client; reserved for future moderator tooling. |

Rating **averages, counts, and distribution** are recomputed with a Firestore transaction (`applyRatingTransaction` in `productService.ts`) rather than trusted from the client, so concurrent ratings can't corrupt the aggregate.

## Trending algorithm

Documented and implemented in `src/utils/trending.ts`. It's a deterministic formula - no machine learning:

```
engagement = views·1 + clicks·3 + (ratingAvg x ratingCount)·2 + reviewCount·4
decay      = 0.5 ^ (daysSinceLaunch / 14)     // ~halves every 2 weeks
score      = engagement x (0.4 + 0.6 x decay)
```

Recent products get a boost via the decay term, while older, consistently-engaged products still retain some baseline score.

## Security rules summary

`firestore.rules` enforces (among other things):

- Anyone can read published products and public profiles; drafts/archived products are only readable by their owner.
- Only the authenticated owner can create/update/delete their own `users` and `products` docs.
- Product `views`/`clicks` counters can only ever be **incremented**, never decreased or combined with other field changes in the same write.
- Rating docs are keyed `${productId}_${userId}`, so the data model itself prevents duplicate ratings.
- No `allow read, write: if true` anywhere in the ruleset.

See inline comments in `firestore.rules` for the reasoning behind each rule, including the one place (rating aggregate fields) where a production deployment with Cloud Functions available should move logic server-side instead of trusting a scoped client update.

## Production checklist

- [ ] Firebase Auth providers enabled (Email/Password, Google)
- [ ] Firestore in production mode with `firestore.rules` deployed
- [ ] `firestore.indexes.json` deployed (composite queries will otherwise throw a "requires an index" error with a direct console link - click it, or deploy the file up front)
- [ ] `.env` configured, **not** committed
- [ ] `npm run build` succeeds locally
- [ ] Vercel env vars set, `vercel.json` present for SPA routing
- [ ] Replace placeholder legal pages (`/legal/*`) with real, reviewed copy before real commercial launch
- [ ] Optional: run `npm run seed` against a fresh project so the site isn't empty on first visit

---

## Notes & known simplifications

This project intentionally has **no backend server** - everything goes through Firestore Security Rules directly from the client, per the brief. A few things are called out in code/rule comments as the spots a real production team would first add Cloud Functions:

- Rating aggregation is done in a client-side Firestore transaction rather than a Cloud Function trigger.
- View/click counters are simple increments (deduped per-tab-per-day via `sessionStorage` for views) rather than a server-validated analytics pipeline.
- Search is client-side substring matching over already-fetched published products (Firestore has no native full-text search) - fine at this scale, but a real production deployment with heavier catalogs would want Algolia/Typesense/Meilisearch instead.
