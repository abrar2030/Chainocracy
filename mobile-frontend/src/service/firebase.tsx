import { initializeApp } from "firebase/app";
import { getDownloadURL, getStorage, listAll, ref, uploadBytes } from "firebase/storage";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDummyKeyForDeployment123456789",
  authDomain: "chainocracy-voter.firebaseapp.com",
  projectId: "chainocracy-voter",
  storageBucket: "chainocracy-voter.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

export { storage, ref, getDownloadURL, uploadBytes, listAll };
