# -*- coding: utf-8 -*-
import os
import json
from pathlib import Path
from typing import Any

# 项目根目录（backend 的上级）
PROJECT_ROOT = Path(__file__).parent.parent.parent

CONTENT_DIR = PROJECT_ROOT / "public" / "content"
IMAGES_DIR = PROJECT_ROOT / "public" / "images"


def _read_json(path: Path) -> Any:
    if not path.exists():
        return None
    return json.loads(path.read_text(encoding="utf-8"))


def _write_json(path: Path, data: Any):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")


# ==================== 文章 ====================
def list_articles() -> list:
    d = CONTENT_DIR / "articles"
    if not d.exists():
        return []
    articles = []
    for f in sorted(d.glob("*.json")):
        articles.append(_read_json(f))
    return articles


def get_article(slug: str) -> dict | None:
    return _read_json(CONTENT_DIR / "articles" / f"{slug}.json")


def save_article(slug: str, data: dict):
    _write_json(CONTENT_DIR / "articles" / f"{slug}.json", data)


def delete_article(slug: str):
    path = CONTENT_DIR / "articles" / f"{slug}.json"
    if path.exists():
        path.unlink()


def get_next_article_id() -> int:
    d = CONTENT_DIR / "articles"
    if not d.exists():
        return 1
    max_id = 0
    for f in d.glob("*.json"):
        data = _read_json(f)
        if data:
            max_id = max(max_id, data.get("id", 0))
    return max_id + 1


# ==================== 执业领域 ====================
def list_practice_areas() -> list:
    d = CONTENT_DIR / "practice-areas"
    if not d.exists():
        return []
    areas = []
    for f in sorted(d.glob("*.json")):
        areas.append(_read_json(f))
    return areas


def get_practice_area(slug: str) -> dict | None:
    return _read_json(CONTENT_DIR / "practice-areas" / f"{slug}.json")


def save_practice_area(slug: str, data: dict):
    _write_json(CONTENT_DIR / "practice-areas" / f"{slug}.json", data)


def delete_practice_area(slug: str):
    path = CONTENT_DIR / "practice-areas" / f"{slug}.json"
    if path.exists():
        path.unlink()


# ==================== 律师 ====================
def list_attorneys() -> list:
    d = CONTENT_DIR / "attorneys"
    if not d.exists():
        return []
    attorneys = []
    for f in sorted(d.glob("*.json")):
        attorneys.append(_read_json(f))
    return attorneys


def get_attorney(attorney_id: int) -> dict | None:
    for a in list_attorneys():
        if a.get("id") == attorney_id:
            return a
    return None


def save_attorney(attorney_id: int, data: dict):
    _write_json(CONTENT_DIR / "attorneys" / f"attorney-{attorney_id}.json", data)


def delete_attorney(attorney_id: int):
    path = CONTENT_DIR / "attorneys" / f"attorney-{attorney_id}.json"
    if path.exists():
        path.unlink()


def get_next_attorney_id() -> int:
    d = CONTENT_DIR / "attorneys"
    if not d.exists():
        return 1
    max_id = 0
    for f in d.glob("*.json"):
        data = _read_json(f)
        if data:
            max_id = max(max_id, data.get("id", 0))
    return max_id + 1
