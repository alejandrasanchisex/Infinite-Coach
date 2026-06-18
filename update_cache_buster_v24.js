const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, 'public');
const files = fs.readdirSync(publicDir);

let count = 0;
files.forEach(file => {
    if (path.extname(file) === '.html') {
        const filePath = path.join(publicDir, file);
        let content = fs.readFileSync(filePath, 'utf8');
        
        let changed = false;
        
        // Replace CURRENT_VERSION constant to '424'
        const versionRegex = /CURRENT_VERSION = '(\d+)'/g;
        let match;
        while ((match = versionRegex.exec(content)) !== null) {
            if (match[1] !== '424') {
                content = content.replace(`CURRENT_VERSION = '${match[1]}'`, "CURRENT_VERSION = '424'");
                changed = true;
            }
        }
        
        // Replace all ?v=XXX queries in asset links to ?v=424
        const vMatches = content.match(/\?v=\d+/g);
        if (vMatches) {
            vMatches.forEach(vMatch => {
                if (vMatch !== '?v=424') {
                    const escapedMatch = vMatch.replace('?', '\\?');
                    content = content.replace(new RegExp(escapedMatch, 'g'), '?v=424');
                    changed = true;
                }
            });
        }
        
        if (changed) {
            fs.writeFileSync(filePath, content);
            console.log(`Updated cache version in ${file}`);
            count++;
        }
    }
});

console.log(`Total files updated: ${count}`);
