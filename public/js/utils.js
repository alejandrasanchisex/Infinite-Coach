// ============================================
// UTILITY FUNCTIONS
// ============================================

// Force HTTPS redirect on production to prevent mixed content blocking in mobile browsers
(function forceHttps() {
    try {
        if (typeof window !== 'undefined' && window.location && window.location.protocol === 'http:') {
            if (window.location.hostname !== 'localhost' && !window.location.hostname.includes('127.0.0.1')) {
                window.location.href = window.location.href.replace('http:', 'https:');
            }
        }
    } catch(e) {}
})();

// Clean up version parameter 'v' from URL address bar immediately after load for elegant presentation
(function cleanUrlVersion() {
    try {
        if (typeof window !== 'undefined' && window.history && window.history.replaceState) {
            const url = new URL(window.location.href);
            if (url.searchParams.has('v')) {
                url.searchParams.delete('v');
                const cleanUrl = url.pathname + url.search + url.hash;
                window.history.replaceState({}, document.title, cleanUrl);
            }
        }
    } catch (e) {
        console.warn("Could not clean URL version param:", e);
    }
})();

// ============================================
// MIGRACIÓN: Promover brand_settings → _trainerBrand
// Ejecutar una sola vez para proteger datos ya guardados
// ============================================
(function migrateBrandSettings() {
    try {
        const _isValidLogo = (url) => {
            if (!url || typeof url !== 'string' || url.length < 5) return false;
            if (url.startsWith('data:image') || url.startsWith('blob:') || url.startsWith('img/')) return true;
            if (url.startsWith('http://') || url.startsWith('https://')) return true;
            return false;
        };

        // Limpiar _trainerBrand si tiene logo corrupto
        const existingBrand = localStorage.getItem('_trainerBrand');
        if (existingBrand) {
            try {
                const eb = JSON.parse(existingBrand);
                if (eb.logo && !_isValidLogo(eb.logo)) {
                    eb.logo = 'img/logo-infinite-coach.png';
                    localStorage.setItem('_trainerBrand', JSON.stringify(eb));
                    console.log('🧹 Logo corrupto eliminado de _trainerBrand');
                }
            } catch(e) { localStorage.removeItem('_trainerBrand'); }
        }

        // Migrar brand_settings → _trainerBrand si no existe
        if (!localStorage.getItem('_trainerBrand')) {
            const legacy = localStorage.getItem('brand_settings');
            if (legacy) {
                try {
                    const parsed = JSON.parse(legacy);
                    // Solo migrar si tiene un nombre real (no el default hardcodeado)
                    if (parsed && parsed.name && parsed.name !== 'Infinite Coach') {
                        parsed.logo = _isValidLogo(parsed.logo) ? parsed.logo : 'img/logo-infinite-coach.png';
                        localStorage.setItem('_trainerBrand', JSON.stringify(parsed));
                        console.log('✅ Brand migrado a clave protegida:', parsed.name);
                    }
                } catch(e) { /* ignorar */ }
            }
        }
    } catch(e) { /* silencioso */ }
})();

// ============================================
// BRAND CONFIGURATION (Modo Real - Infinite Coach)
// ============================================

if (typeof window !== 'undefined' && !window.BrandConfig) {
    window.BrandConfig = {
        isConfigured: function() {
            return false;
        },
        get: function() {
            return {
                name: 'Infinite Coach',
                logo: 'img/logo-infinite-coach.png',
                primaryColor: '#00D9FF',
                secondaryColor: '#8B5CF6',
                whatsapp: '+34000000000',
                configured: true,
                colors: { primary: '#00D9FF', secondary: '#8B5CF6', accent: '#FF6B6B' }
            };
        },
        set: function(brandData) {
            return brandData;
        },
        applyTheme: function() {
            if (window.location.pathname.includes('admin-dashboard') || window.location.pathname.includes('admin-login') || window.location.hostname.includes('licencias.ingeniaia.es')) {
                try {
                    const platformRaw = localStorage.getItem('saasFitnessPlatform');
                    let adminLogo = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImciIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiM4QjVDRjYiIC8+PHN0b3Agb2Zmc2V0PSIxMDAlIiBzdG9wLWNvbG9yPSIjRDk0NkVGIiAvPjwvbGluZWFyR3JhZGllbnQ+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiByeD0iMjAiIGZpbGw9IiMwNTA1MTAiIC8+PGNpcmNsZSBjeD0iNTAiIGN5PSI1MCIgcj0iMzUiIGZpbGw9Im5vbmUiIHN0cm9rZT0idXJsKCNnKSIgc3Ryb2tlLXdpZHRoPSI2IiAvPjxwYXRoIGQ9Ik00MyAzMCBoMTQgTTUwIDMwIHY0MCBNNDMgNzAgaDE0IiBmaWxsPSJub25lIiBzdHJva2U9InVybCgjZykiIHN0cm9rZS13aWR0aD0iOCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiAvPjwvc3ZnPg==';
                    
                    if (platformRaw) {
                        const platform = JSON.parse(platformRaw);
                        if (platform.settings && platform.settings.platformLogo) {
                            adminLogo = platform.settings.platformLogo;
                        }
                    }
                    
                    const finalLogoUrl = adminLogo + (adminLogo.startsWith('data:') ? '' : (adminLogo.includes('?') ? '&' : '?') + 'v=' + new Date().getTime());
                    
                    document.querySelectorAll('link[rel*="icon"]').forEach(el => el.remove());
                    
                    const shortcut = document.createElement('link');
                    shortcut.rel = 'shortcut icon';
                    shortcut.type = adminLogo.startsWith('data:image/svg+xml') ? 'image/svg+xml' : 'image/png';
                    shortcut.href = finalLogoUrl;
                    document.head.appendChild(shortcut);
                    
                    const icon = document.createElement('link');
                    icon.rel = 'icon';
                    icon.type = adminLogo.startsWith('data:image/svg+xml') ? 'image/svg+xml' : 'image/png';
                    icon.href = finalLogoUrl;
                    document.head.appendChild(icon);
                } catch (e) {
                    console.warn('Error applying Master Admin favicon:', e);
                }
            }
        }
    };
}

