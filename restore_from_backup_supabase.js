const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = "https://bieeydhacavxymoosasx.supabase.co";
const SUPABASE_KEY = "sb_publishable_ffxbK3z-Am1wVmqV5Szs_w_zOv8RLWQ";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function run() {
    console.log("Starting restore using Supabase client...");
    
    // 1. Fetch the backup profile
    const { data: backupRow, error: fetchErr } = await supabase
        .from('trainer_profiles')
        .select('full_data')
        .eq('trainer_id', 't-w0iybl7qb_backup')
        .single();
        
    if (fetchErr) {
        console.error("Error fetching backup profile:", fetchErr);
        return;
    }
    
    const backupData = backupRow.full_data || {};
    console.log(`Backup profile loaded:`);
    console.log(`- Clients: ${backupData.clients ? backupData.clients.length : 0}`);
    console.log(`- Routines: ${backupData.routines ? backupData.routines.length : 0}`);
    console.log(`- Diets: ${backupData.diets ? backupData.diets.length : 0}`);

    // 2. Fetch the current profile
    const { data: currentRow, error: currentErr } = await supabase
        .from('trainer_profiles')
        .select('full_data')
        .eq('trainer_id', 't-w0iybl7qb')
        .single();
        
    const currentData = currentRow ? (currentRow.full_data || {}) : {};
    
    // Preserve trainingLogs
    if (currentData.trainingLogs) {
        backupData.trainingLogs = currentData.trainingLogs;
        console.log(`Preserved ${currentData.trainingLogs.length} current training logs.`);
    }
    
    // Merge clients
    const backupClientsMap = new Map((backupData.clients || []).map(c => [c.id, c]));
    if (currentData.clients) {
        currentData.clients.forEach(c => {
            if (!backupClientsMap.has(c.id)) {
                backupData.clients.push(c);
                console.log(`Merged current client "${c.name}" into restore data.`);
            }
        });
    }
    
    // 3. Update the main profile
    backupData.lastModified = new Date().toISOString();
    const { error: updateErr } = await supabase
        .from('trainer_profiles')
        .update({
            full_data: backupData,
            updated_at: new Date().toISOString()
        })
        .eq('trainer_id', 't-w0iybl7qb');
        
    if (updateErr) {
        console.error("Error updating profile:", updateErr);
        return;
    }
    
    console.log("Successfully restored backup data using Supabase client! ✅");
}

run().catch(console.error);
