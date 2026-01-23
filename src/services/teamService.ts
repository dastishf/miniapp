import { db } from "./firebaseConfig";
import { collection, query, where, getDocs } from "firebase/firestore";

export const findTeamByCode = async (code: string) => {
  const teamsRef = collection(db, "teams");
  const q = query(teamsRef, where("code", "==", code.toUpperCase()));
  const querySnapshot = await getDocs(q);
  
  if (querySnapshot.empty) return null;
  
  const doc = querySnapshot.docs[0];
  return { id: doc.id, ...doc.data() };
};