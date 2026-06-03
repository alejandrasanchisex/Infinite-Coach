// Ver la estructura completa de los logs de Amalia para entender los días
const { createClient } = require('@supabase/supabase-js');
const SUPABASE_URL = "https://bieeydhacavxymoosasx.supabase.co";
const SUPABASE_KEY = "sb_publishable_ffxbK3z-Am1wVmqV5Szs_w_zOv8RLWQ";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const TRAINER_ID = 't-w0iybl7qb';
const AMALIA_ID = '0db0ea7a-c413-44cb-b99e-dfd9790383eb';
const BLOCK_ID = '51f21397-0da8-429b-8864-d36631e6f133';

async function inspectLogs() {
    const { data } = await supabase.from('trainer_profiles').select('full_data').eq('trainer_id', TRAINER_ID).single();
    const fd = data.full_data;
    const logs = (fd.trainingLogs || []).filter(l => l.clientId === AMALIA_ID);
    
    console.log(`\nLogs de Amalia: ${logs.length}\n`);
    logs.forEach((log, i) => {
        console.log(`=== LOG ${i+1} ===`);
        console.log('  date:', log.date);
        console.log('  blockId:', log.blockId);
        console.log('  sessionDay:', log.sessionDay);
        console.log('  dayIndex:', log.dayIndex);
        console.log('  dayLabel:', log.dayLabel);
        console.log('  sessionName:', log.sessionName);
        if (log.exercises) {
            console.log(`  exercises (${log.exercises.length}):`);
            log.exercises.forEach(ex => {
                const name = ex.exerciseName || ex.name || ex.exercise;
                console.log(`    - ${name}`);
            });
        }
        console.log('');
    });
    
    // Ver el bloque actual
    const block = (fd.trainingBlocks || []).find(b => b.id === BLOCK_ID);
    if (block) {
        console.log('\n=== BLOQUE RECUPERADO ===');
        console.log('Nombre:', block.name);
        console.log('Sessions:', block.sessions?.length);
        block.sessions?.forEach((s, i) => {
            console.log(`  Sesión ${i}: day=${s.day} label="${s.label}" ejercicios=${s.exercises?.length}`);
        });
    }
}
inspectLogs().catch(console.error);
