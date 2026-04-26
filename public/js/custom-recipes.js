/**
 * PARCHE v92 - AJUSTE PROTOCOLO MÁRMOL
 * Sustitución de activos con distracciones por versiones Pure Minimalist 90º.
 */
(function() {
    const PRO_RECIPES = [
        // --- DESAYUNOS & SNACKS ---
        { id: 'prof-rec-salmon-v3', title: 'Tostada de Salmón', category: 'recipe', ingredients: 'Pan integral, Salmón ahumado, Aguacate', tags: 'Desayuno', url: 'img/salmon.png' },
        { id: 'prof-rec-medit-v3', title: 'Tostada Mediterránea Fit', category: 'recipe', ingredients: 'Pan integral, Huevo poché, Aceite', tags: 'Desayuno', url: 'img/mediterranea.png' },
        { id: 'prof-rec-tropical-v4', title: 'Bowl Tropical Premium', category: 'recipe', ingredients: 'Kéfir, Mango fresco, Coco rallado', tags: 'Desayuno', url: 'img/tropical.png' },
        { id: 'prof-rec-skyr-v4', title: 'Bowl de Skyr y Melocotón', category: 'recipe', ingredients: 'Skyr, Melocotón, Anacardos', tags: 'Merienda', url: 'img/skyr.png' },
        { id: 'prof-rec-gofre-v1', title: 'Gofre de Avena', category: 'recipe', ingredients: 'Harina de avena, Clara de huevo, Aceite coco', tags: 'Desayuno', url: 'img/gofre.png' },
        { id: 'prof-rec-smoothie-v1', title: 'Smoothie Chocolate-Avellana', category: 'recipe', ingredients: 'Bebida avellanas, Proteína chocolate, Plátano', tags: 'Merienda', url: 'img/smoothie.png' },
        { id: 'prof-rec-chia-v2', title: 'Chia Pudding con Fruta', category: 'recipe', ingredients: 'Semillas de chía, Leche desnatada, Fresas, Kiwi', tags: 'Desayuno', url: 'img/chia.png' },
        { id: 'prof-rec-pudding-v2', title: 'Pudding de Proteína Gourmet', category: 'recipe', ingredients: 'Caseína, Leche de soja, Arándanos', tags: 'Merienda', url: 'img/pudding-proteina-pro.png' },
        { id: 'prof-rec-pancakes-v4', title: 'Pancakes de Requesón', category: 'recipe', ingredients: 'Claras de huevo, Requesón, Harina avena, Nueces', tags: 'Desayuno', url: 'img/pancakes-requeson-pro.png' },
        { id: 'prof-rec-fruta-queso-pro', title: 'Queso con Fruta', category: 'recipe', ingredients: 'Manzana o pera, queso fresco tipo Burgos', tags: 'Merienda', url: 'img/fruta-queso-pro.png' },
        { id: 'prof-rec-gachas-quinoa-pro', title: 'Gachas de Quinoa', category: 'recipe', ingredients: 'Quinoa cocida, leche de almendras, canela', tags: 'Desayuno', url: 'img/gachas-quinoa-pro.png' },
        { id: 'prof-rec-rollitos-jamon-pro', title: 'Rollitos de Jamón y Nueces', category: 'recipe', ingredients: 'Jamón serrano sin grasa, palitos integrales, nueces', tags: 'Merienda', url: 'img/rollitos-jamon-pro.png' },
        { id: 'prof-rec-skillet-patata-pro', title: 'Skillet de Patata y Huevo', category: 'recipe', ingredients: 'Patata picada, claras y huevo entero, pimientos', tags: 'Desayuno', url: 'img/skillet-patata-pro.png' },
        { id: 'prof-rec-tortitas-avena-pro', title: 'Tortitas de Avena y Plátano', category: 'recipe', ingredients: 'Plátano, huevos, almendra molida', tags: 'Desayuno', url: 'img/tortitas-avena-pro.png' },
        { id: 'prof-rec-wrap-almendras-pro', title: 'Wrap de Crema de Almendras', category: 'recipe', ingredients: 'Tortilla integral, crema de almendras, fresas, proteína', tags: 'Desayuno', url: 'img/wrap-almendras-pro.png' },

        // --- COMIDAS & CENAS ---
        { id: 'prof-rec-falafel-v4', title: 'Bowl de Falafel Gourmet', category: 'recipe', ingredients: 'Falafel horneado, Hummus, Ensalada', tags: 'Comida', url: 'img/falafel.png' },
        { id: 'prof-rec-bacalao-v4', title: 'Revuelto de Bacalao Élite', category: 'recipe', ingredients: 'Bacalao desmigado, Huevo, Pan tostado', tags: 'Cena', url: 'img/bacalao.png' },
        { id: 'prof-rec-burrito-v4', title: 'Burrito Bowl Saludable', category: 'recipe', ingredients: 'Arroz basmati, Carne magra, Frijoles', tags: 'Comida', url: 'img/burrito.png' },
        { id: 'prof-rec-pollo-hierbas', title: 'Pollo al Horno con Hierbas', category: 'recipe', type: 'image', isSystem: true, ingredients: 'Pollo troceado, Patatas, Romero, Ajo', tags: 'Cena', url: 'img/pollo_hierbas.png' },
        { id: 'prof-rec-albondigas-pollo-pro', title: 'Albóndigas de Pollo', category: 'recipe', ingredients: 'Pechuga picada, tomate natural, pasta integral', tags: 'Comida', url: 'img/albondigas-pollo-pro.png' },
        { id: 'prof-rec-ensalada-garbanzos-pro', title: 'Ensalada de Garbanzos', category: 'recipe', ingredients: 'Garbanzos, atún, aceitunas', tags: 'Comida', url: 'img/ensalada-garbanzos-pro.png' },
        { id: 'prof-rec-fajitas-pavo-pro', title: 'Fajitas de Pavo', category: 'recipe', ingredients: 'Tortillas, tiras de pavo, pimiento, cebolla', tags: 'Cena', url: 'img/fajitas-pavo-pro.png' },
        { id: 'prof-rec-guiso-pavo-pro', title: 'Guiso de Pavo', category: 'recipe', ingredients: 'Pavo, champiñones, zanahoria, vino blanco', tags: 'Comida', url: 'img/guiso-pavo-pro.png' },
        { id: 'prof-rec-lasagna-calabacin-pro', title: 'Lasaña de Calabacín', category: 'recipe', ingredients: 'Láminas de calabacín, carne picada magra, queso light', tags: 'Cena', url: 'img/lasagna-calabacin-pro.png' },
        { id: 'prof-rec-lentejas-arroz-pro', title: 'Lentejas con Arroz', category: 'recipe', ingredients: 'Lentejas, arroz integral, aceite de oliva', tags: 'Comida', url: 'img/lentejas-arroz-pro.png' },
        { id: 'prof-rec-merluza-patatas-pro', title: 'Merluza al Horno', category: 'recipe', ingredients: 'Merluza, patatas panadera, aceite de oliva', tags: 'Cena', url: 'img/merluza-patatas-pro.png' },
        { id: 'prof-rec-merluza-plancha-pro', title: 'Merluza a la Plancha', category: 'recipe', ingredients: 'Merluza, lechuga, tomate, aceite de oliva', tags: 'Cena', url: 'img/merluza-plancha-pro.png' },
        { id: 'prof-rec-pavo-pro', title: 'Solomillo de Pavo', category: 'recipe', ingredients: 'Solomillo de pavo, arroz jazmín, almendras', tags: 'Comida', url: 'img/pavo-pro.png' },
        { id: 'prof-rec-pescado-blanco-pro', title: 'Pescado Blanco con Puré', category: 'recipe', ingredients: 'Merluza, puré de guisantes, patata', tags: 'Cena', url: 'img/pescado-blanco-pro.png' },
        { id: 'prof-rec-pollo-curry-pro', title: 'Pollo al Curry', category: 'recipe', ingredients: 'Pollo, curry, leche de coco, arroz integral', tags: 'Comida', url: 'img/pollo-curry-pro.png' },
        { id: 'prof-rec-pollo-limon-cuscus-pro', title: 'Pollo al Limón con Cuscús', category: 'recipe', ingredients: 'Pollo, zumo de limón, cuscús integral', tags: 'Comida', url: 'img/pollo-limon-cuscus-pro.png' },
        { id: 'prof-rec-salmon-papillote-pro', title: 'Salmón en Papillote', category: 'recipe', type: 'image', isSystem: true, ingredients: 'Salmón, verduras variadas, patata tierna', tags: 'Cena', url: 'img/salmon_papillote.png' },
        { id: 'prof-rec-secreto-cerdo-pro', title: 'Secreto de Cerdo Magro', category: 'recipe', ingredients: 'Secreto de cerdo, piña a la brasa, ensalada', tags: 'Cena', url: 'img/secreto-cerdo-pro.png' },
        { id: 'prof-rec-sushi-fit-pro', title: 'Sushi Casero Fit', category: 'recipe', ingredients: 'Arroz, alga nori, salmón, pepino', tags: 'Cena', url: 'img/sushi-fit-pro.png' },
        { id: 'prof-rec-tofu-verduras-pro', title: 'Tofu con Verduras', category: 'recipe', type: 'image', isSystem: true, ingredients: 'Tofu firme, zanahoria, pimiento, jengibre', tags: 'Cena', url: 'img/tofu_verduras.png' },
        { id: 'prof-rec-tortilla-gambas-pro', title: 'Tortilla de Gambas', category: 'recipe', ingredients: 'Claras de huevo, gambas, ajetes tiernos', tags: 'Cena', url: 'img/tortilla-gambas-pro.png' },
        { id: 'prof-rec-tortilla-patata-pro', title: 'Tortilla de Patatas', category: 'recipe', ingredients: 'Huevos, patatas asadas, cebolla', tags: 'Comida', url: 'img/tortilla-patata-pro.png' },
        { id: 'prof-rec-wok-pollo-pro', title: 'Wok de Pollo y Fideos', category: 'recipe', ingredients: 'Pollo, fideos de arroz, brócoli, cacahuetes', tags: 'Comida', url: 'img/wok-pollo-pro.png' },
        { id: 'prof-rec-hamburguesa-lentejas-pro', title: 'Hamburguesas de Lentejas', category: 'recipe', type: 'image', isSystem: true, ingredients: 'Lentejas, pan integral, hojas verdes', tags: 'Comida', url: 'img/hamburguesa_lentejas_pro.png' },
        { id: 'prof-rec-ratatouille-pro', title: 'Ratatouille con Huevo', category: 'recipe', ingredients: 'Calabacín, berenjena, tomate, huevo', tags: 'Cena', url: 'img/ratatouille.png' },
        { id: 'prof-rec-avena-nocturna', title: 'Avena Nocturna con Cacao', category: 'recipe', type: 'image', isSystem: true, ingredients: 'Avena, Leche, Cacao puro, Avellanas', tags: 'Desayuno', url: 'img/avena_nocturna.png' },
        { id: 'prof-rec-yogur-frutos', title: 'Yogur con Frutos Secos', category: 'recipe', type: 'image', isSystem: true, ingredients: 'Yogur natural 0%, nueces, almendras, semillas', tags: 'Merienda', url: 'img/yogur_frutos_secos.png' },
        { id: 'prof-rec-crema-calabaza', title: 'Crema de Calabaza con Huevo', category: 'recipe', type: 'image', isSystem: true, ingredients: 'Calabaza, cebolla, huevo poché', tags: 'Cena', url: 'img/crema_calabaza.png' },
        { id: 'prof-rec-pollo-thai', title: 'Pollo Thai con Coco', category: 'recipe', type: 'image', isSystem: true, ingredients: 'Pollo, leche de coco light, arroz basmati', tags: 'Comida', url: 'img/pollo_thai_coco.png' },
        { id: 'prof-rec-ensalada-lentejas', title: 'Ensalada de Pasta de Lentejas', category: 'recipe', type: 'image', isSystem: true, ingredients: 'Pasta de lentejas, cherries, pesto', tags: 'Comida', url: 'img/ensalada_pasta_lentejas.png' },
        { id: 'prof-rec-ternera-brocoli', title: 'Ternera con Brócoli', category: 'recipe', type: 'image', isSystem: true, ingredients: 'Tiras de ternera, brócoli, salsa de soja', tags: 'Comida', url: 'img/ternera_brocoli.png' },
        { id: 'prof-rec-bacalao-horno', title: 'Bacalao al Horno con Verduras', category: 'recipe', type: 'image', isSystem: true, ingredients: 'Bacalao, calabacín, cebolla, pimientos', tags: 'Cena', url: 'img/bacalao_horno.png' },
        { id: 'prof-rec-canelones', title: 'Canelones de Espinacas', category: 'recipe', type: 'image', isSystem: true, ingredients: 'Placas de pasta, espinacas, queso ricotta', tags: 'Comida', url: 'img/canelones.png' },
        { id: 'prof-rec-pavo-esparragos', title: 'Pavo con Espárragos', category: 'recipe', type: 'image', isSystem: true, ingredients: 'Pechuga de pavo, espárragos trigueros, quinoa', tags: 'Cena', url: 'img/pavo-pro.png' },
        { id: 'prof-rec-quinoa-gambas', title: 'Ensalada de Quinoa y Gambas', category: 'recipe', type: 'image', isSystem: true, ingredients: 'Quinoa, mango, gambas cocidas, cilantro', tags: 'Comida', url: 'img/quinoa_gambas.png' },
        { id: 'prof-rec-lentejas-verduras', title: 'Lentejas con Verduras', category: 'recipe', type: 'image', isSystem: true, ingredients: 'Lentejas, patata, zanahoria, cebolla', tags: 'Comida', url: 'img/lentejas_verduras.png' },
        { id: 'prof-rec-salmon-eneldo', title: 'Salmón al Eneldo', category: 'recipe', type: 'image', isSystem: true, ingredients: 'Salmón, eneldo, patatas al vapor', tags: 'Cena', url: 'img/salmon_eneldo.png' },
        { id: 'prof-rec-lentejas-feta', title: 'Ensalada de Lentejas y Feta', category: 'recipe', type: 'image', isSystem: true, ingredients: 'Lentejas cocidas, queso feta, pepino, tomate', tags: 'Cena', url: 'img/lentejas_feta.png' },
        { id: 'prof-rec-secreto-pro', title: 'Secreto de Cerdo Magro', category: 'recipe', type: 'image', isSystem: true, ingredients: 'Secreto de cerdo magro, piña, ensalada', tags: 'Cena', url: 'img/secreto-cerdo-pro.png' },
        { id: 'prof-rec-noodles-pollo', title: 'Noodles de Pollo y Brócoli', category: 'recipe', type: 'image', isSystem: true, ingredients: 'Fideos de arroz, pollo, brócoli, cacahuetes', tags: 'Comida', url: 'img/noodles_pollo_brocoli.png' },
        { id: 'prof-rec-pollo-arroz-almendras', title: 'Pollo con Arroz y Almendras', category: 'recipe', type: 'image', isSystem: true, ingredients: 'Pechuga de pollo, arroz jazmín, almendras laminadas', tags: 'Comida', url: 'img/pollo_arroz_almendras.png' },
        { id: 'prof-rec-pollo-boniato', title: 'Pollo con Boniato', category: 'recipe', type: 'image', isSystem: true, ingredients: 'Pollo, batata asada, verduras', tags: 'Comida', url: 'img/pollo_boniato.png' },
        { id: 'prof-rec-arepa-pollo', title: 'Arepa de Pollo y Aguacate', category: 'recipe', type: 'image', isSystem: true, ingredients: 'Maíz precocido, pollo desmechado, aguacate', tags: 'Desayuno', url: 'img/arepa_pollo_aguacate.png' },
        { id: 'prof-rec-wok-fideos', title: 'Wok de Pollo y Fideos', category: 'recipe', type: 'image', isSystem: true, ingredients: 'Fideos, pollo, verduras al wok', tags: 'Comida', url: 'img/wok_pollo_fideos.png' }
    ];

    function initializeProRecipes() {
        const globalSysMedia = window.SYSTEM_MEDIA || (typeof SYSTEM_MEDIA !== 'undefined' ? SYSTEM_MEDIA : null);
        if (!globalSysMedia) {
            console.warn("CustomRecipes: SYSTEM_MEDIA not found. Retrying in 100ms...");
            setTimeout(initializeProRecipes, 100);
            return;
        }
        
        let hidden = JSON.parse(localStorage.getItem('hidden_system_media') || '[]');
        
        // --- REVERSIÓN: MODO PROTECCIÓN TOTAL ---
        // NO BORRAMOS NADA. Todas las recetas (137+) son profesionales y se conservan.

        PRO_RECIPES.forEach(pro => {
            const pTitleNorm = String(pro.title || "").toLowerCase().trim();

            // 1. ACTUALIZAR SYSTEM_MEDIA (Memoria Volátil)
            const sysIndex = globalSysMedia.findIndex(m => {
                const mTitleNorm = String(m.title || "").toLowerCase().trim();
                return mTitleNorm === pTitleNorm || m.id === pro.id;
            });

            if (sysIndex !== -1) {
                globalSysMedia[sysIndex] = { ...globalSysMedia[sysIndex], ...pro, isSystem: true, type: 'image' };
            } else {
                globalSysMedia.push({...pro, isSystem: true});
            }
                });
            }
        });

        // 3. PERSISTIR CAMBIOS SI HUBO CURACIÓN
        if (dataChanged && window.saveData) {
            window.saveData(userData);
            console.log("CustomRecipes: Medios personales curados y sincronizados ✅");
        }

        // Ocultar versiones obsoletas
        const idsToHide = [
            'sys-br-24', 'sys-snack-9', 'sys-snack-5', 'sys-br-21', 
            'sys-lun-15', 'sys-lun-4', 'sys-lun-36', 'sys-snack-15', 
            'sys-br-12', 'sys-lun-45', 'sys-lun-43', 'sys-lun-7'
        ];

        idsToHide.forEach(oid => { if (!hidden.includes(oid)) hidden.push(oid); });
        localStorage.setItem('hidden_system_media', JSON.stringify(hidden));

        if (typeof loadMedia === 'function') loadMedia();
    }

    // Ejecutar con un pequeño margen para asegurar carga de data-models.js
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeProRecipes);
    } else {
        setTimeout(initializeProRecipes, 50);
    }
})();
