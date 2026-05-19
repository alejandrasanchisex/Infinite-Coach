const fs = require('fs');

function implementExerciseGroups(path) {
    let content = fs.readFileSync(path, 'utf8');

    // First, let's inject a CSS for the exercise lists
    const cssToInject = `
    <style>
        .exercise-group { margin-bottom: 2rem; background: rgba(255,255,255,0.02); border-radius: 16px; padding: 1.5rem; border-left: 4px solid var(--primary-color); }
        .group-title { margin-top: 0; margin-bottom: 1.5rem; font-size: 1.2rem; font-weight: 800; color: var(--primary-color); text-transform: uppercase; letter-spacing: 1px; }
        .exercise-item { display: flex; justify-content: space-between; align-items: center; padding: 1rem; border-bottom: 1px solid rgba(255,255,255,0.05); transition: background 0.2s; }
        .exercise-item:last-child { border-bottom: none; }
        .exercise-item:hover { background: rgba(255,255,255,0.05); }
        .ex-title { font-weight: 600; font-size: 1rem; color: #fff; }
        .ex-actions { display: flex; gap: 8px; }
    </style>
    `;
    
    if(!content.includes('.exercise-group {')) {
        content = content.replace('</head>', cssToInject + '</head>');
    }

    // Now modify renderGrid logic
    const oldRenderLogic = `                grid.innerHTML = topBarHtml + items.map(m => \`
                    <div class="media-card">
                        <div class="media-img"><img src="\${getYouTubeId(m.url) ? 'https://img.youtube.com/vi/'+getYouTubeId(m.url)+'/maxresdefault.jpg' : m.url}" loading="lazy"></div>
                        <div class="media-title">\${m.title}</div>
                        <div class="actions">
                            \${currentTab === 'hidden' ? \`
                                <button class="btn-ver" style="background:#28a745;" onclick="restoreItem('\${m.id}')"><i class="fas fa-undo"></i> Restaurar</button>
                                <button class="btn-sq" style="background:var(--error-color);" onclick="deleteItemPermanently('\${m.id}')"><i class="fas fa-trash"></i></button>
                            \` : \`
                                <button class="btn-ver" onclick="showMediaDetail('\${m.id}')"><i class="fas fa-eye"></i> VER</button>
                                <button class="btn-sq" onclick="openEditModal('\${m.id}')"><i class="fas fa-edit"></i></button>
                                <button class="btn-sq" style="background:var(--error-color);" onclick="deleteItemPermanently('\${m.id}')"><i class="fas fa-trash"></i></button>
                            \`}
                        </div>
                    </div>
                \`).join('');`;

    const newRenderLogic = `
                if (currentTab === 'exercise') {
                    // Agrupar por grupo muscular
                    grid.style.display = 'block'; // Quitar el grid normal
                    const groups = {};
                    items.forEach(m => {
                        let g = m.muscleGroup || 'Sin Grupo Asignado';
                        // Si es un array o string separado por comas, tomamos el primero para agrupar
                        if(Array.isArray(g)) g = g[0];
                        else if(typeof g === 'string' && g.includes(',')) g = g.split(',')[0].trim();
                        g = g.charAt(0).toUpperCase() + g.slice(1);
                        
                        if(!groups[g]) groups[g] = [];
                        groups[g].push(m);
                    });

                    // Ordenar grupos alfabéticamente, pero dejar "Sin Grupo Asignado" al final
                    const sortedGroupNames = Object.keys(groups).sort((a,b) => {
                        if(a === 'Sin Grupo Asignado') return 1;
                        if(b === 'Sin Grupo Asignado') return -1;
                        return a.localeCompare(b);
                    });

                    let html = topBarHtml;
                    sortedGroupNames.forEach(gName => {
                        html += \`<div class="exercise-group">\`;
                        html += \`<h3 class="group-title">\${gName} (\${groups[gName].length})</h3>\`;
                        html += \`<div class="exercise-list">\`;
                        
                        // Ordenar ejercicios alfabéticamente dentro del grupo
                        groups[gName].sort((a,b) => a.title.localeCompare(b.title)).forEach(m => {
                            html += \`
                            <div class="exercise-item">
                                <span class="ex-title"><i class="fas fa-play-circle" style="color:var(--primary-color); margin-right:8px;"></i> \${m.title}</span>
                                <div class="ex-actions">
                                    <button class="btn-ver" onclick="showMediaDetail('\${m.id}')"><i class="fas fa-eye"></i> VER</button>
                                    <button class="btn-sq" onclick="openEditModal('\${m.id}')"><i class="fas fa-edit"></i></button>
                                    <button class="btn-sq" style="background:var(--error-color);" onclick="deleteItemPermanently('\${m.id}')"><i class="fas fa-trash"></i></button>
                                </div>
                            </div>
                            \`;
                        });
                        
                        html += \`</div></div>\`;
                    });
                    
                    if(sortedGroupNames.length === 0) {
                        html += '<div style="text-align:center; padding:3rem; opacity:0.5;">No hay ejercicios que coincidan con la búsqueda.</div>';
                    }
                    
                    grid.innerHTML = html;

                } else {
                    grid.style.display = 'grid'; // Restaurar el grid normal para recetas y ocultos
                    grid.innerHTML = topBarHtml + items.map(m => \`
                        <div class="media-card">
                            <div class="media-img"><img src="\${m.category === 'recipe' ? m.url : (getYouTubeId(m.url) ? 'https://img.youtube.com/vi/'+getYouTubeId(m.url)+'/maxresdefault.jpg' : m.url)}" loading="lazy"></div>
                            <div class="media-title">\${m.title}</div>
                            <div class="actions">
                                \${currentTab === 'hidden' ? \`
                                    <button class="btn-ver" style="background:#28a745;" onclick="restoreItem('\${m.id}')"><i class="fas fa-undo"></i> Restaurar</button>
                                    <button class="btn-sq" style="background:var(--error-color);" onclick="deleteItemPermanently('\${m.id}')"><i class="fas fa-trash"></i></button>
                                \` : \`
                                    <button class="btn-ver" onclick="showMediaDetail('\${m.id}')"><i class="fas fa-eye"></i> VER</button>
                                    <button class="btn-sq" onclick="openEditModal('\${m.id}')"><i class="fas fa-edit"></i></button>
                                    <button class="btn-sq" style="background:var(--error-color);" onclick="deleteItemPermanently('\${m.id}')"><i class="fas fa-trash"></i></button>
                                \`}
                            </div>
                        </div>
                    \`).join('');
                }
`;

    // Only replace if we haven't already injected it
    if(!content.includes('grid.style.display = \'block\';')) {
        // We need to carefully replace the exact block.
        // It's safer to use regex or indexOf
        const startIdx = content.indexOf("grid.innerHTML = topBarHtml + items.map(m => `");
        const endStr = "                `).join('');";
        const endIdx = content.indexOf(endStr, startIdx);
        
        if (startIdx !== -1 && endIdx !== -1) {
            const partToReplace = content.substring(startIdx, endIdx + endStr.length);
            content = content.replace(partToReplace, newRenderLogic);
            
            // Also update cache buster
            content = content.replace(/js\/data-models\.js\?v=\d+/g, 'js/data-models.js?v=20260524');
            
            fs.writeFileSync(path, content);
            console.log('Successfully refactored exercise layout in ' + path);
        } else {
            console.log('Could not find render block in ' + path);
        }
    } else {
        console.log('Already refactored ' + path);
    }
}

implementExerciseGroups('public/trainer-media.html');
implementExerciseGroups('public/trainer-media-pro.html');
