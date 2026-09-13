import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit as fbLimit,
  increment,
  runTransaction,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { db } from "../firebase/config";
import type { Product, ProductStatus } from "../types";
import { slugify, randomSuffix } from "../utils/slug";

const PRODUCTS = "products";

function toProduct(id: string, data: any): Product {
  const toMillis = (v: any) => (v instanceof Timestamp ? v.toMillis() : v || Date.now());
  return {
    id,
    ...data,
    launchDate: toMillis(data.launchDate),
    createdAt: toMillis(data.createdAt),
    updatedAt: toMillis(data.updatedAt),
  } as Product;
}

export async function generateUniqueSlug(name: string): Promise<string> {
  const base = slugify(name) || "product";
  let candidate = base;
  for (let i = 0; i < 5; i++) {
    const q = query(collection(db, PRODUCTS), where("slug", "==", candidate), fbLimit(1));
    const snap = await getDocs(q);
    if (snap.empty) return candidate;
    candidate = `${base}-${randomSuffix(4)}`;
  }
  return `${base}-${randomSuffix(6)}`;
}

export async function createProduct(
  data: Omit<
    Product,
    | "id"
    | "views"
    | "clicks"
    | "ratingAvg"
    | "ratingCount"
    | "reviewCount"
    | "createdAt"
    | "updatedAt"
  >
): Promise<string> {
  const ref = await addDoc(collection(db, PRODUCTS), {
    ...data,
    views: 0,
    clicks: 0,
    ratingAvg: 0,
    ratingCount: 0,
    reviewCount: 0,
    ratingDistribution: { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 },
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateProduct(id: string, data: Partial<Product>): Promise<void> {
  const { id: _id, ownerId, createdAt, ...rest } = data as any;
  await updateDoc(doc(db, PRODUCTS, id), { ...rest, updatedAt: serverTimestamp() });
}

export async function deleteProduct(id: string): Promise<void> {
  await deleteDoc(doc(db, PRODUCTS, id));
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const q = query(collection(db, PRODUCTS), where("slug", "==", slug), fbLimit(1));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const d = snap.docs[0];
  return toProduct(d.id, d.data());
}

export async function getProductById(id: string): Promise<Product | null> {
  const snap = await getDoc(doc(db, PRODUCTS, id));
  if (!snap.exists()) return null;
  return toProduct(snap.id, snap.data());
}

export async function listPublishedProducts(max = 60): Promise<Product[]> {
  const q = query(
    collection(db, PRODUCTS),
    where("status", "==", "published"),
    orderBy("createdAt", "desc"),
    fbLimit(max)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => toProduct(d.id, d.data()));
}

export async function listProductsByOwner(ownerId: string): Promise<Product[]> {
  const q = query(collection(db, PRODUCTS), where("ownerId", "==", ownerId), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => toProduct(d.id, d.data()));
}

export async function listProductsByCategory(category: string, max = 40): Promise<Product[]> {
  const q = query(
    collection(db, PRODUCTS),
    where("status", "==", "published"),
    where("category", "==", category),
    orderBy("createdAt", "desc"),
    fbLimit(max)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => toProduct(d.id, d.data()));
}

export async function listProductsByTechnology(tech: string, max = 40): Promise<Product[]> {
  const q = query(
    collection(db, PRODUCTS),
    where("status", "==", "published"),
    where("technologies", "array-contains", tech),
    fbLimit(max)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => toProduct(d.id, d.data()));
}

/** Simple client-side search across cached published products (Firestore has no full-text search). */
export function searchProducts(products: Product[], term: string): Product[] {
  const t = term.trim().toLowerCase();
  if (!t) return products;
  return products.filter((p) =>
    [
      p.name,
      p.tagline,
      p.description,
      p.ownerName,
      p.ownerUsername,
      ...(p.technologies || []),
      ...(p.tags || []),
      p.category,
    ]
      .join(" ")
      .toLowerCase()
      .includes(t)
  );
}

export async function recordProductView(productId: string): Promise<void> {
  try {
    const key = `wv_${productId}_${new Date().toDateString()}`;
    if (sessionStorage.getItem(key)) return; // one view counted per tab-session per day
    sessionStorage.setItem(key, "1");
    await updateDoc(doc(db, PRODUCTS, productId), { views: increment(1) });
  } catch {
    /* non-critical */
  }
}

export async function recordWebsiteClick(productId: string): Promise<void> {
  try {
    await updateDoc(doc(db, PRODUCTS, productId), { clicks: increment(1) });
  } catch {
    /* non-critical */
  }
}

export async function setProductStatus(id: string, status: ProductStatus): Promise<void> {
  await updateDoc(doc(db, PRODUCTS, id), { status, updatedAt: serverTimestamp() });
}

/** Atomically apply a new rating (add or update) and recompute the aggregate. */
export async function applyRatingTransaction(
  productId: string,
  previousValue: number | null,
  newValue: number
): Promise<void> {
  const productRef = doc(db, PRODUCTS, productId);
  await runTransaction(db, async (tx) => {
    const snap = await tx.get(productRef);
    if (!snap.exists()) throw new Error("Product not found");
    const data = snap.data() as any;
    const dist = { ...(data.ratingDistribution || { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 }) };

    let count = data.ratingCount || 0;
    let total = (data.ratingAvg || 0) * count;

    if (previousValue) {
      total -= previousValue;
      dist[String(previousValue)] = Math.max(0, (dist[String(previousValue)] || 0) - 1);
    } else {
      count += 1;
    }
    total += newValue;
    dist[String(newValue)] = (dist[String(newValue)] || 0) + 1;

    const avg = count > 0 ? total / count : 0;
    tx.update(productRef, { ratingAvg: avg, ratingCount: count, ratingDistribution: dist });
  });
}

export async function bumpReviewCount(productId: string, delta: number): Promise<void> {
  await updateDoc(doc(db, PRODUCTS, productId), { reviewCount: increment(delta) });
}
