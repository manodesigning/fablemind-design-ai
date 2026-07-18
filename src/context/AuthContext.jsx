import { createContext, useContext, useState, useEffect } from 'react';
import {
  onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword,
  signInWithRedirect, getRedirectResult,
  GoogleAuthProvider, signOut, updateProfile,
} from 'firebase/auth';
import { auth } from '../config/firebase';

const AuthContext = createContext(null);

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [redirectError, setRedirectError] = useState(null);

  useEffect(() => {
    // Check if we're returning from a Google redirect sign-in
    getRedirectResult(auth)
      .then((result) => {
        if (result?.user) {
          // Redirect sign-in succeeded — onAuthStateChanged will handle navigation
          console.log('Redirect sign-in success:', result.user.email);
        }
      })
      .catch((err) => {
        console.error('Redirect result error:', err);
        setRedirectError(err);
      });

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

  // Use redirect-only (works on all browsers/extensions without popup interference)
  const loginWithGoogle = () => signInWithRedirect(auth, googleProvider);

  const logout = () => signOut(auth);

  return (
    <AuthContext.Provider value={{ user, loading, redirectError, login, signup, loginWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
