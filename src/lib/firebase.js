import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { getStorage, ref, uploadString, getDownloadURL } from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyMockKeyForDevModeOnly12345',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'awas-india-portal.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'awas-india-portal',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'awas-india-portal.appspot.com',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '1234567890',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:1234567890:web:abcdef123456'
};

export const isFirebaseConfigured = () => {
  return (
    import.meta.env.VITE_FIREBASE_API_KEY &&
    !import.meta.env.VITE_FIREBASE_API_KEY.includes('MockKey')
  );
};

// Initialize Firebase App
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const storage = getStorage(app);

// Auth Helpers with graceful fallback for dev testing
export const firebaseAuthHelper = {
  signIn: async (email, password) => {
    if (isFirebaseConfigured()) {
      return await signInWithEmailAndPassword(auth, email, password);
    }
    // Dev Mode Fallback
    return {
      user: {
        uid: 'dev_user_' + Date.now(),
        email: email,
        displayName: email.split('@')[0].toUpperCase(),
        role: email.includes('admin') ? 'admin' : 'user'
      }
    };
  },

  signUp: async (email, password, displayName, state) => {
    if (isFirebaseConfigured()) {
      const userCred = await createUserWithEmailAndPassword(auth, email, password);
      if (displayName) {
        await updateProfile(userCred.user, { displayName });
      }
      return userCred;
    }
    // Dev Mode Fallback
    return {
      user: {
        uid: 'dev_user_' + Date.now(),
        email: email,
        displayName: displayName || email.split('@')[0],
        state: state,
        role: 'user'
      }
    };
  },

  logout: async () => {
    if (isFirebaseConfigured()) {
      return await signOut(auth);
    }
    return true;
  },

  uploadImage: async (base64Data, path) => {
    if (isFirebaseConfigured()) {
      const storageRef = ref(storage, path);
      await uploadString(storageRef, base64Data, 'data_url');
      return await getDownloadURL(storageRef);
    }
    // Dev Mode fallback (returns optimized data URL)
    return base64Data;
  }
};
