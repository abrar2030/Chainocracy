/* eslint-disable @typescript-eslint/no-explicit-any */
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";
import { getFirestore, collection, doc, setDoc, getDoc, getDocs, updateDoc, deleteDoc, query, where } from "firebase/firestore";
import { getDownloadURL, getStorage, listAll, ref, uploadBytes } from "firebase/storage";
import { getFunctions, httpsCallable } from "firebase/functions";
import { getAnalytics, logEvent } from "firebase/analytics";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: process.env.API_KEY,
    authDomain: process.env.AUTH_DOMAIN,
    projectId: process.env.PROJECT_ID,
    storageBucket: process.env.STORAGE_BUCKET,
    messagingSenderId: process.env.MESSANGING_SENDER_ID,
    appId: process.env.APP_ID,
};

// Initialize Firebase
const firebase = initializeApp(firebaseConfig);
const auth = getAuth(firebase);
const db = getFirestore(firebase);
const storage = getStorage(firebase);
const functions = getFunctions(firebase);
let analytics = null;
let messaging = null;

// Initialize analytics and messaging only in browser environment
if (typeof window !== 'undefined') {
    analytics = getAnalytics(firebase);
    try {
        messaging = getMessaging(firebase);
    } catch (error) {
        console.error("Messaging not supported or blocked:", error);
    }
}

// Authentication functions
export const registerUser = async (email, password, userData) => {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // Store additional user data in Firestore
        await setDoc(doc(db, "users", user.uid), {
            ...userData,
            email,
            createdAt: new Date(),
            updatedAt: new Date()
        });
        
        if (analytics) logEvent(analytics, 'sign_up');
        return { success: true, user };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

export const loginUser = async (email, password) => {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        if (analytics) logEvent(analytics, 'login');
        return { success: true, user: userCredential.user };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

export const logoutUser = async () => {
    try {
        await signOut(auth);
        if (analytics) logEvent(analytics, 'logout');
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

export const getCurrentUser = () => {
    return new Promise((resolve, reject) => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            unsubscribe();
            resolve(user);
        }, reject);
    });
};

// Firestore functions
export const getUserData = async (userId) => {
    try {
        const docRef = doc(db, "users", userId);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
            return { success: true, data: docSnap.data() };
        } else {
            return { success: false, error: "User data not found" };
        }
    } catch (error) {
        return { success: false, error: error.message };
    }
};

export const updateUserData = async (userId, data) => {
    try {
        const userRef = doc(db, "users", userId);
        await updateDoc(userRef, {
            ...data,
            updatedAt: new Date()
        });
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

// Storage functions
export const loadImages = async (setImageList) => {
    const imageListRef = ref(storage, 'images');
    await listAll(imageListRef).then(res => {
        res.items.forEach((item) => {
            getDownloadURL(item).then((url) => {
                const username = item._location.path_.split('/')[1];
                setImageList((prev) => {
                    return { ...prev, [username]: url };
                });
            });
        });
    });
};

export const uploadImage = async (file, filename, setImageList) => {
    if (file === null || file === undefined || filename == '')
        return;
    const imageRef = ref(storage, `images/${filename}`);
    await uploadBytes(imageRef, file).then((snapshot) => {
        getDownloadURL(snapshot.ref).then((url) => {
            setImageList((prev) => {
                return { ...prev, [filename]: url };
            });
        });
    });
};

export const loadSpeech = async (setSpeechList) => {
    const audioRef = ref(storage, 'audio');
    await listAll(audioRef).then(res => {
        res.items.forEach((item) => {
            getDownloadURL(item).then((url) => {
                const speech = item._location.path_.split('/')[1];
                setSpeechList((prev) => {
                    return { ...prev, [speech]: url };
                });
            });
        });
    });
};

export const uploadSpeech = async (file, filename, setSpeechList) => {
    if (file === null || file === undefined || filename == '')
        return;
    const audioRef = ref(storage, `audio/${filename}`);
    await uploadBytes(audioRef, file).then((snapshot) => {
        getDownloadURL(snapshot.ref).then((url) => {
            setSpeechList((prev) => {
                return { ...prev, [filename]: url };
            });
        });
    });
};

// Cloud Functions
export const callCloudFunction = async (functionName, data) => {
    try {
        const cloudFunction = httpsCallable(functions, functionName);
        const result = await cloudFunction(data);
        return { success: true, data: result.data };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

// Messaging functions
export const requestNotificationPermission = async () => {
    if (!messaging) return { success: false, error: "Messaging not supported" };
    
    try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
            const token = await getToken(messaging);
            return { success: true, token };
        } else {
            return { success: false, error: "Notification permission denied" };
        }
    } catch (error) {
        return { success: false, error: error.message };
    }
};

export const onMessageListener = (callback) => {
    if (!messaging) return () => {};
    
    return onMessage(messaging, (payload) => {
        callback(payload);
    });
};

export default firebase;
