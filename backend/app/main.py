from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Safe config import
try:
    from app.core.config import settings

    PROJECT_NAME = getattr(settings, "PROJECT_NAME", "Team Task Manager API")
    API_V1_STR = getattr(settings, "API_V1_STR", "/api/v1")
    CORS_ORIGINS = getattr(settings, "CORS_ORIGINS", "*")

except Exception as e:
    print("Settings loading failed:", str(e))

    PROJECT_NAME = "Team Task Manager API"
    API_V1_STR = "/api/v1"
    CORS_ORIGINS = "*"

# Create FastAPI app
app = FastAPI(
    title=PROJECT_NAME,
    version="1.0.0",
    openapi_url="/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Safe CORS handling
cors_origins = ["*"]

try:
    if isinstance(CORS_ORIGINS, str):
        cors_origins = [
            origin.strip()
            for origin in CORS_ORIGINS.split(",")
            if origin.strip()
        ]

    elif isinstance(CORS_ORIGINS, list):
        cors_origins = CORS_ORIGINS

except Exception as e:
    print("CORS parsing failed:", str(e))
    cors_origins = ["*"]

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Root endpoint
@app.get("/")
async def root():
    return {
        "message": "Backend running successfully",
        "service": PROJECT_NAME,
        "status": "online"
    }

# Healthcheck endpoint
@app.get("/health")
async def health():
    return {
        "status": "healthy"
    }

# Test endpoint
@app.get("/test")
async def test():
    return {
        "success": True,
        "message": "API working correctly"
    }

# Load API routers safely
try:
    from app.api.main import api_router

    app.include_router(
        api_router,
        prefix=API_V1_STR
    )

    print("API routers loaded successfully")

except Exception as e:
    print("Router loading failed:", str(e))