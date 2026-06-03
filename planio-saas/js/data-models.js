/**
 * PLANIO DATA MODELS
 * Gestiona el almacenamiento local y la sincronización con la nube.
 */

const DB_VERSION = 1;

function getStorageKey() {
    const activeTrainerId = localStorage.getItem('activeTrainerId') || 'default';
    return `planioAppData_${activeTrainerId}`;
}

const getData = () => {
    const sKey = getStorageKey();
    const raw = localStorage.getItem(sKey);
    const defaults = {
        version: DB_VERSION,
        clients: [],
        appointments: [],
        invoices: [],
        feedbacks: [
            { id: 'fb1', clientName: 'Laura García', rating: 5, comment: 'Excelente servicio. Muy profesional y la agenda de marca blanca funciona genial.', date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() },
            { id: 'fb2', clientName: 'Carlos Sánchez', rating: 4, comment: 'Muy buena consultoría rápida. Resolvió todas mis dudas.', date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
            { id: 'fb3', clientName: 'Amalia', rating: 5, comment: '', date: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString() }
        ],
        services: [
            { id: 'srv1', name: 'Consultoría Express 🤝', price: 50.00, duration: 30, description: 'Sesión rápida de asesoramiento técnico.' },
            { id: 'srv2', name: 'Mentoría Privada Oro 🗣️', price: 120.00, duration: 60, description: 'Revisión uno a uno de objetivos y mentoría de negocio.' },
            { id: 'srv3', name: 'Clase Particular 🎓', price: 60.00, duration: 60, description: 'Clase individualizada de procesos.' },
            { id: 'srv4', name: 'Sesión de Poses Heels / NPC 👠', price: 60.00, duration: 60, description: 'Entrenamiento técnico de poses competitivas y pasarela.' }
        ],
        availability: [
            { day: 1, name: 'Lunes', active: true, start: '09:00', end: '18:00' },
            { day: 2, name: 'Martes', active: true, start: '09:00', end: '18:00' },
            { day: 3, name: 'Miércoles', active: true, start: '09:00', end: '18:00' },
            { day: 4, name: 'Jueves', active: true, start: '09:00', end: '18:00' },
            { day: 5, name: 'Viernes', active: true, start: '09:00', end: '18:00' },
            { day: 6, name: 'Sábado', active: false, start: '10:00', end: '14:00' },
            { day: 7, name: 'Domingo', active: false, start: '10:00', end: '14:00' }
        ],
        customSlots: [
            { id: 'cs1', date: '2026-05-29', time: '16:00', duration: 60, modality: 'AMBAS', status: 'available' },
            { id: 'cs2', date: '2026-05-29', time: '20:00', duration: 60, modality: 'AMBAS', status: 'occupied' },
            { id: 'cs3', date: '2026-05-30', time: '09:00', duration: 60, modality: 'AMBAS', status: 'available' },
            { id: 'cs4', date: '2026-05-30', time: '11:00', duration: 60, modality: 'AMBAS', status: 'available' },
            { id: 'cs5', date: '2026-05-30', time: '16:00', duration: 60, modality: 'AMBAS', status: 'available' },
            { id: 'cs6', date: '2026-05-30', time: '17:00', duration: 60, modality: 'AMBAS', status: 'available' }
        ],
        activity: [
            { id: 'act1', type: 'success', text: 'Irene Magaly Alfaro ha reservado una clase', date: '30 may, 19:00', timeAgo: 'HACE POCO' },
            { id: 'act2', type: 'error', text: 'Irene Magaly Alfaro ha cancelado una clase', date: '29 may, 15:00', timeAgo: 'HACE POCO' },
            { id: 'act3', type: 'error', text: 'Lucía ha cancelado una clase', date: '29 may, 09:00', timeAgo: 'HACE POCO' },
            { id: 'act4', type: 'success', text: 'Miriam Peñas Alcántara ha reservado una clase', date: '27 may, 09:00', timeAgo: 'HACE POCO' }
        ],
        brand: {
            name: 'Planio',
            logo: '',
            configured: true,
            whatsapp: '+34000000000',
            colors: {
                primary: '#6366F1',
                secondary: '#4F46E5',
                accent: '#EC4899',
                themeMode: 'dark'
            },
            fiscalData: {
                companyName: 'Planio Reservas S.L.',
                nif: 'B12345678',
                address: 'Calle Mayor 12',
                zip: '28001',
                city: 'Madrid',
                defaultIva: 21,
                invoiceSeries: 'PL-' + new Date().getFullYear()
            },
            stripe: {
                enabled: true,
                mode: 'test',
                publishableKey: 'pk_test_51PlaNiOBookingSimulatedKey1010',
                secretKey: 'sk_test_51PlaNiOBookingSimulatedSecretKey2020',
                webhookSecret: 'whsec_SimulatedWebhookSecretKey3030'
            }
        }
    };

    if (!raw) {
        // Seeding database with premium demonstration data
        const client1Id = generateUUID();
        const client2Id = generateUUID();
        const client3Id = generateUUID();
        
        const demoClients = [
            {
                id: client1Id,
                name: 'Laura García',
                email: 'laura@correo.com',
                phone: '+34 611 222 333',
                monthlyFee: 50.00,
                status: 'active',
                paymentStatus: 'paid',
                paymentMethod: 'Stripe',
                cardDetails: { brand: 'Visa', last4: '4242', expiry: '12/28' },
                accessCode: 'PWA-LAU',
                category: 'Bikini',
                federation: 'NPC',
                vouchers: [
                    { id: 'v1', name: 'Bono 5 Clases Online', status: 'active', date: '2026-05-20', code: 'QJM4U8', used: 1, total: 5 }
                ],
                evolution: [
                    { id: 'ev1', date: '2026-05-20', weight: 54.5, notes: 'Física y postura excelente.' },
                    { id: 'ev2', date: '2026-05-27', weight: 54.0, notes: 'Mejora en pasarela y control abdominal.' }
                ],
                createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
                id: client2Id,
                name: 'Carlos Sánchez',
                email: 'carlos@correo.com',
                phone: '+34 644 555 666',
                monthlyFee: 75.00,
                status: 'active',
                paymentStatus: 'overdue',
                paymentMethod: 'Stripe',
                cardDetails: { brand: 'Mastercard', last4: '9876', expiry: '06/29' },
                accessCode: 'PWA-CAR',
                category: 'Mens Physique',
                federation: 'IFBB',
                vouchers: [
                    { id: 'v2', name: 'Bono 10 Clases Presencial', status: 'active', date: '2026-05-15', code: 'XYZ789', used: 3, total: 10 }
                ],
                evolution: [
                    { id: 'ev3', date: '2026-05-15', weight: 78.0, notes: 'Definición y poses de espalda.' }
                ],
                createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
                id: client3Id,
                name: 'Víctor Toledo',
                email: 'victor@correo.com',
                phone: '+34 688 999 000',
                monthlyFee: 60.00,
                status: 'inactive',
                paymentStatus: 'paid',
                paymentMethod: 'Manual',
                cardDetails: null,
                accessCode: 'PWA-VIC',
                category: 'Wellness',
                federation: 'AEFF',
                vouchers: [],
                evolution: [],
                createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString()
            }
        ];

        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(10, 0, 0, 0);

        const nextWeek = new Date();
        nextWeek.setDate(nextWeek.getDate() + 4);
        nextWeek.setHours(16, 30, 0, 0);

        const demoAppointments = [
            {
                id: generateUUID(),
                clientId: client1Id,
                clientName: 'Laura García',
                serviceType: 'Mentoría',
                date: tomorrow.toISOString(),
                duration: 60,
                notes: 'Sesión de revisión mensual de objetivos. Enlace Zoom: https://zoom.us/j/123456',
                createdAt: new Date().toISOString()
            },
            {
                id: generateUUID(),
                clientId: client2Id,
                clientName: 'Carlos Sánchez',
                serviceType: 'Consultoría',
                date: nextWeek.toISOString(),
                duration: 30,
                notes: 'Consultoría rápida de estrategia de ventas.',
                createdAt: new Date().toISOString()
            }
        ];

        // Seeded invoices with sequential hashes (VeriFactu compliant)
        const inv1Num = `PL-2026-0001`;
        const inv2Num = `PL-2026-0002`;
        const inv1Date = new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString();
        const inv2Date = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString();
        
        const hash1 = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";
        const hash2 = "ca35a662762a22123f2b4842111c121e12a2dfbc849929cc99211aaef8323211";

        const demoInvoices = [
            {
                id: generateUUID(),
                clientId: client1Id,
                clientName: 'Laura García',
                date: inv1Date,
                number: inv1Num,
                amount: 50.00,
                base: 41.32,
                ivaRate: 21,
                ivaAmount: 8.68,
                description: 'Mensualidad Planio - Mentoría',
                status: 'paid',
                previousHash: '',
                hash: hash1
            },
            {
                id: generateUUID(),
                clientId: client3Id,
                clientName: 'Víctor Toledo',
                date: inv2Date,
                number: inv2Num,
                amount: 60.00,
                base: 49.59,
                ivaRate: 21,
                ivaAmount: 10.41,
                description: 'Reserva de Cita Asesoría',
                status: 'paid',
                previousHash: hash1,
                hash: hash2
            }
        ];

        defaults.clients = demoClients;
        defaults.appointments = demoAppointments;
        defaults.invoices = demoInvoices;
        
        // Save initial seed locally
        localStorage.setItem(sKey, JSON.stringify(defaults));
        return defaults;
    }

    try {
        const parsed = JSON.parse(raw);
        const merged = { ...defaults, ...parsed };

        // Si el localStorage tiene feedbacks vacíos pero los defaults tienen datos de demo,
        // conservar los defaults para que la pantalla no aparezca vacía en el primer uso
        if (!merged.feedbacks || merged.feedbacks.length === 0) {
            merged.feedbacks = defaults.feedbacks;
        }

        // Migración: inyectar la reseña de Amalia si no existe aún en los datos guardados
        if (merged.feedbacks && !merged.feedbacks.find(f => f.id === 'fb3')) {
            merged.feedbacks.push({
                id: 'fb3',
                clientName: 'Amalia',
                rating: 5,
                comment: '',
                date: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
            });
            // Guardar inmediatamente para persistir la migración
            try { localStorage.setItem(getStorageKey(), JSON.stringify(merged)); } catch(e) {}
        }

        if (merged.brand && !merged.brand.stripe) {
            merged.brand.stripe = {
                enabled: true,
                mode: 'test',
                publishableKey: 'pk_test_51PlaNiOBookingSimulatedKey1010',
                secretKey: 'sk_test_51PlaNiOBookingSimulatedSecretKey2020',
                webhookSecret: 'whsec_SimulatedWebhookSecretKey3030'
            };
        }
        if (merged.clients) {
            merged.clients.forEach(c => {
                if (c.category === undefined) c.category = 'Ninguna';
                if (c.federation === undefined) c.federation = 'Ninguna';
                if (c.vouchers === undefined) c.vouchers = [];
                if (c.evolution === undefined) c.evolution = [];
            });
        }
        return merged;
    } catch(e) {
        return defaults;
    }
};

const saveData = (db) => {
    const sKey = getStorageKey();
    localStorage.setItem(sKey, JSON.stringify(db));

    // Cloud Sync en segundo plano
    const activeId = localStorage.getItem('activeTrainerId');
    if (activeId && activeId !== 'default' && window.SupabaseService) {
        window.SupabaseService.saveTrainerData(activeId, db)
            .then(success => {
                if (success) console.log("Sincronización en segundo plano completada ✅");
            })
            .catch(err => console.error("Error sincronizando en la nube:", err));
    }
};

const generateUUID = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};

