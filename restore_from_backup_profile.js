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
    // 1. Fetch the backup profile
    const backupRes = await makeRequest('GET', `/rest/v1/trainer_profiles?trainer_id=eq.t-w0iybl7qb_backup&select=full_data`);
    if (!backupRes || backupRes.length === 0) {
        console.log("No backup profile found!");
        return;
    }
    const backupData = backupRes[0].full_data;
    console.log("Backup profile loaded. Clients count:", backupData.clients ? backupData.clients.length : 0);
    
    // 2. Fetch the current profile to see if we should preserve anything (like Victor)
    const currentRes = await makeRequest('GET', `/rest/v1/trainer_profiles?trainer_id=eq.t-w0iybl7qb&select=full_data`);
    const currentData = currentRes && currentRes.length > 0 ? currentRes[0].full_data : {};
    console.log("Current profile loaded. Clients count:", currentData.clients ? currentData.clients.length : 0);

    // Merge Victor or any other clients into backupData
    const backupClientsMap = new Map(backupData.clients.map(c => [c.id, c]));
    if (currentData.clients) {
        currentData.clients.forEach(c => {
            if (!backupClientsMap.has(c.id)) {
                backupData.clients.push(c);
                console.log(`Merged client "${c.name}" from current profile into backup.`);
            }
        });
    }

    // 3. Save backupData into the main profile t-w0iybl7qb
    backupData.lastModified = new Date().toISOString();
    await makeRequest('POST', `/rest/v1/trainer_profiles`, {
        trainer_id: 't-w0iybl7qb',
        full_data: backupData,
        updated_at: new Date().toISOString()
    });
    console.log("Successfully restored backup data to t-w0iybl7qb! ✅");
}

run().catch(console.error);
