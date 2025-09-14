from enum import Enum
from typing import Union
from pydantic import BaseModel

class Message(BaseModel):
    message: str
