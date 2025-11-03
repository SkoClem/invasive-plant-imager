import React from 'react';
import { useAuth } from '../contexts/AuthContext';

interface ResultsPageProps {
  setCurrentPage: (page: 'home' | 'upload' | 'collection' | 'about' | 'loading' | 'results') => void;
}

const ResultsPage: React.FC<ResultsPageProps> = ({ setCurrentPage }) => {
  const { isAuthenticated } = useAuth();

  return (
    <section className="results-section">
      <div className="container">
        <div className="results-header non-invasive">
          <div className="status-icon">✅</div>
          <div className="status-content">
            <h1 className="status-title">Analysis Complete</h1>
          </div>
        </div>

        <div className="info-section">
          <p>Your scan has been saved to your collection automatically.</p>
        </div>

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