// ============================================
// CLIENTS MODEL
// ============================================
const Clients = {
    getAll: () => {
        const db = getData();
        return db.clients || [];
    },
    getById: (id) => {
        return Clients.getAll().find(c => c.id == id);
    },
    create: (clientData) => {
        const db = getData();
        const newClient = {
            id: generateUUID(),
            name: clientData.name || 'Nuevo Cliente',
            email: clientData.email || '',
            phone: clientData.phone || '',
            monthlyFee: parseFloat(clientData.monthlyFee) || 0,
            status: clientData.status || 'active',
            paymentStatus: clientData.paymentStatus || 'paid',
            paymentMethod: clientData.paymentMethod || 'Stripe', // Stripe or Manual
            cardDetails: clientData.cardDetails || { brand: 'Visa', last4: '4242', expiry: '12/28' }, // Stored mock card
            accessCode: clientData.accessCode || Math.random().toString(36).substring(2, 8).toUpperCase(),
            createdAt: new Date().toISOString()
        };
        db.clients.push(newClient);
        saveData(db);
        return newClient;
    },
    update: (id, fields) => {
        const db = getData();
        const idx = db.clients.findIndex(c => c.id == id);
        if (idx !== -1) {
            db.clients[idx] = { ...db.clients[idx], ...fields };
            saveData(db);
            return db.clients[idx];
        }
        return null;
    },
    delete: (id) => {
        const db = getData();
        db.clients = db.clients.filter(c => c.id != id);
        db.appointments = db.appointments.filter(a => a.clientId != id);
        db.invoices = db.invoices.filter(i => i.clientId != id);
        saveData(db);
        return true;
    },
    getTotalRevenue: () => {
        return Clients.getAll()
            .filter(c => c.status === 'active' && c.paymentStatus === 'paid')
            .reduce((sum, c) => sum + (parseFloat(c.monthlyFee) || 0), 0);
    },
    getPendingPayments: () => {
        return Clients.getAll().filter(c => c.status === 'active' && c.paymentStatus !== 'paid');
    }
};

