# -*- coding: utf-8 -*-
from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel
from typing import Any

from backend.services import file_store, deepseek_translator

router = APIRouter()


class ArticleCreate(BaseModel):
    id: int
    slug: str
    date: str
    tags: list = []
    translations: dict


def _do_translate_article(slug: str):
    article = file_store.get_article(slug)
    if not article:
        return
    zh = article.get("translations", {}).get("zh")
    if not zh:
        return
    article["translations"]["en"] = deepseek_translator.translate_article(zh)
    file_store.save_article(slug, article)


@router.get("")
def list_articles():
    return file_store.list_articles()


@router.get("/{slug}")
def get_article(slug: str):
    article = file_store.get_article(slug)
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
    return article


@router.post("")
def create_article(data: ArticleCreate):
    file_store.save_article(data.slug, data.dict())
    return {"success": True, "slug": data.slug}


@router.put("/{slug}")
def update_article(slug: str, data: ArticleCreate):
    file_store.save_article(slug, data.dict())
    return {"success": True, "slug": slug}


@router.delete("/{slug}")
def delete_article(slug: str):
    file_store.delete_article(slug)
    return {"success": True}


@router.post("/{slug}/translate")
def translate_article(slug: str, background_tasks: BackgroundTasks):
    article = file_store.get_article(slug)
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")

    zh = article.get("translations", {}).get("zh")
    if not zh:
        raise HTTPException(status_code=400, detail="No Chinese content to translate")

    background_tasks.add_task(_do_translate_article, slug)
    return {"success": True, "slug": slug, "message": "翻译中，请稍后刷新查看"}
