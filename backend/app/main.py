from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import watchlist

app = FastAPI(root_path="/api")

origins = [
    "http://localhost:5173"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(watchlist.router)

@app.get("/")
def read_root():
    return {"Hello": "World"}

@app.get("/api/health")
def health_check():
    return {"status": "ok", "message": "Backend is connected"}
