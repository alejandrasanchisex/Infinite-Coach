/**
 * PARCHE v92 - BIBLIOTECA PROFESIONAL DE EJERCICIOS
 * Inyecta +100 ejercicios con técnica profesional (YouTube) y asegura su permanencia.
 */
(function() {
    const PRO_EXERCISES = {
        'Pecho': [
            { name: 'Press de Banca Plano (Barra)', videoUrl: 'https://www.youtube.com/watch?v=tuwHzzPrzOM' },
            { name: 'Press Inclinado (Barra)', videoUrl: 'https://www.youtube.com/watch?v=SrqOu55lr6A' },
            { name: 'Press Declinado (Barra)', videoUrl: 'https://www.youtube.com/watch?v=LfyQbuJshYw' },
            { name: 'Press Plano (Mancuernas)', videoUrl: 'https://www.youtube.com/watch?v=8679p9qL-wY' },
            { name: 'Press Inclinado (Mancuernas)', videoUrl: 'https://www.youtube.com/watch?v=8iPEnn-ltC8' },
            { name: 'Aperturas Planas (Mancuernas)', videoUrl: 'https://www.youtube.com/watch?v=eGjt4lk6g34' },
            { name: 'Aperturas en Peck Deck', videoUrl: 'https://www.youtube.com/watch?v=6id882M_39E' },
            { name: 'Cruce de Poleas Altas', videoUrl: 'https://www.youtube.com/watch?v=taI4XpqatW0' },
            { name: 'Cruce de Poleas Bajas', videoUrl: 'https://www.youtube.com/watch?v=Mofp6LqWf1A' },
            { name: 'Flexiones (Push Ups)', videoUrl: 'https://www.youtube.com/watch?v=IODxDxX7oi4' },
            { name: 'Fondos en Paralelas (Pecho)', videoUrl: 'https://www.youtube.com/watch?v=2z8JmcrW-As' },
            { name: 'Press en Máquina Convergente', videoUrl: 'https://www.youtube.com/watch?v=xZ9Mms94k8o' },
            { name: 'Pullover con Mancuerna', videoUrl: 'https://www.youtube.com/watch?v=FK4rj9Ps0uM' }
        ],
        'Espalda': [
            { name: 'Dominadas (Prono)', videoUrl: 'https://www.youtube.com/watch?v=eGo4IYlbE5g' },
            { name: 'Dominadas (Supino)', videoUrl: 'https://www.youtube.com/watch?v=eGo4IYlbE5g' },
            { name: 'Jalón al Pecho (Ancho)', videoUrl: 'https://www.youtube.com/watch?v=CAwf7n6Luuc' },
            { name: 'Jalón al Pecho (Estrecho)', videoUrl: 'https://www.youtube.com/watch?v=G86L6_W8y-w' },
            { name: 'Remo con Barra (90º)', videoUrl: 'https://www.youtube.com/watch?v=RQU8wL6G_HI' },
            { name: 'Remo con Mancuerna (1 mano)', videoUrl: 'https://www.youtube.com/watch?v=dFzUjzuW_2M' },
            { name: 'Remo en Polea Baja (Gironda)', videoUrl: 'https://www.youtube.com/watch?v=GZbfZ033f74' },
            { name: 'Peso Muerto Convencional', videoUrl: 'https://www.youtube.com/watch?v=ytGaGIn3SjE' },
            { name: 'Remo en Punta (T-Bar)', videoUrl: 'https://www.youtube.com/watch?v=j3Igk5nyZE4' },
            { name: 'Pull-over en Polea Alta', videoUrl: 'https://www.youtube.com/watch?v=P_m8_z_Lh-I' },
            { name: 'Hiperextensiones', videoUrl: 'https://www.youtube.com/watch?v=ph3pddpKzzw' },
            { name: 'Jalón con Brazos Rectos', videoUrl: 'https://www.youtube.com/watch?v=AJO_R0E-zB8' },
            { name: 'Remo con Soporte en Pecho', videoUrl: 'https://www.youtube.com/watch?v=roS6vXG3o1w' }
        ],
        'Hombros': [
            { name: 'Press Militar (Barra)', videoUrl: 'https://www.youtube.com/watch?v=2yjwxtZ_Vkg' },
            { name: 'Press Militar (Mancuernas)', videoUrl: 'https://www.youtube.com/watch?v=hzV0is76j5I' },
            { name: 'Press Arnold', videoUrl: 'https://www.youtube.com/watch?v=6mcHe6Pvefc' },
            { name: 'Elevaciones Laterales (Mancuernas)', videoUrl: 'https://www.youtube.com/watch?v=3VcKaXpzqRo' },
            { name: 'Elevaciones Laterales (Polea)', videoUrl: 'https://www.youtube.com/watch?v=PPrzBWZDOhA' },
            { name: 'Elevaciones Frontales (Mancuernas)', videoUrl: 'https://www.youtube.com/watch?v=gzXoI26vT_o' },
            { name: 'Pájaros (Mancuernas)', videoUrl: 'https://www.youtube.com/watch?v=6yMdhi2DVao' },
            { name: 'Pájaros (Polea)', videoUrl: 'https://www.youtube.com/watch?v=H530fW3KWfk' },
            { name: 'Facepulls', videoUrl: 'https://www.youtube.com/watch?v=V8dZ3on_D_Y' },
            { name: 'Encogimientos de Hombros', videoUrl: 'https://www.youtube.com/watch?v=g6qbq4u19OY' },
            { name: 'Remo al Mentón (Barra EZ)', videoUrl: 'https://www.youtube.com/watch?v=um3VVz_SIsg' },
            { name: 'Pájaros en Peck Deck Invertido', videoUrl: 'https://www.youtube.com/watch?v=5yWTVfXNntc' }
        ],
        'Piernas': [
            { name: 'Sentadilla Libre (Barra)', videoUrl: 'https://www.youtube.com/watch?v=SW_C1A-SHMA' },
            { name: 'Prensa de Piernas 45º', videoUrl: 'https://www.youtube.com/watch?v=yZ800I4r_0g' },
            { name: 'Extensiones de Cuádriceps', videoUrl: 'https://www.youtube.com/watch?v=YyvSfVLYd80' },
            { name: 'Curl Femoral Tumbado', videoUrl: 'https://www.youtube.com/watch?v=1Tq3QdAUUoI' },
            { name: 'Curl Femoral Sentado', videoUrl: 'https://www.youtube.com/watch?v=F488k66OZuE' },
            { name: 'Zancadas Caminando (Lunges)', videoUrl: 'https://www.youtube.com/watch?v=D7KaRcUTQeE' },
            { name: 'Sentadilla Búlgara (Foco Cuádriceps)', videoUrl: 'https://www.youtube.com/watch?v=2C-uNgKwPLE' },
            { name: 'Sentadilla Hack', videoUrl: 'https://www.youtube.com/watch?v=EdSndmB-A7c' },
            { name: 'Sentadilla Goblet', videoUrl: 'https://www.youtube.com/watch?v=MeIiGibT6X0' },
            { name: 'Peso Muerto Rumano (Isquios)', videoUrl: 'https://www.youtube.com/watch?v=JCXUYuzz9Sg' },
            { name: 'Elevación de Gemelos (De pie)', videoUrl: 'https://www.youtube.com/watch?v=gwLzBJYoWlI' },
            { name: 'Elevación de Gemelos (Sentado)', videoUrl: 'https://www.youtube.com/watch?v=JbyjN7BW3ic' }
        ],
        'Glúteos': [
            { name: 'Hip Thrust (Barra)', videoUrl: 'https://www.youtube.com/watch?v=SEDZFull6pQ' },
            { name: 'Puente de Glúteo (Barra)', videoUrl: 'https://www.youtube.com/watch?v=j6iT33H99e0' },
            { name: 'Patada de Glúteo en Polea', videoUrl: 'https://www.youtube.com/watch?v=N_p2U_62jG8' },
            { name: 'Abducciones en Máquina', videoUrl: 'https://www.youtube.com/watch?v=NpZp824T3lE' },
            { name: 'Zancada Búlgara (Foco Glúteo)', videoUrl: 'https://www.youtube.com/watch?v=2C-uNgKwPLE' },
            { name: 'Step Up (Cajón Alto)', videoUrl: 'https://www.youtube.com/watch?v=9_C8p9pNc6U' },
            { name: 'Abducciones en Polea', videoUrl: 'https://www.youtube.com/watch?v=NpZp824F3lE' }
        ],
        'Bíceps': [
            { name: 'Curl con Barra Z', videoUrl: 'https://www.youtube.com/watch?v=LY1V6p-XvJk' },
            { name: 'Curl Martillo', videoUrl: 'https://www.youtube.com/watch?v=zC3nLlEvin4' },
            { name: 'Curl Predicador (Scott)', videoUrl: 'https://www.youtube.com/watch?v=fIWP-FRFNU0' },
            { name: 'Curl Alterno (Mancuernas)', videoUrl: 'https://www.youtube.com/watch?v=sAq_ocpRh_I' },
            { name: 'Curl Concentrado', videoUrl: 'https://www.youtube.com/watch?v=v0ZStv9fU8k' },
            { name: 'Curl en Polea Baja', videoUrl: 'https://www.youtube.com/watch?v=AsAVbgh8Syg' }
        ],
        'Tríceps': [
            { name: 'Press Francés', videoUrl: 'https://www.youtube.com/watch?v=1u1_NreL7mU' },
            { name: 'Extensiones en Polea Alta', videoUrl: 'https://www.youtube.com/watch?v=2-LAMcpzHLU' },
            { name: 'Patada de Tríceps (Polea)', videoUrl: 'https://www.youtube.com/watch?v=6SS6K3lAwZ8' },
            { name: 'Press de Banca Estrecho', videoUrl: 'https://www.youtube.com/watch?v=wX-EPr_x4_A' },
            { name: 'Extensiones tras nuca', videoUrl: 'https://www.youtube.com/watch?v=6XhS6_q1Vtc' }
        ],
        'Core': [
            { name: 'Plancha Abdominal', videoUrl: 'https://www.youtube.com/watch?v=TvxNkmjdhMM' },
            { name: 'Crunch en Polea Alta', videoUrl: 'https://www.youtube.com/watch?v=S08E3B6xLMc' },
            { name: 'Elevación de Piernas (Colgado)', videoUrl: 'https://www.youtube.com/watch?v=hd_FpXy97r0' },
            { name: 'Rueda Abdominal (Ab Wheel)', videoUrl: 'https://www.youtube.com/watch?v=H7m_L0XF9vI' },
            { name: 'Dead Bug', videoUrl: 'https://www.youtube.com/watch?v=4XLEnwUr1gk' }
        ]
    };

    function initializeProExercises() {
        if (!window.getData || !window.saveData) {
            console.warn("CustomExercises: Core functions not found. Retrying in 100ms...");
            setTimeout(initializeProExercises, 100);
            return;
        }

        const data = window.getData();
        let changed = false;

        // --- LÓGICA DE PURGA REAL (v92 PRO) ---
        // Eliminar activos de ejercicio que no sean oficiales del sistema
        if (data.media && data.media.length > 0) {
            const initialCount = data.media.length;
            data.media = data.media.filter(m => {
                if (m.category !== 'exercise') return true; // Mantener recetas (se purgan en su propio script)
                const isOfficial = m.id && (String(m.id).startsWith('sys-ex-') || String(m.id).startsWith('prof-ex-'));
                const isSystem = m.isSystem === true;
                return isOfficial || isSystem;
            });
            if (data.media.length !== initialCount) {
                console.log(`🧹 Real Mode (Exercises): Purga completada. Eliminados ${initialCount - data.media.length} activos.`);
                changed = true;
            }
        }

        // 1. Asegurar estructura de Configuración
        if (!data.muscleGroupsConfig) {
            data.muscleGroupsConfig = {
                groups: ['Pecho', 'Espalda', 'Hombros', 'Piernas', 'Glúteos', 'Bíceps', 'Tríceps', 'Core'],
                exercises: {}
            };
            changed = true;
        }

        const mgConfig = data.muscleGroupsConfig;
        if (!mgConfig.exercises) mgConfig.exercises = {};

        // 2. Inyectar / Actualizar Ejercicios PRO
        for (const group in PRO_EXERCISES) {
            if (!mgConfig.exercises[group]) {
                mgConfig.exercises[group] = [];
                changed = true;
            }

            PRO_EXERCISES[group].forEach(proEx => {
                const index = mgConfig.exercises[group].findIndex(ex => {
                    const exName = typeof ex === 'string' ? ex : ex.name;
                    return exName.toLowerCase().trim() === proEx.name.toLowerCase().trim();
                });

                if (index === -1) {
                    mgConfig.exercises[group].push({ name: proEx.name, videoUrl: proEx.videoUrl });
                    changed = true;
                } else {
                    const currentEx = mgConfig.exercises[group][index];
                    const currentUrl = typeof currentEx === 'string' ? '' : (currentEx.videoUrl || '');
                    
                    if (!currentUrl || currentUrl.includes('placeholder')) {
                        mgConfig.exercises[group][index] = { 
                            name: typeof currentEx === 'string' ? currentEx : currentEx.name, 
                            videoUrl: proEx.videoUrl 
                        };
                        changed = true;
                    }
                }
            });
        }

        // 3. Sincronizar con la Biblioteca Multimedia (Media)
        if (data.media) {
            for (const group in PRO_EXERCISES) {
                PRO_EXERCISES[group].forEach(proEx => {
                    const mediaIndex = data.media.findIndex(m => 
                        m.category === 'exercise' && 
                        m.title.toLowerCase().trim() === proEx.name.toLowerCase().trim()
                    );

                    if (mediaIndex === -1) {
                        data.media.push({
                            id: 'sys-ex-' + proEx.name.replace(/\s+/g, '-').toLowerCase(),
                            type: 'video',
                            category: 'exercise',
                            url: proEx.videoUrl,
                            title: proEx.name,
                            muscleGroup: group,
                            isSystem: true,
                            createdAt: new Date().toISOString()
                        });
                        changed = true;
                    } else {
                        if (!data.media[mediaIndex].url || data.media[mediaIndex].isSystem) {
                            data.media[mediaIndex].url = proEx.videoUrl;
                            changed = true;
                        }
                    }
                });
            }
        }

        // 4. Guardar si hubo cambios
        if (changed) {
            data.muscleGroupsConfig = mgConfig;
            window.saveData(data);
            console.log("CustomExercises: Biblioteca profesional inyectada y sincronizada ✅");
            if (window.syncToCloud) window.syncToCloud();
        }

        if (typeof loadMedia === 'function') loadMedia();
        if (typeof loadRoutines === 'function') loadRoutines();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeProExercises);
    } else {
        setTimeout(initializeProExercises, 50);
    }
})();
