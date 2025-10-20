import { PlantAnalysisResponse, PlantAnalysisRequest } from '../types/plantAnalysis';

// Determine API base URL with production fallback
const getApiBaseUrl = () => {
  // In production, try to use the backend URL from environment
  if (process.env.NODE_ENV === 'production') {
    // If no backend URL is configured, show a helpful error
    if (!process.env.REACT_APP_API_URL || process.env.REACT_APP_API_URL.includes('localhost')) {
      console.error('❌ Production backend URL not configured. Please set REACT_APP_API_URL environment variable.');
      // Return a placeholder that will cause requests to fail gracefully
      return 'https://backend-not-configured.example.com';
    }
  }
  
  return (process.env.REACT_APP_API_URL || 'http://localhost:8000').replace(/\/$/, '');
};

const API_BASE_URL = getApiBaseUrl();

console.log('API Base URL:', API_BASE_URL);
console.log('Environment:', process.env.NODE_ENV);
console.log('Environment variable loaded:', !!process.env.REACT_APP_API_URL);
console.log('Environment variable value:', process.env.REACT_APP_API_URL);

class PlantAnalysisService {
  async analyzePlant(request: PlantAnalysisRequest): Promise<PlantAnalysisResponse> {
    const formData = new FormData();

    // Append the image file
    formData.append('image', request.image);

    // Append the region
    formData.append('region', request.region);

    console.log('🚀 Sending request to:', `${API_BASE_URL}/api/analyze-plant`);
    console.log('📸 FormData contents:', {
      fileName: request.image.name,
      fileSize: `${(request.image.size / 1024 / 1024).toFixed(2)} MB`,
      fileType: request.image.type,
      region: request.region
    });

    // Log FormData entries to verify data is being sent
    console.log('📋 FormData entries:');
    formData.forEach((value, key) => {
      console.log(`  ${key}: ${value instanceof File ? `File(${value.name}, ${value.size} bytes)` : value}`);
    });

    try {
      console.log('Making request to backend...');

      // Show user-friendly error if backend is not configured
      if (API_BASE_URL.includes('backend-not-configured')) {
        throw new Error('Backend service is not available. Please check your internet connection and try again.');
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 120000); // 2 minute timeout

      // Use regular fetch instead of authenticatedFetch to allow unauthenticated requests
      const response = await fetch(`${API_BASE_URL}/api/analyze-plant`, {
        method: 'POST',
        body: formData,
        signal: controller.signal,
        // Don't set Content-Type header when using FormData - browser sets it automatically with boundary
      });

      clearTimeout(timeoutId);

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Request failed:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      let data;
      try {
        data = await response.json();
        console.log('Success response:', data);

        // Validate the response structure
        if (!data || typeof data !== 'object') {
          throw new Error('Invalid response structure from server');
        }

        return data;
      } catch (jsonError) {
        console.error('Failed to parse JSON response:', jsonError);
        console.log('Raw response text:', await response.clone().text());
        throw new Error('Invalid JSON response from server');
      }
    } catch (error) {
      console.error('❌ Plant analysis request failed:', error);
      
      // Handle different types of errors with user-friendly messages
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error('Request timed out. The analysis is taking longer than expected. Please try again.');
        } else if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
          throw new Error('Unable to connect to the analysis service. Please check your internet connection and try again.');
        } else if (error.message.includes('backend-not-configured')) {
          throw error; // Re-throw the user-friendly message
        } else {
          throw new Error(`Analysis failed: ${error.message}`);
        }
      } else {
        throw new Error('An unexpected error occurred during analysis. Please try again.');
      }
    }
  }
}

export const plantAnalysisService = new PlantAnalysisService();