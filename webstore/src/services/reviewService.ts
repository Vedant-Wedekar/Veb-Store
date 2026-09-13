import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { db } from "../firebase/config";
import type { Review } from "../types";
import { bumpReviewCount } from "./productService";

const REVIEWS = "reviews";

function toReview(id: string, data: any): Review {
  const toMillis = (v: any) => (v instanceof Timestamp ? v.toMillis() : v || Date.now());
  return { id, ...data, createdAt: toMillis(data.createdAt), updatedAt: toMillis(data.updatedAt) } as Review;
}

export async function listReviewsForProduct(productId: string): Promise<Review[]> {
  const q = query(collection(db, REVIEWS), where("productId", "==", productId), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => toReview(d.id, d.data()));
}

export async function getUserReviewForProduct(productId: string, userId: string): Promise<Review | null> {
  const q = query(collection(db, REVIEWS), where("productId", "==", productId), where("authorId", "==", userId));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  return toReview(snap.docs[0].id, snap.docs[0].data());
}

export async function submitReview(
  productId: string,
  authorId: string,
  authorName: string,
  authorAvatar: string | undefined,
  rating: number,
  text: string
): Promise<void> {
  const existing = await getUserReviewForProduct(productId, authorId);
  if (existing) {
    await updateDoc(doc(db, REVIEWS, existing.id), { rating, text, updatedAt: serverTimestamp() });
    return;
  }
  await addDoc(collection(db, REVIEWS), {
    productId,
    authorId,
    authorName,
    authorAvatar: authorAvatar || null,
    rating,
    text,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  await bumpReviewCount(productId, 1);
}

export async function deleteReview(reviewId: string, productId: string): Promise<void> {
  await deleteDoc(doc(db, REVIEWS, reviewId));
  await bumpReviewCount(productId, -1);
}

export async function getReview(reviewId: string): Promise<Review | null> {
  const snap = await getDoc(doc(db, REVIEWS, reviewId));
  if (!snap.exists()) return null;
  return toReview(snap.id, snap.data());
}
