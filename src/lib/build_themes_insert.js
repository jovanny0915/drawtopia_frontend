const fs = require('fs');
const addition = JSON.parse(fs.readFileSync('prompt_story_themes_addition.json', 'utf8'));
const parts = [];
for (const [key, value] of Object.entries(addition)) {
  parts.push('    "' + key + '": ' + JSON.stringify(value));
}
const insertion = parts.join(',\n');
fs.writeFileSync('_themes_insertion.txt', insertion, 'utf8');
console.log('Wrote _themes_insertion.txt, length:', insertion.length);
