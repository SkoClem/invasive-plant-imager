import React from 'react';
import { PlantInfo } from '../types/api';
import { mapService } from '../services/mapService';

interface CollectedImage {
  id: string;
  file?: File; // Made optional since backend doesn't store File objects
  status: 'analyzing' | 'completed' | 'error';
  species?: string;
  description?: string;
  timestamp: Date;
  region: string;
  plantData?: PlantInfo;
}

interface CollectionPageProps {
  setCurrentPage: (page: 'home' | 'upload' | 'collection' | 'about' | 'learn' | 'loading' | 'chat' | 'map') => void;
  imageCollection: CollectedImage[];
  deleteCollectionItem?: (itemId: string) => Promise<void>;
  clearCollection?: () => Promise<void>;
  onItemClick?: (itemId: string) => void;
}

function CollectionPage({ setCurrentPage, imageCollection, deleteCollectionItem, clearCollection, onItemClick }: CollectionPageProps) {
  const [viewMode, setViewMode] = React.useState<'mobile' | 'desktop'>('mobile');
  const [deletingItems, setDeletingItems] = React.useState<Set<string>>(new Set());
  const [addingToMap, setAddingToMap] = React.useState<string | null>(null);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!deleteCollectionItem) return;

    // Add to deleting set to trigger animation
    setDeletingItems(prev => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });

    // Wait for animation to complete before actually deleting
    setTimeout(async () => {
      await deleteCollectionItem(id);
      // Remove from deleting set (though item should be gone from list by now)
      setDeletingItems(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }, 500); // 500ms matches CSS animation duration
  };

  const handleAddToMap = async (e: React.MouseEvent, image: CollectedImage) => {
    e.stopPropagation();
    if (!image.plantData) return;

    if (!image.plantData.isInvasive) {
      alert('Only invasive plants can be reported to the community map.');
      return;
    }

    if (!window.confirm('Do you want to share this plant location on the community map? Your approximate location will be used.')) {
      return;
    }

    setAddingToMap(image.id);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          
          // Check if location is within Texas boundaries
          const TEXAS_MIN_LAT = 25.837164;
          const TEXAS_MAX_LAT = 36.500704;
          const TEXAS_MIN_LON = -106.646641;
          const TEXAS_MAX_LON = -93.508039;

          if (!(latitude >= TEXAS_MIN_LAT && latitude <= TEXAS_MAX_LAT && 
                longitude >= TEXAS_MIN_LON && longitude <= TEXAS_MAX_LON)) {
            alert('Markers can only be placed within Texas. Your current location appears to be outside Texas.');
            setAddingToMap(null);
            return;
          }

          try {
            await mapService.addMarker({
              latitude: latitude,
              longitude: longitude,
              plant_name: image.plantData?.commonName || 'Unknown Plant',
              is_invasive: image.plantData?.isInvasive || false,
              scan_id: image.id
            });
            alert('Successfully added to map!');
            setCurrentPage('map');
          } catch (error: any) {
            console.error('Error adding to map:', error);
            // Show the error message from backend if available
            const errorMessage = error.message || 'Failed to add to map. Please try again.';
            alert(errorMessage);
          } finally {
            setAddingToMap(null);
          }
        },
        (error) => {
          console.error('Geolocation error:', error);
          alert('Could not get your location. Please enable location services.');
          setAddingToMap(null);
        }
      );
    } else {
      alert('Geolocation is not supported by this browser.');
      setAddingToMap(null);
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
          </div>
        </div>

        {imageCollection.length === 0 ? (
          <div className="collection-empty enhanced">
            <div className="empty-illustration">
              <div className="empty-icon"></div>
              <div className="empty-decoration">
                <span className="deco-leaf"></span>
                <span className="deco-leaf"></span>
                <span className="deco-leaf"></span>
              </div>
            </div>
            <div className="empty-content">
              <h2 className="empty-title">Start Your Plant Collection</h2>
              <p className="empty-description">
                Your plant collection is empty. Use the Scan feature to identify invasive species and build your personal herbarium.
              </p>
              <div className="empty-benefits">
                <div className="benefit-item">
                  <span className="benefit-icon"></span>
                  <span>AI-powered identification</span>
                </div>
                <div className="benefit-item">
                  <span className="benefit-icon"></span>
                  <span>Location-based tracking</span>
                </div>
                <div className="benefit-item">
                  <span className="benefit-icon"></span>
                  <span>Conservation impact</span>
                </div>
              </div>
              <button
                className="button primary-button enhanced"
                onClick={() => setCurrentPage('upload')}
              >
                <span className="button-icon"></span>
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
                <span className="button-icon"></span>
                <span className="button-text">Add New Plant</span>
              </button>
              <div className="view-options">
                <button
                  className={`view-button ${viewMode === 'mobile' ? 'active' : ''}`}
                  onClick={() => setViewMode('mobile')}
                  title="Mobile view"
                >
                  <span className="view-icon"></span>
                </button>
                <button
                  className={`view-button ${viewMode === 'desktop' ? 'active' : ''}`}
                  onClick={() => setViewMode('desktop')}
                  title="Desktop view"
                >
                  <span className="view-icon"></span>
                </button>
              </div>
            </div>

            <div className={`collection-grid enhanced ${viewMode === 'desktop' ? 'desktop-view' : ''}`}>
              {imageCollection.map((image) => {
                const isDeleting = deletingItems.has(image.id);
                const borderClass = image.plantData?.isInvasive ? 'invasive-border' : (image.plantData?.isInvasive === false ? 'native-border' : '');
                return (
                  <div 
                    key={image.id} 
                    className={`collection-item enhanced ${isDeleting ? 'shrinking' : ''} ${borderClass}`}
                    onClick={() => onItemClick && onItemClick(image.id)}
                  >
                    <div className="item-header">
                      {image.status === 'analyzing' ? (
                        <div className="status-badge analyzing">Analyzing</div>
                      ) : image.status === 'error' ? (
                        <div className="status-badge error">Error</div>
                      ) : image.plantData?.isInvasive ? (
                        <div className="status-badge invasive">Invasive</div>
                      ) : (
                        <div className="status-badge native">Native</div>
                      )}
                      
                      <div className="header-actions">
                        {image.status === 'completed' && (
                          <button
                            className="action-button map-button"
                            aria-label="Add to Map"
                            title="Add to Map"
                            onClick={(e) => handleAddToMap(e, image)}
                            disabled={addingToMap === image.id}
                          >
                            {addingToMap === image.id ? (
                              <div className="spinner-small"></div>
                            ) : (
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                              </svg>
                            )}
                          </button>
                        )}
                        <button 
                          className="action-button delete-button"
                          aria-label="Delete item"
                          onClick={(e) => handleDelete(e, image.id)}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                          </svg>
                        </button>
                      </div>
                    </div>

                    <div className="image-details enhanced" style={{ padding: '0 8px' }}>
                      {image.status === 'completed' && image.plantData ? (
                        <>
                          <h3 className="plant-name" style={{ fontSize: '1.1rem', marginBottom: '4px' }}>
                            {image.plantData.commonName || image.plantData.scientificName || image.species || 'Unknown Plant'}
                          </h3>
                          {image.plantData.scientificName && (
                            <p className="scientific-name" style={{ fontSize: '0.9rem', marginBottom: '4px' }}>{image.plantData.scientificName}</p>
                          )}
                          {image.plantData.region && (
                            <div className="native-location" style={{ fontSize: '0.8rem', marginBottom: '4px' }}>
                              <span className="location-icon"></span>
                              <span className="location-text">Native to: {image.plantData.region}</span>
                            </div>
                          )}
                          {image.plantData.description && (
                            <p className="plant-description" style={{ 
                              fontSize: '0.9rem', 
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                              marginBottom: '8px'
                            }}>
                              {image.plantData.description}
                            </p>
                          )}
                        </>
                      ) : image.status === 'completed' && image.species ? (
                        <>
                          <h3 className="plant-name" style={{ fontSize: '1.1rem' }}>{image.species}</h3>
                          {image.description && (
                            <p className="plant-description" style={{ fontSize: '0.9rem' }}>{image.description}</p>
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
                          <span className="metadata-icon"></span>
                          <span className="metadata-text">{formatDate(image.timestamp)}</span>
                        </div>
                        <div className="metadata-item">
                          <span className="metadata-icon"></span>
                          <span className="metadata-text">{image.region}</span>
                        </div>
                      </div>
                      
                      <div className="action-buttons" style={{ marginTop: '12px', display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        {image.status === 'completed' && image.plantData && (
                          <button 
                            className="action-button map-button"
                            onClick={(e) => handleAddToMap(e, image)}
                            disabled={addingToMap === image.id}
                            title="Add to Community Map"
                            style={{
                              background: 'transparent',
                              border: 'none',
                              cursor: 'pointer',
                              padding: '8px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#2196f3',
                              borderRadius: '50%',
                              transition: 'background-color 0.2s'
                            }}
                          >
                            {addingToMap === image.id ? (
                              <div className="spinner-small"></div>
                            ) : (
                              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                                <circle cx="12" cy="10" r="3"></circle>
                              </svg>
                            )}
                          </button>
                        )}
                        <button 
                          className="action-button delete-button"
                          onClick={(e) => handleDelete(e, image.id)}
                          title="Delete from Collection"
                        >
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                          </svg>
                        </button>
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
                <span className="button-icon"></span>
                <span className="button-text">Scan Another Plant</span>
              </button>
              <p className="collection-tip">
                Tip: Regular scanning helps track invasive species spread in your area
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export default CollectionPage;
