import React from 'react';

interface CollectedImage {
  id: string;
  file?: File; // Made optional since backend doesn't store File objects
  preview?: string; // Made optional since blob URLs can't be persisted
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
  deleteCollectionItem?: (itemId: string) => Promise<void>;
  clearCollection?: () => Promise<void>;
}

function CollectionPage({ setCurrentPage, imageCollection, deleteCollectionItem }: CollectionPageProps) {
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
                <button className="view-button active">
                  <span className="view-icon">📱</span>
                </button>
                <button className="view-button">
                  <span className="view-icon">🖥️</span>
                </button>
              </div>
            </div>

            <div className="collection-grid enhanced">
              {imageCollection.map((image) => {
                const statusInfo = getStatusColor(image.status);
                return (
                  <div key={image.id} className="collection-item enhanced">
                    <div className="item-header">
                      <div className={`status-badge ${image.status}`} style={{ backgroundColor: statusInfo.bg, color: statusInfo.color }}>
                        <span className="status-icon">{statusInfo.icon}</span>
                        <span className="status-text">{statusInfo.text}</span>
                      </div>
                      <div className="item-actions">
                        <button className="action-button" title="View details">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                          </svg>
                        </button>
                        <button className="action-button" title="Share">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3c-.79 0-1.5.31-2.04.81l-7.05-4.11c.05-.23.09-.46.09-.7 0-1.66-1.34-3-3-3s-3 1.34-3 3 1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.05 4.11c-.05.23-.09.46-.09.7s.04.47.09.7l-7.05 4.11c-.54-.5-1.25-.81-2.04-.81-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.05 4.11c-.05.23-.09.46-.09.7 0 1.66 1.34 3 3 3s3-1.34 3-3-1.34-3-3-3z"/>
                          </svg>
                        </button>
                        <button 
                          className="action-button delete-button" 
                          title="Remove from collection"
                          onClick={() => deleteCollectionItem && deleteCollectionItem(image.id)}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                          </svg>
                        </button>
                      </div>
                    </div>

                    <div className="image-preview enhanced">
                      {image.preview ? (
                        <>
                          <img src={image.preview} alt={image.filename} />
                          <div className="image-overlay">
                            <button className="overlay-button">
                              <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                              </svg>
                            </button>
                          </div>
                        </>
                      ) : (
                        <div className="placeholder-image enhanced">
                          <span className="placeholder-icon">📷</span>
                          <p className="placeholder-text">Image not available</p>
                        </div>
                      )}
                    </div>

                    <div className="image-details enhanced">
                      {image.status === 'completed' && image.plantData ? (
                        <>
                          <h3 className="plant-name">
                            {image.plantData.commonName || image.plantData.scientificName || image.species || 'Unknown Plant'}
                          </h3>
                          {image.plantData.scientificName && image.plantData.commonName && (
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
                          {image.confidence && (
                            <div className="confidence-meter">
                              <div className="confidence-label">Confidence: {image.confidence}%</div>
                              <div className="confidence-bar">
                                <div
                                  className="confidence-fill"
                                  style={{ width: `${image.confidence}%` }}
                                ></div>
                              </div>
                            </div>
                          )}
                          {image.plantData.description && (
                            <p className="plant-description">{image.plantData.description}</p>
                          )}
                        </>
                      ) : image.status === 'completed' && image.species ? (
                        <>
                          <h3 className="plant-name">{image.species}</h3>
                          {image.confidence && (
                            <div className="confidence-meter">
                              <div className="confidence-label">Confidence: {image.confidence}%</div>
                              <div className="confidence-bar">
                                <div
                                  className="confidence-fill"
                                  style={{ width: `${image.confidence}%` }}
                                ></div>
                              </div>
                            </div>
                          )}
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
                          <span className="metadata-icon">📄</span>
                          <span className="metadata-text">{image.filename}</span>
                        </div>
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