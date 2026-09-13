/**
 * Seeds WebStore with realistic demo data: ~8 developers and ~14 products
 * spread across categories and technologies, with sample ratings/reviews.
 *
 * Uses firebase-admin so it can write directly, bypassing client security
 * rules (seed data needs to set arbitrary ownerId/timestamps that a real
 * signed-in client could never set for another user).
 *
 * Setup:
 *   1. Firebase Console -> Project Settings -> Service Accounts
 *      -> Generate new private key -> save as scripts/serviceAccountKey.json
 *      (this file is gitignored — never commit it)
 *   2. node scripts/seed.mjs
 */
import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore, Timestamp } from "firebase-admin/firestore";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const keyPath = join(__dirname, "serviceAccountKey.json");

let serviceAccount;
try {
  serviceAccount = JSON.parse(readFileSync(keyPath, "utf-8"));
} catch {
  console.error(
    "\nMissing scripts/serviceAccountKey.json.\n" +
      "Download it from Firebase Console -> Project Settings -> Service Accounts -> Generate new private key,\n" +
      "save it as scripts/serviceAccountKey.json, then re-run this script.\n"
  );
  process.exit(1);
}

initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

const daysAgo = (n) => Date.now() - n * 24 * 60 * 60 * 1000;

const DEVELOPERS = [
  { name: "Riya Sharma", username: "riyasharma", headline: "Frontend engineer & UI tinkerer", skills: ["React", "TypeScript", "Tailwind CSS"], location: "Bengaluru, India" },
  { name: "Marcus Chen", username: "marcuschen", headline: "Full-stack indie hacker", skills: ["Next.js", "Node.js", "PostgreSQL"], location: "Toronto, Canada" },
  { name: "Amara Okafor", username: "amaraokafor", headline: "Building developer tools", skills: ["Python", "Django", "Docker"], location: "Lagos, Nigeria" },
  { name: "Lucas Silva", username: "lucassilva", headline: "Student developer & AI enthusiast", skills: ["Python", "Flask", "Firebase"], location: "São Paulo, Brazil" },
  { name: "Hana Kobayashi", username: "hanakobayashi", headline: "Product designer turned developer", skills: ["Vue", "Figma", "Tailwind CSS"], location: "Tokyo, Japan" },
  { name: "Omar Farouk", username: "omarfarouk", headline: "Backend engineer, open source contributor", skills: ["Java", "Spring Boot", "MySQL"], location: "Cairo, Egypt" },
  { name: "Elena Petrova", username: "elenapetrova", headline: "SaaS founder", skills: ["React", "Firebase", "Stripe"], location: "Berlin, Germany" },
  { name: "Devon Brooks", username: "devonbrooks", headline: "CS student, weekend builder", skills: ["JavaScript", "MongoDB", "Node.js"], location: "Austin, USA" },
];

const PRODUCTS = [
  { name: "TaskFlow", tagline: "A calm, keyboard-first task manager", category: "Productivity", technologies: ["React", "Firebase", "Tailwind CSS"], pricingType: "Freemium", ownerIdx: 0 },
  { name: "PixelPrep", tagline: "Batch-resize and optimize images for the web", category: "Developer Tools", technologies: ["Node.js", "React"], pricingType: "Free", ownerIdx: 1 },
  { name: "StudyLoop", tagline: "Spaced-repetition flashcards for CS students", category: "Education", technologies: ["Python", "Flask", "Firebase"], pricingType: "Free", ownerIdx: 3 },
  { name: "InvoiceHQ", tagline: "Simple invoicing for freelance developers", category: "Finance", technologies: ["Next.js", "PostgreSQL"], pricingType: "Paid", ownerIdx: 1 },
  { name: "MoodMap", tagline: "Track your mood with tiny daily check-ins", category: "Health", technologies: ["Vue", "Firebase"], pricingType: "Free", ownerIdx: 4 },
  { name: "DevMeet", tagline: "Find local developer meetups near you", category: "Social", technologies: ["React", "Node.js", "MongoDB"], pricingType: "Free", ownerIdx: 7 },
  { name: "PaletteForge", tagline: "Generate accessible color palettes instantly", category: "Design", technologies: ["Vue", "Tailwind CSS"], pricingType: "Free", ownerIdx: 4 },
  { name: "ShortStack", tagline: "URL shortener with click analytics", category: "Utilities", technologies: ["Node.js", "Express", "MongoDB"], pricingType: "Open Source", ownerIdx: 7 },
  { name: "PlayByte", tagline: "Tiny browser puzzle games, one per day", category: "Games", technologies: ["JavaScript", "React"], pricingType: "Free", ownerIdx: 3 },
  { name: "CommitCraft", tagline: "AI-assisted commit message generator", category: "AI", technologies: ["Python", "Django"], pricingType: "Freemium", ownerIdx: 2 },
  { name: "ShelfSpace", tagline: "A cozy reading tracker for book lovers", category: "Entertainment", technologies: ["React", "Firebase"], pricingType: "Free", ownerIdx: 0 },
  { name: "RouteBoard", tagline: "Visual API route documentation generator", category: "Developer Tools", technologies: ["Java", "Spring Boot"], pricingType: "Open Source", ownerIdx: 5 },
  { name: "CartLoop", tagline: "Lightweight storefront starter kit", category: "E-commerce", technologies: ["Next.js", "Stripe", "PostgreSQL"], pricingType: "Free Trial", ownerIdx: 6 },
  { name: "GradeGrid", tagline: "A student capstone project — grade tracker", category: "Student Projects", technologies: ["Python", "Flask"], pricingType: "Open Source", ownerIdx: 3 },
];

