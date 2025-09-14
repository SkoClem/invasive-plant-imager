import React, { useState, useRef } from 'react';
import { useSwipeable } from 'react-swipeable';
import './App.css';

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [transitionDirection, setTransitionDirection] = useState('forward');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [imageCollection, setImageCollection] = useState([]);
  const pageRef = useRef(null);
  
  // Function to add image to collection
  const addImageToCollection = (imageData) => {
    const newImage = {
      id: Date.now() + Math.random(), // Simple unique ID
      ...imageData,
      timestamp: new Date().toISOString()
    };
    setImageCollection(prev => [newImage, ...prev]);
  };
  
  // Function to send image to backend
  const sendImageToBackend = async (imageFile, imageData) => {
    try {
      const formData = new FormData();
      formData.append('image', imageFile);
      formData.append('metadata', JSON.stringify(imageData));
      
      // Replace with actual backend URL when implemented
      const response = await fetch('https://api.example.com/upload-image', {
        method: 'POST',
        body: formData
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('Image uploaded successfully:', result);
        return result;
      } else {
        console.error('Failed to upload image:', response.statusText);
        return null;
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      return null;
    }
  };
  
  // Define the order of pages for swipe navigation
  const pageOrder = ['home', 'upload', 'collection', 'about'];
  
  // Handle page navigation with direction detection
  const navigateToPage = (newPage) => {
    if (newPage === currentPage || isTransitioning) return;
    
    const currentIndex = pageOrder.indexOf(currentPage);
    const newIndex = pageOrder.indexOf(newPage);
    
    if (newIndex > currentIndex) {
      setTransitionDirection('forward');
    } else {
      setTransitionDirection('backward');
    }
    
    setIsTransitioning(true);
    
    // Start transition
    setTimeout(() => {
      setCurrentPage(newPage);
      setTimeout(() => {
        setIsTransitioning(false);
      }, 300);
    }, 10);
  };
  
  // Handle swipe navigation
  const handleSwipe = (direction) => {
    const currentIndex = pageOrder.indexOf(currentPage);
    if (direction === 'left' && currentIndex < pageOrder.length - 1) {
      setTransitionDirection('forward');
      setCurrentPage(pageOrder[currentIndex + 1]);
    } else if (direction === 'right' && currentIndex > 0) {
      setTransitionDirection('backward');
      setCurrentPage(pageOrder[currentIndex - 1]);
    }
  };
  
  // Configure swipe handlers
  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => handleSwipe('left'),
    onSwipedRight: () => handleSwipe('right'),
    preventDefaultTouchmoveEvent: true,
    trackMouse: false
  });

  // Page rendering function
  const renderPage = () => {
    const getTransitionClass = () => {
      if (!isTransitioning) return '';
      return transitionDirection === 'forward' ? 'page-forward-active' : 'page-backward-active';
    };

    return (
      <div 
        ref={pageRef}
        className={`page-container ${getTransitionClass()}`}
      >
        {(() => {
          switch (currentPage) {
            case 'home':
              return <HomePage setCurrentPage={navigateToPage} />;
            case 'upload':
              return <UploadPage 
                addImageToCollection={addImageToCollection}
                sendImageToBackend={sendImageToBackend}
                setCurrentPage={navigateToPage}
              />;
            case 'collection':
              return <CollectionPage 
                setCurrentPage={navigateToPage}
                imageCollection={imageCollection}
              />;
            case 'about':
              return <AboutPage />;
            default:
              return <HomePage setCurrentPage={navigateToPage} />;
          }
        })()} 
      </div>
    );
  };

  return (
    <div className="App">
      {/* Navigation Bar */}
      <nav className="navbar">
        <button 
          className="navbar-logo" 
          onClick={() => navigateToPage('home')}
        >
          Invasive Plant Imager
        </button>
      </nav>

      {/* Main Content */}
      <div {...swipeHandlers}>
        {renderPage()}
      </div>

      {/* Tab Navigation */}
      <nav className="tab-navigation">
        <button
          className={`tab-item ${currentPage === 'home' ? 'active' : ''}`}
          onClick={() => navigateToPage('home')}
        >
          <div className="tab-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
              <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
            </svg>
          </div>
          <span className="tab-label">Home</span>
        </button>
        <button
          className={`tab-item ${currentPage === 'upload' ? 'active' : ''}`}
          onClick={() => navigateToPage('upload')}
        >
          <div className="tab-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
              <path d="M9 3L7.17 5H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2h-3.17L15 3H9zm3 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z"/>
              <circle cx="12" cy="13" r="3"/>
            </svg>
          </div>
          <span className="tab-label">Scan</span>
        </button>
        <button
          className={`tab-item ${currentPage === 'collection' ? 'active' : ''}`}
          onClick={() => navigateToPage('collection')}
        >
          <div className="tab-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
              <path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/>
            </svg>
          </div>
          <span className="tab-label">Collection</span>
        </button>
        <button
          className={`tab-item ${currentPage === 'about' ? 'active' : ''}`}
          onClick={() => navigateToPage('about')}
        >
          <div className="tab-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
            </svg>
          </div>
          <span className="tab-label">About</span>
        </button>
      </nav>
    </div>
  );
}

