import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  projectId: "gen-lang-client-0945164734",
  appId: "1:121943070802:web:f9523bd54fec03fa8de78b",
  apiKey: "AIzaSyBogXRay4vH9GJ34t_bDWiCL0pP0xOg4Ks",
  authDomain: "gen-lang-client-0945164734.firebaseapp.com",
  storageBucket: "gen-lang-client-0945164734.firebasestorage.app",
  messagingSenderId: "121943070802"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, "ai-studio-tushopes-c009155b-f39b-4149-ac03-3cd196d3e981");
export const auth = getAuth(app);
