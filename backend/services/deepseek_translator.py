# -*- coding: utf-8 -*-
import os
import json
import hashlib
import re
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


def _translate_batch(texts: list[str]) -> list[str]:
    """批量翻译文本列表，一次性调用 API"""
    if not client:
        return [""] * len(texts)
    if not texts:
        return []

    # 过滤空文本，保留索引映射
    indexed = [(i, t) for i, t in enumerate(texts) if t and t.strip()]
    if not indexed:
        return [""] * len(texts)

    # 构建带编号的 prompt
    lines = "\n".join([f"{idx + 1}. {t}" for idx, (_, t) in enumerate(indexed)])
    prompt = f"""You are a professional legal translator. Translate each numbered Chinese text into English.
Preserve all legal terminology accurately. Output ONLY the numbered translations, one per line, keeping the same numbering.
Do not add explanations, do not merge lines.

{lines}
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
        raw = resp.choices[0].message.content.strip()
        # 解析返回的编号列表
        results = [""] * len(texts)
        for m in re.finditer(r"^\s*(\d+)\.\s*(.*)$", raw, re.MULTILINE):
            num = int(m.group(1)) - 1
            if 0 <= num < len(indexed):
                orig_idx = indexed[num][0]
                results[orig_idx] = m.group(2).strip()
        return results
    except Exception as e:
        print(f"[batch translate error] {e}")
        return [""] * len(texts)


def _batch_translate_list(texts: list[str], batch_size: int = 100) -> list[str]:
    """分批翻译长列表"""
    results = []
    for i in range(0, len(texts), batch_size):
        batch = texts[i:i + batch_size]
        results.extend(_translate_batch(batch))
    return results


def translate_article(zh_data: dict) -> dict:
    """翻译文章 JSON 结构（批量翻译，避免逐段超时）"""
    # 收集所有需要翻译的文本片段
    texts = []
    mapping = []  # (field_path, key_or_index)

    def add(text: str, path: str, key: Any = None):
        if text and text.strip():
            texts.append(text)
            mapping.append((path, key))

    add(zh_data.get("title", ""), "title", None)
    add(zh_data.get("subtitle", ""), "subtitle", None)
    add(zh_data.get("lead", ""), "lead", None)
    add(zh_data.get("conclusion", ""), "conclusion", None)

    for idx, ref in enumerate(zh_data.get("references", [])):
        add(ref, "references", idx)

    block_texts = []
    block_keys = []  # (block_idx, field_name)
    for bidx, block in enumerate(zh_data.get("blocks", [])):
        for field in ("text", "title", "content"):
            val = block.get(field, "")
            if val and val.strip():
                block_texts.append(val)
                block_keys.append((bidx, field))

    # 分批翻译（每批 80 段，避免 prompt 过长）
    all_texts = texts + block_texts
    all_translations = _batch_translate_list(all_texts, batch_size=80)

    # 映射回结构
    text_results = all_translations[:len(texts)]
    block_results = all_translations[len(texts):]

    en = {
        "title": "",
        "subtitle": "",
        "lead": "",
        "conclusion": "",
        "meta": {
            "date": zh_data.get("meta", {}).get("date", ""),
            "author": "Qingsong Law Firm",
        },
        "references": [],
        "blocks": [],
    }

    # 映射简单字段
    for (path, key), trans in zip(mapping, text_results):
        if path == "title":
            en["title"] = trans
        elif path == "subtitle":
            en["subtitle"] = trans
        elif path == "lead":
            en["lead"] = trans
        elif path == "conclusion":
            en["conclusion"] = trans
        elif path == "references":
            while len(en["references"]) <= key:
                en["references"].append("")
            en["references"][key] = trans

    # 映射 blocks
    for bidx, block in enumerate(zh_data.get("blocks", [])):
        b = dict(block)
        en["blocks"].append(b)

    for (bidx, field), trans in zip(block_keys, block_results):
        if bidx < len(en["blocks"]):
            en["blocks"][bidx][field] = trans

    return en


def translate_practice_area(zh_data: dict) -> dict:
    """翻译执业领域 JSON 结构（批量翻译）"""
    texts = []
    texts.append(zh_data.get("name", ""))
    texts.extend(zh_data.get("overview", []))
    texts.extend(zh_data.get("cases", []))
    texts.extend(zh_data.get("services", []))

    results = _batch_translate_list(texts, batch_size=50)

    name = results[0] if results else ""
    overview = results[1:1 + len(zh_data.get("overview", []))]
    cases = results[1 + len(zh_data.get("overview", [])):1 + len(zh_data.get("overview", [])) + len(zh_data.get("cases", []))]
    services = results[1 + len(zh_data.get("overview", [])) + len(zh_data.get("cases", [])):]

    return {
        "name": name,
        "overview": overview,
        "cases": cases,
        "services": services,
    }


def translate_attorney(zh_data: dict) -> dict:
    """翻译律师 JSON 结构（批量翻译）"""
    texts = [
        zh_data.get("name", ""),
        zh_data.get("title", ""),
        zh_data.get("office", ""),
        zh_data.get("bio", ""),
    ]
    profile = zh_data.get("profile") or {}
    profile_fields = ["resume", "representative_cases", "education", "qualifications", "work_experience", "awards", "other"]
    for f in profile_fields:
        texts.append(profile.get(f, ""))

    results = _batch_translate_list(texts, batch_size=50)

    result = {
        "name_en": results[0] if len(results) > 0 else "",
        "title_en": results[1] if len(results) > 1 else "",
        "office_en": results[2] if len(results) > 2 else "",
        "bio_en": results[3] if len(results) > 3 else "",
    }

    if profile:
        result["profile_en"] = {}
        for i, f in enumerate(profile_fields):
            idx = 4 + i
            if idx < len(results):
                result["profile_en"][f] = results[idx]

    return result
