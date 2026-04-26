const SHEETS = {
    // Función central para leer cualquier hoja
    getRange: async (range) => {
        try {
            const response = await gapi.client.sheets.spreadsheets.values.get({
                spreadsheetId: CONFIG.google.spreadsheetId,
                range: range, // ej: 'Clientes!A2:E'
            });
            return response.result.values || [];
        } catch (error) {
            console.error('Error al leer de Sheets:', error);
            return [];
        }
    },

    // Función para añadir una nueva fila (Nuevo Cliente, Nueva Dieta...)
    appendRow: async (range, values) => {
        try {
            const response = await gapi.client.sheets.spreadsheets.values.append({
                spreadsheetId: CONFIG.google.spreadsheetId,
                range: range,
                valueInputOption: 'USER_ENTERED',
                resource: {
                    values: [values],
                },
            });
            return response.result;
        } catch (error) {
            console.error('Error al escribir en Sheets:', error);
            throw error;
        }
    },

    // Función para actualizar una fila específica
    updateRow: async (range, values) => {
        try {
            const response = await gapi.client.sheets.spreadsheets.values.update({
                spreadsheetId: CONFIG.google.spreadsheetId,
                range: range, // ej: 'Clientes!A5:E5'
                valueInputOption: 'USER_ENTERED',
                resource: {
                    values: [values],
                },
            });
            return response.result;
        } catch (error) {
            console.error('Error al actualizar en Sheets:', error);
            throw error;
        }
    },

    // Buscar el ID o Código en una hoja y devolver el número de fila (para saber qué fila actualizar)
    findRowIndex: async (sheetName, searchString, columnIdx = 0) => {
        const rows = await SHEETS.getRange(`${sheetName}!A:Z`);
        for (let i = 0; i < rows.length; i++) {
            if (rows[i][columnIdx] === searchString) {
                return i + 1; // Las celdas de Sheets son 1-indexed
            }
        }
        return -1; // No encontrado
    }
};
