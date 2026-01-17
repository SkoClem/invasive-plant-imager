import React, { useState, useEffect } from 'react';
import PlantChat, { Message } from '../components/PlantChat';
import { PlantInfo } from '../types/api';
import { API_BASE_URL } from '../config/api';
import { formatPlantDisplayName } from '../utils/dataConversion';

const FEEDBACK_STORAGE_KEY = 'plantFeedbackCompleted';

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
  const [feedbackChoice, setFeedbackChoice] = useState<'up' | 'down' | null>(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackType, setFeedbackType] = useState<'wrong-plant' | 'wrong-invasive' | 'wrong-native-region' | ''>('');
  const [feedbackText, setFeedbackText] = useState('');
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);
  const [feedbackCompleted, setFeedbackCompleted] = useState(false);

  useEffect(() => {
    if (!currentPlant || !currentPlant.id) {
      setFeedbackCompleted(false);
      setFeedbackChoice(null);
      setShowFeedbackModal(false);
      setFeedbackError(null);
      setFeedbackType('');
      setFeedbackText('');
      return;
    }
    try {
      const stored = localStorage.getItem(FEEDBACK_STORAGE_KEY);
      const parsed: Record<string, boolean> = stored ? JSON.parse(stored) : {};
      const completed = !!parsed[currentPlant.id];
      setFeedbackCompleted(completed);
      setFeedbackChoice(null);
      setShowFeedbackModal(false);
      setFeedbackError(null);
      setFeedbackType('');
      setFeedbackText('');
    } catch {
      setFeedbackCompleted(false);
    }
  }, [currentPlant]);

  const markFeedbackCompleted = (plantId: string) => {
    try {
      const stored = localStorage.getItem(FEEDBACK_STORAGE_KEY);
      const parsed: Record<string, boolean> = stored ? JSON.parse(stored) : {};
      parsed[plantId] = true;
      localStorage.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify(parsed));
    } catch {
    }
  };

  const handleThumbUp = async () => {
    if (!currentPlant || !currentPlant.plantData) return;
    if (feedbackCompleted) return;
    setFeedbackChoice('up');
    setFeedbackError(null);
    try {
      await fetch(`${API_BASE_URL}/api/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plantId: currentPlant.id,
          specieIdentified: currentPlant.plantData.scientificName || currentPlant.plantData.commonName,
          isInvasive: currentPlant.plantData.isInvasive,
          userRegion: currentPlant.plantData.region,
          nativeRegion: currentPlant.plantData.nativeRegion,
          feedbackType: 'thumbs-up',
          comment: null,
          context: {
            source: 'results-view',
            description: currentPlant.description || currentPlant.plantData.description || null
          }
        })
      });
      markFeedbackCompleted(currentPlant.id);
      setFeedbackCompleted(true);
    } catch (e) {
    }
  };

  const handleThumbDownClick = () => {
    if (!currentPlant || !currentPlant.plantData) return;
    if (feedbackCompleted) return;
    setFeedbackChoice('down');
    setShowFeedbackModal(true);
    setFeedbackError(null);
    setFeedbackType('');
    setFeedbackText('');
  };

  const handleSubmitFeedback = async () => {
    if (!currentPlant || !currentPlant.plantData) return;
    if (!feedbackType) {
      setFeedbackError('Please select a reason.');
      return;
    }
    setIsSubmittingFeedback(true);
    setFeedbackError(null);
    try {
      await fetch(`${API_BASE_URL}/api/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plantId: currentPlant.id,
          specieIdentified: currentPlant.plantData.scientificName || currentPlant.plantData.commonName,
          isInvasive: currentPlant.plantData.isInvasive,
          userRegion: currentPlant.plantData.region,
          nativeRegion: currentPlant.plantData.nativeRegion,
          feedbackType,
          comment: feedbackText || null,
          context: {
            source: 'results-view',
            description: currentPlant.description || currentPlant.plantData.description || null
          }
        })
      });
      setShowFeedbackModal(false);
      markFeedbackCompleted(currentPlant.id);
      setFeedbackCompleted(true);
    } catch (e) {
      setFeedbackError('Could not submit feedback. Please try again.');
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  return (
    <section className="chat-page results-section">
      <div className="container">
        {currentPlant && currentPlant.plantData ? (
          <>
            <div className={`results-header ${currentPlant.plantData.isInvasive ? 'invasive' : 'non-invasive'}`}>
              <div className="status-icon">{currentPlant.plantData.isInvasive ? '' : ''}</div>
              <div className="status-content">
                <h1 className="status-title">
                  {formatPlantDisplayName(
                    currentPlant.plantData.scientificName,
                    currentPlant.plantData.commonName
                  ) || 'Analysis Result'}
                </h1>
              </div>
            </div>

          <div className="results-content">
              <div className="results-details">
                {currentPlant.plantData.scientificName &&
                  currentPlant.plantData.scientificName !==
                    (currentPlant.plantData.commonName || currentPlant.plantData.scientificName) && (
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
                  <div className="detail-section">
                    <h3 className="detail-title">Description</h3>
                    <p className="plant-description">{currentPlant.plantData.description || currentPlant.description}</p>
                  </div>
                )}

                {currentPlant.plantData.impact && (
                  <div className="detail-section">
                    <h3 className="detail-title">Invasive Effects</h3>
                    <p className="detail-text">{currentPlant.plantData.impact}</p>
                  </div>
                )}

                {currentPlant.plantData.nativeAlternatives && currentPlant.plantData.nativeAlternatives.length > 0 && (
                  <div className="detail-section">
                    <h3 className="detail-title">Native Alternatives</h3>
                    <ul className="alternatives-list">
                      {currentPlant.plantData.nativeAlternatives.map((alt, index) => (
                        <li key={index} className="alternative-item">
                          <strong>{alt.commonName}</strong> ({alt.scientificName})
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {currentPlant.plantData.controlMethods && currentPlant.plantData.controlMethods.length > 0 && (
                  <div className="detail-section">
                    <h3 className="detail-title">Removal Instructions</h3>
                    <ul className="control-list">
                      {currentPlant.plantData.controlMethods.map((method, index) => (
                        <li key={index} className="control-item">{method}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {!feedbackCompleted && (
                  <div className="feedback-section">
                    <div className="feedback-prompt">Was this identification accurate?</div>
                    <div className="feedback-buttons">
                      <button
                        className={`thumb-button up ${feedbackChoice === 'up' ? 'active' : ''}`}
                        onClick={handleThumbUp}
                        type="button"
                      >
                        <span className="thumb-icon">✓</span>
                      </button>
                      <button
                        className={`thumb-button down ${feedbackChoice === 'down' ? 'active' : ''}`}
                        onClick={handleThumbDownClick}
                        type="button"
                      >
                        <span className="thumb-icon">✕</span>
                      </button>
                    </div>
                  </div>
                )}
                {feedbackCompleted && !showFeedbackModal && (
                  <div className="feedback-status">Thanks for your feedback.</div>
                )}
                {showFeedbackModal && (
                  <div className="feedback-modal-backdrop">
                    <div className="feedback-modal">
                      <h3 className="feedback-title">What was the issue?</h3>
                      <div className="feedback-options">
                        <button
                          type="button"
                          className={`feedback-option ${feedbackType === 'wrong-plant' ? 'selected' : ''}`}
                          onClick={() => setFeedbackType('wrong-plant')}
                        >
                          Wrong plant species
                        </button>
                        <button
                          type="button"
                          className={`feedback-option ${feedbackType === 'wrong-invasive' ? 'selected' : ''}`}
                          onClick={() => setFeedbackType('wrong-invasive')}
                        >
                          Wrong about invasiveness
                        </button>
                        <button
                          type="button"
                          className={`feedback-option ${feedbackType === 'wrong-native-region' ? 'selected' : ''}`}
                          onClick={() => setFeedbackType('wrong-native-region')}
                        >
                          Wrong about native region
                        </button>
                      </div>
                      <textarea
                        className="feedback-textarea"
                        placeholder="Add any details that would help us improve."
                        value={feedbackText}
                        onChange={(e) => setFeedbackText(e.target.value)}
                      />
                      {feedbackError && <div className="feedback-error">{feedbackError}</div>}
                      <div className="feedback-actions">
                        <button
                          type="button"
                          className="feedback-cancel"
                          onClick={() => {
                            setShowFeedbackModal(false);
                            setFeedbackError(null);
                          }}
                          disabled={isSubmittingFeedback}
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          className="feedback-submit"
                          onClick={handleSubmitFeedback}
                          disabled={isSubmittingFeedback}
                        >
                          {isSubmittingFeedback ? 'Submitting...' : 'Submit Feedback'}
                        </button>
                      </div>
                    </div>
                  </div>
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
