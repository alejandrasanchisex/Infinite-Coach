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
        
        // 1. Replace components.css with components.css?v=390 if it doesn't have version
        if (content.includes('styles/components.css"')) {
            content = content.replace('styles/components.css"', 'styles/components.css?v=390"');
            changed = true;
        }
        if (content.includes("styles/components.css'")) {
            content = content.replace("styles/components.css'", "styles/components.css?v=390'");
            changed = true;
        }

        // 2. Replace all 390 to 391
        if (content.includes('390')) {
            content = content.replace(/390/g, '391');
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
