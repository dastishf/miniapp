// src/services/firebaseUsers.ts
import { db } from "./firebase";
import { doc, setDoc } from "firebase/firestore";

export async function saveUser(userId, userData) {
  await setDoc(doc(db, "users", userId), userData, { merge: true });
}
