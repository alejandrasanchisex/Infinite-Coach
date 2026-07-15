const https = require('https');
const fs = require('fs');

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
    const result = await makeRequest('GET', `/rest/v1/trainer_profiles?trainer_id=eq.t-8umeizyns&select=full_data`);
    if (result && result.length > 0) {
        const fullData = result[0].full_data || {};
        const logs = fullData.trainingLogs || [];
        console.log(`TOTAL_LOGS_COUNT:${logs.length}`);
        
        // Find logs for week 3
        const week3Logs = logs.filter(l => String(l.week || l.weekIndex) === '3');
        console.log(`WEEK3_LOGS_COUNT:${week3Logs.length}`);
        week3Logs.forEach((l, idx) => {
            if (idx < 20) {
                console.log(`- LOG_W3: client=${l.clientId}, date=${l.date}, day=${l.day || l.dayIndex}, ex=${l.exerciseName || l.exerciseId}`);
            }
        });
    } else {
        console.log("No profile found");
    }
}

run().catch(console.error);