// Auto-apply on load
function initUtils() {
    window.BrandConfig.applyTheme();
    checkAndInjectDemoUI();
    
    // Actualizar dinámicamente el manifiesto PWA con el entrenador activo
    try {
        const tid = localStorage.getItem('activeTrainerId') || window.activeTrainerId || 'default';
        const manifestLink = document.querySelector('link[rel="manifest"]');
        if (manifestLink && tid && tid !== 'default' && tid !== 'admin') {
            manifestLink.setAttribute('href', 'manifest.json?t=' + tid);
        }
    } catch(e) { console.warn("Error actualizando enlace de manifiesto:", e); }

    // Interceptar clicks en links de "Salir" (login) para limpiar sesión local
    document.addEventListener('click', function(e) {
        const target = e.target.closest('a');
        if (target && target.getAttribute('href') && target.getAttribute('href').includes('acceso.html')) {
            localStorage.removeItem('clientId');
            sessionStorage.removeItem('clientId');
            const href = target.getAttribute('href');
            if (!href.includes('logout=true')) {
                target.setAttribute('href', href + (href.includes('?') ? '&' : '?') + 'logout=true');
            }
        }
    });
}

if (typeof document !== 'undefined') {
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        initUtils();
    } else {
        document.addEventListener('DOMContentLoaded', initUtils);
    }
}

function checkAndInjectDemoUI() {
    try {
        if (localStorage.getItem('activeTrainerId') === 'demo') {
            // 0. Inject CSS for the badge to be responsive
            if (!document.getElementById('demo-badge-styles')) {
                const style = document.createElement('style');
                style.id = 'demo-badge-styles';
                style.innerHTML = `
                    #demo-active-badge {
                        background: #10B981;
                        color: #0B0B1A;
                        font-size: 0.75rem;
                        font-weight: bold;
                        padding: 4px 10px;
                        border-radius: 50px;
                        margin-left: 10px;
                        white-space: nowrap;
                        display: inline-block;
                    }
                    @media (max-width: 768px) {
                        #demo-active-badge {
                            font-size: 0.65rem;
                            padding: 2px 8px;
                            margin-left: 6px;
                        }
                    }
                `;
                document.head.appendChild(style);
            }

            // 1. Inject the badge in the nav logo
            const logoWrap = document.querySelector('.nav .logo');
            if (logoWrap && !document.getElementById('demo-active-badge')) {
                const badge = document.createElement('span');
                badge.id = 'demo-active-badge';
                badge.innerHTML = `DEMO ACTIVA`;
                logoWrap.appendChild(badge);
            }

            // 2. Inject the purple banner in trainer-dashboard.html
            if (window.location.pathname.includes('trainer-dashboard')) {
                const container = document.querySelector('.main-content .container');
                if (container && !document.getElementById('demo-temp-banner')) {
                    const banner = document.createElement('div');
                    banner.id = 'demo-temp-banner';
                    banner.className = 'card mb-lg';
                    banner.style.background = 'rgba(139, 92, 246, 0.15)';
                    banner.style.borderColor = '#8B5CF6';
                    banner.style.padding = '1.25rem 1.5rem';
                    banner.style.borderRadius = '16px';
                    banner.style.color = '#fff';
                    banner.style.fontSize = '0.9rem';
                    banner.style.display = 'flex';
                    banner.style.alignItems = 'center';
                    banner.style.gap = '14px';
                    banner.style.marginBottom = '2rem';
                    banner.style.border = '1px solid rgba(139, 92, 246, 0.3)';
                    
                    let callDate = 'Lunes a las 09:00 - 09:15';
                    try {
                        const mockData = JSON.parse(localStorage.getItem('fitnessAppData_demo') || '{}');
                        if (mockData.appointments && mockData.appointments[0]) {
                            const notes = mockData.appointments[0].notes || '';
                            if (notes.includes('agendada para:')) {
                                callDate = notes.split('agendada para:')[1].trim();
                            }
                        }
                    } catch(e) {}
                    
                    banner.innerHTML = `
                        <span style="font-size: 1.5rem;">🚀</span>
                        <div>
                            <div style="font-weight: 600; color: #a78bfa; margin-bottom: 4px; font-size: 0.95rem;">Acceso Demo Temporal</div>
                            <div style="color: rgba(255,255,255,0.85); line-height: 1.4;">
                                Este entorno de pruebas de Infinite Coach está activo hasta tu Welcome Call programada para el <strong>${callDate}</strong>.<br>
                                <span style="color: #F59E0B; font-weight: 500;">💻 Recomendación:</span> Para una experiencia de gestión más cómoda y completa, <strong>te recomendamos abrir este panel desde tu ordenador</strong>.<br>
                                <span style="color: #00D9FF; font-weight: 500;">💡 Tip:</span> Puedes personalizar esta plataforma con tu propio <strong>logo, colores corporativos y modo Día/Noche</strong> en la pestaña de <a href="trainer-settings.html" style="color: #00D9FF; text-decoration: underline; font-weight: 600;">Configuración</a>.
                            </div>
                        </div>
                    `;
                    
                    const pageHeader = container.querySelector('.flex-between');
                    if (pageHeader) {
                        pageHeader.parentNode.insertBefore(banner, pageHeader.nextSibling);
                    } else {
                        container.prepend(banner);
                    }
                }
            }
        }
    } catch(e) {
        console.warn('Error applying demo UI:', e);
    }
}

