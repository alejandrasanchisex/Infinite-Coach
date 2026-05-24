const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = "https://bieeydhacavxymoosasx.supabase.co";
const SUPABASE_KEY = "sb_publishable_ffxbK3z-Am1wVmqV5Szs_w_zOv8RLWQ";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function checkRoutines() {
    console.log("Searching for ALL routines (templates) in ALL trainer profiles in Supabase...");
    const { data, error } = await supabase.from('trainer_profiles').select('*');
    if (error) {
        console.error(error);
        return;
    }
    
    for (const profile of data) {
        const trainerId = profile.trainer_id;
        const fullData = profile.full_data || {};
        const routines = fullData.routines || [];
        if (routines.length > 0) {
            console.log(`\n--- Trainer ID: ${trainerId} ---`);
            console.log("Routines count:", routines.length);
            for (const r of routines) {
                console.log(`- Routine: ${r.name} (ID: ${r.id}, days count: ${(r.days || []).length})`);
                const days = r.days || [];
                days.forEach(d => {
                    console.log(`    - Day: ${d.name} (${(d.exercises || []).length} exercises)`);
                    if ((d.exercises || []).length > 0) {
                        console.log(`      Exercises: ${d.exercises.map(e => e.name).join(', ')}`);
                    }
                });
            }
        }
    }
}

checkRoutines();
