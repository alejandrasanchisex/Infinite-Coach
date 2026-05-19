const fs = require('fs');

function addUnhideMigration(path) {
    let content = fs.readFileSync(path, 'utf8');
    
    const migrationLogic = `
    // 🔥 MIGRACIÓN ÚNICA: Restaurar recetas ocultas a activas
    if (!localStorage.getItem('v310_unhide_recipes_done')) {
        if (data.hidden_system_media) {
            data.hidden_system_media = data.hidden_system_media.filter(id => {
                const strId = String(id);
                // Si es ejercicio, se queda oculto si así lo querían
                if (strId.includes('-ex-') || strId.startsWith('sys-ex-')) return true;
                // Si es receta, se desoculta (return false para sacarlo de hidden_system_media)
                if (strId.includes('-rec-') || strId.startsWith('sys-br-') || strId.startsWith('sys-lun-') || strId.startsWith('sys-snack-') || strId.startsWith('prof-rec-')) return false;
                return false; // Desocultar cualquier otra cosa dudosa
            });
            localStorage.setItem('v310_unhide_recipes_done', 'true');
            try { localStorage.setItem(sKey, JSON.stringify(data)); } catch(e){}
            console.log('Restauradas recetas ocultas a activas.');
        }
    }
`;

    if (!content.includes('v310_unhide_recipes_done')) {
        content = content.replace(
            /const data = \{ \.\.\.defaults, \.\.\.parsed \};/,
            'const data = { ...defaults, ...parsed };\n' + migrationLogic
        );
        fs.writeFileSync(path, content);
        console.log('Added migration to ' + path);
    }
}

addUnhideMigration('public/js/data-models.js');
addUnhideMigration('js/data-models.js');
