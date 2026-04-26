/**
 * Excel Management for Bulk Data Loading (Business Central Style) - v4
 */
console.log('excel-manager.js: v4 loaded.');

const ExcelManager = {
    // Tables to include in Export/Import
    tableNameMap: {
        'CLIENTES': 'clients',
        'RUTINAS': 'routines',
        'BLOQUES_ENTRENAMIENTO': 'trainingBlocks',
        'LOGS_ENTRENAMIENTO': 'trainingLogs',
        'DIETAS': 'diets',
        'FEEDBACKS': 'feedbacks',
        'HABITOS': 'habits',
        'CITAS': 'appointments',
        'BIBLIOTECA_MEDIA': 'media',
        'FACTURAS': 'invoices'
    },

    // Export all DB tables to a multi-sheet XLSX
    exportToExcel: function () {
        console.log('ExcelManager: Starting export...');
        try {
            if (typeof XLSX === 'undefined') {
                alert('Librería Excel (SheetJS) no detectada. Por favor, recarga la página o revisa tu conexión.');
                return;
            }

            // Ensure getData is available
            if (typeof getData !== 'function') {
                alert('Error: No se ha podido acceder a la base de datos (getData undefined).');
                return;
            }

            const data = getData(); 
            if (!data) {
                alert('No se han encontrado datos para exportar.');
                return;
            }

            const wb = XLSX.utils.book_new();

            for (let [sheetName, internalKey] of Object.entries(this.tableNameMap)) {
                console.log(`ExcelManager: Processing ${internalKey}...`);
                let tableData = data[internalKey] || [];
                
                // Safety check for non-array data
                if (!Array.isArray(tableData)) {
                    console.warn(`ExcelManager: ${internalKey} is not an array, skipping.`);
                    tableData = [];
                }

                // Flatten data for Excel
                const flatData = tableData.map(item => this.flattenObject(item));
                
                const ws = XLSX.utils.json_to_sheet(flatData);
                XLSX.utils.book_append_sheet(wb, ws, sheetName);
            }

            const fileName = `MAESTRO_DATOS_${new Date().toISOString().split('T')[0]}.xlsx`;
            console.log('ExcelManager: Generating file:', fileName);
            XLSX.writeFile(wb, fileName);
            
            if (typeof showToast === 'function') {
                showToast('Archivo Excel generado con éxito', 'success');
            } else {
                alert('Archivo Excel generado con éxito');
            }
        } catch (err) {
            console.error('ExcelManager Error:', err);
            alert('Error crítico al generar Excel: ' + err.message);
        }
    },

    // Import from XLSX file input
    importFromExcel: function (input) {
        if (!input.files || input.files.length === 0) return;
        const file = input.files[0];

        if (typeof XLSX === 'undefined') {
            alert('Librería Excel no cargada.');
            return;
        }

        const proceed = confirm('Esta acción reemplazará los datos actuales por los del Excel. ¿Deseas continuar?');
        if (!proceed) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const fullData = getData();

                // Process each sheet
                workbook.SheetNames.forEach(sheetName => {
                    const internalKey = this.tableNameMap[sheetName.toUpperCase()];
                    if (internalKey) {
                        const ws = workbook.Sheets[sheetName];
                        const jsonData = XLSX.utils.sheet_to_json(ws);
                        
                        // Unflatten rows back into nested objects
                        fullData[internalKey] = jsonData.map(row => this.unflattenObject(row));
                    }
                });

                saveData(fullData);
                alert('Importación masiva completada con éxito. La página se recargará.');
                window.location.reload();
            } catch (err) {
                console.error('Excel Import Error:', err);
                alert('Error al procesar el archivo Excel. Verifica el formato.');
            }
        };
        reader.readAsArrayBuffer(file);
    },

    // --- Private Helpers ---

    /**
     * Flattens a nested object into a single level
     */
    flattenObject: function (obj, prefix = '') {
        if (!obj || typeof obj !== 'object') return {};
        const flattened = {};
        const MAX_EXCEL_LEN = 32000;

        for (let key in obj) {
            if (!obj.hasOwnProperty(key)) continue;
            let val = obj[key];
            let cellValue = '';

            if (val && typeof val === 'object' && !Array.isArray(val)) {
                const sub = this.flattenObject(val, `${prefix}${key}_`);
                Object.assign(flattened, sub);
                continue;
            } else if (Array.isArray(val)) {
                cellValue = JSON.stringify(val);
            } else {
                cellValue = val;
            }

            if (typeof cellValue === 'string' && cellValue.length > MAX_EXCEL_LEN) {
                cellValue = cellValue.substring(0, MAX_EXCEL_LEN) + '... [TRUNCATED]';
            }

            flattened[`${prefix}${key}`] = cellValue;
        }
        return flattened;
    },

    /**
     * Unflattens a flat object back into nested objects
     */
    unflattenObject: function (obj) {
        if (!obj) return {};
        const result = {};
        for (let key in obj) {
            if (!obj.hasOwnProperty(key)) continue;
            const keys = key.split('_');
            keys.reduce((acc, part, i) => {
                if (i === keys.length - 1) {
                    let val = obj[key];
                    if (typeof val === 'string' && (val.startsWith('[') || val.startsWith('{'))) {
                        try {
                            acc[part] = JSON.parse(val);
                        } catch (e) {
                            acc[part] = val;
                        }
                    } else {
                        acc[part] = val;
                    }
                } else {
                    acc[part] = acc[part] || {};
                }
                return acc[part];
            }, result);
        }
        return result;
    }
};

// Global Exposure
window.ExcelManager = ExcelManager;
window.exportMasterExcel = function() { ExcelManager.exportToExcel(); };
window.handleExcelImport = function(event) { ExcelManager.importFromExcel(event.target); };

