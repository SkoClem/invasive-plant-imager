import React from 'react';
import { PlantInfo } from '../types/api';

interface ResultsPageProps {
  setCurrentPage: (page: 'home' | 'upload' | 'collection' | 'about' | 'loading' | 'results') => void;
  plantData: PlantInfo | null;
  error?: string;
}

function ResultsPage({ setCurrentPage, plantData, error }: ResultsPageProps) {
  if (error) {
    return (
      <section className="results-section error">
        <div className="container">
          <div className="error-content">
            <div className="error-icon">⚠️</div>
            <h1 className="error-title">Analysis Error</h1>
            <p className="error-message">{error}</p>
            <button
              className="button retry-button"
              onClick={() => setCurrentPage('upload')}
            >
              Try Again
            </button>
          </div>
        </div>
      </section>
    );
  }

  if (!plantData) {
    return (
      <section className="results-section error">
        <div className="container">
          <div className="error-content">
            <div className="error-icon">❓</div>
            <h1 className="error-title">No Data Available</h1>
            <p className="error-message">Unable to retrieve plant information. Please try again.</p>
            <button
              className="button retry-button"
              onClick={() => setCurrentPage('upload')}
            >
              Try Again
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="results-section">
      <div className="container">
        {/* Header with invasive status */}
        <div className={`results-header ${plantData.isInvasive ? 'invasive' : 'non-invasive'}`}>
          <div className="status-icon">
            {plantData.isInvasive ? '🚨' : '✅'}
          </div>
          <div className="status-content">
            <h1 className="status-title">
              {plantData.isInvasive ? 'Invasive Species Detected' : 'Native Plant Identified'}
            </h1>
          </div>
        </div>

        {/* Plant Information */}
        <div className="plant-info">
          <div className="plant-header">
            <div>
              <h2 className="plant-name">{plantData.commonName}</h2>
              <p className="scientific-name">{plantData.scientificName}</p>
            </div>
            <div className="region-badge">
              📍 {plantData.region}
            </div>
          </div>

          <div className="info-section">
            <h3>Description</h3>
            <p>{plantData.description}</p>
          </div>

          {plantData.isInvasive && (
            <div className="info-section impact-section">
              <h3>Environmental Impact</h3>
              <p>{plantData.impact}</p>
            </div>
          )}

          {plantData.controlMethods.length > 0 && (
            <div className="info-section">
              <h3>Control Methods</h3>
              <ul className="control-methods">
                {plantData.controlMethods.map((method, index) => (
                  <li key={index}>{method}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Native Alternatives */}
        {plantData.nativeAlternatives.length > 0 && (
          <div className="native-alternatives">
            <h3>Native Alternatives</h3>
            <p className="alternatives-subtitle">
              Consider these native plants for your landscaping needs
            </p>

            <div className="alternatives-grid">
              {plantData.nativeAlternatives.map((alternative, index) => (
                <div key={index} className="alternative-card">
                  <div className="alternative-header">
                    <h4 className="alternative-name">{alternative.commonName}</h4>
                    <p className="alternative-scientific">{alternative.scientificName}</p>
                  </div>

                  <p className="alternative-description">{alternative.description}</p>

                  {alternative.benefits.length > 0 && (
                    <div className="alternative-benefits">
                      <h5>Benefits:</h5>
                      <ul>
                        {alternative.benefits.map((benefit, benefitIndex) => (
                          <li key={benefitIndex}>{benefit}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="results-actions">
          <button
            className="button secondary-button"
            onClick={() => setCurrentPage('upload')}
          >
            Scan Another Plant
          </button>
          <button
            className="button primary-button"
            onClick={() => setCurrentPage('collection')}
          >
            Save to Collection
          </button>
        </div>
      </div>
    </section>
  );
}

export default ResultsPage;