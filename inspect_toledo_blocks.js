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
        const blocks = db.trainingBlocks || [];
        console.log(`Found ${blocks.length} training blocks:`);
        for (const b of blocks) {
            console.log(`- ID: ${b.id}`);
            console.log(`  Name: ${b.name}`);
            console.log(`  Status: ${b.status}`);
            console.log(`  Weeks count: ${(b.weeks || []).length}`);
            if (b.weeks) {
                b.weeks.forEach((w, wIdx) => {
                    console.log(`    Week ${wIdx + 1}: Name="${w.name}", ID="${w.id}"`);
                    if (w.days) {
                        w.days.forEach((d, dIdx) => {
                            console.log(`      Day ${dIdx + 1}: Name="${d.name}" (${(d.exercises || []).length} exercises)`);
                        });
                    }
                });
            }
        }

    } catch (err) {
        console.error(err);
    }
}

run();
