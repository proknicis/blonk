const fs = require('fs');
const content = fs.readFileSync('c:\\Users\\prokn\\Desktop\\blonk\\src\\app\\dashboard\\page.module.css', 'utf8');
const lines = content.split('\n');
const line110 = lines[109]; // 0-indexed
console.log(`Line 110: "${line110}"`);
for (let i = 0; i < line110.length; i++) {
    console.log(`${i}: ${line110[i]} (${line110.charCodeAt(i)})`);
}
