# -*- coding: utf-8 -*-
from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel

from backend.services import file_store, deepseek_translator

router = APIRouter()


class PracticeAreaCreate(BaseModel):
    slug: str
    translations: dict


def _do_translate_practice_area(slug: str):
    area = file_store.get_practice_area(slug)
    if not area:
        return
    zh = area.get("translations", {}).get("zh")
    if not zh:
        return
    area["translations"]["en"] = deepseek_translator.translate_practice_area(zh)
    file_store.save_practice_area(slug, area)


@router.get("")
def list_practice_areas():
    return file_store.list_practice_areas()


@router.get("/{slug}")
def get_practice_area(slug: str):
    area = file_store.get_practice_area(slug)
    if not area:
        raise HTTPException(status_code=404, detail="Practice area not found")
    return area


@router.post("")
def create_practice_area(data: PracticeAreaCreate):
    file_store.save_practice_area(data.slug, data.dict())
    return {"success": True, "slug": data.slug}


@router.put("/{slug}")
def update_practice_area(slug: str, data: PracticeAreaCreate):
    file_store.save_practice_area(slug, data.dict())
    return {"success": True, "slug": slug}


@router.delete("/{slug}")
def delete_practice_area(slug: str):
    file_store.delete_practice_area(slug)
    return {"success": True}


@router.post("/{slug}/translate")
def translate_practice_area(slug: str, background_tasks: BackgroundTasks):
    area = file_store.get_practice_area(slug)
    if not area:
        raise HTTPException(status_code=404, detail="Practice area not found")

    zh = area.get("translations", {}).get("zh")
    if not zh:
        raise HTTPException(status_code=400, detail="No Chinese content to translate")

    background_tasks.add_task(_do_translate_practice_area, slug)
    return {"success": True, "slug": slug, "message": "翻译中，请稍后刷新查看"}
