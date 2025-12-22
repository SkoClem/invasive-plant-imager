import React, { useState, useEffect, useRef } from 'react';
import { PlantInfo } from '../types/api';
import '../styles/components/PlantChat.css';
import { useAuth } from '../contexts/AuthContext';

const API_BASE_URL = (process.env.REACT_APP_API_URL || 'http://localhost:8000').replace(/\/$/, '');

interface PlantChatProps {
  plantData: PlantInfo;
}

interface Message {
  id: string;
  sender: 'user' | 'bot';
  text: string;
}

const PREDEFINED_QUESTIONS = [
  "What is the threat level?",
  "What are the harms of this species?",
  "Are there native lookalikes?",
  "What are some native replacements?",
  "What is the best course of action?",
  "Tell me more about this plant."
];

const PlantChat: React.FC<PlantChatProps> = ({ plantData }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'bot',
      text: `Hello! I'm your plant expert. I can tell you more about ${plantData.commonName || plantData.scientificName}. What would you like to know?`
    }
  ]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { firebaseUser } = useAuth();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleQuestionClick = async (question: string) => {
    if (loading) return;

    // Add user message
    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: question
    };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      // Prepare context
      const context = {
        species: plantData.commonName || plantData.scientificName,
        region: plantData.region,
        invasiveOrNot: plantData.isInvasive,
        description: plantData.description,
        invasiveEffects: plantData.impact
      };

      const token = firebaseUser ? await firebaseUser.getIdToken() : null;
      
      const response = await fetch(`${API_BASE_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          message: question,
          context: context
        })
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();
      
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: data.text
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: "I'm sorry, I'm having trouble connecting to the expert database right now. Please try again later."
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="plant-chat-container">
      <div className="chat-header">
        <h3>🌱 Plant Expert Chat</h3>
      </div>
      
      <div className="chat-messages">
        {messages.map((msg) => (
          <div key={msg.id} className={`message ${msg.sender}`}>
            <div className="message-bubble">
              {msg.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="message bot">
            <div className="message-bubble loading">
              <span className="dot"></span>
              <span className="dot"></span>
              <span className="dot"></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input-area">
        <p className="chat-instruction">Select a question to ask:</p>
        <div className="question-chips">
          {PREDEFINED_QUESTIONS.map((q, idx) => (
            <button
              key={idx}
              className="question-chip"
              onClick={() => handleQuestionClick(q)}
              disabled={loading}
            >
              {q}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PlantChat;