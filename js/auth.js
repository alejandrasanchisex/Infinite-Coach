const AUTH = {
    tokenClient: null,
    accessToken: null,
    userEmail: null,
    isAuthorized: false,
    gapiReady: null,

    init: () => {
        // Ya no se requiere Google Services. Solo renderizamos el login manual.
        AUTH.renderSignInButton();
    },

    renderSignInButton: () => {
        const btnContainer = document.getElementById('google-signin-container');
        if (btnContainer) {
            btnContainer.innerHTML = `
                <div class="manual-login-form" style="margin-top: 1.5rem; text-align: left;">
                    <div class="form-group">
                        <label class="form-label" style="font-size: 0.8rem;">Email de Acceso</label>
                        <input type="email" id="auth_email" class="form-input" placeholder="tu@email.com" style="background: rgba(255,255,255,0.05);">
                    </div>
                    <div class="form-group">
                        <label class="form-label" style="font-size: 0.8rem;">Contraseña</label>
                        <input type="password" id="auth_pass" class="form-input" placeholder="••••••••" style="background: rgba(255,255,255,0.05);">
                    </div>
                    <button onclick="AUTH.handleManualLogin()" class="btn btn-primary" style="width:100%; margin-top: 1rem; height: 45px; font-weight: 600;">
                        Entrar a la Academia
                    </button>
                </div>
            `;
        }
    },

    handleManualLogin: () => {
        const email = document.getElementById('auth_email').value;
        const pass = document.getElementById('auth_pass').value;

        if (!email || !pass) {
            showToast("Por favor, rellena todos los campos", "warning");
            return;
        }

        // Validación simple para el modo normal (puedes cambiar esta contraseña)
        // En una app real esto iría contra Firebase Auth o una DB
        if (pass.length < 6) {
            showToast("La contraseña debe tener al menos 6 caracteres", "error");
            return;
        }

        console.log("Iniciando sesión manual para:", email);
        
        // Simular éxito y guardar sesión
        AUTH.userEmail = email.toLowerCase();
        
        if (typeof window.updateActiveTrainerId === 'function') {
            const trainerId = AUTH.userEmail.replace(/[.@]/g, '_');
            window.updateActiveTrainerId(trainerId);
        }

        sessionStorage.setItem('_trainerAuthed', '1');
        localStorage.setItem('_trainerAuthed', '1');
        localStorage.setItem('_trainerEmail', AUTH.userEmail);
        
        showToast("¡Bienvenido/a de nuevo!", "success");
        
        if (typeof onGoogleAuthSuccess === 'function') {
            onGoogleAuthSuccess();
        }
    },

    signOut: () => {
        sessionStorage.removeItem('_trainerAuthed');
        localStorage.removeItem('_trainerAuthed');
        window.location.reload();
    }
};

// ── PASO 1: Bypass inmediato si ya autenticó en esta sesión ───────────
window.addEventListener('DOMContentLoaded', () => {
    if (sessionStorage.getItem('_trainerAuthed') === '1' || localStorage.getItem('_trainerAuthed') === '1') {
        sessionStorage.setItem('_trainerAuthed', '1');
        localStorage.setItem('_trainerAuthed', '1');
        AUTH.isAuthorized = true;
        const loginScreen = document.getElementById('login-screen');
        const app = document.getElementById('app');
        if (loginScreen) loginScreen.style.display = 'none';
        if (app) app.style.display = 'block';
        
        setTimeout(() => {
            if (typeof onGoogleAuthSuccess === 'function') {
                onGoogleAuthSuccess();
            }
        }, 500);
    } else {
        AUTH.init();
    }
});

// Auto-disparar sincronización si ya hay sesión activa (para refrescos de página en cualquier pestaña)
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        if ((sessionStorage.getItem('_trainerAuthed') === '1' || localStorage.getItem('_trainerAuthed') === '1') && typeof onGoogleAuthSuccess === 'function') {
            sessionStorage.setItem('_trainerAuthed', '1');
            localStorage.setItem('_trainerAuthed', '1');
            console.log("Sesión persistente detectada -> Disparando onGoogleAuthSuccess global");
            onGoogleAuthSuccess();
        }
    }, 800); // Dar tiempo a que carguen otros scripts
});
