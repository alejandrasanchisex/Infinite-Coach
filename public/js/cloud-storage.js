/**
 * Cloud Storage Manager (Firebase Storage Implementation)
 * Migrated from Google Drive to solve permission issues and centralization.
 */

const CloudStorage = {
    /**
     * No longer needs explicit folder creation in Firebase.
     */
    init: async function() {
        if (window.FirebaseService) {
            await window.FirebaseService.init();
        }
        return true;
    },

    uploadMedia: async function(file) {
        return this.upload(file, file.name);
    },

    /**
     * Uploads a file to Supabase Storage (MANDATORY)
     */
    upload: async function(fileData, fileName = 'upload.jpg') {
        try {
            // ÚNICA OPCIÓN: Supabase (Firebase ha sido eliminado de este flujo)
            if (window.SupabaseService) {
                let fileToUpload = fileData;

                // Si es un base64, convertir a Blob
                if (typeof fileData === 'string' && fileData.startsWith('data:')) {
                    const response = await fetch(fileData);
                    fileToUpload = await response.blob();
                }

                const publicUrl = await window.SupabaseService.uploadFile(fileToUpload, 'Media');
                if (publicUrl) {
                    console.log("Subida a Supabase exitosa ✅:", publicUrl);
                    return publicUrl;
                }
                throw new Error("El servicio de almacenamiento no devolvió una URL válida.");
            }
            throw new Error("SupabaseService no está disponible.");
        } catch (err) {
            console.error('CloudStorage Upload Error:', err);
            if (typeof showToast === 'function') showToast('Error crítico al subir a Supabase', 'error');
            throw err;
        }
    }
};

window.CloudStorage = CloudStorage;
window.DriveStorage = CloudStorage;
window.ImageKitManager = CloudStorage;
