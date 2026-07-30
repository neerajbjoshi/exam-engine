// PDF text extractor with best-effort bold/red-color tagging.
//
// Inflates every FlateDecode stream in the file and walks each content
// stream's operators with a small stack machine (BT/ET, Tf, rg/RG/g/G/k/K,
// Tj/TJ/'/", Td/TD/T*) to track the current font and fill color at the
// point each string is shown. Bold/red spans are marked inline as
// **bold** and [RED]...[/RED] in the plain-text output.
//
// Font-resource -> BaseFont resolution is best-effort: it only follows
// direct (non-compressed) "N 0 obj ... endobj" objects and "/Font <<...>>"
// resource dictionaries found in the raw PDF bytes. PDFs that pack their
// font dictionaries into compressed object streams (ObjStm) won't resolve,
// and any text drawn through such an unresolved font resource is treated as
// not-bold rather than guessed. This is not a full PDF parser — verify
// bold/red output against a page or two of the source before trusting it.
import { readFileSync } from 'node:fs';
import { inflateSync } from 'node:zlib';

const file = process.argv[2];
const buf = readFileSync(file);
const raw = buf.toString('latin1');

// --- Find all stream ... endstream spans, plus each one's preceding
//     stream-dictionary text (needed to detect /Type /ObjStm headers) ---
function findStreams(buffer) {
  const chunks = [];
  let idx = 0;
  while (true) {
    const s = buffer.indexOf('stream', idx);
    if (s === -1) break;
    let start = s + 6;
    if (buffer[start] === 0x0d) start++;
    if (buffer[start] === 0x0a) start++;
    const e = buffer.indexOf('endstream', start);
    if (e === -1) break;
    const dictText = raw.slice(Math.max(0, s - 400), s);
    chunks.push({ bytes: buffer.subarray(start, e), dictText });
    idx = e + 9;
  }
  return chunks;
}
const streams = findStreams(buf);

// --- Best-effort resource-name -> BaseFont map ---
// Direct (uncompressed) "N 0 obj ... endobj" font objects:
const fontObjs = new Map(); // objNum -> BaseFont name
for (const m of raw.matchAll(/(\d+)\s+0\s+obj([\s\S]*?)endobj/g)) {
  const bf = m[2].match(/\/BaseFont\s*\/([^\s/>\]]+)/);
  if (bf) fontObjs.set(m[1], bf[1]);
}
// Font objects packed into compressed object streams (ObjStm): parse the
// header's "objNum offset" pairs (the first /First bytes of the decompressed
// stream) to slice out each object's own text before looking for /BaseFont —
// without this, a bare /BaseFont match can't be attributed to the right
// object number.
for (const { bytes, dictText } of streams) {
  if (!/\/Type\s*\/ObjStm/.test(dictText)) continue;
  const nMatch = dictText.match(/\/N\s+(\d+)/);
  const firstMatch = dictText.match(/\/First\s+(\d+)/);
  if (!nMatch || !firstMatch) continue;
  const n = Number(nMatch[1]);
  const first = Number(firstMatch[1]);
  let data;
  try {
    data = inflateSync(bytes).toString('latin1');
  } catch {
    continue;
  }
  const header = data.slice(0, first);
  const pairs = [...header.matchAll(/(\d+)\s+(\d+)/g)].slice(0, n);
  for (let i = 0; i < pairs.length; i++) {
    const objNum = pairs[i][1];
    const objStart = first + Number(pairs[i][2]);
    const objEnd = i + 1 < pairs.length ? first + Number(pairs[i + 1][2]) : data.length;
    const body = data.slice(objStart, objEnd);
    const bf = body.match(/\/BaseFont\s*\/([^\s/>\]]+)/);
    if (bf) fontObjs.set(objNum, bf[1]);
  }
}
// Resource-name -> object-number references (/F2 12 0 R) can appear in raw
// bytes or inside a decompressed object stream — scan both broadly, since
// this pattern is self-contained and doesn't need object-boundary context.
const resourceToFont = new Map(); // "/F2" -> BaseFont name
function collectResourceRefs(text) {
  for (const m of text.matchAll(/\/(F\d+)\s+(\d+)\s+0\s+R/g)) {
    if (fontObjs.has(m[2])) resourceToFont.set('/' + m[1], fontObjs.get(m[2]));
  }
}
collectResourceRefs(raw);
for (const { bytes } of streams) {
  try {
    collectResourceRefs(inflateSync(bytes).toString('latin1'));
  } catch {
    // not flate, or not text — ignore
  }
}
function isBoldFont(name) {
  return !!name && /bold|black|heavy/i.test(name);
}

