const fs = require('fs');
const path = require('path');
const readline = require('readline');

async function run() {
    const transcriptPath = path.join('C:', 'Users', 'usuario', '.gemini', 'antigravity', 'brain', '220f53f9-6dfd-49b6-90bc-ebd0af9a1c2e', '.system_generated', 'logs', 'transcript_full.jsonl');
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
    console.log("Searching transcript for Victor (055e1302-b194-433c-85cd-c0f11d9632ca) details...");
    for await (const line of rl) {
        lineIndex++;
        if (line.includes('055e1302-b194-433c-85cd-c0f11d9632ca') || line.includes('055e1302-b194')) {
            console.log(`\nLine ${lineIndex}:`);
            const obj = JSON.parse(line);
            const content = obj.content || "";
            const lines = content.split('\n');
            lines.forEach(l => {
                if (l.includes('055e1302-b194') || l.includes('Victor') || l.includes('client')) {
                    console.log(`  > ${l.substring(0, 300)}`);
                }
            });
            
            // Check tool calls
            const toolCalls = obj.tool_calls || [];
            toolCalls.forEach(tc => {
                const argsStr = JSON.stringify(tc.arguments || {});
                if (argsStr.includes('055e1302-b194')) {
                    console.log(`  [Tool ${tc.name}]: ${argsStr.substring(0, 1500)}`);
                }
            });
        }
    }
}

run().catch(console.error);
