const https = require('https');

const SUPABASE_URL = "https://bieeydhacavxymoosasx.supabase.co";
const SUPABASE_KEY = "sb_publishable_ffxbK3z-Am1wVmqV5Szs_w_zOv8RLWQ";

function makeRequest(method, path, body = null) {
    return new Promise((resolve, reject) => {
        const url = new URL(SUPABASE_URL + path);
        const options = {
            method: method,
            hostname: url.hostname,
            port: 443,
            path: url.pathname + url.search,
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`,
                'Content-Type': 'application/json'
            }
        };

        const req = https.request(options, (res) => {
            let responseBody = '';
            res.on('data', (chunk) => { responseBody += chunk; });
            res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    resolve(responseBody ? JSON.parse(responseBody) : null);
                } else {
                    reject(new Error(`Status ${res.statusCode}: ${responseBody}`));
                }
            });
        });

        req.on('error', (err) => { reject(err); });
        if (body) req.write(JSON.stringify(body));
        req.end();
    });
}

async function run() {
    console.log("Starting selective restore from t-w0iybl7qb_backup...");
    
    // 1. Fetch only the fields we need from the backup profile (excluding trainingLogs)
    // PostgREST syntax for selecting JSONB fields: full_data->field
    const selectQuery = 'full_data->clients,full_data->routines,full_data->diets,full_data->supplementationTemplates,full_data->feedbacks,full_data->appointments,full_data->invoices,full_data->trainingBlocks,full_data->habits,full_data->library';
    
    const backupRes = await makeRequest('GET', `/rest/v1/trainer_profiles?trainer_id=eq.t-w0iybl7qb_backup&select=${selectQuery}`);
    if (!backupRes || backupRes.length === 0) {
        console.log("No backup profile found!");
        return;
    }
    
    const row = backupRes[0];
    const backupData = {
        clients: row.clients || [],
        routines: row.routines || [],
        diets: row.diets || [],
        supplementationTemplates: row.supplementationTemplates || [],
        feedbacks: row.feedbacks || [],
        appointments: row.appointments || [],
        invoices: row.invoices || [],
        trainingBlocks: row.trainingBlocks || [],
        habits: row.habits || [],
        library: row.library || [],
        trainingLogs: [] // start empty or fetch from current
    };
    
    console.log(`Backup profile fields loaded:`);
    console.log(`- Clients: ${backupData.clients.length}`);
    console.log(`- Routines: ${backupData.routines.length}`);
    console.log(`- Diets: ${backupData.diets.length}`);
    
    // 2. Fetch the current trainer profile (we want to preserve its trainingLogs and any other changes)
    const currentRes = await makeRequest('GET', `/rest/v1/trainer_profiles?trainer_id=eq.t-w0iybl7qb&select=full_data`);
    const currentData = currentRes && currentRes.length > 0 ? currentRes[0].full_data : {};
    
    if (currentData.trainingLogs) {
        backupData.trainingLogs = currentData.trainingLogs;
        console.log(`Preserved ${currentData.trainingLogs.length} current training logs.`);
    }
    
    // Merge any client in current that is not in backup
    const backupClientsMap = new Map(backupData.clients.map(c => [c.id, c]));
    if (currentData.clients) {
        currentData.clients.forEach(c => {
            if (!backupClientsMap.has(c.id)) {
                backupData.clients.push(c);
                console.log(`Merged current client "${c.name}" into restore data.`);
            }
        });
    }

    // 3. Save the restored full_data back to t-w0iybl7qb using PATCH
    backupData.lastModified = new Date().toISOString();
    await makeRequest('PATCH', `/rest/v1/trainer_profiles?trainer_id=eq.t-w0iybl7qb`, {
        full_data: backupData,
        updated_at: new Date().toISOString()
    });
    
    console.log("Successfully restored backup selectively using PATCH! ✅");
}

run().catch(console.error);
