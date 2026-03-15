const fs = require('fs');
const path = require('path');

const mainPath = path.join(__dirname, 'prompt_story.json');
const additionPath = path.join(__dirname, 'prompt_story_themes_addition.json');

let mainText = fs.readFileSync(mainPath, 'utf8').replace(/\r\n/g, '\n').trimEnd();
const addition = JSON.parse(fs.readFileSync(additionPath, 'utf8'));

// Build the four themes as JSON string with 4-space indent for top-level keys
const additionStr = JSON.stringify(addition, null, 2);
// Strip outer { } and add 4 spaces to each line so it fits inside "themes"
const lines = additionStr.split('\n');
const innerLines = lines.slice(1, -1); // remove first "{" and last "}"
const indented = innerLines.map((l) => '  ' + l).join('\n');

const oldEnd = [
  '      }',
  '    }',
  '  }',
  '}'
].join('\n');

const newEnd = [
  '      }',
  '    }',
  '    },',
  indented,
  '  }',
  '}'
].join('\n');

if (!mainText.endsWith(oldEnd)) {
  console.error('File end does not match. Last 80 chars repr:', JSON.stringify(mainText.slice(-80)));
  process.exit(1);
}

mainText = mainText.slice(0, -oldEnd.length) + newEnd + '\n';
fs.writeFileSync(mainPath, mainText, 'utf8');
console.log('Merged. Verifying parse...');
const parsed = JSON.parse(fs.readFileSync(mainPath, 'utf8'));
console.log('Themes:', Object.keys(parsed.themes).join(', '));
