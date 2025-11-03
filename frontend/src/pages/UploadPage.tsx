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
    let newMode: InputMode;
    if (direction === 'left') {
      newMode = inputMode === 'camera' ? 'upload' : 'camera';
    } else {
      newMode = inputMode === 'camera' ? 'upload' : 'camera';
    }
    if (newMode === inputMode) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setInputMode(newMode);
      setIsTransitioning(false);
    }, 150);
  };

  const triggerFileInput = () => {
    const fileInput = document.querySelector('.file-input') as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
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
            // First pass: cap longest side to 640px, quality 0.7
            const maxDim1 = 640;
            const width1 = img.width;
            const height1 = img.height;
            const scale1 = Math.min(1, maxDim1 / Math.max(width1, height1));
            const targetW1 = Math.round(width1 * scale1);
            const targetH1 = Math.round(height1 * scale1);
            const canvas1 = document.createElement('canvas');
            canvas1.width = targetW1;
            canvas1.height = targetH1;
            const ctx1 = canvas1.getContext('2d');
            if (!ctx1) {
              console.warn('⚠️ Canvas context unavailable; using original data URL for preview');
              setImagePreview(originalDataUrl);
              return;
            }
            ctx1.drawImage(img, 0, 0, targetW1, targetH1);
            let compressedDataUrl = canvas1.toDataURL('image/jpeg', 0.7);

            // If still too large (>250KB), second pass: 320px, quality 0.6
            const compressedKB1 = Math.round(compressedDataUrl.length / 1024);
            if (compressedKB1 > 250) {
              const maxDim2 = 320;
              const scale2 = Math.min(1, maxDim2 / Math.max(width1, height1));
              const targetW2 = Math.round(width1 * scale2);
              const targetH2 = Math.round(height1 * scale2);
              const canvas2 = document.createElement('canvas');
              canvas2.width = targetW2;
              canvas2.height = targetH2;
              const ctx2 = canvas2.getContext('2d');
              if (ctx2) {
                ctx2.drawImage(img, 0, 0, targetW2, targetH2);
                compressedDataUrl = canvas2.toDataURL('image/jpeg', 0.6);
              }
            }

            const originalKB = Math.round(originalDataUrl.length / 1024);
            const finalKB = Math.round(compressedDataUrl.length / 1024);
            setImagePreview(compressedDataUrl);
            console.log('🖼️ Image preview compressed for persistence');
            console.log('📊 Preview size (original -> final):', `${originalKB} KB -> ${finalKB} KB`);
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


  return (
    <section className="upload-section">
      <div className="container">
        <div className="upload-page-header">
          <div className="header-left">
            <h1 className={`page-title ${isTransitioning ? 'transitioning' : ''}`}>
              {inputMode === 'camera' ? 'Scan Plant with Camera' : 'Upload Plant Image'}
            </h1>
            <p className={`subtitle ${isTransitioning ? 'transitioning' : ''}`}>
              {inputMode === 'camera' ? "Take a photo of a plant to identify if it's invasive." : "Choose an image from your device to identify if it's invasive."}
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
            aria-label={inputMode === 'camera' ? 'Tap here to take a photo' : 'Tap here to choose image'}
          >
            <div className="mode-icon">
              {inputMode === 'camera' ? (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="48" height="48" fill="currentColor">
                  <path d="M9 3L7.17 5H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2h-3.17L15 3H9zm3 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5 5z"/>
                  <circle cx="12" cy="13" r="3"/>
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="48" height="48" fill="currentColor">
                  <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
                  <path d="M12,12L16,16H13V19H11V16H8L12,12Z"/>
                </svg>
              )}
            </div>
            <span className="mode-text">
              {inputMode === 'camera' ? 'Tap here to take a photo' : 'Tap here to choose image'}
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
          capture={inputMode === 'camera' ? 'environment' : undefined}
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
          onClick={() => {
            if (!selectedFile || !selectedRegion || isAnalyzing) return;
            setIsAnalyzing(true);
            setError(null);
            startAnalysis(selectedFile, selectedRegion, imagePreview);
          }}
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

// Add some basic styling for image preview and mode toggle (restored)
const styles = `
  .page-title, .subtitle { transition: opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1), transform 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
  .page-title.transitioning, .subtitle.transitioning { opacity: 0; transform: translateY(-10px); }
  .input-mode-toggle { display: flex; align-items: center; justify-content: center; gap: 1rem; margin-bottom: 2rem; padding: 1rem; }
  .mode-arrow { border-radius: 0; width: 48px; height: 48px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); position: relative; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); border: none; }
  .mode-arrow.left-arrow { clip-path: polygon(100% 0, 0 50%, 100% 100%); background: linear-gradient(135deg, #fff3e0, #ffcc80); color: #bf360c; position: relative; }
  .mode-arrow.left-arrow::before { content: ''; position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: linear-gradient(135deg, #fff3e0, #ffcc80); clip-path: polygon(100% 0, 0 50%, 100% 100%); z-index: -1; }
  .mode-arrow.left-arrow::after { content: ''; position: absolute; top: -5px; left: -5px; right: -5px; bottom: -5px; background: #e65100; clip-path: polygon(100% 0, 0 50%, 100% 100%); z-index: -2; }
  .mode-arrow.right-arrow { clip-path: polygon(0 0, 100% 50%, 0 100%); background: linear-gradient(135deg, #fff3e0, #ffcc80); color: #bf360c; position: relative; }
  .mode-arrow.right-arrow::before { content: ''; position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: linear-gradient(135deg, #fff3e0, #ffcc80); clip-path: polygon(0 0, 100% 50%, 0 100%); z-index: -1; }
  .mode-arrow.right-arrow::after { content: ''; position: absolute; top: -5px; left: -5px; right: -5px; bottom: -5px; background: #e65100; clip-path: polygon(0 0, 100% 50%, 0 100%); z-index: -2; }
  .mode-arrow:hover { transform: scale(1.1); box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2); }
  .mode-arrow.left-arrow:hover, .mode-arrow.right-arrow:hover { background: linear-gradient(135deg, #ff9800, #f57c00); color: white; box-shadow: 0 4px 12px rgba(255, 152, 0, 0.4); }
  .mode-arrow.left-arrow:hover::before { background: linear-gradient(135deg, #ff9800, #f57c00); }
  .mode-arrow.right-arrow:hover::before { background: linear-gradient(135deg, #ff9800, #f57c00); }
  .mode-arrow.left-arrow:hover::after, .mode-arrow.right-arrow:hover::after { background: #d84315; }
  .mode-arrow:active { transform: scale(0.95); }
  .mode-arrow:hover, .mode-arrow.active { background: var(--accent-bright); color: white; transform: scale(1.1); box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3); }
  .mode-display { background: var(--container-bg); border: 2px solid var(--accent-bright); border-radius: 12px; padding: 1.5rem 2rem; display: flex; align-items: center; gap: 1rem; width: 220px; min-width: 220px; max-width: 220px; justify-content: center; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1); flex-direction: column; }
  .mode-display.clickable { cursor: pointer; }
  .mode-display.clickable:hover { background: var(--accent-bright); color: white; transform: translateY(-2px); box-shadow: 0 6px 20px rgba(76, 175, 80, 0.3); }
  .mode-display.clickable:hover .mode-icon svg { color: white; }
  .mode-display.clickable:hover .mode-text { color: white; }
  .mode-display.clickable:active { transform: translateY(0); box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1); }
  .mode-icon { font-size: 1.5rem; transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1); display: flex; align-items: center; justify-content: center; }
  .mode-icon svg { transition: color 0.3s cubic-bezier(0.4, 0, 0.2, 1); color: var(--accent-bright); }
  .mode-text { font-weight: 600; color: var(--accent-bright); font-size: 1rem; text-align: center; transition: color 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
  .image-preview-container { position: relative; width: 100%; max-width: 400px; margin: 0 auto; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); }
  .image-preview { width: 100%; height: 300px; object-fit: cover; display: block; }
  .change-image-button { position: absolute; top: 10px; right: 10px; background: rgba(0, 0, 0, 0.7); color: white; border: none; padding: 8px 12px; border-radius: 6px; cursor: pointer; font-size: 14px; transition: background 0.3s ease; }
  .change-image-button:hover { background: rgba(0, 0, 0, 0.9); }
  .upload-container { margin-bottom: 20px; }
  .file-info { font-size: 14px; color: #666; display: inline-block; }
  .upload-guidelines { background-color: var(--container-bg); border-radius: var(--radius-card); padding: 1.5rem; margin-top: 1rem; border: 1px solid var(--border-subtle); }
  .upload-guidelines h3 { color: var(--accent-bright); margin-bottom: 1rem; font-size: 1.1rem; }
  .region-section { margin-top: 2rem; margin-bottom: 1rem; }
  .region-display-container { margin-bottom: 0; }
  .region-display { display: flex; align-items: center; gap: 1rem; padding: 1rem 1.5rem; background: var(--container-bg); border: 1px solid var(--border-subtle); border-radius: var(--radius-card); box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05); }
  .region-icon-wrapper { display: flex; align-items: center; gap: 0.5rem; }
  .country-flag { font-size: 1.5rem; flex-shrink: 0; }
  .region-icon { color: var(--accent-bright); flex-shrink: 0; }
  .region-text-wrapper { flex: 1; display: flex; flex-direction: column; gap: 0.25rem; }
  .region-text { font-size: 1rem; font-weight: 600; color: var(--text-primary); }
  .region-subtitle { font-size: 0.85rem; color: var(--secondary-text); }
  .upload-guidelines ul { list-style-position: inside; color: var(--secondary-text); padding-left: 0; margin: 0; }
  .upload-guidelines li { margin-bottom: 0.75rem; line-height: 1.5; font-size: 0.95rem; }
  @media (max-width: 480px) { .input-mode-toggle { gap: 0.75rem; padding: 0.75rem; } .mode-arrow { width: 40px; height: 40px; } .mode-display { padding: 1rem 1.5rem; min-width: 160px; } .mode-icon { font-size: 1.25rem; } .mode-text { font-size: 0.9rem; } .upload-section { padding-top: 60px; min-height: auto; padding-bottom: 120px; } .container { padding: 0 1rem; max-width: 100%; } .upload-guidelines { margin-top: 1.5rem; padding: 1.25rem; } .upload-guidelines h3 { font-size: 1rem; } .upload-guidelines li { font-size: 0.9rem; margin-bottom: 0.6rem; } .upload-button { margin-top: 1.5rem; min-width: auto; width: 100%; padding: 1rem; } .upload-section { margin-bottom: 2rem; } }
  @media (hover: none) and (pointer: coarse) { .mode-arrow { width: 52px; height: 52px; } .mode-display { padding: 1.5rem 2rem; min-height: 80px; } .region-display { padding: 1rem; gap: 0.75rem; } .region-text { font-size: 0.95rem; } .region-subtitle { font-size: 0.8rem; } }
`;

if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = styles;
  if (!document.head.querySelector('style[data-upload-page-styles]')) {
    styleElement.setAttribute('data-upload-page-styles', 'true');
    document.head.appendChild(styleElement);
  }
}

export default UploadPage;