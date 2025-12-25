import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { rewardsService } from '../services/rewardsService';

interface AuthButtonProps {
  className?: string;
  variant?: 'default' | 'compact' | 'floating';
}

const AuthButton: React.FC<AuthButtonProps> = ({ className = '', variant = 'default' }) => {
  const { currentUser, firebaseUser, signInWithGoogle, logout, isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [coinCount, setCoinCount] = useState<number>(0);

  const handleSignIn = async () => {
    setIsLoading(true);
    try {
      const result = await signInWithGoogle();
      // Reload page to ensure all states (collection, coins, etc.) are fresh
      // Only reload if we got a result (popup flow)
      // If result is null, it means we are redirecting, so don't reload
      if (result) {
        window.location.reload();
      }
    } catch (error) {
      console.error('Sign in failed:', error);
      // You might want to show an error message to the user here
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    setIsLoading(true);
    setShowUserMenu(false);
    try {
      await logout();
      // Reload page to ensure clean state after logout
      window.location.reload();
    } catch (error) {
      console.error('Sign out failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleUserMenu = () => {
    setShowUserMenu(!showUserMenu);
  };

  // Initialize coin count from currentUser
  useEffect(() => {
    if (currentUser?.coins !== undefined) {
      setCoinCount(currentUser.coins);
    }
  }, [currentUser]);

  // Fetch rewards when authenticated, and refresh on custom event
  useEffect(() => {
    let mounted = true;
    const fetchRewards = async () => {
      if (!isAuthenticated) {
        setCoinCount(0);
        return;
      }
      try {
        const data = await rewardsService.getRewards();
        if (mounted) setCoinCount(data.coins || 0);
      } catch (err) {
        // Non-fatal: don't overwrite with 0 if we have a value from currentUser
        console.error('Failed to fetch rewards:', err);
      }
    };
    
    // Only fetch if we don't have coins from currentUser, or if we want to ensure freshness
    // For now, always fetch to be safe, but handle error better
    fetchRewards();

    const onRewardsUpdated = () => fetchRewards();
    window.addEventListener('rewards-updated', onRewardsUpdated);
    return () => {
      mounted = false;
      window.removeEventListener('rewards-updated', onRewardsUpdated);
    };
  }, [isAuthenticated]); // removed currentUser dependency to avoid double fetching loop if we added it

  // Use isAuthenticated from context instead of just checking currentUser
  // This handles both development (requires backend) and production (Firebase only) modes
  if (isAuthenticated) {
    // Get user info from currentUser (backend) or fallback to firebaseUser
    const userInfo = currentUser || {
      name: firebaseUser?.displayName,
      displayName: firebaseUser?.displayName,
      picture: firebaseUser?.photoURL,
      photoURL: firebaseUser?.photoURL,
      email: firebaseUser?.email
    };

    if (variant === 'compact') {
      return (
        <div className={`auth-container compact ${className}`}>
          <button
            onClick={toggleUserMenu}
            className="user-menu-button"
            aria-expanded={showUserMenu}
            aria-haspopup="true"
          >
            <img
              src={userInfo.picture || userInfo.photoURL || '/default-avatar.png'}
              alt="Profile"
              className="user-avatar"
            />
            <span className="user-name">{userInfo.name || userInfo.displayName}</span>
            <span className="user-coins" title="Coins earned from new invasive scans">
              <svg
                id="coin-target"
                aria-hidden
                className="clover-icon"
                viewBox="0 0 24 24"
                width="16"
                height="16"
                style={{ marginLeft: 8 }}
              >
                <path
                  fill="#DAA520"
                  d="M12 2c1.8 0 3.2 1.3 3.5 3 .3-1.7 1.7-3 3.5-3 2 0 3.5 1.5 3.5 3.5 0 1.9-1.4 3.4-3.2 3.5 1.8.1 3.2 1.6 3.2 3.5 0 2-1.5 3.5-3.5 3.5-1.8 0-3.2-1.3-3.5-3-.3 1.7-1.7 3-3.5 3-2 0-3.5-1.5-3.5-3.5 0-1.9 1.4-3.4 3.2-3.5-1.8-.1-3.2-1.6-3.2-3.5C8.5 3.5 10 2 12 2zm0 10.5c.6 0 1 .4 1 1v7h-2v-7c0-.6.4-1 1-1z"
                />
              </svg>
              <span className="coin-count" style={{ marginLeft: 4, color: '#333', fontWeight: 'bold' }}>{coinCount}</span>
            </span>
            <svg className="menu-arrow" viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
              <path d="M7 10l5 5 5-5z"/>
            </svg>
          </button>

          {showUserMenu && (
            <div className="user-dropdown-menu">
              <div className="user-info-header">
                <img
                  src={userInfo.picture || userInfo.photoURL || '/default-avatar.png'}
                  alt="Profile"
                  className="user-avatar-large"
                />
                <div className="user-details">
                  <span className="user-name-large">{userInfo.name || userInfo.displayName}</span>
                  <span className="user-email">{userInfo.email}</span>
                </div>
              </div>
              <div className="menu-divider"></div>
              <button
                onClick={handleSignOut}
                disabled={isLoading}
                className="menu-item sign-out-item"
              >
                <svg className="menu-icon" viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                  <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
                </svg>
                {isLoading ? 'Signing out...' : 'Sign Out'}
              </button>
            </div>
          )}
        </div>
      );
    }

    return (
      <div className={`auth-container enhanced ${className}`}>
        <div className="user-info">
          <div className="user-avatar-wrapper">
            <img
              src={userInfo.picture || userInfo.photoURL || '/default-avatar.png'}
              alt="Profile"
              className="user-avatar"
            />
            <div className="online-indicator"></div>
          </div>
          <div className="user-text">
            <span className="user-name">{userInfo.name || userInfo.displayName}</span>
            <span className="user-status">Signed in</span>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          disabled={isLoading}
          className="auth-button sign-out-button enhanced"
        >
          {isLoading ? (
            <>
              <svg className="loading-spinner" viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"/>
              </svg>
              Signing out...
            </>
          ) : (
            <>
              <svg className="sign-out-icon" viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
              </svg>
              Sign Out
            </>
          )}
        </button>
      </div>
    );
  }

  // Sign-in button variants
  if (variant === 'floating') {
    return (
      <button
        onClick={handleSignIn}
        disabled={isLoading}
        className={`auth-button sign-in-button floating ${className}`}
        title="Sign in with Google"
      >
        {isLoading ? (
          <span className="sign-in-text">Signing in...</span>
        ) : (
          <svg className="google-icon" viewBox="0 0 24 24" width="20" height="20">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
        )}
      </button>
    );
  }

  return (
    <button
      onClick={handleSignIn}
      disabled={isLoading}
      className={`auth-button sign-in-button enhanced ${className}`}
    >
      {isLoading ? (
        <>
          <span className="sign-in-text">Signing in...</span>
        </>
      ) : (
        <>
          <div className="google-icon-wrapper">
            <svg className="google-icon" viewBox="0 0 24 24" width="20" height="20">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
          </div>
          <span className="sign-in-text">Sign in with Google</span>
          <span className="security-badge">Secure</span>
        </>
      )}
    </button>
  );
};

export default AuthButton;
