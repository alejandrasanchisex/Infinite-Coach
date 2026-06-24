/**
 * PERSONALIZATION MANAGER (Vanilla JS)
 * Dynamics 365 Business Central-style page element customization.
 */
const PersonalizationManager = {
    settingsKey: '_personalization_settings',
    modeKey: '_personalizationMode',

    getSettings() {
        try {
            return JSON.parse(localStorage.getItem(this.settingsKey)) || {};
        } catch (e) {
            return {};
        }
    },

    saveSettings(settings) {
        localStorage.setItem(this.settingsKey, JSON.stringify(settings));
    },

    isModeActive() {
        return localStorage.getItem(this.modeKey) === 'true';
    },

    enterMode() {
        localStorage.setItem(this.modeKey, 'true');
        const pageName = window.location.pathname.split('/').pop() || 'trainer-dashboard.html';
        if (!pageName.includes('trainer-dashboard.html')) {
            window.location.href = 'trainer-dashboard.html';
        } else {
            window.location.reload();
        }
    },

    exitMode() {
        localStorage.removeItem(this.modeKey);
        window.location.reload();
    },

    resetAll() {
        localStorage.removeItem(this.settingsKey);
        localStorage.removeItem(this.modeKey);
        window.location.reload();
    },

    init() {
        console.log("🛠️ PersonalizationManager initializing...");
        this.identifyElements();
        this.applyLayout();
        
        if (this.isModeActive()) {
            this.renderBanner();
            this.enableEditorMode();
        } else {
            this.setupNormalMode();
        }

        this.setupContextMenu();
        this.setupObservers();
    },

    identifyElements() {
        // 1. Navigation Menu List Items
        document.querySelectorAll('#navLinks li').forEach(li => {
            if (li.getAttribute('data-personalize-id')) return;
            const a = li.querySelector('a');
            if (a) {
                const href = a.getAttribute('href') || '';
                const match = href.match(/trainer-([a-z-]+)\.html/);
                if (match) {
                    li.setAttribute('data-personalize-id', 'nav-' + match[1]);
                } else if (href.includes('signOut') || a.textContent.includes('Salir')) {
                    li.setAttribute('data-personalize-id', 'nav-logout');
                }
            }
            li.parentNode.setAttribute('data-personalize-container', 'nav-links-menu');
        });

        // 2. Stats Grid KPIs (on dashboard)
        const statsGrid = document.querySelector('.grid.grid-6');
        if (statsGrid) {
            statsGrid.setAttribute('data-personalize-container', 'db-stats-grid');
            statsGrid.querySelectorAll('.card').forEach((card, idx) => {
                if (card.getAttribute('data-personalize-id')) return;
                const label = card.querySelector('.stat-label');
                if (label) {
                    const txt = label.textContent.trim().toLowerCase();
                    if (txt.includes('activos')) card.setAttribute('data-personalize-id', 'db-kpi-active-clients');
                    else if (txt.includes('ingresos')) card.setAttribute('data-personalize-id', 'db-kpi-revenue');
                    else if (txt.includes('pendientes') && txt.includes('pagos')) card.setAttribute('data-personalize-id', 'db-kpi-pending-payments');
                    else if (txt.includes('revisiones')) card.setAttribute('data-personalize-id', 'db-kpi-pending-feedbacks');
                    else if (txt.includes('llamadas')) card.setAttribute('data-personalize-id', 'db-kpi-calls-today');
                    else if (txt.includes('previsión')) card.setAttribute('data-personalize-id', 'db-kpi-forecast');
                    else card.setAttribute('data-personalize-id', 'db-kpi-idx-' + idx);
                } else {
                    card.setAttribute('data-personalize-id', 'db-kpi-idx-' + idx);
                }
            });
        }

        // 3. Main Grid Cards (on dashboard)
        const mainGrid = document.querySelector('.main-content .grid.grid-2');
        if (mainGrid) {
            mainGrid.setAttribute('data-personalize-container', 'db-main-grid');
            mainGrid.querySelectorAll('.card').forEach((card, idx) => {
                if (card.getAttribute('data-personalize-id')) return;
                const title = card.querySelector('.card-header .card-title, h3');
                if (title) {
                    const txt = title.textContent.trim().toLowerCase();
                    if (txt.includes('citas')) card.setAttribute('data-personalize-id', 'db-card-appointments');
                    else if (txt.includes('revisiones')) card.setAttribute('data-personalize-id', 'db-card-feedbacks');
                    else if (txt.includes('estado')) card.setAttribute('data-personalize-id', 'db-card-status');
                    else if (txt.includes('salud')) card.setAttribute('data-personalize-id', 'db-card-health');
                    else card.setAttribute('data-personalize-id', 'db-card-idx-' + idx);
                } else {
                    card.setAttribute('data-personalize-id', 'db-card-idx-' + idx);
                }
            });
        }

        // 4. General Cards on other pages
        document.querySelectorAll('.card').forEach((card, idx) => {
            if (card.getAttribute('data-personalize-id') || card.closest('.grid.grid-6') || card.closest('.main-content .grid.grid-2')) return;
            const header = card.querySelector('.card-header .card-title, h2, h3');
            if (header) {
                const txt = header.textContent.replace(/[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF]/g, '').trim().toLowerCase();
                const slug = txt.replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                if (slug) {
                    card.setAttribute('data-personalize-id', 'card-' + slug);
                    const parent = card.parentNode;
                    if (parent && !parent.getAttribute('data-personalize-container')) {
                        parent.setAttribute('data-personalize-container', 'container-' + slug);
                    }
                }
            }
        });

        // 5. Tables and table headers
        document.querySelectorAll('table').forEach((table, tableIdx) => {
            const theadRow = table.querySelector('thead tr');
            if (theadRow) {
                theadRow.setAttribute('data-personalize-container', `table-${tableIdx}-columns`);
                theadRow.querySelectorAll('th').forEach((th, colIdx) => {
                    if (th.getAttribute('data-personalize-id')) return;
                    const txt = th.textContent.trim().toLowerCase();
                    const slug = txt.replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                    th.setAttribute('data-personalize-id', `col-${slug || colIdx}`);
                });
            }
        });
    },

    applyLayout() {
        const pageName = window.location.pathname.split('/').pop() || 'index.html';
        const settings = this.getSettings();
        const pageSettings = settings[pageName] || {};
        const isEditing = this.isModeActive();

        // Apply container orders
        if (pageSettings.order) {
            Object.keys(pageSettings.order).forEach(containerId => {
                const container = document.querySelector(`[data-personalize-container="${containerId}"]`);
                if (container) {
                    const savedOrder = pageSettings.order[containerId];
                    savedOrder.forEach(id => {
                        const child = container.querySelector(`[data-personalize-id="${id}"]`);
                        if (child) {
                            container.appendChild(child);
                        }
                    });
                }
            });
        }

        // Apply visibilities
        const hiddenList = pageSettings.hidden || {};
        document.querySelectorAll('[data-personalize-id]').forEach(el => {
            const container = el.parentNode;
            const containerId = container ? container.getAttribute('data-personalize-container') : null;
            if (!containerId) return;

            const isHidden = hiddenList[containerId] && hiddenList[containerId].includes(el.getAttribute('data-personalize-id'));

            // Tables are handled separately because row cells need mapping
            if (el.tagName === 'TH') return;

            if (isHidden) {
                if (isEditing) {
                    el.style.display = '';
                    el.style.opacity = '0.4';
                    el.style.filter = 'grayscale(50%)';
                    el.style.border = '2px dashed #EF4444';
                } else {
                    el.style.display = 'none';
                }
            } else {
                el.style.display = '';
                el.style.opacity = '';
                el.style.filter = '';
                el.style.border = '';
            }
        });

        // Apply to tables
        document.querySelectorAll('table').forEach(table => {
            this.applyTableColumns(table);
        });
    },

    applyTableColumns(table) {
        const theadRow = table.querySelector('thead tr');
        if (!theadRow) return;

        const headers = Array.from(theadRow.querySelectorAll('th'));
        const headerIds = headers.map(th => th.getAttribute('data-personalize-id')).filter(Boolean);
        
        const pageName = window.location.pathname.split('/').pop() || 'index.html';
        const settings = this.getSettings();
        const pageSettings = settings[pageName] || {};
        const containerId = theadRow.getAttribute('data-personalize-container');
        const hiddenCols = pageSettings.hidden?.[containerId] || [];

        // Save original index mapping of header IDs
        if (!table._originalColMapping) {
            table._originalColMapping = {};
            headers.forEach((th, idx) => {
                const id = th.getAttribute('data-personalize-id');
                if (id) table._originalColMapping[id] = idx;
            });
        }

        const mapping = table._originalColMapping;
        const isEditing = this.isModeActive();

        // For each row in tbody, reorder cells
        table.querySelectorAll('tbody tr').forEach(tr => {
            const cells = Array.from(tr.children);
            if (cells.length < headers.length) return; // Skip loaders or empty stats

            headers.forEach(th => {
                const id = th.getAttribute('data-personalize-id');
                const origIdx = mapping[id];
                const cell = cells[origIdx];
                if (cell) {
                    tr.appendChild(cell);
                }
            });
        });

        // Hide columns that are hidden in settings
        headers.forEach((th, idx) => {
            const id = th.getAttribute('data-personalize-id');
            const shouldHide = hiddenCols.includes(id);

            if (shouldHide) {
                if (isEditing) {
                    th.style.display = '';
                    th.style.opacity = '0.4';
                    th.style.filter = 'grayscale(50%)';
                    th.style.border = '1px dashed #EF4444';
                    
                    table.querySelectorAll('tbody tr').forEach(tr => {
                        const cell = tr.children[idx];
                        if (cell) {
                            cell.style.display = '';
                            cell.style.opacity = '0.4';
                            cell.style.filter = 'grayscale(50%)';
                        }
                    });
                } else {
                    th.style.display = 'none';
                    table.querySelectorAll('tr').forEach(tr => {
                        const cell = tr.children[idx];
                        if (cell) cell.style.display = 'none';
                    });
                }
            } else {
                th.style.display = '';
                th.style.opacity = '';
                th.style.filter = '';
                th.style.border = '';
                
                table.querySelectorAll('tr').forEach(tr => {
                    const cell = tr.children[idx];
                    if (cell) {
                        cell.style.display = '';
                        cell.style.opacity = '';
                        cell.style.filter = '';
                    }
                });
            }
        });
    },

    renderBanner() {
        if (document.getElementById('personalization-banner')) return;

        const banner = document.createElement('div');
        banner.id = 'personalization-banner';
        banner.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 50px;
            background: #8B5CF6;
            color: white;
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0 20px;
            z-index: 100000;
            font-weight: 600;
            box-shadow: 0 2px 10px rgba(0,0,0,0.3);
            border-bottom: 2px solid #a78bfa;
            box-sizing: border-box;
        `;
        banner.innerHTML = `
            <div style="display: flex; align-items: center; gap: 8px; font-family: sans-serif; font-size: 0.9rem;">
                <span>🛠️ <strong>Modo Personalización Activo</strong>. Haz clic derecho en elementos para ocultar, u ordena con las flechas.</span>
            </div>
            <div style="display: flex; gap: 10px;">
                <button onclick="PersonalizationManager.resetAll()" style="background: rgba(255,255,255,0.2); color: white; border: none; font-weight: 600; cursor: pointer; padding: 6px 12px; border-radius: 4px; font-size: 0.8rem;">Restablecer</button>
                <button onclick="PersonalizationManager.exitMode()" style="background: white; color: #8B5CF6; border: none; font-weight: 700; cursor: pointer; padding: 6px 15px; border-radius: 4px; font-size: 0.8rem;">Guardar y Salir</button>
            </div>
        `;
        document.body.appendChild(banner);
        document.body.style.paddingTop = '50px';
    },

    enableEditorMode() {
        const pageName = window.location.pathname.split('/').pop() || 'index.html';
        const settings = this.getSettings();
        const pageSettings = settings[pageName] || {};
        const hiddenList = pageSettings.hidden || {};

        document.querySelectorAll('[data-personalize-id]').forEach(el => {
            const id = el.getAttribute('data-personalize-id');
            const container = el.parentNode;
            const containerId = container ? container.getAttribute('data-personalize-container') : null;
            if (!containerId) return;

            const isHidden = hiddenList[containerId] && hiddenList[containerId].includes(id);

            if (el.tagName === 'TH') {
                el.querySelectorAll('.personalize-th-controls').forEach(x => x.remove());
                const controls = document.createElement('span');
                controls.className = 'personalize-th-controls';
                controls.style.cssText = `
                    margin-left: 8px;
                    display: inline-flex;
                    gap: 3px;
                    font-size: 0.75rem;
                `;
                if (isHidden) {
                    controls.innerHTML = `<span onclick="PersonalizationManager.showElement('${id}'); event.stopPropagation();" style="cursor: pointer; background: #EF4444; padding: 1px 5px; border-radius: 2px; color: white; font-size: 0.7rem;">👁️ Mostrar</span>`;
                } else {
                    controls.innerHTML = `
                        <span onclick="PersonalizationManager.moveElement('${id}', 'prev'); event.stopPropagation();" style="cursor: pointer; background: #8B5CF6; padding: 1px 3px; border-radius: 2px; color: white;">←</span>
                        <span onclick="PersonalizationManager.moveElement('${id}', 'next'); event.stopPropagation();" style="cursor: pointer; background: #8B5CF6; padding: 1px 3px; border-radius: 2px; color: white;">→</span>
                        <span onclick="PersonalizationManager.hideElement('${id}'); event.stopPropagation();" style="cursor: pointer; background: #EF4444; padding: 1px 3px; border-radius: 2px; color: white;">✖</span>
                    `;
                }
                el.appendChild(controls);
                return;
            }

            el.style.position = 'relative';
            if (!isHidden) {
                el.style.outline = '2px dashed #8B5CF6';
                el.style.outlineOffset = '2px';
            }

            el.querySelectorAll('.personalize-control-bar').forEach(x => x.remove());

            const controlBar = document.createElement('div');
            controlBar.className = 'personalize-control-bar';
            controlBar.style.cssText = `
                position: absolute;
                top: -12px;
                right: 8px;
                background: ${isHidden ? '#EF4444' : '#8B5CF6'};
                color: white;
                border-radius: 4px;
                padding: 3px 8px;
                display: flex;
                gap: 6px;
                font-size: 0.72rem;
                z-index: 9999;
                box-shadow: 0 2px 5px rgba(0,0,0,0.3);
                align-items: center;
                font-family: sans-serif;
                pointer-events: auto;
            `;

            if (isHidden) {
                controlBar.innerHTML = `
                    <span style="font-weight: bold; color: #FFD2D2; margin-right: 4px;">[Oculto]</span>
                    <button onclick="PersonalizationManager.showElement('${id}')" style="background: white; border: none; color: #EF4444; border-radius: 2px; cursor: pointer; padding: 2px 6px; font-size: 0.7rem; font-weight: bold;">👁️ Mostrar</button>
                `;
            } else {
                controlBar.innerHTML = `
                    <span style="font-weight: bold; margin-right: 4px;">Mover:</span>
                    <button onclick="PersonalizationManager.moveElement('${id}', 'prev')" style="background: none; border: none; color: white; cursor: pointer; font-size: 0.8rem; font-weight: bold; padding: 0 2px;">⬅️/⬆️</button>
                    <button onclick="PersonalizationManager.moveElement('${id}', 'next')" style="background: none; border: none; color: white; cursor: pointer; font-size: 0.8rem; font-weight: bold; padding: 0 2px;">➡️/⬇️</button>
                    <button onclick="PersonalizationManager.hideElement('${id}')" style="background: none; border: none; color: #FFA8A8; cursor: pointer; font-size: 0.8rem; font-weight: bold; margin-left: 4px; padding: 0 2px;">✖ Ocultar</button>
                `;
            }
            el.appendChild(controlBar);
        });
    },

    setupNormalMode() {
        document.querySelectorAll('.personalize-control-bar, .personalize-th-controls').forEach(x => x.remove());
        document.querySelectorAll('[data-personalize-id]').forEach(el => {
            el.style.outline = '';
            el.style.outlineOffset = '';
        });
        const banner = document.getElementById('personalization-banner');
        if (banner) {
            banner.remove();
            document.body.style.paddingTop = '';
        }
    },

    hideElement(id) {
        const el = document.querySelector(`[data-personalize-id="${id}"]`);
        if (!el) return;
        const container = el.parentNode;
        const containerId = container ? container.getAttribute('data-personalize-container') : null;
        if (!containerId) return;

        const pageName = window.location.pathname.split('/').pop() || 'index.html';
        const settings = this.getSettings();
        if (!settings[pageName]) settings[pageName] = {};
        if (!settings[pageName].hidden) settings[pageName].hidden = {};
        if (!settings[pageName].hidden[containerId]) settings[pageName].hidden[containerId] = [];

        if (!settings[pageName].hidden[containerId].includes(id)) {
            settings[pageName].hidden[containerId].push(id);
        }

        this.saveSettings(settings);
        this.applyLayout();
        
        if (this.isModeActive()) {
            this.enableEditorMode();
        }

        if (typeof showToast === 'function') {
            showToast('Elemento ocultado. Puedes volver a mostrarlo desde Personalizar.', 'success');
        }
    },

    showElement(id) {
        const el = document.querySelector(`[data-personalize-id="${id}"]`);
        if (!el) return;
        const container = el.parentNode;
        const containerId = container ? container.getAttribute('data-personalize-container') : null;
        if (!containerId) return;

        const pageName = window.location.pathname.split('/').pop() || 'index.html';
        const settings = this.getSettings();
        if (settings[pageName] && settings[pageName].hidden && settings[pageName].hidden[containerId]) {
            settings[pageName].hidden[containerId] = settings[pageName].hidden[containerId].filter(x => x !== id);
        }

        this.saveSettings(settings);
        this.applyLayout();
        
        if (this.isModeActive()) {
            this.enableEditorMode();
        }

        if (typeof showToast === 'function') {
            showToast('Elemento visible.', 'success');
        }
    },

    moveElement(id, direction) {
        const el = document.querySelector(`[data-personalize-id="${id}"]`);
        if (!el) return;
        const container = el.parentNode;
        const containerId = container ? container.getAttribute('data-personalize-container') : null;
        if (!containerId) return;

        const pageName = window.location.pathname.split('/').pop() || 'index.html';
        const settings = this.getSettings();

        if (direction === 'prev') {
            const prev = el.previousElementSibling;
            if (prev && prev.getAttribute('data-personalize-id')) {
                container.insertBefore(el, prev);
            }
        } else if (direction === 'next') {
            const next = el.nextElementSibling;
            if (next && next.getAttribute('data-personalize-id')) {
                container.insertBefore(next, el);
            }
        }

        const order = Array.from(container.children)
            .map(child => child.getAttribute('data-personalize-id'))
            .filter(Boolean);

        if (!settings[pageName]) settings[pageName] = {};
        if (!settings[pageName].order) settings[pageName].order = {};
        settings[pageName].order[containerId] = order;

        this.saveSettings(settings);
        
        this.applyLayout();
        if (this.isModeActive()) {
            this.enableEditorMode();
        }

        if (typeof showToast === 'function') {
            showToast('Posición actualizada.', 'success');
        }
    },

    setupContextMenu() {
        document.addEventListener('contextmenu', e => {
            const el = e.target.closest('[data-personalize-id]');
            if (!el) return;

            e.preventDefault();
            const id = el.getAttribute('data-personalize-id');
            
            const existing = document.getElementById('personalize-ctx-menu');
            if (existing) existing.remove();

            const menu = document.createElement('div');
            menu.id = 'personalize-ctx-menu';
            menu.style.cssText = `
                position: absolute;
                top: ${e.pageY}px;
                left: ${e.pageX}px;
                background: #1E293B;
                color: white;
                border: 1px solid #475569;
                border-radius: 6px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.5);
                padding: 4px 0;
                z-index: 1000000;
                min-width: 140px;
                font-family: sans-serif;
                font-size: 0.8rem;
                user-select: none;
            `;

            menu.innerHTML = `
                <div id="ctx-hide-btn" style="padding: 8px 14px; cursor: pointer; display: flex; align-items: center; gap: 8px; transition: background 0.15s;">
                    👁️ Ocultar elemento
                </div>
                <div id="ctx-personalize-btn" style="padding: 8px 14px; cursor: pointer; border-top: 1px solid #334155; display: flex; align-items: center; gap: 8px; transition: background 0.15s;">
                    🛠️ Personalizar página
                </div>
            `;

            document.body.appendChild(menu);

            menu.querySelector('#ctx-hide-btn').addEventListener('click', () => {
                this.hideElement(id);
                menu.remove();
            });

            menu.querySelector('#ctx-personalize-btn').addEventListener('click', () => {
                this.enterMode();
                menu.remove();
            });

            const rect = menu.getBoundingClientRect();
            if (rect.right > window.innerWidth) {
                menu.style.left = `${e.pageX - rect.width}px`;
            }
            if (rect.bottom > window.innerHeight) {
                menu.style.top = `${e.pageY - rect.height}px`;
            }
        });

        document.addEventListener('click', () => {
            const menu = document.getElementById('personalize-ctx-menu');
            if (menu) menu.remove();
        });
    },

    setupObservers() {
        const observer = new MutationObserver(mutations => {
            mutations.forEach(mutation => {
                if (mutation.type === 'childList') {
                    const table = mutation.target.closest('table');
                    if (table) {
                        PersonalizationManager.applyTableColumns(table);
                    }
                }
            });
        });

        document.querySelectorAll('table').forEach(table => {
            const tbody = table.querySelector('tbody');
            if (tbody) {
                observer.observe(tbody, { childList: true });
            }
        });
    }
};

window.PersonalizationManager = PersonalizationManager;
