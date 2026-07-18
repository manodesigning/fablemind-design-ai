import { createContext, useContext, useState, useEffect } from 'react';
import {
  onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword,
  signInWithPopup, signInWithRedirect, getRedirectResult,
  GoogleAuthProvider, signOut, updateProfile,
} from 'firebase/auth';
import { auth } from '../config/firebase';

const AuthContext = createContext(null);

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Use popup on localhost (dev), redirect on production (more reliable on hosted apps)
const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Handle the result when user returns from Google redirect
    if (!isLocalhost) {
      getRedirectResult(auth)
        .then((result) => {
          if (result?.user) {
            console.log('Google redirect sign-in success');
          }
        })
        .catch((err) => {
          console.error('Redirect result error:', err.code, err.message);
        });
    }

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const login = (email, password) =>
    signInWithEmailAndPassword(auth, email, password);

  const signup = async (email, password, displayName) => {
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    if (displayName) {
      await updateProfile(credential.user, { displayName });
    }
    return credential;
  };

  const loginWithGoogle = async () => {
    if (isLocalhost) {
      // On localhost: use popup (simpler, works without OAuth redirect config)
      return await signInWithPopup(auth, googleProvider);
    } else {
      // On production (Vercel etc): use redirect (no popup blocking issues)
      await signInWithRedirect(auth, googleProvider);
      // Page redirects to Google — no return value here
    }
  };

  const logout = () => signOut(auth);

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, loginWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
