import React, { useState, useEffect } from 'react';

interface UploadPageProps {
  setCurrentPage: (page: 'home' | 'upload' | 'collection' | 'about' | 'loading' | 'results') => void;
  startAnalysis: (file: File, region: string, previewDataUrl?: string | null) => void;
  selectedRegion: string;
  setSelectedRegion: (region: string) => void;
}

type InputMode = 'camera' | 'upload';

function UploadPage({ setCurrentPage, startAnalysis, selectedRegion, setSelectedRegion }: UploadPageProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [inputMode, setInputMode] = useState<InputMode>('camera');
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);

  // Set region to Texas on component mount
  useEffect(() => {
    setSelectedRegion('United States, Texas');
  }, [setSelectedRegion]);

  const switchInputMode = (direction: 'left' | 'right') => {
    setIsTransitioning(true);
    setTimeout(() => {
      setInputMode(prev => (direction === 'left' ? (prev === 'camera' ? 'upload' : 'camera') : (prev === 'upload' ? 'camera' : 'upload')));
      setIsTransitioning(false);
    }, 200);
  };

  const triggerFileInput = () => {
    const input = document.querySelector<HTMLInputElement>('.file-input');
    input?.click();
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setError(null);

      console.log('📁 File selected:', {
        name: file.name,
        size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
        type: file.type,
        lastModified: new Date(file.lastModified).toISOString()
      });

      // Create preview data URL and compress for localStorage persistence
      const reader = new FileReader();
      reader.onload = (e) => {
        const originalDataUrl = e.target?.result as string;
        // Attempt to compress to a reasonable thumbnail
        const img = new Image();
        img.onload = () => {
          try {
            const maxDim = 1200; // cap longest side for preview
            const width = img.width;
            const height = img.height;
            const scale = Math.min(1, maxDim / Math.max(width, height));
            const targetW = Math.round(width * scale);
            const targetH = Math.round(height * scale);
            const canvas = document.createElement('canvas');
            canvas.width = targetW;
            canvas.height = targetH;
            const ctx = canvas.getContext('2d');
            if (!ctx) {
              console.warn('⚠️ Canvas context unavailable; using original data URL for preview');
              setImagePreview(originalDataUrl);
              return;
            }
            ctx.drawImage(img, 0, 0, targetW, targetH);
            // Prefer JPEG to reduce size; fallback to PNG if needed
            const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.8);
            const originalKB = Math.round(originalDataUrl.length / 1024);
            const compressedKB = Math.round(compressedDataUrl.length / 1024);
            setImagePreview(compressedDataUrl);
            console.log('🖼️ Image preview created and compressed for persistence');
            console.log('📊 Preview size (original vs compressed):', `${originalKB} KB -> ${compressedKB} KB`);
          } catch (err) {
            console.warn('⚠️ Preview compression failed, using original data URL:', err);
            setImagePreview(originalDataUrl);
          }
        };
        img.onerror = () => {
          console.warn('⚠️ Failed to load image for compression; using original data URL');
          setImagePreview(originalDataUrl);
        };
        img.src = originalDataUrl;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyzeClick = () => {
    console.log('🔍 Analyze button clicked - validating inputs...');
    console.log('📁 Selected file:', selectedFile ? `${selectedFile.name} (${selectedFile.type})` : 'None');
    console.log('🌍 Selected region:', selectedRegion || 'None');

    if (!selectedFile) {
      const errorMsg = 'Please select an image first';
      console.error('❌ Validation failed:', errorMsg);
      setError(errorMsg);
      alert(errorMsg);
      return;
    }

    if (!selectedRegion) {
      const errorMsg = 'Please select a region first';
      console.error('❌ Validation failed:', errorMsg);
      setError(errorMsg);
      alert(errorMsg);
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    console.log('🚀 Starting analysis process:');
    console.log('📦 Original file object:', {
      name: selectedFile.name,
      size: `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB`,
      type: selectedFile.type,
      storedIn: 'Browser File object reference'
    });
    console.log('📤 File will be sent directly to backend - no temporary server storage');

    // Start the analysis process - will navigate to loading page
    // Pass imagePreview (compressed base64 data URL) so local collections can persist preview
    startAnalysis(selectedFile, selectedRegion, imagePreview);
  };

  const getModeConfig = () => {
    if (inputMode === 'camera') {
      return {
        title: 'Scan Plant with Camera',
        subtitle: 'Take a photo of a plant to identify if it\'s invasive.',
        buttonText: 'Tap here to take a photo',
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="48" height="48" fill="currentColor">
            <path d="M9 3L7.17 5H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2h-3.17L15 3H9zm3 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5 5z"/>
            <circle cx="12" cy="13" r="3"/>
          </svg>
        ),
        capture: "environment" as const
      };
    } else {
      return {
        title: 'Upload Plant Image',
        subtitle: 'Choose an image from your device to identify if it\'s invasive.',
        buttonText: 'Tap here to choose image',
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="48" height="48" fill="currentColor">
            <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
            <path d="M12,12L16,16H13V19H11V16H8L12,12Z"/>
          </svg>
        ),
        capture: undefined
      };
    }
  };

  const config = getModeConfig();

  return (
    <section className="upload-section">
      <div className="container">
        <div className="upload-page-header">
          <div className="header-left">
            <h1 className={`page-title ${isTransitioning ? 'transitioning' : ''}`}>
              {config.title}
            </h1>
            <p className={`subtitle ${isTransitioning ? 'transitioning' : ''}`}>
              {config.subtitle}
            </p>
          </div>
        </div>

        {/* Input Mode Toggle */}
        <div className="input-mode-toggle">
          <button 
            className={`mode-arrow left-arrow ${inputMode === 'upload' ? 'active' : ''}`}
            onClick={() => switchInputMode('left')}
            aria-label="Switch input mode"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
              <path d="M15.41,7.41L14,6L8,12L14,18L15.41,16.59L10.83,12L15.41,7.41Z"/>
            </svg>
          </button>
          
          <div 
            className="mode-display clickable"
            onClick={triggerFileInput}
            role="button"
            aria-label={config.buttonText}
          >
            <div className="mode-icon">
              {config.icon}
            </div>
            <span className="mode-text">
              {config.buttonText}
            </span>
          </div>
          
          <button 
            className={`mode-arrow right-arrow ${inputMode === 'camera' ? 'active' : ''}`}
            onClick={() => switchInputMode('right')}
            aria-label="Switch input mode"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
              <path d="M8.59,16.59L10,18L16,12L10,6L8.59,7.41L13.17,12L8.59,16.59Z"/>
            </svg>
          </button>
        </div>

        {/* Hidden file input */}
        <input
          type="file"
          className="file-input"
          accept="image/*"
          capture={config.capture}
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />

        {/* Image Preview Section */}
        {imagePreview && (
          <div className="upload-section-content">
            <div className="upload-container">
              <div className="image-preview-container">
                <img
                  src={imagePreview}
                  alt="Selected plant"
                  className="image-preview"
                />
                <button
                  className="change-image-button"
                  onClick={triggerFileInput}
                >
                  Change Image
                </button>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <button
          className={`button upload-button ${!selectedFile || !selectedRegion || isAnalyzing ? 'disabled' : ''}`}
          onClick={handleAnalyzeClick}
          disabled={!selectedFile || !selectedRegion || isAnalyzing}
        >
          {isAnalyzing ? 'Analyzing...' : 'ANALYZE PLANT'}
        </button>

        {/* Region Display - moved below analyze button */}
        <div className="region-section">
          <div className="region-header">
            <h2>Region</h2>
            <p className="region-hint">Plant identification focused on Texas invasive species</p>
          </div>
          <div className="region-display-container">
            <div className="region-display">
              <div className="region-icon-wrapper">
                <span className="country-flag">🇺🇸</span>
                <svg
                  className="region-icon"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  width="20"
                  height="20"
                  fill="currentColor"
                >
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                </svg>
              </div>
              <div className="region-text-wrapper">
                <span className="region-text">United States, Texas</span>
                <span className="region-subtitle">Fixed region for invasive species detection</span>
              </div>
            </div>
          </div>
        </div>

        <div className="upload-guidelines">
          <h3>For best results:</h3>
          <ul>
            <li>Ensure good lighting when taking photos</li>
            <li>Focus on the plant's distinctive features</li>
            <li>Include leaves, flowers, or fruits if possible</li>
          </ul>
        </div>
      </div>
    </section>
  );
}

export default UploadPage;