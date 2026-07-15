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

        req.on('error', (err) => { reject(err); });
        req.end();
    });
}

async function run() {
    const result = await makeRequest('GET', `/rest/v1/trainer_profiles?trainer_id=eq.t-w0iybl7qb&select=full_data`);
    if (result && result.length > 0) {
        const fullData = result[0].full_data || {};
        const clients = fullData.clients || [];
        console.log(`ASTeam trainer clients count: ${clients.length}`);
        clients.forEach(c => {
            console.log(`- ${c.name} (${c.id}): status=${c.status}`);
        });
    } else {
        console.log("No profile found for t-w0iybl7qb");
    }
}

run().catch(console.error);
