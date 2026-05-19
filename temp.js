
        let currentTab = 'exercise';
        let mediaCache = [];

        function setTab(t) {
            currentTab = t;
            document.querySelectorAll('.tab-item').forEach(b => b.classList.remove('active'));
            if(t === 'exercise') document.getElementById('t-v').classList.add('active');
            else if(t === 'recipe') document.getElementById('t-p').classList.add('active');
            else document.getElementById('t-h').classList.add('active');
            renderGrid();
        }

        async function renderGrid() {
            const grid = document.getElementById('grid');
            const query = document.getElementById('mediaSearch').value.toLowerCase();
            grid.innerHTML = '<div style="grid-column:1/-1; text-align:center; padding:5rem; opacity:0.5;">Cargando...</div>';
            try {
                if(window.syncFromCloud) await window.syncFromCloud();
                
                // --- AUTO-LIMPIEZA Y REPARACIÓN DE DATOS (v333) ---
                let data = getData();
                let needsSave = false;
                
                // 1. Purga de tortitas residuales
                const initialLen = data.media.length;
                data.media = data.media.filter(m => !m.title.toLowerCase().includes('tortitas de arroz pack'));
                if(data.media.length !== initialLen) {
                    console.log('v333: Limpieza de tortitas ejecutada.');
                    needsSave = true;
                }

                // 2. Reparación Masiva de Biblioteca (inyectar ingredientes si faltan)
                const repairMap = {
                    'tostada mediterránea': { ings: 'Pan integral, huevo poché, aguacate, tomate cherry, aceite de oliva virgen extra', desc: 'Grasas saludables y proteína de alto valor biológico.' },
                    'tostada con tomate y huevo': { ings: 'Pan integral tostado, tomate rallado, huevo poché, aceite de oliva virgen extra', desc: 'Desayuno clásico mediterráneo alto en proteína.' },
                    'porridge pro': { ings: 'Avena integral, proteína en polvo isolate, crema de cacahuete, canela, agua o leche', desc: 'Desayuno energético con carbohidratos complejos.' },
                    'bowl tropical': { ings: 'Kéfir natural, mango maduro, coco rallado, semillas de chía', desc: 'Frescura y probióticos naturales para empezar el día.' },
                    'ensalada de quinoa y gambas': { ings: 'Quinoa cocida, gambas a la plancha, mango, cilantro, lima', desc: 'Sabor fresco y ligero para días calurosos.' },
                    'hummus toast': { ings: 'Pan integral tostado, hummus de garbanzo, huevo cocido, sésamo', desc: 'Proteína vegetal y carbohidratos de absorción lenta.' },
                    'sushi casero fit': { ings: 'Arroz para sushi (sin azúcar), alga nori, salmón fresco, pepino, aguacate', desc: 'Controla el azúcar del arroz disfrutando del sushi.' }
                };

                data.media.forEach(m => {
                    const titleLow = m.title ? m.title.toLowerCase() : '';
                    for(let key in repairMap) {
                        if(titleLow.includes(key) && (!m.ingredients || m.ingredients === 'N/A' || m.ingredients === '')) {
                            m.ingredients = repairMap[key].ings;
                            m.description = m.description || repairMap[key].desc;
                            console.log(`v335: Reparada receta: ${m.title}`);
                            needsSave = true;
                        }
                    }
                });

                if(needsSave) saveData(data);
                
                mediaCache = Media.getAll();
                
                // Actualizar contadores discretos
                const countEx = mediaCache.filter(m => m.category === 'exercise' && m.status !== 'hidden').length;
                const countRec = mediaCache.filter(m => m.category === 'recipe' && m.status !== 'hidden').length;
                const countHid = mediaCache.filter(m => m.status === 'hidden').length;
                
                document.getElementById('count-ex').textContent = `(${countEx})`;
                document.getElementById('count-rec').textContent = `(${countRec})`;
                document.getElementById('count-hid').textContent = `(${countHid})`;

                const items = mediaCache.filter(m => {
                    const matchesTab = (currentTab === 'hidden') ? m.status === 'hidden' : (m.category === currentTab && m.status !== 'hidden');
                    return matchesTab && m.title.toLowerCase().includes(query);
                });

                let topBarHtml = '';
                if (currentTab === 'hidden' && items.length > 0) {
                    topBarHtml = `
                        <div style="grid-column: 1/-1; display: flex; gap: 1rem; justify-content: flex-end; margin-bottom: 1rem;">
                            <button class="btn-ver" style="background:#28a745;" onclick="restoreAllHidden()"><i class="fas fa-undo"></i> Restaurar todo</button>
                            <button class="btn-sq" style="background:var(--error-color); width:auto; padding:0 1rem; color:white;" onclick="deleteAllHidden()"><i class="fas fa-trash"></i> Eliminar definitivamente</button>
                        </div>
                    `;
                }
                
                
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
                        html += `<div class="exercise-group">`;
                        html += `<h3 class="group-title">${gName} (${groups[gName].length})</h3>`;
                        html += `<div class="exercise-list">`;
                        
                        // Ordenar ejercicios alfabéticamente dentro del grupo
                        groups[gName].sort((a,b) => a.title.localeCompare(b.title)).forEach(m => {
                            html += `
                            <div class="exercise-item">
                                <span class="ex-title"><i class="fas fa-play-circle" style="color:var(--primary-color); margin-right:8px;"></i> ${m.title}</span>
                                <div class="ex-actions">
                                    <button class="btn-ver" onclick="showMediaDetail('${m.id}')"><i class="fas fa-eye"></i> VER</button>
                                    <button class="btn-sq" style="background: rgba(255,255,255,0.15);" onclick="openEditModal('${m.id}')"><i class="fas fa-edit"></i></button>
                                    <button class="btn-sq" style="background:var(--error-color);" onclick="deleteItemPermanently('${m.id}')"><i class="fas fa-trash"></i></button>
                                </div>
                            </div>
                            `;
                        });
                        
                        html += `</div></div>`;
                    });
                    
                    if(sortedGroupNames.length === 0) {
                        html += '<div style="text-align:center; padding:3rem; opacity:0.5;">No hay ejercicios que coincidan con la búsqueda.</div>';
                    }
                    
                    grid.innerHTML = html;

                } else {
                    grid.style.display = 'grid'; // Restaurar el grid normal para recetas y ocultos
                    grid.innerHTML = topBarHtml + items.map(m => `
                        <div class="media-card">
                            <div class="media-img"><img src="${m.category === 'recipe' ? m.url : (getYouTubeId(m.url) ? 'https://img.youtube.com/vi/'+getYouTubeId(m.url)+'/maxresdefault.jpg' : m.url)}" loading="lazy"></div>
                            <div class="media-title">${m.title}</div>
                            <div class="actions">
                                ${currentTab === 'hidden' ? `
                                    <button class="btn-ver" style="background:#28a745;" onclick="restoreItem('${m.id}')"><i class="fas fa-undo"></i> Restaurar</button>
                                    <button class="btn-sq" style="background:var(--error-color);" onclick="deleteItemPermanently('${m.id}')"><i class="fas fa-trash"></i></button>
                                ` : `
                                    <button class="btn-ver" onclick="showMediaDetail('${m.id}')"><i class="fas fa-eye"></i> VER</button>
                                    <button class="btn-sq" style="background: rgba(255,255,255,0.15);" onclick="openEditModal('${m.id}')"><i class="fas fa-edit"></i></button>
                                    <button class="btn-sq" style="background:var(--error-color);" onclick="deleteItemPermanently('${m.id}')"><i class="fas fa-trash"></i></button>
                                `}
                            </div>
                        </div>
                    `).join('');
                }

            } catch(e) { console.error(e); }
        }

        async function handleFileUpload(input) {
            const file = input.files[0]; if(!file) return;
            const btn = document.getElementById('btnSave'); btn.disabled = true; btn.textContent = "Subiendo...";
            try {
                const url = await CloudStorage.uploadMedia(file);
                if(url) { document.getElementById('editUrl').value = url; alert("¡Cargada!"); }
            } catch(e) { alert("Error al subir."); } finally { btn.disabled = false; btn.textContent = "Guardar Cambios"; }
        }

        function openEditModal(id) {
            const m = mediaCache.find(item => item.id == id);
            if(!m) return;
            document.getElementById('editId').value = m.id;
            document.getElementById('editUrl').value = m.url;
            document.getElementById('editTitle').value = m.title;
            document.getElementById('editDesc').value = m.description || "";
            
            if (m.category === 'exercise') {
                document.getElementById('editUrlLabel').innerText = 'Enlace del Vídeo (YouTube, Vimeo, etc.)';
                document.getElementById('uploadBtnLabel').style.display = 'none';
                
                document.getElementById('editIngredientsGroup').style.display = 'none';
                document.getElementById('editMuscleGroup').style.display = 'block';
                document.getElementById('editMuscle').value = Array.isArray(m.muscleGroup) ? m.muscleGroup.join(', ') : (m.muscleGroup || "");
            } else {
                document.getElementById('editUrlLabel').innerText = 'Imagen de la Ficha';
                document.getElementById('uploadBtnLabel').style.display = 'inline-flex';
                
                document.getElementById('editIngredientsGroup').style.display = 'block';
                document.getElementById('editMuscleGroup').style.display = 'none';
                document.getElementById('editIngredients').value = Array.isArray(m.ingredients) ? m.ingredients.join(', ') : (m.ingredients || "");
            }
            
            document.getElementById('editModal').style.display = 'flex';
        }

        async function saveChanges() {
            const id = document.getElementById('editId').value;
            const m = mediaCache.find(item => item.id == id);
            const updateData = {
                url: document.getElementById('editUrl').value,
                title: document.getElementById('editTitle').value,
                description: document.getElementById('editDesc').value
            };
            if (m && m.category === 'exercise') {
                updateData.muscleGroup = document.getElementById('editMuscle').value;
            } else {
                updateData.ingredients = document.getElementById('editIngredients').value;
            }
            await Media.update(id, updateData);
            closeEditModal(); renderGrid();
        }

                async function restoreItem(id) {
            const data = getData();
            if (data.hidden_system_media) {
                data.hidden_system_media = data.hidden_system_media.filter(hId => hId !== id);
                saveData(data);
                await renderGrid();
            }
        }

        function deleteItemPermanently(id) {
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
        }

        function getYouTubeId(url) {
            if(!url) return null;
            const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
            const match = url.match(regExp);
            return (match && match[2].length === 11) ? match[2] : null;
        }

        function showMediaDetail(id) {
            const m = mediaCache.find(item => item.id == id); if(!m) return;
            
            const ytId = getYouTubeId(m.url);
            document.getElementById('modalImg').src = ytId ? 'https://img.youtube.com/vi/'+ytId+'/maxresdefault.jpg' : m.url;
            
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
                    html += groups.map(g => `<span style="background: rgba(165,94,234,0.2); padding: 4px 10px; border-radius: 20px; font-size: 0.85rem; margin-right: 6px; display:inline-block; margin-bottom: 6px;">${cap(g.trim())}</span>`).join('');
                } else {
                    html += '<div style="color:#cbd5e1; margin-bottom:1rem;">N/A</div>';
                }
                
                if(m.url) {
                    html += `<div style="margin-top: 1rem;"><a href="${m.url}" target="_blank" style="color: var(--primary-color); text-decoration: none; font-weight: bold; display: flex; align-items: center; gap: 6px;"><i class="fab fa-youtube"></i> Ver Video Original</a></div>`;
                }
                ingWrap.innerHTML = html;
            } else {
                tag.innerHTML = '🥗 Receta Saludable';
                sec2Title.innerHTML = '<i class="far fa-heart"></i> Alimentos / Ingredientes';
                if(m.ingredients) {
                    const ings = Array.isArray(m.ingredients) ? m.ingredients : m.ingredients.split(',');
                    ingWrap.innerHTML = ings.map(i => `<div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;color:#cbd5e1;"><div style="width:12px;height:2px;background:var(--primary-color);border-radius:2px;"></div><span>${cap(i.trim())}</span></div>`).join('');
                } else { 
                    ingWrap.innerHTML = 'N/A'; 
                }
            }
            
            document.getElementById('mediaModal').style.display = 'flex';
        }

        function closeMediaModal() { document.getElementById('mediaModal').style.display = 'none'; }
        function closeEditModal() { document.getElementById('editModal').style.display = 'none'; }
        function toggleMenu() { document.getElementById('navLinks').classList.toggle('active'); }
        window.onclick = (e) => { 
            if(e.target == document.getElementById('mediaModal')) closeMediaModal(); 
            if(e.target == document.getElementById('editModal')) closeEditModal(); 
        };
        window.onload = () => { if(typeof BrandConfig !== 'undefined') BrandConfig.applyTheme(); renderGrid(); };
    