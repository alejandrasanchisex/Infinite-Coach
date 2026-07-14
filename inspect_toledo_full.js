const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = "https://bieeydhacavxymoosasx.supabase.co";
const SUPABASE_KEY = "sb_publishable_ffxbK3z-Am1wVmqV5Szs_w_zOv8RLWQ";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const TRAINER_ID = 't-8umeizyns';

async function run() {
    try {
        const { data, error } = await supabase
            .from('trainer_profiles')
            .select('full_data')
            .eq('trainer_id', TRAINER_ID)
            .single();

        if (error) throw error;

        const db = data.full_data || {};
        console.log("Keys in full_data:", Object.keys(db));
        console.log("Clients count:", (db.clients || []).length);
        console.log("Routines count:", (db.routines || []).length);
        console.log("Diets count:", (db.diets || []).length);
        console.log("Training logs count:", (db.trainingLogs || []).length);
        console.log("Training blocks count:", (db.trainingBlocks || []).length);
        
        if (db.clients && db.clients.length > 0) {
            console.log("Client details:", db.clients.map(c => ({ id: c.id, name: c.name, assignedBlockId: c.assignedBlockId, routineId: c.routineId, routineIds: c.routineIds })));
        }
        
    } catch (err) {
        console.error(err);
    }
}

run();
