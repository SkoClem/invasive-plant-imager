import traceback
from typing import Dict, Any, List
from fastapi import APIRouter, HTTPException, UploadFile, File, Form, Depends, Request
from fastapi.responses import Response
from app.schemas import Message, ChatRequest, PlantAnalysisRequest, PlantAnalysisResponse, FirebaseLoginRequest, LoginResponse, ProtectedResponse, SaveCollectionRequest, UserCollectionResponse, DeleteCollectionItemRequest, CreateMarkerRequest, MapMarker
from app.backend import Imager
from app.auth import AuthService, get_current_user, get_current_user_optional
from app.collections import collection_manager
from app.maps import map_manager
from app.rate_limiter import rate_limiter
from app.rewards import rewards_manager
from app.plant_classifier import is_plant

imager = Imager()
router = APIRouter()

# Authentication endpoints
@router.post("/api/auth/login", response_model=LoginResponse)
async def login(request: FirebaseLoginRequest):
    """Login with Firebase ID token and get JWT token"""
    try:
        # Verify Firebase token and get user info
        user_info = AuthService.verify_firebase_token(request.id_token)
        
        # Get user coins
        user_rewards = rewards_manager.get_user_rewards(user_info['uid'])
        user_info['coins'] = int(user_rewards.get('coins', 0))
        
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
    # Get latest coins
    user_rewards = rewards_manager.get_user_rewards(current_user['uid'])
    current_user['coins'] = int(user_rewards.get('coins', 0))
    
    return ProtectedResponse(
        message="User authenticated successfully",
        user=current_user
    )