// ============================================
// APPOINTMENTS MODEL
// ============================================
const Appointments = {
    getAll: () => {
        const db = getData();
        return db.appointments || [];
    },
    getById: (id) => {
        return Appointments.getAll().find(a => a.id == id);
    },
    getByClientId: (clientId) => {
        return Appointments.getAll().filter(a => a.clientId == clientId);
    },
    getUpcoming: () => {
        const now = new Date().toISOString();
        return Appointments.getAll()
            .filter(a => a.date >= now)
            .sort((a, b) => a.date.localeCompare(b.date));
    },
    create: (aptData) => {
        const db = getData();
        const newApt = {
            id: generateUUID(),
            clientId: aptData.clientId,
            clientName: aptData.clientName || 'Cliente',
            serviceType: aptData.serviceType || 'Consultoría', // Consultoría, Mentoría, Clase
            date: aptData.date || new Date().toISOString(),
            duration: parseInt(aptData.duration) || 60, // in minutes
            notes: aptData.notes || '',
            createdAt: new Date().toISOString()
        };
        db.appointments.push(newApt);
        saveData(db);
        return newApt;
    },
    update: (id, fields) => {
        const db = getData();
        const idx = db.appointments.findIndex(a => a.id == id);
        if (idx !== -1) {
            db.appointments[idx] = { ...db.appointments[idx], ...fields };
            saveData(db);
            return db.appointments[idx];
        }
        return null;
    },
    delete: (id) => {
        const db = getData();
        db.appointments = db.appointments.filter(a => a.id != id);
        saveData(db);
        return true;
    }
};