// Safe translation/fallback for toLocaleDateString
const safeLocaleDateString = (dateObj, options, locale = 'es-ES') => {
    try {
        return dateObj.toLocaleDateString(locale, options);
    } catch (e) {
        // Safe manual fallback builder for iOS Webviews without full options/locale support
        try {
            const day = dateObj.getDate();
            const year = dateObj.getFullYear();
            const daysLong = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
            const daysShort = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'];
            const monthsLong = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
            const monthsShort = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
            
            let weekdayStr = '';
            let monthStr = '';
            
            if (options && options.weekday) {
                const dayIdx = dateObj.getDay();
                weekdayStr = options.weekday === 'long' ? daysLong[dayIdx] : daysShort[dayIdx];
            }
            
            if (options && options.month) {
                const monthIdx = dateObj.getMonth();
                monthStr = options.month === 'long' ? monthsLong[monthIdx] : monthsShort[monthIdx];
            } else {
                monthStr = String(dateObj.getMonth() + 1).padStart(2, '0');
            }
            
            if (options && options.year) {
                if (options.month === 'long') {
                    return `${day} de ${monthStr} de ${year}`;
                }
            }
            
            if (weekdayStr) {
                return `${weekdayStr}, ${day} de ${monthStr}`;
            }
            
            return `${day}/${monthStr}/${year}`;
        } catch (innerErr) {
            try {
                return dateObj.toISOString().split('T')[0];
            } catch (fatalErr) {
                return '';
            }
        }
    }
};
window.safeLocaleDateString = safeLocaleDateString;

const safeLocaleString = (dateObj, options, locale = 'es-ES') => {
    try {
        return dateObj.toLocaleString(locale, options);
    } catch (e) {
        try {
            const dateStr = safeLocaleDateString(dateObj, options, locale);
            const hour = String(dateObj.getHours()).padStart(2, '0');
            const min = String(dateObj.getMinutes()).padStart(2, '0');
            return `${dateStr} ${hour}:${min}`;
        } catch (innerErr) {
            try {
                return dateObj.toISOString();
            } catch (fatalErr) {
                return '';
            }
        }
    }
};
window.safeLocaleString = safeLocaleString;

// Format date to readable string
const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return safeLocaleDateString(date, options);
};

// Format date and time to readable string
const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    const options = {
        year: 'numeric', month: 'long', day: 'numeric',
        hour: '2-digit', minute: '2-digit'
    };
    return safeLocaleString(date, options);
};

// Format date for input fields
const formatDateInput = (dateString) => {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
};

// Convert image file to Base64 (with automatic resizing and compression)
const imageToBase64 = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;
                const maxDim = 800; // Tamaño máximo óptimo para web

                if (width > height) {
                    if (width > maxDim) {
                        height *= maxDim / width;
                        width = maxDim;
                    }
                } else {
                    if (height > maxDim) {
                        width *= maxDim / height;
                        height = maxDim;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                
                // Convertir a JPEG con compresión del 80% (calidad excelente, peso mínimo)
                resolve(canvas.toDataURL('image/jpeg', 0.8));
            };
            img.onerror = reject;
            img.src = e.target.result;
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
};

