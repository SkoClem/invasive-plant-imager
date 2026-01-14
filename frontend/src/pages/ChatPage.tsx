import React from 'react';
import PlantChat, { Message } from '../components/PlantChat';
import { PlantInfo } from '../types/api';

interface ChatPageProps {
  currentPlant: {
    id: string;
    species?: string;
    description?: string;
    plantData?: PlantInfo;
  } | null;
  messages: Message[];
  onNewMessage: (message: Message) => void;
  onNavigateToCollection: () => void;
  onNavigateToUpload: () => void;
  userRole: string;
}

const ChatPage: React.FC<ChatPageProps> = ({ 
  currentPlant, 
  messages, 
  onNewMessage,
  onNavigateToCollection,
  onNavigateToUpload,
  userRole
}) => {
  return (
    <section className="chat-page results-section">
      <div className="container">
        {currentPlant && currentPlant.plantData ? (
          <>
            <div className={`results-header ${currentPlant.plantData.isInvasive ? 'invasive' : 'non-invasive'}`}>
              <div className="status-icon">{currentPlant.plantData.isInvasive ? '' : ''}</div>
              <div className="status-content">
                <h1 className="status-title">{currentPlant.plantData.commonName || currentPlant.plantData.scientificName || 'Analysis Result'}</h1>
              </div>
            </div>

            <div className="results-content">
              <div className="results-details">
                {currentPlant.plantData.scientificName && (
                  <p className="scientific-name">{currentPlant.plantData.scientificName}</p>
                )}
                {currentPlant.plantData.region && (
                  <div className="native-location">
                    <span className="location-icon"></span>
                    <span className="location-text">Native to: {currentPlant.plantData.region}</span>
                  </div>
                )}
                <div className={`invasive-status ${currentPlant.plantData.isInvasive ? 'invasive' : 'native'}`}>
                  <span className="status-icon">{currentPlant.plantData.isInvasive ? '' : ''}</span>
                  <span className="status-text">
                    {currentPlant.plantData.isInvasive ? 'Invasive Species' : 'Native Plant'}
                  </span>
                </div>
                
                {currentPlant.plantData.confidenceScore !== undefined && (
                  <div className="confidence-section">
                    <div className="confidence-header">
                      <span className="confidence-label">Confidence Score:</span>
                      <div className="confidence-badge-wrapper">
                        <span className={`confidence-badge ${
                          currentPlant.plantData.confidenceScore >= 80 ? 'high' : 
                          currentPlant.plantData.confidenceScore >= 50 ? 'medium' : 'low'
                        }`}>
                          {currentPlant.plantData.confidenceScore}%
                        </span>
                      </div>
                    </div>
                    {currentPlant.plantData.confidenceReasoning && (
                      <p className="confidence-reasoning">
                        <span className="reasoning-label">Analysis:</span> {currentPlant.plantData.confidenceReasoning}
                      </p>
                    )}
                    <div className="cost-optimization-message" style={{ 
                      marginTop: '1rem', 
                      padding: '0.75rem', 
                      background: 'rgba(var(--primary-rgb), 0.1)', 
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.85rem',
                      color: 'var(--text-secondary)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}>
                      <span style={{ fontSize: '1.2rem' }}>⚡</span>
                      This identification was optimized using a local model before querying a large AI system to reduce computational cost.
                    </div>
                  </div>
                )}

                {(currentPlant.plantData.description || currentPlant.description) && (
                  <p className="plant-description">{currentPlant.plantData.description || currentPlant.description}</p>
                )}
              </div>
              
              <PlantChat 
                plantData={currentPlant.plantData}
                messages={messages}
                onNewMessage={onNewMessage}
                userRole={userRole}
              />
            </div>

            <div className="results-actions">
              <button
                className="button secondary-button"
                onClick={onNavigateToUpload}
              >
                Scan Another Plant
              </button>
              <button
                className="button primary-button"
                onClick={onNavigateToCollection}
              >
                View Collection
              </button>
            </div>
          </>
        ) : (
          <div className="empty-chat-state">
            <div className="empty-icon"></div>
            <h2>No Plant Selected</h2>
            <p>Select a plant from your collection or scan a new one to start chatting with the expert.</p>
            <button 
              className="button primary-button"
              onClick={onNavigateToCollection}
            >
              Go to Collection
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default ChatPage;
