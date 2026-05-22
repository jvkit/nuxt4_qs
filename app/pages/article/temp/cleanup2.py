import json

with open('D:/treasure/job/QSong_new/qsong_nuxt/app/pages/article/temp/article-004.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

# Clean conclusion - remove garbage chars at end
conclusion = data['translations']['en']['conclusion']
# Strip any non-printable or garbage chars from the end
while conclusion and ord(conclusion[-1]) > 127 or conclusion[-1] == '\ufffd':
    conclusion = conclusion[:-1]
# Also strip regular whitespace
data['translations']['en']['conclusion'] = conclusion.strip()

# Also clean blocks again for any remaining garbage
for block in data['translations']['en']['blocks']:
    text = block['text']
    # Remove any replacement characters and other high-unicode garbage from end
    while text and (text[-1] == '\ufffd' or ord(text[-1]) > 127):
        text = text[:-1]
    block['text'] = text.strip()

with open('D:/treasure/job/QSong_new/qsong_nuxt/app/pages/article/temp/article-004.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print('Cleanup2 done')