// Validate email
const isValidEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
};

// Validate phone (Spanish format)
const isValidPhone = (phone) => {
    const re = /^(\+34|0034|34)?[6789]\d{8}$/;
    return re.test(phone.replace(/\s/g, ''));
};

// Format phone for WhatsApp (remove spaces, add country code)
const formatPhoneForWhatsApp = (phone) => {
    let cleaned = phone.replace(/\s/g, '');
    if (!cleaned.startsWith('+')) {
        if (cleaned.startsWith('34')) {
            cleaned = '+' + cleaned;
        } else {
            cleaned = '+34' + cleaned;
        }
    }
    return cleaned.replace('+', '');
};

// Generate WhatsApp Link
const generateWhatsAppLink = (phone, message) => {
    // Si el número está vacío, es inválido o es el valor de prueba/por defecto, usar el número oficial de ASTeam (615760638)
    let targetPhone = phone;
    if (!targetPhone || targetPhone.replace(/\s/g, '').includes('000000000') || targetPhone.length < 5) {
        targetPhone = '615760638';
    }
    const cleanedPhone = formatPhoneForWhatsApp(targetPhone);
    return `https://wa.me/${cleanedPhone}?text=${encodeURIComponent(message)}`;
};
window.generateWhatsAppLink = generateWhatsAppLink;

// Get default WhatsApp messages or custom ones from settings
const getWhatsAppTemplate = (key, data = {}) => {
    const brand = window.BrandConfig ? window.BrandConfig.get() : {};
    const templates = brand.whatsappTemplates || {};
    
    const defaults = {
        generalChat: 'Hola {name}, soy {trainerName}...',
        paymentReminder: 'Hola {name}, te escribo de {trainerName} para recordarte que el pago de tu cuota mensual ({fee}) está pendiente. ¡Gracias!',
        renewalReminder: 'Hola {name}, te escribo para recordarte que tu suscripción se renovará el {expiryDate}. El importe de tu cuota es de {fee}. ¿Confirmamos la renovación para seguir a tope el próximo periodo? ¡Gracias!',
        reviewReception: '¡Hola {name}! He recibido tu revisión semanal. ¡Vamos a darle caña!',
        appointmentCoordination: '¡Hola {name}! Te escribo para coordinar nuestra cita del {date}.'
    };
    
    let template = templates[key] || defaults[key] || '';
    
    let msg = template;
    for (const k in data) {
        msg = msg.replace(new RegExp(`{${k}}`, 'g'), data[k]);
    }
    return msg;
};
window.getWhatsAppTemplate = getWhatsAppTemplate;

// Calculate days left for payment expiry
const calculateDaysLeft = (expiryString) => {
    if (!expiryString) return null;
    try {
        const parts = expiryString.split('/');
        if (parts.length !== 3) return null;
        const day = parseInt(parts[0]);
        const month = parseInt(parts[1]) - 1;
        let year = parseInt(parts[2]);
        if (year < 100) year += 2000;
        const expiryDate = new Date(year, month, day);
        if (isNaN(expiryDate)) return null;
        
        const today = new Date();
        today.setHours(0,0,0,0);
        const diffTime = expiryDate - today;
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    } catch (e) {
        return null;
    }
};
window.calculateDaysLeft = calculateDaysLeft;

// Calculate BMI
const calculateBMI = (weight, height) => {
    const heightInMeters = height / 100;
    return (weight / (heightInMeters * heightInMeters)).toFixed(1);
};

// Calculate total macros for a meal
const calculateMealMacros = (meals) => {
    return meals.reduce((total, meal) => {
        return {
            protein: total.protein + (meal.macros?.protein || 0),
            carbs: total.carbs + (meal.macros?.carbs || 0),
            fats: total.fats + (meal.macros?.fats || 0),
            calories: total.calories + (meal.calories || 0)
        };
    }, { protein: 0, carbs: 0, fats: 0, calories: 0 });
};

// Show toast notification
window.showToast = function (message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;

    const container = document.getElementById('toast-container') || window.createToastContainer();
    container.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('show');
    }, 100);

    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
};

window.createToastContainer = function () {
    const container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
    return container;
};

// Manage body scroll automatically when modals are added/removed
if (typeof window !== 'undefined' && typeof MutationObserver !== 'undefined') {
    const observer = new MutationObserver(() => {
        const modals = document.querySelectorAll('.modal-overlay');
        let hasVisibleModals = false;
        modals.forEach(m => {
            if (window.getComputedStyle(m).display !== 'none') {
                hasVisibleModals = true;
            }
        });

        if (hasVisibleModals) {
            document.body.style.overflow = 'hidden';
            document.body.style.paddingRight = 'var(--scrollbar-width, 0px)';
        } else {
            document.body.style.overflow = '';
            document.body.style.paddingRight = '';
        }
    });

    const initObserver = () => {
        if (document.body) {
            observer.observe(document.body, { 
                childList: true, 
                subtree: true, 
                attributes: true, 
                attributeFilter: ['style', 'class'] 
            });
        } else {
            window.addEventListener('DOMContentLoaded', initObserver);
        }
    };
    initObserver();
}

