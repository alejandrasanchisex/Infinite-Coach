/**
 * PLANIO UTILS & SECURITY FIREWALL
 * Middleware de seguridad y utilidades de interfaz premium.
 */

// ── SEGURIDAD: CORTAFUEGOS DE SESIÓN INMEDIATO ───────────
(function checkFirewall() {
    const isLoginPage = window.location.pathname.includes('login.html');
    const isClientView = window.location.pathname.includes('client-view.html');
    const isAuthed = localStorage.getItem('_planioAuthed') === '1' || sessionStorage.getItem('_planioAuthed') === '1';

    if (!isLoginPage && !isClientView && !isAuthed) {
        window.location.href = 'login.html';
    } else if (isLoginPage && isAuthed) {
        window.location.href = 'dashboard.html';
    }
})();

// Formateadores
window.formatCurrency = function(value) {
    return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(value);
};

window.formatDateTime = function(dateStr) {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    return d.toLocaleString('es-ES', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
    });
};

window.generateWhatsAppLink = function(phone, message) {
    const cleanPhone = phone.replace(/[^0-9+]/g, '');
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
};

// ── TOAST NOTIFICATIONS ────────────────────────────────
window.showToast = function(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;

    const container = document.getElementById('toast-container') || window.createToastContainer();
    container.appendChild(toast);

    setTimeout(() => toast.classList.add('show'), 100);

    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
};

window.createToastContainer = function() {
    const container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
    return container;
};

// ── MODAL ENGINE ──────────────────────────────────────
window.closeModal = function(btnElement) {
    if (btnElement && btnElement.closest) {
        const modal = btnElement.closest('.modal-overlay');
        if (modal) modal.remove();
    } else {
        const modals = document.querySelectorAll('.modal-overlay');
        if (modals.length > 0) modals[modals.length - 1].remove();
    }
};

window.showModal = function(title, content, buttons = [], modalClass = '') {
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
};

window.toggleModalFullscreen = function(btn) {
    const modal = btn.closest('.modal');
    if (modal) {
        modal.classList.toggle('modal-fullscreen');
    }
};

// ── RESPONSIVE MENU TOGGLE ────────────────────────────
window.toggleMenu = function() {
    const navLinks = document.getElementById('navLinks');
    if (navLinks) {
        navLinks.classList.toggle('active');
    }
};

// ── CERRAR SESIÓN ─────────────────────────────────────
window.signOut = function() {
    sessionStorage.removeItem('_planioAuthed');
    localStorage.removeItem('_planioAuthed');
    localStorage.removeItem('activeTrainerId');
    localStorage.removeItem('_trainerEmail');
    window.location.href = 'login.html';
};

// ── AUTO-ACTUALIZAR ENLACE "VISTA ALUMNO" CON EL trainerId ────
// Garantiza que cuando el alumno use la app, sus datos se sincronicen
// con la cuenta correcta del administrador en Supabase.
document.addEventListener('DOMContentLoaded', () => {
    const clientViewLink = document.querySelector('#nav-clientview a');
    if (clientViewLink) {
        const tid = localStorage.getItem('activeTrainerId') || 'default';
        clientViewLink.href = `client-view.html?tid=${tid}`;
        clientViewLink.target = '_blank';
    }
});