// Home Page Component
function HomePage({ setCurrentPage }) {
  return (
    <>
      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <h1 className="hero-title">Identify Invasive Plants</h1>
          <p className="subtitle hero-subtitle">
            Use AI-powered image recognition to identify and learn about invasive plant species in your area.
          </p>
          <button 
            className="button hero-button" 
            onClick={() => setCurrentPage('upload')}
          >
            Scan with Camera
          </button>
        </div>
      </section>

      {/* Features Section */}
      <section>
        <div className="container">
          <h2>Key Features</h2>
          <div className="features-grid">
            <div className="feature-card">
              <h3 className="feature-title">AI Recognition</h3>
              <p className="feature-description">
                Advanced machine learning algorithms identify invasive plant species with high accuracy from your photos.
              </p>
            </div>
            <div className="feature-card">
              <h3 className="feature-title">Detailed Information</h3>
              <p className="feature-description">
                Get comprehensive details about identified plants, including control methods and ecological impact.
              </p>
            </div>
            <div className="feature-card">
              <h3 className="feature-title">Location Mapping</h3>
              <p className="feature-description">
                Map and track invasive species in your region to contribute to conservation efforts.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

// Upload Page Component
function UploadPage({ addImageToCollection, sendImageToBackend, setCurrentPage }) {
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  
  const handleUploadClick = () => {
    // This would trigger the file input in a real implementation
    document.querySelector('.file-input').click();
  };
  
  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedImage(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
      
      setUploadStatus('');
    } else {
      setUploadStatus('Please select a valid image file.');
    }
  };
  
  const handleAnalyzePhoto = async () => {
    if (!selectedImage) {
      setUploadStatus('Please select an image first.');
      return;
    }
    
    setIsUploading(true);
    setUploadStatus('Analyzing photo...');
    
    try {
      // Create image data object
      const imageData = {
        name: selectedImage.name,
        size: selectedImage.size,
        type: selectedImage.type,
        preview: imagePreview,
        status: 'analyzed',
        analysis: {
          // Mock analysis data - replace with actual analysis when backend is implemented
          isInvasive: Math.random() > 0.5,
          confidence: Math.floor(Math.random() * 40) + 60, // 60-100%
          species: 'Unknown Species',
          description: 'Analysis pending backend implementation'
        }
      };
      
      // Send to backend (will fail gracefully with current mock URL)
      const backendResult = await sendImageToBackend(selectedImage, imageData);
      
      // Add to collection regardless of backend success
      addImageToCollection(imageData);
      
      setUploadStatus('Photo analyzed and added to collection!');
      
      // Clear the form after successful upload
      setTimeout(() => {
        setSelectedImage(null);
        setImagePreview(null);
        setUploadStatus('');
        // Navigate to collection page to show the new image
        setCurrentPage('collection');
      }, 2000);
      
    } catch (error) {
      console.error('Error analyzing photo:', error);
      setUploadStatus('Error analyzing photo. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };
  
  const clearSelection = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setUploadStatus('');
    // Reset file input
    const fileInput = document.querySelector('.file-input');
    if (fileInput) fileInput.value = '';
  };

  return (
    <section className="upload-section">
      <div className="container">
        <h1>Scan Plant with Camera</h1>
        <p className="subtitle">Take a photo of a plant to identify if it's invasive.</p>
        
        <div className="upload-container">
          {!imagePreview ? (
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
                capture="camera" 
                onChange={handleFileSelect}
              />
            </div>
          ) : (
            <div className="image-preview-container">
              <div className="image-preview">
                <img src={imagePreview} alt="Selected plant" className="preview-image" />
                <button 
                  className="clear-image-btn" 
                  onClick={clearSelection}
                  aria-label="Clear selected image"
                >
                  ×
                </button>
              </div>
              <div className="image-info">
                <p><strong>File:</strong> {selectedImage?.name}</p>
                <p><strong>Size:</strong> {selectedImage ? (selectedImage.size / 1024 / 1024).toFixed(2) + ' MB' : ''}</p>
              </div>
            </div>
          )}
          
          {uploadStatus && (
            <div className={`upload-status ${uploadStatus.includes('Error') ? 'error' : 'success'}`}>
              {uploadStatus}
            </div>
          )}
          
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
          className={`button upload-button ${!selectedImage || isUploading ? 'disabled' : ''}`}
          onClick={handleAnalyzePhoto}
          disabled={!selectedImage || isUploading}
        >
          {isUploading ? 'Analyzing...' : 'Analyze Photo'}
        </button>
      </div>
    </section>
  );
}

// About Page Component
function AboutPage() {
  return (
    <section className="about-section">
      <div className="container">
        <h1>About Our Mission</h1>
        <p className="subtitle">
          We're dedicated to helping communities identify and manage invasive plant species through accessible technology.
        </p>
        
        <div className="about-content">
          <div className="about-text">
            <h2>Our Story</h2>
            <p>
              Invasive Plant Imager was created by a team of environmental scientists and software engineers who recognized 
              the need for an accessible tool to help people identify potentially harmful invasive plant species.
            </p>
            <p>
              Our mission is to empower communities with the knowledge they need to protect local ecosystems 
              and biodiversity from the threat of invasive plants.
            </p>
            
            <h2>How It Works</h2>
            <p>
              Our platform uses advanced machine learning algorithms trained on thousands of plant images to accurately 
              identify invasive species. Simply upload a photo, and our system will analyze it to determine if the plant 
              is invasive and provide detailed information about it.
            </p>
          </div>
          
          <div className="about-image">
            <div className="image-placeholder" style={{backgroundColor: 'var(--container-bg)', height: '300px', borderRadius: 'var(--radius-card)'}}></div>
          </div>
        </div>
      </div>
    </section>
  );
}

// Collection Page Component
function CollectionPage({ setCurrentPage, imageCollection }) {
  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <section className="collection-section">
      <div className="container">
        <h1>Your Plant Collection</h1>
        <p className="subtitle">View and manage your identified plants.</p>
        
        {imageCollection.length === 0 ? (
          <div className="collection-empty">
            <div className="empty-icon">🌱</div>
            <h2>No plants in your collection yet</h2>
            <p>Use the Scan feature to identify and add plants to your collection.</p>
            <button 
              className="button collection-button" 
              onClick={() => setCurrentPage('upload')}
            >
              Scan a Plant
            </button>
          </div>
        ) : (
          <div className="collection-grid">
            {imageCollection.map((image) => (
              <div key={image.id} className="collection-item">
                <div className="collection-image">
                  <img src={image.preview} alt={image.name} />
                  <div className={`status-badge ${image.analysis?.isInvasive ? 'invasive' : 'safe'}`}>
                    {image.analysis?.isInvasive ? '⚠️ Invasive' : '✅ Safe'}
                  </div>
                </div>
                <div className="collection-info">
                  <h3>{image.analysis?.species || 'Unknown Species'}</h3>
                  <p className="confidence">Confidence: {image.analysis?.confidence || 0}%</p>
                  <p className="description">{image.analysis?.description || 'No description available'}</p>
                  <div className="collection-meta">
                    <span className="filename">{image.name}</span>
                    <span className="timestamp">{formatDate(image.timestamp)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {imageCollection.length > 0 && (
          <div className="collection-actions">
            <button 
              className="button collection-button" 
              onClick={() => setCurrentPage('upload')}
            >
              Scan Another Plant
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

export default App;
