"""
User Collections Management Module

This module handles user collection storage and retrieval.

Production-grade persistence:
- Prefer Firebase Firestore via Admin SDK for durable, cross-device storage
- Fallback to JSON file persistence locally when Firestore is unavailable
"""

import json
import os
from typing import Dict, List, Optional
from datetime import datetime
from app.schemas import CollectionItem, PlantInfo

# Try to initialize Firestore client via Firebase Admin SDK
try:
    from firebase_admin import firestore
    _firestore_client = firestore.client()
except Exception as _e:
    _firestore_client = None

class FileCollectionManager:
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

class FirestoreCollectionManager:
    """Firestore-backed collection manager for durable, cross-login persistence"""
    def __init__(self, client):
        self.client = client
        self.collection_name = "user_collections"

    def _doc_ref(self, user_id: str):
        return self.client.collection(self.collection_name).document(user_id)

    def _items_collection(self, user_id: str):
        return self._doc_ref(user_id).collection("items")

    def add_item_to_collection(self, user_id: str, collection_item: CollectionItem) -> bool:
        try:
            item_dict = collection_item.dict()
            
            # Log image data presence
            if item_dict.get('imageDataUrl'):
                print(f"📸 Saving item {collection_item.id} with image data (len: {len(item_dict['imageDataUrl'])})")
            else:
                print(f"⚠️ Saving item {collection_item.id} WITHOUT image data")

            # Store each collection item as its own document to avoid Firestore
            # document size limits when image data is present.
            items_ref = self._items_collection(user_id)
            items_ref.document(collection_item.id).set(item_dict)
            return True
        except Exception as e:
            print(f"Error adding item to Firestore collection: {e}")
            return False

    def get_user_collection(self, user_id: str) -> List[CollectionItem]:
        try:
            items: List[Dict] = []

            # Primary source: per-item documents in "items" subcollection
            items_ref = self._items_collection(user_id)
            try:
                for doc in items_ref.stream():
                    items.append(doc.to_dict())
            except Exception as e:
                print(f"Error streaming Firestore items for user {user_id}: {e}")

            # Fallback / migration support: legacy single-document "items" array
            try:
                doc_ref = self._doc_ref(user_id)
                snapshot = doc_ref.get()
                if snapshot.exists:
                    data = snapshot.to_dict() or {}
                    legacy_items = data.get("items", [])
                    # Merge legacy items that don't already exist in subcollection
                    existing_ids = {it.get("id") for it in items if it.get("id") is not None}
                    for legacy in legacy_items:
                        if legacy.get("id") not in existing_ids:
                            items.append(legacy)
            except Exception as e:
                print(f"Error loading legacy Firestore items for user {user_id}: {e}")

            collection_items: List[CollectionItem] = []
            for item_dict in items:
                # Handle timestamp conversion: Firestore may return datetime or string
                ts = item_dict.get('timestamp')
                if isinstance(ts, str):
                    try:
                        item_dict['timestamp'] = datetime.fromisoformat(ts.replace('Z', '+00:00'))
                    except Exception:
                        # If parse fails, use current time as fallback
                        item_dict['timestamp'] = datetime.utcnow()
                elif not isinstance(ts, datetime):
                    # Fallback if timestamp missing or unknown type
                    item_dict['timestamp'] = datetime.utcnow()
                # Plant data
                if item_dict.get('plant_data') and isinstance(item_dict['plant_data'], dict):
                    item_dict['plant_data'] = PlantInfo(**item_dict['plant_data'])
                collection_items.append(CollectionItem(**item_dict))

            # Sort newest-first by timestamp for consistent UI ordering
            collection_items.sort(key=lambda item: item.timestamp, reverse=True)
            return collection_items
        except Exception as e:
            print(f"Error getting Firestore user collection: {e}")
            return []

    def delete_item_from_collection(self, user_id: str, item_id: str) -> bool:
        try:
            # Delete from per-item subcollection
            self._items_collection(user_id).document(item_id).delete()

            # Best-effort cleanup of legacy array storage (if present)
            try:
                doc_ref = self._doc_ref(user_id)
                snapshot = doc_ref.get()
                if snapshot.exists:
                    data = snapshot.to_dict() or {}
                    items: List[Dict] = data.get("items", [])
                    new_items = [it for it in items if it.get('id') != item_id]
                    if len(new_items) != len(items):
                        doc_ref.set({"items": new_items})
            except Exception as e:
                print(f"Error cleaning up legacy Firestore item for user {user_id}: {e}")

            return True
        except Exception as e:
            print(f"Error deleting item from Firestore collection: {e}")
            return False

    def clear_user_collection(self, user_id: str) -> bool:
        try:
            # Delete all per-item documents in subcollection
            items_ref = self._items_collection(user_id)
            try:
                batch = self.client.batch()
                docs = list(items_ref.stream())
                for doc in docs:
                    batch.delete(doc.reference)
                if docs:
                    batch.commit()
            except Exception as e:
                print(f"Error clearing Firestore subcollection for user {user_id}: {e}")

            # Clear legacy single-document "items" array as well
            try:
                doc_ref = self._doc_ref(user_id)
                doc_ref.set({"items": []})
            except Exception as e:
                print(f"Error clearing legacy Firestore doc for user {user_id}: {e}")

            return True
        except Exception as e:
            print(f"Error clearing Firestore user collection: {e}")
            return False

# Global collection manager instance: prefer Firestore when available and reachable,
# otherwise fall back to file-based storage.
collection_manager = None  # type: ignore[assignment]

if _firestore_client is not None:
    try:
        # Lightweight connectivity check similar to rewards.py
        _firestore_client.collection("user_collections").limit(1).get()
        print("✅ Firestore connection successful, using FirestoreCollectionManager")
        collection_manager = FirestoreCollectionManager(_firestore_client)
    except Exception as e:
        print(f"⚠️ Firestore connection failed ({e}), falling back to FileCollectionManager")
        collection_manager = FileCollectionManager()
else:
    print("Using FileCollectionManager (Firestore client not available)")
    collection_manager = FileCollectionManager()
