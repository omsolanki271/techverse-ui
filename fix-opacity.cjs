const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    const dirPath = path.join(dir, f);
    const isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

const replacements = [
  // Backgrounds
  [/bg-techverse-eggshell bg-opacity-70/g, 'bg-techverse-eggshell/70'],
  [/bg-techverse-eggshell hover:bg-opacity-30/g, 'bg-techverse-eggshell hover:bg-techverse-eggshell/30'],
  [/bg-techverse-eggshell hover:bg-opacity-50/g, 'bg-techverse-eggshell hover:bg-techverse-eggshell/50'],
  [/bg-techverse-eggshell hover:bg-opacity-70/g, 'bg-techverse-eggshell hover:bg-techverse-eggshell/70'],
  [/bg-techverse-green bg-opacity-5/g, 'bg-techverse-green/5'],
  [/bg-techverse-olive bg-opacity-20/g, 'bg-techverse-olive/20'],
  [/bg-techverse-olive hover:bg-opacity-90/g, 'bg-techverse-olive hover:bg-techverse-olive/90'],
  [/hover:bg-techverse-green hover:bg-opacity-5/g, 'hover:bg-techverse-green/5'],
  [/bg-white bg-opacity-5/g, 'bg-white/5'],
  [/bg-white bg-opacity-40/g, 'bg-white/40'],
  [/bg-black bg-opacity-50/g, 'bg-black/50'],

  // Borders
  [/border-techverse-green border-opacity-5/g, 'border-techverse-green/5'],
  [/border-techverse-green border-opacity-10/g, 'border-techverse-green/10'],
  [/border-techverse-green border-opacity-20/g, 'border-techverse-green/20'],
  [/border-techverse-green border-opacity-30/g, 'border-techverse-green/30'],
  [/border-techverse-olive border-opacity-20/g, 'border-techverse-olive/20'],
  [/border-techverse-olive border-opacity-30/g, 'border-techverse-olive/30'],
  [/border-white border-opacity-10/g, 'border-white/10'],
  
  // Texts (opacity modifier on colors)
  [/text-techverse-green text-opacity-50/g, 'text-techverse-green/50'],
];

walkDir('./src', (filePath) => {
  if (filePath.endsWith('.jsx') || filePath.endsWith('.css')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;
    
    replacements.forEach(([regex, replacement]) => {
      content = content.replace(regex, replacement);
    });

    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log('Fixed opacity in', filePath);
    }
  }
});
