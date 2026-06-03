const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = "https://bieeydhacavxymoosasx.supabase.co";
const SUPABASE_KEY = "sb_publishable_ffxbK3z-Am1wVmqV5Szs_w_zOv8RLWQ";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function findActive() {
    const clientId = '0db0ca7a-c413-44cb-b99e-dfd9790383cb';
    console.log(`Searching for trainer who owns client ${clientId}...`);
    
    const { data: profiles, error } = await supabase.from('trainer_profiles').select('*');
    if (error) {
        console.error(error);
        return;
    }
    
    for (const profile of profiles) {
        const fullData = profile.full_data || {};
        const clients = fullData.clients || [];
        const found = clients.some(c => c.id === clientId);
        if (found) {
            console.log(`🎉 Found! Trainer is ${profile.trainer_id} (${profile.email || 'No email'}).`);
            console.log(`- Clients Count: ${clients.length}`);
            console.log(`- Media Count: ${(fullData.media || []).length}`);
            console.log(`- MuscleGroupsConfig exist: ${!!fullData.muscleGroupsConfig}`);
            if (fullData.muscleGroupsConfig) {
                console.log("- MuscleGroupsConfig exercises keys:", Object.keys(fullData.muscleGroupsConfig.exercises || {}));
                console.log("- Cuadriceps list:", fullData.muscleGroupsConfig.exercises['Cuadriceps']);
                console.log("- Isquiotibiales list:", fullData.muscleGroupsConfig.exercises['Isquiotibiales']);
                console.log("- Gemelos list:", fullData.muscleGroupsConfig.exercises['Gemelos']);
            }
            
            const legsEx = (fullData.media || []).filter(m => 
                m.category === 'exercise' && 
                ['Cuadriceps', 'Isquiotibiales', 'Gemelos', 'Piernas', 'Glúteos'].includes(m.muscleGroup)
            );
            console.log("- Leg exercises in Media library:");
            legsEx.forEach(ex => {
                console.log(`  * "${ex.title}" | Muscle Group: "${ex.muscleGroup}"`);
            });
            return;
        }
    }
    console.log("Client not found in any trainer profile.");
}

findActive();
