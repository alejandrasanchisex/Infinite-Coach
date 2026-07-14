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
        const logs = (db.trainingLogs || []).filter(l => l.clientId === '968525f6-b4f0-4862-85e2-0380eed6f215');
        console.log("All current logs for Alejandra:");
        logs.forEach(l => {
            console.log(`- Date: ${l.date}, Day: ${l.dayNumber}, Completed: ${l.completed}, routineId: ${l.routineId}, blockId: ${l.blockId}`);
        });

    } catch (err) {
        console.error(err);
    }
}

run();
