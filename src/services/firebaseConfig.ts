import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// Добавьте эти импорты сверху, если их нет
import { collection, query, where, getDocs } from "firebase/firestore";


export const firebaseConfig = {
  apiKey: "AIzaSyC5-sjGTuwPPsFTiPfic7WURPIgrAB_DA4",
  authDomain: "atriumtasks.firebaseapp.com",
  projectId: "atriumtasks",
  storageBucket: "atriumtasks.firebasestorage.app",
  messagingSenderId: "763426705770",
  appId: "1:763426705770:web:fb462d361f0fb4a7965513",
};

// ✅ ВАЖНО: экспортируем app
export const app = initializeApp(firebaseConfig);

// ✅ Firestore
export const db = getFirestore(app);

// Добавьте эту функцию в конец файла
export const findTeamByCode = async (code: string) => {
  const teamsRef = collection(db, "teams");
  const q = query(teamsRef, where("code", "==", code.toUpperCase()));
  const querySnapshot = await getDocs(q);
  
  if (querySnapshot.empty) return null;
  
  const doc = querySnapshot.docs[0];
  return { id: doc.id, ...doc.data() };
};
