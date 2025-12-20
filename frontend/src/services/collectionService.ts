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

export interface PlantInfo {
  specieIdentified?: string;
  nativeRegion?: string;
  invasiveOrNot: boolean;
  confidenceScore?: number;
  confidenceReasoning?: string;
  invasiveEffects: string;
  nativeAlternatives: Array<{
    commonName: string;
    scientificName: string;
    characteristics: string;
  }>;
  removeInstructions: string;
}

export interface CollectionItem {
  id: string;
  timestamp: Date;
  region: string;
  status: 'analyzing' | 'completed' | 'error';
  species?: string;
  description?: string;
  plant_data?: PlantInfo;
}

export interface UserCollectionResponse {
  user_id: string;
  collection: CollectionItem[];
  total_items: number;
}

class CollectionService {
  /**
   * Save a collection item to the backend
   */
  async saveCollectionItem(collectionItem: CollectionItem): Promise<boolean> {
    try {
      const token = authService.getAccessToken();
      if (!token) {
        throw new Error('User not authenticated');
      }

      const response = await fetch(`${API_BASE_URL}/api/collections/save`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          collection_item: {
            ...collectionItem,
            timestamp: collectionItem.timestamp.toISOString()
          }
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to save collection item');
      }

      const result = await response.json();
      return result.success;
    } catch (error) {
      console.error('Failed to save collection item:', error);
      return false;
    }
  }

  /**
   * Get user's collection from the backend
   */
  async getUserCollection(): Promise<CollectionItem[]> {
    try {
      const token = authService.getAccessToken();
      if (!token) {
        throw new Error('User not authenticated');
      }

      const response = await fetch(`${API_BASE_URL}/api/collections`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to get collection');
      }

      const result: UserCollectionResponse = await response.json();
      
      // Convert timestamp strings back to Date objects
      const collection = result.collection.map(item => ({
        ...item,
        timestamp: new Date(item.timestamp)
      }));

      return collection;
    } catch (error) {
      console.error('Failed to get collection:', error);
      return [];
    }
  }

  /**
   * Delete a collection item from the backend
   */
  async deleteCollectionItem(itemId: string): Promise<boolean> {
    try {
      const token = authService.getAccessToken();
      if (!token) {
        throw new Error('User not authenticated');
      }

      const response = await fetch(`${API_BASE_URL}/api/collections/item`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          item_id: itemId
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to delete collection item');
      }

      const result = await response.json();
      return result.success;
    } catch (error) {
      console.error('Failed to delete collection item:', error);
      return false;
    }
  }

  /**
   * Clear all items from user's collection
   */
  async clearUserCollection(): Promise<boolean> {
    try {
      const token = authService.getAccessToken();
      if (!token) {
        throw new Error('User not authenticated');
      }

      const response = await fetch(`${API_BASE_URL}/api/collections/clear`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to clear collection');
      }

      const result = await response.json();
      return result.success;
    } catch (error) {
      console.error('Failed to clear collection:', error);
      return false;
    }
  }
}

export const collectionService = new CollectionService();
