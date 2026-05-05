const fs = require('fs');
const files = fs.readdirSync('.').filter(f => f.startsWith('trainer-') && f.endsWith('.html') && f !== 'trainer-dashboard.html');

for (let file of files) {
    let content = fs.readFileSync(file, 'utf8');

    if (content.includes('id="login-screen"')) continue;

    content = content.replace('<body>', `<body>
    <!-- Pantalla de Login -->
    <div id="login-screen" class="wizard-container" style="min-height: 100vh; display: flex; align-items: center; justify-content: center;">
        <div class="card wizard-card" style="max-width: 400px; text-align: center; padding: 2rem;">
            <div style="font-size: 3rem; margin-bottom: 1rem;">🔒</div>
            <h2>Acceso a tu Backend</h2>
            <p class="text-muted mb-lg">Introduce tus credenciales para acceder a tu base de datos de clientes y rutinas.</p>
            <div id="google-signin-container"></div>
        </div>
    </div>

    <!-- App Principal -->
    <div id="app" style="display: none;">`);

    content = content.replace('<script src="js/data-models.js">', `</div>

    <!-- Nuevos Scripts de Google -->
    <script src="js/config.js"></script>
    <script src="js/auth.js"></script>
    <script src="js/sheets.js"></script>

    <script src="js/data-models.js">`);

    content = content.replace('</body>', `
    <script>
        // Función que llama el sistema de Google cuando la sesión es exitosa
        function onGoogleAuthSuccess() {
            document.getElementById('login-screen').style.display = 'none';
            document.getElementById('app').style.display = 'block';
            
            if(typeof window.dibujarTabla === 'function') {
                window.dibujarTabla();
            } else if(typeof dibujarTabla === 'function') {
                dibujarTabla();
            }
            if(typeof renderRoutines === 'function') renderRoutines();
            if(typeof renderDiets === 'function') renderDiets();
            if(typeof renderFeedbacks === 'function') renderFeedbacks();
            if(typeof initClientData === 'function') initClientData();
        }
    </script>
</body>`);

    fs.writeFileSync(file, content, 'utf8');
    console.log('Patched ' + file);
}
