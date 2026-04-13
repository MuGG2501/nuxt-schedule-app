import { getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import {
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  type User,
} from "firebase/auth";
import { computed, ref } from "vue";

let firebaseApp: FirebaseApp | null = null;
let authInitialized = false;
const currentUser = ref<User | null>(null);

const getApp = () => {
  if (process.server) {
    return null;
  }

  if (!firebaseApp) {
    const config = useRuntimeConfig().public.firebase;
    if (!config?.apiKey) {
      return null;
    }
    firebaseApp = initializeApp(config);
  }

  return firebaseApp;
};

export const getDb = () => {
  if (process.server) {
    return null;
  }

  const app = getApp();
  if (!app) {
    return null;
  }

  return getFirestore(app);
};

export const useAuth = () => {
  const auth = !process.server ? getAuth(getApp()!) : null;

  if (!process.server && !authInitialized) {
    authInitialized = true;
    onAuthStateChanged(auth, (user) => {
      currentUser.value = user;
    });
  }

  const login = async () => {
    if (!auth) {
      throw new Error("Firebase Auth is not initialized.");
    }
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const logout = async () => {
    if (!auth) {
      return;
    }
    await signOut(auth);
  };

  return {
    user: currentUser,
    isLoggedIn: computed(() => !!currentUser.value),
    login,
    logout,
  };
};
