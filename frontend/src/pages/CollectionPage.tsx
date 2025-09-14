import React from 'react';

interface CollectionPageProps {
  setCurrentPage: (page: 'home' | 'upload' | 'collection' | 'about' | 'loading' | 'results') => void;
}

function CollectionPage({ setCurrentPage }: CollectionPageProps) {
  return (
    <section className="collection-section">
      <div className="container">
        <h1>Your Plant Collection</h1>
        <p className="subtitle">View and manage your identified plants.</p>

        <div className="collection-empty">
          <div className="empty-icon">🌱</div>
          <h2>No plants in your collection yet</h2>
          <p>Use the Scan feature to identify and add plants to your collection.</p>
          <button
            className="button collection-button"
            onClick={() => setCurrentPage('upload')}
          >
            Scan a Plant
          </button>
        </div>
      </div>
    </section>
  );
}

export default CollectionPage;