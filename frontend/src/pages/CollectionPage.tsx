import React from 'react';

interface CollectedImage {
  id: string;
  file?: File; // Made optional since backend doesn't store File objects
  status: 'analyzing' | 'completed' | 'error';
  species?: string;
  description?: string;
  timestamp: Date;
  region: string;
  plantData?: any;
}

interface CollectionPageProps {
  setCurrentPage: (page: 'home' | 'upload' | 'collection' | 'about' | 'loading' | 'results') => void;
  imageCollection: CollectedImage[];
  deleteCollectionItem?: (itemId: string) => Promise<void>;
  clearCollection?: () => Promise<void>;
  onItemClick?: (itemId: string) => void;
}

function CollectionPage({ setCurrentPage, imageCollection, deleteCollectionItem, onItemClick }: CollectionPageProps) {
  const [viewMode, setViewMode] = React.useState<'mobile' | 'desktop'>('mobile');
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'analyzing':
        return { bg: '#fff3cd', color: '#856404', icon: '🔄', text: 'Analyzing...' };
      case 'completed':
        return { bg: '#d4edda', color: '#155724', icon: '✅', text: 'Complete' };
      case 'error':
        return { bg: '#f8d7da', color: '#721c24', icon: '❌', text: 'Error' };
      default:
        return { bg: '#e2e3e5', color: '#383d41', icon: '❓', text: 'Unknown' };
    }
  };

  return (
    <section className="collection-section enhanced">
      <div className="container">
        <div className="collection-header">
          <div className="header-content">
            <h1 className="page-title">Your Plant Collection</h1>
            <p className="page-subtitle">
              Track your plant identification journey and contribute to conservation science
            </p>
          </div>
          <div className="collection-stats">
            <div className="stat-card">
              <div className="stat-number">{imageCollection.length}</div>
              <div className="stat-label">Total Scans</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">
                {imageCollection.filter(img => img.status === 'completed').length}
              </div>
              <div className="stat-label">Identified</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">
                {imageCollection.filter(img => img.status === 'analyzing').length}
              </div>
              <div className="stat-label">Processing</div>
            </div>
          </div>
        </div>

        {imageCollection.length === 0 ? (
          <div className="collection-empty enhanced">
            <div className="empty-illustration">
              <div className="empty-icon">🌿</div>
              <div className="empty-decoration">
                <span className="deco-leaf">🍃</span>
                <span className="deco-leaf">🌱</span>
                <span className="deco-leaf">🍀</span>
              </div>
            </div>
            <div className="empty-content">
              <h2 className="empty-title">Start Your Plant Collection</h2>
              <p className="empty-description">
                Your plant collection is empty. Use the Scan feature to identify invasive species and build your personal herbarium.
              </p>
              <div className="empty-benefits">
                <div className="benefit-item">
                  <span className="benefit-icon">🔍</span>
                  <span>AI-powered identification</span>
                </div>
                <div className="benefit-item">
                  <span className="benefit-icon">📍</span>
                  <span>Location-based tracking</span>
                </div>
                <div className="benefit-item">
                  <span className="benefit-icon">📊</span>
                  <span>Conservation impact</span>
                </div>
              </div>
              <button
                className="button primary-button enhanced"
                onClick={() => setCurrentPage('upload')}
              >
                <span className="button-icon">📸</span>
                <span className="button-text">Scan Your First Plant</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="collection-content">
            <div className="collection-actions">
              <button
                className="button secondary-button enhanced"
                onClick={() => setCurrentPage('upload')}
              >
                <span className="button-icon">➕</span>
                <span className="button-text">Add New Plant</span>
              </button>
              <div className="view-options">
                <button
                  className={`view-button ${viewMode === 'mobile' ? 'active' : ''}`}
                  onClick={() => setViewMode('mobile')}
                  title="Mobile view"
                >
                  <span className="view-icon">📱</span>
                </button>
                <button
                  className={`view-button ${viewMode === 'desktop' ? 'active' : ''}`}
                  onClick={() => setViewMode('desktop')}
                  title="Desktop view"
                >
                  <span className="view-icon">🖥️</span>
                </button>
              </div>
            </div>

            <div className={`collection-grid enhanced ${viewMode === 'desktop' ? 'desktop-view' : ''}`}>
              {imageCollection.map((image) => {
                const statusInfo = getStatusColor(image.status);
                return (
                  <div 
                    key={image.id} 
                    className="collection-item enhanced"
                    onClick={() => onItemClick && onItemClick(image.id)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="item-header">
                      <div className={`status-badge ${image.status}`} style={{ backgroundColor: statusInfo.bg, color: statusInfo.color }}>
                        <span className="status-icon">{statusInfo.icon}</span>
                        <span className="status-text">{statusInfo.text}</span>
                      </div>
                      <div className="item-actions">
                        <button 
                          className="action-button delete-button" 
                          title="Remove from collection"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteCollectionItem && deleteCollectionItem(image.id);
                          }}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                          </svg>
                        </button>
                      </div>
                    </div>

                    <div className="image-details enhanced">
                      {image.status === 'completed' && image.plantData ? (
                        <>
                          <h3 className="plant-name">
                            {image.plantData.commonName || image.plantData.scientificName || image.species || 'Unknown Plant'}
                          </h3>
                          {image.plantData.scientificName && (
                            <p className="scientific-name">{image.plantData.scientificName}</p>
                          )}
                          {image.plantData.region && (
                            <div className="native-location">
                              <span className="location-icon">🌍</span>
                              <span className="location-text">Native to: {image.plantData.region}</span>
                            </div>
                          )}
                          {image.plantData.isInvasive !== undefined && (
                            <div className={`invasive-status ${image.plantData.isInvasive ? 'invasive' : 'native'}`}>
                              <span className="status-icon">{image.plantData.isInvasive ? '🚨' : '✅'}</span>
                              <span className="status-text">
                                {image.plantData.isInvasive ? 'Invasive Species' : 'Native Plant'}
                              </span>
                            </div>
                          )}
                          {image.plantData.description && (
                            <p className="plant-description">{image.plantData.description}</p>
                          )}
                        </>
                      ) : image.status === 'completed' && image.species ? (
                        <>
                          <h3 className="plant-name">{image.species}</h3>
                          {image.description && (
                            <p className="plant-description">{image.description}</p>
                          )}
                        </>
                      ) : image.status === 'analyzing' ? (
                        <div className="analyzing-status">
                          <h3 className="plant-name">Analyzing Plant...</h3>
                          <p className="analyzing-description">
                            Our AI is identifying this plant and checking its invasive status.
                          </p>
                        </div>
                      ) : image.status === 'error' ? (
                        <div className="error-status">
                          <h3 className="plant-name">Analysis Failed</h3>
                          <p className="error-description">
                            Unable to identify this plant. Please try scanning again.
                          </p>
                        </div>
                      ) : (
                        <div className="unknown-status">
                          <h3 className="plant-name">Unknown Plant</h3>
                          <p className="unknown-description">
                            Plant information is not available.
                          </p>
                        </div>
                      )}
                      <div className="image-metadata">
                        <div className="metadata-item">
                          <span className="metadata-icon">🕒</span>
                          <span className="metadata-text">{formatDate(image.timestamp)}</span>
                        </div>
                        <div className="metadata-item">
                          <span className="metadata-icon">📍</span>
                          <span className="metadata-text">{image.region}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="collection-footer">
              <button
                className="button primary-button enhanced"
                onClick={() => setCurrentPage('upload')}
              >
                <span className="button-icon">📸</span>
                <span className="button-text">Scan Another Plant</span>
              </button>
              <p className="collection-tip">
                💡 Tip: Regular scanning helps track invasive species spread in your area
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export default CollectionPage;
