import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// Добавьте эти импорты сверху, если их нет
import { collection, query, where, getDocs } from "firebase/firestore";


export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
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
