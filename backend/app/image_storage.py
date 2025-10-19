"""
Image Storage Module

This module handles storing and retrieving user images for the collection system.
Images are stored as base64 encoded data in JSON files for simplicity.
In production, this should use proper file storage or cloud storage.
"""

import json
import os
import base64
from typing import Dict, Optional
from datetime import datetime

class ImageStorageManager:
    def __init__(self, storage_dir: str = "user_images"):
        self.storage_dir = storage_dir
        self.ensure_storage_dir()

    def ensure_storage_dir(self):
        """Ensure the storage directory exists"""
        if not os.path.exists(self.storage_dir):
            os.makedirs(self.storage_dir)

    def get_user_storage_file(self, user_id: str) -> str:
        """Get the storage file path for a specific user"""
        return os.path.join(self.storage_dir, f"{user_id}_images.json")

    def store_image(self, user_id: str, image_id: str, image_data: bytes, filename: str, content_type: str) -> bool:
        """Store an image for a user"""
        try:
            storage_file = self.get_user_storage_file(user_id)
            
            # Load existing images
            user_images = {}
            if os.path.exists(storage_file):
                with open(storage_file, 'r') as f:
                    user_images = json.load(f)
            
            # Convert image to base64
            image_base64 = base64.b64encode(image_data).decode('utf-8')
            
            # Store image metadata and data
            user_images[image_id] = {
                'filename': filename,
                'content_type': content_type,
                'data': image_base64,
                'stored_at': datetime.now().isoformat(),
                'size': len(image_data)
            }
            
            # Save back to file
            with open(storage_file, 'w') as f:
                json.dump(user_images, f, indent=2)
            
            return True
            
        except Exception as e:
            print(f"Error storing image {image_id} for user {user_id}: {e}")
            return False

    def get_image(self, user_id: str, image_id: str) -> Optional[Dict]:
        """Retrieve an image for a user"""
        try:
            storage_file = self.get_user_storage_file(user_id)
            
            if not os.path.exists(storage_file):
                return None
            
            with open(storage_file, 'r') as f:
                user_images = json.load(f)
            
            if image_id not in user_images:
                return None
            
            image_info = user_images[image_id]
            
            # Decode base64 data
            image_data = base64.b64decode(image_info['data'])
            
            return {
                'filename': image_info['filename'],
                'content_type': image_info['content_type'],
                'data': image_data,
                'stored_at': image_info['stored_at'],
                'size': image_info['size']
            }
            
        except Exception as e:
            print(f"Error retrieving image {image_id} for user {user_id}: {e}")
            return None

    def delete_image(self, user_id: str, image_id: str) -> bool:
        """Delete an image for a user"""
        try:
            storage_file = self.get_user_storage_file(user_id)
            
            if not os.path.exists(storage_file):
                return False
            
            with open(storage_file, 'r') as f:
                user_images = json.load(f)
            
            if image_id in user_images:
                del user_images[image_id]
                
                # Save back to file
                with open(storage_file, 'w') as f:
                    json.dump(user_images, f, indent=2)
                
                return True
            
            return False
            
        except Exception as e:
            print(f"Error deleting image {image_id} for user {user_id}: {e}")
            return False

    def clear_user_images(self, user_id: str) -> bool:
        """Clear all images for a user"""
        try:
            storage_file = self.get_user_storage_file(user_id)
            
            if os.path.exists(storage_file):
                os.remove(storage_file)
            
            return True
            
        except Exception as e:
            print(f"Error clearing images for user {user_id}: {e}")
            return False

    def get_user_image_list(self, user_id: str) -> Dict[str, Dict]:
        """Get list of all images for a user (metadata only)"""
        try:
            storage_file = self.get_user_storage_file(user_id)
            
            if not os.path.exists(storage_file):
                return {}
            
            with open(storage_file, 'r') as f:
                user_images = json.load(f)
            
            # Return metadata without the actual image data
            metadata = {}
            for image_id, image_info in user_images.items():
                metadata[image_id] = {
                    'filename': image_info['filename'],
                    'content_type': image_info['content_type'],
                    'stored_at': image_info['stored_at'],
                    'size': image_info['size']
                }
            
            return metadata
            
        except Exception as e:
            print(f"Error getting image list for user {user_id}: {e}")
            return {}

# Global instance
image_storage = ImageStorageManager()