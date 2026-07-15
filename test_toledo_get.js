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

        req.setTimeout(30000, () => {
            req.destroy();
            reject(new Error("Timeout of 30 seconds exceeded"));
        });

        req.on('error', (err) => { reject(err); });
        req.end();
    });
}

async function run() {
    console.log("Querying Toledo's profile (t-8umeizyns)...");
    try {
        const result = await makeRequest('GET', `/rest/v1/trainer_profiles?trainer_id=eq.t-8umeizyns&select=trainer_id`);
        console.log("Success! Toledo exists:", result);
    } catch(e) {
        console.error("Failed to query Toledo:", e.message);
    }
}

run().catch(console.error);
