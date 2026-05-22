const fs = require('fs');
let raw = fs.readFileSync('D:/allother/豆包下载/image/im2/译文_article.txt', 'utf-8');

// 先把每行单独处理，修复行级别的格式问题
const lines = raw.split('\n');
const fixedLines = lines.map((line, idx) => {
  // 修复1: 行内 \\N -> \\n
  line = line.replace(/\\N/g, '\\n');

  // 修复2: "Content":.xxx..." 或 "Content":."
  // 找到 "Content":. 后面跟着内容直到行末的 Unicode 引号
  const contentMatch = line.match(/^(\s*"Content"\s*:\s*)\.(.*)[\u201C\u201D]\s*$/);
  if (contentMatch) {
    const prefix = contentMatch[1];
    const value = contentMatch[2];
    line = prefix + '"' + value + '"';
  }

  // 修复3: "Content":." (空内容)
  if (/"Content"\s*:\s*\.[\u201C\u201D]\s*$/.test(line)) {
    line = line.replace(/("Content"\s*:\s*)\.[\u201C\u201D]\s*$/, '$1""');
  }

  // 修复4: "Text":.xxx..." 或 "Text":."
  const textMatch = line.match(/^(\s*"Text"\s*:\s*)\.(.*)[\u201C\u201D]\s*$/);
  if (textMatch) {
    line = textMatch[1] + '"' + textMatch[2] + '"';
  }
  if (/"Text"\s*:\s*\.[\u201C\u201D]\s*$/.test(line)) {
    line = line.replace(/("Text"\s*:\s*)\.[\u201C\u201D]\s*$/, '$1""');
  }

  // 修复5: Unicode 引号 -> ASCII 双引号
  line = line.replace(/[\u201C\u201D]/g, '"');

  return line;
});

let fixed = fixedLines.join('\n');

// 修复6: 字符串内部未转义的双引号
let result = '';
let inStr = false, esc = false;
for (let i = 0; i < fixed.length; i++) {
  const ch = fixed[i];
  if (esc) { esc = false; result += ch; continue; }
  if (ch === '\\' && inStr) { esc = true; result += ch; continue; }
  if (ch === '"') {
    if (!inStr) { inStr = true; result += ch; continue; }
    let j = i + 1;
    while (j < fixed.length && /[\s\t\r\n]/.test(fixed[j])) j++;
    if (j < fixed.length && [',', ':', '}', ']', '\n'].includes(fixed[j])) {
      inStr = false; result += ch; continue;
    }
    result += '\\"'; continue;
  }
  result += ch;
}

// 调试
let enData;
try {
  enData = JSON.parse(result);
} catch (e) {
  console.error('Parse error:', e.message);
  const m = e.message.match(/position (\d+)/);
  if (m) {
    const p = parseInt(m[1]);
    const linesBefore = result.slice(0, p).split('\n');
    const lineNo = linesBefore.length;
    const col = linesBefore[linesBefore.length - 1].length;
    console.error(`Line ${lineNo}, Col ${col}`);
    console.error('Near:', JSON.stringify(result.slice(Math.max(0, p - 60), p + 60)));
  }
  process.exit(1);
}

const articles = JSON.parse(fs.readFileSync('app/pages/article/articles.json', 'utf-8'));

function toLower(obj) {
  if (Array.isArray(obj)) return obj.map(toLower);
  if (obj !== null && typeof obj === 'object') {
    const r = {};
    for (const [k, v] of Object.entries(obj)) {
      const lk = k[0] >= 'A' && k[0] <= 'Z' ? k.toLowerCase() : k;
      r[lk] = toLower(v);
    }
    return r;
  }
  return obj;
}

const enDataLC = toLower(enData);

for (let i = 0; i < articles.length; i++) {
  const a = articles[i];
  const src = enDataLC[i]?.translations?.zh;
  if (!src) continue;
  const blocks = (src.blocks || []).map(b => ({
    type: b.type,
    ...(b.text !== undefined ? { text: b.text } : {}),
    ...(b.title !== undefined ? { title: b.title } : {}),
    ...(b.content !== undefined ? { content: b.content } : {}),
    ...(b.badge !== undefined ? { badge: b.badge } : {}),
    ...(b.caseid !== undefined ? { caseId: b.caseid } : {}),
  }));
  a.translations.en = {
    title: src.title || a.translations.zh.title,
    lead: src.lead || a.translations.zh.lead,
    meta: { date: a.translations.zh.meta.date, author: 'QingSong Law Firm' },
    blocks,
    references: src.references || [],
    subtitle: src.subtitle || a.translations.zh.subtitle || '',
    conclusion: src.conclusion || '',
  };
  console.log(`#${i+1} ${a.slug}: ${blocks.length} blocks`);
}

fs.writeFileSync('app/pages/article/articles.json', JSON.stringify(articles, null, 2), 'utf-8');
console.log('Done.');
