import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { PlantInfo } from '../types/api';
import PlantChat from '../components/PlantChat';

interface ResultsPageProps {
  setCurrentPage: (page: 'home' | 'upload' | 'collection' | 'about' | 'loading' | 'results') => void;
  resultItem?: {
    id: string;
    status: 'analyzing' | 'completed' | 'error';
    species?: string;
    description?: string;
    region: string;
    plantData?: PlantInfo;
  };
}

const ResultsPage: React.FC<ResultsPageProps> = ({ setCurrentPage, resultItem }) => {
  const { isAuthenticated } = useAuth();

  const showDetailedResult = resultItem && resultItem.status === 'completed';

  return (
    <section className="results-section">
      <div className="container">
        <div className={`results-header ${showDetailedResult && resultItem?.plantData?.isInvasive ? 'invasive' : 'non-invasive'}`}>
          <div className="status-icon">{showDetailedResult && resultItem?.plantData?.isInvasive ? '🚨' : '✅'}</div>
          <div className="status-content">
            <h1 className="status-title">Analysis Complete</h1>
          </div>
        </div>

        {showDetailedResult ? (
          <div className="results-content">
            <div className="results-details">
              <h2 className="plant-name">
                {resultItem.plantData?.commonName || resultItem.plantData?.scientificName || resultItem.species || 'Unknown Plant'}
              </h2>
              {resultItem.plantData?.scientificName && (
                <p className="scientific-name">{resultItem.plantData.scientificName}</p>
              )}
              {resultItem.plantData?.region && (
                <div className="native-location">
                  <span className="location-icon">🌍</span>
                  <span className="location-text">Native to: {resultItem.plantData.region}</span>
                </div>
              )}
              {resultItem.plantData?.isInvasive !== undefined && (
                <div className={`invasive-status ${resultItem.plantData.isInvasive ? 'invasive' : 'native'}`}>
                  <span className="status-icon">{resultItem.plantData.isInvasive ? '🚨' : '✅'}</span>
                  <span className="status-text">
                    {resultItem.plantData.isInvasive ? 'Invasive Species' : 'Native Plant'}
                  </span>
                </div>
              )}
              
              {resultItem.plantData?.confidenceScore !== undefined && (
                <div className="confidence-section">
                  <div className="confidence-header">
                    <span className="confidence-label">Confidence Score:</span>
                    <div className="confidence-badge-wrapper">
                      <span className={`confidence-badge ${
                        resultItem.plantData.confidenceScore >= 80 ? 'high' : 
                        resultItem.plantData.confidenceScore >= 50 ? 'medium' : 'low'
                      }`}>
                        {resultItem.plantData.confidenceScore}%
                      </span>
                    </div>
                  </div>
                  {resultItem.plantData.confidenceReasoning && (
                    <p className="confidence-reasoning">
                      <span className="reasoning-label">Analysis:</span> {resultItem.plantData.confidenceReasoning}
                    </p>
                  )}
                </div>
              )}

              {resultItem.plantData?.description && (
                <p className="plant-description">{resultItem.plantData.description}</p>
              )}
            </div>
            
            {resultItem.plantData && (
              <PlantChat plantData={resultItem.plantData} />
            )}
          </div>
        ) : (
          <div className="info-section">
            <p>Your scan has been saved to your collection automatically.</p>
          </div>
        )}

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
            View Collection
          </button>
        </div>

        {!isAuthenticated && (
          <p className="hint">Sign in to sync your collection across devices.</p>
        )}
      </div>
    </section>
  );
};

export default ResultsPage;
