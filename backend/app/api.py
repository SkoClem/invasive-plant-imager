from typing import Dict, Any
from fastapi import APIRouter, HTTPException, UploadFile, File, Form, Depends, Request
from fastapi.responses import Response
from app.schemas import Message, PlantAnalysisRequest, PlantAnalysisResponse, FirebaseLoginRequest, LoginResponse, ProtectedResponse, SaveCollectionRequest, UserCollectionResponse, DeleteCollectionItemRequest
from app.backend import Imager
from app.auth import AuthService, get_current_user, get_current_user_optional
from app.collections import collection_manager
from app.image_storage import image_storage
from app.rate_limiter import rate_limiter
from app.rewards import rewards_manager

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
        
        # Inject image URLs for each item
        for item in collection:
            if isinstance(item, dict):
                image_id = item.get('id')
                if image_id:
                    # Get signed URL if available (Cloud Storage), or None (Local)
                    url = image_storage.get_image_url(user_id, image_id)
                    if url:
                        item['image_url'] = url
                    else:
                        # Fallback for local storage: construct full API URL
                        base_url = str(request.base_url).rstrip('/')
                        item['image_url'] = f"{base_url}/api/images/{image_id}"
        
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
            # Also delete any associated stored image to fully remove user ties
            try:
                image_storage.delete_image(user_id, request.item_id)
            except Exception:
                # Swallow errors to ensure collection deletion response remains successful
                pass
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
        # Also clear all stored images
        try:
            image_storage.clear_user_images(user_id)
        except Exception:
            pass
        
        if success:
            return {"message": "Collection cleared successfully", "success": True}
        else:
            raise HTTPException(status_code=500, detail="Failed to clear collection")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

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
    request: Request,
    image: UploadFile = File(...),
    region: str = Form("Texas"),  # Default to Texas, but will be overridden
    current_user: Dict[str, Any] = Depends(get_current_user_optional)
):
    """Analyze plant image for Texas invasive species detection - authentication optional"""
    # Always use Texas as the region for analysis
    texas_region = "Texas"
    user_identifier = current_user.get('email') if current_user else 'anonymous'
    client_ip = request.client.host if request.client else "unknown"
    
    print(f"Plant analysis request received from user: {user_identifier} for region: {texas_region}")

    # Rate limiting check
    rate_limit_key = rate_limiter.get_rate_limit_key(user_identifier, client_ip)
    
    try:
        # Check rate limits before processing
        rate_limiter.check_rate_limit(rate_limit_key)
        
        # Validate image file
        if not image.content_type.startswith("image/"):
            raise HTTPException(status_code=400, detail="File must be an image")

        # Always set region to Texas for analysis
        imager.set_region(texas_region)

        # Convert uploaded file to base64
        image_data = await image.read()
        import base64
        base64_image = base64.b64encode(image_data).decode('utf-8')

        # Analyze the image
        try:
            parsed_data = imager.analyze_plant_image(base64_image)
            
            # Record successful request
            rate_limiter.record_success(rate_limit_key)
            
            # Add user information to the response for potential future use (if authenticated)
            if current_user:
                parsed_data['analyzed_by'] = current_user['uid']
                parsed_data['user_email'] = current_user['email']

                # Award coin only for NEW invasive species scans
                try:
                    is_invasive = bool(parsed_data.get('invasiveOrNot', False))
                    species = str(parsed_data.get('specieIdentified') or '').strip()
                    if is_invasive and species:
                        awarded, total_coins = rewards_manager.award_species_if_new(current_user['uid'], species)
                        parsed_data['coinAwarded'] = awarded
                        parsed_data['coins'] = total_coins
                    else:
                        # Return current coin count even if nothing was awarded
                        user_rewards = rewards_manager.get_user_rewards(current_user['uid'])
                        parsed_data['coinAwarded'] = False
                        parsed_data['coins'] = int(user_rewards.get('coins', 0))
                except Exception as e:
                    # Non-fatal: do not block analysis response on rewards errors
                    parsed_data['coinAwarded'] = False
                    parsed_data['coins'] = 0
                    print(f"Rewards processing error: {e}")
            else:
                parsed_data['analyzed_by'] = 'anonymous'
                parsed_data['user_email'] = 'anonymous@example.com'
            
            return parsed_data
            
        except Exception as analysis_error:
            # Record failure for rate limiting
            rate_limiter.record_failure(rate_limit_key)
            print(f"❌ Plant analysis failed for user {user_identifier}: {str(analysis_error)}")
            raise HTTPException(
                status_code=500, 
                detail=f"Plant analysis failed: {str(analysis_error)}"
            )

    except HTTPException:
        # Re-raise HTTP exceptions (like rate limiting)
        raise
    except Exception as e:
        # Record failure for any other unexpected errors
        rate_limiter.record_failure(rate_limit_key)
        print(f"❌ Unexpected error in plant analysis for user {user_identifier}: {str(e)}")
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

# Image storage endpoints
@router.post("/api/images/upload")
async def upload_image(
    image_id: str = Form(...),
    image: UploadFile = File(...),
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Upload and store an image for the authenticated user"""
    try:
        user_id = current_user['uid']
        
        # Read image data
        image_data = await image.read()
        
        # Store the image
        success = image_storage.store_image(
            user_id=user_id,
            image_id=image_id,
            image_data=image_data,
            filename=image.filename or f"{image_id}.jpg",
            content_type=image.content_type or "image/jpeg"
        )
        
        if success:
            return {"message": "Image uploaded successfully", "success": True, "image_id": image_id}
        else:
            raise HTTPException(status_code=500, detail="Failed to store image")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error uploading image: {str(e)}")

@router.get("/api/images/{image_id}")
async def get_image(
    image_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Retrieve an image for the authenticated user"""
    try:
        user_id = current_user['uid']
        
        image_info = image_storage.get_image(user_id, image_id)
        
        if not image_info:
            raise HTTPException(status_code=404, detail="Image not found")
        
        return Response(
            content=image_info['data'],
            media_type=image_info['content_type'],
            headers={
                "Content-Disposition": f"inline; filename={image_info['filename']}",
                # Cache short-term to reduce repeated fetch latency
                "Cache-Control": "public, max-age=300"
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving image: {str(e)}")

@router.delete("/api/images/{image_id}")
async def delete_image(
    image_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Delete an image for the authenticated user"""
    try:
        user_id = current_user['uid']
        
        success = image_storage.delete_image(user_id, image_id)
        
        if success:
            return {"message": "Image deleted successfully", "success": True}
        else:
            raise HTTPException(status_code=404, detail="Image not found")
            
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting image: {str(e)}")

@router.delete("/api/images")
async def clear_images(current_user: Dict[str, Any] = Depends(get_current_user)):
    """Delete all stored images for the authenticated user"""
    try:
        user_id = current_user['uid']
        success = image_storage.clear_user_images(user_id)
        if success:
            return {"message": "All images deleted successfully", "success": True}
        else:
            raise HTTPException(status_code=500, detail="Failed to delete user images")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error clearing images: {str(e)}")

@router.get("/api/images")
async def list_user_images(current_user: Dict[str, Any] = Depends(get_current_user)):
    """List all images for the authenticated user (metadata only)"""
    try:
        user_id = current_user['uid']
        
        images = image_storage.get_user_image_list(user_id)
        
        return {"images": images, "total": len(images)}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error listing images: {str(e)}")
