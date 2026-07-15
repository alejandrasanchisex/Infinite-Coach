const fs = require('fs');
const path = require('path');
const readline = require('readline');

async function run() {
    const transcriptPath = path.join('C:', 'Users', 'usuario', '.gemini', 'antigravity', 'brain', '220f53f9-6dfd-49b6-90bc-ebd0af9a1c2e', '.system_generated', 'logs', 'transcript.jsonl');
    if (!fs.existsSync(transcriptPath)) {
        console.log("Transcript not found at:", transcriptPath);
        return;
    }

    const fileStream = fs.createReadStream(transcriptPath);
    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });

    let lineIndex = 0;
    console.log("Searching transcript lines containing 't-w0iybl7qb' or 'backup'...");
    for await (const line of rl) {
        lineIndex++;
        if (line.includes('t-w0iybl7qb') || line.includes('backup')) {
            const obj = JSON.parse(line);
            console.log(`Line ${lineIndex}: type=${obj.type}, status=${obj.status}`);
            if (obj.tool_calls) {
                obj.tool_calls.forEach(tc => {
                    console.log(`  Tool: ${tc.name}`);
                    const argsStr = tc.arguments ? JSON.stringify(tc.arguments) : "";
                    if (argsStr) {
                        console.log(`  Args: ${argsStr.substring(0, 300)}`);
                    }
                });
            }
        }
    }
}

run().catch(console.error);
