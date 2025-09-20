import React from 'react';

interface CollectedImage {
  id: string;
  file: File;
  preview: string;
  status: 'analyzing' | 'completed' | 'error';
  species?: string;
  confidence?: number;
  description?: string;
  filename: string;
  timestamp: Date;
  region: string;
  plantData?: any;
}

interface CollectionPageProps {
  setCurrentPage: (page: 'home' | 'upload' | 'collection' | 'about' | 'loading' | 'results') => void;
  imageCollection: CollectedImage[];
}

function CollectionPage({ setCurrentPage, imageCollection }: CollectionPageProps) {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <section className="collection-section">
      <div className="container">
        <h1>Your Plant Collection</h1>
        <p className="subtitle">View and manage your identified plants.</p>

        {imageCollection.length === 0 ? (
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
        ) : (
          <div className="collection-grid">
            {imageCollection.map((image) => (
              <div key={image.id} className="collection-item">
                <div className="image-preview">
                  {image.preview ? (
                    <img src={image.preview} alt={image.filename} />
                  ) : (
                    <div className="placeholder-image">
                      <span>📷</span>
                      <p>Image not available</p>
                    </div>
                  )}
                  <div className={`upload-status ${image.status}`}>
                    {image.status === 'analyzing' && '🔄 Analyzing...'}
                    {image.status === 'completed' && '✅ Complete'}
                    {image.status === 'error' && '❌ Error'}
                  </div>
                </div>
                <div className="image-details">
                  {image.species && <h3>{image.species}</h3>}
                  {image.confidence && <p className="confidence">Confidence: {image.confidence}%</p>}
                  {image.description && <p className="description">{image.description}</p>}
                  <p className="filename">{image.filename}</p>
                  <p className="timestamp">{formatDate(image.timestamp)}</p>
                  <p className="region">Region: {image.region}</p>
                </div>
              </div>
            ))}
            <button
              className="button collection-button"
              onClick={() => setCurrentPage('upload')}
            >
              Scan Another Plant
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

export default CollectionPage;