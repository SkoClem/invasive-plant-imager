import React, { useEffect } from 'react';
import { PlantInfo } from '../types/api';

interface LoadingPageProps {
  setCurrentPage: (page: 'home' | 'upload' | 'collection' | 'about' | 'loading' | 'results') => void;
  setPlantData: (data: PlantInfo) => void;
}

// Mock data for demonstration
const mockPlantData: PlantInfo = {
  scientificName: "Lonicera japonica",
  commonName: "Japanese Honeysuckle",
  isInvasive: true,
  confidence: 0.92,
  description: "Japanese honeysuckle is a woody vine that can grow up to 30 feet long. It features fragrant, tubular flowers that are white or yellow and turn creamy with age.",
  impact: "This invasive vine outcompetes native vegetation by forming dense mats that shade out understory plants. It can girdle small trees and alter forest structure, reducing biodiversity and habitat quality for wildlife.",
  nativeAlternatives: [
    {
      scientificName: "Lonicera sempervirens",
      commonName: "Trumpet Honeysuckle",
      description: "A native vine with trumpet-shaped red flowers that attract hummingbirds and butterflies.",
      benefits: ["Supports local pollinators", "Provides food for birds", "Well-behaved growth habit"]
    },
    {
      scientificName: "Campsis radicans",
      commonName: "Trumpet Creeper",
      description: "A vigorous native vine with large trumpet-shaped orange flowers that are very attractive to hummingbirds.",
      benefits: ["Excellent for hummingbirds", "Drought tolerant once established", "Fast-growing screen"]
    }
  ],
  controlMethods: [
    "Manual removal by pulling vines from the base",
    "Cutting and treating stumps with herbicide",
    "Regular monitoring to prevent regrowth",
    "Planting native competitors to reduce available space"
  ],
  region: "United States, Texas"
};

function LoadingPage({ setCurrentPage, setPlantData }: LoadingPageProps) {
  useEffect(() => {
    // Simulate API call with 3-second delay
    const timer = setTimeout(() => {
      setPlantData(mockPlantData);
      setCurrentPage('results');
    }, 3000);

    return () => clearTimeout(timer);
  }, [setCurrentPage, setPlantData]);

  return (
    <section className="loading-section">
      <div className="container">
        <div className="loading-content">
          <div className="loading-animation">
            <div className="leaf-loader">
              <svg className="leaf-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="80" height="80" fill="currentColor">
                <path d="M17,8C8,10 5.9,16.17 3.82,21.34L5.71,22L6.66,19.7C7.14,19.87 7.64,20 8,20C19,20 22,3 22,3C21,5 14,5.25 9,6.25C4,7.25 2,11.5 2,13.5C2,15.5 3.75,17.25 3.75,17.25C7,8 17,8 17,8Z"/>
              </svg>
            </div>
            <div className="loading-spinner"></div>
          </div>

          <h1 className="loading-title">Analyzing Your Plant</h1>
          <p className="loading-subtitle">Our AI is identifying your plant and checking if it's invasive in your region</p>

          <div className="loading-steps">
            <div className="loading-step">
              <div className="step-indicator active">
                <div className="step-icon">📸</div>
              </div>
              <div className="step-text">
                <div className="step-title">Image Processing</div>
                <div className="step-description">Enhancing and analyzing your photo</div>
              </div>
            </div>

            <div className="loading-step">
              <div className="step-indicator">
                <div className="step-icon">🤖</div>
              </div>
              <div className="step-text">
                <div className="step-title">AI Identification</div>
                <div className="step-description">Matching plant characteristics</div>
              </div>
            </div>

            <div className="loading-step">
              <div className="step-indicator">
                <div className="step-icon">🌍</div>
              </div>
              <div className="step-text">
                <div className="step-title">Regional Analysis</div>
                <div className="step-description">Checking invasive status in your area</div>
              </div>
            </div>
          </div>

          <div className="loading-progress">
            <div className="progress-bar">
              <div className="progress-fill"></div>
            </div>
            <p className="progress-text">This may take a few moments...</p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default LoadingPage;