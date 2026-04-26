// ============================================
// FIREBASE CONFIGURATION (Connected)
// ============================================

const firebaseConfig = {
  apiKey: "AIzaSyBR0e-S-Uq2YXtBtku7OZ6dgL6reD6SQec",
  authDomain: "fitnessappsaas-62c8c.firebaseapp.com",
  projectId: "fitnessappsaas-62c8c",
  storageBucket: "fitnessappsaas-62c8c.firebasestorage.app",
  messagingSenderId: "122973154710",
  appId: "1:122973154710:web:72c09dc147b433b25ac1b7",
  measurementId: "G-DCJ274Y1J6"
};

// Exportar para que otros scripts lo usen
if (typeof module !== 'undefined' && module.exports) {
    module.exports = firebaseConfig;
} else {
    window.firebaseConfig = firebaseConfig;
}
