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
        if (content.includes('333')) {
            content = content.replace(/333/g, '334');
            fs.writeFileSync(filePath, content);
            console.log(`Updated version in ${file}`);
            changed = true;
            count++;
        }
    }
});

console.log(`Total files updated: ${count}`);
