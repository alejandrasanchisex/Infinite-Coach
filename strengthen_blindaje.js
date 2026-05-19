const fs = require('fs');

function strengthenBlindaje(path) {
    let content = fs.readFileSync(path, 'utf8');

    // Fix update function
    const oldUpdate = `    let index = data.media.findIndex(m => m.id == id);
    if (index >= 0) {
        data.media[index] = { ...data.media[index], ...updates };
    } else if (String(id).startsWith('sys-')) {
        const sysItem = (window.SYSTEM_MEDIA || []).find(m => m.id == id);
        if (sysItem) {
            data.media.push({ ...sysItem, ...updates, id: id });
        }
    }`;

    const newUpdate = `    let index = data.media.findIndex(m => m.id == id);
    const isSysItem = String(id).startsWith('sys-') || (window.SYSTEM_RECIPES || []).some(r => r.id == id) || (window.SYSTEM_MEDIA || []).some(m => m.id == id);
    
    if (index >= 0) {
        data.media[index] = { ...data.media[index], ...updates };
    } else if (isSysItem) {
        const sysItem = (window.SYSTEM_RECIPES || []).find(m => m.id == id) || (window.SYSTEM_MEDIA || []).find(m => m.id == id);
        if (sysItem) {
            data.media.push({ ...sysItem, ...updates, id: id });
        }
    }`;

    // Fix delete function
    const oldDelete = `  delete: (id) => {
    const data = getData();
    if (String(id).startsWith('sys-')) {
        data.hidden_system_media.push(id);
    } else {
        data.media = data.media.filter(m => m.id != id);
    }`;

    const newDelete = `  delete: (id) => {
    const data = getData();
    const isSysItem = String(id).startsWith('sys-') || (window.SYSTEM_RECIPES || []).some(r => r.id == id) || (window.SYSTEM_MEDIA || []).some(m => m.id == id);
    
    if (isSysItem) {
        if (!data.hidden_system_media) data.hidden_system_media = [];
        data.hidden_system_media.push(id);
    } else {
        data.media = data.media.filter(m => m.id != id);
    }`;

    // Fix isSystem in getAll
    const oldGetAll = `let finalItem = { ...m, isSystem: String(m.id).startsWith('sys-'), status: isHidden ? 'hidden' : 'active' };`;
    const newGetAll = `const isSysItem = String(m.id).startsWith('sys-') || (window.SYSTEM_RECIPES || []).some(r => r.id == m.id) || (window.SYSTEM_MEDIA || []).some(sm => sm.id == m.id);
        let finalItem = { ...m, isSystem: isSysItem, status: isHidden ? 'hidden' : 'active' };`;

    if (content.includes(oldUpdate)) content = content.replace(oldUpdate, newUpdate);
    if (content.includes(oldDelete)) content = content.replace(oldDelete, newDelete);
    if (content.includes(oldGetAll)) content = content.replace(oldGetAll, newGetAll);
    
    fs.writeFileSync(path, content);
    console.log('Strengthened blindaje in ' + path);
}

strengthenBlindaje('public/js/data-models.js');
strengthenBlindaje('js/data-models.js');
