// ============================================
// UTILITY FUNCTIONS
// ============================================
// ============================================
// UTILITY FUNCTIONS
// ============================================

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
                    eb.logo = 'img/logo-infinite-marble.png';
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
                        parsed.logo = _isValidLogo(parsed.logo) ? parsed.logo : 'img/logo-infinite-marble.png';
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

window.BrandConfig = {
    isConfigured: function() {
        const brand = this.get();
        return brand && brand.configured;
    },
    get: function() {
        // Buscar el logo parametrizado de la aplicación desde la configuración maestra de Ingenia Licencias
        let defaultAppLogo = 'img/logo-infinite-marble.png';
        try {
            if (typeof localStorage !== 'undefined') {
                const platformRaw = localStorage.getItem('saasFitnessPlatform');
                if (platformRaw) {
                    const platform = JSON.parse(platformRaw);
                    const currentTrainerId = window.activeTrainerId || localStorage.getItem('activeTrainerId') || 'default';
                    let appId = 'infinite-coach'; // app por defecto
                    
                    // 1. Obtener el appId asociado a este entrenador
                    if (currentTrainerId !== 'default' && platform.trainers) {
                        const trainerObj = platform.trainers.find(t => t.id === currentTrainerId || t.email === currentTrainerId);
                        if (trainerObj && trainerObj.appId) {
                            appId = trainerObj.appId;
                        }
                    }
                    
                    // 2. Extraer el logo parametrizado de la app
                    if (platform.apps) {
                        const appObj = platform.apps.find(a => a.id === appId);
                        if (appObj && appObj.logo) {
                            defaultAppLogo = appObj.logo;
                        }
                    }
                }
            }
        } catch (e) {
            console.warn('Error al recuperar el logo por defecto de la aplicación:', e);
        }

        const defaults = {
            name: 'Infinite Coach',
            logo: defaultAppLogo,
            primaryColor: '#00D9FF',
            secondaryColor: '#8B5CF6',
            whatsapp: '+34000000000',
            configured: true,
            colors: { primary: '#00D9FF', secondary: '#8B5CF6', accent: '#FF6B6B' }
        };

        // Validar que un logo sea una URL de imagen real (no un nombre de página HTML)
        const isValidLogo = (url) => {
            if (!url || typeof url !== 'string' || url.length < 5) return false;
            if (url.startsWith('data:image')) return true;
            if (url.startsWith('blob:')) return true;
            if (url.startsWith('img/') || url.startsWith('./img/')) return true;
            if (url.startsWith('http://') || url.startsWith('https://')) return true;
            return false;
        };

        // 1. PRIORIDAD MÁXIMA: clave dedicada que syncFromCloud NUNCA toca (trainer-specific)
        const currentTrainerId = window.activeTrainerId || localStorage.getItem('activeTrainerId') || 'default';
        const trainerBrandRaw = localStorage.getItem(`_trainerBrand_${currentTrainerId}`) || localStorage.getItem('_trainerBrand');
        let trainerBrand = null;
        if (trainerBrandRaw) {
            try {
                const parsed = JSON.parse(trainerBrandRaw);
                trainerBrand = {
                    ...parsed,
                    logo: isValidLogo(parsed.logo) ? parsed.logo : defaults.logo,
                    colors: parsed.colors || {
                        primary: parsed.primaryColor || defaults.primaryColor,
                        secondary: parsed.secondaryColor || defaults.secondaryColor,
                        accent: (parsed.colors && parsed.colors.accent) || defaults.colors.accent
                    },
                    configured: true
                };
            } catch(e) { console.error('Error parsing _trainerBrand:', e); }
        }

        let result = defaults;
        if (trainerBrand) {
            result = trainerBrand;
        } else {
            // 2. Fallback: brand_settings (legacy - trainer-specific fallback, then global fallback)
            const stored = localStorage.getItem(`brand_settings_${currentTrainerId}`) || localStorage.getItem('brand_settings');
            if (stored) {
                try {
                    const parsed = JSON.parse(stored);
                    result = {
                        ...defaults,
                        ...parsed,
                        colors: parsed.colors || {
                            primary: parsed.primaryColor || defaults.primaryColor,
                            secondary: parsed.secondaryColor || defaults.secondaryColor,
                            accent: (parsed.colors && parsed.colors.accent) || defaults.colors.accent
                        },
                        configured: true
                    };
                } catch(e) { console.error('Error parsing brand_settings:', e); }
            } else if (window.getData) {
                // 3. Fallback: DB local
                const db = getData();
                if (db && db.brand && db.brand.name) {
                    result = { ...defaults, ...db.brand, configured: true };
                }
            }
        }

        // Auto-migrate legacy brand names (MyFitness or Fitness App) to the official Infinite Coach
        if (result && (result.name === 'MyFitness' || result.name === 'Fitness App')) {
            result.name = 'Infinite Coach';
            try {
                localStorage.setItem(`_trainerBrand_${currentTrainerId}`, JSON.stringify(result));
                localStorage.setItem(`brand_settings_${currentTrainerId}`, JSON.stringify(result));
                localStorage.setItem('_trainerBrand', JSON.stringify(result));
                localStorage.setItem('brand_settings', JSON.stringify(result));
                if (window.getData && window.saveData) {
                    const db = getData();
                    if (db && db.brand) {
                        db.brand.name = 'Infinite Coach';
                        saveData(db);
                    }
                }
            } catch(e) {}
        }

        if (result) {
            result.logo = isValidLogo(result.logo) ? result.logo : defaults.logo;
        }

        return result;
    },
    set: function(brandData) {
        // SIEMPRE guardar en la clave dedicada que nada más toca
        const currentTrainerId = window.activeTrainerId || localStorage.getItem('activeTrainerId') || 'default';
        const current = this.get();
        const updated = { ...current, ...brandData, configured: true };
        localStorage.setItem(`_trainerBrand_${currentTrainerId}`, JSON.stringify(updated));
        localStorage.setItem(`brand_settings_${currentTrainerId}`, JSON.stringify(updated));
        localStorage.setItem('_trainerBrand', JSON.stringify(updated));
        localStorage.setItem('brand_settings', JSON.stringify(updated)); // legacy

        // Guardar también en la BD local y en Supabase
        if (window.getData && window.saveData) {
            try {
                const db = getData();
                if (!db.brand) db.brand = {};
                db.brand = { ...db.brand, ...updated };
                db.brand.configured = true;
                saveData(db);
                const currentId = window.activeTrainerId || localStorage.getItem('activeTrainerId');
                if (window.SupabaseService && currentId && currentId !== 'default') {
                    window.SupabaseService.saveTrainerData(currentId, db)

                        .catch(e => console.warn('Supabase brand sync:', e));
                }
            } catch(e) { console.error('BrandConfig.set db error:', e); }
        }
        return updated;
    },
    applyTheme: function() {
        // 0. Si estamos en páginas del Panel Maestro (Ingenia Licencias), usar el logo de la plataforma
        if (window.location.pathname.includes('admin-dashboard.html') || window.location.pathname.includes('admin-login.html')) {
            try {
                if (typeof localStorage !== 'undefined') {
                    const platformRaw = localStorage.getItem('saasFitnessPlatform');
                    if (platformRaw) {
                        const platform = JSON.parse(platformRaw);
                        if (platform.settings && platform.settings.platformLogo) {
                            const adminLogo = platform.settings.platformLogo;
                            const finalLogoUrl = adminLogo + (adminLogo.startsWith('data:') ? '' : (adminLogo.includes('?') ? '&' : '?') + 'v=' + new Date().getTime());
                            
                            document.querySelectorAll('link[rel*="icon"]').forEach(el => el.remove());
                            
                            const shortcut = document.createElement('link');
                            shortcut.rel = 'shortcut icon';
                            shortcut.type = 'image/png';
                            shortcut.href = finalLogoUrl;
                            document.head.appendChild(shortcut);
                            
                            const icon = document.createElement('link');
                            icon.rel = 'icon';
                            icon.type = 'image/png';
                            icon.href = finalLogoUrl;
                            document.head.appendChild(icon);
                            
                            const originalTitle = document.title;
                            document.title = originalTitle + ' ';
                            setTimeout(() => { document.title = originalTitle; }, 50);
                        }
                    }
                }
            } catch (e) {
                console.warn('Error applying Master Admin favicon:', e);
            }
            return;
        }

        const brand = this.get();
        if (brand) {
            const colors = brand.colors || {
                primary: brand.primaryColor || '#00D9FF',
                secondary: brand.secondaryColor || '#8B5CF6',
                accent: '#FF6B6B'
            };
            
            // Determine active theme mode (prioritize client-specific selection over coach's default)
            let activeThemeMode = colors.themeMode || 'dark';
            if (typeof localStorage !== 'undefined') {
                const clientPref = localStorage.getItem('clientThemeMode');
                if (clientPref && clientPref !== 'default') {
                    activeThemeMode = clientPref;
                }
            }

            document.documentElement.style.setProperty('--primary-color', colors.primary);
            document.documentElement.style.setProperty('--secondary-color', colors.secondary);
            document.documentElement.style.setProperty('--accent-color', colors.accent || '#FF6B6B');

            // Convert Primary to RGB for transparencies
            const hexToRgb = (hex) => {
                const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
                return result ? 
                    `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : 
                    '0, 217, 255';
            };
            document.documentElement.style.setProperty('--primary-color-rgb', hexToRgb(colors.primary));

            // Apply theme class (light/dark)
            const isLight = activeThemeMode === 'light';
            document.documentElement.classList.toggle('theme-light', isLight);
            if (document.body) {
                document.body.classList.toggle('theme-light', isLight);
            }

            // Dynamic Favicon, Apple Touch Icon, and Web Manifest
            const defaultLogo = 'img/logo-infinite-marble.png';
            const currentLogo = (brand && brand.logo && brand.logo.length > 5) ? brand.logo : defaultLogo;
            const absoluteLogo = currentLogo.startsWith('http') || currentLogo.startsWith('data:')
                ? currentLogo
                : new URL(currentLogo, window.location.origin).href;

            // 1. Update/Create Favicon link with cache-busting and shortcut icon override to force Chrome/Safari tab redrawing
            const finalLogoUrl = absoluteLogo.startsWith('data:') 
                ? absoluteLogo 
                : absoluteLogo + (absoluteLogo.includes('?') ? '&' : '?') + 'v=' + new Date().getTime();

            document.querySelectorAll('link[rel*="icon"]').forEach(el => el.remove());

            const shortcut = document.createElement('link');
            shortcut.rel = 'shortcut icon';
            shortcut.type = 'image/png';
            shortcut.href = finalLogoUrl;
            document.head.appendChild(shortcut);

            const icon = document.createElement('link');
            icon.rel = 'icon';
            icon.type = 'image/png';
            icon.href = finalLogoUrl;
            document.head.appendChild(icon);

            // Trigger Title Redraw to force Chrome to refresh favicon rendering
            const originalTitle = document.title;
            document.title = originalTitle + ' ';
            setTimeout(() => { document.title = originalTitle; }, 50);

            // 2. Update/Create Apple Touch Icon link (for iOS PWAs)
            let appleIcon = document.querySelector('link[rel="apple-touch-icon"]');
            if (!appleIcon) {
                appleIcon = document.createElement('link');
                appleIcon.rel = 'apple-touch-icon';
                document.head.appendChild(appleIcon);
            }
            appleIcon.href = absoluteLogo;

            // 3. Update Web Manifest dynamically (for PWA homescreen installations)
            const manifestLink = document.querySelector('link[rel="manifest"]');
            if (manifestLink) {
                const baseManifest = {
                    "name": brand.name || "Infinite Coach",
                    "short_name": brand.name || "Infinite Coach",
                    "start_url": "client-login.html",
                    "display": "standalone",
                    "background_color": "#0F0F1E",
                    "theme_color": colors.primary || "#00D9FF",
                    "orientation": "portrait",
                    "icons": [
                        {
                            "src": absoluteLogo,
                            "sizes": "192x192",
                            "type": "image/png"
                        },
                        {
                            "src": absoluteLogo,
                            "sizes": "512x512",
                            "type": "image/png"
                        }
                    ]
                };
                const manifestStr = JSON.stringify(baseManifest);
                const blob = new Blob([manifestStr], { type: 'application/json' });
                const manifestURL = URL.createObjectURL(blob);
                manifestLink.setAttribute('href', manifestURL);
            }
        }

        // Dynamic Header (Logo & Name)
        const headerLogos = document.querySelectorAll('.logo-img, #brandLogo');
        const previewLogos = document.querySelectorAll('#logoPreview');
        const nameSpan = document.getElementById('brandName');
        
        // Titulo de la página dinámico si existe
        const baseTitle = document.title.split(' - ')[0]; // Tomar parte antes del guion
        
        if (brand) {
            headerLogos.forEach(logoImg => {
                const defaultLogo = 'img/logo-infinite-marble.png';
                const hasLogo = brand.logo && brand.logo.length > 5;
                logoImg.src = hasLogo ? brand.logo : defaultLogo;
                
                const extraStyles = "background: white; padding: 2px; border-radius: 4px;";
                logoImg.style.cssText = `display: block !important; opacity: 1 !important; visibility: visible !important; max-height: 40px !important; width: auto !important; object-fit: contain !important; ${extraStyles}`;
                
                logoImg.onerror = () => {
                    if (logoImg.src !== defaultLogo && !logoImg.src.includes('blob:')) {
                        console.warn("Logo failed to load, falling back to default:", logoImg.src);
                        logoImg.src = defaultLogo;
                    }
                };
            });

            previewLogos.forEach(logoImg => {
                if (brand.logo && brand.logo.length > 5) {
                    logoImg.src = brand.logo;
                    logoImg.style.cssText = `display: block !important; opacity: 1 !important; visibility: visible !important; max-width: 150px !important; max-height: 150px !important; object-fit: contain !important; background: white; padding: 10px; border-radius: 4px;`;
                } else {
                    logoImg.src = 'img/logo-infinite-marble.png';
                    logoImg.style.cssText = `max-width: 150px !important; max-height: 150px !important; object-fit: contain !important; background: white; padding: 10px;`;
                }
            });
            
            if (nameSpan) {
                nameSpan.textContent = brand.name || 'Infinite Coach';
                nameSpan.style.color = (brand.colors && brand.colors.primary) || brand.primaryColor || '#00D9FF';
                nameSpan.style.fontWeight = '800';
            }
            
            if (brand.name) {
                document.title = `${baseTitle} - ${brand.name}`;
            }
        }
    }
};

// Auto-apply on load
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => window.BrandConfig.applyTheme());

    // Interceptar clicks en links de "Salir" (login) para limpiar sesión local
    document.addEventListener('click', function(e) {
        const target = e.target.closest('a');
        if (target && target.getAttribute('href') && target.getAttribute('href').includes('client-login.html')) {
            localStorage.removeItem('clientId');
            sessionStorage.removeItem('clientId');
            const href = target.getAttribute('href');
            if (!href.includes('logout=true')) {
                target.setAttribute('href', href + (href.includes('?') ? '&' : '?') + 'logout=true');
            }
        }
    });
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
    // Si el número está vacío, es inválido o es el valor de prueba/por defecto, usar el número oficial de ASTeam (615760338)
    let targetPhone = phone;
    if (!targetPhone || targetPhone.replace(/\s/g, '').includes('000000000') || targetPhone.length < 5) {
        targetPhone = '615760338';
    }
    const cleanedPhone = formatPhoneForWhatsApp(targetPhone);
    return `https://wa.me/${cleanedPhone}?text=${encodeURIComponent(message)}`;
};
window.generateWhatsAppLink = generateWhatsAppLink;

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
const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
        showToast('Copiado al portapapeles', 'success');
    }).catch(() => {
        showToast('Error al copiar', 'error');
    });
};

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
        const dayStr = safeLocaleDateString(today, { weekday: 'long' }).toLowerCase();
        
        // Review Day Check
        if (client.reviewDay) {
            const daysMap = {'1':'lunes','2':'martes','3':'miércoles','4':'jueves','5':'viernes','6':'sábado','7':'domingo'};
            if (daysMap[client.reviewDay] === dayStr) {
                this.send('📝 ¡Día de Revisión!', {
                    body: `Hola ${client.name}, hoy toca reportar tus progresos. ¡No lo olvides!`,
                    tag: 'review-reminder'
                });
            }
        }
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
});

// Global toggleMenu function for mobile navigation across all pages
const toggleMenu = () => {
    const navLinks = document.getElementById('navLinks');
    if (navLinks) {
        navLinks.classList.toggle('active');
    }
};
window.toggleMenu = toggleMenu;