# Collection endpoints
@router.post("/api/collections/save")
async def save_collection_item(
    request: SaveCollectionRequest,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Save an item to user's collection"""
    try:
        user_id = current_user['uid']
        success = collection_manager.add_item_to_collection(user_id, request.collection_item)
        
        if success:
            return {"message": "Collection item saved successfully", "success": True}
        else:
            raise HTTPException(status_code=500, detail="Failed to save collection item")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/api/collections", response_model=UserCollectionResponse)
async def get_user_collection(request: Request, current_user: Dict[str, Any] = Depends(get_current_user)):
    """Get user's collection"""
    try:
        user_id = current_user['uid']
        collection = collection_manager.get_user_collection(user_id)
        
        return UserCollectionResponse(
            user_id=user_id,
            collection=collection,
            total_items=len(collection)
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/api/collections/item")
async def delete_collection_item(
    request: DeleteCollectionItemRequest,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Delete an item from user's collection"""
    try:
        user_id = current_user['uid']
        success = collection_manager.delete_item_from_collection(user_id, request.item_id)
        
        if success:
            return {"message": "Collection item deleted successfully", "success": True}
        else:
            raise HTTPException(status_code=404, detail="Collection item not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/api/collections/clear")
async def clear_user_collection(current_user: Dict[str, Any] = Depends(get_current_user)):
    """Clear all items from user's collection"""
    try:
        user_id = current_user['uid']
        success = collection_manager.clear_user_collection(user_id)
        
        if success:
            return {"message": "Collection cleared successfully", "success": True}
        else:
            raise HTTPException(status_code=500, detail="Failed to clear collection")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/api/chat")
def chat(request: ChatRequest, current_user: Dict[str, Any] = Depends(get_current_user_optional)) -> dict[str, str]:
    """Chat endpoint - optionally authenticated"""
    print(f"Message request received from user: {current_user.get('email') if current_user else 'anonymous'}")
    try:
        response = imager.chat_response(request.message, request.context)
        return {"text": response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/api/check-plant")
async def check_plant(image: UploadFile = File(...)):
    """Quickly check if the image is a plant using CNN"""
    try:
        if not image.content_type.startswith("image/"):
            raise HTTPException(status_code=400, detail="File must be an image")
            
        image_data = await image.read()
        is_plant_result = is_plant(image_data)
        
        return {"is_plant": is_plant_result}
    except Exception as e:
        print(f"❌ Check plant failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/api/analyze-plant")
async def analyze_plant(
    request: Request,
    image: UploadFile = File(...),
    region: str = Form("Texas"),  # Default to Texas if not provided
    current_user: Dict[str, Any] = Depends(get_current_user_optional)
):
    """Analyze plant image for Texas invasive species detection - authentication optional"""
    user_identifier = current_user.get('email') if current_user else 'anonymous'
    client_ip = request.client.host if request.client else "unknown"
    
    # Get current date and season
    from datetime import datetime
    current_date = datetime.now().strftime("%Y-%m-%d")
    month = datetime.now().month
    
    if 3 <= month <= 5:
        season = "Spring"
    elif 6 <= month <= 8:
        season = "Summer"
    elif 9 <= month <= 11:
        season = "Fall"
    else:
        season = "Winter"
    
    print(f"Plant analysis request received from user: {user_identifier} for region: {region}, Date: {current_date}, Season: {season}")

    # Rate limiting check
    rate_limit_key = rate_limiter.get_rate_limit_key(user_identifier, client_ip)
    
    try:
        # Check rate limits before processing
        rate_limiter.check_rate_limit(rate_limit_key)
        
        # Validate image file
        if not image.content_type.startswith("image/"):
            raise HTTPException(status_code=400, detail="File must be an image")

        # Set region for analysis
        imager.set_region(region)

        # Convert uploaded file to base64
        image_data = await image.read()
        
        # 🌿 Check if it is a plant using CNN
        print("🔍 Checking if image is a plant...")
        if not is_plant(image_data):
            print("🚫 Image classified as NOT a plant. Skipping LLM analysis.")
            return {
                "specieIdentified": "Not a Plant",
                "nativeRegion": "N/A",
                "invasiveOrNot": False,
                "confidenceScore": 0.0,
                "confidenceReasoning": "The image was classified as a non-plant object by our AI filter.",
                "invasiveEffects": "This image does not appear to contain a plant.",
                "nativeAlternatives": [],
                "removeInstructions": "Please upload a clear image of a plant.",
                "region": region,
                "analyzed_by": current_user['uid'] if current_user else 'anonymous',
                "user_email": current_user['email'] if current_user else 'anonymous@example.com',
                "coinAwarded": False,
                "coins": int(rewards_manager.get_user_rewards(current_user['uid']).get('coins', 0)) if current_user else 0
            }
            
        import base64
        base64_data = base64.b64encode(image_data).decode('utf-8')
        
        # Create Data URI with correct MIME type
        base64_image = f"data:{image.content_type};base64,{base64_data}"
        
        print(f"📸 Starting analysis for user {user_identifier} (Region: {region})")

        # Analyze the image
        try:
            parsed_data = imager.analyze_plant_image(base64_image, date=current_date, season=season)
            
            # Add region to response
            parsed_data['region'] = region
            
            print(f"✅ Analysis successful for user {user_identifier}")
            
            # Record successful request
            rate_limiter.record_success(rate_limit_key)
            
            # If user is authenticated, check for rewards
            reward_data = None
            
            # Add user information to the response for potential future use (if authenticated)
            if current_user:
                print(f"👤 Processing rewards for authenticated user: {current_user['uid']}")
                parsed_data['analyzed_by'] = current_user['uid']
                parsed_data['user_email'] = current_user['email']

                # Award coin only for NEW invasive species scans
                try:
                    is_invasive = bool(parsed_data.get('invasiveOrNot', False))
                    species = str(parsed_data.get('specieIdentified') or '').strip()
                    print(f"🌱 Plant: {species}, Invasive: {is_invasive}")
                    
                    if is_invasive and species:
                         awarded, total_coins = rewards_manager.award_species_if_new(current_user['uid'], species)
                         parsed_data['coinAwarded'] = awarded
                         parsed_data['coins'] = total_coins
                         print(f"💰 Rewards processed. Awarded: {awarded}, Total: {total_coins}")
                    else:
                         # Return current coin count even if nothing was awarded
                         user_rewards = rewards_manager.get_user_rewards(current_user['uid'])
                         parsed_data['coinAwarded'] = False
                         parsed_data['coins'] = int(user_rewards.get('coins', 0))
                         print(f"💰 No new rewards. Current total: {parsed_data['coins']}")
                except Exception as e:
                    print(f"⚠️ Error processing rewards: {e}")
                    # Don't fail the analysis if rewards fail
                    pass
            else:
                print("👤 User is anonymous")
                parsed_data['analyzed_by'] = 'anonymous'
                parsed_data['user_email'] = 'anonymous@example.com'
            
            return parsed_data
            
        except Exception as e:
            print(f"❌ Analysis failed: {str(e)}")
            traceback.print_exc()
            raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")
            
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Server error: {str(e)}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

# Rewards endpoints
@router.get("/api/rewards")
async def get_rewards(response: Response, current_user: Dict[str, Any] = Depends(get_current_user)):
    """Get current user's rewards (coin count and awarded species list)"""
    try:
        # Prevent caching of rewards data
        response.headers["Cache-Control"] = "no-store, no-cache, must-revalidate, max-age=0"
        
        user_id = current_user['uid']
        data = rewards_manager.get_user_rewards(user_id)
        return {"coins": int(data.get('coins', 0)), "awarded_species": data.get('awarded_species', [])}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching rewards: {str(e)}")

# Map endpoints
@router.post("/api/map/markers", response_model=MapMarker)
async def create_marker(
    request: CreateMarkerRequest,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Add a new marker to the community map"""
    try:
        user_id = current_user['uid']
        user_name = current_user.get('name', 'Anonymous')
        
        marker = map_manager.add_marker(user_id, user_name, request)
        
        if marker:
            return marker
        else:
            raise HTTPException(status_code=500, detail="Failed to add marker")
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/api/map/markers", response_model=List[MapMarker])
async def get_markers(current_user: Dict[str, Any] = Depends(get_current_user_optional)):
    """Get all markers from the community map"""
    try:
        return map_manager.get_all_markers()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


