import React from 'react';
import PlantChat, { Message } from '../components/PlantChat';
import { PlantInfo } from '../types/api';

interface ChatPageProps {
  currentPlant: {
    id: string;
    species?: string;
    plantData?: PlantInfo;
  } | null;
  messages: Message[];
  onNewMessage: (message: Message) => void;
  onNavigateToCollection: () => void;
}

const ChatPage: React.FC<ChatPageProps> = ({ 
  currentPlant, 
  messages, 
  onNewMessage,
  onNavigateToCollection
}) => {
  return (
    <section className="chat-page">
      <div className="container">
        <div className="chat-page-header">
          <h1>Plant Expert Chat</h1>
          {currentPlant && (
            <p className="subtitle">
              Chatting about: <span className="highlight">{currentPlant.species || currentPlant.plantData?.commonName || 'Unknown Plant'}</span>
            </p>
          )}
        </div>

        <div className="chat-content">
          {currentPlant && currentPlant.plantData ? (
            <PlantChat 
              plantData={currentPlant.plantData}
              messages={messages}
              onNewMessage={onNewMessage}
            />
          ) : (
            <div className="empty-chat-state">
              <div className="empty-icon">💬</div>
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
      </div>
    </section>
  );
};

export default ChatPage;
