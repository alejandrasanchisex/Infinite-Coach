// Verificar y preparar: dieta publicada + bloque con Semana 1 (con pesos reales) + Semana 2 vacía
const { createClient } = require('@supabase/supabase-js');
const SUPABASE_URL = "https://bieeydhacavxymoosasx.supabase.co";
const SUPABASE_KEY = "sb_publishable_ffxbK3z-Am1wVmqV5Szs_w_zOv8RLWQ";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const TRAINER_ID = 't-w0iybl7qb';
const AMALIA_ID = '0db0ea7a-c413-44cb-b99e-dfd9790383eb';
const BLOCK_ID = '51f21397-0da8-429b-8864-d36631e6f133';

async function prepareAmaliaData() {
    const { data } = await supabase.from('trainer_profiles').select('full_data').eq('trainer_id', TRAINER_ID).single();
    const fd = data.full_data;

    // === PASO 1: Verificar dieta ===
    const amalia = fd.clients.find(c => c.id === AMALIA_ID);
    console.log('=== AMALIA ===');
    console.log('assignedDiet:', amalia.assignedDiet);
    console.log('dietPublished:', amalia.dietPublished);
    
    const diet = (fd.diets || []).find(d => d.id === amalia.assignedDiet);
    if (diet) {
        console.log(`Dieta: "${diet.name}" - comidas: ${(diet.meals||[]).length}`);
    } else {
        console.log('❌ Dieta no encontrada');
    }

    // Publicar la dieta si no está publicada
    if (!amalia.dietPublished) {
        amalia.dietPublished = true;
        console.log('✅ Dieta marcada como publicada');
    }

    // === PASO 2: Verificar el bloque de entrenamiento ===
    let block = (fd.trainingBlocks || []).find(b => b.id === BLOCK_ID);
    console.log('\n=== BLOQUE DE ENTRENAMIENTO ===');
    
    if (!block) {
        console.log('❌ Bloque no encontrado');
        return;
    }
    
    console.log(`Bloque: "${block.name}" status=${block.status}`);
    console.log('Semanas actuales:', (block.weeks||[]).length);
    
    // Ver estructura actual
    (block.weeks||[]).forEach((w, wi) => {
        console.log(`\n  Semana ${wi+1} "${w.name}":`);
        (w.days||[]).forEach((d, di) => {
            console.log(`    Día ${di+1} "${d.name}": ${(d.exercises||[]).length} ejercicios`);
            (d.exercises||[]).slice(0,2).forEach(ex => {
                const setsInfo = Array.isArray(ex.sets) 
                    ? ex.sets.map(s => `${s.weight}kg x${s.reps}`).join(', ')
                    : ex.sets;
                console.log(`      - ${ex.name}: sets=${JSON.stringify(ex.sets).substring(0,80)}`);
            });
        });
    });

    // === PASO 3: Obtener los logs de Amalia con los pesos reales ===
    const logs = (fd.trainingLogs || []).filter(l => l.clientId === AMALIA_ID && l.blockId === BLOCK_ID);
    console.log(`\nLogs de entrenamiento encontrados: ${logs.length}`);

    // Ordenar logs por fecha
    logs.sort((a, b) => new Date(a.date || a.createdAt) - new Date(b.date || b.createdAt));

    // Identificar los 5 días únicos por el primer ejercicio
    const dayIdentifiers = [
        { firstEx: 'Sentadilla Hack', label: 'Día A - Cuádriceps' },
        { firstEx: 'Jalón al Pecho (Ancho)', label: 'Día B - Espalda + Bíceps' },
        { firstEx: 'Abducciones en Máquina + Monster Walks', label: 'Día C - Glúteos + Isquiotibiales' },
        { firstEx: 'Press Militar (Mancuernas)', label: 'Día D - Hombros + Tríceps' },
        { firstEx: 'Sentadilla con Mancuerna + Monster Walks', label: 'Día E - Full Body' },
    ];

    // Para cada día, encontrar el log más representativo (tomamos el PRIMERO de la semana 1: logs[0..4])
    // Los primeros 5 logs únicos = Semana 1
    const week1Logs = [];
    dayIdentifiers.forEach(id => {
        const log = logs.find(l => 
            l.exercises && l.exercises.some(e => 
                (e.exerciseName || e.name || '').includes(id.firstEx.split(' ')[0])
            )
        );
        if (log) week1Logs.push({ log, label: id.label });
    });

    console.log(`\nLogs para Semana 1: ${week1Logs.length}`);

    // Construir Semana 1 con pesos reales de los logs
    function buildDayFromLog(log, label) {
        return {
            name: label,
            exercises: (log.exercises || []).map(ex => {
                // Los sets tienen {rir, reps, weight} - exactamente lo que necesitamos
                const setsData = Array.isArray(ex.sets) ? ex.sets : [];
                return {
                    name: ex.exerciseName || ex.name || ex.exercise || '',
                    sets: setsData.length > 0 
                        ? setsData.map(s => ({ weight: s.weight || 0, reps: s.reps || 0, rir: s.rir !== undefined ? s.rir : 1 }))
                        : (ex.sets || 3),
                    reps: ex.reps || ex.targetReps || '10-12',
                    intensity: ex.rir !== undefined ? String(ex.rir) : '1',
                    notes: ex.notes || '',
                    videoUrl: ex.videoUrl || ''
                };
            })
        };
    }

    // Construir Semana 2: mismos ejercicios que Semana 1 pero sin pesos (para que Amalia los rellene)
    function buildWeek2DayFromWeek1(day1) {
        return {
            name: day1.name,
            exercises: (day1.exercises || []).map(ex => ({
                name: ex.name,
                sets: Array.isArray(ex.sets) 
                    ? ex.sets.map(s => ({ weight: 0, reps: s.reps, rir: s.rir }))
                    : ex.sets,
                reps: ex.reps,
                intensity: ex.intensity || '1',
                notes: ex.notes || '',
                videoUrl: ex.videoUrl || ''
            }))
        };
    }

    // Construir las semanas
    const week1Days = week1Logs.length === 5 
        ? week1Logs.map(({ log, label }) => buildDayFromLog(log, label))
        : (block.weeks[0]?.days || []);

    const week2Days = week1Days.map(buildWeek2DayFromWeek1);

    // Reconstruir el bloque con semanas 1 y 2
    const updatedBlock = {
        ...block,
        status: 'active',
        weeks: [
            {
                number: 1,
                name: 'Semana 1',
                days: week1Days
            },
            {
                number: 2,
                name: 'Semana 2',
                days: week2Days
            }
        ]
    };

    console.log('\n✅ Bloque actualizado:');
    updatedBlock.weeks.forEach((w, wi) => {
        console.log(`  Semana ${wi+1}: ${w.days.length} días`);
        w.days.forEach((d, di) => {
            const exWithWeights = (d.exercises || []).filter(e => 
                Array.isArray(e.sets) && e.sets.some(s => s.weight > 0)
            ).length;
            console.log(`    Día ${di+1} "${d.name}": ${d.exercises?.length} ejercicios, ${exWithWeights} con pesos reales`);
        });
    });

    // Actualizar el bloque
    fd.trainingBlocks = (fd.trainingBlocks || []).map(b => b.id === BLOCK_ID ? updatedBlock : b);

    // Publicar el bloque (para que lo vea Amalia)
    const blockInData = fd.trainingBlocks.find(b => b.id === BLOCK_ID);
    if (blockInData) {
        blockInData.status = 'active';
        // Asignar a Amalia en su ficha
        amalia.assignedRoutine = BLOCK_ID; // Por si no estaba enlazado
    }

    fd.lastModified = new Date().toISOString();

    console.log('\n💾 Guardando en Supabase...');
    const { error } = await supabase
        .from('trainer_profiles')
        .update({ full_data: fd, updated_at: new Date().toISOString() })
        .eq('trainer_id', TRAINER_ID);

    if (error) {
        console.error('❌ Error:', error);
    } else {
        console.log('\n✅ ¡TODO LISTO!');
        console.log('  - Dieta publicada: ✅');
        console.log('  - Semana 1 con pesos reales de los logs: ✅');
        console.log('  - Semana 2 preparada (mismos ejercicios, pesos a rellenar): ✅');
        console.log('\n  Recarga la página del entrenador (F5)');
        console.log('  Amalia también verá su dieta y entrenamiento en su app.');
    }
}

prepareAmaliaData().catch(console.error);
