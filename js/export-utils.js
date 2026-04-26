// Export Utilities using jsPDF and SheetJS (XLSX)

// Helper to get brand config and colors
const getBrandSettings = () => {
    const brand = (typeof BrandConfig !== 'undefined' && BrandConfig.get()) ? BrandConfig.get() : {};
    const pdfSettings = brand.pdfSettings || { showCalories: true, showMacros: true };

    // Default blue if not configured
    const primaryHex = (brand.colors && brand.colors.primary) ? brand.colors.primary : '#00D9FF';

    // Convert Hex to RGB [r, g, b]
    let r = 0, g = 0, b = 0;
    if (primaryHex.startsWith('#')) {
        const hex = primaryHex.replace('#', '');
        if (hex.length === 3) {
            r = parseInt(hex[0] + hex[0], 16);
            g = parseInt(hex[1] + hex[1], 16);
            b = parseInt(hex[2] + hex[2], 16);
        } else if (hex.length === 6) {
            r = parseInt(hex.substring(0, 2), 16);
            g = parseInt(hex.substring(2, 4), 16);
            b = parseInt(hex.substring(4, 6), 16);
        }
    }

    return { brand, pdfSettings, primaryColor: [r, g, b] };
};

window.exportDietToPDF = function (diet, clientName) {
    if (!window.jspdf) {
        alert('Librería PDF no cargada. Por favor recarga la página.');
        return;
    }
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const { brand, pdfSettings, primaryColor } = getBrandSettings();

    // -- HEADER --
    let yPos = 20;

    // Logo
    if (brand.logo) {
        try {
            // Add logo at top right
            const imgProps = doc.getImageProperties(brand.logo);
            const ratio = imgProps.width / imgProps.height;
            const width = 40;
            const height = width / ratio;
            doc.addImage(brand.logo, 'PNG', 150, 10, width, height);
        } catch (e) {
            console.warn('Error adding logo to PDF', e);
        }
    }

    doc.setFontSize(22);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text(`Plan Nutricional: ${diet.name}`, 14, yPos);
    yPos += 10;

    doc.setFontSize(12);
    doc.setTextColor(40, 40, 40);
    // Removed "Cliente:" header
    yPos += 2;

    // General Summary controlled by settings
    if (pdfSettings.showCalories) {
        doc.text(`Objetivo Calórico: ${diet.calories} kcal`, 14, yPos);
        yPos += 6;
    }

    if (pdfSettings.showMacros) {
        const macros = diet.macros || { protein: 0, carbs: 0, fat: 0 };
        doc.text(`Objetivos Macros: Prot: ${macros.protein}g | Carbs: ${macros.carbs}g | Grasas: ${macros.fat}g`, 14, yPos);
        yPos += 6;
    }

    const desc = diet.description || '';
    if (desc && !desc.startsWith('Creada para ')) {
        yPos += 4;
        doc.setFontSize(10);
        doc.setTextColor(100);
        const splitDesc = doc.splitTextToSize(desc, 130);
        doc.text(splitDesc, 14, yPos);
        yPos += (splitDesc.length * 5) + 5;
    } else {
        yPos += 10;
    }

    // -- MEALS --
    (diet.meals || []).forEach((meal, idx) => {
        // Only sum Option 1 for the Header Summary
        const option1Foods = (meal.foods || []).filter(f => !f.option || f.option === 1);
        const mealCals = option1Foods.reduce((acc, f) => acc + (parseInt(f.calories) || 0), 0);

        // Group foods by option
        const options = {};
        (meal.foods || []).forEach(f => {
            const opt = f.option || 1;
            if (!options[opt]) options[opt] = [];
            options[opt].push(f);
        });
        const optionKeys = Object.keys(options).map(Number).sort((a, b) => a - b);

        // Meal Header Box
        doc.setFontSize(14);
        doc.setFillColor(245, 245, 245);
        doc.rect(14, yPos, 182, 10, 'F');

        doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);

        let headerText = meal.name;
        if (pdfSettings.showCalories) {
            headerText += ` (${mealCals} kcal)`;
        }

        doc.text(headerText, 16, yPos + 7);
        yPos += 18;

        if (optionKeys.length === 0) {
            doc.setFontSize(10);
            doc.setTextColor(150);
            doc.text('No hay alimentos añadidos.', 14, yPos);
            yPos += 10;
        } else {
            // Layout configuration
            const isMultiColumn = optionKeys.length > 1;
            const colGap = 10;
            const pageWidth = 182; // 210 (A4) - 14 (left) - 14 (right)
            const colWidth = isMultiColumn ? (pageWidth - colGap) / 2 : pageWidth;

            let currentRowMaxY = yPos;
            let startOfRowY = yPos;

            optionKeys.forEach((optNum, index) => {
                const foods = options[optNum];
                const isRightCol = isMultiColumn && (index % 2 !== 0);

                // If starting a new row (left column), check for page break and update Y
                if (!isRightCol) {
                    if (index > 0) {
                        // Move down to the max Y of the previous row
                        yPos = currentRowMaxY + 8;
                    }
                    startOfRowY = yPos;
                    currentRowMaxY = startOfRowY; // Reset max Y for this new row

                    // Check page break logic for the new row
                    if (startOfRowY > 250) {
                        doc.addPage();
                        yPos = 20;
                        startOfRowY = 20;
                        currentRowMaxY = 20;
                    }
                }

                // Determine X and Y for this option
                const currentX = isRightCol ? (14 + colWidth + colGap) : 14;
                let currentY = startOfRowY;

                // Option Sub-header
                if (optionKeys.length > 1) {
                    doc.setFontSize(10);
                    doc.setTextColor(80, 80, 80);
                    doc.setFont(undefined, 'bold');

                    const optCals = foods.reduce((acc, f) => acc + (parseInt(f.calories) || 0), 0);
                    let optText = `Opción ${optNum}`;
                    if (pdfSettings.showCalories) optText += ` - Total: ${optCals} kcal`;

                    doc.text(optText, currentX, currentY);
                    doc.setFont(undefined, 'normal');
                    currentY += 5;
                }

                const tableBody = foods.map(f => {
                    const row = [f.name, f.quantity];
                    if (pdfSettings.showCalories) row.push(f.calories);
                    return row;
                });

                const tableHead = [['Alimento', 'Cant. (gr/ud)']];
                if (pdfSettings.showCalories) tableHead[0].push('Kcal');

                doc.autoTable({
                    head: tableHead,
                    body: tableBody,
                    startY: currentY,
                    theme: 'grid',
                    styles: { fontSize: 10, cellPadding: 3 },
                    headStyles: {
                        fillColor: primaryColor,
                        textColor: 255,
                        fontStyle: 'bold'
                    },
                    columnStyles: {
                        0: { cellWidth: 'auto' },
                        1: { cellWidth: 30 },
                    },
                    margin: { left: currentX },
                    tableWidth: colWidth
                });

                // Update row max height
                const tableEnd = doc.lastAutoTable.finalY;
                if (tableEnd > currentRowMaxY) {
                    currentRowMaxY = tableEnd;
                }
            });

            // Final update of yPos for the NEXT meal component
            yPos = currentRowMaxY + 10;
        }

        // Page break check
        if (yPos > 260) {
            doc.addPage();
            yPos = 20;
        }
    });

    // FOOTER
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(`Generado por ${brand.name || 'App Fitness'} - Página ${i} de ${pageCount}`, 14, 285);
    }

    doc.save(`Dieta_${clientName || 'Cliente'}_${new Date().toISOString().slice(0, 10)}.pdf`);
};

