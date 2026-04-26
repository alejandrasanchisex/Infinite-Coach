// ============================================
// UTILITY FUNCTIONS
// ============================================

// Format date to readable string
const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('es-ES', options);
};

// Format date and time to readable string
const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    const options = {
        year: 'numeric', month: 'long', day: 'numeric',
        hour: '2-digit', minute: '2-digit'
    };
    return date.toLocaleString('es-ES', options);
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
    const cleanedPhone = formatPhoneForWhatsApp(phone);
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
        const dayStr = today.toLocaleDateString('es-ES', { weekday: 'long' }).toLowerCase();
        
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
    const clientId = sessionStorage.getItem('clientId');
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
