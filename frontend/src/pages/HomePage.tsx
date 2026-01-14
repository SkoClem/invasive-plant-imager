import React from 'react';
import { useAuth } from '../contexts/AuthContext';

interface HomePageProps {
  setCurrentPage: (page: 'home' | 'upload' | 'collection' | 'about' | 'learn' | 'loading' | 'chat') => void;
  userRole: string;
  setUserRole: (role: string) => void;
}

function HomePage({ setCurrentPage, userRole, setUserRole }: HomePageProps) {
  const { isAuthenticated, currentUser } = useAuth();

  if (isAuthenticated) {
    return (
      <section className="home-section logged-in" style={{ paddingTop: '80px' }}>
        <div className="container">
          <div className="welcome-header" style={{ marginBottom: '2rem', textAlign: 'center' }}>
            <h1>Welcome back{currentUser?.name ? `, ${currentUser.name}` : ''}!</h1>
            <p className="subtitle">Ready to continue your conservation journey?</p>
          </div>

          <div className="role-selector-card" style={{ 
            background: 'var(--container-bg)', 
            padding: '2rem', 
            borderRadius: 'var(--radius-card)', 
            boxShadow: 'var(--shadow-light)',
            marginBottom: '3rem',
            textAlign: 'center'
          }}>
            <h3>Customize Your Experience</h3>
            <p style={{ marginBottom: '1.5rem', color: 'var(--text-secondary)' }}>Select your role to get tailored identification insights:</p>
            <div className="role-buttons" style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              {['Student', 'Homeowner', 'Land Manager'].map((role) => (
                <button
                  key={role}
                  className={`button ${userRole === role ? 'primary-button' : 'secondary-button'}`}
                  onClick={() => setUserRole(role)}
                  style={{ minWidth: '120px' }}
                >
                  {role}
                </button>
              ))}
            </div>
          </div>

          <div className="quick-actions-grid" style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
            gap: '1.5rem' 
          }}>
            <div 
              className="action-card primary" 
              onClick={() => setCurrentPage('upload')}
              style={{
                background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))',
                color: 'white',
                padding: '2rem',
                borderRadius: 'var(--radius-card)',
                cursor: 'pointer',
                textAlign: 'center',
                boxShadow: 'var(--shadow-md)',
                transition: 'transform 0.2s'
              }}
            >
              <div className="action-icon" style={{ fontSize: '3rem', marginBottom: '1rem' }}>📸</div>
              <h3 style={{ color: 'white' }}>Scan New Plant</h3>
              <p style={{ color: 'rgba(255,255,255,0.9)' }}>Identify invasive species instantly</p>
            </div>
            
            <div 
              className="action-card" 
              onClick={() => setCurrentPage('collection')}
              style={{
                background: 'var(--container-bg)',
                padding: '2rem',
                borderRadius: 'var(--radius-card)',
                cursor: 'pointer',
                textAlign: 'center',
                boxShadow: 'var(--shadow-light)',
                border: '1px solid var(--border-subtle)'
              }}
            >
              <div className="action-icon" style={{ fontSize: '3rem', marginBottom: '1rem' }}>🌿</div>
              <h3>My Collection</h3>
              <p>View your identified plants</p>
            </div>
            
            <div 
              className="action-card" 
              onClick={() => setCurrentPage('learn')}
              style={{
                background: 'var(--container-bg)',
                padding: '2rem',
                borderRadius: 'var(--radius-card)',
                cursor: 'pointer',
                textAlign: 'center',
                boxShadow: 'var(--shadow-light)',
                border: '1px solid var(--border-subtle)'
              }}
            >
              <div className="action-icon" style={{ fontSize: '3rem', marginBottom: '1rem' }}>📚</div>
              <h3>Learn More</h3>
              <p>Explore the database</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      {/* Hero Section */}
      <section className="hero enhanced">
        <div className="container">
          <div className="hero-content">
            <div className="hero-text">
              <h1 className="hero-title enhanced">Identify Invasive Plants Instantly</h1>
              <p className="subtitle hero-subtitle enhanced">
                Use cutting-edge AI technology to identify invasive plant species and help protect your local ecosystem.
                Join thousands of users contributing to conservation efforts.
              </p>
            </div>

            <div className="hero-action">
              <button
                className="button hero-button enhanced"
                onClick={() => document.querySelector<HTMLButtonElement>('.auth-button')?.click()}
              >
                <span className="button-icon"></span>
                <span className="button-text">Sign Me Up!</span>
              </button>

              <p className="region-hint-text">
                 Join now to start identifying and protecting your local ecosystem
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Economic Impact Panel - "Why This Matters" */}
      <section className="impact-section" style={{ backgroundColor: 'var(--bg-secondary)', padding: '4rem 0' }}>
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Why This Matters</h2>
            <p className="section-subtitle">Economic and Ecological Consequences of Invasive Species</p>
          </div>
          
          <div className="impact-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginTop: '2rem' }}>
            <div className="impact-card" style={{ background: 'var(--container-bg)', padding: '2rem', borderRadius: 'var(--radius-card)', boxShadow: 'var(--shadow-sm)' }}>
              <div className="impact-icon" style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>💰</div>
              <h3>Economic Cost</h3>
              <p>Invasive species cost the global economy billions annually in control measures, lost agricultural yield, and infrastructure damage. Early detection significantly reduces these long-term costs.</p>
            </div>
            
            <div className="impact-card" style={{ background: 'var(--container-bg)', padding: '2rem', borderRadius: 'var(--radius-card)', boxShadow: 'var(--shadow-sm)' }}>
              <div className="impact-icon" style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>⏱️</div>
              <h3>Early Action</h3>
              <p>Detecting invasive plants before they establish large populations is the most cost-effective management strategy. Every scan contributes to this early warning system.</p>
            </div>
            
            <div className="impact-card" style={{ background: 'var(--container-bg)', padding: '2rem', borderRadius: 'var(--radius-card)', boxShadow: 'var(--shadow-sm)' }}>
              <div className="impact-icon" style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🌱</div>
              <h3>Ecosystem Health</h3>
              <p>Native biodiversity is essential for resilient ecosystems. Invasive plants outcompete native flora, disrupting food webs and reducing habitat for local wildlife.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section enhanced">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Powerful Features</h2>
            <p className="section-subtitle">Everything you need to identify and manage invasive plants</p>
          </div>

          <div className="features-grid enhanced">
            <div className="feature-card enhanced">
              <div className="feature-icon"></div>
              <h3 className="feature-title">AI-Powered Recognition</h3>
              <p className="feature-description">
                State-of-the-art machine learning algorithms identify invasive plant species with up to 95% accuracy from your photos.
              </p>
              <div className="feature-badges">
                <span className="feature-badge">Real-time</span>
                <span className="feature-badge">High Accuracy</span>
              </div>
            </div>

            <div className="feature-card enhanced">
              <div className="feature-icon"></div>
              <h3 className="feature-title">Comprehensive Database</h3>
              <p className="feature-description">
                Access detailed information about identified plants, including control methods, ecological impact, and native alternatives.
              </p>
              <div className="feature-badges">
                <span className="feature-badge">Detailed Info</span>
                <span className="feature-badge">Control Methods</span>
              </div>
            </div>

            <div className="feature-card enhanced">
              <div className="feature-icon"></div>
              <h3 className="feature-title">Conservation Mapping</h3>
              <p className="feature-description">
                Contribute to conservation efforts by mapping invasive species distribution and helping researchers track their spread.
              </p>
              <div className="feature-badges">
                <span className="feature-badge">Data Sharing</span>
                <span className="feature-badge">Research</span>
              </div>
            </div>

            <div className="feature-card enhanced">
              <div className="feature-icon"></div>
              <h3 className="feature-title">Mobile Optimized</h3>
              <p className="feature-description">
                Designed for field use with offline capabilities, GPS integration, and camera-optimized image capture.
              </p>
              <div className="feature-badges">
                <span className="feature-badge">Offline Mode</span>
                <span className="feature-badge">GPS Ready</span>
              </div>
            </div>

            <div className="feature-card enhanced">
              <div className="feature-icon"></div>
              <h3 className="feature-title">Privacy Protected</h3>
              <p className="feature-description">
                Your data is secure with encrypted storage and optional anonymous contribution to scientific research.
              </p>
              <div className="feature-badges">
                <span className="feature-badge">Encrypted</span>
                <span className="feature-badge">Anonymous</span>
              </div>
            </div>

            <div className="feature-card enhanced">
              <div className="feature-icon"></div>
              <h3 className="feature-title">Global Coverage</h3>
              <p className="feature-description">
                Regional-specific databases ensure accurate identification across North America, Australia, New Zealand, and beyond.
              </p>
              <div className="feature-badges">
                <span className="feature-badge">Multi-region</span>
                <span className="feature-badge">Local Data</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2 className="cta-title">Ready to Make a Difference?</h2>
            <p className="cta-subtitle">
              Join our community of citizen scientists and help protect native ecosystems from invasive species.
            </p>
            <button
              className="button cta-button"
              onClick={() => setCurrentPage('upload')}
            >
              <span className="button-icon"></span>
              <span className="button-text">Start Identifying Plants</span>
            </button>
          </div>
        </div>
      </section>
    </>
  );
}

export default HomePage;