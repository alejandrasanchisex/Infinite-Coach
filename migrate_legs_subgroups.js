const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = "https://bieeydhacavxymoosasx.supabase.co";
const SUPABASE_KEY = "sb_publishable_ffxbK3z-Am1wVmqV5Szs_w_zOv8RLWQ";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function migrateLegsSubgroups() {
    console.log("🚀 Starting database legs subgroups migration (Hamstrings and Calves)...");
    
    // Fetch all trainer profiles
    const { data: profiles, error } = await supabase.from('trainer_profiles').select('*');
    if (error) {
        console.error("❌ Error fetching profiles:", error);
        return;
    }
    
    console.log(`Found ${profiles.length} trainer profiles.`);
    
    for (const profile of profiles) {
        console.log(`Processing trainer: ${profile.trainer_id} (${profile.email || 'No email'})...`);
        const fullData = profile.full_data || {};
        let modified = false;
        
        // 1. Reassign exercises in library media array
        if (fullData.media && Array.isArray(fullData.media)) {
            fullData.media = fullData.media.map(item => {
                if (item.category === 'exercise') {
                    const title = (item.title || '').toLowerCase().trim();
                    const currentGroup = item.muscleGroup || '';
                    
                    // Only reassign if they are currently classified as Cuadriceps or Piernas
                    if (currentGroup === 'Cuadriceps' || currentGroup === 'Piernas') {
                        if (title.includes('femoral') || title.includes('isquio') || title.includes('rumano')) {
                            item.muscleGroup = 'Isquiotibiales';
                            modified = true;
                            console.log(`  - Moved library exercise "${item.title}": ${currentGroup} -> Isquiotibiales`);
                        } else if (title.includes('gemelo')) {
                            item.muscleGroup = 'Gemelos';
                            modified = true;
                            console.log(`  - Moved library exercise "${item.title}": ${currentGroup} -> Gemelos`);
                        }
                    }
                }
                return item;
            });
        }
        
        // 2. Reassign items inside muscleGroupsConfig.exercises mapping
        if (fullData.muscleGroupsConfig && fullData.muscleGroupsConfig.exercises) {
            const exercisesConfig = fullData.muscleGroupsConfig.exercises;
            
            // Ensure Isquiotibiales and Gemelos keys exist
            if (!exercisesConfig['Isquiotibiales']) exercisesConfig['Isquiotibiales'] = [];
            if (!exercisesConfig['Gemelos']) exercisesConfig['Gemelos'] = [];
            
            // Scan Cuadriceps list to extract and reassign hamstring/calf exercises
            if (exercisesConfig['Cuadriceps'] && Array.isArray(exercisesConfig['Cuadriceps'])) {
                const newQuadsList = [];
                for (const ex of exercisesConfig['Cuadriceps']) {
                    const name = (typeof ex === 'string' ? ex : ex.name || '').toLowerCase().trim();
                    if (name.includes('femoral') || name.includes('isquio') || name.includes('rumano')) {
                        exercisesConfig['Isquiotibiales'].push(ex);
                        modified = true;
                        console.log(`  - Moved config exercise "${typeof ex === 'string' ? ex : ex.name}": Cuadriceps -> Isquiotibiales`);
                    } else if (name.includes('gemelo')) {
                        exercisesConfig['Gemelos'].push(ex);
                        modified = true;
                        console.log(`  - Moved config exercise "${typeof ex === 'string' ? ex : ex.name}": Cuadriceps -> Gemelos`);
                    } else {
                        newQuadsList.push(ex);
                    }
                }
                exercisesConfig['Cuadriceps'] = newQuadsList;
            }
        }
        
        // If changes were made, update the profile in Supabase
        if (modified) {
            console.log(`  💾 Saving changes for trainer ${profile.trainer_id}...`);
            const { error: updateError } = await supabase
                .from('trainer_profiles')
                .update({ full_data: fullData })
                .eq('id', profile.id);
                
            if (updateError) {
                console.error(`  ❌ Error updating trainer ${profile.trainer_id}:`, updateError);
            } else {
                console.log(`  ✅ Successfully migrated trainer ${profile.trainer_id}!`);
            }
        } else {
            console.log(`  ℹ️ No changes needed for trainer ${profile.trainer_id}.`);
        }
    }
    
    console.log("🎉 Legs subgroups migration completed successfully!");
}

migrateLegsSubgroups();
