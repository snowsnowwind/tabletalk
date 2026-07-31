"""
TableTalk Backend - FastAPI Application Entry Point
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import get_settings
from .database import init_db
from .routers import (
    auth_router,
    restaurants_router,
    reservations_router,
    events_router,
    ai_router
)

settings = get_settings()

# Create FastAPI app
app = FastAPI(
    title="TableTalk API",
    description="AI-Powered Restaurant Reservation & Event Planning System",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS middleware - allow frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
        "https://penological-literalistic-inger.ngrok-free.dev",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_router)
app.include_router(restaurants_router)
app.include_router(reservations_router)
app.include_router(events_router)
app.include_router(ai_router)


@app.on_event("startup")
async def startup_event():
    """Initialize database on startup"""
    init_db()
    print("Database initialized")
    print(f"API docs available at http://localhost:{settings.port}/docs")


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "name": "TableTalk API",
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}


# App init file
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host=settings.host,
        port=settings.port,
        reload=settings.debug
    )
