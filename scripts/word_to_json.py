#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Word 文档转文章 JSON 工具
用法: python scripts/word_to_json.py <word文件路径> [--output <输出路径>]

支持自动识别：
- 标题层级 -> h2/h3/h4
- 法条引用 -> law
- 案例 -> case
- 观点 -> viewpoint
- 普通段落 -> p
"""

import json
import re
import sys
import argparse
from pathlib import Path

try:
    from docx import Document
except ImportError:
    print("请先安装 python-docx: pip install python-docx")
    sys.exit(1)


def detect_block_type(text: str, style_name: str) -> str:
    """根据文本内容和样式识别 block 类型"""
    style = style_name.lower()

    # 标题识别
    if 'heading 1' in style or 'heading 2' in style:
        return 'h2'
    if 'heading 3' in style:
        return 'h3'
    if 'heading' in style:
        return 'h4'

    # 法条识别：包含书名号《》且包含"条"、"款"、"项"
    if '《' in text and '》' in text and ('条' in text or '款' in text or '第' in text):
        return 'law'

    # 案例识别：包含案号格式，如 (2024)京03民终11534号
    if re.search(r'[（(]\d{4}[）)].*?号', text):
        return 'case'

    # 观点识别：以"观点"、"意见"、"认为"开头
    if re.match(r'^(观点|意见|笔者认为|我们认为|法院认为)', text.strip()):
        return 'viewpoint'

    return 'p'


def parse_word_to_blocks(doc_path: str) -> list:
    """解析 Word 文档，返回 blocks 数组"""
    doc = Document(doc_path)
    blocks = []

    for para in doc.paragraphs:
        text = para.text.strip()
        if not text:
            continue

        block_type = detect_block_type(text, para.style.name)

        if block_type == 'law':
            # 尝试分离法条标题和内容
            # 格式：《xxx》第x条 内容...
            match = re.match(r'(《[^》]+》[^。]*?)[，。；\s]*(.+)', text, re.DOTALL)
            if match:
                blocks.append({
                    'type': 'law',
                    'title': match.group(1).strip(),
                    'content': match.group(2).strip()
                })
            else:
                blocks.append({'type': 'law', 'content': text})

        elif block_type == 'case':
            # 尝试提取案号
            case_match = re.search(r'[（(]\d{4}[）)][^\s]+号', text)
            case_id = case_match.group(0) if case_match else ''
            # 去除案号后的内容为正文
            content = text
            if case_id:
                content = text.replace(case_id, '').strip('：: ')
            blocks.append({
                'type': 'case',
                'badge': '参考案例',
                'caseId': case_id,
                'content': content
            })

        elif block_type == 'viewpoint':
            # 尝试分离标题和内容
            lines = text.split('\n', 1)
            title = lines[0].strip()
            content = lines[1].strip() if len(lines) > 1 else ''
            blocks.append({
                'type': 'viewpoint',
                'title': title,
                'content': content
            })

        else:
            blocks.append({'type': block_type, 'text': text})

    return blocks


def build_article_json(
    word_path: str,
    slug: str = None,
    article_id: int = None,
    title: str = None,
    lead: str = None,
    date: str = None,
    author: str = '青颂律师事务所'
) -> dict:
    """构建完整的文章 JSON 结构"""
    path = Path(word_path)
    blocks = parse_word_to_blocks(word_path)

    # 自动推断字段
    if not slug:
        slug = path.stem.replace(' ', '-').replace('_', '-')
    if not article_id:
        article_id = 999  # 占位，需要手动修改
    if not date:
        from datetime import datetime
        date = datetime.now().strftime('%Y-%m-%d')

    # 尝试从 blocks 第一个 h2 提取标题
    if not title:
        for b in blocks:
            if b['type'] in ('h2', 'h3', 'h4'):
                title = b.get('text', '')
                break
        if not title:
            title = path.stem

    # 尝试用第一个 p 作为 lead
    if not lead:
        for b in blocks:
            if b['type'] == 'p':
                lead = b.get('text', '')[:200]
                break

    # 提取参考资料（法条名称去重）
    references = []
    ref_set = set()
    for b in blocks:
        if b['type'] == 'law' and 'title' in b:
            law_name = b['title']
            # 只保留书名号内的法典名
            m = re.search(r'《([^》]+)》', law_name)
            if m:
                law_name = '《' + m.group(1) + '》'
            if law_name not in ref_set:
                ref_set.add(law_name)
                references.append(law_name)

    return {
        'id': article_id,
        'slug': slug,
        'date': date,
        'tags': [],
        'translations': {
            'zh': {
                'title': title,
                'lead': lead or '',
                'meta': {'date': date, 'author': author},
                'blocks': blocks,
                'references': references,
                'subtitle': '',
                'conclusion': ''
            },
            'en': {
                'title': '',
                'lead': '',
                'meta': {'date': date, 'author': 'Qingsong Law Firm'},
                'blocks': [],
                'references': [],
                'subtitle': '',
                'conclusion': ''
            }
        }
    }


def main():
    parser = argparse.ArgumentParser(description='Word 转文章 JSON')
    parser.add_argument('word_file', help='Word 文件路径')
    parser.add_argument('-o', '--output', help='输出 JSON 路径（默认与 Word 同名）')
    parser.add_argument('--slug', help='文章 slug')
    parser.add_argument('--id', type=int, help='文章 ID')
    parser.add_argument('--title', help='文章标题')
    parser.add_argument('--lead', help='文章导语')
    parser.add_argument('--date', help='发布日期（YYYY-MM-DD）')
    parser.add_argument('--author', default='青颂律师事务所', help='作者')
    args = parser.parse_args()

    if not Path(args.word_file).exists():
        print(f'错误：文件不存在 {args.word_file}')
        sys.exit(1)

    article = build_article_json(
        args.word_file,
        slug=args.slug,
        article_id=args.id,
        title=args.title,
        lead=args.lead,
        date=args.date,
        author=args.author
    )

    # 确定输出路径
    if args.output:
        out_path = Path(args.output)
    else:
        out_path = Path(args.word_file).with_suffix('.json')

    with open(out_path, 'w', encoding='utf-8') as f:
        json.dump(article, f, ensure_ascii=False, indent=2)

    print(f'转换完成：{out_path.resolve()}')
    print(f'  标题：{article["translations"]["zh"]["title"]}')
    print(f'  Slug：{article["slug"]}')
    print(f'  Blocks：{len(article["translations"]["zh"]["blocks"])} 个')
    print(f'  类型分布：')
    from collections import Counter
    types = Counter(b['type'] for b in article['translations']['zh']['blocks'])
    for t, c in types.most_common():
        print(f'    {t}: {c}')
    print(f'\n提示：把生成的 JSON 放到 public/content/articles/ 目录下即可生效')


if __name__ == '__main__':
    main()
