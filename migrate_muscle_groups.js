const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = "https://bieeydhacavxymoosasx.supabase.co";
const SUPABASE_KEY = "sb_publishable_ffxbK3z-Am1wVmqV5Szs_w_zOv8RLWQ";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const mapMuscleGroup = (g) => {
    if (!g) return g;
    const lower = g.toLowerCase().trim();
    if (lower === 'pecho') return 'Pectorales';
    if (lower === 'espalda') return 'Dorsales';
    if (lower === 'bíceps' || lower === 'biceps') return 'Biceps';
    if (lower === 'tríceps' || lower === 'triceps') return 'Triceps';
    if (lower === 'core') return 'Abdominales';
    if (lower === 'piernas' || lower === 'pierna') return 'Cuadriceps';
    if (lower === 'glúteos' || lower === 'gluteos' || lower === 'glúteo' || lower === 'gluteo') return 'Glúteos';
    return g;
};

async function migrateAll() {
    console.log("🚀 Starting database migration for muscle groups...");
    
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
        
        // 1. Migrate media exercises
        if (fullData.media && Array.isArray(fullData.media)) {
            fullData.media = fullData.media.map(item => {
                if (item.category === 'exercise' && item.muscleGroup) {
                    const originalGroup = item.muscleGroup;
                    const newGroup = mapMuscleGroup(originalGroup);
                    if (originalGroup !== newGroup) {
                        item.muscleGroup = newGroup;
                        modified = true;
                        console.log(`  - Exercise "${item.title}": ${originalGroup} -> ${newGroup}`);
                    }
                }
                return item;
            });
        }
        
        // 2. Migrate muscleGroupsConfig exercises keys
        if (fullData.muscleGroupsConfig && fullData.muscleGroupsConfig.exercises) {
            const newExConfig = {};
            for (const oldKey in fullData.muscleGroupsConfig.exercises) {
                const newKey = mapMuscleGroup(oldKey);
                newExConfig[newKey] = fullData.muscleGroupsConfig.exercises[oldKey];
                if (oldKey !== newKey) {
                    modified = true;
                    console.log(`  - Config Group Key: "${oldKey}" -> "${newKey}"`);
                }
            }
            fullData.muscleGroupsConfig.exercises = newExConfig;
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
    
    console.log("🎉 Muscle groups database migration completed successfully!");
}

migrateAll();