// Legacy Excel export (Removed from UI but kept for API compatibility if needed)
window.exportDietToExcel = function (diet, clientName) {
    if (!window.XLSX) {
        alert('Librería Excel no cargada.');
        return;
    }
    const { brand, pdfSettings } = getBrandSettings();

    // Flatten data
    const rows = [];
    rows.push(['PLAN NUTRICIONAL', diet.name]);
    rows.push(['Cliente', clientName]);

    if (pdfSettings.showCalories) rows.push(['Calorías Totales', diet.calories]);

    if (pdfSettings.showMacros) {
        rows.push(['Macros Objetivo', `P: ${diet.macros?.protein}g, C: ${diet.macros?.carbs}g, F: ${diet.macros?.fat}g`]);
    }

    rows.push([]); // Spacer

    (diet.meals || []).forEach(meal => {
        const mealCals = (meal.foods || []).reduce((acc, f) => acc + (parseInt(f.calories) || 0), 0);

        let mealHeader = meal.name.toUpperCase();
        if (pdfSettings.showCalories) mealHeader += ` (${mealCals} kcal)`;

        rows.push([mealHeader]);

        const headerRow = ['Alimento', 'Cantidad'];
        if (pdfSettings.showCalories) headerRow.push('Kcal');
        rows.push(headerRow);

        (meal.foods || []).forEach(f => {
            const row = [f.name, f.quantity];
            if (pdfSettings.showCalories) row.push(f.calories);
            rows.push(row);
        });
        rows.push([]); // Spacer
    });

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(rows);
    XLSX.utils.book_append_sheet(wb, ws, "Dieta");
    XLSX.writeFile(wb, `Dieta_${clientName}_${new Date().toISOString().slice(0, 10)}.xlsx`);
};

