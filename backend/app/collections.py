"""
User Collections Management Module

This module handles user collection storage and retrieval.
For now, we'll use a simple in-memory storage with JSON file persistence.
In production, this should be replaced with a proper database.
"""

import json
import os
from typing import Dict, List, Optional
from datetime import datetime
from app.schemas import CollectionItem, PlantInfo

class CollectionManager:
    def __init__(self, storage_file: str = "user_collections.json"):
        self.storage_file = storage_file
        self.collections: Dict[str, List[Dict]] = {}
        self.load_collections()

    def load_collections(self):
        """Load collections from JSON file"""
        try:
            if os.path.exists(self.storage_file):
                with open(self.storage_file, 'r') as f:
                    data = json.load(f)
                    self.collections = data
        except Exception as e:
            print(f"Error loading collections: {e}")
            self.collections = {}

    def save_collections(self):
        """Save collections to JSON file"""
        try:
            with open(self.storage_file, 'w') as f:
                json.dump(self.collections, f, default=str, indent=2)
        except Exception as e:
            print(f"Error saving collections: {e}")

    def add_item_to_collection(self, user_id: str, collection_item: CollectionItem) -> bool:
        """Add an item to user's collection"""
        try:
            if user_id not in self.collections:
                self.collections[user_id] = []
            
            # Convert CollectionItem to dict for storage
            item_dict = collection_item.dict()
            
            # Check if item already exists (by id)
            existing_item_index = None
            for i, item in enumerate(self.collections[user_id]):
                if item.get('id') == collection_item.id:
                    existing_item_index = i
                    break
            
            if existing_item_index is not None:
                # Update existing item
                self.collections[user_id][existing_item_index] = item_dict
            else:
                # Add new item to the beginning of the list
                self.collections[user_id].insert(0, item_dict)
            
            # Limit collection size to 100 items per user
            if len(self.collections[user_id]) > 100:
                self.collections[user_id] = self.collections[user_id][:100]
            
            self.save_collections()
            return True
        except Exception as e:
            print(f"Error adding item to collection: {e}")
            return False

    def get_user_collection(self, user_id: str) -> List[CollectionItem]:
        """Get user's collection"""
        try:
            if user_id not in self.collections:
                return []
            
            # Convert dict items back to CollectionItem objects
            collection_items = []
            for item_dict in self.collections[user_id]:
                # Handle datetime conversion
                if isinstance(item_dict.get('timestamp'), str):
                    item_dict['timestamp'] = datetime.fromisoformat(item_dict['timestamp'].replace('Z', '+00:00'))
                
                # Handle plant_data conversion
                if item_dict.get('plant_data') and isinstance(item_dict['plant_data'], dict):
                    item_dict['plant_data'] = PlantInfo(**item_dict['plant_data'])
                
                collection_items.append(CollectionItem(**item_dict))
            
            return collection_items
        except Exception as e:
            print(f"Error getting user collection: {e}")
            return []

    def delete_item_from_collection(self, user_id: str, item_id: str) -> bool:
        """Delete an item from user's collection"""
        try:
            if user_id not in self.collections:
                return False
            
            # Find and remove the item
            original_length = len(self.collections[user_id])
            self.collections[user_id] = [
                item for item in self.collections[user_id] 
                if item.get('id') != item_id
            ]
            
            # Check if an item was actually removed
            if len(self.collections[user_id]) < original_length:
                self.save_collections()
                return True
            
            return False
        except Exception as e:
            print(f"Error deleting item from collection: {e}")
            return False

    def clear_user_collection(self, user_id: str) -> bool:
        """Clear all items from user's collection"""
        try:
            if user_id in self.collections:
                self.collections[user_id] = []
                self.save_collections()
            return True
        except Exception as e:
            print(f"Error clearing user collection: {e}")
            return False

# Global collection manager instance
collection_manager = CollectionManager()