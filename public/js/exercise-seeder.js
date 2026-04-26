/**
 * PARCHE v71 - SUPER BIBLIOTECA DE 100+ EJERCICIOS
 * Expande los grupos fundamentales a 20 ejercicios por grupo (Manual Mode).
 */
(function() {
    const superLibrary = {
        'Pecho': [
            'Press de Banca Plano (Barra)', 'Press Inclinado (Barra)', 'Press Declinado (Barra)',
            'Press Plano (Mancuernas)', 'Press Inclinado (Mancuernas)', 'Press Declinado (Mancuernas)',
            'Aperturas Planas (Mancuernas)', 'Aperturas Inclinadas (Mancuernas)', 'Aperturas en Peck Deck',
            'Cruce de Poleas Altas', 'Cruce de Poleas Bajas', 'Cruce de Poleas Media Altura',
            'Flexiones (Push Ups)', 'Flexiones Inclinadas', 'Flexiones Declinadas',
            'Fondos en Paralelas (Pecho)', 'Press en Máquina Convergente', 'Pullover con Mancuerna',
            'Press Machacador (Squeeze Press)', 'Landmine Press (Pecho)'
        ],
        'Espalda': [
            'Dominadas (Prono)', 'Dominadas (Supino)', 'Jalón al Pecho (Ancho)', 'Jalón al Pecho (Estrecho)',
            'Remo con Barra (90º)', 'Remo con Barra (Pendlay)', 'Remo con Mancuerna (1 mano)',
            'Remo en Polea Baja (Gironda)', 'Jalón Tras nuca', 'Peso Muerto Convencional',
            'Remo en Punta (T-Bar)', 'Pull-over en Polea Alta', 'Hiperextensiones',
            'Remo en Máquina (Hammer)', 'Facepulls (Foco Espalda)', 'Rack Pulls',
            'Remo Yates', 'Jalón con Brazos Rectos', 'Remo con Soporte en Pecho', 'Dominadas Asistidas'
        ],
        'Hombros': [
            'Press Militar (Barra)', 'Press Militar (Mancuernas)', 'Press Arnold',
            'Elevaciones Laterales (Mancuernas)', 'Elevaciones Laterales (Polea)', 'Elevaciones Frontales (Mancuernas)',
            'Elevaciones Frontales (Barra)', 'Pájaros (Mancuernas)', 'Pájaros (Polea)', 'Facepulls',
            'Encogimientos de Hombros', 'Remo al Mentón (Barra EZ)', 'Press Frontal (Máquina)',
            'Elevación Lateral (Máquina)', 'Pájaros en Peck Deck Invertido', 'Landmine Press (Hombro)',
            'Press Bradford', 'Elevaciones tipo Y', 'Press Push Jerk', 'Elevaciones Laterales Inclinado'
        ],
        'Piernas': [
            'Sentadilla Libre (Barra)', 'Prensa de Piernas 45º', 'Extensiones de Cuádriceps',
            'Curl Femoral Tumbado', 'Curl Femoral Sentado', 'Zancadas Caminando (Lunges)',
            'Sentadilla Búlgara (Foco Cuádriceps)', 'Sentadilla Hack', 'Sentadilla Goblet',
            'Leg Press Horizontal', 'Peso Muerto Rumano (Isquios)', 'Peso Muerto Piernas Rígidas',
            'Elevación de Gemelos (De pie)', 'Elevación de Gemelos (Sentado)', 'Sentadilla Sissy',
            'Adductores en Máquina', 'Peso Muerto con Barra Hexagonal', 'Step Up (Foco Cuádriceps)',
            'Zancada Lateral', 'Curl Femoral de Pie'
        ],
        'Glúteos': [
            'Hip Thrust (Barra)', 'Puente de Glúteo (Barra)', 'Patada de Glúteo en Polea',
            'Patada de Glúteo en Máquina', 'Abducciones en Máquina', 'Abducciones en Polea',
            'Clamshells (Banda)', 'Monster Walk (Banda)', 'Peso Muerto Rumano (Foco Glúteo)',
            'Frog Pumps', 'Hiperextensiones a 45º (Glúteo)', 'Pull-through en Polea',
            'Zancada Búlgara (Foco Glúteo)', 'Step Up (Cajón Alto)', 'Peso Muerto Sumo',
            'Patada Lateral (Polea)', 'Sentadilla Sumo (Mancuerna)', 'Empuje de Cadera en Máquina',
            'Fire Hydrants', 'Buenos Días (Good Mornings)'
        ],
        'Bíceps': [
            'Curl con Barra Z', 'Curl Martillo', 'Curl Predicador (Scott)',
            'Curl Alterno (Mancuernas)', 'Curl Concentrado', 'Curl en Polea Baja', 'Curl Inclinado'
        ],
        'Tríceps': [
            'Press Francés', 'Extensiones en Polea Alta', 'Patada de Tríceps (Polea)',
            'Fondos entre Bancos', 'Press de Banca Estrecho', 'Extensiones tras nuca'
        ],
        'Core': [
            'Plancha Abdominal', 'Crunch en Polea Alta', 'Elevación de Piernas (Colgado)',
            'Rueda Abdominal (Ab Wheel)', 'Dead Bug', 'Giro Ruso (Russian Twist)'
        ]
    };

    function seedExercises() {
        if (!window.getData || !window.saveData) return;
        const data = window.getData();
        
        if (!data.muscleGroupsConfig) {
            data.muscleGroupsConfig = {
                groups: ['Pecho', 'Espalda', 'Hombros', 'Bíceps', 'Tríceps', 'Piernas', 'Glúteos', 'Core'],
                exercises: {}
            };
        }
        
        let totalAdded = 0;

        for (const group in superLibrary) {
            if (!data.muscleGroupsConfig.exercises[group]) {
                data.muscleGroupsConfig.exercises[group] = [];
            }

            const currentExs = data.muscleGroupsConfig.exercises[group];
            
            superLibrary[group].forEach(name => {
                const exists = currentExs.some(e => {
                    const exName = typeof e === 'string' ? e : e.name;
                    return exName.toLowerCase() === name.toLowerCase();
                });

                if (!exists) {
                    currentExs.push({ name: name, videoUrl: '' });
                    totalAdded++;
                }
            });
            
            data.muscleGroupsConfig.exercises[group] = currentExs;
        }

        if (totalAdded > 0) {
            window.saveData(data);
            console.log(`v71: Super Biblioteca Activa. Añadidos ${totalAdded} ejercicios nuevos.`);
            if (typeof window.showMuscleGroupsConfig === 'function' && document.getElementById('exercisesLibrary')) {
                window.showMuscleGroupsConfig();
            }
        }
    }

    setTimeout(seedExercises, 1000);
})();
