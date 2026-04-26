// ============================================
// FIREBASE SERVICE (Firestore Wrapper)
// ============================================
// Proporciona funciones para leer y escribir en la nube automáticamente.

const FirebaseService = {
  db: null,
  isReady: false,

  /**
   * Inicializa Firebase Firestore
   */
  async init() {
    if (typeof firebase === 'undefined') {
        console.warn("Firebase SDK no cargado aún.");
        return false;
    }
    
    try {
        if (!firebase.apps.length) {
            firebase.initializeApp(window.firebaseConfig);
        }
        this.db = firebase.firestore();
        this.isReady = true;
        console.log("Firebase Firestore listo ✅");
        return true;
    } catch (error) {
        console.error("Error al inicializar Firebase:", error);
        return false;
    }
  },

  /**
   * Obtiene datos de una colección específica
   */
  async getData(collectionName, documentId = null) {
    if (!this.isReady) await this.init();
    if (!this.db) return null;

    try {
        if (documentId) {
            const doc = await this.db.collection(collectionName).doc(documentId).get();
            return doc.exists ? doc.data() : null;
        } else {
            const snapshot = await this.db.collection(collectionName).get();
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        }
    } catch (error) {
        console.error(`Error obteniendo ${collectionName}:`, error);
        return null;
    }
  },

  /**
   * Guarda o actualiza un documento
   */
  async saveData(collectionName, documentId, data) {
    if (!this.isReady) await this.init();
    if (!this.db) return false;

    try {
        await this.db.collection(collectionName).doc(documentId).set({
            ...data,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
        return true;
    } catch (error) {
        console.error(`Error guardando ${collectionName}/${documentId}:`, error);
        return false;
    }
  },

  /**
   * Elimina un documento
   */
  async deleteData(collectionName, documentId) {
    if (!this.isReady) await this.init();
    if (!this.db) return false;

    try {
        await this.db.collection(collectionName).doc(documentId).delete();
        return true;
    } catch (error) {
        console.error(`Error eliminando ${collectionName}/${documentId}:`, error);
        return false;
    }
  },

  /**
   * Sube un archivo a Firebase Storage
   */
  async uploadFile(file, folderPath) {
    if (!this.isReady) await this.init();
    try {
        const fileName = file.name || `upload_${Date.now()}.jpg`;
        const storageRef = firebase.storage().ref();
        const fileRef = storageRef.child(`${folderPath}/${Date.now()}_${fileName}`);
        const snapshot = await fileRef.put(file);
        const downloadURL = await snapshot.ref.getDownloadURL();
        console.log("Archivo subido con éxito:", downloadURL);
        return downloadURL;
    } catch (error) {
        console.error("Error subiendo archivo a Firebase Storage:", error);
        return null;
    }
  }
};

// Exponer globalmente
window.FirebaseService = FirebaseService;
