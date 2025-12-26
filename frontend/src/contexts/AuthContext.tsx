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
  signInWithGoogle: () => Promise<UserCredential | null>;
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

  const signInWithGoogle = async (): Promise<UserCredential | null> => {
    try {
      setLoading(true);
      console.log('🚀 Starting Google sign-in process...');
      
      // Unified authentication strategy: Popup first, then Redirect fallback
      // This works for both Desktop and Mobile (modern mobile browsers support popups on click)
      console.log('🔐 Attempting popup authentication...');
      
      let result: UserCredential;
      
      try {
        // Try popup first
        // Use the existing googleProvider but ensure we select account
        googleProvider.setCustomParameters({ prompt: 'select_account' });
        result = await signInWithPopup(auth, googleProvider);
        console.log('✅ Popup authentication successful:', result.user.email);
        
        // Handle successful popup sign-in
        const user = result.user;
        setFirebaseUser(user);
        
        // Authenticate with backend
        try {
          console.log('🔄 Authenticating with backend...');
          const idToken = await user.getIdToken();
          const backendUser = await authService.loginWithFirebaseToken(idToken);
          setCurrentUser(backendUser);
          console.log('✅ Backend authentication complete:', backendUser);
        } catch (backendError) {
          console.error('❌ Backend authentication failed:', backendError);
          // If backend fails, still set Firebase user (partial auth)
          // This allows the UI to show logged-in state even if backend is unreachable
          setCurrentUser(null);
          console.log('⚠️ Proceeding with Firebase-only authentication');
        }
        
        return result;
      } catch (popupError: any) {
        console.warn('⚠️ Popup authentication failed, falling back to redirect:', popupError);
        
        // If popup fails (e.g. blocked), fall back to redirect
        // This is common on some mobile browsers or strict settings
        if (popupError.code === 'auth/popup-blocked' || 
            popupError.code === 'auth/popup-closed-by-user' ||
            popupError.code === 'auth/cancelled-popup-request' ||
            popupError.code === 'auth/operation-not-supported-in-this-environment') {
            
          console.log('🔄 Initiating redirect authentication fallback...');
          await signInWithRedirect(auth, googleProvider);
          return null; // Redirect initiated
        }
        
        throw popupError;
      }
    } catch (error) {
      console.error('❌ Google sign-in error:', error);
      setLoading(false);
      throw error;
    }
  };

  const logout = async () => {
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

  // New: Handle redirect result on initial mount (mobile flow)
  useEffect(() => {
    const handleRedirectResult = async () => {
      try {
        console.log('📱 Checking for redirect result on mount...');
        const redirectResult = await getRedirectResult(auth);
        if (redirectResult) {
          console.log('📱 Mobile redirect authentication successful:', redirectResult.user.email);
          try {
            console.log('🔑 Getting ID token from redirect result...');
            const idToken = await redirectResult.user.getIdToken();
            console.log('🔄 Authenticating redirect user with backend...');
            const backendUser = await authService.loginWithFirebaseToken(idToken);
            setCurrentUser(backendUser);
            setFirebaseUser(redirectResult.user);
            console.log('✅ Mobile authentication complete:', backendUser);
          } catch (backendError) {
            console.error('❌ Mobile backend authentication failed:', backendError);
            // If backend fails, still set Firebase user but show error
            setFirebaseUser(redirectResult.user);
            setCurrentUser(null);
            console.log('🔄 Mobile: Firebase user set, backend failed');
          }
        } else {
          console.log('📱 No redirect result found on mount');
        }
      } catch (error) {
        console.error('❌ Error handling redirect result:', error);
      } finally {
        setLoading(false);
      }
    };

    handleRedirectResult();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Listen for Firebase auth state changes (non-redirect flow)
  useEffect(() => {
    console.log('🔄 Setting up authentication state listener...');
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setLoading(true);
      console.log('🔄 Auth state changed:', user ? `User: ${user.email}` : 'No user');
      
      try {
        if (user) {
          // User is signed in with Firebase
          console.log('✅ Firebase user found:', user.email);
          setFirebaseUser(user);
          
          // Check if we have a valid backend session
          try {
            console.log('🔄 Checking existing backend session...');
            const backendUser = await authService.getCurrentUser();
            
            if (backendUser) {
              // Valid backend session exists
              setCurrentUser(backendUser);
              console.log('✅ Existing backend session found:', backendUser);
            } else {
              // No valid backend session, need to re-authenticate
              console.log('🔄 Re-authenticating with backend...');
              try {
                const idToken = await user.getIdToken();
                const newBackendUser = await authService.loginWithFirebaseToken(idToken);
                setCurrentUser(newBackendUser);
                console.log('✅ Re-authentication successful:', newBackendUser);
              } catch (authError) {
                console.error('❌ Re-authentication failed:', authError);
                // If re-authentication fails due to network issues, keep Firebase user
                // but don't sign out completely in production
                if (process.env.NODE_ENV === 'production') {
                  console.log('🔄 Production mode: keeping Firebase user despite backend failure');
                  setCurrentUser(null); // Clear backend user but keep Firebase user
                } else {
                  // In development, sign out completely
                  console.log('🔄 Development mode: signing out completely due to backend failure');
                  await signOut(auth);
                  setFirebaseUser(null);
                  setCurrentUser(null);
                  authService.logout();
                }
              }
            }
          } catch (error) {
            console.error('❌ Backend connection error:', error);
            // In production, don't sign out due to network issues
            if (process.env.NODE_ENV === 'production') {
              console.log('🔄 Production mode: keeping Firebase user despite backend connection error');
              setCurrentUser(null); // Clear backend user but keep Firebase user
            } else {
              // In development, clear everything
              console.log('🔄 Development mode: clearing everything due to backend connection error');
              setFirebaseUser(null);
              setCurrentUser(null);
              authService.logout();
            }
          }
        } else {
          // User is signed out
          console.log('🚪 User signed out');
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
        console.log('✅ Auth state processing complete');
      }
    });

    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value: AuthContextType = {
    currentUser,
    firebaseUser,
    loading,
    signInWithGoogle,
    logout,
    // In production, consider user authenticated if they have Firebase auth even without backend
    // Add debug logging to help troubleshoot mobile authentication issues
    isAuthenticated: (() => {
      // Simplify authentication check: If we have a Firebase user, we are authenticated.
      // The backend session (currentUser) is secondary for data persistence but not for "signed in" status.
      // This ensures the UI always reflects the user's logged-in state even if backend connection is flaky.
      const hasFirebaseUser = firebaseUser !== null;
      
      if (firebaseUser) {
        console.debug('🔐 Auth Check: User is authenticated via Firebase', {
          email: firebaseUser.email,
          hasBackendSession: currentUser !== null
        });
      }
      
      return hasFirebaseUser;
    })(),
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};