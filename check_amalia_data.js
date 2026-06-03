// Script de diagnóstico y recuperación para los datos de Amalia
// Ejecutar con: node check_amalia_data.js

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = "https://bieeydhacavxymoosasx.supabase.co";
const SUPABASE_KEY = "sb_publishable_ffxbK3z-Am1wVmqV5Szs_w_zOv8RLWQ";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const TRAINER_ID = 't-w0iybl7qb'; // ASTEAM
const AMALIA_ID = '0db0ea7a-c413-44cb-b99e-dfd9790383eb'; // ID de Amalia desde la URL

async function checkAndRecover() {
    console.log('🔍 Consultando datos del entrenador ASTEAM en Supabase...\n');
    
    const { data, error } = await supabase
        .from('trainer_profiles')
        .select('full_data, updated_at')
        .eq('trainer_id', TRAINER_ID)
        .single();
    
    if (error) {
        console.error('❌ Error al consultar Supabase:', error);
        return;
    }
    
    if (!data) {
        console.log('❌ No hay datos para este entrenador en Supabase');
        return;
    }
    
    const fd = data.full_data;
    console.log('✅ Datos encontrados. Última actualización:', data.updated_at);
    console.log('');
    
    // Resumen de datos
    console.log('📊 RESUMEN DE DATOS:');
    console.log(`  - Clientes: ${(fd.clients || []).length}`);
    console.log(`  - Rutinas: ${(fd.routines || []).length}`);
    console.log(`  - Dietas: ${(fd.diets || []).length}`);
    console.log(`  - Bloques de entrenamiento: ${(fd.trainingBlocks || []).length}`);
    console.log(`  - Logs de entrenamiento: ${(fd.trainingLogs || []).length}`);
    console.log(`  - Feedbacks: ${(fd.feedbacks || []).length}`);
    console.log('');
    
    // Buscar a Amalia
    const amalia = (fd.clients || []).find(c => c.id === AMALIA_ID);
    if (amalia) {
        console.log('✅ AMALIA ENCONTRADA en clientes:');
        console.log('  Nombre:', amalia.name);
        console.log('  Email:', amalia.email);
        console.log('  Estado:', amalia.status);
    } else {
        console.log('❌ Amalia NO encontrada en clientes');
        // Buscar por nombre
        const byName = (fd.clients || []).filter(c => c.name && c.name.toLowerCase().includes('amalia'));
        if (byName.length > 0) {
            console.log('  Encontrada por nombre:', byName.map(c => `${c.name} (${c.id})`).join(', '));
        }
    }
    console.log('');
    
    // Buscar bloques de entrenamiento de Amalia
    const amaliaBlocks = (fd.trainingBlocks || []).filter(b => b.clientId === AMALIA_ID);
    console.log(`🏋️ BLOQUES DE ENTRENAMIENTO DE AMALIA: ${amaliaBlocks.length}`);
    if (amaliaBlocks.length > 0) {
        amaliaBlocks.forEach(b => {
            console.log(`  - [${b.status}] ${b.name} (${b.id})`);
            console.log(`    Sesiones: ${(b.sessions || []).length}`);
            console.log(`    Creado: ${b.createdAt}`);
        });
    } else {
        console.log('  ❌ NO hay bloques de entrenamiento para Amalia en la nube');
    }
    
    // Todos los bloques existentes
    console.log('');
    console.log('📋 TODOS LOS BLOQUES DE ENTRENAMIENTO:');
    (fd.trainingBlocks || []).forEach(b => {
        console.log(`  - clientId: ${b.clientId} | ${b.name} [${b.status}]`);
    });
    
    // Logs de Amalia
    const amaliaLogs = (fd.trainingLogs || []).filter(l => l.clientId === AMALIA_ID);
    console.log('');
    console.log(`📝 LOGS DE ENTRENAMIENTO DE AMALIA: ${amaliaLogs.length}`);
    if (amaliaLogs.length > 0) {
        amaliaLogs.slice(-3).forEach(l => {
            console.log(`  - ${l.date || l.createdAt} | blockId: ${l.blockId}`);
        });
    }
    
    // Si hay IDs eliminados
    console.log('');
    const deletedIds = fd.deletedIds || [];
    console.log(`🗑️ IDs eliminados: ${deletedIds.length}`);
    if (deletedIds.length > 0) {
        console.log('  ', deletedIds.slice(0, 10).join(', '));
    }
}

checkAndRecover().catch(console.error);
