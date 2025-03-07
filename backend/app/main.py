from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers import subway

app = FastAPI(
    title="NYC Subway Live API",
    description="Real-time NYC Subway Data API",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(subway.router)

@app.get("/")
async def root():
    """
    Root endpoint to verify API is running
    """
    return {
        "status": "online",
        "message": "NYC Subway Live API is running"
    }

@app.get("/health")
async def health_check():
    """
    Health check endpoint
    """
    return {
        "status": "healthy",
        "service": "NYC Subway Live API"
    } 