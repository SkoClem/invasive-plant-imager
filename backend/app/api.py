from typing import Dict, Any
from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from app.schemas import Message, PlantAnalysisRequest, PlantAnalysisResponse
from app.backend import Imager

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

@router.post("/api/analyze-plant")
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
        imager.set_region(region)

        # Convert uploaded file to base64
        image_data = await image.read()
        import base64
        base64_image = base64.b64encode(image_data).decode('utf-8')

        # Analyze the image
        parsed_data = imager.analyze_plant_image(base64_image)

        return parsed_data

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