// Close modal
window.closeModal = function (btnElement) {
    if (btnElement && btnElement.closest) {
        const modal = btnElement.closest('.modal-overlay');
        if (modal) {
            modal.remove();
        }
    } else {
        const modals = document.querySelectorAll('.modal-overlay');
        if (modals.length > 0) {
            modals[modals.length - 1].remove();
        }
    }
};

// Show modal
window.showModal = function (title, content, buttons = [], modalClass = '') {
    const modal = document.createElement('div');
    modal.className = `modal-overlay ${modalClass}`;
    modal.innerHTML = `
    <div class="modal">
      <div class="modal-header">
        <h3>${title}</h3>
        <div style="display: flex; align-items: center; gap: 15px;">
            <button class="modal-expand" title="Pantalla completa" onclick="window.toggleModalFullscreen(this)">⛶</button>
            <button class="modal-close" onclick="window.closeModal(this)">×</button>
        </div>
      </div>
      <div class="modal-body">
        ${content}
      </div>
      <div class="modal-footer">
        ${buttons.map(btn => `
          <button class="btn ${btn.class || 'btn-secondary'}" onclick="${btn.onclick}">
            ${btn.text}
          </button>
        `).join('')}
      </div>
    </div>
  `;
    document.body.appendChild(modal);
    return modal;
};

// Toggle modal fullscreen
window.toggleModalFullscreen = function (btn) {
    const overlay = btn.closest('.modal-overlay');
    if (overlay) {
        overlay.classList.toggle('fullscreen');
        btn.textContent = overlay.classList.contains('fullscreen') ? '❐' : '⛶';
    }
};

// Confirm dialog
window.showConfirm = (message, onConfirm) => {
    window.__currentConfirmCallback = onConfirm;
    const modal = showModal('Confirmar', `<p>${message}</p>`, [
        {
            text: 'Cancelar',
            class: 'btn-secondary',
            onclick: 'window.closeModal(this)'
        },
        {
            text: 'Confirmar',
            class: 'btn-primary',
            onclick: 'if(window.__currentConfirmCallback) window.__currentConfirmCallback(); window.closeModal(this);'
        }
    ]);
};

// Debounce function
const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

// Get week number of the year
const getWeekNumber = (date = new Date()) => {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
};

// Format currency
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-ES', {
        style: 'currency',
        currency: 'EUR'
    }).format(amount);
};

// Generate Google Calendar link
const generateGoogleCalendarLink = (title, startDate, notes) => {
    const start = new Date(startDate);
    const end = new Date(start.getTime() + 60 * 60 * 1000); // 1 hour duration

    const formatGCalDate = (date) => date.toISOString().replace(/-|:|\.\d\d\d/g, "");

    const baseUrl = 'https://www.google.com/calendar/render?action=TEMPLATE';
    const params = [
        `text=${encodeURIComponent(title)}`,
        `dates=${formatGCalDate(start)}/${formatGCalDate(end)}`,
        `details=${encodeURIComponent(notes || '')}`,
        `trp=true`
    ];

    return `${baseUrl}&${params.join('&')}`;
};

