from typing import List, Optional, Dict, Any
from pydantic import BaseModel
from datetime import datetime

class Message(BaseModel):
    message: str

class ChatRequest(BaseModel):
    message: str
    context: Optional[Dict[str, Any]] = None

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
    coins: int = 0  # Added coins field

class ProtectedResponse(BaseModel):
    message: str
    user: UserProfile

# Collection schemas
class PlantInfo(BaseModel):
    specieIdentified: Optional[str] = None
    nativeRegion: Optional[str] = None
    invasiveOrNot: bool = False
    confidenceScore: Optional[float] = None
    confidenceReasoning: Optional[str] = None
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

# Map schemas
class MapMarker(BaseModel):
    id: str
    user_id: str
    user_name: Optional[str] = "Anonymous"
    latitude: float
    longitude: float
    plant_name: str
    is_invasive: bool
    timestamp: datetime
    scan_id: Optional[str] = None

class CreateMarkerRequest(BaseModel):
    latitude: float
    longitude: float
    plant_name: str
    is_invasive: bool
    scan_id: Optional[str] = None
