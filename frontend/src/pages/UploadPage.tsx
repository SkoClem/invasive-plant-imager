import React, { useState, useEffect } from 'react';

interface UploadPageProps {
  setCurrentPage: (page: 'home' | 'upload' | 'collection' | 'about' | 'loading' | 'results') => void;
  startAnalysis: (file: File, region: string) => void;
  selectedRegion: string;
  setSelectedRegion: (region: string) => void;
}

function UploadPage({ setCurrentPage, startAnalysis, selectedRegion, setSelectedRegion }: UploadPageProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Set region to Texas on component mount
  useEffect(() => {
    setSelectedRegion('United States, Texas');
  }, [setSelectedRegion]);

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

      // Create preview URL (stored in browser memory)
      const reader = new FileReader();
      reader.onload = (e) => {
        const previewUrl = e.target?.result as string;
        setImagePreview(previewUrl);
        console.log('🖼️ Image preview created - stored in browser memory as base64 data URL');
        console.log('📊 Preview size:', Math.round(previewUrl.length / 1024), 'KB');
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
    startAnalysis(selectedFile, selectedRegion);
  };

  const handleUploadClick = () => {
    // This would trigger the file input in a real implementation
    const fileInput = document.querySelector('.file-input') as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  };

  return (
    <section className="upload-section">
      <div className="container">
        <div className="upload-page-header">
          <div className="header-left">
            <h1>Scan Plant with Camera</h1>
            <p className="subtitle">Take a photo of a plant to identify if it's invasive.</p>
          </div>
        </div>

        {/* Region Display */}
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

        <div className="upload-section-content">
          <div className="upload-container">
            {imagePreview ? (
              <div className="image-preview-container">
                <img
                  src={imagePreview}
                  alt="Selected plant"
                  className="image-preview"
                />
                <button
                  className="change-image-button"
                  onClick={handleUploadClick}
                >
                  Change Image
                </button>
                <input
                  type="file"
                  className="file-input"
                  accept="image/*"
                  capture="environment"
                  onChange={handleFileSelect}
                />
              </div>
            ) : (
              <div
                className="upload-box"
                onClick={handleUploadClick}
                role="button"
                aria-label="Take a photo with camera"
              >
                <div className="upload-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="48" height="48" fill="currentColor">
                    <path d="M9 3L7.17 5H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2h-3.17L15 3H9zm3 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z"/>
                    <circle cx="12" cy="13" r="3"/>
                  </svg>
                </div>
                <p>Tap here to take a photo</p>
                <input
                  type="file"
                  className="file-input"
                  accept="image/*"
                  capture="environment"
                  onChange={handleFileSelect}
                />
              </div>
            )}
          </div>
        </div>

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

// Add some basic styling for image preview
const styles = `
  .image-preview-container {
    position: relative;
    width: 100%;
    max-width: 400px;
    margin: 0 auto;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  .image-preview {
    width: 100%;
    height: 300px;
    object-fit: cover;
    display: block;
  }

  .change-image-button {
    position: absolute;
    top: 10px;
    right: 10px;
    background: rgba(0, 0, 0, 0.7);
    color: white;
    border: none;
    padding: 8px 12px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 14px;
    transition: background 0.3s ease;
  }

  .change-image-button:hover {
    background: rgba(0, 0, 0, 0.9);
  }

  .upload-container {
    margin-bottom: 20px;
  }

  .file-info {
    font-size: 14px;
    color: #666;
    display: inline-block;
  }

  /* Mobile-friendly styles for upload guidelines */
  .upload-guidelines {
    background-color: var(--container-bg);
    border-radius: var(--radius-card);
    padding: 1.5rem;
    margin-top: 1rem;
    border: 1px solid var(--border-subtle);
  }

  .upload-guidelines h3 {
    color: var(--accent-bright);
    margin-bottom: 1rem;
    font-size: 1.1rem;
  }

  /* Region Display Styles */
  .region-display-container {
    margin-bottom: 2rem;
  }

  .region-display {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem 1.5rem;
    background: var(--container-bg);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-card);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  }

  .region-icon-wrapper {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .country-flag {
    font-size: 1.5rem;
    flex-shrink: 0;
  }

  .region-icon {
    color: var(--accent-bright);
    flex-shrink: 0;
  }

  .region-text-wrapper {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .region-text {
    font-size: 1rem;
    font-weight: 600;
    color: var(--text-primary);
  }

  .region-subtitle {
    font-size: 0.85rem;
    color: var(--secondary-text);
  }

  .upload-guidelines ul {
    list-style-position: inside;
    color: var(--secondary-text);
    padding-left: 0;
    margin: 0;
  }

  .upload-guidelines li {
    margin-bottom: 0.75rem;
    line-height: 1.5;
    font-size: 0.95rem;
  }

  /* Make page more scrollable on mobile */
  @media (max-width: 480px) {
    .upload-section {
      padding-top: 60px;
      min-height: auto;
      padding-bottom: 120px;
    }

    .container {
      padding: 0 1rem;
      max-width: 100%;
    }

    .upload-guidelines {
      margin-top: 1.5rem;
      padding: 1.25rem;
    }

    .upload-guidelines h3 {
      font-size: 1rem;
    }

    .upload-guidelines li {
      font-size: 0.9rem;
      margin-bottom: 0.6rem;
    }

    .upload-button {
      margin-top: 1.5rem;
      min-width: auto;
      width: 100%;
      padding: 1rem;
    }

    /* Ensure content doesn't get hidden behind tab navigation */
    .upload-section {
      margin-bottom: 2rem;
    }
  }

  /* Touch-friendly improvements */
  @media (hover: none) and (pointer: coarse) {
    .upload-box {
      min-height: 200px;
      padding: 2rem 1rem;
    }

    .upload-icon {
      font-size: 3.5rem;
    }

    .region-selector-button {
      padding: 1.2rem 1.5rem;
      min-height: 56px;
    }

    .region-display {
      padding: 1rem;
      gap: 0.75rem;
    }

    .region-text {
      font-size: 0.95rem;
    }

    .region-subtitle {
      font-size: 0.8rem;
    }
  }
`;

// Add styles to head if not already added
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = styles;
  if (!document.head.querySelector('style[data-upload-page-styles]')) {
    styleElement.setAttribute('data-upload-page-styles', 'true');
    document.head.appendChild(styleElement);
  }
}

export default UploadPage;