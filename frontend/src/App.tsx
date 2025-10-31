import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useSwipeable } from 'react-swipeable';
import { PlantInfo } from './types/api';
import './styles/index.css';
import HomePage from './pages/HomePage';
import UploadPage from './pages/UploadPage';
import CollectionPage from './pages/CollectionPage';
import AboutPage from './pages/AboutPage';
import LearnPage from './pages/LearnPage';
import LoadingPage from './pages/LoadingPage';
import ResultsPage from './pages/ResultsPage';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import AuthButton from './components/AuthButton';
import { collectionService, CollectionItem, PlantInfo as BackendPlantInfo } from './services/collectionService';
import { imageService } from './services/imageService';

type PageType = 'home' | 'upload' | 'collection' | 'about' | 'learn' | 'loading' | 'results';
type DirectionType = 'forward' | 'backward';

interface CollectedImage {
  id: string;
  file?: File; // Made optional since backend doesn't store File objects
  preview?: string; // Made optional since blob URLs can't be persisted
  status: 'analyzing' | 'completed' | 'error';
  species?: string;
  confidence?: number;
  description?: string;
  filename: string;
  timestamp: Date;
  region: string;
  plantData?: PlantInfo;
}

function AppContent() {
  const [currentPage, setCurrentPage] = useState<PageType>('home');
  const [transitionDirection, setTransitionDirection] = useState<DirectionType>('forward');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [plantData, setPlantData] = useState<PlantInfo | null>(null);
  const [pendingAnalysis, setPendingAnalysis] = useState<{ file: File; region: string; imageId?: string } | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<string>('');
  const [imageCollection, setImageCollection] = useState<CollectedImage[]>([]);
  const pageRef = useRef<HTMLDivElement>(null);
  const { isAuthenticated } = useAuth();

  // Load collection from backend if authenticated, otherwise from localStorage
  const loadCollection = useCallback(async () => {
    if (isAuthenticated) {
      try {
        const backendCollection = await collectionService.getUserCollection();
        
        // For authenticated users, try to load images from backend
        const collectionWithImages = await Promise.all(
          backendCollection.map(async (item) => {
            try {
              // Try to get the image blob from backend
              const imageBlob = await imageService.getImage(item.id);
              const preview = imageBlob ? URL.createObjectURL(imageBlob) : undefined;
              return {
                ...item,
                preview
              };
            } catch (error) {
              console.warn(`Could not load image for item ${item.id}:`, error);
              // Return item without preview if image loading fails
              return {
                ...item,
                preview: undefined
              };
            }
          })
        );
        
        setImageCollection(collectionWithImages);
      } catch (error) {
        console.error('Error loading collection from backend:', error);
        // Fall back to localStorage if backend fails
        loadFromLocalStorage();
      }
    } else {
      loadFromLocalStorage();
    }
  }, [isAuthenticated]);

  // Load region and collection on component mount
  useEffect(() => {
    const savedRegion = localStorage.getItem('selectedRegion');
    if (savedRegion) {
      setSelectedRegion(savedRegion);
    }

    loadCollection();
  }, [isAuthenticated, loadCollection]);

  // Load collection from localStorage
  const loadFromLocalStorage = () => {
    const savedCollection = localStorage.getItem('imageCollection');
    if (savedCollection) {
      try {
        const parsedCollection = JSON.parse(savedCollection);
        // Convert timestamp strings back to Date objects
        const restoredCollection = parsedCollection.map((img: any) => ({
          ...img,
          timestamp: new Date(img.timestamp),
          // Note: File objects and preview URLs cannot be restored from localStorage
        }));
        setImageCollection(restoredCollection);
      } catch (error) {
        console.error('Error loading collection from localStorage:', error);
      }
    }
  };

  // Save collection to localStorage
  const saveToLocalStorage = (collection: CollectedImage[]) => {
    if (collection.length > 0) {
      // Create a serializable version of the collection (without File objects)
      const serializableCollection = collection.map(img => ({
        ...img,
        file: undefined, // Remove File object as it's not serializable
        preview: img.preview && img.preview.startsWith('blob:') ? undefined : img.preview, // Remove blob URLs
      }));
      localStorage.setItem('imageCollection', JSON.stringify(serializableCollection));
    }
  };

  // Save collection whenever it changes (for localStorage users)
  useEffect(() => {
    if (!isAuthenticated && imageCollection.length > 0) {
      saveToLocalStorage(imageCollection);
    }
  }, [imageCollection, isAuthenticated]);

  // Delete collection item
  const deleteCollectionItem = async (itemId: string) => {
    if (isAuthenticated) {
      try {
        await collectionService.deleteCollectionItem(itemId);
      } catch (error) {
        console.error('Failed to delete item from backend:', error);
      }
    }
    
    // Update local state
    setImageCollection(prev => prev.filter(img => img.id !== itemId));
  };

  // Clear entire collection
  const clearCollection = async () => {
    if (isAuthenticated) {
      try {
        await collectionService.clearUserCollection();
      } catch (error) {
        console.error('Failed to clear collection from backend:', error);
      }
    } else {
      localStorage.removeItem('imageCollection');
    }
    
    // Update local state
    setImageCollection([]);
  };

  // Save region to localStorage whenever it changes
  const updateSelectedRegion = (region: string) => {
    setSelectedRegion(region);
    localStorage.setItem('selectedRegion', region);
  };

  // Define the order of pages for swipe navigation
  const pageOrder: PageType[] = ['home', 'upload', 'collection', 'learn', 'about'];
  // Note: loading and results pages are not in swipe navigation as they're part of the upload flow

  // Handle page navigation with direction detection
  const navigateToPage = (newPage: PageType) => {
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

  // Convert PlantInfo from API format to backend format
  const convertPlantInfoToBackend = (apiPlantInfo: PlantInfo): BackendPlantInfo => {
    return {
      specieIdentified: apiPlantInfo.scientificName || apiPlantInfo.commonName,
      nativeRegion: apiPlantInfo.region,
      invasiveOrNot: apiPlantInfo.isInvasive,
      invasiveEffects: apiPlantInfo.impact,
      nativeAlternatives: apiPlantInfo.nativeAlternatives.map(alt => ({
        commonName: alt.commonName,
        scientificName: alt.scientificName,
        characteristics: alt.description
      })),
      removeInstructions: apiPlantInfo.controlMethods.join('; ')
    };
  };

  // Start analysis with file and region
  const startAnalysis = (file: File, region: string) => {
    // Add image to collection with analyzing status
    const newImage: CollectedImage = {
      id: Date.now().toString(),
      file,
      preview: URL.createObjectURL(file),
      status: 'analyzing',
      filename: file.name,
      timestamp: new Date(),
      region: region || selectedRegion
    };

    const updatedCollection = [...imageCollection, newImage];
    setImageCollection(updatedCollection);

    // For authenticated users, upload the image to backend
    if (isAuthenticated) {
      imageService.uploadImage(newImage.id, file).then(success => {
        if (success) {
          console.log(`✅ Image ${newImage.id} uploaded successfully to backend`);
        } else {
          console.error(`❌ Failed to upload image ${newImage.id} to backend`);
        }
      }).catch(error => {
        console.error('Failed to upload image to backend:', error);
      });
    } else {
      // Save to localStorage for non-authenticated users
      saveToLocalStorage(updatedCollection);
    }
    
    setPendingAnalysis({ file, region: region || selectedRegion, imageId: newImage.id });
    navigateToPage('loading');
  };

  // Update image in collection after analysis
  const updateImageInCollection = async (imageId: string, plantData: PlantInfo | null, status: 'completed' | 'error') => {
    const updatedCollection = imageCollection.map(img => {
      if (img.id === imageId || imageId === 'latest') {
        // If imageId is 'latest', find the most recent analyzing item
        if (imageId === 'latest') {
          const analyzingItems = imageCollection.filter(item => item.status === 'analyzing');
          if (analyzingItems.length === 0 || img.id !== analyzingItems[0].id) {
            return img; // Skip if this isn't the most recent analyzing item
          }
        }
        
        // Clean up old blob URL to prevent memory leaks
        if (img.preview && img.preview.startsWith('blob:')) {
          URL.revokeObjectURL(img.preview);
        }
        const updatedImg: CollectedImage = {
          ...img,
          status,
          plantData: plantData || undefined,
          species: plantData?.commonName || plantData?.scientificName || undefined,
          confidence: 85, // Default confidence since PlantInfo doesn't have this field
          description: plantData?.description || undefined
        };
        
        // Save updated item to backend if authenticated
        if (isAuthenticated && status === 'completed') {
          const collectionItem: CollectionItem = {
            id: updatedImg.id,
            filename: updatedImg.filename,
            timestamp: updatedImg.timestamp,
            region: updatedImg.region,
            status: updatedImg.status,
            species: updatedImg.species,
            confidence: updatedImg.confidence,
            description: updatedImg.description,
            plant_data: updatedImg.plantData ? convertPlantInfoToBackend(updatedImg.plantData) : undefined
          };
          collectionService.saveCollectionItem(collectionItem).catch(error => {
            console.error('Failed to update item in backend:', error);
          });
        }
        
        return updatedImg;
      }
      return img;
    });
    
    setImageCollection(updatedCollection);
  };

  // Handle swipe navigation (only for main pages)
  const handleSwipe = (direction: 'left' | 'right') => {
    // Don't allow swipe navigation on loading and results pages
    if (currentPage === 'loading' || currentPage === 'results') return;

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
              return <HomePage
                setCurrentPage={navigateToPage}
              />;
            case 'upload':
              return <UploadPage
                setCurrentPage={navigateToPage}
                startAnalysis={startAnalysis}
                selectedRegion={selectedRegion}
                setSelectedRegion={updateSelectedRegion}
              />;
            case 'collection':
              return <CollectionPage 
                setCurrentPage={navigateToPage} 
                imageCollection={imageCollection}
                deleteCollectionItem={deleteCollectionItem}
                clearCollection={clearCollection}
              />;
            case 'about':
              return <AboutPage setCurrentPage={navigateToPage} />;
            case 'learn':
              return <LearnPage setCurrentPage={navigateToPage} />;
            case 'loading':
              return <LoadingPage
                setCurrentPage={navigateToPage}
                setPlantData={setPlantData}
                pendingAnalysis={pendingAnalysis}
                updateImageInCollection={updateImageInCollection}
              />;
            case 'results':
              return <ResultsPage setCurrentPage={navigateToPage} plantData={plantData} />;
            default:
              return <HomePage
                setCurrentPage={navigateToPage}
              />;
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
          InvasiScan
        </button>
        <AuthButton variant="compact" />
      </nav>

      {/* Main Content */}
      <div className="main-content" {...swipeHandlers}>
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
              <path d="M9 3L7.17 5H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2h-3.17L15 3H9zm3 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5 5z"/>
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
              <path d="M22 16V4c0-1.1-.9-2-2-2H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2zm-11.5-9L8 10.5l1.5 1.5L13 8.5 16.5 12H8.5l2-2.5zM2 6v14c0 1.1.9 2 2 2h14v-2H4V6H2z"/>
            </svg>
          </div>
          <span className="tab-label">Collection</span>
        </button>
          <button
          className={`tab-item ${currentPage === 'learn' ? 'active' : ''}`}
          onClick={() => navigateToPage('learn')}
        >
          <div className="tab-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
              <path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9zM17 15.99l-5 2.73-5-2.73v-3.72L12 15l5-2.73v3.72z"/>
            </svg>
          </div>
          <span className="tab-label">Learn</span>
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

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
