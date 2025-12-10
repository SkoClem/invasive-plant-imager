from enum import Enum
from typing import Union, Optional, List, Dict, Any
from pydantic import BaseModel
from datetime import datetime

class Message(BaseModel):
    message: str

class PlantAnalysisRequest(BaseModel):
    region: Optional[str] = "North America"

class PlantAnalysisResponse(BaseModel):
    is_invasive: bool
    confidence: float
    explanation: str
    plant_name: Optional[str] = None

# New authentication schemas
class FirebaseLoginRequest(BaseModel):
    id_token: str

class LoginResponse(BaseModel):
    access_token: str
    token_type: str
    user: Dict[str, Any]

class UserProfile(BaseModel):
    uid: str
    email: Optional[str]
    name: Optional[str]
    picture: Optional[str]
    email_verified: bool

class ProtectedResponse(BaseModel):
    message: str
    user: UserProfile

# Collection schemas
class PlantInfo(BaseModel):
    specieIdentified: Optional[str] = None
    nativeRegion: Optional[str] = None
    invasiveOrNot: bool = False
    invasiveEffects: str = ""
    nativeAlternatives: List[Dict[str, str]] = []
    removeInstructions: str = ""

class CollectionItem(BaseModel):
    id: str
    timestamp: datetime
    region: str
    status: str  # 'analyzing', 'completed', 'error'
    species: Optional[str] = None
    description: Optional[str] = None
    plant_data: Optional[PlantInfo] = None

    class Config:
        extra = 'ignore'

class SaveCollectionRequest(BaseModel):
    collection_item: CollectionItem

class UserCollectionResponse(BaseModel):
    user_id: str
    collection: List[CollectionItem]
    total_items: int

class DeleteCollectionItemRequest(BaseModel):
    item_id: str
