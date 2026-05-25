const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, 'public');
const files = fs.readdirSync(publicDir);

let count = 0;
files.forEach(file => {
    if (path.extname(file) === '.html') {
        const filePath = path.join(publicDir, file);
        let content = fs.readFileSync(filePath, 'utf8');
        
        // Match both single-line and multi-line definitions of function toggleMenu() { ... }
        // Using a lazy match on [\s\S]*? up to the closing curly brace
        const regex = /function\s+toggleMenu\s*\(\s*\)\s*\{[\s\S]*?\}/g;
        
        if (regex.test(content)) {
            content = content.replace(regex, '');
            fs.writeFileSync(filePath, content);
            console.log(`Removed local toggleMenu from ${file}`);
            count++;
        }
    }
});

console.log(`Total HTML files cleaned: ${count}`);
