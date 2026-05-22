import json

with open('D:/treasure/job/QSong_new/qsong_nuxt/app/pages/article/temp/article-004.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

# Fix backslash-N in conclusion
conclusion = data['translations']['en']['conclusion']
# Replace \\N with \\n (json-escaped newline)
conclusion = conclusion.replace('\\N', '\\n')
data['translations']['en']['conclusion'] = conclusion

# Clean up stray curly quotes at end of blocks
for block in data['translations']['en']['blocks']:
    text = block['text']
    # Remove trailing left/right double quotation marks (U+201C, U+201D)
    text = text.rstrip('\u201c').rstrip('\u201d').strip()
    block['text'] = text

with open('D:/treasure/job/QSong_new/qsong_nuxt/app/pages/article/temp/article-004.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print('Cleanup done')
print('Conclusion last 100 chars:', repr(data['translations']['en']['conclusion'][-100:]))
