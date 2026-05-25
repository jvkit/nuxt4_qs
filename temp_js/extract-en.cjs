const fs = require('fs');
const path = require('path');

const SOURCE_FILE = 'D:/allother/豆包下载/image/im2/译文_article.txt';
const TARGET_DIR = __dirname;

// Articles with their line ranges in the source file (1-indexed)
const ARTICLES = [
  { slug: 'article-003', start: 373, end: 554 },
  { slug: 'article-004', start: 555, end: 699 },
  { slug: 'article-005', start: 700, end: 863 },
  { slug: 'article-006', start: 864, end: 1008 },
  { slug: 'article-007', start: 1009, end: 1311 },
  { slug: 'article-008', start: 1312, end: 1529 },
  { slug: 'article-009', start: 1530, end: 1721 },
];

function fixLine(line) {
  // Replace Chinese double quotes at end with ASCII double quote
  line = line.replace(/[\u201c\u201d]$/, '"');
  // Replace Chinese period at end with ASCII period
  if (line.endsWith('。')) {
    line = line.slice(0, -1) + '.';
  }
  return line;
}

function extractValue(line, key) {
  const idx = line.indexOf(key);
  if (idx === -1) return null;
  
  const afterKey = line.substring(idx + key.length);
  // Remove leading colon, spaces
  const trimmed = afterKey.replace(/^[:\s]*/, '');
  
  // Find all ASCII double quote positions
  const positions = [];
  for (let i = 0; i < trimmed.length; i++) {
    if (trimmed.charCodeAt(i) === 0x22) {
      positions.push(i);
    }
  }
  
  // Need at least 2 quotes for a valid string value
  if (positions.length < 2) {
    // Check if it's an empty value like `Text:.`
    if (trimmed === '.' || trimmed === '' || trimmed === ',') {
      return '';
    }
    return null;
  }
  
  // Extract between first and last quote
  const value = trimmed.substring(positions[0] + 1, positions[positions.length - 1]);
  return value;
}

function extractArticle(lines, article) {
  const articleLines = lines.slice(article.start - 1, article.end);
  
  let blocks = [];
  let currentBlock = null;
  let inBlocks = false;
  let title = '';
  let lead = '';
  let subtitle = '';
  let conclusion = '';
  let references = [];
  
  for (let i = 0; i < articleLines.length; i++) {
    let line = articleLines[i].trim();
    line = fixLine(line);
    
    if (line === '"blocks": [') {
      inBlocks = true;
      continue;
    }
    
    if ((line === ']' || line === '],') && inBlocks) {
      inBlocks = false;
      if (currentBlock) {
        blocks.push(currentBlock);
        currentBlock = null;
      }
      continue;
    }
    
    if (!inBlocks) {
      // Extract title, lead, subtitle, conclusion, references
      if (line.startsWith('"Title":')) {
        const v = extractValue(line, '"Title":');
        if (v !== null) title = v;
      } else if (line.startsWith('"Lead":')) {
        const v = extractValue(line, '"Lead":');
        if (v !== null) lead = v;
      } else if (line.startsWith('"Subtitle":')) {
        const v = extractValue(line, '"Subtitle":');
        if (v !== null) subtitle = v;
      } else if (line.startsWith('"Conclusion":')) {
        const v = extractValue(line, '"Conclusion":');
        if (v !== null) conclusion = v;
      } else if (line.startsWith('"references":')) {
        // Skip reference array extraction for now
      }
      continue;
    }
    
    if (line === '{' && inBlocks) {
      if (currentBlock) {
        blocks.push(currentBlock);
      }
      currentBlock = {};
      continue;
    }
    
    if (line === '},' && inBlocks) {
      if (currentBlock) {
        blocks.push(currentBlock);
        currentBlock = null;
      }
      continue;
    }
    
    if (line === '}' && inBlocks) {
      if (currentBlock) {
        blocks.push(currentBlock);
        currentBlock = null;
      }
      continue;
    }
    
    if (currentBlock) {
      if (line.startsWith('"type":')) {
        const v = extractValue(line, '"type":');
        if (v !== null) currentBlock.type = v;
      } else if (line.startsWith('"Text":')) {
        const v = extractValue(line, '"Text":');
        if (v !== null) currentBlock.text = v;
      } else if (line.startsWith('"Content":')) {
        const v = extractValue(line, '"Content":');
        if (v !== null) currentBlock.content = v;
      } else if (line.startsWith('"Badge":')) {
        const v = extractValue(line, '"Badge":');
        if (v !== null) currentBlock.badge = v;
      } else if (line.startsWith('"CaseId":')) {
        const v = extractValue(line, '"CaseId":');
        if (v !== null) currentBlock.caseId = v;
      }
    }
  }
  
  return { title, lead, subtitle, blocks, conclusion, references };
}

function main() {
  const lines = fs.readFileSync(SOURCE_FILE, 'utf-8').split('\n');
  
  for (const article of ARTICLES) {
    console.log(`\n=== ${article.slug} ===`);
    const result = extractArticle(lines, article);
    console.log(`Title: ${result.title.substring(0, 80)}...`);
    console.log(`Lead: ${result.lead.substring(0, 80)}...`);
    console.log(`Blocks: ${result.blocks.length}`);
    console.log(`Conclusion: ${result.conclusion.substring(0, 80)}...`);
    
    // Check for empty blocks
    const emptyBlocks = result.blocks.filter((b, i) => {
      if (b.type === 'case') return !b.content;
      return !b.text;
    });
    if (emptyBlocks.length > 0) {
      console.log(`WARNING: ${emptyBlocks.length} empty blocks found!`);
      emptyBlocks.forEach((b, idx) => {
        const origIdx = result.blocks.indexOf(b);
        console.log(`  Empty block at index ${origIdx}: type=${b.type}`);
      });
    }
    
    // Write temp file
    const outPath = path.join(TARGET_DIR, `en_${article.slug}.json`);
    fs.writeFileSync(outPath, JSON.stringify(result, null, 2), 'utf-8');
    console.log(`Written to ${outPath}`);
  }
}

main();
