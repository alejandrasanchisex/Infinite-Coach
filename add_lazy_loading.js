const fs = require('fs');

function addLazyLoading(path) {
    let content = fs.readFileSync(path, 'utf8');
    
    // Replace <img src="${m.url}"> with <img src="${m.url}" loading="lazy">
    const oldImg = '<div class="media-img"><img src="${m.url}"></div>';
    const newImg = '<div class="media-img"><img src="${m.url}" loading="lazy"></div>';
    
    if (content.includes(oldImg)) {
        content = content.replace(oldImg, newImg);
        console.log('Added lazy loading to ' + path);
    } else {
        // Try regex
        const regex = /<img\s+src="\$\{m\.url\}"\s*>/g;
        if (regex.test(content)) {
            content = content.replace(regex, '<img src="${m.url}" loading="lazy">');
            console.log('Added lazy loading via regex to ' + path);
        }
    }
    
    // Also add to any other image tags that might be missing it
    const oldImg2 = '<img src="${m.url}"';
    // Let's just do a string replacement if it doesn't already have loading="lazy"
    
    fs.writeFileSync(path, content);
}

addLazyLoading('public/trainer-media.html');
addLazyLoading('public/trainer-media-pro.html');
