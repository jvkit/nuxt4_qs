#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Word 文档转文章 JSON（单文件版）
供服务端上传接口调用。

用法：
    python scripts/word_converter.py <docx文件路径> <输出目录>
"""

import os
import re
import json
import sys
import traceback
from pathlib import Path

try:
    from docx import Document
except ImportError:
    print(json.dumps({'error': '缺少 python-docx，请执行: pip install python-docx'}))
    sys.exit(1)

CASE_RE = re.compile(r'[（(]\d{4}[）)][\u4e00-\u9fa5]{0,4}\d+[\u4e00-\u9fa5]*\d*号')
VIEWPOINT_RE = re.compile(r'^观点[一二三四五六七八九十]+[：:]')
SECTION_RE = re.compile(r'^（[一二三四五六七八九十]+）')
NUMBER_RE = re.compile(r'^\d+\.[\s\u3000]')


def get_next_id(content_dir: str) -> int:
    """获取下一个文章 ID"""
    if not os.path.exists(content_dir):
        return 1
    files = [f for f in os.listdir(content_dir) if f.endswith('.json')]
    if not files:
        return 1
    max_id = 0
    for f in files:
        try:
            with open(os.path.join(content_dir, f), 'r', encoding='utf-8') as fp:
                data = json.load(fp)
                max_id = max(max_id, data.get('id', 0))
        except Exception:
            pass
    return max_id + 1


def safe_text(text: str) -> str:
    """清理可能导致 JSON 编码失败的控制字符"""
    if not text:
        return ''
    # 移除控制字符（保留换行、制表符）
    return ''.join(c for c in text if c == '\n' or c == '\r' or c == '\t' or ord(c) >= 32)


def parse_docx(filepath: str, article_id: int) -> dict:
    """解析单个 docx 文件，返回 ArticleRaw 格式"""
    try:
        doc = Document(filepath)
    except Exception as e:
        raise ValueError(f'无法打开 Word 文件: {e}')

    # 提取所有非空段落
    paras = []
    for p in doc.paragraphs:
        text = safe_text(p.text).strip()
        if text:
            style_name = p.style.name if p.style else 'Normal'
            paras.append((style_name, text))

    if not paras:
        raise ValueError('Word 文件中没有可提取的文本内容')

    slug = Path(filepath).stem.replace(' ', '-').replace('_', '-')
    title = paras[0][1]
    subtitle = ''
    lead = ''
    blocks = []
    references = []
    conclusion = ''

    # 拆分标题和副标题
    if '——' in title:
        parts = title.split('——', 1)
        title = parts[0].strip()
        subtitle = '——' + parts[1].strip()

    i = 1
    # 摘要（lead）
    if i < len(paras) and len(paras[i][1]) > 30:
        lead = paras[i][1]
        i += 1

    while i < len(paras):
        style, text = paras[i]

        # 结语
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

        # 参考资料
        if text.startswith('参考资料') or text == '参考资料：':
            i += 1
            while i < len(paras):
                _, t = paras[i]
                references.append(t)
                i += 1
            continue

        # 观点卡片
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

        # h2：List Paragraph 作为一级标题
        if style == 'List Paragraph' and len(text) < 40 and not VIEWPOINT_RE.match(text):
            blocks.append({'type': 'h2', 'text': text})
            i += 1
            continue

        # h3 / h4
        if SECTION_RE.match(text) or (len(text) < 30 and '：' not in text and not CASE_RE.search(text)):
            blocks.append({'type': 'h3' if text.startswith('（') else 'h4', 'text': text})
            i += 1
            continue

        # 案例块
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

        # 法条块
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

        # 编号列表项
        if NUMBER_RE.match(text):
            blocks.append({'type': 'list-item', 'text': text})
            i += 1
            continue

        # 普通段落
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


def main():
    if len(sys.argv) < 3:
        print(json.dumps({'error': '参数不足: python word_converter.py <docx路径> <输出目录>'}))
        sys.exit(1)

    input_file = sys.argv[1]
    output_dir = sys.argv[2]

    if not os.path.exists(input_file):
        print(json.dumps({'error': f'文件不存在: {input_file}'}))
        sys.exit(1)

    os.makedirs(output_dir, exist_ok=True)

    try:
        article_id = get_next_id(output_dir)
        article = parse_docx(input_file, article_id)

        output_file = os.path.join(output_dir, f'{article["slug"]}.json')
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(article, f, ensure_ascii=False, indent=2)

        result = {
            'success': True,
            'slug': article['slug'],
            'id': article['id'],
            'title': article['translations']['zh']['title'],
            'blocks_count': len(article['translations']['zh']['blocks']),
            'output_file': output_file,
        }
        print(json.dumps(result, ensure_ascii=False))
    except Exception as e:
        error_info = {
            'error': str(e),
            'traceback': traceback.format_exc(),
        }
        print(json.dumps(error_info, ensure_ascii=False))
        sys.exit(1)


if __name__ == '__main__':
    main()
