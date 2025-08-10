"""
Main FastAPI application for Oracle HCM Analysis Platform.

This module serves as the entry point for the backend API server,
providing endpoints for analysis management, results retrieval, and system administration.
"""

import os
import logging
from contextlib import asynccontextmanager
from typing import Dict, Any

from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse
from fastapi.openapi.docs import get_swagger_ui_html
from fastapi.openapi.utils import get_openapi

from .api.v1.router import api_router
from .core.config import settings
from .core.database import init_db, close_db
from .core.logging import setup_logging
from .core.middleware import RequestLoggingMiddleware
from .core.exceptions import CustomHTTPException, custom_exception_handler

# Setup logging
setup_logging()
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manage application lifespan events."""
    # Startup
    logger.info("Starting Oracle HCM Analysis Platform Backend...")
    
    try:
        # Initialize database
        await init_db()
        logger.info("Database initialized successfully")
        
        # Initialize other services
        logger.info("All services initialized successfully")
        
    except Exception as e:
        logger.error(f"Failed to initialize services: {e}")
        raise
    
    yield
    
    # Shutdown
    logger.info("Shutting down Oracle HCM Analysis Platform Backend...")
    
    try:
        # Close database connections
        await close_db()
        logger.info("Database connections closed successfully")
        
        # Close other services
        logger.info("All services shut down successfully")
        
    except Exception as e:
        logger.error(f"Error during shutdown: {e}")

def create_app() -> FastAPI:
    """Create and configure the FastAPI application."""
    
    # Create FastAPI app
    app = FastAPI(
        title="Oracle HCM Analysis Platform API",
        description="""
        Comprehensive API for analyzing Oracle HCM systems at PhD-level detail.
        
        This platform provides:
        - Deep analysis of every HCM page and feature
        - Comprehensive documentation generation
        - Best practice recommendations
        - Decision-making guidance
        - Advanced search and filtering capabilities
        """,
        version="1.0.0",
        docs_url=None,  # Custom docs URL
        redoc_url="/redoc",
        openapi_url="/openapi.json",
        lifespan=lifespan
    )
    
    # Add middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.ALLOWED_HOSTS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    
    app.add_middleware(TrustedHostMiddleware, allowed_hosts=settings.ALLOWED_HOSTS)
    app.add_middleware(RequestLoggingMiddleware)
    
    # Add exception handlers
    app.add_exception_handler(CustomHTTPException, custom_exception_handler)
    app.add_exception_handler(Exception, custom_exception_handler)
    
    # Include API routes
    app.include_router(api_router, prefix="/api/v1")
    
    # Custom OpenAPI schema
    def custom_openapi():
        if app.openapi_schema:
            return app.openapi_schema
        
        openapi_schema = get_openapi(
            title="Oracle HCM Analysis Platform API",
            version="1.0.0",
            description="""
            Comprehensive API for analyzing Oracle HCM systems at PhD-level detail.
            
            ## Features
            
            ### Analysis Management
            - Start, stop, and monitor analysis sessions
            - Configure analysis parameters
            - Track analysis progress
            
            ### Results Retrieval
            - Access analyzed pages and features
            - Retrieve best practice recommendations
            - Download generated documentation
            
            ### System Administration
            - Manage system configuration
            - Monitor system health
            - User and permission management
            
            ## Authentication
            
            This API uses JWT token-based authentication. Include the token in the Authorization header:
            ```
            Authorization: Bearer <your-jwt-token>
            ```
            
            ## Rate Limiting
            
            API requests are rate-limited to ensure system stability:
            - General endpoints: 100 requests per minute
            - Analysis endpoints: 10 requests per minute
            - Export endpoints: 5 requests per minute
            """,
            routes=app.routes,
        )
        
        # Custom tags for better organization
        openapi_schema["tags"] = [
            {
                "name": "Analysis",
                "description": "Analysis management and control operations"
            },
            {
                "name": "Results",
                "description": "Retrieve analysis results and data"
            },
            {
                "name": "Documentation",
                "description": "Generate and manage documentation"
            },
            {
                "name": "Best Practices",
                "description": "Best practice recommendations and guidance"
            },
            {
                "name": "System",
                "description": "System administration and monitoring"
            },
            {
                "name": "Authentication",
                "description": "User authentication and authorization"
            }
        ]
        
        app.openapi_schema = openapi_schema
        return app.openapi_schema
    
    app.openapi = custom_openapi
    
    # Custom docs endpoint
    @app.get("/docs", include_in_schema=False)
    async def custom_swagger_ui_html():
        return get_swagger_ui_html(
            openapi_url=app.openapi_url,
            title=f"{app.title} - API Documentation",
            oauth2_redirect_url=app.swagger_ui_oauth2_redirect_url,
            swagger_js_url="/static/swagger-ui-bundle.js",
            swagger_css_url="/static/swagger-ui.css",
        )
    
    # Health check endpoint
    @app.get("/health", tags=["System"])
    async def health_check():
        """Health check endpoint for system monitoring."""
        return {
            "status": "healthy",
            "service": "Oracle HCM Analysis Platform Backend",
            "version": "1.0.0",
            "timestamp": "2024-01-01T00:00:00Z"
        }
    
    # Root endpoint
    @app.get("/", tags=["System"])
    async def root():
        """Root endpoint with API information."""
        return {
            "message": "Oracle HCM Analysis Platform API",
            "version": "1.0.0",
            "description": "Comprehensive API for analyzing Oracle HCM systems",
            "documentation": "/docs",
            "health": "/health"
        }
    
    return app

# Create the application instance
app = create_app()

if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run(
        "main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
        log_level=settings.LOG_LEVEL.lower()
    )