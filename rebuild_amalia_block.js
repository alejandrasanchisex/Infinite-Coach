// Script de recuperación CORRECTA con las 5 sesiones bien estructuradas
const { createClient } = require('@supabase/supabase-js');
const SUPABASE_URL = "https://bieeydhacavxymoosasx.supabase.co";
const SUPABASE_KEY = "sb_publishable_ffxbK3z-Am1wVmqV5Szs_w_zOv8RLWQ";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const TRAINER_ID = 't-w0iybl7qb';
const AMALIA_ID = '0db0ea7a-c413-44cb-b99e-dfd9790383eb';
const BLOCK_ID = '51f21397-0da8-429b-8864-d36631e6f133';

async function rebuildBlock() {
    const { data } = await supabase.from('trainer_profiles').select('full_data').eq('trainer_id', TRAINER_ID).single();
    const fd = data.full_data;
    const logs = (fd.trainingLogs || []).filter(l => l.clientId === AMALIA_ID);

    // Reconstruir las 5 sesiones identificadas a partir de los logs únicos
    // (grupos de ejercicios únicos observados en los logs)
    const uniqueSessions = [
        {
            day: 0,
            label: 'Día A - Cuádriceps',
            exercises: [
                'Sentadilla Hack',
                'Prensa de Piernas 45º',
                'Extensiones de Cuádriceps',
                'Sentadilla Búlgara (Foco Cuádriceps)',
                'Aductor'
            ]
        },
        {
            day: 1,
            label: 'Día B - Espalda + Bíceps',
            exercises: [
                'Jalón al Pecho (Ancho)',
                'Remo con Barra (90º)',
                'Pull-over en Polea Alta',
                'Facepulls + Curl Bíceps',
                'Crunch + Elevación Piernas'
            ]
        },
        {
            day: 2,
            label: 'Día C - Glúteos + Isquiotibiales',
            exercises: [
                'Abducciones en Máquina + Monster Walks',
                'RDL con barra',
                'Sentadilla Sumo con mancuerna',
                'Patada de Glúteo en Polea + Abddución Polea',
                'Curl Femoral Sentado'
            ]
        },
        {
            day: 3,
            label: 'Día D - Hombros + Tríceps',
            exercises: [
                'Press Militar (Mancuernas)',
                'Elevaciones Laterales (Mancuernas)',
                'Elevaciones Laterales (Máquina)',
                'Facepulls + Extensión Tríceps Polea',
                'Crunch + Elevación Piernas'
            ]
        },
        {
            day: 4,
            label: 'Día E - Full Body + Espalda',
            exercises: [
                'Sentadilla con Mancuerna + Monster Walks',
                'Extensiones de Cuádriceps',
                'Patada de Glúteo en Polea + Abducción Polea',
                'Jalón al Pecho (Estrecho)',
                'Rear Delt',
                'Curl en Polea Baja + Extensión Tríceps'
            ]
        }
    ];

    // Mapear ejercicios con sus series reales desde los logs
    function getExerciseFromLog(logExercise) {
        return {
            name: logExercise.exerciseName || logExercise.name || logExercise.exercise || '',
            sets: logExercise.sets || logExercise.targetSets || 3,
            reps: logExercise.reps || logExercise.targetReps || '10-12',
            videoUrl: logExercise.videoUrl || '',
            notes: logExercise.notes || ''
        };
    }

    // Construir las sesiones con datos reales de los logs
    const builtSessions = uniqueSessions.map(sess => {
        // Buscar el log correspondiente para esta sesión
        const matchingLog = logs.find(log => {
            if (!log.exercises) return false;
            const logExNames = log.exercises.map(e => e.exerciseName || e.name || e.exercise || '');
            return logExNames.includes(sess.exercises[0]);
        });

        let exerciseList;
        if (matchingLog) {
            exerciseList = matchingLog.exercises.map(getExerciseFromLog);
        } else {
            exerciseList = sess.exercises.map(name => ({
                name,
                sets: 3,
                reps: '10-12',
                videoUrl: '',
                notes: ''
            }));
        }

        return {
            day: sess.day,
            label: sess.label,
            exercises: exerciseList
        };
    });

    // Construir el bloque definitivo
    const recoveredBlock = {
        id: BLOCK_ID,
        clientId: AMALIA_ID,
        name: 'Plan de Entrenamiento Amalia',
        status: 'active',
        startDate: '2026-05-20T18:30:00.000Z',
        sessions: builtSessions,
        createdAt: '2026-05-20T18:30:00.000Z',
        notes: ''
    };

    console.log('🔧 Bloque reconstruido con 5 sesiones:');
    builtSessions.forEach(s => {
        console.log(`  Sesión ${s.day}: "${s.label}" - ${s.exercises.length} ejercicios`);
        s.exercises.forEach(e => console.log(`    - ${e.name}`));
    });

    // Reemplazar el bloque recuperado (eliminar el anterior mal reconstruido)
    fd.trainingBlocks = (fd.trainingBlocks || []).filter(b => b.id !== BLOCK_ID);
    fd.trainingBlocks.push(recoveredBlock);
    fd.lastModified = new Date().toISOString();

    console.log('\n💾 Guardando en Supabase...');
    const { error } = await supabase
        .from('trainer_profiles')
        .update({ full_data: fd, updated_at: new Date().toISOString() })
        .eq('trainer_id', TRAINER_ID);

    if (error) {
        console.error('❌ Error:', error);
    } else {
        console.log('✅ ¡Bloque de entrenamiento de Amalia RESTAURADO con las 5 sesiones correctas!');
        console.log('   Recarga la página del entrenador para verlo.');
    }
}

rebuildBlock().catch(console.error);
