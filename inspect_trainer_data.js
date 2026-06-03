const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = "https://bieeydhacavxymoosasx.supabase.co";
const SUPABASE_KEY = "sb_publishable_ffxbK3z-Am1wVmqV5Szs_w_zOv8RLWQ";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function inspectTrainer() {
    const trainerId = 't-w0iybl7qb';
    console.log(`Inspecting data for trainer ${trainerId}...`);
    
    const { data, error } = await supabase
        .from('trainer_profiles')
        .select('*')
        .eq('trainer_id', trainerId)
        .single();
        
    if (error) {
        console.error("Error fetching trainer:", error);
        return;
    }
    
    const fullData = data.full_data || {};
    console.log("Media Count:", (fullData.media || []).length);
    console.log("MuscleGroupsConfig exists:", !!fullData.muscleGroupsConfig);
    if (fullData.muscleGroupsConfig) {
        console.log("Config keys:", Object.keys(fullData.muscleGroupsConfig.exercises || {}));
        console.log("Cuadriceps Config exercises:", fullData.muscleGroupsConfig.exercises['Cuadriceps']);
        console.log("Isquiotibiales Config exercises:", fullData.muscleGroupsConfig.exercises['Isquiotibiales']);
        console.log("Gemelos Config exercises:", fullData.muscleGroupsConfig.exercises['Gemelos']);
    }
    
    const hamExercises = (fullData.media || []).filter(m => 
        m.category === 'exercise' && 
        (m.title.toLowerCase().includes('femoral') || m.title.toLowerCase().includes('gemelo'))
    );
    console.log("Hamstring/Calf Exercises in Media library:");
    hamExercises.forEach(ex => {
        console.log(`  - "${ex.title}" | Muscle Group: "${ex.muscleGroup}"`);
    });
}

inspectTrainer();
