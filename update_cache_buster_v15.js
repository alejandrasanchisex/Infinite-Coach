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
        
        // Replace current version constant
        if (content.includes("CURRENT_VERSION = '404'")) {
            content = content.replace(/CURRENT_VERSION = '404'/g, "CURRENT_VERSION = '405'");
            changed = true;
        }
        
        // Replace version parameters in assets URLs
        if (content.includes('?v=404')) {
            content = content.replace(/\?v=404/g, '?v=405');
            changed = true;
        }
        
        if (changed) {
            fs.writeFileSync(filePath, content);
            console.log(`Updated cache version in ${file}`);
            count++;
        }
    }
});

console.log(`Total files updated: ${count}`);
