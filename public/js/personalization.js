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
        window.location.reload();
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
        this.injectStyles();
        this.identifyElements();
        this.applyLayout();
        
        if (this.isModeActive()) {
            document.body.classList.add('personalizing-active');
            this.renderBanner();
        } else {
            document.body.classList.remove('personalizing-active');
            this.setupNormalMode();
        }

        this.setupContextMenu();
        this.setupObservers();
    },

    injectStyles() {
        if (document.getElementById('personalization-styles')) return;
        const style = document.createElement('style');
        style.id = 'personalization-styles';
        style.innerHTML = `
            body.personalizing-active {
                background-color: #f8fafc !important;
            }
            body.personalizing-active .main-content,
            body.personalizing-active main,
            body.personalizing-active .dashboard-container {
                filter: contrast(92%) brightness(96%) !important;
            }
            /* Hover outline on customizable items during personalization */
            body.personalizing-active [data-personalize-id]:hover {
                outline: 2px dashed #EF4444 !important;
                outline-offset: 2px !important;
                position: relative;
            }
            /* Hidden items style in personalization mode */
            .personalizing-hidden-item, 
            .personalizing-hidden-item * {
                font-style: italic !important;
                opacity: 0.45 !important;
            }
        `;
        document.head.appendChild(style);
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
                    el.classList.add('personalizing-hidden-item');
                } else {
                    el.style.display = 'none';
                    el.classList.remove('personalizing-hidden-item');
                }
            } else {
                el.style.display = '';
                el.classList.remove('personalizing-hidden-item');
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
                    th.classList.add('personalizing-hidden-item');
                    th.style.opacity = '';
                    th.style.filter = '';
                    th.style.border = '';
                    
                    table.querySelectorAll('tbody tr').forEach(tr => {
                        const cell = tr.children[idx];
                        if (cell) {
                            cell.style.display = '';
                            cell.classList.add('personalizing-hidden-item');
                            cell.style.opacity = '';
                            cell.style.filter = '';
                        }
                    });
                } else {
                    th.style.display = 'none';
                    th.classList.remove('personalizing-hidden-item');
                    table.querySelectorAll('tr').forEach(tr => {
                        const cell = tr.children[idx];
                        if (cell) {
                            cell.style.display = 'none';
                            cell.classList.remove('personalizing-hidden-item');
                        }
                    });
                }
            } else {
                th.style.display = '';
                th.classList.remove('personalizing-hidden-item');
                th.style.opacity = '';
                th.style.filter = '';
                th.style.border = '';
                
                table.querySelectorAll('tr').forEach(tr => {
                    const cell = tr.children[idx];
                    if (cell) {
                        cell.style.display = '';
                        cell.classList.remove('personalizing-hidden-item');
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
            height: 45px;
            background: #0F172A !important;
            color: #E2E8F0 !important;
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0 20px;
            z-index: 100000;
            font-family: sans-serif;
            font-size: 0.85rem;
            box-shadow: 0 2px 10px rgba(0,0,0,0.3);
            border-bottom: 2px solid #EF4444;
            box-sizing: border-box;
        `;
        banner.innerHTML = `
            <div style="display: flex; align-items: center; gap: 12px; color: #E2E8F0 !important;">
                <span style="background: #EF4444 !important; color: white !important; padding: 3px 8px; border-radius: 4px; font-weight: 800; font-size: 0.75rem; letter-spacing: 0.5px;">PERSONALIZANDO</span>
                <span style="color: #94A3B8 !important; font-weight: 500;">Haz clic derecho en cualquier elemento para moverlo u ocultarlo.</span>
            </div>
            <div style="display: flex; gap: 10px; align-items: center;">
                <button onclick="PersonalizationManager.resetAll()" style="background: transparent !important; color: #94A3B8 !important; border: 1px solid #475569 !important; font-weight: 600; cursor: pointer; padding: 5px 12px; border-radius: 4px; font-size: 0.78rem; transition: all 0.2s;" onmouseenter="this.style.color='white'; this.style.borderColor='white';" onmouseleave="this.style.color='#94A3B8'; this.style.borderColor='#475569';">Restablecer todo</button>
                <button onclick="PersonalizationManager.exitMode()" style="background: #EF4444 !important; color: white !important; border: none !important; font-weight: 700; cursor: pointer; padding: 6px 15px; border-radius: 4px; font-size: 0.78rem; transition: background 0.2s;" onmouseenter="this.style.background='#DC2626' !important;" onmouseleave="this.style.background='#EF4444' !important;">Guardar y Salir</button>
            </div>
        `;
        document.body.appendChild(banner);
        document.body.style.paddingTop = '45px';
    },

    enableEditorMode() {},

    setupNormalMode() {
        document.querySelectorAll('.personalize-control-bar, .personalize-th-controls').forEach(x => x.remove());
        document.querySelectorAll('[data-personalize-id]').forEach(el => {
            el.style.outline = '';
            el.style.outlineOffset = '';
            el.classList.remove('personalizing-hidden-item');
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

        if (typeof showToast === 'function') {
            showToast('Elemento ocultado. Haz clic derecho y elige Mostrar para recuperarlo.', 'success');
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

        if (typeof showToast === 'function') {
            showToast('Posición actualizada.', 'success');
        }
    },

    setupContextMenu() {
        document.addEventListener('contextmenu', e => {
            const el = e.target.closest('[data-personalize-id]');
            if (!el) return;

            const id = el.getAttribute('data-personalize-id');
            const container = el.parentNode;
            const containerId = container ? container.getAttribute('data-personalize-container') : null;
            if (!containerId) return;

            e.preventDefault();

            const pageName = window.location.pathname.split('/').pop() || 'index.html';
            const settings = this.getSettings();
            const isHidden = settings[pageName]?.hidden?.[containerId]?.includes(id);
            const isModeActive = this.isModeActive();
            
            const existing = document.getElementById('personalize-ctx-menu');
            if (existing) existing.remove();

            const menu = document.createElement('div');
            menu.id = 'personalize-ctx-menu';
            menu.style.cssText = `
                position: fixed;
                top: ${e.clientY}px;
                left: ${e.clientX}px;
                background: #1E293B !important;
                color: white !important;
                border: 1px solid #475569 !important;
                border-radius: 6px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.5);
                padding: 4px 0;
                z-index: 1000000;
                min-width: 170px;
                font-family: sans-serif;
                font-size: 0.82rem;
                user-select: none;
            `;

            let menuHTML = '';

            if (isModeActive) {
                if (isHidden) {
                    menuHTML = `
                        <div id="ctx-show-btn" style="padding: 8px 14px; cursor: pointer; display: flex; align-items: center; gap: 8px; color: white !important; transition: background 0.15s;" onmouseenter="this.style.background='#334155'" onmouseleave="this.style.background='transparent'">
                            👁️ Mostrar elemento
                        </div>
                    `;
                } else {
                    menuHTML = `
                        <div id="ctx-move-prev-btn" style="padding: 8px 14px; cursor: pointer; display: flex; align-items: center; gap: 8px; color: white !important; transition: background 0.15s;" onmouseenter="this.style.background='#334155'" onmouseleave="this.style.background='transparent'">
                            ⬅️/⬆️ Mover anterior
                        </div>
                        <div id="ctx-move-next-btn" style="padding: 8px 14px; cursor: pointer; display: flex; align-items: center; gap: 8px; color: white !important; transition: background 0.15s;" onmouseenter="this.style.background='#334155'" onmouseleave="this.style.background='transparent'">
                            ➡️/⬇️ Mover siguiente
                        </div>
                        <div id="ctx-hide-btn" style="padding: 8px 14px; cursor: pointer; border-top: 1px solid #334155; display: flex; align-items: center; gap: 8px; color: #FFA8A8 !important; transition: background 0.15s;" onmouseenter="this.style.background='#334155'" onmouseleave="this.style.background='transparent'">
                            ✖ Ocultar
                        </div>
                    `;
                }
            } else {
                menuHTML = `
                    <div id="ctx-hide-btn" style="padding: 8px 14px; cursor: pointer; display: flex; align-items: center; gap: 8px; color: white !important; transition: background 0.15s;" onmouseenter="this.style.background='#334155'" onmouseleave="this.style.background='transparent'">
                        👁️ Ocultar elemento
                    </div>
                    <div id="ctx-personalize-btn" style="padding: 8px 14px; cursor: pointer; border-top: 1px solid #334155; display: flex; align-items: center; gap: 8px; color: white !important; transition: background 0.15s;" onmouseenter="this.style.background='#334155'" onmouseleave="this.style.background='transparent'">
                        🛠️ Personalizar página
                    </div>
                `;
            }

            menu.innerHTML = menuHTML;
            document.body.appendChild(menu);

            const showBtn = menu.querySelector('#ctx-show-btn');
            if (showBtn) {
                showBtn.addEventListener('click', (event) => {
                    event.stopPropagation();
                    this.showElement(id);
                    menu.remove();
                });
            }

            const movePrevBtn = menu.querySelector('#ctx-move-prev-btn');
            if (movePrevBtn) {
                movePrevBtn.addEventListener('click', (event) => {
                    event.stopPropagation();
                    this.moveElement(id, 'prev');
                    menu.remove();
                });
            }

            const moveNextBtn = menu.querySelector('#ctx-move-next-btn');
            if (moveNextBtn) {
                moveNextBtn.addEventListener('click', (event) => {
                    event.stopPropagation();
                    this.moveElement(id, 'next');
                    menu.remove();
                });
            }

            const hideBtn = menu.querySelector('#ctx-hide-btn');
            if (hideBtn) {
                hideBtn.addEventListener('click', (event) => {
                    event.stopPropagation();
                    this.hideElement(id);
                    menu.remove();
                });
            }

            const personalizeBtn = menu.querySelector('#ctx-personalize-btn');
            if (personalizeBtn) {
                personalizeBtn.addEventListener('click', (event) => {
                    event.stopPropagation();
                    this.enterMode();
                    menu.remove();
                });
            }

            const rect = menu.getBoundingClientRect();
            if (rect.right > window.innerWidth) {
                menu.style.left = `${e.clientX - rect.width}px`;
            }
            if (rect.bottom > window.innerHeight) {
                menu.style.top = `${e.clientY - rect.height}px`;
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
