const fs = require('fs');
const path = require('path');

const SCRATCH_DIR = path.join(__dirname, 'scratch');

function run() {
    const files = fs.readdirSync(SCRATCH_DIR);
    files.forEach(file => {
        if (!file.endsWith('.js') && !file.endsWith('.json')) return;
        const filePath = path.join(SCRATCH_DIR, file);
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            if (content.includes('0db0ea7a-c413-44cb-b99e-dfd9790383eb') || content.includes('Amalia Delgado') || content.includes('Fernando López')) {
                console.log(`Found reference in file: ${file}`);
            }
        } catch(e) {}
    });
}

run();
