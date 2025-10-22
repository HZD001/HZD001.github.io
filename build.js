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

function obfuscateJS(code) {
  const varMap = new Map();
  let varCounter = 0;
  
  function getObfuscatedName() {
    const name = '_0x' + varCounter.toString(16);
    varCounter++;
    return name;
  }
  
  const protectedNames = new Set([
    'if', 'else', 'for', 'while', 'do', 'switch', 'case', 'break', 'continue',
    'return', 'function', 'const', 'let', 'var', 'class', 'new', 'this',
    'try', 'catch', 'throw', 'finally', 'typeof', 'instanceof', 'delete',
    'in', 'of', 'void', 'with', 'yield', 'import', 'export', 'default',
    'extends', 'super', 'static', 'get', 'set', 'true', 'false', 'null',
    'undefined', 'NaN', 'Infinity',
    'document', 'window', 'console', 'setTimeout', 'setInterval', 
    'clearTimeout', 'clearInterval', 'localStorage', 'Notification',
    'Audio', 'AudioContext', 'webkitAudioContext', 'navigator',
    'SpeechSynthesisUtterance', 'speechSynthesis', 'Date', 'Math',
    'parseInt', 'parseFloat', 'alert', 'confirm', 'JSON',
    'getElementById', 'querySelector', 'addEventListener', 'classList',
    'createElement', 'appendChild', 'removeChild', 'textContent',
    'innerHTML', 'value', 'checked', 'style', 'display', 'focus',
    'close', 'play', 'catch', 'then', 'async', 'await', 'Promise',
    'Config', 'Timer', 'NotificationManager', 'Utils',
    'DOMContentLoaded', 'click', 'change', 'FileReader', 'readAsDataURL',
    'getTime', 'toISOString', 'getItem', 'setItem', 'removeItem',
    'requestPermission', 'permission', 'vibrate', 'speak',
    'startTime', 'endTime', 'lunchStartTime', 'lunchEndTime',
    'isRunning', 'isOnBreak', 'isOvertime', 'totalWorkSeconds',
    'elements', 'config', 'interval', 'breakInterval',
    'loadConfig', 'saveConfig', 'loadTimerState', 'saveTimerState', 
    'clearTimerState', 'applyConfigToUI', 'getConfigFromUI', 'saveCustomSound',
    'init', 'notify', 'showNotification', 'playSound', 'playCustomSound',
    'playBeep', 'getSoundConfig', 'flashNotification', 'notifyLunch',
    'notifyOffWork', 'notifyBreak', 'reset',
    'formatTime', 'formatTimeHHMM', 'parseTimeString', 'setTimeToDate',
    'getSecondsDiff', 'isInLunchBreak', 'calculateProgress',
    'checkNotificationPermission',
    'customSoundGroup', 'customSoundPreview', 'devModeSection',
    'saved', 'state', 'e', 'event', 'audio', 'ctx', 'oscillator', 
    'gainNode', 'soundConfig', 'oscillator2', 'gainNode2', 
    'configs', 'card', 'originalTitle', 'count', 'utterance',
    'newConfig', 'hasStartTimeChanged', 'hasWorkHoursChanged',
    'hasLunchBreakChanged', 'hasLunchTimeChanged', 'hasOffsetChanged',
    'stateData', 'now', 'configStartTime', 'timeObj', 'offsetTime',
    'offsetMinutes', 'lunchTimeObj', 'remainingSeconds', 'inLunch',
    'elapsedSeconds', 'progress', 'timeSinceLastBreak', 'btn',
    'result', 'file', 'reader', 'base64Data', 'preview', 'section',
    'statusEl', 'html', 'isResuming', 'hours', 'minutes', 'seconds',
    'secs', 'body', 'title', 'options', 'notification', 'type',
    'requireInteraction', 'duration', 'autoClose', 'soundType',
    'current', 'total', 'date1', 'date2', 'currentTime', 'lunchStart',
    'lunchDuration', 'lunchEnd', 'timeStr', 'date', 'frequency',
    'waveType', 'repeat', 'delay', 'beep', 'bell', 'chime', 'ding',
    'text', 'lang', 'rate', 'pitch', 'volume'
  ]);
  
  const lines = code.split('\n');
  const obfuscatedLines = lines.map(line => {
    let obfuscatedLine = line;
    
    const constMatch = line.match(/^const\s+(\w+)\s*=/);
    if (constMatch && !protectedNames.has(constMatch[1])) {
      const originalName = constMatch[1];
      if (!varMap.has(originalName)) {
        varMap.set(originalName, getObfuscatedName());
      }
    }
    
    const functionMatch = line.match(/^(\w+)\s*\(/);
    if (functionMatch && !protectedNames.has(functionMatch[1])) {
      const originalName = functionMatch[1];
      if (!varMap.has(originalName)) {
        varMap.set(originalName, getObfuscatedName());
      }
    }
    
    return obfuscatedLine;
  });
  
  let result = obfuscatedLines.join('\n');
  
  for (const [original, obfuscated] of varMap.entries()) {
    const regex = new RegExp(`\\b${original}\\b`, 'g');
    result = result.replace(regex, obfuscated);
  }
  
  result = result
    .replace(/\s+/g, ' ')
    .replace(/\s*([{}();,:])\s*/g, '$1')
    .replace(/\s*=\s*/g, '=')
    .replace(/\s*\?\s*/g, '?')
    .replace(/\s*\|\|\s*/g, '||')
    .replace(/\s*&&\s*/g, '&&')
    .trim();
  
  return result;
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
    const obfuscated = obfuscateJS(minified);
    fs.writeFileSync(path.join(jsOutDir, file), obfuscated);
    console.log(`压缩混淆 JS: ${file}`);
  }
});

const htmlContent = fs.readFileSync(srcIndex, 'utf8');
const minifiedHTML = minifyHTML(htmlContent);
fs.writeFileSync(outIndex, minifiedHTML);
console.log('压缩 HTML: index.html');

console.log('构建完成！');
