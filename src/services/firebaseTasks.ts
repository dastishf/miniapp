// src/services/firebaseTasks.ts
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  doc,
  getFirestore,
} from "firebase/firestore";

import { app } from "./firebaseConfig"; // ⚠️ убедись что этот файл существует!
const db = getFirestore(app);

// ---------------- CREATE ----------------
export async function createTask(data: any) {
  const colRef = collection(db, "tasks");
  await addDoc(colRef, data);
}

// ---------------- UPDATE ----------------
export async function updateTask(id: string, data: any) {
  const docRef = doc(db, "tasks", id);
  await updateDoc(docRef, data);
}

// ---------------- DELETE ----------------
export async function deleteTask(id: string) {
  const docRef = doc(db, "tasks", id);
  await deleteDoc(docRef);
}

// ---------------- SUBSCRIBE ----------------
export function subscribeToTasks(teamId: string, callback: (tasks: any[]) => void) {
  const colRef = collection(db, "tasks");
  const q = query(colRef, where("teamId", "==", teamId));

  const unsub = onSnapshot(q, (snapshot) => {
    const tasks: any[] = [];
    snapshot.forEach((doc) => {
      tasks.push({ id: doc.id, ...doc.data() });
    });
    callback(tasks);
  });

  return unsub;
}