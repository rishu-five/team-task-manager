from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings

app = FastAPI(
    title=getattr(settings, "PROJECT_NAME", "Backend API"),
    openapi_url="/openapi.json"
)

# Safe CORS handling
cors_origins = ["*"]

try:
    if hasattr(settings, "CORS_ORIGINS") and settings.CORS_ORIGINS:
        cors_origins = [
            o.strip()
            for o in settings.CORS_ORIGINS.split(",")
            if o.strip()
        ]
except Exception:
    cors_origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Backend running"}

@app.get("/health")
async def health():
    return {"status": "healthy"}

# Import router LAST
try:
    from app.api.main import api_router
    app.include_router(api_router, prefix=settings.API_V1_STR)
except Exception as e:
    print("Router loading failed:", str(e))