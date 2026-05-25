# -*- coding: utf-8 -*-
import re
from docx import Document

CASE_RE = re.compile(r'[（(]\d{4}[）)][\u4e00-\u9fa5]{0,4}\d+[\u4e00-\u9fa5]*\d*号')
VIEWPOINT_RE = re.compile(r'^观点[一二三四五六七八九十]+[：:]')
SECTION_RE = re.compile(r'^（[一二三四五六七八九十]+）')
NUMBER_RE = re.compile(r'^\d+\.[\s\u3000]')


def safe_text(text: str) -> str:
    if not text:
        return ''
    return ''.join(c for c in text if c == '\n' or c == '\r' or c == '\t' or ord(c) >= 32)


def parse_docx(filepath: str, article_id: int) -> dict:
    doc = Document(filepath)
    paras = [
        (p.style.name if p.style else 'Normal', safe_text(p.text).strip())
        for p in doc.paragraphs
        if safe_text(p.text).strip()
    ]

    if not paras:
        raise ValueError('Word 文件中没有可提取的文本内容')

    from pathlib import Path
    slug = Path(filepath).stem.replace(' ', '-').replace('_', '-')
    title = paras[0][1]
    subtitle = ''
    lead = ''
    blocks = []
    references = []
    conclusion = ''

    if '——' in title:
        parts = title.split('——', 1)
        title = parts[0].strip()
        subtitle = '——' + parts[1].strip()

    i = 1
    if i < len(paras) and len(paras[i][1]) > 30:
        lead = paras[i][1]
        i += 1

    while i < len(paras):
        style, text = paras[i]

        if text == '结语' or text.startswith('四、结语'):
            i += 1
            conclusion_texts = []
            while i < len(paras):
                _, t = paras[i]
                if t.startswith('参考资料') or t == '参考资料：':
                    break
                conclusion_texts.append(t)
                i += 1
            conclusion = '\n'.join(conclusion_texts)
            continue

        if text.startswith('参考资料') or text == '参考资料：':
            i += 1
            while i < len(paras):
                _, t = paras[i]
                references.append(t)
                i += 1
            continue

        if VIEWPOINT_RE.match(text):
            blocks.append({'type': 'viewpoint', 'title': text, 'content': ''})
            i += 1
            content_parts = []
            while i < len(paras):
                s, t = paras[i]
                if s == 'List Paragraph' or VIEWPOINT_RE.match(t) or (t.startswith('（') and len(t) < 40):
                    break
                if CASE_RE.search(t):
                    break
                content_parts.append(t)
                i += 1
            if blocks:
                blocks[-1]['content'] = '\n'.join(content_parts)
            continue

        if style == 'List Paragraph' and len(text) < 40 and not VIEWPOINT_RE.match(text):
            blocks.append({'type': 'h2', 'text': text})
            i += 1
            continue

        if SECTION_RE.match(text) or (len(text) < 30 and '：' not in text and not CASE_RE.search(text)):
            blocks.append({'type': 'h3' if text.startswith('（') else 'h4', 'text': text})
            i += 1
            continue

        case_match = CASE_RE.search(text)
        if case_match:
            case_id = case_match.group(0)
            badge = '对比案例' if '对比' in text[:case_match.start()] else '参考案例'
            blocks.append({
                'type': 'case',
                'badge': badge,
                'caseId': case_id,
                'content': text,
            })
            i += 1
            continue

        if text.startswith('《') and '》' in text and len(text) < 60:
            law_title = text
            i += 1
            law_content = []
            while i < len(paras):
                s, t = paras[i]
                if s == 'List Paragraph' or (len(t) < 30 and not t.startswith('《')):
                    break
                if CASE_RE.search(t):
                    break
                law_content.append(t)
                i += 1
            blocks.append({
                'type': 'law',
                'title': law_title,
                'content': '\n'.join(law_content),
            })
            continue

        if NUMBER_RE.match(text):
            blocks.append({'type': 'list-item', 'text': text})
            i += 1
            continue

        blocks.append({'type': 'p', 'text': text})
        i += 1

    return {
        'id': article_id,
        'slug': slug,
        'date': '2024-01-01',
        'tags': [],
        'translations': {
            'zh': {
                'title': title,
                'subtitle': subtitle,
                'lead': lead,
                'meta': {'date': '2024-01-01', 'author': '青颂律师事务所'},
                'blocks': blocks,
                'references': references,
                'conclusion': conclusion,
            },
            'en': {
                'title': '',
                'subtitle': '',
                'lead': '',
                'meta': {'date': '2024-01-01', 'author': 'Qingsong Law Firm'},
                'blocks': [],
                'references': [],
                'conclusion': '',
            }
        }
    }
