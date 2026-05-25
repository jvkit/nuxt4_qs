# -*- coding: utf-8 -*-
import os
import json
import hashlib
from pathlib import Path
from typing import Any

from openai import OpenAI

BASE_URL = os.environ.get("DEEPSEEK_BASE_URL", "https://api.deepseek.com")
API_KEY = os.environ.get("DEEPSEEK_API_KEY", "")
MODEL = "deepseek-v4-flash"

# 翻译缓存目录
CACHE_DIR = Path(__file__).parent.parent / "cache"
CACHE_DIR.mkdir(exist_ok=True)

client = OpenAI(api_key=API_KEY, base_url=BASE_URL) if API_KEY else None


def _cache_path(content_hash: str) -> Path:
    return CACHE_DIR / f"{content_hash}.json"


def _content_hash(text: str) -> str:
    return hashlib.md5(text.encode("utf-8")).hexdigest()


def _load_cache(content_hash: str) -> dict | None:
    path = _cache_path(content_hash)
    if path.exists():
        try:
            return json.loads(path.read_text(encoding="utf-8"))
        except Exception:
            return None
    return None


def _save_cache(content_hash: str, result: dict):
    _cache_path(content_hash).write_text(json.dumps(result, ensure_ascii=False), encoding="utf-8")


def translate_text(text: str, context: str = "") -> str:
    """翻译单段文本"""
    if not client:
        return ""
    if not text or not text.strip():
        return ""

    h = _content_hash(text)
    cached = _load_cache(h)
    if cached:
        return cached.get("translation", "")

    prompt = f"""You are a professional legal translator. Translate the following Chinese text into English.
Preserve all legal terminology accurately. Do not add explanations. Output only the translation.

Text:
{text}
"""
    try:
        resp = client.chat.completions.create(
            model=MODEL,
            messages=[
                {"role": "system", "content": "You are a professional legal translator."},
                {"role": "user", "content": prompt},
            ],
            temperature=0.3,
        )
        result = resp.choices[0].message.content.strip()
        _save_cache(h, {"translation": result})
        return result
    except Exception as e:
        print(f"[translate error] {e}")
        return ""


def translate_article(zh_data: dict) -> dict:
    """翻译文章 JSON 结构"""
    en = {
        "title": translate_text(zh_data.get("title", "")),
        "subtitle": translate_text(zh_data.get("subtitle", "")),
        "lead": translate_text(zh_data.get("lead", "")),
        "conclusion": translate_text(zh_data.get("conclusion", "")),
        "meta": {
            "date": zh_data.get("meta", {}).get("date", ""),
            "author": "Qingsong Law Firm",
        },
        "references": [translate_text(r) for r in zh_data.get("references", [])],
        "blocks": [],
    }

    for block in zh_data.get("blocks", []):
        b = dict(block)
        if "text" in b:
            b["text"] = translate_text(b["text"])
        if "title" in b:
            b["title"] = translate_text(b["title"])
        if "content" in b:
            b["content"] = translate_text(b["content"])
        en["blocks"].append(b)

    return en


def translate_practice_area(zh_data: dict) -> dict:
    """翻译执业领域 JSON 结构"""
    return {
        "name": translate_text(zh_data.get("name", "")),
        "overview": [translate_text(p) for p in zh_data.get("overview", [])],
        "cases": [translate_text(c) for c in zh_data.get("cases", [])],
        "services": [translate_text(s) for s in zh_data.get("services", [])],
    }


def translate_attorney(zh_data: dict) -> dict:
    """翻译律师 JSON 结构"""
    result = {
        "name_en": translate_text(zh_data.get("name", "")),
        "title_en": translate_text(zh_data.get("title", "")),
        "office_en": translate_text(zh_data.get("office", "")),
        "bio_en": translate_text(zh_data.get("bio", "")),
    }
    profile = zh_data.get("profile")
    if profile:
        result["profile_en"] = {
            "resume": translate_text(profile.get("resume", "")),
            "representative_cases": translate_text(profile.get("representative_cases", "")),
            "education": translate_text(profile.get("education", "")),
            "qualifications": translate_text(profile.get("qualifications", "")),
            "work_experience": translate_text(profile.get("work_experience", "")),
            "awards": translate_text(profile.get("awards", "")),
            "other": translate_text(profile.get("other", "")),
        }
    return result
