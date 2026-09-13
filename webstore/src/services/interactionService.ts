import {
  collection,
  doc,
  addDoc,
  deleteDoc,
  getDocs,
  getDoc,
  setDoc,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase/config";
import type { Bookmark, Report } from "../types";
import { applyRatingTransaction } from "./productService";

// ---------- Ratings ----------

export async function getUserRatingForProduct(productId: string, userId: string): Promise<number | null> {
  const ref = doc(db, "ratings", `${productId}_${userId}`);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return (snap.data().value as number) ?? null;
}

export async function rateProduct(productId: string, userId: string, value: number): Promise<void> {
  const ref = doc(db, "ratings", `${productId}_${userId}`);
  const existing = await getDoc(ref);
  const previousValue = existing.exists() ? (existing.data().value as number) : null;

  await setDoc(
    ref,
    {
      productId,
      userId,
      value,
      createdAt: existing.exists() ? existing.data().createdAt : serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );

  await applyRatingTransaction(productId, previousValue, value);
}

// ---------- Bookmarks ----------

export async function isBookmarked(productId: string, userId: string): Promise<boolean> {
  const ref = doc(db, "bookmarks", `${productId}_${userId}`);
  const snap = await getDoc(ref);
  return snap.exists();
}

export async function toggleBookmark(productId: string, userId: string): Promise<boolean> {
  const ref = doc(db, "bookmarks", `${productId}_${userId}`);
  const snap = await getDoc(ref);
  if (snap.exists()) {
    await deleteDoc(ref);
    return false;
  }
  await setDoc(ref, { productId, userId, createdAt: serverTimestamp() });
  return true;
}

export async function listBookmarkedProductIds(userId: string): Promise<string[]> {
  const q = query(collection(db, "bookmarks"), where("userId", "==", userId));
  const snap = await getDocs(q);
  return snap.docs.map((d) => (d.data() as Bookmark).productId);
}

// ---------- Reports ----------

export async function submitReport(
  targetType: Report["targetType"],
  targetId: string,
  reporterId: string,
  reason: string,
  details?: string
): Promise<void> {
  await addDoc(collection(db, "reports"), {
    targetType,
    targetId,
    reporterId,
    reason,
    details: details || "",
    createdAt: serverTimestamp(),
  });
}
