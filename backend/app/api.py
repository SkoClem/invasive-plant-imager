from typing import Dict, Any
from fastapi import APIRouter, HTTPException, UploadFile, File, Form, Depends
from app.schemas import Message, PlantAnalysisRequest, PlantAnalysisResponse, FirebaseLoginRequest, LoginResponse, ProtectedResponse
from app.backend import Imager
from app.auth import AuthService, get_current_user, get_current_user_optional

imager = Imager()
router = APIRouter()

# Authentication endpoints
@router.post("/api/auth/login", response_model=LoginResponse)
async def login(request: FirebaseLoginRequest):
    """Login with Firebase ID token and get JWT token"""
    try:
        # Verify Firebase token and get user info
        user_info = AuthService.verify_firebase_token(request.id_token)
        
        # Create JWT token
        jwt_token = AuthService.create_jwt_token(user_info)
        
        return LoginResponse(
            access_token=jwt_token,
            token_type="bearer",
            user=user_info
        )
    except Exception as e:
        raise HTTPException(status_code=401, detail=str(e))

@router.get("/api/auth/me", response_model=ProtectedResponse)
async def get_current_user_info(current_user: Dict[str, Any] = Depends(get_current_user)):
    """Get current authenticated user information"""
    return ProtectedResponse(
        message="User authenticated successfully",
        user=current_user
    )

@router.post("/api/chat")
def chat(message: Message, current_user: Dict[str, Any] = Depends(get_current_user_optional)) -> dict[str, str]:
    """Chat endpoint - optionally authenticated"""
    print(f"Message request received from user: {current_user.get('email') if current_user else 'anonymous'}")
    try:
        response = imager.chat_response(message.message)
        return {"text": response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/api/analyze-plant")
async def analyze_plant(
    image: UploadFile = File(...),
    region: str = Form("North America"),
    current_user: Dict[str, Any] = Depends(get_current_user_optional)
):
    """Analyze plant image for invasive species detection - authentication optional"""
    print(f"Plant analysis request received from user: {current_user['email'] if current_user else 'anonymous'} for region: {region}")

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

        # Add user information to the response for potential future use (if authenticated)
        if current_user:
            parsed_data['analyzed_by'] = current_user['uid']
            parsed_data['user_email'] = current_user['email']
        else:
            parsed_data['analyzed_by'] = 'anonymous'
            parsed_data['user_email'] = 'anonymous@example.com'

        return parsed_data

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
