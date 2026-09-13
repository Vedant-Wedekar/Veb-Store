import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile,
  type User,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase/config";
import { isValidUsername } from "../utils/slug";
import type { UserProfile } from "../types";

export function friendlyAuthError(code: string): string {
  const map: Record<string, string> = {
    "auth/email-already-in-use": "An account with this email already exists.",
    "auth/invalid-email": "That email address doesn't look right.",
    "auth/weak-password": "Password should be at least 6 characters.",
    "auth/user-not-found": "No account found with that email.",
    "auth/wrong-password": "Incorrect password. Try again.",
    "auth/invalid-credential": "Incorrect email or password.",
    "auth/too-many-requests": "Too many attempts. Please wait a moment and try again.",
    "auth/popup-closed-by-user": "Sign-in was cancelled.",
    "auth/network-request-failed": "Network error. Check your connection and try again.",
  };
  return map[code] || "Something went wrong. Please try again.";
}

async function usernameTaken(username: string): Promise<boolean> {
  const ref = doc(db, "usernames", username);
  const snap = await getDoc(ref);
  return snap.exists();
}

export async function registerUser(
  name: string,
  username: string,
  email: string,
  password: string
): Promise<User> {
  const cleanUsername = username.toLowerCase().trim();
  if (!isValidUsername(cleanUsername)) {
    throw new Error("Username must be 3-30 characters: lowercase letters, numbers, hyphens.");
  }
  if (await usernameTaken(cleanUsername)) {
    throw new Error("That username is already taken.");
  }

  const cred = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(cred.user, { displayName: name });

  const profile: Omit<UserProfile, "uid"> = {
    name,
    username: cleanUsername,
    email,
    skills: [],
    productCount: 0,
    totalViews: 0,
    totalClicks: 0,
    avgRating: 0,
    createdAt: Date.now(),
  };

  await setDoc(doc(db, "users", cred.user.uid), profile);
  await setDoc(doc(db, "usernames", cleanUsername), { uid: cred.user.uid });

  return cred.user;
}

export async function loginUser(email: string, password: string): Promise<User> {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return cred.user;
}

export async function logoutUser(): Promise<void> {
  await signOut(auth);
}

export async function resetPassword(email: string): Promise<void> {
  await sendPasswordResetEmail(auth, email);
}

export async function signInWithGoogle(): Promise<User> {
  const provider = new GoogleAuthProvider();
  const cred = await signInWithPopup(auth, provider);
  const existing = await getDoc(doc(db, "users", cred.user.uid));
  if (!existing.exists()) {
    let base = (cred.user.displayName || cred.user.email || "dev").split("@")[0];
    base = base.toLowerCase().replace(/[^a-z0-9-]/g, "").slice(0, 20) || "dev";
    let candidate = base;
    let n = 1;
    while (await usernameTaken(candidate)) {
      candidate = `${base}${n++}`;
    }
    const profile: Omit<UserProfile, "uid"> = {
      name: cred.user.displayName || "Developer",
      username: candidate,
      email: cred.user.email || "",
      photoURL: cred.user.photoURL || undefined,
      skills: [],
      productCount: 0,
      totalViews: 0,
      totalClicks: 0,
      avgRating: 0,
      createdAt: Date.now(),
    };
    await setDoc(doc(db, "users", cred.user.uid), profile);
    await setDoc(doc(db, "usernames", candidate), { uid: cred.user.uid });
  }
  return cred.user;
}
