const fs = require('fs');

function fixEditButtonColor(path) {
    let content = fs.readFileSync(path, 'utf8');

    // Replace <button class="btn-sq" onclick="openEditModal(
    // with <button class="btn-sq" style="background: rgba(255,255,255,0.15);" onclick="openEditModal(
    
    content = content.replace(/<button class="btn-sq" onclick="openEditModal\('/g, '<button class="btn-sq" style="background: rgba(255,255,255,0.15);" onclick="openEditModal(\'');
    
    // update cache buster
    content = content.replace(/js\/data-models\.js\?v=\d+/g, 'js/data-models.js?v=20260526');

    fs.writeFileSync(path, content);
    console.log('Fixed edit button color in ' + path);
}

fixEditButtonColor('public/trainer-media.html');
fixEditButtonColor('public/trainer-media-pro.html');
