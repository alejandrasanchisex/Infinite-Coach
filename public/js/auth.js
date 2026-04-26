const AUTH = {
    tokenClient: null,
    accessToken: null,
    userEmail: null,
    isAuthorized: false,
    gapiReady: null,

    init: () => {
        // Solo inicializa Google Services (llamado cuando los scripts de Google cargan)
        if (CONFIG.google.clientId.includes('TU_CLIENT_ID')) {
            console.warn('Modo Demo: Credenciales de Google no configuradas.');
            return;
        }

        const checkGoogleLibs = (attempts = 0) => {
            if (window.google && window.gapi) {
                // Si ya hay bypass activo, no mostrar botón de login
                const showButton = sessionStorage.getItem('_trainerAuthed') !== '1';
                AUTH.initializeGoogleServices(showButton);
            } else {
                if (attempts < 20) {
                    setTimeout(() => checkGoogleLibs(attempts + 1), 500);
                } else {
                    console.error('No se pudieron cargar los servicios de Google.');
                    const btnContainer = document.getElementById('google-signin-container');
                    if (btnContainer) {
                        btnContainer.innerHTML = '<div style="color:var(--error-color); margin-top:1rem;">Error cargando servicios de Google. Comprueba tu conexión o desactiva bloqueadores de anuncios.</div>';
                    }
                }
            }
        };
        checkGoogleLibs();
    },

    initializeGoogleServices: (showButton = true) => {
        AUTH.tokenClient = google.accounts.oauth2.initTokenClient({
            client_id: CONFIG.google.clientId,
            scope: CONFIG.google.scopes,
            callback: async (tokenResponse) => {
                if (tokenResponse.error !== undefined) {
                    console.error('Error en autenticación:', tokenResponse);
                    return;
                }
                
                // Guardar token para persistencia tras recarga
                localStorage.setItem('_gapiToken', JSON.stringify(tokenResponse));
                
                if (AUTH.gapiReady) await AUTH.gapiReady;
                if (gapi.client) {
                    gapi.client.setToken(tokenResponse);
                    AUTH.accessToken = tokenResponse.access_token;
                    AUTH.isAuthorized = true;
                    AUTH.fetchUserInfo();
                }
            },
        });

        AUTH.gapiReady = new Promise((resolve, reject) => {
            gapi.load('client', async () => {
                try {
                    await gapi.client.init({ apiKey: CONFIG.google.apiKey, discoveryDocs: [] });
                    await gapi.client.load('drive', 'v3');
                    await gapi.client.load('sheets', 'v4');
                    console.log('API de Google cargada con éxito (Drive y Sheets)');
                    resolve();
                } catch (err) {
                    console.error('Error cargando APIs de Google:', err);
                    reject(err);
                }
            });
        });
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
                    
                    <div style="margin: 1.5rem 0; border-top: 1px solid rgba(255,255,255,0.1); position: relative; text-align: center;">
                        <span style="position: absolute; top: -10px; left: 50%; transform: translateX(-50%); background: #0f172a; padding: 0 10px; font-size: 0.7rem; color: var(--text-muted);">O TAMBIÉN</span>
                    </div>

                    <button onclick="AUTH.signIn()" class="btn btn-outline" style="width:100%; display:flex; align-items:center; gap:0.5rem; justify-content:center; opacity: 0.7;">
                        <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="currentColor"/>
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="currentColor"/>
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="currentColor"/>
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="currentColor"/>
                        </svg>
                        Seguir con Google
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
        localStorage.setItem('_trainerEmail', AUTH.userEmail);
        
        showToast("¡Bienvenido/a de nuevo!", "success");
        
        if (typeof onGoogleAuthSuccess === 'function') {
            onGoogleAuthSuccess();
        }
    },

    signIn: () => {
        if (window.location.protocol === 'file:') {
            alert("⚠️ ERROR DE PROTOCOLO: Google no permite iniciar sesión si abres el archivo directamente (doble clic). \n\nDebes usar un servidor local (ej: http://localhost:8080). Si no sabes cómo, consulta las instrucciones del asistente.");
            return;
        }

        if (AUTH.tokenClient) {
            // Forzar siempre la selección de cuenta
            AUTH.tokenClient.requestAccessToken({ prompt: 'select_account' });
        } else {
            alert("Los servicios de Google todavía se están cargando o fueron bloqueados por tu navegador/Adblock. Por favor, espera unos segundos o recarga la página con los bloqueadores desactivados.");
            // Intentar re-inicializar si las librerías están presentes
            if(window.google && window.gapi) {
                AUTH.initializeGoogleServices(false);
                if (AUTH.tokenClient) AUTH.tokenClient.requestAccessToken({ prompt: 'select_account' });
            }
        }
    },

    signOut: () => {
        sessionStorage.removeItem('_trainerAuthed');
        localStorage.removeItem('_gapiToken');
        const token = AUTH.accessToken;
        if (token) {
            google.accounts.oauth2.revoke(token, () => window.location.reload());
        } else {
            window.location.reload();
        }
    },

    fetchUserInfo: async () => {
        try {
            const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                headers: { 'Authorization': `Bearer ${AUTH.accessToken}` }
            });
            const data = await response.json();
            AUTH.userEmail = data.email;

            // SaaS: Vincular ID de Entrenador activo al Email sanitized
            if (typeof window.updateActiveTrainerId === 'function') {
                const trainerId = data.email.toLowerCase().replace(/[.@]/g, '_');
                window.updateActiveTrainerId(trainerId);
            }

            // Guardar sesión para no pedir login en cada navegación
            sessionStorage.setItem('_trainerAuthed', '1');
            localStorage.setItem('_trainerEmail', data.email.toLowerCase());
            console.log('Sesión iniciada como:', AUTH.userEmail);
            if (typeof onGoogleAuthSuccess === 'function') onGoogleAuthSuccess();
        } catch (error) {
            console.error('Error fetching user info:', error);
        }
    }
};