const RED_TEST = {
  rgb: (r, g, b) => r > 0.45 && g < 0.35 && b < 0.35,
  cmyk: (c, m, y, k) => c < 0.25 && k < 0.25 && m > 0.4,
};

const tokenRe =
  /\((?:\\.|[^\\()])*\)|<[0-9A-Fa-f\s]+>|\/[A-Za-z0-9#.+_-]+|-?\d*\.\d+|-?\d+|\[|\]|BT|ET|TJ|Tj|T\*|Td|TD|Tf|rg|RG|g(?![A-Za-z])|G(?![A-Za-z])|k(?![A-Za-z])|K(?![A-Za-z])|'|"/g;

function decodeLiteral(tok) {
  let s = tok.slice(1, -1);
  s = s.replace(/\\([nrtbf()\\])/g, (_, ch) => ({ n: '\n', r: '\r', t: '\t', b: '', f: '' }[ch] ?? ch));
  s = s.replace(/\\([0-7]{1,3})/g, (_, o) => String.fromCharCode(parseInt(o, 8)));
  return s;
}

const out = [];

for (const { bytes: c } of streams) {
  let data;
  try {
    data = inflateSync(c);
  } catch {
    continue; // not flate (images, etc.)
  }
  const txt = data.toString('latin1');
  if (!/(Tj|TJ)/.test(txt)) continue;

  let currentFont = null;
  let isRed = false;
  const opStack = [];
  const parts = [];
  let line = '';
  let lineBold = false;
  let lineRed = false;

  function appendText(tok) {
    if (typeof tok !== 'string' || !tok.startsWith('(')) return;
    const s = decodeLiteral(tok);
    const bold = isBoldFont(resourceToFont.get(currentFont));
    if (line && (bold !== lineBold || isRed !== lineRed)) flushLine();
    line += s;
    lineBold = bold;
    lineRed = isRed;
  }
  function flushLine() {
    if (line.trim()) parts.push({ text: line, bold: lineBold, red: lineRed });
    line = '';
    lineBold = false;
    lineRed = false;
  }

  let m;
  while ((m = tokenRe.exec(txt))) {
    const tok = m[0];

    if (tok.startsWith('(') || tok.startsWith('<') || tok.startsWith('/') || tok === '[') {
      opStack.push(tok === '[' ? '__ARR_START__' : tok);
      continue;
    }
    if (/^-?\d*\.?\d+$/.test(tok)) {
      opStack.push(Number(tok));
      continue;
    }
    if (tok === ']') {
      const items = [];
      while (opStack.length && opStack[opStack.length - 1] !== '__ARR_START__') items.unshift(opStack.pop());
      opStack.pop();
      opStack.push(items);
      continue;
    }

    switch (tok) {
      case 'Tf': {
        opStack.pop(); // size
        const fontName = opStack.pop();
        currentFont = typeof fontName === 'string' && fontName.startsWith('/') ? fontName : null;
        break;
      }
      case 'rg':
      case 'RG': {
        const b = opStack.pop(), g = opStack.pop(), r = opStack.pop();
        isRed = [r, g, b].every((n) => typeof n === 'number') && RED_TEST.rgb(r, g, b);
        break;
      }
      case 'g':
      case 'G':
        isRed = false; // grayscale can't be red
        break;
      case 'k':
      case 'K': {
        const kk = opStack.pop(), y = opStack.pop(), mm = opStack.pop(), cc = opStack.pop();
        isRed = [cc, mm, y, kk].every((n) => typeof n === 'number') && RED_TEST.cmyk(cc, mm, y, kk);
        break;
      }
      case 'Tj':
      case "'":
      case '"':
        appendText(opStack.pop());
        break;
      case 'TJ': {
        const arr = opStack.pop();
        if (Array.isArray(arr)) for (const item of arr) appendText(item);
        break;
      }
      case 'T*':
      case 'Td':
      case 'TD':
      case 'ET':
        flushLine();
        break;
      default:
        break;
    }
    opStack.length = 0;
  }
  flushLine();
  if (parts.length) out.push(parts);
}

const lines = [];
for (const parts of out) {
  const rendered = parts.map((p) => {
    let t = p.text;
    if (p.bold) t = `**${t}**`;
    if (p.red) t = `[RED]${t}[/RED]`;
    return t;
  });
  lines.push(rendered.join('\n'));
}
console.log(lines.join('\n'));
