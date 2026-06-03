const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, 'public');
const files = fs.readdirSync(publicDir);

let count = 0;
files.forEach(file => {
    if (path.extname(file) === '.html') {
        const filePath = path.join(publicDir, file);
        let content = fs.readFileSync(filePath, 'utf8');
        
        // Match version patterns like v=340, etc.
        const versionRegex = /(\?v=|\&v=)\d+/g;
        if (versionRegex.test(content)) {
            content = content.replace(versionRegex, (match, prefix) => `${prefix}346`);
            
            // Also replace any hardcoded version checks in script files
            content = content.replace(/versionParam !== '\d+'/g, "versionParam !== '346'");
            content = content.replace(/currentVersion = '\d+'/g, "currentVersion = '346'");
            content = content.replace(/v=\d+/g, "v=346");
            
            fs.writeFileSync(filePath, content);
            console.log(`Updated all version tags in ${file} to v346`);
            count++;
        }
    }
});

// Also update src/app/page.tsx
const pagePath = path.join(__dirname, 'src', 'app', 'page.tsx');
if (fs.existsSync(pagePath)) {
    let pageContent = fs.readFileSync(pagePath, 'utf8');
    pageContent = pageContent.replace(/v=345/g, "v=346");
    fs.writeFileSync(pagePath, pageContent);
    console.log("Updated v=346 in src/app/page.tsx");
}

console.log(`Total files fully updated: ${count}`);
