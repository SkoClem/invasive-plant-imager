import React, { useEffect, useState, useMemo } from 'react';
import { PlantInfo } from '../types/api';
import { plantAnalysisService } from '../services/plantAnalysisService';
import { convertToPlantInfo } from '../utils/dataConversion';

interface LoadingPageProps {
  setCurrentPage: (page: 'home' | 'upload' | 'collection' | 'about' | 'loading' | 'results') => void;
  setPlantData: (data: PlantInfo) => void;
  pendingAnalysis: { file: File; region: string; imageId?: string } | null;
  updateImageInCollection: (imageId: string, plantData: PlantInfo | null, status: 'completed' | 'error') => void;
}

function LoadingPage({ setCurrentPage, setPlantData, pendingAnalysis, updateImageInCollection }: LoadingPageProps) {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [progressMessage, setProgressMessage] = useState('Initializing analysis...');

  const steps = useMemo(() => [
    { title: 'Image Processing', description: 'Enhancing and analyzing your photo', icon: '📸' },
    { title: 'AI Identification', description: 'Matching plant characteristics', icon: '🤖' },
    { title: 'Regional Analysis', description: 'Checking invasive status in your area', icon: '🌍' }
  ], []);

  useEffect(() => {
    console.log('🔄 LoadingPage mounted, checking pendingAnalysis...');
    console.log('📋 Pending analysis data:', pendingAnalysis);
    
    if (!pendingAnalysis) {
      console.error('❌ No pending analysis data available');
      alert('No analysis data found. Please try scanning again.');
      setCurrentPage('upload');
      return;
    }

    if (!pendingAnalysis.file) {
      console.error('❌ No file in pending analysis');
      alert('No image file found. Please select an image and try again.');
      setCurrentPage('upload');
      return;
    }

    if (!pendingAnalysis.region) {
      console.error('❌ No region in pending analysis');
      alert('No region selected. Please select a region and try again.');
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

      // More realistic progress simulation
      let progressValue = 0;
      
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          // Simulate more realistic progress curve - slower overall
          if (prev < 20) {
            // Slower initial progress (image upload/processing)
            progressValue = prev + Math.random() * 3 + 1;
          } else if (prev < 40) {
            // Moderate progress (AI analysis starting)
            progressValue = prev + Math.random() * 2 + 0.5;
          } else if (prev < 70) {
            // Slower progress (deep AI analysis)
            progressValue = prev + Math.random() * 1.5 + 0.3;
          } else if (prev < 85) {
            // Very slow progress (final processing)
            progressValue = prev + Math.random() * 0.8 + 0.2;
          } else {
            // Stay at 85-92% until API completes - more realistic
            progressValue = Math.min(prev + Math.random() * 0.4, 92);
          }
          
          return Math.min(progressValue, 92); // Cap at 92% until API completes
        });
      }, 1200); // Slower updates - every 1.2 seconds for more realistic feel

      // Step progression with better timing
      const stepInterval = setInterval(() => {
        setCurrentStep(prev => {
          const nextStep = Math.min(prev + 1, steps.length - 1);
          if (nextStep < steps.length) {
            setProgressMessage(steps[nextStep].description);
          }
          return nextStep;
        });
      }, 6000); // Longer step duration - 6 seconds per step

      // Safety timeout - redirect back to upload after 2 minutes
      const safetyTimeout = setTimeout(() => {
        if (isMounted) {
          console.error('⏰ Analysis timed out after 2 minutes');
          clearInterval(progressInterval);
          clearInterval(stepInterval);
          alert('Analysis is taking too long. Please try again.');
          setCurrentPage('upload');
        }
      }, 120000); // 2 minutes

      try {
        console.log('📡 Making API call to backend...');
        setProgressMessage('Connecting to AI service...');
        
        // Add timestamp to track actual API timing
        const apiStartTime = Date.now();
        
        const result = await plantAnalysisService.analyzePlant({
          image: pendingAnalysis.file,
          region: pendingAnalysis.region
        });

        if (!isMounted) return;

        const apiEndTime = Date.now();
        const apiDuration = apiEndTime - apiStartTime;
        console.log(`✅ API response received in ${apiDuration}ms (${(apiDuration / 1000).toFixed(1)}s)`);

        // Complete the progress bar smoothly
        clearInterval(progressInterval);
        clearInterval(stepInterval);
        
        // Animate to 100% over 500ms for smooth completion
        const completeProgress = () => {
          let currentProgress = progress;
          const targetProgress = 100;
          const animationDuration = 500; // 500ms
          const steps = 20;
          const increment = (targetProgress - currentProgress) / steps;
          const stepDuration = animationDuration / steps;
          
          let step = 0;
          const animationInterval = setInterval(() => {
            step++;
            currentProgress += increment;
            setProgress(Math.min(currentProgress, 100));
            
            if (step >= steps || currentProgress >= 100) {
              clearInterval(animationInterval);
              setProgress(100);
            }
          }, stepDuration);
        };
        
        completeProgress();
        setCurrentStep(steps.length - 1);
        setProgressMessage('Analysis complete!');

        // Clear safety timeout
        clearTimeout(safetyTimeout);

        const plantInfo = convertToPlantInfo(result);
        console.log('🔄 Converted to PlantInfo:', plantInfo);

        if (isMounted) {
          // Update the collection item status to completed using the actual imageId
          const imageId = pendingAnalysis.imageId || 'latest';
          updateImageInCollection(imageId, plantInfo, 'completed');
          
          setPlantData(plantInfo);
          
          // Small delay to show completion
          setTimeout(() => {
            setCurrentPage('results');
          }, 1000);
        }
      } catch (error) {
        if (!isMounted) return;

        console.error('❌ Analysis failed:', error);
        clearInterval(progressInterval);
        clearInterval(stepInterval);
        clearTimeout(safetyTimeout);
        
        setProgress(0);
        setProgressMessage('Analysis failed');
        
        let errorMessage = 'Unknown error occurred';
        if (error instanceof Error) {
          errorMessage = error.message;
        } else if (typeof error === 'string') {
          errorMessage = error;
        }
        
        console.error('📝 Error details:', {
          message: errorMessage,
          type: typeof error,
          error: error
        });
        
        // Update the collection item status to error using the actual imageId
        const imageId = pendingAnalysis.imageId || 'latest';
        updateImageInCollection(imageId, null, 'error');
        
        alert(`Analysis failed: ${errorMessage}`);
        setCurrentPage('upload');
      }
    };

    performAnalysis();

    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, [pendingAnalysis, setCurrentPage, setPlantData, updateImageInCollection]);

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