window.exportRoutineToPDF = function (routine, clientName) {
    if (!window.jspdf) {
        alert('Librería PDF no cargada.');
        return;
    }
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const { brand, primaryColor } = getBrandSettings();

    let yPos = 20;

    // Logo
    if (brand.logo) {
        try {
            const imgProps = doc.getImageProperties(brand.logo);
            const ratio = imgProps.width / imgProps.height;
            const width = 40;
            const height = width / ratio;
            doc.addImage(brand.logo, 'PNG', 150, 10, width, height);
        } catch (e) { }
    }

    doc.setFontSize(22);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text(`Rutina: ${routine.name}`, 14, yPos);
    yPos += 10;

    doc.setFontSize(12);
    doc.setTextColor(40, 40, 40);
    // Removed "Cliente:" header
    yPos += 2;

    if (routine.description) {
        doc.setFontSize(10);
        doc.setTextColor(100);
        const splitDesc = doc.splitTextToSize(routine.description || '', 130);
        doc.text(splitDesc, 14, yPos);
        yPos += (splitDesc.length * 5) + 5;
    } else {
        yPos += 10;
    }

    (routine.days || []).forEach(day => {
        doc.setFontSize(14);
        doc.setFillColor(245, 245, 245);
        doc.rect(14, yPos, 182, 10, 'F');
        doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.text(day.name, 16, yPos + 7);
        yPos += 12;

        const tableData = (day.exercises || []).map(ex => [
            ex.name + (ex.notes ? (`\n💬 ${ex.notes}`) : ''),
            ex.sets || '-',
            ex.reps || '-',
            ex.intensity || '-'
        ]);

        if (tableData.length > 0) {
            doc.autoTable({
                head: [['Ejercicio', 'Series', 'Reps', 'RIR']],
                body: tableData,
                startY: yPos,
                theme: 'grid',
                styles: { fontSize: 10, cellPadding: 3 },
                headStyles: {
                    fillColor: primaryColor,
                    textColor: 255,
                    fontStyle: 'bold'
                },
                margin: { left: 14 }
            });
            yPos = doc.lastAutoTable.finalY + 10;
        } else {
            doc.setFontSize(10);
            doc.setTextColor(150);
            doc.text('Sin ejercicios configurados', 14, yPos);
            yPos += 10;
        }

        if (yPos > 260) {
            doc.addPage();
            yPos = 20;
        }
    });

    // FOOTER
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(`Generado por ${brand.name || 'App Fitness'} - Página ${i} de ${pageCount}`, 14, 285);
    }

    doc.save(`Rutina_${clientName}_${new Date().toISOString().slice(0, 10)}.pdf`);
};

window.exportRoutineToExcel = function (routine, clientName) {
    if (!window.XLSX) {
        alert('Librería Excel no cargada.');
        return;
    }

    const rows = [];
    rows.push(['RUTINA DE ENTRENAMIENTO', routine.name]);
    rows.push(['Cliente', clientName]);
    rows.push([]);

    (routine.days || []).forEach(day => {
        rows.push([day.name.toUpperCase()]);
        rows.push(['Ejercicio', 'Series', 'Reps', 'RIR', 'Link Video']);

        (day.exercises || []).forEach(ex => {
            rows.push([ex.name + (ex.notes ? ` (${ex.notes})` : ''), ex.sets, ex.reps, ex.intensity, ex.videoUrl || '']);
        });
        rows.push([]);
    });

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(rows);
    XLSX.utils.book_append_sheet(wb, ws, "Rutina");
    XLSX.writeFile(wb, `Rutina_${clientName}_${new Date().toISOString().slice(0, 10)}.xlsx`);
};
