import { PlantAnalysisResponse, PlantAnalysisRequest } from '../types/plantAnalysis';
import { authService } from './authService';
import { compressImage } from '../utils/imageUtils';

const API_BASE_URL = (process.env.REACT_APP_API_URL || 'http://localhost:8000').replace(/\/$/, '');

console.log('API Base URL:', API_BASE_URL);
console.log('Environment variable loaded:', !!process.env.REACT_APP_API_URL);
console.log('Environment variable value:', process.env.REACT_APP_API_URL);

class PlantAnalysisService {
  async analyzePlant(request: PlantAnalysisRequest): Promise<PlantAnalysisResponse> {
    // Compress the image before sending
    console.log(`Original image size: ${(request.image.size / 1024 / 1024).toFixed(2)} MB`);
    let imageToSend = request.image;
    
    try {
      // Compress to max 1024px dimension and 0.8 quality
      // This significantly reduces upload time and LLM processing token count
      imageToSend = await compressImage(request.image, 1024, 0.8);
      console.log(`Compressed image size: ${(imageToSend.size / 1024 / 1024).toFixed(2)} MB`);
    } catch (error) {
      console.warn('Image compression failed, sending original image:', error);
    }

    const formData = new FormData();

    // Append the image file
    formData.append('image', imageToSend);

    // Append the region
    formData.append('region', request.region);

    console.log('🚀 Sending request to:', `${API_BASE_URL}/api/analyze-plant`);
    console.log('📸 FormData contents:', {
      fileName: imageToSend.name,
      fileSize: `${(imageToSend.size / 1024 / 1024).toFixed(2)} MB`,
      fileType: imageToSend.type,
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
      const timeoutId = setTimeout(() => controller.abort(), 180000); // 3 minute timeout

      const headers: HeadersInit = {};
      const token = await authService.getAccessToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      // Use regular fetch instead of authenticatedFetch to allow unauthenticated requests
      // But include Authorization header if available to support user rewards
      const response = await fetch(`${API_BASE_URL}/api/analyze-plant`, {
        method: 'POST',
        headers,
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
