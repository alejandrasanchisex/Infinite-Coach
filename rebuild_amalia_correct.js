// Reconstruccion CORRECTA del bloque de Amalia con la estructura weeks->days->exercises
const { createClient } = require('@supabase/supabase-js');
const SUPABASE_URL = "https://bieeydhacavxymoosasx.supabase.co";
const SUPABASE_KEY = "sb_publishable_ffxbK3z-Am1wVmqV5Szs_w_zOv8RLWQ";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const TRAINER_ID = 't-w0iybl7qb';
const AMALIA_ID = '0db0ea7a-c413-44cb-b99e-dfd9790383eb';
const BLOCK_ID = '51f21397-0da8-429b-8864-d36631e6f133';

async function rebuildWithCorrectStructure() {
    const { data } = await supabase.from('trainer_profiles').select('full_data').eq('trainer_id', TRAINER_ID).single();
    const fd = data.full_data;
    const logs = (fd.trainingLogs || []).filter(l => l.clientId === AMALIA_ID);

    // Función para extraer los ejercicios de un log con su información real
    function buildDayFromLog(log) {
        return {
            name: '',  // will be set per day
            exercises: (log.exercises || []).map(ex => ({
                name: ex.exerciseName || ex.name || ex.exercise || '',
                sets: Array.isArray(ex.sets) ? ex.sets.length : (ex.sets || ex.targetSets || 3),
                reps: ex.reps || ex.targetReps || '10-12',
                intensity: ex.rir !== undefined ? String(ex.rir) : '1',
                notes: ex.notes || '',
                videoUrl: ex.videoUrl || ''
            }))
        };
    }

    // Los 5 días únicos (identificados por el primer ejercicio de cada log único)
    // Log 1 (2026-05-20): Sentadilla Hack → Día A Cuádriceps
    // Log 2 (2026-05-21): Jalón al Pecho Ancho → Día B Espalda+Bíceps
    // Log 3 (2026-05-22): Abducciones → Día C Glúteos+Isquios
    // Log 4 (2026-05-23): Press Militar → Día D Hombros+Tríceps
    // Log 5 (2026-05-24): Sentadilla con Mancuerna → Día E Full Body
    
    const dayALog = logs.find(l => l.exercises && (l.exercises[0]?.exerciseName || l.exercises[0]?.name || '').includes('Sentadilla Hack'));
    const dayBLog = logs.find(l => l.exercises && (l.exercises[0]?.exerciseName || l.exercises[0]?.name || '').includes('Jalón al Pecho (Ancho)'));
    const dayCLog = logs.find(l => l.exercises && (l.exercises[0]?.exerciseName || l.exercises[0]?.name || '').includes('Abducciones'));
    const dayDLog = logs.find(l => l.exercises && (l.exercises[0]?.exerciseName || l.exercises[0]?.name || '').includes('Press Militar'));
    const dayELog = logs.find(l => l.exercises && (l.exercises[0]?.exerciseName || l.exercises[0]?.name || '').includes('Sentadilla con Mancuerna'));

    const dayA = dayALog ? { ...buildDayFromLog(dayALog), name: 'Día A - Cuádriceps' } : { name: 'Día A - Cuádriceps', exercises: [] };
    const dayB = dayBLog ? { ...buildDayFromLog(dayBLog), name: 'Día B - Espalda + Bíceps' } : { name: 'Día B - Espalda + Bíceps', exercises: [] };
    const dayC = dayCLog ? { ...buildDayFromLog(dayCLog), name: 'Día C - Glúteos + Isquiotibiales' } : { name: 'Día C - Glúteos + Isquiotibiales', exercises: [] };
    const dayD = dayDLog ? { ...buildDayFromLog(dayDLog), name: 'Día D - Hombros + Tríceps' } : { name: 'Día D - Hombros + Tríceps', exercises: [] };
    const dayE = dayELog ? { ...buildDayFromLog(dayELog), name: 'Día E - Full Body' } : { name: 'Día E - Full Body', exercises: [] };

    console.log('Días encontrados:');
    console.log('A:', dayA.exercises.length, 'ejercicios');
    console.log('B:', dayB.exercises.length, 'ejercicios');
    console.log('C:', dayC.exercises.length, 'ejercicios');
    console.log('D:', dayD.exercises.length, 'ejercicios');
    console.log('E:', dayE.exercises.length, 'ejercicios');

    // Estructura correcta: weeks -> days -> exercises
    const correctBlock = {
        id: BLOCK_ID,
        clientId: AMALIA_ID,
        name: 'Plan de Entrenamiento Amalia',
        status: 'active',
        startDate: '2026-05-20T18:30:00.000Z',
        weeks: [
            {
                number: 1,
                name: 'Semana 1',
                days: [dayA, dayB, dayC, dayD, dayE]
            }
        ],
        createdAt: '2026-05-20T18:30:00.000Z',
        notes: ''
    };

    console.log('\n✅ Estructura correcta creada:');
    console.log('  Semanas:', correctBlock.weeks.length);
    console.log('  Días en semana 1:', correctBlock.weeks[0].days.length);

    // Reemplazar el bloque en los datos del entrenador
    fd.trainingBlocks = (fd.trainingBlocks || []).filter(b => b.id !== BLOCK_ID);
    fd.trainingBlocks.push(correctBlock);
    fd.lastModified = new Date().toISOString();

    // También limpiar la dieta asignada rota para Amalia
    const amalia = fd.clients.find(c => c.id === AMALIA_ID);
    if (amalia && amalia.assignedDiet) {
        const dietExists = (fd.diets || []).some(d => d.id === amalia.assignedDiet);
        if (!dietExists) {
            console.log('\n⚠️  La dieta asignada a Amalia ya no existe. Limpiando referencia...');
            amalia.assignedDiet = null;
            amalia.dietPublished = false;
        }
    }

    console.log('\n💾 Guardando en Supabase...');
    const { error } = await supabase
        .from('trainer_profiles')
        .update({ full_data: fd, updated_at: new Date().toISOString() })
        .eq('trainer_id', TRAINER_ID);

    if (error) {
        console.error('❌ Error:', error);
    } else {
        console.log('✅ ¡BLOQUE RESTAURADO CON ESTRUCTURA CORRECTA!');
        console.log('   Recarga la página del entrenador (F5) para verlo.');
    }
}

rebuildWithCorrectStructure().catch(console.error);
