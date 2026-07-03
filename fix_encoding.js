const fs = require('fs');

function decodeMangled(text) {
  const win1252 = [
    '\u20AC', '\u0081', '\u201A', '\u0192', '\u201E', '\u2026', '\u2020', '\u2021',
    '\u02C6', '\u2030', '\u0160', '\u2039', '\u0152', '\u008D', '\u017D', '\u008F',
    '\u0090', '\u2018', '\u2019', '\u201C', '\u201D', '\u2022', '\u2013', '\u2014',
    '\u02DC', '\u2122', '\u0161', '\u203A', '\u0153', '\u009D', '\u017E', '\u0178'
  ];
  const buf = Buffer.alloc(text.length);
  for (let i = 0; i < text.length; i++) {
    const c = text.charCodeAt(i);
    if (c <= 0xFF) {
      buf[i] = c;
    } else {
      let idx = win1252.indexOf(String.fromCharCode(c));
      if (idx !== -1) {
        buf[i] = 0x80 + idx;
      } else {
        buf[i] = c & 0xFF; // Fallback
      }
    }
  }
  return buf.toString('utf8');
}

const content = fs.readFileSync('js/app.js.bak', 'utf8');
const fixed = decodeMangled(content);
fs.writeFileSync('js/app.js', fixed, 'utf8');
console.log('Fixed js/app.js successfully');