// ── PASO 1: Bypass inmediato si ya autenticó en esta sesión ───────────
window.addEventListener('DOMContentLoaded', () => {
    if (sessionStorage.getItem('_trainerAuthed') === '1') {
        AUTH.isAuthorized = true;
        const loginScreen = document.getElementById('login-screen');
        const app = document.getElementById('app');
        if (loginScreen) loginScreen.style.display = 'none';
        if (app) app.style.display = 'block';
        
        // Recuperar token guardado si existe
        const savedToken = localStorage.getItem('_gapiToken');
        if (savedToken) {
            try {
                const token = JSON.parse(savedToken);
                // Esperar a que GAPI esté listo antes de setear el token
                const interval = setInterval(() => {
                    if (window.gapi && gapi.client && gapi.client.sheets) {
                        clearInterval(interval);
                        gapi.client.setToken(token);
                        AUTH.accessToken = token.access_token;
                        AUTH.isAuthorized = true;
                        console.log('Auth: Token restaurado de localStorage');
                        
                        if (typeof onGoogleAuthSuccess === 'function') {
                            onGoogleAuthSuccess();
                        }
                    }
                }, 500);
            } catch(e) { console.error('Error restaurando token:', e); }
        } else {
            // Delay original si no hay token literal
            setTimeout(() => {
                if (typeof onGoogleAuthSuccess === 'function') {
                    onGoogleAuthSuccess();
                }
            }, 1000);
        }
    }
});

// ── PASO 2: Cargar los scripts de Google con mayor control ────────────
if (sessionStorage.getItem('_trainerAuthed') !== '1') {
    AUTH.renderSignInButton();
}

if (typeof CONFIG !== 'undefined' && !CONFIG.google.clientId.includes('TU_CLIENT_ID')) {
    let scriptGSILoaded = false;
    let scriptGAPILoaded = false;

    const tryInit = () => {
        if (scriptGSILoaded && scriptGAPILoaded) {
            console.log("Ambas librerías de Google cargadas. Iniciando...");
            AUTH.init();
        }
    };

    const script1 = document.createElement('script');
    script1.src = 'https://accounts.google.com/gsi/client';
    script1.async = true;
    script1.defer = true;
    script1.onload = () => { scriptGSILoaded = true; tryInit(); };

    const script2 = document.createElement('script');
    script2.src = 'https://apis.google.com/js/api.js';
    script2.async = true;
    script2.defer = true;
    script2.onload = () => { scriptGAPILoaded = true; tryInit(); };
    
    const showError = (e) => {
        console.error("Error cargando script de Google:", e.target.src);
        const btnContainer = document.getElementById('google-signin-container');
        if (btnContainer && !btnContainer.innerHTML.includes('Error')) {
            btnContainer.innerHTML = '<div style="color:var(--error-color); margin-top:1rem; font-size:0.9rem;">⚠️ Error conectando con servidores de Google. Comprueba tu conexión o desactiva tu AdBlocker para este sitio.</div>';
        }
    };

    script1.onerror = showError;
    script2.onerror = showError;

    document.head.appendChild(script1);
    document.head.appendChild(script2);
}

// Verificación de protocolo al cargar
if (window.location.protocol === 'file:') {
    console.warn("⚠️ Advertencia: Google Auth no funcionará desde el protocolo file://. Usa un servidor local.");
}

// Auto-disparar sincronización si ya hay sesión activa (para refrescos de página en cualquier pestaña)
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        if (sessionStorage.getItem('_trainerAuthed') === '1' && typeof onGoogleAuthSuccess === 'function') {
            console.log("Sesión persistente detectada -> Disparando onGoogleAuthSuccess global");
            onGoogleAuthSuccess();
        }
    }, 800); // Dar tiempo a que carguen otros scripts
});
