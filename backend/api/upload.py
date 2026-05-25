# -*- coding: utf-8 -*-
from fastapi import APIRouter, UploadFile, File, HTTPException
from pathlib import Path
import shutil

from backend.services import file_store
from backend.services.word_parser import parse_docx

router = APIRouter()


@router.post("/article")
async def upload_article_word(file: UploadFile = File(...)):
    if not file.filename.endswith(".docx"):
        raise HTTPException(status_code=400, detail="Only .docx files allowed")

    tmp_path = Path("/tmp") / file.filename
    try:
        with open(tmp_path, "wb") as f:
            shutil.copyfileobj(file.file, f)

        article = parse_docx(str(tmp_path), file_store.get_next_article_id())
        file_store.save_article(article["slug"], article)

        return {
            "success": True,
            "slug": article["slug"],
            "title": article["translations"]["zh"]["title"],
        }
    finally:
        if tmp_path.exists():
            tmp_path.unlink()
