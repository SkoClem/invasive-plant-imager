import React from 'react';
import RegionSelector from '../components/RegionSelector';
import AuthButton from '../components/AuthButton';

interface HomePageProps {
  setCurrentPage: (page: 'home' | 'upload' | 'collection' | 'about' | 'loading' | 'results') => void;
  selectedRegion: string;
  setSelectedRegion: (region: string) => void;
}

function HomePage({ setCurrentPage, selectedRegion, setSelectedRegion }: HomePageProps) {
  return (
    <>
      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div className="hero-header">
            <AuthButton className="auth-button-hero" />
          </div>
          
          <h1 className="hero-title">Identify Invasive Plants</h1>
          <p className="subtitle hero-subtitle">
            Use AI-powered image recognition to identify and learn about invasive plant species in your area.
          </p>
          
          {/* Region Selection */}
          <div className="region-selection-container">
            <RegionSelector
              selectedRegion={selectedRegion}
              onRegionChange={setSelectedRegion}
            />
          </div>
          
          <button
            className="button hero-button"
            onClick={() => setCurrentPage('upload')}
            disabled={!selectedRegion}
          >
            {selectedRegion ? 'Scan with Camera' : 'Select Region First'}
          </button>
        </div>
      </section>

      {/* Features Section */}
      <section>
        <div className="container">
          <h2>Key Features</h2>
          <div className="features-grid">
            <div className="feature-card">
              <h3 className="feature-title">AI Recognition</h3>
              <p className="feature-description">
                Advanced machine learning algorithms identify invasive plant species with high accuracy from your photos.
              </p>
            </div>
            <div className="feature-card">
              <h3 className="feature-title">Detailed Information</h3>
              <p className="feature-description">
                Get comprehensive details about identified plants, including control methods and ecological impact.
              </p>
            </div>
            <div className="feature-card">
              <h3 className="feature-title">Location Mapping</h3>
              <p className="feature-description">
                Map and track invasive species in your region to contribute to conservation efforts.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default HomePage;