const fs = require('fs');

function fixGetAll(path) {
    let content = fs.readFileSync(path, 'utf8');
    
    // Replace the mediaMap logic inside Media.getAll
    const oldLogic = `    system.forEach(item => {
        if (!hidden.includes(item.id)) mediaMap.set(String(item.id), { ...item, isSystem: true });
    });
    personal.forEach(m => mediaMap.set(String(m.id), { ...m, isSystem: String(m.id).startsWith('sys-') }));`;

    const newLogic = `    system.forEach(item => {
        const isHidden = hidden.includes(item.id);
        mediaMap.set(String(item.id), { ...item, isSystem: true, status: isHidden ? 'hidden' : 'active' });
    });
    personal.forEach(m => {
        const isHidden = hidden.includes(m.id);
        mediaMap.set(String(m.id), { ...m, isSystem: String(m.id).startsWith('sys-'), status: isHidden ? 'hidden' : 'active' });
    });`;

    if (content.includes(oldLogic)) {
        content = content.replace(oldLogic, newLogic);
        fs.writeFileSync(path, content);
        console.log('Fixed getAll in ' + path);
    } else {
        console.log('Could not find old logic in ' + path);
    }
}

fixGetAll('public/js/data-models.js');
fixGetAll('js/data-models.js');
