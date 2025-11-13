#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

function walk(dir, filelist = []) {
  const files = fs.readdirSync(dir);
  files.forEach((file) => {
    const fp = path.join(dir, file);
    const stat = fs.statSync(fp);
    if (stat.isDirectory()) {
      walk(fp, filelist);
    } else if (/\.tsx?$/.test(file)) {
      filelist.push(fp);
    }
  });
  return filelist;
}

// crude regex: <Tag ...> someText </Tag>
const jsxTextRegex = /<([A-Za-z0-9_.]+)[^>]*>\s*([^<\n][^<]*)<\/\1>/g;

const root = process.cwd();
const files = walk(root);
const allowedTextParents = new Set(['Text', 'Animated.Text', 'ThemedText', 'ThemedView', 'AnimatedText']);

let found = 0;
for (const file of files) {
  const content = fs.readFileSync(file, 'utf8');
  let match;
  while ((match = jsxTextRegex.exec(content)) !== null) {
    const tag = match[1];
    const text = match[2].trim();
    // skip if parent is a Text-like component
    if (allowedTextParents.has(tag)) continue;
    // skip small punctuation or empty
    if (!text || text.length === 0) continue;
    // skip if text is only JSX expressions like {value}
    if (/^\{.*\}$/.test(text)) continue;

    const idx = match.index;
    const before = content.slice(0, idx);
    const line = before.split('\n').length;
    console.log(`${file}:${line}  <${tag}> -> ${text.substring(0, 80).replace(/\n/g, ' ')}${text.length>80? '...':''}`);
    found++;
  }
}

if (found === 0) {
  console.log('No suspicious literal JSX text found by the quick scan.');
} else {
  console.log(`Found ${found} suspicious literal JSX text occurrences.`);
}
