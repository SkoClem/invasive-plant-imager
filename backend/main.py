# main.py

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.api import router
from app.plant_classifier import load_model

app = FastAPI()

@app.on_event("startup")
async def startup_event():
    load_model()

# MUST BE CHANGED DURING PRODUCTION
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,  # must be False if using "*" for origins
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=600,
)

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"detail": str(exc)},
        headers={"Access-Control-Allow-Origin": "*"}
    )

@app.get("/")
async def root():
    """Root endpoint to confirm the API is running"""
    return {
        "message": "Plant Imager Backend API is running",
        "status": "healthy",
        "version": "1.0.0",
        "endpoints": {
            "authentication": "/api/auth/login",
            "plant_analysis": "/api/analyze-plant",
            "chat": "/api/chat",
            "collections": "/api/collections"
        }
    }

app.include_router(router)