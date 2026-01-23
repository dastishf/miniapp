// src/services/firebaseTeams.ts
import { db } from "./firebase";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  updateDoc,
  doc,
  arrayUnion
} from "firebase/firestore";

// Создание команды
export async function createTeam(teamName, adminId) {
  const inviteCode = Math.random().toString(36).substr(2, 8).toUpperCase();

  const ref = await addDoc(collection(db, "teams"), {
    name: teamName,
    adminId,
    inviteCode,
    createdAt: Date.now(),
    members: [
      { userId: adminId, role: "admin" }
    ]
  });

  return { teamId: ref.id, inviteCode };
}

// Получить команду по invite-коду
export async function getTeamByInviteCode(code) {
  const q = query(collection(db, "teams"), where("inviteCode", "==", code));
  const snap = await getDocs(q);

  if (snap.empty) return null;

  return { id: snap.docs[0].id, ...snap.docs[0].data() };
}

// Присоединиться к команде
export async function joinTeam(teamId, userId) {
  const ref = doc(db, "teams", teamId);

  await updateDoc(ref, {
    members: arrayUnion({ userId, role: "member" })
  });

  return true;
}

// Обновить роль участника
export async function updateMemberRole(teamId, userId, newRole) {
  const teamRef = doc(db, "teams", teamId);
  const teamSnap = await getDocs(query(collection(db, "teams"), where("__name__", "==", teamId)));

  if (teamSnap.empty) return;

  const team = teamSnap.docs[0].data();
  const members = team.members.map(m =>
    m.userId === userId ? { ...m, role: newRole } : m
  );

  await updateDoc(teamRef, { members });
}