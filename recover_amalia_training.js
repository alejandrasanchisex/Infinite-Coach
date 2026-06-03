// Script de recuperación de datos de Amalia
// Reconstruye el bloque de entrenamiento a partir de los logs existentes
// Ejecutar con: node recover_amalia_training.js

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = "https://bieeydhacavxymoosasx.supabase.co";
const SUPABASE_KEY = "sb_publishable_ffxbK3z-Am1wVmqV5Szs_w_zOv8RLWQ";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const TRAINER_ID = 't-w0iybl7qb'; // ASTEAM
const AMALIA_ID = '0db0ea7a-c413-44cb-b99e-dfd9790383eb';
const BLOCK_ID = '51f21397-0da8-429b-8864-d36631e6f133'; // ID del bloque recuperado de los logs

async function recoverAmaliaTraining() {
    console.log('🔍 Leyendo datos actuales de Supabase...\n');
    
    const { data, error } = await supabase
        .from('trainer_profiles')
        .select('full_data, updated_at')
        .eq('trainer_id', TRAINER_ID)
        .single();
    
    if (error || !data) {
        console.error('❌ Error al leer datos:', error);
        return;
    }
    
    const fd = data.full_data;
    
    // Mostrar todos los logs de Amalia
    const amaliaLogs = (fd.trainingLogs || []).filter(l => l.clientId === AMALIA_ID);
    console.log(`📝 Logs encontrados para Amalia: ${amaliaLogs.length}`);
    
    // Extraer info de los ejercicios de los logs
    const exercisesFromLogs = new Set();
    const sessionDays = new Set();
    
    amaliaLogs.forEach((log, i) => {
        console.log(`\n  Log ${i+1}:`);
        console.log(`    Fecha: ${log.date || log.createdAt}`);
        console.log(`    Bloque ID: ${log.blockId}`);
        console.log(`    Día/Sesión: ${log.sessionDay || log.sessionName || 'N/A'}`);
        if (log.exercises && log.exercises.length > 0) {
            console.log(`    Ejercicios (${log.exercises.length}):`);
            log.exercises.forEach(ex => {
                const name = ex.exerciseName || ex.name || ex.exercise || 'Ejercicio sin nombre';
                exercisesFromLogs.add(name);
                console.log(`      - ${name}`);
            });
        }
        if (log.sessionDay) sessionDays.add(log.sessionDay);
        if (log.dayLabel) sessionDays.add(log.dayLabel);
    });
    
    console.log('\n\n📋 RESUMEN para reconstruir el bloque:');
    console.log('Ejercicios detectados:', [...exercisesFromLogs]);
    console.log('Días detectados:', [...sessionDays]);
    
    // Verificar si el bloque ya existe (por si hay una carrera de escritura)
    const existingBlock = (fd.trainingBlocks || []).find(b => b.id === BLOCK_ID);
    if (existingBlock) {
        console.log('\n✅ El bloque ya existe en Supabase:', existingBlock.name);
        return;
    }
    
    // Reconstruir el bloque basándonos en los logs
    // Analizamos los logs para obtener los días únicos
    const sessionsMap = {};
    amaliaLogs.forEach(log => {
        const key = log.sessionDay || log.dayIndex || '0';
        if (!sessionsMap[key]) {
            sessionsMap[key] = {
                day: key,
                label: log.dayLabel || log.sessionName || `Día ${key}`,
                exercises: []
            };
        }
        // Agregar ejercicios de este log
        if (log.exercises) {
            log.exercises.forEach(ex => {
                const name = ex.exerciseName || ex.name || ex.exercise || '';
                if (name && !sessionsMap[key].exercises.some(e => e.name === name)) {
                    sessionsMap[key].exercises.push({
                        name: name,
                        sets: ex.sets || ex.targetSets || 3,
                        reps: ex.reps || ex.targetReps || '10-12',
                        videoUrl: ex.videoUrl || ''
                    });
                }
            });
        }
    });
    
    const sessions = Object.values(sessionsMap);
    
    // Crear el bloque recuperado
    const recoveredBlock = {
        id: BLOCK_ID,
        clientId: AMALIA_ID,
        name: 'Plan de Entrenamiento (Recuperado)',
        status: 'active',
        startDate: amaliaLogs[0]?.date || amaliaLogs[0]?.createdAt || new Date().toISOString(),
        sessions: sessions.length > 0 ? sessions : [
            {
                day: 0,
                label: 'Día A',
                exercises: [...exercisesFromLogs].map(name => ({ name, sets: 3, reps: '10-12', videoUrl: '' }))
            }
        ],
        createdAt: amaliaLogs[0]?.date || amaliaLogs[0]?.createdAt || new Date().toISOString(),
        notes: 'Bloque recuperado automáticamente desde logs de entrenamiento'
    };
    
    console.log('\n\n🔧 Bloque a recuperar:');
    console.log(JSON.stringify(recoveredBlock, null, 2));
    
    // Agregar el bloque al trainer's data
    if (!fd.trainingBlocks) fd.trainingBlocks = [];
    fd.trainingBlocks.push(recoveredBlock);
    fd.lastModified = new Date().toISOString();
    
    // Guardar en Supabase
    console.log('\n💾 Guardando bloque recuperado en Supabase...');
    const { error: saveError } = await supabase
        .from('trainer_profiles')
        .update({ 
            full_data: fd,
            updated_at: new Date().toISOString()
        })
        .eq('trainer_id', TRAINER_ID);
    
    if (saveError) {
        console.error('❌ Error al guardar:', saveError);
    } else {
        console.log('✅ Bloque de entrenamiento de Amalia RECUPERADO en Supabase!');
        console.log('   El entrenador verá el bloque al recargar la página.');
    }
}

recoverAmaliaTraining().catch(console.error);
