import { PlantAnalysisResponse, PlantAnalysisRequest } from '../types/plantAnalysis';

const API_BASE_URL = (process.env.REACT_APP_API_URL || 'http://localhost:8000').replace(/\/$/, '');

console.log('API Base URL:', API_BASE_URL);
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
      console.error('Request error:', error);
      
      // Provide more specific error messages for common issues
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error('Request timed out. The analysis is taking longer than expected. Please try again.');
        } else if (error.message.includes('Failed to fetch')) {
          throw new Error('Unable to connect to the server. Please check your internet connection and try again.');
        }
      }
      
      throw error;
    }
  }
}

export const plantAnalysisService = new PlantAnalysisService();