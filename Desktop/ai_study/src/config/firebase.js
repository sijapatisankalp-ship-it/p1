import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase only if config is present
let app;
let db;

try {
    if (firebaseConfig.apiKey && !firebaseConfig.apiKey.includes('your_api_key')) {
        app = initializeApp(firebaseConfig);
        db = getFirestore(app);
        console.log('✅ Firebase initialized successfully');
    } else {
        console.log('ℹ️ Firebase not configured - using localStorage');
    }
} catch (error) {
    console.error('Firebase initialization error:', error);
}

export { db };
