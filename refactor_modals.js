const fs = require('fs');

function refactorModals(path) {
    let content = fs.readFileSync(path, 'utf8');

    // Refactor Display Modal HTML
    content = content.replace(
        '<div class="modal-tag">🥗 Receta Saludable</div>',
        '<div id="modalTag" class="modal-tag">🥗 Receta Saludable</div>'
    );
    
    content = content.replace(
        '<div style="font-size: 0.8rem; font-weight: 800; color: #a55eea; text-transform: uppercase; margin-bottom: 0.8rem; display: flex; align-items: center; gap: 6px;"><i class="far fa-heart"></i> Alimentos / Ingredientes</div>',
        '<div id="modalSection2Title" style="font-size: 0.8rem; font-weight: 800; color: #a55eea; text-transform: uppercase; margin-bottom: 0.8rem; display: flex; align-items: center; gap: 6px;"><i class="far fa-heart"></i> Alimentos / Ingredientes</div>'
    );

    // Refactor Display Modal JS
    const oldShowMediaDetail = `        function showMediaDetail(id) {
            const m = mediaCache.find(item => item.id == id); if(!m) return;
            document.getElementById('modalImg').src = m.url;
            document.getElementById('modalTitle').textContent = m.title;
            document.getElementById('modalDesc').textContent = m.description || "Contenido profesional.";
            const ingWrap = document.getElementById('modalIngredients');
            const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
            if(m.ingredients) {
                const ings = Array.isArray(m.ingredients) ? m.ingredients : m.ingredients.split(',');
                ingWrap.innerHTML = ings.map(i => \`<div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;color:#cbd5e1;"><div style="width:12px;height:2px;background:var(--primary-color);border-radius:2px;"></div><span>\${cap(i.trim())}</span></div>\`).join('');
            } else { ingWrap.innerHTML = 'N/A'; }
            document.getElementById('mediaModal').style.display = 'flex';
        }`;

    const newShowMediaDetail = `        function getYouTubeId(url) {
            if(!url) return null;
            const regExp = /^.*(youtu.be\\/|v\\/|u\\/\\w\\/|embed\\/|watch\\?v=|&v=)([^#&?]*).*/;
            const match = url.match(regExp);
            return (match && match[2].length === 11) ? match[2] : null;
        }

        function showMediaDetail(id) {
            const m = mediaCache.find(item => item.id == id); if(!m) return;
            
            const ytId = getYouTubeId(m.url);
            document.getElementById('modalImg').src = ytId ? \`https://img.youtube.com/vi/\${ytId}/maxresdefault.jpg\` : m.url;
            document.getElementById('modalTitle').textContent = m.title;
            document.getElementById('modalDesc').textContent = m.description || (m.category === 'exercise' ? "Ejercicio profesional." : "Contenido profesional.");
            
            const ingWrap = document.getElementById('modalIngredients');
            const tag = document.getElementById('modalTag');
            const sec2Title = document.getElementById('modalSection2Title');
            
            const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
            
            if (m.category === 'exercise') {
                tag.innerHTML = '🏋️ Ejercicio';
                sec2Title.innerHTML = '<i class="fas fa-dumbbell"></i> Grupos Musculares / Video';
                
                let html = '';
                if(m.muscleGroup) {
                    const groups = Array.isArray(m.muscleGroup) ? m.muscleGroup : m.muscleGroup.split(',');
                    html += groups.map(g => \`<span style="background: rgba(165,94,234,0.2); padding: 4px 10px; border-radius: 20px; font-size: 0.85rem; margin-right: 6px; display:inline-block; margin-bottom: 6px;">\${cap(g.trim())}</span>\`).join('');
                } else {
                    html += '<div style="color:#cbd5e1; margin-bottom:1rem;">N/A</div>';
                }
                
                if(m.url) {
                    html += \`<div style="margin-top: 1rem;"><a href="\${m.url}" target="_blank" style="color: var(--primary-color); text-decoration: none; font-weight: bold; display: flex; align-items: center; gap: 6px;"><i class="fab fa-youtube"></i> Ver Video Original</a></div>\`;
                }
                ingWrap.innerHTML = html;
            } else {
                tag.innerHTML = '🥗 Receta Saludable';
                sec2Title.innerHTML = '<i class="far fa-heart"></i> Alimentos / Ingredientes';
                if(m.ingredients) {
                    const ings = Array.isArray(m.ingredients) ? m.ingredients : m.ingredients.split(',');
                    ingWrap.innerHTML = ings.map(i => \`<div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;color:#cbd5e1;"><div style="width:12px;height:2px;background:var(--primary-color);border-radius:2px;"></div><span>\${cap(i.trim())}</span></div>\`).join('');
                } else { 
                    ingWrap.innerHTML = 'N/A'; 
                }
            }
            
            document.getElementById('mediaModal').style.display = 'flex';
        }`;

    if (content.includes('function showMediaDetail(id) {')) {
        content = content.replace(oldShowMediaDetail, newShowMediaDetail);
    }

    // Refactor Grid Renderer to extract Youtube ID for images
    const oldGridImage = '<div class="media-img"><img src="${m.url}" loading="lazy"></div>';
    const newGridImage = \`<div class="media-img"><img src="\${getYouTubeId(m.url) ? 'https://img.youtube.com/vi/'+getYouTubeId(m.url)+'/maxresdefault.jpg' : m.url}" loading="lazy"></div>\`;
    if (content.includes(oldGridImage)) {
        content = content.replace(oldGridImage, newGridImage);
    }

    // Refactor Edit Modal HTML
    const oldEditForm = `            <div class="form-group">
                <label>Ingredientes (separados por comas)</label>
                <textarea id="editIngredients" class="form-control"></textarea>
            </div>`;
    const newEditForm = `            <div class="form-group" id="editIngredientsGroup">
                <label>Ingredientes (separados por comas)</label>
                <textarea id="editIngredients" class="form-control"></textarea>
            </div>
            <div class="form-group" id="editMuscleGroup" style="display: none;">
                <label>Grupos Musculares (separados por comas)</label>
                <input type="text" id="editMuscle" class="form-control" placeholder="Ej: Pecho, Tríceps, Hombros">
            </div>`;
    if (content.includes(oldEditForm)) {
        content = content.replace(oldEditForm, newEditForm);
    }

    // Refactor openEditModal JS
    const oldOpenEdit = `        function openEditModal(id) {
            const m = mediaCache.find(item => item.id == id);
            if(!m) return;
            document.getElementById('editId').value = m.id;
            document.getElementById('editUrl').value = m.url;
            document.getElementById('editTitle').value = m.title;
            document.getElementById('editDesc').value = m.description || "";
            document.getElementById('editIngredients').value = Array.isArray(m.ingredients) ? m.ingredients.join(', ') : (m.ingredients || "");
            document.getElementById('editModal').style.display = 'flex';
        }`;

    const newOpenEdit = `        function openEditModal(id) {
            const m = mediaCache.find(item => item.id == id);
            if(!m) return;
            document.getElementById('editId').value = m.id;
            document.getElementById('editUrl').value = m.url;
            document.getElementById('editTitle').value = m.title;
            document.getElementById('editDesc').value = m.description || "";
            
            if (m.category === 'exercise') {
                document.getElementById('editIngredientsGroup').style.display = 'none';
                document.getElementById('editMuscleGroup').style.display = 'block';
                document.getElementById('editMuscle').value = Array.isArray(m.muscleGroup) ? m.muscleGroup.join(', ') : (m.muscleGroup || "");
            } else {
                document.getElementById('editIngredientsGroup').style.display = 'block';
                document.getElementById('editMuscleGroup').style.display = 'none';
                document.getElementById('editIngredients').value = Array.isArray(m.ingredients) ? m.ingredients.join(', ') : (m.ingredients || "");
            }
            
            document.getElementById('editModal').style.display = 'flex';
        }`;

    if (content.includes('function openEditModal(id) {')) {
        content = content.replace(oldOpenEdit, newOpenEdit);
    }

    // Refactor saveChanges JS
    const oldSave = `        async function saveChanges() {
            const id = document.getElementById('editId').value;
            const updateData = {
                url: document.getElementById('editUrl').value,
                title: document.getElementById('editTitle').value,
                description: document.getElementById('editDesc').value,
                ingredients: document.getElementById('editIngredients').value
            };
            await Media.update(id, updateData);
            closeEditModal(); renderGrid();
        }`;
    const newSave = `        async function saveChanges() {
            const id = document.getElementById('editId').value;
            const m = mediaCache.find(item => item.id == id);
            const updateData = {
                url: document.getElementById('editUrl').value,
                title: document.getElementById('editTitle').value,
                description: document.getElementById('editDesc').value,
            };
            if (m && m.category === 'exercise') {
                updateData.muscleGroup = document.getElementById('editMuscle').value;
            } else {
                updateData.ingredients = document.getElementById('editIngredients').value;
            }
            await Media.update(id, updateData);
            closeEditModal(); renderGrid();
        }`;
    if (content.includes('async function saveChanges() {')) {
        content = content.replace(oldSave, newSave);
    }
    
    // Add getYouTubeId if missing
    if (!content.includes('function getYouTubeId')) {
        content = content.replace('<script>', '<script>\n        function getYouTubeId(url) {\n            if(!url) return null;\n            const regExp = /^.*(youtu.be\\/|v\\/|u\\/\\w\\/|embed\\/|watch\\?v=|&v=)([^#&?]*).*/;\n            const match = url.match(regExp);\n            return (match && match[2].length === 11) ? match[2] : null;\n        }\n');
    }

    // Update Cache Buster
    content = content.replace(/js\/data-models\.js\?v=\d+/g, 'js/data-models.js?v=20260521');

    fs.writeFileSync(path, content);
    console.log('Refactored modals in ' + path);
}

refactorModals('public/trainer-media.html');
refactorModals('public/trainer-media-pro.html');