async function seed() {
  console.log("Seeding developers...");
  const devIds = [];
  for (const dev of DEVELOPERS) {
    const ref = db.collection("users").doc();
    await ref.set({
      name: dev.name,
      username: dev.username,
      email: `${dev.username}@example.com`,
      headline: dev.headline,
      bio: `${dev.name.split(" ")[0]} is a developer on WebStore. ${dev.headline}.`,
      location: dev.location,
      skills: dev.skills,
      productCount: 0,
      totalViews: 0,
      totalClicks: 0,
      avgRating: 0,
      createdAt: Timestamp.fromMillis(daysAgo(200 - Math.random() * 150)),
      isSeed: true,
    });
    await db.collection("usernames").doc(dev.username).set({ uid: ref.id });
    devIds.push(ref.id);
    console.log(`  + ${dev.name} (@${dev.username})`);
  }

  console.log("Seeding products...");
  for (const p of PRODUCTS) {
    const dev = DEVELOPERS[p.ownerIdx];
    const ownerId = devIds[p.ownerIdx];
    const slugBase = p.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const launchDaysAgo = Math.floor(Math.random() * 90);
    const ratingCount = 4 + Math.floor(Math.random() * 40);
    const ratingAvg = Math.round((3.6 + Math.random() * 1.4) * 10) / 10;
    const dist = { "1": 0, "2": 0, "3": Math.round(ratingCount * 0.1), "4": Math.round(ratingCount * 0.35), "5": 0 };
    dist["5"] = Math.max(0, ratingCount - dist["3"] - dist["4"]);

    const ref = db.collection("products").doc();
    await ref.set({
      ownerId,
      ownerName: dev.name,
      ownerUsername: dev.username,
      name: p.name,
      slug: slugBase,
      tagline: p.tagline,
      description: `${p.name} is a demo product seeded for WebStore. ${p.tagline}. Built with ${p.technologies.join(", ")}.`,
      problemSolved: `Helps users with tasks related to ${p.category.toLowerCase()}.`,
      features: ["Fast and lightweight", "Clean, focused interface", "Works great on mobile"],
      category: p.category,
      tags: [p.category.toLowerCase(), p.pricingType.toLowerCase()],
      technologies: p.technologies,
      websiteUrl: `https://example.com/${slugBase}`,
      githubUrl: p.pricingType === "Open Source" ? `https://github.com/${dev.username}/${slugBase}` : "",
      screenshots: [],
      pricingType: p.pricingType,
      targetAudience: "Developers and everyday users",
      status: "published",
      launchDate: Timestamp.fromMillis(daysAgo(launchDaysAgo)),
      createdAt: Timestamp.fromMillis(daysAgo(launchDaysAgo)),
      updatedAt: Timestamp.fromMillis(daysAgo(Math.max(0, launchDaysAgo - 5))),
      views: 50 + Math.floor(Math.random() * 4000),
      clicks: 10 + Math.floor(Math.random() * 800),
      ratingAvg,
      ratingCount,
      reviewCount: 0,
      ratingDistribution: dist,
      featured: Math.random() > 0.8,
      isSeed: true,
    });
    console.log(`  + ${p.name} (@${dev.username})`);
  }

  console.log("\nDone. Seeded", DEVELOPERS.length, "developers and", PRODUCTS.length, "products.");
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
