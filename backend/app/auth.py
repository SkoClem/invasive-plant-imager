import os
import jwt
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from fastapi import HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import firebase_admin
from firebase_admin import credentials, auth as firebase_auth
from dotenv import load_dotenv

load_dotenv()

# Initialize Firebase Admin SDK
def initialize_firebase():
    """Initialize Firebase Admin SDK with service account"""
    try:
        # Check if Firebase is already initialized
        firebase_admin.get_app()
    except ValueError:
        # Firebase not initialized, initialize it
        
        # Option 1: Using service account JSON from environment variable (for production)
        service_account_json = os.getenv('FIREBASE_SERVICE_ACCOUNT_JSON')
        if service_account_json:
            import json
            import tempfile
            # Parse the JSON string and create a temporary file
            service_account_info = json.loads(service_account_json)
            cred = credentials.Certificate(service_account_info)
            firebase_admin.initialize_app(cred)
            print("Firebase initialized with service account from environment variable")
        else:
            # Option 2: Using service account key file (for local development)
            service_account_path = os.getenv('FIREBASE_SERVICE_ACCOUNT_PATH')
            if service_account_path and os.path.exists(service_account_path):
                cred = credentials.Certificate(service_account_path)
                firebase_admin.initialize_app(cred)
                print("Firebase initialized with service account file")
            else:
                # Option 3: Using default credentials (fallback)
                try:
                    cred = credentials.ApplicationDefault()
                    firebase_admin.initialize_app(cred)
                    print("Firebase initialized with default credentials")
                except Exception as e:
                    print(f"Warning: Could not initialize Firebase Admin SDK: {e}")
                    print("Please set FIREBASE_SERVICE_ACCOUNT_JSON or FIREBASE_SERVICE_ACCOUNT_PATH")

# Initialize Firebase on module import
initialize_firebase()

# JWT Configuration
JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'your-secret-key-change-in-production')
JWT_ALGORITHM = 'HS256'
JWT_EXPIRATION_HOURS = 24

# Security scheme
security = HTTPBearer()

class AuthService:
    @staticmethod
    def verify_firebase_token(id_token: str) -> Dict[str, Any]:
        """Verify Firebase ID token and return user info"""
        try:
            # Verify the ID token with Firebase Admin SDK
            decoded_token = firebase_auth.verify_id_token(id_token)
            return {
                'uid': decoded_token['uid'],
                'email': decoded_token.get('email'),
                'name': decoded_token.get('name'),
                'picture': decoded_token.get('picture'),
                'email_verified': decoded_token.get('email_verified', False)
            }
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=f"Invalid Firebase token: {str(e)}"
            )

    @staticmethod
    def create_jwt_token(user_info: Dict[str, Any]) -> str:
        """Create JWT token for authenticated user"""
        payload = {
            'uid': user_info.get('uid'),
            'email': user_info.get('email'),
            'name': user_info.get('name'),
            'picture': user_info.get('picture'),
            'email_verified': user_info.get('email_verified', False),
            'exp': datetime.utcnow() + timedelta(hours=JWT_EXPIRATION_HOURS),
            'iat': datetime.utcnow()
        }
        
        return jwt.encode(payload, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)

    @staticmethod
    def verify_jwt_token(token: str) -> Dict[str, Any]:
        """Verify JWT token and return user info"""
        try:
            payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
            
            # Ensure all required fields are present for ProtectedResponse schema
            user_data = {
                'uid': payload.get('uid'),
                'email': payload.get('email'),
                'name': payload.get('name'),
                'picture': payload.get('picture'),
                'email_verified': payload.get('email_verified', False)
            }
            
            return user_data
        except jwt.ExpiredSignatureError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token has expired"
            )
        except jwt.InvalidTokenError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token"
            )

# Dependency to get current user from JWT token
async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> Dict[str, Any]:
    """FastAPI dependency to get current authenticated user"""
    token = credentials.credentials
    return AuthService.verify_jwt_token(token)

# Optional dependency - returns None if no token provided
async def get_current_user_optional(credentials: Optional[HTTPAuthorizationCredentials] = Depends(HTTPBearer(auto_error=False))) -> Optional[Dict[str, Any]]:
    """FastAPI dependency to get current user, returns None if not authenticated"""
    if not credentials:
        return None
    
    try:
        return AuthService.verify_jwt_token(credentials.credentials)
    except HTTPException:
        return None