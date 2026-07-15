const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = "https://bieeydhacavxymoosasx.supabase.co";
const SUPABASE_KEY = "sb_publishable_ffxbK3z-Am1wVmqV5Szs_w_zOv8RLWQ";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function run() {
    console.log("Querying list of trainer IDs (tiny payload, fast)...");
    const { data: trainerList, error: listError } = await supabase
        .from('trainer_profiles')
        .select('trainer_id');

    if (listError) {
        console.error("Error fetching trainer list:", listError);
        return;
    }

    console.log(`Found ${trainerList.length} trainer profiles. Fetching details one by one to avoid database timeouts...`);

    for (let i = 0; i < trainerList.length; i++) {
        const tid = trainerList[i].trainer_id;
        
        // Skip backups to save time/resources
        if (tid.endsWith('_backup')) {
            console.log(`\n[${i + 1}/${trainerList.length}] Trainer ID: ${tid} (BACKUP - Skipped)`);
            continue;
        }

        try {
            const { data, error } = await supabase
                .from('trainer_profiles')
                .select('full_data')
                .eq('trainer_id', tid)
                .single();

            if (error) {
                console.error(`Error fetching trainer ${tid}:`, error.message);
                continue;
            }

            const db = data.full_data || {};
            const brandName = db.brand ? db.brand.name : "Sin marca";
            const email = db.settings ? db.settings.adminEmail : (db.trainerSettings ? db.trainerSettings.email : "Sin email");
            const clients = db.clients || [];
            
            console.log(`\n[${i + 1}/${trainerList.length}] Trainer ID: ${tid}`);
            console.log(`    Nombre/Marca: ${brandName}`);
            console.log(`    Email: ${email}`);
            console.log(`    Clientes totales: ${clients.length}`);
            if (clients.length > 0) {
                console.log(`    Nombres de clientes: ${clients.map(c => c.name).join(', ')}`);
            }
        } catch (e) {
            console.error(`Exception for trainer ${tid}:`, e);
        }
    }
}

run();
