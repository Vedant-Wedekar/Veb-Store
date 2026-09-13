import { doc, getDoc, updateDoc, collection, getDocs, query, where, limit as fbLimit } from "firebase/firestore";
import { db } from "../firebase/config";
import type { UserProfile } from "../types";
import { isValidUsername } from "../utils/slug";

export async function getUserByUid(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(db, "users", uid));
  if (!snap.exists()) return null;
  return { uid, ...(snap.data() as any) } as UserProfile;
}

export async function getUserByUsername(username: string): Promise<UserProfile | null> {
  const q = query(collection(db, "users"), where("username", "==", username.toLowerCase()), fbLimit(1));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const d = snap.docs[0];
  return { uid: d.id, ...(d.data() as any) } as UserProfile;
}

export async function listDevelopers(max = 60): Promise<UserProfile[]> {
  const snap = await getDocs(query(collection(db, "users"), fbLimit(max)));
  return snap.docs.map((d) => ({ uid: d.id, ...(d.data() as any) } as UserProfile));
}

export async function updateUserProfile(uid: string, data: Partial<UserProfile>): Promise<void> {
  const { uid: _u, username, email, createdAt, ...rest } = data as any;
  await updateDoc(doc(db, "users", uid), rest);
}

export async function changeUsername(uid: string, newUsername: string): Promise<void> {
  const clean = newUsername.toLowerCase().trim();
  if (!isValidUsername(clean)) throw new Error("Invalid username format.");
  const taken = await getDoc(doc(db, "usernames", clean));
  if (taken.exists()) throw new Error("Username already taken.");
  await updateDoc(doc(db, "users", uid), { username: clean });
}

export function profileCompleteness(profile: UserProfile): { percent: number; missing: string[] } {
  const checks: [boolean, string][] = [
    [!!profile.photoURL, "Add a profile image"],
    [!!profile.bio, "Add a short bio"],
    [!!profile.headline, "Add a headline"],
    [!!profile.github, "Add your GitHub"],
    [(profile.skills || []).length > 0, "Add your skills"],
    [!!profile.location, "Add your location"],
  ];
  const done = checks.filter(([ok]) => ok).length;
  const missing = checks.filter(([ok]) => !ok).map(([, label]) => label);
  return { percent: Math.round((done / checks.length) * 100), missing };
}
