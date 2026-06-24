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
            if (!window.FirebaseService) {
                console.error("FirebaseService not found");
                return null;
            }

            let fileToUpload = fileData;

            // If it's a base64 string, convert to Blob/File if Firebase needs it
            // Firebase .put() accepts File, Blob, or Uint8Array
            if (typeof fileData === 'string' && fileData.startsWith('data:')) {
                const response = await fetch(fileData);
                fileToUpload = await response.blob();
            }

            const downloadURL = await window.FirebaseService.uploadFile(fileToUpload, 'media');
            return downloadURL;

        } catch (err) {
            console.error('CloudStorage Upload Error (Firebase):', err);
            if (typeof showToast === 'function') showToast('Error al subir a Firebase Storage', 'error');
            return null;
        }
    }
};

window.CloudStorage = CloudStorage;
window.DriveStorage = CloudStorage;
window.ImageKitManager = CloudStorage;
