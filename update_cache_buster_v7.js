const fs = require('fs');

function updateCacheBuster(path) {
    let content = fs.readFileSync(path, 'utf8');
    content = content.replace(/js\/data-models\.js\?v=20260526/g, 'js/data-models.js?v=20260527');
    fs.writeFileSync(path, content);
    console.log('Updated cache buster in ' + path);
}

updateCacheBuster('public/trainer-media.html');
updateCacheBuster('public/trainer-media-pro.html');
