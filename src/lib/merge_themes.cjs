const fs = require('fs');
const path = require('path');
const mainPath = path.join(__dirname, 'prompt_story.json');
const additionPath = path.join(__dirname, 'prompt_story_themes_addition.json');

const main = JSON.parse(fs.readFileSync(mainPath, 'utf8'));
const addition = JSON.parse(fs.readFileSync(additionPath, 'utf8'));

if (!main.themes) {
  console.error('Expected main to have themes');
  process.exit(1);
}
if (!main.themes.bedtimeRoutineSleepHygiene) {
  console.error('Expected main.themes to have bedtimeRoutineSleepHygiene');
  process.exit(1);
}

Object.assign(main.themes, addition);
fs.writeFileSync(mainPath, JSON.stringify(main, null, 2), 'utf8');
console.log('Merged themes. Keys in themes:', Object.keys(main.themes).join(', '));
