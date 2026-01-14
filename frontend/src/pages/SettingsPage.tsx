import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import ThemeToggle from '../components/ThemeToggle';

interface SettingsPageProps {
  userRole: string;
  setUserRole: (role: string) => void;
  onNavigateBack: () => void;
}

function SettingsPage({ userRole, setUserRole, onNavigateBack }: SettingsPageProps) {
  const { currentUser, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      onNavigateBack(); // Navigate back to home/login after logout
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  return (
    <section className="settings-section" style={{ 
      padding: '2rem', 
      height: '100%', 
      overflowY: 'auto',
      backgroundColor: 'var(--bg-primary)' 
    }}>
      <div className="settings-header" style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center' }}>
        <button 
          onClick={onNavigateBack}
          style={{ 
            background: 'none', 
            border: 'none', 
            fontSize: '1.5rem', 
            cursor: 'pointer',
            marginRight: '1rem',
            color: 'var(--text-primary)'
          }}
        >
          ←
        </button>
        <h1 style={{ margin: 0, fontSize: '1.8rem' }}>Settings</h1>
      </div>

      <div className="settings-group" style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem' }}>
          Personalization
        </h2>
        
        <div className="setting-item" style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>User Role</h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
            Select your role to customize identification insights and chatbot responses.
          </p>
          <div className="role-buttons" style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            {['Student', 'Homeowner', 'Land Manager'].map((role) => (
              <button
                key={role}
                className={`button ${userRole === role ? 'primary-button' : 'secondary-button'}`}
                onClick={() => setUserRole(role)}
                style={{ 
                  flex: '1 1 auto', 
                  minWidth: '100px',
                  padding: '0.75rem',
                  fontSize: '0.9rem'
                }}
              >
                {role}
              </button>
            ))}
          </div>
        </div>

        <div className="setting-item" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ fontSize: '1rem', marginBottom: '0.25rem' }}>Appearance</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Toggle light/dark mode</p>
          </div>
          <ThemeToggle />
        </div>
      </div>

      <div className="settings-group" style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem' }}>
          Account
        </h2>
        
        {currentUser && (
          <div className="user-profile" style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
              {currentUser.photoURL && (
                <img 
                  src={currentUser.photoURL} 
                  alt="Profile" 
                  style={{ width: '50px', height: '50px', borderRadius: '50%', marginRight: '1rem' }}
                />
              )}
              <div>
                <div style={{ fontWeight: 'bold' }}>{currentUser.name || 'User'}</div>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{currentUser.email}</div>
              </div>
            </div>
            
            <button 
              className="button secondary-button" 
              onClick={handleLogout}
              style={{ width: '100%', borderColor: 'var(--error)', color: 'var(--error)' }}
            >
              Sign Out
            </button>
          </div>
        )}
        
        {!currentUser && (
          <div className="login-prompt">
            <p style={{ marginBottom: '1rem' }}>Sign in to save your collection and access all features.</p>
            <button 
              className="button primary-button" 
              onClick={() => document.querySelector<HTMLButtonElement>('.auth-button')?.click()}
              style={{ width: '100%' }}
            >
              Sign In / Sign Up
            </button>
          </div>
        )}
      </div>

      <div className="settings-group">
        <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem' }}>
          About
        </h2>
        <div className="app-info" style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          <p>InvasiScan v0.1.0</p>
          <p>© 2026 Invasive Plant Imager Project</p>
        </div>
      </div>
    </section>
  );
}

export default SettingsPage;
