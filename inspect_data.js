const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = "https://bieeydhacavxymoosasx.supabase.co";
const SUPABASE_KEY = "sb_publishable_ffxbK3z-Am1wVmqV5Szs_w_zOv8RLWQ";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const trainerId = 't-kt1hgr95s';

async function inspect() {
    const { data: profile, error } = await supabase
        .from('trainer_profiles')
        .select('full_data')
        .eq('trainer_id', trainerId)
        .single();
        
    if (error) {
        console.error(error);
        return;
    }
    
    const fullData = profile.full_data || {};
    const clients = fullData.clients || [];
    const clientIds = new Set(clients.map(c => c.id));
    
    const diets = fullData.diets || [];
    const trainingBlocks = fullData.trainingBlocks || [];
    const trainingLogs = fullData.trainingLogs || [];
    
    console.log(`Total clients: ${clients.length}`);
    console.log(`Total diets: ${diets.length}`);
    console.log(`Total trainingBlocks: ${trainingBlocks.length}`);
    console.log(`Total trainingLogs: ${trainingLogs.length}`);
    
    // Check how many diets and trainingBlocks belong to non-existent clients
    const orphanedDiets = diets.filter(d => d.clientId && !clientIds.has(d.clientId));
    const orphanedBlocks = trainingBlocks.filter(b => b.clientId && !clientIds.has(b.clientId));
    const orphanedLogs = trainingLogs.filter(l => l.clientId && !clientIds.has(l.clientId));
    
    console.log(`Orphaned diets (non-existent clients): ${orphanedDiets.length}`);
    console.log(`Orphaned trainingBlocks: ${orphanedBlocks.length}`);
    console.log(`Orphaned trainingLogs: ${orphanedLogs.length}`);
}

inspect();
