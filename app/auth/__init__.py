"""
Firebase Authentication Middleware for FastAPI.
Handles JWT token verification and user authentication.
"""

import os
import json
import logging
from typing import Optional, Dict, Any
from functools import wraps

import firebase_admin
from firebase_admin import auth, credentials
from fastapi import HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

# Configure logging
logger = logging.getLogger(__name__)

# Initialize Firebase Admin SDK
try:
    # Try to get Firebase credentials from environment variable
    firebase_creds = os.getenv('FIREBASE_ADMIN_CREDENTIALS')

    if firebase_creds:
        # If credentials are provided as JSON string
        cred_dict = json.loads(firebase_creds)
        cred = credentials.Certificate(cred_dict)
    else:
        # Try to use default credentials or service account file
        cred_path = os.getenv('FIREBASE_SERVICE_ACCOUNT_PATH')
        if cred_path and os.path.exists(cred_path):
            cred = credentials.Certificate(cred_path)
        else:
            # Use Application Default Credentials (for development)
            cred = credentials.ApplicationDefault()

    # Initialize app only if not already initialized
    if not firebase_admin._apps:
        firebase_admin.initialize_app(cred)

    logger.info("Firebase Admin SDK initialized successfully")
except Exception as e:
    logger.warning(f"Firebase Admin SDK initialization failed: {e}")
    logger.warning("Authentication will be disabled in this session")


class FirebaseAuthMiddleware:
    """Firebase Authentication middleware for FastAPI."""

    def __init__(self):
        """Initialize the authentication middleware."""
        self.security = HTTPBearer(auto_error=False)
        self._auth_enabled = bool(firebase_admin._apps)

    def verify_token(self, token: str) -> Optional[Dict[str, Any]]:
        """
        Verify Firebase ID token.

        Args:
            token: The Firebase ID token to verify

        Returns:
            Decoded token claims if valid, None otherwise
        """
        if not self._auth_enabled:
            logger.warning("Authentication is disabled - token verification skipped")
            # Return mock user for development when auth is disabled
            return {
                'uid': 'demo-user',
                'email': 'demo@example.com',
                'email_verified': True
            }

        try:
            # Verify the ID token
            decoded_token = auth.verify_id_token(token)
            logger.info(f"Token verified for user: {decoded_token.get('uid')}")
            return decoded_token
        except auth.ExpiredIdTokenError:
            logger.error("Token has expired")
            return None
        except auth.InvalidIdTokenError as e:
            logger.error(f"Invalid token: {e}")
            return None
        except Exception as e:
            logger.error(f"Token verification failed: {e}")
            return None

    def get_user_info(self, uid: str) -> Optional[Dict[str, Any]]:
        """
        Get user information from Firebase.

        Args:
            uid: User ID

        Returns:
            User information if found, None otherwise
        """
        if not self._auth_enabled:
            logger.warning("Authentication is disabled - returning mock user")
            return {
                'uid': uid,
                'email': 'demo@example.com',
                'display_name': 'Demo User',
                'email_verified': True
            }

        try:
            user = auth.get_user(uid)
            return {
                'uid': user.uid,
                'email': user.email,
                'display_name': user.display_name,
                'email_verified': user.email_verified,
                'phone_number': user.phone_number,
                'photo_url': user.photo_url,
                'disabled': user.disabled
            }
        except Exception as e:
            logger.error(f"Failed to get user info: {e}")
            return None

    async def authenticate(
        self,
        credentials: Optional[HTTPAuthorizationCredentials] = None
    ) -> Dict[str, Any]:
        """
        Authenticate request using Bearer token.

        Args:
            credentials: HTTP Authorization credentials

        Returns:
            User information from decoded token

        Raises:
            HTTPException: If authentication fails
        """
        if not credentials or not credentials.credentials:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Missing authentication token",
                headers={"WWW-Authenticate": "Bearer"}
            )

        token_claims = self.verify_token(credentials.credentials)

        if not token_claims:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired token",
                headers={"WWW-Authenticate": "Bearer"}
            )

        return token_claims

    def optional_authenticate(
        self,
        credentials: Optional[HTTPAuthorizationCredentials] = None
    ) -> Optional[Dict[str, Any]]:
        """
        Optional authentication - doesn't raise exception if no token.

        Args:
            credentials: HTTP Authorization credentials

        Returns:
            User information if authenticated, None otherwise
        """
        if not credentials or not credentials.credentials:
            return None

        return self.verify_token(credentials.credentials)

    def websocket_authenticate(self, token: Optional[str]) -> Optional[Dict[str, Any]]:
        """
        Authenticate WebSocket connection.

        Args:
            token: Firebase ID token from query parameter or header

        Returns:
            User information if authenticated, None otherwise
        """
        if not token:
            logger.warning("No token provided for WebSocket authentication")
            return None

        token_claims = self.verify_token(token)

        if not token_claims:
            logger.error("WebSocket authentication failed - invalid token")
            return None

        logger.info(f"WebSocket authenticated for user: {token_claims.get('uid')}")
        return token_claims


# Create a singleton instance
firebase_auth = FirebaseAuthMiddleware()


# Dependency injection functions for FastAPI
async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(HTTPBearer())
) -> Dict[str, Any]:
    """
    FastAPI dependency to get current authenticated user.

    Args:
        credentials: Bearer token from Authorization header

    Returns:
        Authenticated user information

    Raises:
        HTTPException: If authentication fails
    """
    return await firebase_auth.authenticate(credentials)


async def get_optional_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(
        HTTPBearer(auto_error=False)
    )
) -> Optional[Dict[str, Any]]:
    """
    FastAPI dependency for optional authentication.

    Args:
        credentials: Optional Bearer token

    Returns:
        User information if authenticated, None otherwise
    """
    return firebase_auth.optional_authenticate(credentials)


def require_auth(func):
    """
    Decorator to require authentication for a route.

    Usage:
        @app.get("/protected")
        @require_auth
        async def protected_route(user: Dict = Depends(get_current_user)):
            return {"message": f"Hello {user['email']}"}
    """
    @wraps(func)
    async def wrapper(*args, **kwargs):
        return await func(*args, **kwargs)
    return wrapper