import React, { useEffect, useState, useMemo, useRef } from 'react';
import { PlantInfo } from '../types/api';
import { plantAnalysisService } from '../services/plantAnalysisService';
import { convertToPlantInfo } from '../utils/dataConversion';

interface LoadingPageProps {
  setCurrentPage: (page: 'home' | 'upload' | 'collection' | 'about' | 'loading' | 'results') => void;
  pendingAnalysis: { file: File; region: string; imageId?: string } | null;
  updateImageInCollection: (imageId: string, plantData: PlantInfo | null, status: 'completed' | 'error') => void;
}

function LoadingPage({ setCurrentPage, pendingAnalysis, updateImageInCollection }: LoadingPageProps) {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [progressMessage, setProgressMessage] = useState('Initializing analysis...');
  
  // Use ref to prevent duplicate API calls in React.StrictMode
  const hasStartedAnalysis = useRef(false);

  const steps = useMemo(() => [
    { title: 'Image Processing', description: 'Enhancing and analyzing your photo', icon: '📸' },
    { title: 'AI Identification', description: 'Matching plant characteristics', icon: '🤖' },
    { title: 'Regional Analysis', description: 'Checking invasive status in your area', icon: '🌍' }
  ], []);

  useEffect(() => {
    console.log('🔄 LoadingPage mounted, checking pendingAnalysis...');
    console.log('📋 Pending analysis data:', pendingAnalysis);
    
    // Prevent duplicate analysis in React.StrictMode
    if (hasStartedAnalysis.current) {
      console.log('⚠️ Analysis already started, skipping duplicate call');
      return;
    }
    
    if (!pendingAnalysis) {
      console.error('❌ No pending analysis data available');
      alert('No analysis data found. Please try scanning again.');
      setCurrentPage('upload');
      return;
    }

    // Mark that analysis has started
    hasStartedAnalysis.current = true;

    // Flag to prevent multiple requests
    let isMounted = true;
    let hasMadeRequest = false;

    const performAnalysis = async () => {
      // Prevent multiple requests
      if (hasMadeRequest || !isMounted) return;
      hasMadeRequest = true;

      // Faster, smoother progress simulation
      let progressValue = 0;
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev < 50) {
            progressValue = prev + Math.random() * 6 + 3; // rapid initial
          } else if (prev < 85) {
            progressValue = prev + Math.random() * 4 + 2; // moderate
          } else if (prev < 98) {
            progressValue = prev + Math.random() * 1.5 + 0.5; // final
          } else {
            progressValue = 98;
          }
          return Math.min(98, progressValue);
        });
      }, 200);

      const stepInterval = setInterval(() => {
        setCurrentStep(prev => Math.min(prev + 1, 2));
      }, 800);

      // Hard safety timeout shortened
      const safetyTimeout = setTimeout(() => {
        if (!isMounted) return;
        clearInterval(progressInterval);
        clearInterval(stepInterval);
        setProgress(100);
        setProgressMessage('Finalizing...');
      }, 20_000);

      try {
        setProgressMessage('Uploading image...');
        const apiStart = Date.now();
        const result = await plantAnalysisService.analyzePlant({
          image: pendingAnalysis.file,
          region: pendingAnalysis.region,
        });
        const apiDuration = Date.now() - apiStart;
        console.log(`✅ API response in ${(apiDuration/1000).toFixed(1)}s`);

        clearInterval(progressInterval);
        clearInterval(stepInterval);
        clearTimeout(safetyTimeout);
        setProgress(100);
        setCurrentStep(2);
        setProgressMessage('Analysis complete!');

        const plantInfo = convertToPlantInfo(result);
        const imageId = pendingAnalysis.imageId || 'latest';
        // Await collection update to ensure latest result is available
        await updateImageInCollection(imageId, plantInfo, 'completed');
        // Navigate promptly to results
        setCurrentPage('results');
      } catch (error) {
        if (!isMounted) return;
        console.error('❌ Analysis failed:', error);
        clearInterval(progressInterval);
        clearInterval(stepInterval);
        clearTimeout(safetyTimeout);
        setProgress(0);
        setProgressMessage('Analysis failed');
        const imageId = pendingAnalysis.imageId || 'latest';
        await updateImageInCollection(imageId, null, 'error');
        alert(`Analysis failed: ${error instanceof Error ? error.message : String(error)}`);
        setCurrentPage('upload');
      }
    };

    performAnalysis();

    return () => {
      isMounted = false;
      hasStartedAnalysis.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingAnalysis, setCurrentPage, updateImageInCollection]);

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
            {steps.map((step, index) => (
              <div key={index} className={`loading-step ${index <= currentStep ? 'active' : ''} ${index < currentStep ? 'completed' : ''}`}>
                <div className="step-icon">{step.icon}</div>
                <div className="step-content">
                  <div className="step-title">{step.title}</div>
                  <div className="step-description">{step.description}</div>
                </div>
                {index < currentStep && <div className="step-checkmark">✓</div>}
              </div>
            ))}
          </div>

          <div className="loading-progress">
            <div className="progress-bar-container">
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <div className="progress-percentage">{Math.round(progress)}%</div>
            </div>
            <p className="progress-message">{progressMessage}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default LoadingPage;