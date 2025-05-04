import { initializeApp } from "firebase/app";
import { getStorage ,ref,getDownloadURL} from "firebase/storage";
import { getFirestore } from "firebase/firestore";


const firebaseConfig = {
    apiKey: "AIzaSyBXvnqGFnLcrTz3G8spUsjYGJwajlgOPjE",
    authDomain: "sarimageprocessing-b5de0.com",
    projectId: "sarimageprocessing-b5de0",
    storageBucket:  "sarimageprocessing-b5de0.appspot.com",
    messagingSenderId: "262038456095",
    appId:"1:1053821472135:web:dd25a38c648cfb9aa65722",
    measurementId: "G-ZNKJT8Z967"
  };

const app = initializeApp(firebaseConfig);

export const storage = getStorage(app);
export const firestore = getFirestore(app); 
