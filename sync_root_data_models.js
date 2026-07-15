const fs = require('fs');
const path = require('path');

function run() {
    const publicPath = path.join(__dirname, 'public', 'js', 'data-models.js');
    const rootPath = path.join(__dirname, 'js', 'data-models.js');

    if (!fs.existsSync(publicPath)) {
        console.error("Public data-models.js not found!");
        return;
    }

    const publicContent = fs.readFileSync(publicPath, 'utf8');
    
    // Copy the entire file to the root copy to ensure they are 100% synchronized and protected
    fs.writeFileSync(rootPath, publicContent, 'utf8');
    console.log("SUCCESS: Synchronized public/js/data-models.js to js/data-models.js! Both files now share the exact same security safeguards.");
}

run();
