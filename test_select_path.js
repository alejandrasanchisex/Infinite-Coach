const https = require('https');

const SUPABASE_URL = "https://bieeydhacavxymoosasx.supabase.co";
const SUPABASE_KEY = "sb_publishable_ffxbK3z-Am1wVmqV5Szs_w_zOv8RLWQ";

function makeRequest(method, path) {
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
                    resolve(JSON.parse(responseBody));
                } else {
                    reject(new Error(`Status ${res.statusCode}: ${responseBody}`));
                }
            });
        });

        // Set strict timeout of 50 seconds
        req.setTimeout(50000, () => {
            req.destroy();
            reject(new Error("Timeout of 50 seconds exceeded"));
        });

        req.on('error', (err) => { reject(err); });
        req.end();
    });
}

async function run() {
    console.log("Querying t-w0iybl7qb_backup full_data with 50s timeout...");
    try {
        const result = await makeRequest('GET', `/rest/v1/trainer_profiles?trainer_id=eq.t-w0iybl7qb_backup&select=full_data`);
        console.log("Success! Result length:", result.length);
        if (result.length > 0) {
            const fd = result[0].full_data || {};
            const clients = fd.clients || [];
            console.log("Clients count in backup:", clients.length);
            clients.forEach(c => {
                console.log(`  * ${c.name} (${c.id})`);
            });
        }
    } catch(e) {
        console.error("Failed to query clients path:", e.message);
    }
}

run().catch(console.error);
