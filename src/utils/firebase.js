import { initializeApp } from "firebase/app";
import { getAuth,signInWithEmailAndPassword,signOut,createUserWithEmailAndPassword } from "firebase/auth";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const realtimeDb = getDatabase(app);

export const signInUser=async(email,password)=>{
    try{
        await signInWithEmailAndPassword(auth,email,password);
    }catch(e){
        if(e.code ==='auth/invalid-credential'){
            return "invalid credential"
        }
        console.error('error while signing user with email and password',e)
    }
}
export const signOutUser=async()=>{
    try{
        await signOut(auth);
    }catch(e){
        console.error('error signing out user',e);
    }
}
export const createApplicationUser=async(email,password)=>{
    try{
        const result = await createUserWithEmailAndPassword(auth,email,password)
        return result;
    }catch(e){
        console.error(e)
        return 0
    }
}