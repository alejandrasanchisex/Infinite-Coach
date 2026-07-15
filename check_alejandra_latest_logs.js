const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = "https://bieeydhacavxymoosasx.supabase.co";
const SUPABASE_KEY = "sb_publishable_ffxbK3z-Am1wVmqV5Szs_w_zOv8RLWQ";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function run() {
    const { data, error } = await supabase
        .from('trainer_profiles')
        .select('full_data')
        .eq('trainer_id', 't-8umeizyns')
        .single();

    if (error) {
        console.error(error);
        return;
    }

    const db = data.full_data || {};
    const logs = db.trainingLogs || [];
    
    // Alejandra's client ID
    const cid = "968525f6-b4f0-4862-85e2-0380eed6f215";
    const aLogs = logs.filter(l => l.clientId === cid);
    
    // Sort descending by date
    aLogs.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    console.log("RAW DETAILS OF THE 3 LATEST LOGS FOR ALEJANDRA:");
    aLogs.slice(0, 3).forEach((l, idx) => {
        console.log(`\n--- Log #${idx + 1} ---`);
        console.log(`ID: ${l.id}`);
        console.log(`Date: ${l.date}`);
        console.log(`weekIndex: ${l.weekIndex}`);
        console.log(`dayNumber: ${l.dayNumber}`);
        console.log(`completed: ${l.completed}`);
        console.log(`exercises count: ${l.exercises ? l.exercises.length : 0}`);
        if (l.exercises) {
            l.exercises.forEach(e => {
                console.log(`   - Ex: ${e.name}, sets completed: ${e.sets ? e.sets.filter(s => s.reps > 0 || s.weight > 0).length : 0}`);
            });
        }
    });
}

run();
