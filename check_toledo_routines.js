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
        const routines = db.routines || [];
        console.log(`Found ${routines.length} routines:`);
        for (const r of routines) {
            console.log(`- ID: ${r.id}, Name: ${r.name}`);
            if (r.days) {
                console.log(`  Days length: ${r.days.length}`);
                r.days.forEach((d, idx) => {
                    console.log(`    Day ${idx + 1}: ${d.name || 'Day ' + (idx + 1)} (${(d.exercises || []).length} exercises)`);
                });
            } else {
                console.log(`  No days array. Exercises count: ${(r.exercises || []).length}`);
            }
        }

        const clients = db.clients || [];
        for (const c of clients) {
            console.log(`\nClient: ${c.name}`);
            console.log(`  assignedRoutine: ${c.assignedRoutine}`);
            console.log(`  assignedRoutines: ${JSON.stringify(c.assignedRoutines)}`);
        }

    } catch (err) {
        console.error(err);
    }
}

run();