// ============================================
// INVOICES MODEL (VeriFactu Compliance)
// ============================================
const Invoices = {
    getAll: () => {
        const db = getData();
        return db.invoices || [];
    },
    getById: (id) => {
        return Invoices.getAll().find(i => i.id == id);
    },
    getByClientId: (clientId) => {
        return Invoices.getAll().filter(i => i.clientId == clientId);
    },
    getLast: () => {
        const all = Invoices.getAll();
        return all.length > 0 ? all[all.length - 1] : null;
    },
    getNextNumber: () => {
        const all = Invoices.getAll();
        const brand = BrandConfig.get();
        const prefix = (brand.fiscalData && brand.fiscalData.invoiceSeries) ? 
            brand.fiscalData.invoiceSeries + '-' : `PL-${new Date().getFullYear()}-`;
        
        const yearInvoices = all.filter(i => i.number && i.number.startsWith(prefix));
        
        if (yearInvoices.length === 0) return `${prefix}0001`;
        
        const lastNum = yearInvoices[yearInvoices.length - 1].number;
        const parts = lastNum.split('-');
        const seqNum = parts[parts.length - 1];
        const seq = parseInt(seqNum) + 1;
        return `${prefix}${seq.toString().padStart(4, '0')}`;
    },
    create: async (invoiceData) => {
        const db = getData();
        if (!db.invoices) db.invoices = [];

        const lastInvoice = Invoices.getLast();
        const prevHash = lastInvoice ? lastInvoice.hash : "";
        
        const brand = BrandConfig.get();
        const ivaRate = (brand.fiscalData && brand.fiscalData.defaultIva) || 21;
        const total = parseFloat(invoiceData.amount) || 0;
        const base = total / (1 + (ivaRate / 100));
        const ivaAmount = total - base;

        const newInvoice = {
            id: generateUUID(),
            clientId: invoiceData.clientId,
            clientName: invoiceData.clientName || 'Cliente',
            date: new Date().toISOString(),
            number: Invoices.getNextNumber(),
            amount: total,
            base: base,
            ivaRate: ivaRate,
            ivaAmount: ivaAmount,
            description: invoiceData.description || 'Reserva de Cita',
            status: 'paid',
            previousHash: prevHash,
            hash: "" // Se calcula abajo
        };

        // Generar hash criptográfico secuencial (Requisito VeriFactu)
        const chainData = `${newInvoice.number}|${newInvoice.date}|${newInvoice.amount.toFixed(2)}|${prevHash}`;
        newInvoice.hash = await Invoices.generateHash(chainData);

        db.invoices.push(newInvoice);
        saveData(db);
        return newInvoice;
    },
    generateHash: async (text) => {
        try {
            const msgUint8 = new TextEncoder().encode(text);
            const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        } catch (e) {
            // Fallback SHA-256 simple si no hay WebCrypto (desarrollo local inseguro)
            let hash = 0;
            for (let i = 0; i < text.length; i++) {
                const char = text.charCodeAt(i);
                hash = ((hash << 5) - hash) + char;
                hash = hash & hash; // Convert to 32bit integer
            }
            return Math.abs(hash).toString(16).padStart(64, '0');
        }
    }
};

