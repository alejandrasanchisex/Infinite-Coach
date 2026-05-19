const fs = require('fs');

function addHiddenActions(path) {
    let content = fs.readFileSync(path, 'utf8');
    
    // Add the buttons to the grid render
    const oldGridRender = `                grid.innerHTML = items.map(m => \`
                    <div class="media-card">`;
    
    const newGridRender = `                let topBarHtml = '';
                if (currentTab === 'hidden' && items.length > 0) {
                    topBarHtml = \`
                        <div style="grid-column: 1/-1; display: flex; gap: 1rem; justify-content: flex-end; margin-bottom: 1rem;">
                            <button class="btn-ver" style="background:#28a745;" onclick="restoreAllHidden()"><i class="fas fa-undo"></i> Restaurar todo</button>
                            <button class="btn-sq" style="background:var(--error-color); width:auto; padding:0 1rem; color:white;" onclick="deleteAllHidden()"><i class="fas fa-trash"></i> Eliminar definitivamente</button>
                        </div>
                    \`;
                }
                
                grid.innerHTML = topBarHtml + items.map(m => \`
                    <div class="media-card">`;
                    
    if (content.includes(oldGridRender)) {
        content = content.replace(oldGridRender, newGridRender);
    }
    
    // Add the functions
    const oldFunctions = `        function deleteItemPermanently(id) {
            if(confirm("¿BORRAR DEFINITIVAMENTE?")) { Media.delete(id); renderGrid(); }
        }`;
        
    const newFunctions = `        function deleteItemPermanently(id) {
            if(confirm("¿BORRAR DEFINITIVAMENTE?")) { Media.delete(id); renderGrid(); }
        }

        async function restoreAllHidden() {
            if(confirm("¿Estás seguro de que deseas restaurar todas las recetas y vídeos ocultos?")) {
                const data = getData();
                data.hidden_system_media = [];
                saveData(data);
                await renderGrid();
            }
        }

        async function deleteAllHidden() {
            if(confirm("¿ATENCIÓN: BORRAR TODOS LOS ELEMENTOS OCULTOS DEFINITIVAMENTE? Esta acción no se puede deshacer.")) {
                const data = getData();
                // To permanently delete, we remove custom items entirely.
                // System items technically cannot be deleted from the codebase, but we can leave them in hidden or clear personal data.
                // Wait, if we empty hidden_system_media, system items will reapppear!
                // We shouldn't empty hidden_system_media for system items if we want them "deleted".
                // We'll clear the 'media' array of any personal items that are currently hidden.
                data.media = data.media.filter(m => !data.hidden_system_media.includes(m.id));
                // System items stay hidden. Actually, if they want to permanently delete them, they can't.
                // For now, let's just do what they asked.
                saveData(data);
                alert("Los elementos personales ocultos han sido eliminados de la base de datos local. Las recetas oficiales del sistema permanecen ocultas (no se pueden borrar del código fuente).");
                await renderGrid();
            }
        }`;
        
    if (content.includes(oldFunctions)) {
        content = content.replace(oldFunctions, newFunctions);
    }
    
    // Also, change card buttons in hidden tab?
    // If currentTab == 'hidden', maybe we should change the buttons on the card too?
    const oldCardActions = `                        <div class="actions">
                            <button class="btn-ver" onclick="showMediaDetail('\${m.id}')"><i class="fas fa-eye"></i> VER</button>
                            <button class="btn-sq" style="background:var(--accent-color);" onclick="openEditModal('\${m.id}')"><i class="fas fa-pen"></i></button>
                            <button class="btn-sq" style="background:var(--error-color);" onclick="deleteItemPermanently('\${m.id}')"><i class="fas fa-trash"></i></button>
                        </div>`;
                        
    const newCardActions = `                        <div class="actions">
                            \${currentTab === 'hidden' ? \`
                                <button class="btn-ver" style="background:#28a745;" onclick="restoreItem('\${m.id}')"><i class="fas fa-undo"></i> Restaurar</button>
                                <button class="btn-sq" style="background:var(--error-color);" onclick="deleteItemPermanently('\${m.id}')"><i class="fas fa-trash"></i></button>
                            \` : \`
                                <button class="btn-ver" onclick="showMediaDetail('\${m.id}')"><i class="fas fa-eye"></i> VER</button>
                                <button class="btn-sq" style="background:var(--accent-color);" onclick="openEditModal('\${m.id}')"><i class="fas fa-pen"></i></button>
                                <button class="btn-sq" style="background:var(--error-color);" onclick="deleteItemPermanently('\${m.id}')"><i class="fas fa-trash"></i></button>
                            \`}
                        </div>`;
                        
    if (content.includes(oldCardActions)) {
        content = content.replace(oldCardActions, newCardActions);
    }
    
    const restoreItemFunc = `        async function restoreItem(id) {
            const data = getData();
            if (data.hidden_system_media) {
                data.hidden_system_media = data.hidden_system_media.filter(hId => hId !== id);
                saveData(data);
                await renderGrid();
            }
        }`;
        
    if (!content.includes('function restoreItem')) {
        content = content.replace('function deleteItemPermanently(id) {', restoreItemFunc + '\n\n        function deleteItemPermanently(id) {');
    }
    
    // Update cache buster
    content = content.replace(/js\/data-models\.js\?v=\d+/g, 'js/data-models.js?v=20260518');
    
    fs.writeFileSync(path, content);
    console.log('Added hidden actions to ' + path);
}

addHiddenActions('public/trainer-media.html');
addHiddenActions('public/trainer-media-pro.html');
