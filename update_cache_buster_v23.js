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
        
        // Replace CURRENT_VERSION constant to '423'
        const versionRegex = /CURRENT_VERSION = '(\d+)'/g;
        let match;
        while ((match = versionRegex.exec(content)) !== null) {
            if (match[1] !== '423') {
                content = content.replace(`CURRENT_VERSION = '${match[1]}'`, "CURRENT_VERSION = '423'");
                changed = true;
            }
        }
        
        // Replace all ?v=XXX queries in asset links to ?v=423
        const vMatches = content.match(/\?v=\d+/g);
        if (vMatches) {
            vMatches.forEach(vMatch => {
                if (vMatch !== '?v=423') {
                    const escapedMatch = vMatch.replace('?', '\\?');
                    content = content.replace(new RegExp(escapedMatch, 'g'), '?v=423');
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
