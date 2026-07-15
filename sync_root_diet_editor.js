const fs = require('fs');
const path = require('path');

function run() {
    const publicPath = path.join(__dirname, 'public', 'js', 'diet-editor-v3.js');
    const rootPath = path.join(__dirname, 'js', 'diet-editor-v3.js');

    if (!fs.existsSync(publicPath)) {
        console.error("Public diet-editor-v3.js not found!");
        return;
    }

    const publicContent = fs.readFileSync(publicPath, 'utf8');
    fs.writeFileSync(rootPath, publicContent, 'utf8');
    console.log("SUCCESS: Synchronized public/js/diet-editor-v3.js to js/diet-editor-v3.js!");
}

run();
