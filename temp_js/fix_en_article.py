import json

def fix_json_string(content):
    """修复译文文件中的JSON格式问题"""
    result = []
    i = 0
    in_string = False
    escape = False

    while i < len(content):
        ch = content[i]

        if escape:
            # 处理转义序列
            if ch == 'N':
                # \N -> \n
                result.append('n')
            else:
                result.append(ch)
            escape = False
            i += 1
            continue

        if ch == '\\' and in_string:
            escape = True
            result.append(ch)
            i += 1
            continue

        if ch == '"':
            if not in_string:
                # 字符串开始
                in_string = True
                result.append(ch)
            else:
                # 字符串内部的双引号 — 需要检查是否是合法的字符串结束
                # 简单策略：如果在字符串内部遇到双引号，且下一个非空白字符是 , : } ] 或换行
                # 则认为是字符串结束；否则是未转义的内部引号
                j = i + 1
                while j < len(content) and content[j] in ' \t\r\n':
                    j += 1
                if j < len(content) and content[j] in ',:}\]]':
                    # 字符串结束
                    in_string = False
                    result.append(ch)
                else:
                    # 未转义的内部引号，需要转义
                    result.append('\\"')
            i += 1
            continue

        result.append(ch)
        i += 1

    return ''.join(result)


with open('D:/allother/豆包下载/image/im2/译文_article.txt', 'r', encoding='utf-8') as f:
    raw = f.read()

fixed = fix_json_string(raw)

# 尝试解析
try:
    data = json.loads(fixed)
    print(f'成功解析，文章数: {len(data)}')
except json.JSONDecodeError as e:
    print(f'JSON Error: {e}')
    pos = e.pos
    print(f'Near error: {repr(fixed[max(0,pos-80):pos+80])}')
    exit(1)

# 读取项目 articles.json
with open('app/pages/article/articles.json', 'r', encoding='utf-8') as f:
    articles = json.load(f)

print(f'项目文章数: {len(articles)}')

# 检查字段名差异
for i, a in enumerate(data):
    zh = a.get('translations', {}).get('zh', {})
    print(f'Article {i+1} zh keys: {list(zh.keys())}')
    blocks = zh.get('blocks', [])
    if blocks:
        print(f'  Block 0 keys: {list(blocks[0].keys())}')
        print(f'  Block 0 sample: {json.dumps(blocks[0], ensure_ascii=False)[:120]}')
    break
