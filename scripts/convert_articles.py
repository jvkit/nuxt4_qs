#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
convert_articles.py
===================
将 docx 法律文章批量转换为结构化 JSON，输出到 public/content/articles/ 目录。

用法：
    python scripts/convert_articles.py <docx文件夹路径>

输出：
    public/content/articles/article-xxx.json

依赖：
    pip install python-docx
"""

import os
import re
import json
import sys
from pathlib import Path

try:
    from docx import Document
except ImportError:
    print('请先安装 python-docx：pip install python-docx')
    sys.exit(1)

# ==================== 配置 ====================
# 默认输出目录（每篇文章一个独立 JSON）
OUTPUT_DIR = Path(__file__).parent.parent / 'public' / 'content' / 'articles'
# ==============================================

CASE_RE = re.compile(r'[（(]\d{4}[）)][\u4e00-\u9fa5]{0,4}\d+[\u4e00-\u9fa5]*\d*号')
VIEWPOINT_RE = re.compile(r'^观点[一二三四五六七八九十]+[：:]')
SECTION_RE = re.compile(r'^（[一二三四五六七八九十]+）')
NUMBER_RE = re.compile(r'^\d+\.[\s\u3000]')


def parse_docx(filepath: str, idx: int) -> dict:
    """解析单个 docx 文件，返回 ArticleRaw 格式"""
    doc = Document(filepath)
    paras = [
        (p.style.name if p.style else 'Normal', p.text.strip())
        for p in doc.paragraphs
        if p.text.strip()
    ]

    slug = f'article-{idx + 1:03d}'
    title = paras[0][1] if paras else ''
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

    # 返回 ArticleRaw 格式
    return {
        'id': idx + 1,
        'slug': slug,
        'date': '2024-01-01',  # 默认日期，建议手动修改
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
    if len(sys.argv) < 2:
        print('用法：python scripts/convert_articles.py <docx文件夹路径>')
        sys.exit(1)

    folder = sys.argv[1]
    if not os.path.isdir(folder):
        print(f'错误：目录不存在 {folder}')
        sys.exit(1)

    files = sorted([f for f in os.listdir(folder) if f.endswith('.docx')])
    if not files:
        print(f'未找到 docx 文件：{folder}')
        return

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    print(f'找到 {len(files)} 个 docx 文件，开始转换...\n')

    for idx, filename in enumerate(files):
        filepath = os.path.join(folder, filename)
        article = parse_docx(filepath, idx)
        out_file = OUTPUT_DIR / f'{article["slug"]}.json'

        with open(out_file, 'w', encoding='utf-8') as f:
            json.dump(article, f, ensure_ascii=False, indent=2)

        print(f'[{idx + 1:02d}] {article["slug"]} -> {out_file.name}')
        print(f'      标题：{article["translations"]["zh"]["title"][:50]}')
        print(f'      Blocks：{len(article["translations"]["zh"]["blocks"])} 个')

    print(f'\n转换完成！文件保存在：{OUTPUT_DIR.resolve()}')
    print('提示：新文章已生效，无需重新构建。英文翻译需手动补充。')


if __name__ == '__main__':
    main()
