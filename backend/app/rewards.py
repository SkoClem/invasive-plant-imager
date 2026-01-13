"""
User Rewards Management Module

Tracks per-user coin counts and species already awarded.

Production-grade persistence:
- Prefer Firebase Firestore via Admin SDK for durable, cross-device storage
- Fallback to JSON file persistence locally when Firestore is unavailable
"""

import json
import os
from typing import Dict, List, Optional, Tuple

# Try to initialize Firestore client via Firebase Admin SDK
try:
    from firebase_admin import firestore
    _firestore_client = firestore.client()
except Exception:
    _firestore_client = None


class FileRewardsManager:
    def __init__(self, storage_file: str = "user_rewards.json"):
        self.storage_file = storage_file
        self.rewards: Dict[str, Dict] = {}
        self.load_rewards()

    def load_rewards(self):
        try:
            if os.path.exists(self.storage_file):
                print(f"Loading rewards from {self.storage_file}")
                with open(self.storage_file, 'r') as f:
                    self.rewards = json.load(f)
                print(f"Loaded rewards for {len(self.rewards)} users")
            else:
                print(f"Rewards file {self.storage_file} not found, starting empty")
        except Exception as e:
            print(f"Error loading rewards: {e}")

    def save_rewards(self):
        try:
            print(f"Saving rewards to {self.storage_file}")
            with open(self.storage_file, 'w') as f:
                json.dump(self.rewards, f, indent=2)
            print("Rewards saved successfully")
        except Exception as e:
            print(f"Error saving rewards: {e}")

    def get_user_rewards(self, user_id: str) -> Dict:
        data = self.rewards.get(user_id)
        if not data:
            data = {"coins": 0, "awarded_species": []}
            self.rewards[user_id] = data
        return data

    def award_species_if_new(self, user_id: str, species: str) -> Tuple[bool, int]:
        data = self.get_user_rewards(user_id)
        awarded_species: List[str] = data.get("awarded_species", [])
        
        # Always award coins for invasive species, even if already found
        if species:
            if species not in awarded_species:
                awarded_species.append(species)
                data["awarded_species"] = awarded_species
            
            data["coins"] = int(data.get("coins", 0)) + 1
            self.rewards[user_id] = data
            self.save_rewards()
            return True, data["coins"]
            
        # No award if no species provided
        self.save_rewards()
        return False, int(data.get("coins", 0))


class FirestoreRewardsManager:
    def __init__(self, client):
        self.client = client
        self.collection_name = "user_rewards"

    def _doc_ref(self, user_id: str):
        return self.client.collection(self.collection_name).document(user_id)

    def get_user_rewards(self, user_id: str) -> Dict:
        try:
            doc_ref = self._doc_ref(user_id)
            snapshot = doc_ref.get()
            if snapshot.exists:
                data = snapshot.to_dict() or {}
                coins = int(data.get("coins", 0))
                awarded_species = data.get("awarded_species", [])
                if not isinstance(awarded_species, list):
                    awarded_species = []
                return {"coins": coins, "awarded_species": awarded_species}
            else:
                # Initialize document
                doc_ref.set({"coins": 0, "awarded_species": []})
                return {"coins": 0, "awarded_species": []}
        except Exception as e:
            print(f"Error getting Firestore rewards for user {user_id}: {e}")
            return {"coins": 0, "awarded_species": []}

    def award_species_if_new(self, user_id: str, species: str) -> Tuple[bool, int]:
        try:
            doc_ref = self._doc_ref(user_id)
            snapshot = doc_ref.get()
            if snapshot.exists:
                data = snapshot.to_dict() or {}
            else:
                data = {"coins": 0, "awarded_species": []}

            coins = int(data.get("coins", 0))
            awarded_species: List[str] = data.get("awarded_species", [])
            if not isinstance(awarded_species, list):
                awarded_species = []

            # Always award coins for invasive species
            if species:
                if species not in awarded_species:
                    awarded_species.append(species)
                
                coins += 1
                doc_ref.set({"coins": coins, "awarded_species": awarded_species}, merge=True)
                return True, coins
            else:
                return False, coins
        except Exception as e:
            print(f"Error awarding rewards for user {user_id}: {e}")
            return False, 0


# Global instance: prefer Firestore, fallback to file-based JSON storage
rewards_manager = None

if _firestore_client is not None:
    try:
        # Test connection by attempting to read a document (doesn't need to exist)
        # We use a dummy query that should succeed if permissions are correct
        _firestore_client.collection("user_rewards").limit(1).get()
        print("✅ Firestore connection successful, using FirestoreRewardsManager")
        rewards_manager = FirestoreRewardsManager(_firestore_client)
    except Exception as e:
        print(f"⚠️ Firestore connection failed ({e}), falling back to FileRewardsManager")
        rewards_manager = FileRewardsManager()
else:
    print("Using FileRewardsManager (Firestore client not available)")
    rewards_manager = FileRewardsManager()
