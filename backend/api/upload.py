# -*- coding: utf-8 -*-
from fastapi import APIRouter, UploadFile, File, HTTPException
from pathlib import Path
import shutil
import uuid

from backend.services import file_store
from backend.services.word_parser import parse_docx

router = APIRouter()


AVATAR_DIR = Path(__file__).parent.parent.parent / "public" / "images" / "attorney" / "avatars"


@router.post("/avatar")
async def upload_avatar(file: UploadFile = File(...)):
    allowed = {"image/jpeg", "image/png", "image/webp", "image/jpg"}
    if file.content_type not in allowed:
        raise HTTPException(status_code=400, detail="Only jpg/png/webp images allowed")

    ext = Path(file.filename or "avatar.jpg").suffix
    if ext.lower() not in {".jpg", ".jpeg", ".png", ".webp"}:
        ext = ".jpg"

    filename = f"{uuid.uuid4().hex}{ext}"
    AVATAR_DIR.mkdir(parents=True, exist_ok=True)
    dest = AVATAR_DIR / filename

    with open(dest, "wb") as f:
        shutil.copyfileobj(file.file, f)

    return {"success": True, "path": f"/images/attorney/avatars/{filename}"}


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
