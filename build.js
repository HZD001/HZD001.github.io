const fs = require('fs');
const path = require('path');

function minifyJS(code) {
  let inString = false;
  let stringChar = '';
  let result = '';
  let i = 0;
  
  while (i < code.length) {
    const char = code[i];
    const nextChar = code[i + 1];
    
    if (!inString) {
      if (char === '"' || char === "'" || char === '`') {
        inString = true;
        stringChar = char;
        result += char;
        i++;
      } else if (char === '/' && nextChar === '/') {
        while (i < code.length && code[i] !== '\n') {
          i++;
        }
      } else if (char === '/' && nextChar === '*') {
        i += 2;
        while (i < code.length - 1) {
          if (code[i] === '*' && code[i + 1] === '/') {
            i += 2;
            break;
          }
          i++;
        }
      } else {
        result += char;
        i++;
      }
    } else {
      result += char;
      if (char === stringChar && code[i - 1] !== '\\') {
        inString = false;
      }
      i++;
    }
  }
  
  return result
    .replace(/\n\s+/g, '\n')
    .replace(/\n{2,}/g, '\n')
    .trim();
}

function minifyCSS(code) {
  return code
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\s+/g, ' ')
    .replace(/\s*([{}:;,])\s*/g, '$1')
    .trim();
}

function minifyHTML(code) {
  return code
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/\s+/g, ' ')
    .replace(/>\s+</g, '><')
    .trim();
}

console.log('开始构建...');

const cssDir = path.join(__dirname, 'src', 'css');
const jsDir = path.join(__dirname, 'src', 'js');
const srcIndex = path.join(__dirname, 'src', 'index.html');

const cssOutDir = path.join(__dirname, 'css');
const jsOutDir = path.join(__dirname, 'js');
const outIndex = path.join(__dirname, 'index.html');

if (!fs.existsSync(cssOutDir)) fs.mkdirSync(cssOutDir, { recursive: true });
if (!fs.existsSync(jsOutDir)) fs.mkdirSync(jsOutDir, { recursive: true });

fs.readdirSync(cssDir).forEach(file => {
  if (file.endsWith('.css')) {
    const content = fs.readFileSync(path.join(cssDir, file), 'utf8');
    const minified = minifyCSS(content);
    fs.writeFileSync(path.join(cssOutDir, file), minified);
    console.log(`压缩 CSS: ${file}`);
  }
});

fs.readdirSync(jsDir).forEach(file => {
  if (file.endsWith('.js')) {
    const content = fs.readFileSync(path.join(jsDir, file), 'utf8');
    const minified = minifyJS(content);
    fs.writeFileSync(path.join(jsOutDir, file), minified);
    console.log(`压缩 JS: ${file}`);
  }
});

const htmlContent = fs.readFileSync(srcIndex, 'utf8');
const minifiedHTML = minifyHTML(htmlContent);
fs.writeFileSync(outIndex, minifiedHTML);
console.log('压缩 HTML: index.html');

console.log('构建完成！');
