const { createClient } = require('@supabase/supabase-js');
const SUPABASE_URL = "https://bieeydhacavxymoosasx.supabase.co";
const SUPABASE_KEY = "sb_publishable_ffxbK3z-Am1wVmqV5Szs_w_zOv8RLWQ";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function inspectLucy() {
    console.log("Fetching all trainer profiles (including backups)...");
    const { data: profiles, error } = await supabase
        .from('trainer_profiles')
        .select('trainer_id, full_data');

    if (error) {
        console.error("Error fetching profiles:", error);
        return;
    }

    console.log(`Found ${profiles.length} profiles.`);

    // 1. Inspect Lucy Tundidor profile
    const lucyProfile = profiles.find(p => p.trainer_id === 't-udve3b1u3');
    if (lucyProfile) {
        console.log('\n=================== LUCY TUNDIDOR PROFILE (t-udve3b1u3) ===================');
        const fd = lucyProfile.full_data || {};
        console.log('Brand:', fd.brand);
        console.log('Clients count:', (fd.clients || []).length);
        console.log('Diets count:', (fd.diets || []).length);
        console.log('Workouts/Routines count:', (fd.routines || []).length);
        console.log('Last Access / Logins:', fd.logins || fd.lastAccess || 'No direct field');
        
        // Let's search if she has a backup profile
        const lucyBackup = profiles.find(p => p.trainer_id === 't-udve3b1u3_backup');
        if (lucyBackup) {
            console.log('\nFound backup for Lucy Tundidor (t-udve3b1u3_backup):');
            const bfd = lucyBackup.full_data || {};
            console.log('Backup Clients count:', (bfd.clients || []).length);
            console.log('Backup Diets count:', (bfd.diets || []).length);
            console.log('Backup Routines count:', (bfd.routines || []).length);
        }
    }

    // 2. Search for Lucy/Lucía as a client in all profiles
    console.log('\n=================== SEARCHING FOR LUCY/LUCÍA AS CLIENT ===================');
    profiles.forEach(p => {
        const fd = p.full_data || {};
        const clients = fd.clients || [];
        clients.forEach(c => {
            if (c.name?.toLowerCase().includes('lucy') || c.name?.toLowerCase().includes('lucía') || c.email?.toLowerCase().includes('lucy') || c.email?.toLowerCase().includes('lucia')) {
                console.log(`Found client in Trainer "${p.trainer_id}" (${fd.brand?.name || 'No brand'}):`);
                console.log(`  Client ID: ${c.id}`);
                console.log(`  Name: ${c.name}`);
                console.log(`  Email: ${c.email}`);
                console.log(`  Last Access: ${c.lastAccess || c.last_access || 'N/A'}`);
                console.log(`  Assigned Diet: ${c.assignedDiet} (Published: ${c.dietPublished})`);
                console.log(`  Assigned Routine: ${c.assignedRoutine || c.assignedRoutineId} (Published: ${c.routinePublished})`);
            }
        });
    });

    // 3. Search for Lucy/Lucía as a team member/collaborator in all profiles
    console.log('\n=================== SEARCHING FOR LUCY/LUCÍA AS TEAM MEMBER ===================');
    profiles.forEach(p => {
        const fd = p.full_data || {};
        const members = fd.teamMembers || [];
        members.forEach(m => {
            if (m.name?.toLowerCase().includes('lucy') || m.name?.toLowerCase().includes('lucía') || m.email?.toLowerCase().includes('lucy') || m.email?.toLowerCase().includes('lucia')) {
                console.log(`Found team member in Trainer "${p.trainer_id}" (${fd.brand?.name || 'No brand'}):`);
                console.log(`  Member ID: ${m.id}`);
                console.log(`  Name: ${m.name}`);
                console.log(`  Email: ${m.email}`);
                console.log(`  Clients: ${m.clients ? m.clients.join(', ') : 'All'}`);
            }
        });
    });
}

inspectLucy().catch(console.error);
