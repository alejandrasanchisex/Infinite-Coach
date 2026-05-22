const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, 'public');
const files = fs.readdirSync(publicDir);

let count = 0;
files.forEach(file => {
    if (path.extname(file) === '.html') {
        const filePath = path.join(publicDir, file);
        let content = fs.readFileSync(filePath, 'utf8');
        
        if (content.includes('js/data-models.js?v=312')) {
            content = content.replace(/js\/data-models\.js\?v=312/g, 'js/data-models.js?v=313');
            fs.writeFileSync(filePath, content);
            console.log(`Updated cache buster in ${file}`);
            count++;
        }
    }
});

console.log(`Total files updated: ${count}`);
