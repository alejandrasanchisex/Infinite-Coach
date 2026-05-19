const fs = require('fs');

function fixSyntaxError(path) {
    let content = fs.readFileSync(path, 'utf8');
    
    // Fix backticks and template literals
    content = content.replace(/\\`/g, '`');
    content = content.replace(/\\\${/g, '${');
    
    fs.writeFileSync(path, content);
    console.log('Fixed syntax error in ' + path);
}

fixSyntaxError('public/trainer-media.html');
fixSyntaxError('public/trainer-media-pro.html');
