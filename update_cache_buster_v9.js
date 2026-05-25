const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, 'public');
const files = fs.readdirSync(publicDir);

let count = 0;
files.forEach(file => {
    if (path.extname(file) === '.html') {
        const filePath = path.join(publicDir, file);
        let content = fs.readFileSync(filePath, 'utf8');
        
        if (content.includes('?v=328')) {
            content = content.replace(/\?v=328/g, '?v=329');
            fs.writeFileSync(filePath, content);
            console.log(`Updated cache buster in ${file}`);
            count++;
        }
    }
});

console.log(`Total files updated: ${count}`);
