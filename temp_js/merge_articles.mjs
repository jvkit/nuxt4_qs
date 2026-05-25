import { readFileSync, writeFileSync } from 'fs';

function fixJsonString(content) {
  let result = '';
  let inString = false;
  let escape = false;

  for (let i = 0; i < content.length; i++) {
    const ch = content[i];

    if (escape) {
      if (ch === 'N') {
        result += 'n'; // \N -> \n
      } else {
        result += ch;
      }
      escape = false;
      continue;
    }

    if (ch === '\\' && inString) {
      escape = true;
      result += ch;
      continue;
    }

    if (ch === '"') {
      if (!inString) {
        inString = true;
        result += ch;
      } else {
        // 检查是否是字符串结束
        let j = i + 1;
        while (j < content.length && /[\s\t\r\n]/.test(content[j])) j++;
        if (j < content.length && [',', ':', '}', ']', '\n'].includes(content[j])) {
          inString = false;
          result += ch;
        } else {
          result += '\\"';
        }
      }
      continue;
    }

    result += ch;
  }

  return result;
}

function toLowerCaseKeys(obj) {
  if (Array.isArray(obj)) {
    return obj.map(toLowerCaseKeys);
  }
  if (obj !== null && typeof obj === 'object') {
    const result = {};
    for (const [key, val] of Object.entries(obj)) {
      const lowerKey = key[0] >= 'A' && key[0] <= 'Z' ? key.toLowerCase() : key;
      result[lowerKey] = toLowerCaseKeys(val);
    }
    return result;
  }
  return obj;
}

// 读取并修复译文文件
const raw = readFileSync('D:/allother/豆包下载/image/im2/译文_article.txt', 'utf-8');
const fixed = fixJsonString(raw);

let enData;
try {
  enData = JSON.parse(fixed);
  console.log(`译文文件解析成功，文章数: ${enData.length}`);
} catch (e) {
  console.error('JSON parse error:', e.message);
  const pos = e.message.match(/position (\d+)/)?.[1];
  if (pos) {
    const p = parseInt(pos);
    console.error('Near error:', JSON.stringify(fixed.slice(Math.max(0, p - 60), p + 60)));
  }
  process.exit(1);
}

// 字段名转小写
enData = toLowerCaseKeys(enData);

// 读取项目 articles.json
const articles = JSON.parse(readFileSync('app/pages/article/articles.json', 'utf-8'));
console.log(`项目文章数: ${articles.length}`);

// 检查字段名
for (let i = 0; i < Math.min(1, enData.length); i++) {
  const zh = enData[i]?.translations?.zh || {};
  console.log(`Article ${i + 1} keys:`, Object.keys(zh));
  const blocks = zh.blocks || [];
  if (blocks.length > 0) {
    console.log('  Block 0 keys:', Object.keys(blocks[0]));
    console.log('  Block 0:', JSON.stringify(blocks[0]).slice(0, 120));
  }
}

// 合并：将译文中的英文内容填入项目 articles.json 的 translations.en
for (let i = 0; i < articles.length; i++) {
  const article = articles[i];
  const enArticle = enData[i];
  if (!enArticle) {
    console.warn(`Warning: 没有第 ${i + 1} 篇文章的译文`);
    continue;
  }

  const enTrans = enArticle.translations?.zh;
  if (!enTrans) {
    console.warn(`Warning: 第 ${i + 1} 篇文章没有 translations.zh`);
    continue;
  }

  // 构建英文翻译对象
  const en = {
    title: enTrans.title || article.translations.zh.title,
    lead: enTrans.lead || article.translations.zh.lead,
    meta: {
      date: article.translations.zh.meta.date,
      author: 'QingSong Law Firm',
    },
    blocks: (enTrans.blocks || []).map(b => ({
      type: b.type,
      ...(b.text !== undefined ? { text: b.text } : {}),
      ...(b.title !== undefined ? { title: b.title } : {}),
      ...(b.content !== undefined ? { content: b.content } : {}),
      ...(b.badge !== undefined ? { badge: b.badge } : {}),
      ...(b.caseid !== undefined ? { caseId: b.caseid } : {}),
    })),
    references: enTrans.references || [],
    subtitle: enTrans.subtitle || article.translations.zh.subtitle || '',
    conclusion: enTrans.conclusion || '',
  };

  article.translations.en = en;
  console.log(`Article ${i + 1} (${article.slug}): en title = "${en.title?.slice(0, 50)}...", blocks = ${en.blocks.length}`);
}

// 写回
writeFileSync('app/pages/article/articles.json', JSON.stringify(articles, null, 2), 'utf-8');
console.log('\nDone! Updated app/pages/article/articles.json');
