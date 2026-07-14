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
        const logs = db.trainingLogs || [];
        console.log(`Found ${logs.length} training logs:`);
        for (const log of logs) {
            console.log(`- Date: ${log.date}`);
            console.log(`  RoutineID: ${log.routineId}`);
            console.log(`  DayNumber: ${log.dayNumber}`);
            console.log(`  Completed: ${log.completed}`);
            console.log(`  Exercises count: ${(log.exercises || []).length}`);
        }

    } catch (err) {
        console.error(err);
    }
}

run();
