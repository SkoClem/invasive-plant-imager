import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface AuthButtonProps {
  className?: string;
  variant?: 'default' | 'compact' | 'floating';
}

const AuthButton: React.FC<AuthButtonProps> = ({ className = '', variant = 'default' }) => {
  const { currentUser, signInWithGoogle, logout } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleSignIn = async () => {
    setIsLoading(true);
    try {
      await signInWithGoogle();
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
    } catch (error) {
      console.error('Sign out failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleUserMenu = () => {
    setShowUserMenu(!showUserMenu);
  };

  if (currentUser) {
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
              src={currentUser.picture || currentUser.photoURL || '/default-avatar.png'}
              alt="Profile"
              className="user-avatar"
            />
            <span className="user-name">{currentUser.name || currentUser.displayName}</span>
            <svg className="menu-arrow" viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
              <path d="M7 10l5 5 5-5z"/>
            </svg>
          </button>

          {showUserMenu && (
            <div className="user-dropdown-menu">
              <div className="user-info-header">
                <img
                  src={currentUser.picture || currentUser.photoURL || '/default-avatar.png'}
                  alt="Profile"
                  className="user-avatar-large"
                />
                <div className="user-details">
                  <span className="user-name-large">{currentUser.name || currentUser.displayName}</span>
                  <span className="user-email">{currentUser.email}</span>
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
              src={currentUser.picture || currentUser.photoURL || '/default-avatar.png'}
              alt="Profile"
              className="user-avatar"
            />
            <div className="online-indicator"></div>
          </div>
          <div className="user-text">
            <span className="user-name">{currentUser.name || currentUser.displayName}</span>
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
          <svg className="loading-spinner" viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"/>
          </svg>
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
          <svg className="loading-spinner" viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"/>
          </svg>
          Signing in...
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