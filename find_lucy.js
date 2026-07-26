const { createClient } = require('@supabase/supabase-js');
const SUPABASE_URL = "https://bieeydhacavxymoosasx.supabase.co";
const SUPABASE_KEY = "sb_publishable_ffxbK3z-Am1wVmqV5Szs_w_zOv8RLWQ";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function findLucy() {
    console.log("Fetching all trainer profiles from Supabase...");
    const { data: profiles, error } = await supabase
        .from('trainer_profiles')
        .select('trainer_id, full_data');

    if (error) {
        console.error("Error fetching profiles:", error);
        return;
    }

    console.log(`Found ${profiles.length} profiles. Searching for Lucy/Lucía...`);

    for (const profile of profiles) {
        const tid = profile.trainer_id;
        const fd = profile.full_data || {};
        const brandName = fd.brand ? fd.brand.name : "Sin marca";
        const email = fd.settings ? fd.settings.adminEmail : (fd.trainerSettings ? fd.trainerSettings.email : "Sin email");
        const trainerName = fd.trainerName || fd.settings?.trainerName || (fd.brand?.name);
        
        // Search in brand, email, trainerName
        const matchesLucy = 
            (brandName && brandName.toLowerCase().includes('lucy')) ||
            (brandName && brandName.toLowerCase().includes('lucía')) ||
            (email && email.toLowerCase().includes('lucy')) ||
            (email && email.toLowerCase().includes('lucia')) ||
            (trainerName && trainerName.toLowerCase().includes('lucy')) ||
            (trainerName && trainerName.toLowerCase().includes('lucía')) ||
            JSON.stringify(fd).toLowerCase().includes('lucy') ||
            JSON.stringify(fd).toLowerCase().includes('lucía');

        if (matchesLucy) {
            console.log(`\n=================== MATCH FOUND ===================`);
            console.log(`Trainer ID: ${tid}`);
            console.log(`Brand Name: ${brandName}`);
            console.log(`Trainer Name: ${trainerName}`);
            console.log(`Email: ${email}`);
            console.log(`Total Clients: ${(fd.clients || []).length}`);
            
            // Look for team members
            if (fd.teamMembers) {
                console.log(`Team Members:`, JSON.stringify(fd.teamMembers, null, 2));
            }
        }
    }
}

findLucy().catch(console.error);
