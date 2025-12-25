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
      
      // Enhanced mobile detection
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
                       (window.innerWidth <= 768) ||
                       ('ontouchstart' in window);
      console.log('📱 Device type:', isMobile ? 'Mobile' : 'Desktop');
      console.log('📱 User agent:', navigator.userAgent);
      console.log('📱 Window width:', window.innerWidth);
      console.log('📱 Touch support:', 'ontouchstart' in window);
      
      let result: UserCredential;
      
      if (isMobile) {
        // Use redirect for mobile devices to avoid popup blocking
        console.log('📱 Using redirect authentication for mobile...');
        try {
          await signInWithRedirect(auth, googleProvider);
          // The result will be handled in the useEffect with getRedirectResult
          return null; // Return null to indicate redirect
        } catch (redirectError) {
          console.error('❌ Mobile redirect failed:', redirectError);
          throw redirectError;
        }
      } else {
        // Try popup first for desktop, with fallback to redirect
        console.log('🖥️ Attempting popup authentication for desktop...');
        try {
          result = await signInWithPopup(auth, googleProvider);
          console.log('✅ Firebase popup authentication successful:', result.user.email);
        } catch (popupError: any) {
          console.error('❌ Firebase popup authentication failed:', popupError);
          
          // Check if it's a popup-related error
          if (popupError.code === 'auth/popup-blocked' || 
              popupError.code === 'auth/popup-closed-by-user' ||
              popupError.code === 'auth/cancelled-popup-request' ||
              popupError.message?.includes('popup')) {
            console.log('🔄 Popup blocked or closed, falling back to redirect...');
            
            // Fallback to redirect method
            await signInWithRedirect(auth, googleProvider);
            return null; // Return null to indicate redirect
          } else {
            // Re-throw non-popup related errors
            throw popupError;
          }
        }
      }
      
      // Step 2: Get Firebase ID token
      console.log('🔑 Getting Firebase ID token...');
      const idToken = await result.user.getIdToken();
      console.log('✅ Firebase ID token obtained');
      
      // Step 3: Send token to backend and get JWT
      console.log('🔄 Authenticating with backend...');
      try {
        const backendUser = await authService.loginWithFirebaseToken(idToken);
        console.log('✅ Backend authentication successful:', backendUser);
        
        // Step 4: Update local state
        setCurrentUser(backendUser);
        setFirebaseUser(result.user);
        
        console.log('✅ Authentication complete - User state updated');
        
        return result;
      } catch (backendError) {
        console.error('❌ Backend authentication failed:', backendError);
        console.log('🔄 Keeping Firebase user despite backend failure');
        
        // In production, keep Firebase user even if backend fails
        if (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'development') {
          setFirebaseUser(result.user);
          setCurrentUser(null);
          console.log(`✅ ${process.env.NODE_ENV} mode: Firebase authentication successful, backend optional/failed`);
          return result;
        } else {
          // In other environments (e.g. test), require both
          throw backendError;
        }
      }
    } catch (error) {
      console.error('❌ Sign in failed:', error);
      console.error('Error details:', {
        name: (error as any)?.name,
        message: (error as any)?.message,
        code: (error as any)?.code,
        stack: (error as any)?.stack
      });
      
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
      const isProduction = process.env.NODE_ENV === 'production';
      const hasFirebaseUser = firebaseUser !== null;
      const hasCurrentUser = currentUser !== null;
      const isAuthServiceAuthenticated = authService.isAuthenticated();
      
      const result = isProduction 
        ? hasFirebaseUser 
        : (hasCurrentUser && isAuthServiceAuthenticated);
      
      // Debug logging for mobile authentication troubleshooting
      console.log('Authentication State Debug:', {
        isProduction,
        hasFirebaseUser,
        hasCurrentUser,
        isAuthServiceAuthenticated,
        result,
        firebaseUserEmail: firebaseUser?.email,
        currentUserEmail: currentUser?.email
      });
      
      return result;
    })()
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};