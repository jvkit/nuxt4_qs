import json
import re

# Read original articles.json
with open('D:/treasure/job/QSong_new/qsong_nuxt/app/pages/article/articles.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

# Get article-004 zh structure
article4 = None
for article in data:
    if article['id'] == 4:
        article4 = article
        break

zh = article4['translations']['zh']
zh_blocks = zh['blocks']
print(f'ZH blocks: {len(zh_blocks)}')

# Read translation file
with open('D:/allother/豆包下载/image/im2/译文_article.txt', 'r', encoding='utf-8') as f:
    content = f.read()

# Extract article-004 section
section_match = re.search(r'\{\s*"id":\s*4.*?(?=\{\s*"id":\s*5)', content, re.DOTALL)
section = section_match.group(0)

# Extract top-level fields
def extract_field(text, field_pattern):
    pattern = r'"' + field_pattern + r'":\s*"(.*?)"\s*(?:,|\})'
    match = re.search(pattern, text, re.DOTALL)
    if match:
        return match.group(1)
    return None

title = extract_field(section, '[Tt]itle')
lead = extract_field(section, '[Ll]ead')
subtitle = extract_field(section, '[Ss]ubtitle')
conclusion = extract_field(section, '[Cc]onclusion')

print(f'Title found: {title is not None}')
print(f'Lead found: {lead is not None}')
print(f'Subtitle found: {subtitle is not None}')
print(f'Conclusion found: {conclusion is not None}')

# Extract blocks array
blocks_match = re.search(r'"[Bb]locks":\s*(\[.*?\]),\s*"[Rr]eferences"', section, re.DOTALL)
blocks_str = blocks_match.group(1)

# Split into raw blocks using brace counting
blocks_raw = []
i = 0
while i < len(blocks_str):
    if blocks_str[i] == '{':
        depth = 1
        j = i + 1
        while j < len(blocks_str) and depth > 0:
            if blocks_str[j] == '{':
                depth += 1
            elif blocks_str[j] == '}':
                depth -= 1
            j += 1
        if depth == 0:
            blocks_raw.append(blocks_str[i:j])
        i = j
    else:
        i += 1

print(f'Found {len(blocks_raw)} raw blocks')

# Parse each block
en_blocks = []
for idx, block_text in enumerate(blocks_raw):
    # Extract type
    type_match = re.search(r'"type":\s*"([^"]+)"', block_text)
    block_type = type_match.group(1) if type_match else 'p'
    
    # Extract text
    text_start_match = re.search(r'"Text":\s*"', block_text)
    if text_start_match:
        text_start = text_start_match.end()
        # Find the delimiter before closing brace
        # The block ends with either "\n} or �\n} or similar
        # Search backwards from just before the final }
        text_end = len(block_text) - 1
        # Skip whitespace and newline before }
        while text_end > text_start and block_text[text_end - 1] in ' \t\n\r':
            text_end -= 1
        # Now text_end points to the char before whitespace, which should be " or �
        # Go back to find the actual end of text
        # The pattern is: text..."\n} or text...�\n}
        # We want everything from text_start to just before the closing quote-like char
        if text_end > text_start:
            # Check if the char at text_end-1 is part of the text or the delimiter
            # Actually, let's just extract from text_start to the position before the last non-text char
            # Look for the last " in the block
            last_quote = -1
            for k in range(len(block_text) - 1, text_start, -1):
                if block_text[k] == '"' and (k == 0 or block_text[k-1] != '\\'):
                    last_quote = k
                    break
            
            if last_quote > text_start:
                text = block_text[text_start:last_quote]
            else:
                # No closing quote found - the source might have garbage chars instead
                # Extract everything from text_start to just before the final }
                # But skip trailing whitespace/newline
                end_pos = len(block_text) - 1
                while end_pos > text_start and block_text[end_pos] in '}\n\r\t \ufffd':
                    end_pos -= 1
                text = block_text[text_start:end_pos+1]
        else:
            text = ''
    else:
        text = ''
    
    # Clean up
    text = text.replace('\\N', '\n')
    text = text.replace('\\n', '\n')
    # Remove garbage chars that might remain
    text = text.strip().rstrip('\ufffd').strip()
    
    en_blocks.append({'type': block_type, 'text': text})

print(f'Parsed {len(en_blocks)} blocks')

# Check empty blocks
empty_blocks = [i for i, b in enumerate(en_blocks) if not b['text'].strip()]
print(f'Empty blocks: {empty_blocks}')

# For any empty blocks, try to get text from zh as fallback (but this shouldn't happen now)
for i in empty_blocks:
    if i < len(zh_blocks):
        en_blocks[i]['text'] = zh_blocks[i].get('text', '')
        print(f'  Filled block {i} from zh')

# Verify type alignment
for i in range(min(len(zh_blocks), len(en_blocks))):
    if zh_blocks[i]['type'] != en_blocks[i]['type']:
        print(f'Type mismatch at {i}: zh={zh_blocks[i]["type"]}, en={en_blocks[i]["type"]}')

# Build output
en_translation = {
    'title': title if title else zh['title'],
    'lead': lead if lead else zh['lead'],
    'meta': {
        'date': zh['meta']['date'],
        'author': 'QingSong Law Firm'
    },
    'blocks': en_blocks,
    'references': zh.get('references', []),
    'subtitle': subtitle if subtitle else '',
    'conclusion': conclusion if conclusion else ''
}

output = {
    'id': 4,
    'slug': 'article-004',
    'tags': [],
    'date': '2024-06-10',
    'translations': {
        'en': en_translation
    }
}

with open('D:/treasure/job/QSong_new/qsong_nuxt/app/pages/article/temp/article-004.json', 'w', encoding='utf-8') as f:
    json.dump(output, f, ensure_ascii=False, indent=2)

print('\nOutput written successfully!')
