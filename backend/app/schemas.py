from enum import Enum
from typing import Union, Optional, List, Dict, Any
from pydantic import BaseModel

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
