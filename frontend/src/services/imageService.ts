import { authService } from './authService';

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

class ImageService {
  /**
   * Upload an image to the backend for storage
   */
  async uploadImage(imageId: string, file: File): Promise<boolean> {
    try {
      const token = authService.getAccessToken();
      if (!token) {
        throw new Error('User not authenticated');
      }

      const formData = new FormData();
      formData.append('image_id', imageId);
      formData.append('image', file);

      const response = await fetch(`${API_BASE_URL}/api/images/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.success;
    } catch (error) {
      console.error('Error uploading image:', error);
      return false;
    }
  }

  /**
   * Get image URL for display
   */
  getImageUrl(imageId: string): string {
    const token = authService.getAccessToken();
    if (!token) {
      return '';
    }
    
    return `${API_BASE_URL}/api/images/${imageId}?token=${encodeURIComponent(token)}`;
  }

  /**
   * Get an image from storage
   */
  async getImage(imageId: string): Promise<Blob | null> {
    try {
      const token = authService.getAccessToken();
      if (!token) {
        throw new Error('User not authenticated');
      }

      const response = await fetch(`${API_BASE_URL}/api/images/${imageId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          return null; // Image not found
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.blob();
    } catch (error) {
      console.error('Error getting image:', error);
      return null;
    }
  }

  /**
   * Create a blob URL for an image that can be used in img src
   */
  async getImageBlob(imageId: string): Promise<string | null> {
    try {
      const token = authService.getAccessToken();
      if (!token) {
        throw new Error('User not authenticated');
      }

      const response = await fetch(`${API_BASE_URL}/api/images/${imageId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          return null; // Image not found
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const blob = await response.blob();
      return URL.createObjectURL(blob);
    } catch (error) {
      console.error('Error getting image blob:', error);
      return null;
    }
  }

  /**
   * Delete an image from storage
   */
  async deleteImage(imageId: string): Promise<boolean> {
    try {
      const token = authService.getAccessToken();
      if (!token) {
        throw new Error('User not authenticated');
      }

      const response = await fetch(`${API_BASE_URL}/api/images/${imageId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.success;
    } catch (error) {
      console.error('Error deleting image:', error);
      return false;
    }
  }

  /**
   * List all images for the current user
   */
  async listUserImages(): Promise<Record<string, any>> {
    try {
      const token = authService.getAccessToken();
      if (!token) {
        throw new Error('User not authenticated');
      }

      const response = await fetch(`${API_BASE_URL}/api/images`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.images;
    } catch (error) {
      console.error('Error listing images:', error);
      return {};
    }
  }
}

export const imageService = new ImageService();