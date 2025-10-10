import React from 'react';
import AuthButton from '../components/AuthButton';

interface HomePageProps {
  setCurrentPage: (page: 'home' | 'upload' | 'collection' | 'about' | 'loading' | 'results') => void;
}

function HomePage({ setCurrentPage }: HomePageProps) {
  return (
    <>
      {/* Hero Section */}
      <section className="hero enhanced">
        <div className="container">
          <div className="hero-header enhanced">
            <div className="header-content">
              <div className="app-title">
                <h1 className="app-logo">🌿 Invasive Plant Imager</h1>
                <p className="app-tagline">AI-Powered Plant Identification</p>
              </div>
            </div>
          </div>

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
                onClick={() => setCurrentPage('upload')}
              >
                <span className="button-icon">📸</span>
                <span className="button-text">Start Scanning</span>
              </button>

              <p className="region-hint-text">
                📍 Select your region on the scan page for accurate plant identification
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-number">50K+</div>
              <div className="stat-label">Plants Identified</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">95%</div>
              <div className="stat-label">Accuracy Rate</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">25+</div>
              <div className="stat-label">Countries Covered</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">24/7</div>
              <div className="stat-label">AI Analysis</div>
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
              <div className="feature-icon">🤖</div>
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
              <div className="feature-icon">📚</div>
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
              <div className="feature-icon">🗺️</div>
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
              <div className="feature-icon">📱</div>
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
              <div className="feature-icon">🔒</div>
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
              <div className="feature-icon">🌍</div>
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
              <span className="button-icon">🚀</span>
              <span className="button-text">Start Identifying Plants</span>
            </button>
          </div>
        </div>
      </section>
    </>
  );
}

export default HomePage;