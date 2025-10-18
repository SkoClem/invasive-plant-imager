import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  signInWithPopup, 
  signInWithRedirect,
  getRedirectResult,
  signOut, 
  onAuthStateChanged,
  UserCredential 
} from 'firebase/auth';
import { auth, googleProvider } from '../config/firebase';
import { authService, AuthUser } from '../services/authService';

interface AuthContextType {
  currentUser: AuthUser | null;
  firebaseUser: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<UserCredential>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const signInWithGoogle = async (): Promise<UserCredential> => {
    try {
      setLoading(true);
      
      // Detect if we're on mobile device
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      
      let result: UserCredential;
      
      if (isMobile) {
        // Use redirect for mobile devices to avoid popup blocking
        await signInWithRedirect(auth, googleProvider);
        // The result will be handled in the useEffect with getRedirectResult
        return Promise.resolve({} as UserCredential); // Temporary return
      } else {
        // Use popup for desktop
        result = await signInWithPopup(auth, googleProvider);
      }
      
      // Step 2: Get Firebase ID token
      const idToken = await result.user.getIdToken();
      
      // Step 3: Send token to backend and get JWT
      const backendUser = await authService.loginWithFirebaseToken(idToken);
      
      // Step 4: Update local state
      setCurrentUser(backendUser);
      setFirebaseUser(result.user);
      
      console.log('✅ Authentication successful:', backendUser);
      
      return result;
    } catch (error) {
      console.error('❌ Sign in failed:', error);
      
      // Clean up on error
      setCurrentUser(null);
      setFirebaseUser(null);
      authService.logout();
      
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      setLoading(true);
      
      // Step 1: Sign out from Firebase
      await signOut(auth);
      
      // Step 2: Clear backend session
      authService.logout();
      
      // Step 3: Clear local state
      setCurrentUser(null);
      setFirebaseUser(null);
      
      console.log('✅ Logout successful');
    } catch (error) {
      console.error('❌ Sign out failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setLoading(true);
      
      try {
        // Check for redirect result first (mobile authentication)
        const redirectResult = await getRedirectResult(auth);
        if (redirectResult) {
          console.log('📱 Mobile redirect authentication successful');
          const idToken = await redirectResult.user.getIdToken();
          const backendUser = await authService.loginWithFirebaseToken(idToken);
          setCurrentUser(backendUser);
          setFirebaseUser(redirectResult.user);
          setLoading(false);
          return;
        }
        
        if (user) {
          // User is signed in with Firebase
          setFirebaseUser(user);
          
          // Check if we have a valid backend session
          const backendUser = await authService.getCurrentUser();
          
          if (backendUser) {
            // Valid backend session exists
            setCurrentUser(backendUser);
          } else {
            // No valid backend session, need to re-authenticate
            console.log('🔄 Re-authenticating with backend...');
            const idToken = await user.getIdToken();
            const newBackendUser = await authService.loginWithFirebaseToken(idToken);
            setCurrentUser(newBackendUser);
          }
        } else {
          // User is signed out
          setFirebaseUser(null);
          setCurrentUser(null);
          authService.logout();
        }
      } catch (error) {
        console.error('❌ Auth state change error:', error);
        // On error, clear everything
        setFirebaseUser(null);
        setCurrentUser(null);
        authService.logout();
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const value: AuthContextType = {
    currentUser,
    firebaseUser,
    loading,
    signInWithGoogle,
    logout,
    isAuthenticated: currentUser !== null && authService.isAuthenticated()
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};