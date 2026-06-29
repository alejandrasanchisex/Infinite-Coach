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
        console.log("Redirecting to official trainer login page...");
        window.location.href = 'trainer-login.html?v=529';
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
        localStorage.removeItem('_trainerEmail');
        localStorage.removeItem('activeTrainerId');
        localStorage.removeItem('_isSubTrainer');
        localStorage.removeItem('_subTrainerId');
        localStorage.removeItem('_subTrainerName');
        localStorage.removeItem('_subTrainerEmail');
        window.location.reload();
    }
};

// ── PASO 1: Bypass inmediato si ya autenticó en esta sesión ───────────
window.addEventListener('DOMContentLoaded', () => {
    if (sessionStorage.getItem('_trainerAuthed') === '1' || localStorage.getItem('_trainerAuthed') === '1') {
        
        // ── LICENCIA EXPIRADA CHECK (LOCAL) ─────────────────────────
        try {
            const PLATFORM_KEY = 'saasFitnessPlatform';
            const platform = JSON.parse(localStorage.getItem(PLATFORM_KEY) || '{"trainers":[]}');
            const trainerId = localStorage.getItem('activeTrainerId');
            if (trainerId && trainerId !== 'demo') {
                const trainer = (platform.trainers || []).find(t => t.id === trainerId);
                if (trainer) {
                    const now = new Date();
                    const parts = trainer.expiryDate?.split('/');
                    let isExpired = false;
                    if (parts && parts.length === 3) {
                        const day = parseInt(parts[0], 10);
                        const month = parseInt(parts[1], 10) - 1;
                        const year = parseInt(parts[2], 10);
                        const expiryDate = new Date(year, month, day, 23, 59, 59);
                        isExpired = expiryDate < now;
                    }
                    if (trainer.status !== 'active' || isExpired) {
                        if (!window.location.pathname.includes('trainer-subscription.html')) {
                            console.log(`Licencia vencida o inactiva (Vence: ${trainer.expiryDate}). Redirigiendo.`);
                            window.location.href = 'trainer-subscription.html';
                            return;
                        }
                    }
                }
            }
        } catch(e) { console.warn('Error checking license expiration (local):', e); }
        // ────────────────────────────────────────────────────────────

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
    setTimeout(async () => {
        if (sessionStorage.getItem('_trainerAuthed') === '1' || localStorage.getItem('_trainerAuthed') === '1') {
            sessionStorage.setItem('_trainerAuthed', '1');
            localStorage.setItem('_trainerAuthed', '1');
            
            // ── LICENCIA EXPIRADA CHECK (SYNC NUBE SEGUNDO PLANO) ───────
            if (window.SupabaseService) {
                try {
                    window.SupabaseService.init();
                    const platformData = await window.SupabaseService.getGlobalConfig();
                    if (platformData) {
                        localStorage.setItem('saasFitnessPlatform', JSON.stringify(platformData));
                        const trainerId = localStorage.getItem('activeTrainerId');
                        if (trainerId && trainerId !== 'demo') {
                            const trainer = (platformData.trainers || []).find(t => t.id === trainerId);
                            if (trainer) {
                                const now = new Date();
                                const parts = trainer.expiryDate?.split('/');
                                let isExpired = false;
                                if (parts && parts.length === 3) {
                                    const day = parseInt(parts[0], 10);
                                    const month = parseInt(parts[1], 10) - 1;
                                    const year = parseInt(parts[2], 10);
                                    const expiryDate = new Date(year, month, day, 23, 59, 59);
                                    isExpired = expiryDate < now;
                                }
                                if (trainer.status !== 'active' || isExpired) {
                                    if (!window.location.pathname.includes('trainer-subscription.html')) {
                                        console.log(`Licencia vencida o inactiva detectada en nube. Redirigiendo.`);
                                        window.location.href = 'trainer-subscription.html';
                                        return;
                                    }
                                }
                            }
                        }
                    }
                } catch(e) { console.warn("Error syncing license status with Supabase:", e); }
            }
            // ────────────────────────────────────────────────────────────

            console.log("Sesión persistente detectada -> Disparando onGoogleAuthSuccess global");
            if (typeof onGoogleAuthSuccess === 'function') {
                onGoogleAuthSuccess();
            }
        }
    }, 800); // Dar tiempo a que carguen otros scripts
});
