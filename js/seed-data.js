
// Script de carga de alimentos - BASE DE DATOS FINAL (75+ Alimentos)
(function() {
    const foodGroups = [
        // PROTEINAS
        { name: "Pechuga de Pollo", calories: 165, protein: 31, carbs: 0, fat: 3.6 },
        { name: "Pavo (Solomillo/Pechuga)", calories: 105, protein: 24, carbs: 0, fat: 1 },
        { name: "Ternera Magra (Picada/Tiras)", calories: 170, protein: 26, carbs: 0, fat: 7 },
        { name: "Lomo de Cerdo (Cinta)", calories: 155, protein: 22, carbs: 0, fat: 7 },
        { name: "Cordero Magro", calories: 220, protein: 20, carbs: 0, fat: 15 },
        { name: "Conejo", calories: 133, protein: 21, carbs: 0, fat: 5 },
        { name: "Jamón Serrano (sin grasa)", calories: 210, protein: 30, carbs: 0.5, fat: 10 },
        { name: "Taquitos de Jamón Cocido", calories: 105, protein: 18, carbs: 1.5, fat: 3 },
        { name: "Salmón Fresco", calories: 208, protein: 20, carbs: 0, fat: 13 },
        { name: "Salmón Ahumado", calories: 184, protein: 22, carbs: 0.5, fat: 10 },
        { name: "Atún al Natural (Lata)", calories: 116, protein: 26, carbs: 0, fat: 1 },
        { name: "Atún Fresco", calories: 130, protein: 25, carbs: 0, fat: 3 },
        { name: "Merluza / Pescado Blanco", calories: 78, protein: 17, carbs: 0, fat: 0.8 },
        { name: "Bacalao (Fresco/Desmigado)", calories: 82, protein: 18, carbs: 0, fat: 0.7 },
        { name: "Sepia / Calamar", calories: 80, protein: 16, carbs: 1, fat: 1 },
        { name: "Gambas / Langostinos", calories: 95, protein: 20, carbs: 1, fat: 1 },
        { name: "Mejillones", calories: 86, protein: 12, carbs: 3, fat: 2 },
        { name: "Dorada / Trucha", calories: 120, protein: 19, carbs: 0, fat: 4.5 },
        { name: "Ventresca de Atún", calories: 210, protein: 24, carbs: 0, fat: 12 },
        { name: "Tofu Firme", calories: 83, protein: 10, carbs: 1, fat: 5 },
        { name: "Seitán", calories: 120, protein: 24, carbs: 4, fat: 2 },
        { name: "Edamame (sin vaina)", calories: 122, protein: 11, carbs: 10, fat: 5 },
        { name: "Proteína en Polvo (Media)", calories: 370, protein: 80, carbs: 6, fat: 3 },

        // HUEVOS Y LÁCTEOS
        { name: "Huevo Entero (1 ud L)", calories: 75, protein: 6.5, carbs: 0.5, fat: 5, type: 'unit' },
        { name: "Clara de Huevo (100ml)", calories: 50, protein: 11, carbs: 0.7, fat: 0.1 },
        { name: "Yogur Griego", calories: 115, protein: 9, carbs: 4, fat: 8 },
        { name: "Queso Fresco Batido 0%", calories: 46, protein: 8, carbs: 3.5, fat: 0.1 },
        { name: "Queso Cottage", calories: 98, protein: 11, carbs: 3.4, fat: 4.3 },
        { name: "Queso Skyr", calories: 63, protein: 11, carbs: 4, fat: 0.2 },
        { name: "Queso Requesón / Ricotta", calories: 170, protein: 11.5, carbs: 3, fat: 12 },
        { name: "Queso Feta", calories: 264, protein: 14, carbs: 4, fat: 21 },
        { name: "Queso Mozzarella", calories: 280, protein: 22, carbs: 2, fat: 20 },
        { name: "Queso Havarti / Curado", calories: 350, protein: 25, carbs: 1, fat: 28 },
        { name: "Queso Crema Light", calories: 150, protein: 8, carbs: 5, fat: 11 },
        { name: "Quesitos Light (1 ud)", calories: 35, protein: 2.5, carbs: 1, fat: 2, type: 'unit' },
        { name: "Leche Desnatada", calories: 35, protein: 3.4, carbs: 5, fat: 0.1 },
        { name: "Bebida de Soja / Almendras", calories: 35, protein: 3, carbs: 1, fat: 1.5 },
        { name: "Kéfir", calories: 60, protein: 3.5, carbs: 4, fat: 3.5 },

        // FRUTAS Y VERDURAS
        { name: "Plátano", calories: 89, protein: 1.1, carbs: 23, fat: 0.3 },
        { name: "Manzana / Pera", calories: 52, protein: 0.3, carbs: 14, fat: 0.2 },
        { name: "Frutos Rojos (Mix)", calories: 45, protein: 0.8, carbs: 10, fat: 0.4 },
        { name: "Mango / Papaya", calories: 60, protein: 0.7, carbs: 15, fat: 0.3 },
        { name: "Piña / Melocotón", calories: 50, protein: 0.5, carbs: 13, fat: 0.1 },
        { name: "Brócoli / Espinacas", calories: 30, protein: 2.8, carbs: 5, fat: 0.4 },
        { name: "Pimientos / Tomate", calories: 22, protein: 1, carbs: 4, fat: 0.2 },
        { name: "Berenjena / Calabacín", calories: 20, protein: 1.2, carbs: 3.5, fat: 0.2 },
        { name: "Champiñones / Setas", calories: 25, protein: 3, carbs: 3, fat: 0.3 },

        // GRASAS Y FRUTOS SECOS
        { name: "Aceite de Oliva / Coco", calories: 884, protein: 0, carbs: 0, fat: 100 },
        { name: "Aguacate", calories: 160, protein: 2, carbs: 9, fat: 15 },
        { name: "Crema de Cacahuete/Almendra", calories: 595, protein: 25, carbs: 12, fat: 50 },
        { name: "Nueces / Almendras / Pistachos", calories: 610, protein: 19, carbs: 14, fat: 52 },
        { name: "Anacardos / Avellanas", calories: 580, protein: 17, carbs: 22, fat: 48 },
        { name: "Semillas (Chía/Cáñamo/Lino)", calories: 520, protein: 20, carbs: 10, fat: 40 },
        { name: "Hummus", calories: 175, protein: 8, carbs: 14, fat: 10 },
        { name: "Tahini", calories: 595, protein: 17, carbs: 21, fat: 54 },
        { name: "Aceitunas (Verdes/Negras)", calories: 145, protein: 1, carbs: 3, fat: 15 },

        // CEREALES E HIDRATOS (Nuevos!)
        { name: "Avena (Copos/Harina)", calories: 380, protein: 13, carbs: 66, fat: 7 },
        { name: "Arroz (Integral/Jazmín/Basmati)", calories: 355, protein: 7, carbs: 78, fat: 0.7 },
        { name: "Pasta Integral / Espelta", calories: 350, protein: 12.5, carbs: 70, fat: 1.5 },
        { name: "Pasta de Lentejas", calories: 335, protein: 25, carbs: 50, fat: 2 },
        { name: "Quinoa (Cruda)", calories: 368, protein: 14, carbs: 64, fat: 6 },
        { name: "Cuscús Integral", calories: 345, protein: 12.8, carbs: 67, fat: 1.5 },
        { name: "Garbanzos / Lentejas (Cocidos)", calories: 140, protein: 8.5, carbs: 20, fat: 2 },
        { name: "Patata / Batata (Cruda)", calories: 80, protein: 2, carbs: 18, fat: 0.1 },
        { name: "Pan Integral / Centeno", calories: 240, protein: 8.5, carbs: 45, fat: 2.5 },
        { name: "Tortilla Trigo/Maíz (1 ud)", calories: 120, protein: 3.5, carbs: 20, fat: 2.5, type: 'unit' },
        { name: "Bagel Integral (1 ud)", calories: 245, protein: 10, carbs: 48, fat: 2, type: 'unit' },
        { name: "Arepa de Maíz (Masa)", calories: 165, protein: 3, carbs: 35, fat: 1 },
        { name: "Granola Casera", calories: 460, protein: 10, carbs: 60, fat: 20 },
        { name: "Dátiles (1 ud Medjool)", calories: 66, protein: 0.4, carbs: 16, fat: 0, type: 'unit' },
        { name: "Miel / Sirope Ágave (1 cda)", calories: 60, protein: 0, carbs: 15, fat: 0, type: 'unit' }
    ];

    function forceSeed() {
        const trainerId = window.activeTrainerId || localStorage.getItem('activeTrainerId') || 'default';
        const correctKey = 'fitnessAppData_' + trainerId;
        
        let correctRaw = localStorage.getItem(correctKey);
        let data = correctRaw ? JSON.parse(correctRaw) : { foods: [] };
        
        if (!data.foods) data.foods = [];
        
        let added = 0;
        let updated = 0;

        foodGroups.forEach(p => {
            const existingIndex = data.foods.findIndex(f => f.name === p.name);
            if (existingIndex === -1) {
                // Añadir nuevo
                data.foods.push({
                    id: 'seed_' + Math.random().toString(36).substr(2, 9),
                    ...p,
                    type: p.type || 'g',
                    createdAt: new Date().toISOString()
                });
                added++;
            } else {
                // Actualizar todo alimento de la lista seed
                const original = foodGroups.find(x => x.name === p.name);
                if (original) {
                    data.foods[existingIndex].carbs = original.carbs;
                    data.foods[existingIndex].protein = original.protein;
                    data.foods[existingIndex].fat = original.fat;
                    data.foods[existingIndex].calories = original.calories;
                    updated++;
                }
            }
        });

        if (added > 0 || updated > 0) {
            localStorage.setItem(correctKey, JSON.stringify(data));
            console.log("Sincronización FINAL: " + added + " nuevos, " + updated + " actualizados con éxito.");
            if (typeof window.loadFoods === 'function') window.loadFoods();
        }
    }

    forceSeed();
})();
