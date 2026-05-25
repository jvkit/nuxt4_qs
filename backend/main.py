# -*- coding: utf-8 -*-
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.api import articles, practice_areas, attorneys, upload

app = FastAPI(title="QSong Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(articles.router, prefix="/api/articles", tags=["articles"])
app.include_router(practice_areas.router, prefix="/api/practice-areas", tags=["practice-areas"])
app.include_router(attorneys.router, prefix="/api/attorneys", tags=["attorneys"])
app.include_router(upload.router, prefix="/api/upload", tags=["upload"])


@app.get("/health")
def health():
    return {"status": "ok"}
