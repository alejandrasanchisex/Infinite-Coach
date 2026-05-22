(function() {
    // Check if already standalone (installed)
    if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true) {
        return;
    }

    // Check if dismissed recently
    if (localStorage.getItem('pwa-prompt-dismissed') === 'true') {
        return;
    }

    // Detect iOS
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

    let deferredPrompt = null;

    // Listen for the beforeinstallprompt event (Android/Chrome)
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        // Show banner after 3 seconds
        setTimeout(showPWABanner, 3000);
    });

    // For iOS, show the banner after 5 seconds since there's no install prompt event
    if (isIOS) {
        setTimeout(showPWABanner, 5000);
    }

    function showPWABanner() {
        // Prevent duplicate banners
        if (document.getElementById('pwa-install-banner')) return;

        // Get dynamic brand name
        let brandName = 'Infinite Coach';
        if (window.BrandConfig) {
            const brand = window.BrandConfig.get();
            if (brand && brand.name) brandName = brand.name;
        }

        // Create style element
        const style = document.createElement('style');
        style.innerHTML = `
            #pwa-install-banner {
                position: fixed;
                bottom: 20px;
                left: 20px;
                right: 20px;
                background: rgba(20, 20, 30, 0.85);
                backdrop-filter: blur(25px);
                -webkit-backdrop-filter: blur(25px);
                border: 1px solid rgba(255, 255, 255, 0.08);
                border-radius: 20px;
                padding: 16px;
                box-shadow: 0 15px 35px rgba(0, 0, 0, 0.6);
                z-index: 99999;
                display: flex;
                flex-direction: column;
                gap: 12px;
                animation: pwaSlideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1);
                color: #fff;
                font-family: 'Inter', sans-serif;
            }
            @keyframes pwaSlideUp {
                from { transform: translateY(120%) scale(0.9); opacity: 0; }
                to { transform: translateY(0) scale(1); opacity: 1; }
            }
            .pwa-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
            }
            .pwa-info {
                display: flex;
                align-items: center;
                gap: 12px;
            }
            .pwa-icon {
                width: 40px;
                height: 40px;
                background: rgba(0, 217, 255, 0.1);
                border-radius: 12px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 1.25rem;
                color: var(--primary-color, #00d9ff);
                border: 1px solid rgba(0, 217, 255, 0.2);
                box-shadow: 0 4px 10px rgba(0, 217, 255, 0.1);
            }
            .pwa-text {
                display: flex;
                flex-direction: column;
                gap: 2px;
            }
            .pwa-title {
                font-weight: 800;
                font-size: 0.95rem;
                letter-spacing: -0.3px;
            }
            .pwa-subtitle {
                font-size: 0.75rem;
                color: rgba(255, 255, 255, 0.5);
            }
            .pwa-close {
                background: transparent;
                border: none;
                color: rgba(255, 255, 255, 0.4);
                font-size: 1.1rem;
                cursor: pointer;
                padding: 4px;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: color 0.2s;
            }
            .pwa-close:hover {
                color: #fff;
            }
            .pwa-instructions {
                background: rgba(255, 255, 255, 0.03);
                border: 1px solid rgba(255, 255, 255, 0.05);
                border-radius: 12px;
                padding: 10px 14px;
                font-size: 0.8rem;
            }
            .pwa-instructions-title {
                font-weight: 700;
                color: rgba(255, 255, 255, 0.9);
                margin-bottom: 6px;
            }
            .pwa-list {
                padding-left: 18px;
                margin: 0;
                color: rgba(255, 255, 255, 0.65);
                display: flex;
                flex-direction: column;
                gap: 4px;
                line-height: 1.3;
            }
            .pwa-highlight {
                color: var(--primary-color, #00d9ff);
                font-weight: 700;
            }
            .pwa-btn {
                background: var(--primary-color, #00d9ff);
                color: #000;
                border: none;
                border-radius: 12px;
                padding: 10px;
                font-weight: 800;
                font-size: 0.8rem;
                text-transform: uppercase;
                letter-spacing: 1px;
                cursor: pointer;
                transition: transform 0.2s, box-shadow 0.2s;
                text-align: center;
            }
            .pwa-btn:active {
                transform: scale(0.98);
            }
        `;
        document.head.appendChild(style);

        // Create banner element
        const banner = document.createElement('div');
        banner.id = 'pwa-install-banner';

        let innerContent = `
            <div class="pwa-header">
                <div class="pwa-info">
                    <div class="pwa-icon">📲</div>
                    <div class="pwa-text">
                        <span class="pwa-title">Instala ${brandName}</span>
                        <span class="pwa-subtitle">Acceso rápido a tu rutina y dieta</span>
                    </div>
                </div>
                <button class="pwa-close" id="pwa-close-btn">✕</button>
            </div>
        `;

        if (isIOS) {
            innerContent += `
                <div class="pwa-instructions">
                    <div class="pwa-instructions-title">Para instalar en tu iPhone:</div>
                    <ol class="pwa-list">
                        <li>Toca el botón <span class="pwa-highlight">Compartir</span> (cuadrado con flecha hacia arriba en Safari)</li>
                        <li>Desliza hacia abajo y pulsa <span class="pwa-highlight">"Añadir a pantalla de inicio"</span></li>
                    </ol>
                </div>
            `;
        } else {
            innerContent += `
                <button class="pwa-btn" id="pwa-install-btn">Instalar App</button>
            `;
        }

        banner.innerHTML = innerContent;
        document.body.appendChild(banner);

        // Setup Close Action
        document.getElementById('pwa-close-btn').addEventListener('click', () => {
            banner.style.animation = 'pwaSlideDown 0.3s ease forwards';
            localStorage.setItem('pwa-prompt-dismissed', 'true');
            setTimeout(() => banner.remove(), 300);
        });

        // Setup CSS for Slide Down on close
        const extraStyle = document.createElement('style');
        extraStyle.innerHTML = `
            @keyframes pwaSlideDown {
                from { transform: translateY(0); opacity: 1; }
                to { transform: translateY(120%); opacity: 0; }
            }
        `;
        document.head.appendChild(extraStyle);

        // Setup Android Install Prompt Action
        if (!isIOS) {
            const installBtn = document.getElementById('pwa-install-btn');
            if (installBtn) {
                installBtn.addEventListener('click', async () => {
                    if (!deferredPrompt) return;
                    deferredPrompt.prompt();
                    const { outcome } = await deferredPrompt.userChoice;
                    if (outcome === 'accepted') {
                        banner.remove();
                    }
                    deferredPrompt = null;
                });
            }
        }
    }
})();