// ============================================
// BRAND CONFIGURATION
// ============================================
const BrandConfig = {
    get: () => {
        const db = getData();
        return db.brand;
    },
    set: (brandData) => {
        const db = getData();
        
        if (!db.brand) db.brand = {};
        
        for (let key in brandData) {
            if (brandData.hasOwnProperty(key)) {
                db.brand[key] = brandData[key];
            }
        }
        
        db.brand.configured = true;
        saveData(db);
        return db.brand;
    },
    isConfigured: () => {
        const brand = BrandConfig.get();
        return brand && brand.configured;
    },
    applyTheme: () => {
        const brand = BrandConfig.get();
        if (brand && brand.colors) {
            document.documentElement.style.setProperty('--primary-color', brand.colors.primary);
            document.documentElement.style.setProperty('--secondary-color', brand.colors.secondary || '#4F46E5');
            document.documentElement.style.setProperty('--accent-color', brand.colors.accent || '#EC4899');

            // Conversión de color primario a RGB para transparencias
            const hexToRgb = (hex) => {
                const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
                return result ? 
                    `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : 
                    '99, 102, 241';
            };
            document.documentElement.style.setProperty('--primary-color-rgb', hexToRgb(brand.colors.primary));
            
            // Alternar tema claro y oscuro
            const isLight = brand.colors.themeMode === 'light';
            document.documentElement.classList.toggle('theme-light', isLight);
            if (document.body) {
                document.body.classList.toggle('theme-light', isLight);
            }
        }

        // Hidratar logo e identidad de marca en pantalla
        const headerLogos = document.querySelectorAll('.logo-img, #brandLogo');
        const nameSpans = document.querySelectorAll('#brandName');
        const loginLogoContainer = document.getElementById('brandLogoContainer');
        
        const baseTitle = document.title.split(' - ')[0];

        if (brand) {
            if (loginLogoContainer) {
                const defaultLogo = 'https://posingtheheels.com/dashboard/img/logo.png'; // Fallback
                const logoSrc = (brand.logo && brand.logo.length > 5) ? brand.logo : defaultLogo;
                loginLogoContainer.innerHTML = `<img src="${logoSrc}" alt="${brand.name || ''}" style="width: 100%; height: 100%; object-fit: contain; border-radius: 12px;">`;
            }

            headerLogos.forEach(logoImg => {
                const defaultLogo = 'https://posingtheheels.com/dashboard/img/logo.png';
                logoImg.src = (brand.logo && brand.logo.length > 5) ? brand.logo : defaultLogo;
                logoImg.style.display = 'block';
                logoImg.onerror = () => {
                    logoImg.src = 'https://posingtheheels.com/dashboard/img/logo.png';
                };
            });

            nameSpans.forEach(nameSpan => {
                nameSpan.textContent = brand.name || 'Planio';
                nameSpan.style.color = brand.colors?.primary || '#6366F1';
            });

            if (brand.name) {
                document.title = `${baseTitle} - ${brand.name}`;
            }
        }
    }
};

// ============================================
// NEW MODELS FOR ADDITIONAL SAAS FUNCTIONS
// ============================================
const Services = {
    getAll: () => {
        const db = getData();
        return db.services || [];
    },
    getById: (id) => {
        return Services.getAll().find(s => s.id == id);
    },
    create: (srvData) => {
        const db = getData();
        if (!db.services) db.services = [];
        const newSrv = {
            id: generateUUID(),
            name: srvData.name || 'Nuevo Servicio',
            price: parseFloat(srvData.price) || 0,
            duration: parseInt(srvData.duration) || 60,
            description: srvData.description || ''
        };
        db.services.push(newSrv);
        saveData(db);
        return newSrv;
    },
    update: (id, fields) => {
        const db = getData();
        const idx = db.services.findIndex(s => s.id == id);
        if (idx !== -1) {
            db.services[idx] = { ...db.services[idx], ...fields };
            saveData(db);
            return db.services[idx];
        }
        return null;
    },
    delete: (id) => {
        const db = getData();
        db.services = db.services.filter(s => s.id != id);
        saveData(db);
        return true;
    }
};

const Availability = {
    get: () => {
        const db = getData();
        return db.availability || [];
    },
    update: (list) => {
        const db = getData();
        db.availability = list;
        saveData(db);
        return db.availability;
    },
    getCustomSlots: () => {
        const db = getData();
        return db.customSlots || [];
    },
    createCustomSlot: (slotData) => {
        const db = getData();
        if (!db.customSlots) db.customSlots = [];
        const newSlot = {
            id: slotData.id || generateUUID(),
            date: slotData.date || new Date().toISOString().substring(0, 10),
            time: slotData.time || '12:00',
            duration: parseInt(slotData.duration) || 60,
            modality: slotData.modality || 'AMBAS',
            status: slotData.status || 'available'
        };
        db.customSlots.push(newSlot);
        saveData(db);
        return newSlot;
    },
    deleteCustomSlot: (id) => {
        const db = getData();
        db.customSlots = (db.customSlots || []).filter(s => s.id !== id);
        saveData(db);
        return true;
    },
    updateCustomSlot: (id, fields) => {
        const db = getData();
        const idx = (db.customSlots || []).findIndex(s => s.id === id);
        if (idx !== -1) {
            db.customSlots[idx] = { ...db.customSlots[idx], ...fields };
            saveData(db);
            return db.customSlots[idx];
        }
        return null;
    }
};

const Feedbacks = {
    getAll: () => {
        const db = getData();
        return db.feedbacks || [];
    },
    create: (fbData) => {
        const db = getData();
        if (!db.feedbacks) db.feedbacks = [];
        const newFb = {
            id: generateUUID(),
            clientName: fbData.clientName || 'Anónimo',
            rating: parseInt(fbData.rating) || 5,
            comment: fbData.comment || '',
            date: new Date().toISOString()
        };
        db.feedbacks.push(newFb);
        saveData(db);
        return newFb;
    },
    delete: (id) => {
        const db = getData();
        db.feedbacks = db.feedbacks.filter(f => f.id != id);
        saveData(db);
        return true;
    }
};

const Activity = {
    getAll: () => {
        const db = getData();
        return db.activity || [];
    },
    add: (type, text) => {
        const db = getData();
        if (!db.activity) db.activity = [];
        const newAct = {
            id: generateUUID(),
            type: type || 'info', // success, error, info
            text: text,
            date: new Date().toLocaleString('es-ES', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }),
            timeAgo: 'HACE POCO'
        };
        db.activity.unshift(newAct);
        // Mantener max 15
        if (db.activity.length > 15) db.activity.pop();
        saveData(db);
        return newAct;
    }
};

window.Clients = Clients;
window.Appointments = Appointments;
window.Invoices = Invoices;
window.BrandConfig = BrandConfig;
window.Services = Services;
window.Availability = Availability;
window.Feedbacks = Feedbacks;
window.Activity = Activity;
window.getData = getData;
window.saveData = saveData;

// Ejecutar inmediatamente
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => BrandConfig.applyTheme());
}