// Export table to CSV
const exportToCSV = (data, filename) => {
    if (!data || data.length === 0) return;

    const headers = Object.keys(data[0]);
    const csv = [
        headers.join(','),
        ...data.map(row => headers.map(header => {
            const value = row[header];
            return typeof value === 'string' && value.includes(',') ? `"${value}"` : value;
        }).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.csv`;
    link.click();
};

// Check if user is on mobile
const isMobile = () => {
    return window.innerWidth <= 768;
};

// Smooth scroll to element
const scrollToElement = (elementId) => {
    const element = document.getElementById(elementId);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
};

// Copy to clipboard
const copyToClipboard = (text, successMessage = 'Copiado al portapapeles') => {
    if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
        navigator.clipboard.writeText(text).then(() => {
            showToast(successMessage, 'success');
        }).catch((err) => {
            console.warn('navigator.clipboard falló, usando fallback: ', err);
            fallbackCopyToClipboard(text, successMessage);
        });
    } else {
        fallbackCopyToClipboard(text, successMessage);
    }
};

const fallbackCopyToClipboard = (text, successMessage) => {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.width = "2em";
    textArea.style.height = "2em";
    textArea.style.padding = "0";
    textArea.style.border = "none";
    textArea.style.outline = "none";
    textArea.style.boxShadow = "none";
    textArea.style.background = "transparent";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
        const successful = document.execCommand('copy');
        if (successful) {
            showToast(successMessage, 'success');
        } else {
            showToast('Error al copiar', 'error');
        }
    } catch (err) {
        console.error('Error al copiar con fallback: ', err);
        showToast('Error al copiar', 'error');
    }
    document.body.removeChild(textArea);
};

window.copyToClipboard = copyToClipboard;

// Get days in month
const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
};

// Get day name in Spanish
const getDayName = (dayNumber) => {
    const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    return days[dayNumber];
};

// Truncate text
const truncate = (text, maxLength) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
};

// ============================================
// NUTRITION CALCULATORS
// ============================================

window.calculateBMR = (gender, weight, height, age) => {
    // Harris-Benedict
    if (gender === 'male' || gender === 'hombre') {
        return 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age);
    } else {
        return 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age);
    }
};

window.calculateTDEE = (bmr, activityLevel) => {
    const multipliers = {
        'sedentary': 1.2,
        'light': 1.375,
        'moderate': 1.55,
        'active': 1.725,
        'very_active': 1.9
    };
    return bmr * (multipliers[activityLevel] || 1.2);
};

window.calculateTargetCalories = (tdee, goal) => {
    if (goal === 'deficit_moderate') return tdee - 300;
    if (goal === 'deficit_aggressive') return tdee - 500;
    if (goal === 'surplus_lean') return tdee + 250;
    if (goal === 'surplus_aggressive') return tdee + 500;
    return tdee; // maintenance
};

window.calculateMacros = (calories, weight, goal) => {
    // Strategy: Protein & Fat fixed by weight, Carbs fill the rest
    let proteinPerKg = 2.0;
    let fatPerKg = 0.9;

    if (String(goal).includes('deficit')) {
        proteinPerKg = 2.2;
        fatPerKg = 0.7;
    } else if (String(goal).includes('surplus')) {
        proteinPerKg = 1.8;
        fatPerKg = 1.0;
    }

    const protein = Math.round(weight * proteinPerKg);
    const fat = Math.round(weight * fatPerKg);

    // Remaining calories for carbs
    const usedCals = (protein * 4) + (fat * 9);
    const availableCals = Math.max(0, calories - usedCals);
    const carbs = Math.round(availableCals / 4);

    return { protein, fat, carbs };
};

// ============================================
// FOOD DATABASE (LOCAL)
// ============================================

// ============================================
// FOOD DATABASE MOCK (Simple)
// ============================================

window.calculateFoodMacros = (name, qtyStr) => {
    const q = name.toLowerCase();
    let base = null;
    let unitG = 100; // default to 100g if no unit specified

    if (q.includes('pollo')) base = { cal: 165, p: 31, c: 0, f: 3.6 };
    else if (q.includes('arroz')) base = { cal: 130, p: 2.7, c: 28, f: 0.3 };
    else if (q.includes('huevo')) { base = { cal: 155, p: 13, c: 1.1, f: 11 }; unitG = 50; } // 1 huevo ~50g
    else if (q.includes('patata')) base = { cal: 77, p: 2, c: 17, f: 0.1 };
    else if (q.includes('avena')) base = { cal: 389, p: 16.9, c: 66, f: 6.9 };
    else if (q.includes('atun') || q.includes('atún')) base = { cal: 100, p: 23, c: 0, f: 1 };
    else if (q.includes('aceite')) { base = { cal: 884, p: 0, c: 0, f: 100 }; unitG = 15; } // 1 cda ~15g
    else if (q.includes('aguacate')) base = { cal: 160, p: 2, c: 9, f: 15 };
    else if (q.includes('pan')) base = { cal: 265, p: 9, c: 49, f: 3.2 };
    else if (q.includes('leche')) base = { cal: 42, p: 3.4, c: 5, f: 1 };
    else if (q.includes('queso')) base = { cal: 402, p: 25, c: 1.3, f: 33 };
    else if (q.includes('yogur')) base = { cal: 59, p: 10, c: 3.6, f: 0.4 };
    else if (q.includes('manzana')) { base = { cal: 52, p: 0.3, c: 14, f: 0.2 }; unitG = 150; }
    else if (q.includes('platano') || q.includes('plátano')) { base = { cal: 89, p: 1.1, c: 23, f: 0.3 }; unitG = 100; }
    else if (q.includes('proteina') || q.includes('whey')) { base = { cal: 370, p: 80, c: 4, f: 3 }; unitG = 30; }

    if (!base) return null;

    // Parse Quantity
    let amount = parseFloat(qtyStr) || 0;
    // Heuristic: if amount is small (< 10) and it's not 'kg' or 'g', assume units if applicable
    // But simplest is to assume grams if > 20, else assume units if food has specific unit weight
    // For simplicity, let's just assume input is in GRAMS by default unless it's small integers for items like Eggs.

    // Better simple logic:
    // If input < 20 and food is commonly counted (egg, apple, scoop), treat as Units.
    // Else treat as Grams.

    let grams = amount;
    if (amount <= 20 && (q.includes('huevo') || q.includes('manzana') || q.includes('platano') || q.includes('plátano') || q.includes('cazo') || q.includes('scoop') || q.includes('cucharada'))) {
        grams = amount * unitG;
    }

    const ratio = grams / 100;

    return {
        calories: Math.round(base.cal * ratio),
        protein: Math.round(base.p * ratio),
        carbs: Math.round(base.c * ratio),
        fat: Math.round(base.f * ratio)
    };
};

// ============================================
// NOTIFICATION MANAGER (PWA)
// ============================================

const NotificationManager = {
    async requestPermission() {
        if (!('Notification' in window)) return false;
        try {
            const permission = await Notification.requestPermission();
            return permission === 'granted';
        } catch (e) { return false; }
    },

    async send(title, options = {}) {
        if (!('Notification' in window) || Notification.permission !== 'granted') return;
        
        const defaultOptions = {
            icon: '/icons/icon-192x192.png',
            badge: '/icons/icon-72x72.png',
            vibrate: [100, 50, 100]
        };

        try {
            if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
                const registration = await navigator.serviceWorker.ready;
                registration.showNotification(title, { ...defaultOptions, ...options });
            } else {
                new Notification(title, { ...defaultOptions, ...options });
            }
        } catch (e) {
            console.error('Error sending notification:', e);
        }
    },

    checkReminders(client, brand) {
        if (Notification.permission !== 'granted') return;
        
        const today = new Date();
        const dateKey = today.toISOString().split('T')[0]; // "YYYY-MM-DD"
        const clientId = client.id || sessionStorage.getItem('clientId') || localStorage.getItem('clientId') || 'client';
        const sentKey = `sent_notifications_${clientId}`;
        
        let sentLog = {};
        try {
            sentLog = JSON.parse(localStorage.getItem(sentKey) || '{}');
        } catch(e) {}
        
        // Limpiar registros antiguos si cambiamos de día
        if (sentLog.date !== dateKey) {
            sentLog = { date: dateKey, types: [] };
        }
        
        const dayStr = typeof safeLocaleDateString !== 'undefined' ? safeLocaleDateString(today, { weekday: 'long' }).toLowerCase() : today.toLocaleDateString('es-ES', { weekday: 'long' }).toLowerCase();
        
        // 1. Control del Día de Revisión
        if (client.reviewDay) {
            const daysMap = {'1':'lunes','2':'martes','3':'miércoles','4':'jueves','5':'viernes','6':'sábado','7':'domingo'};
            if (daysMap[client.reviewDay] === dayStr) {
                if (!sentLog.types.includes('review')) {
                    this.send('📝 ¡Día de Revisión!', {
                        body: `Hola ${client.name}, hoy toca reportar tus progresos. ¡No lo olvides!`,
                        tag: 'review-reminder'
                    });
                    sentLog.types.push('review');
                }
            }
        }

        // 2. Control de Vencimiento de Pago / Suscripción
        if (client.paymentExpiry) {
            try {
                const parts = client.paymentExpiry.split('/');
                if (parts.length === 3) {
                    const day = parseInt(parts[0]);
                    const month = parseInt(parts[1]) - 1;
                    let year = parseInt(parts[2]);
                    if (year < 100) year += 2000;
                    
                    const expiryDate = new Date(year, month, day);
                    if (!isNaN(expiryDate)) {
                        const todayZero = new Date(today.getFullYear(), today.getMonth(), today.getDate());
                        const expiryZero = new Date(expiryDate.getFullYear(), expiryDate.getMonth(), expiryDate.getDate());
                        
                        const diffTime = expiryZero.getTime() - todayZero.getTime();
                        const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
                        
                        if (diffDays > 0 && diffDays <= 3) {
                            if (!sentLog.types.includes('payment-approaching')) {
                                this.send('💳 Próximo Vencimiento', {
                                    body: `Hola ${client.name}, tu suscripción vence en ${diffDays} ${diffDays === 1 ? 'día' : 'días'} (el ${client.paymentExpiry}). ¡Evita la suspensión del servicio!`,
                                    tag: 'payment-expiry-reminder'
                                });
                                sentLog.types.push('payment-approaching');
                            }
                        } else if (diffDays === 0) {
                            if (!sentLog.types.includes('payment-due')) {
                                this.send('💳 Pago Vencido hoy', {
                                    body: `Hola ${client.name}, hoy es el día de renovación de tu plan. ¡No olvides realizar el pago!`,
                                    tag: 'payment-expiry-reminder'
                                });
                                sentLog.types.push('payment-due');
                            }
                        }
                    }
                }
            } catch (e) {
                console.warn('Error parsing paymentExpiry for notification:', e);
            }
        }
        
        try {
            localStorage.setItem(sentKey, JSON.stringify(sentLog));
        } catch(e) {}
    }
};
window.NotificationManager = NotificationManager;

// ============================================
// PR (PERSONAL RECORD) UTILITIES
// ============================================

const checkAndNotifyPR = (exerciseName, currentWeight, currentReps = 0) => {
    const clientId = sessionStorage.getItem('clientId') || localStorage.getItem('clientId');
    if (!clientId) return false;

    if (typeof TrainingLogs === 'undefined') return false;

    const oldPR = TrainingLogs.getExercisePRDetails(clientId, exerciseName) || { weight: 0, reps: 0 };
    const weightVal = parseFloat(currentWeight);
    const repsVal = parseInt(currentReps) || 0;

    // Detectar PR: Más peso, o mismo peso con más repeticiones
    const isNewPR = weightVal > oldPR.weight || (weightVal > 0 && weightVal === oldPR.weight && repsVal > oldPR.reps);

    if (isNewPR) {
        showPRModal(exerciseName, oldPR, { weight: weightVal, reps: repsVal });
        NotificationManager.send('🏆 ¡NUEVO RÉCORD!', {
            body: `Has superado tu marca en ${exerciseName}: ${weightVal} kg x ${repsVal} reps`,
            tag: 'pr-alert'
        });
        return true;
    }
    return false;
};
window.checkAndNotifyPR = checkAndNotifyPR;

const showPRModal = (exerciseName, oldPR, newPR) => {
    const content = `
        <div style="text-align: center; padding: 10px;">
            <div style="font-size: 5rem; margin-bottom: 20px; animation: bouncePR 1.5s infinite ease-in-out;">🏆</div>
            <h2 style="color: var(--primary-color); font-size: 1.8rem; margin-bottom: 10px;">¡NUEVO RÉCORD!</h2>
            <p style="font-size: 1rem; color: rgba(255,255,255,0.8); margin-bottom: 20px;">
                Has superado tu marca histórica en <br>
                <strong style="color: #fff; font-size: 1.2rem;">${exerciseName}</strong>
            </p>
            
            <div style="background: rgba(var(--primary-color-rgb), 0.1); padding: 20px; border-radius: 12px; border: 1px solid var(--primary-color); display: flex; flex-direction: column; gap: 15px;">
                <div class="flex-between align-center" style="opacity: 0.6;">
                    <div style="font-size: 0.75rem; text-transform: uppercase;">Antiguo</div>
                    <div style="font-size: 1.1rem; font-weight: 700;">${oldPR.weight} kg <span style="font-size: 0.8rem; font-weight: 400;">x ${oldPR.reps}</span></div>
                </div>
                <div style="height: 1px; background: rgba(var(--primary-color-rgb), 0.2); width: 100%;"></div>
                <div class="flex-between align-center">
                    <div style="font-size: 0.75rem; text-transform: uppercase; color: var(--primary-color);">Nuevo Récord</div>
                    <div style="font-size: 1.8rem; font-weight: 800; color: var(--primary-color);">${newPR.weight} kg <span style="font-size: 1rem; font-weight: 600;">x ${newPR.reps}</span></div>
                </div>
            </div>
            
            <p class="mt-lg text-sm italic" style="opacity: 0.7;">¡Sigue entrenando duro! 💪</p>
        </div>
        <style>
            @keyframes bouncePR {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(-15px); }
            }
        </style>
    `;
    
    showModal('', content, [
        { text: '¡Seguir!', class: 'btn-primary', onclick: 'window.closeModal()' }
    ]);
};

// Automatically apply theme/branding on page load
document.addEventListener('DOMContentLoaded', () => {
    if (typeof BrandConfig !== 'undefined' && typeof BrandConfig.applyTheme === 'function') {
        BrandConfig.applyTheme();
    }

    // Restricciones para colaboradores (sub-entrenadores)
    if (localStorage.getItem('_isSubTrainer') === 'true') {
        // 1. Redirigir si intenta acceder a la página de configuración
        if (window.location.pathname.includes('trainer-settings')) {
            window.location.href = 'trainer-dashboard.html';
            return;
        }
        // 2. Ocultar enlaces a configuración en los menús de navegación
        document.querySelectorAll('a[href*="trainer-settings"]').forEach(a => {
            const li = a.closest('li');
            if (li) {
                li.style.display = 'none';
            } else {
                a.style.display = 'none';
            }
        });
    }

    // Cargar e inicializar el Administrador de Personalización (solo en backend de entrenador)
    const isTrainerPage = window.location.pathname.includes('trainer-') || window.location.pathname.includes('admin-dashboard');
    const isLoginPage = window.location.pathname.includes('login');
    if (isTrainerPage && !isLoginPage) {
        if (typeof PersonalizationManager === 'undefined') {
            const script = document.createElement('script');
            script.src = 'js/personalization.js?v=684';
            script.onload = () => {
                if (window.PersonalizationManager) {
                    window.PersonalizationManager.init();
                }
            };
            document.head.appendChild(script);
        } else {
            PersonalizationManager.init();
        }
    }
});

// Global toggleMenu function for mobile navigation across all pages
window.toggleMenu = () => {
    const navLinks = document.getElementById('navLinks');
    if (navLinks) {
        navLinks.classList.toggle('active');
    }
};
