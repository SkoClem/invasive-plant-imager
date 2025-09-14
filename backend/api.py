from typing import Dict, Any
from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from schemas import Message, PlantAnalysisRequest, PlantAnalysisResponse
from backend import Imager

imager = Imager()
router = APIRouter()

@router.post("/api/chat")
def chat(message: Message) -> dict[str, str]:
    print("Message request received")
    try:
        response = imager.chat_response(message.message)
        return {"text": response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/api/analyze-plant", response_model=PlantAnalysisResponse)
async def analyze_plant(
    image: UploadFile = File(...),
    region: str = Form("North America")
):
    """Analyze plant image for invasive species detection"""
    print(f"Plant analysis request received for region: {region}")

    try:
        # Validate image file
        if not image.content_type.startswith("image/"):
            raise HTTPException(status_code=400, detail="File must be an image")

        # Set region for analysis
        imager.region = region

        # Convert uploaded file to base64
        image_data = await image.read()
        import base64
        base64_image = base64.b64encode(image_data).decode('utf-8')

        # Analyze the image
        result = imager.chat_response(base64_image)

        # Parse LLM response and return structured data
        # For now, return the raw response with default values
        return PlantAnalysisResponse(
            is_invasive=False,  # Will be parsed from LLM response
            confidence=0.0,     # Will be parsed from LLM response
            explanation=result,
            plant_name=None     # Will be parsed from LLM response
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
