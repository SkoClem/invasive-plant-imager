import React, { useEffect } from 'react';
import { PlantInfo } from '../types/api';
import { plantAnalysisService } from '../services/plantAnalysisService';
import { convertToPlantInfo } from '../utils/dataConversion';

interface LoadingPageProps {
  setCurrentPage: (page: 'home' | 'upload' | 'collection' | 'about' | 'loading' | 'results') => void;
  setPlantData: (data: PlantInfo) => void;
  pendingAnalysis: { file: File; region: string } | null;
}

function LoadingPage({ setCurrentPage, setPlantData, pendingAnalysis }: LoadingPageProps) {
  useEffect(() => {
    if (!pendingAnalysis) {
      console.error('No pending analysis data available');
      setCurrentPage('upload');
      return;
    }

    // Flag to prevent multiple requests
    let isMounted = true;
    let hasMadeRequest = false;

    const performAnalysis = async () => {
      // Prevent multiple requests
      if (hasMadeRequest || !isMounted) return;
      hasMadeRequest = true;

      console.log('🌱 Starting analysis with:', {
        fileName: pendingAnalysis.file.name,
        fileSize: `${(pendingAnalysis.file.size / 1024 / 1024).toFixed(2)} MB`,
        fileType: pendingAnalysis.file.type,
        region: pendingAnalysis.region
      });

      // Show image info in loading screen
      console.log(`📤 Uploading: ${pendingAnalysis.file.name} (${(pendingAnalysis.file.size / 1024 / 1024).toFixed(2)} MB)`);

      // Safety timeout - redirect back to upload after 2 minutes
      const safetyTimeout = setTimeout(() => {
        if (isMounted) {
          console.error('Analysis timed out after 2 minutes');
          alert('Analysis is taking too long. Please try again.');
          setCurrentPage('upload');
        }
      }, 120000); // 2 minutes

      try {
        console.log('Making API call to backend...');
        const result = await plantAnalysisService.analyzePlant({
          image: pendingAnalysis.file,
          region: pendingAnalysis.region
        });

        if (!isMounted) return;

        console.log('API response received:', result);

        // Clear safety timeout
        clearTimeout(safetyTimeout);

        const plantInfo = convertToPlantInfo(result);
        console.log('Converted to PlantInfo:', plantInfo);

        if (isMounted) {
          setPlantData(plantInfo);
          setCurrentPage('results');
        }
      } catch (error) {
        if (!isMounted) return;

        console.error('Analysis failed:', error);
        clearTimeout(safetyTimeout);
        alert(`Analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        setCurrentPage('upload');
      }
    };

    performAnalysis();

    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, [pendingAnalysis, setCurrentPage, setPlantData]);

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
          <p className="loading-subtitle">
            Our AI is identifying your plant and checking if it's invasive in your region
            {pendingAnalysis && (
              <span className="file-info">
                <br />
                📸 {pendingAnalysis.file.name} ({(pendingAnalysis.file.size / 1024 / 1024).toFixed(1)} MB)
              </span>
            )}
          </p>

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
            <p className="progress-text">
              {pendingAnalysis ?
                "Waking up the AI service... This may take up to a minute if the service is sleeping." :
                "This may take a few moments..."}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default LoadingPage;