/**
 * Google Drive Storage Manager
 * Uploads images directly to the user's Google Drive.
 * No external accounts needed, zero configuration for trainers.
 */

const DriveStorage = {
    folderId: null,

    /**
     * Finds or creates the "App Fitness Media" folder in Google Drive.
     */
    getOrCreateFolder: async function() {
        if (this.folderId) return this.folderId;
        
        // Check if already in BrandConfig
        const brand = BrandConfig.get() || {};
        if (brand.driveMediaFolderId) {
            this.folderId = brand.driveMediaFolderId;
            return this.folderId;
        }

        try {
            // Search for existing folder
            const response = await gapi.client.drive.files.list({
                q: "name = 'App Fitness Media' and mimeType = 'application/vnd.google-apps.folder' and trashed = false",
                fields: 'files(id, name)',
                spaces: 'drive'
            });

            if (response.result.files && response.result.files.length > 0) {
                this.folderId = response.result.files[0].id;
            } else {
                // Create new folder
                const createResponse = await gapi.client.drive.files.create({
                    resource: {
                        name: 'App Fitness Media',
                        mimeType: 'application/vnd.google-apps.folder'
                    },
                    fields: 'id'
                });
                this.folderId = createResponse.result.id;
            }

            // Save for later
            BrandConfig.set({ driveMediaFolderId: this.folderId });
            return this.folderId;
        } catch (error) {
            console.error('DriveStorage: Error obteniendo carpeta:', error);
            return null;
        }
    },

    /**
     * Upload an image to Google Drive
     * @param {File|String} fileData - The file object or base64 string
     * @param {String} fileName - Desired filename
     * @returns {Promise<String>} - The public-ish URL of the uploaded image
     */
    upload: async function(fileData, fileName = 'upload.jpg') {
        try {
            if (typeof gapi === 'undefined' || !gapi.client || !gapi.client.drive) {
                console.warn('DriveStorage: GAPI no inicializada');
                return null;
            }

            const folderId = await this.getOrCreateFolder();
            if (!folderId) throw new Error('No se pudo determinar la carpeta de destino');

            // Convert file to Base64 if it's a File object (needed for multi-part upload in JS client)
            let base64Data = '';
            let contentType = 'image/jpeg';

            if (fileData instanceof File) {
                base64Data = await this.fileToBase64(fileData);
                contentType = fileData.type;
            } else if (typeof fileData === 'string' && fileData.startsWith('data:')) {
                base64Data = fileData.split(',')[1];
                contentType = fileData.split(';')[0].split(':')[1];
            } else {
                return null; 
            }

            const metadata = {
                name: fileName,
                mimeType: contentType,
                parents: [folderId]
            };

            const boundary = 'foo_bar_baz';
            const delimiter = "\r\n--" + boundary + "\r\n";
            const close_delim = "\r\n--" + boundary + "--";

            const multipartRequestBody =
                delimiter +
                'Content-Type: application/json\r\n\r\n' +
                JSON.stringify(metadata) +
                delimiter +
                'Content-Type: ' + contentType + '\r\n' +
                'Content-Transfer-Encoding: base64\r\n' +
                '\r\n' +
                base64Data +
                close_delim;

            const response = await gapi.client.request({
                'path': '/upload/drive/v3/files',
                'method': 'POST',
                'params': { 'uploadType': 'multipart' },
                'headers': {
                    'Content-Type': 'multipart/related; boundary="' + boundary + '"'
                },
                'body': multipartRequestBody
            });

            const fileId = response.result.id;

            // Set permissions to "Anyone with link" so it can be viewed by clients
            await gapi.client.drive.permissions.create({
                fileId: fileId,
                resource: {
                    role: 'reader',
                    type: 'anyone'
                }
            });

            // Return the optimized high-speed link for Google Drive images
            return `https://lh3.googleusercontent.com/d/${fileId}`;

        } catch (err) {
            console.error('DriveStorage Upload Error:', err);
            return null;
        }
    },

    fileToBase64: function(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result.split(',')[1]);
            reader.onerror = error => reject(error);
        });
    }
};

window.DriveStorage = DriveStorage;
// Fallback for existing code using "ImageKitManager"
window.ImageKitManager = DriveStorage;
