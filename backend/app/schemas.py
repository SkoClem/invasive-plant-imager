from enum import Enum
from typing import Union, Optional
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
