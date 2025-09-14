import React, { useState } from 'react';
import RegionSelector from '../components/RegionSelector';

interface UploadPageProps {
  setCurrentPage: (page: 'home' | 'upload' | 'collection' | 'about' | 'loading' | 'results') => void;
}

function UploadPage({ setCurrentPage }: UploadPageProps) {
  const [selectedRegion, setSelectedRegion] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleAnalyzeClick = () => {
    if (selectedFile && selectedRegion) {
      setCurrentPage('loading');
      // TODO: Add actual API call here
    }
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
        <h1>Scan Plant with Camera</h1>
        <p className="subtitle">Take a photo of a plant to identify if it's invasive.</p>

        {/* Region Selector */}
        <div className="region-selector-container">
          <RegionSelector
            selectedRegion={selectedRegion}
            onRegionChange={setSelectedRegion}
          />
        </div>

        <div className="upload-container">
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

          <div className="upload-guidelines">
            <h3>For best results:</h3>
            <ul>
              <li>Ensure good lighting when taking photos</li>
              <li>Hold the camera steady to avoid blur</li>
              <li>Focus on the plant's distinctive features</li>
              <li>Include leaves, flowers, or fruits if possible</li>
              <li>Take multiple photos from different angles if needed</li>
            </ul>
          </div>
        </div>

        <button
  className={`button upload-button ${!selectedFile || !selectedRegion ? 'disabled' : ''}`}
  onClick={handleAnalyzeClick}
  disabled={!selectedFile || !selectedRegion}
>
  {!selectedFile && !selectedRegion ? 'Select Region & Photo' :
   !selectedFile ? 'Select a Photo' :
   !selectedRegion ? 'Select a Region' :
   'Analyze Photo'}
</button>
      </div>
    </section>
  );
}

export default UploadPage;