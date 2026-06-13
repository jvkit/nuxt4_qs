# -*- coding: utf-8 -*-
from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel
from typing import Optional

from backend.services import file_store, deepseek_translator

router = APIRouter()


class AttorneyCreate(BaseModel):
    id: int
    name: str
    title: str
    office: str
    practice_areas: list = []
    avatar: str = ""
    email: str = ""
    phone: str = ""
    bio: str = ""
    featured: bool = False
    sort_order: int = 0
    is_active: bool = True
    profile: Optional[dict] = None


def _do_translate_attorney(attorney_id: int):
    attorney = file_store.get_attorney(attorney_id)
    if not attorney:
        return
    translations = deepseek_translator.translate_attorney(attorney)
    attorney.update(translations)
    file_store.save_attorney(attorney_id, attorney)


@router.get("")
def list_attorneys():
    return file_store.list_attorneys()


@router.get("/{attorney_id}")
def get_attorney(attorney_id: int):
    attorney = file_store.get_attorney(attorney_id)
    if not attorney:
        raise HTTPException(status_code=404, detail="Attorney not found")
    return attorney


@router.post("")
def create_attorney(data: AttorneyCreate):
    if data.id == 0:
        data.id = file_store.get_next_attorney_id()
    file_store.save_attorney(data.id, data.dict())
    return {"success": True, "id": data.id}


@router.put("/{attorney_id}")
def update_attorney(attorney_id: int, data: AttorneyCreate):
    file_store.save_attorney(attorney_id, data.dict())
    return {"success": True, "id": attorney_id}


@router.delete("/{attorney_id}")
def delete_attorney(attorney_id: int):
    file_store.delete_attorney(attorney_id)
    return {"success": True}


@router.post("/{attorney_id}/translate")
def translate_attorney(attorney_id: int, background_tasks: BackgroundTasks):
    attorney = file_store.get_attorney(attorney_id)
    if not attorney:
        raise HTTPException(status_code=404, detail="Attorney not found")

    background_tasks.add_task(_do_translate_attorney, attorney_id)
    return {"success": True, "id": attorney_id, "message": "翻译中，请稍后刷新查看"}
