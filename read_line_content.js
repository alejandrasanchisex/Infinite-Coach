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

    const targetLines = new Set([5461, 5468, 5471, 5474]);
    let lineIndex = 0;
    for await (const line of rl) {
        lineIndex++;
        if (targetLines.has(lineIndex)) {
            console.log(`\n================ LINE ${lineIndex} ================`);
            const obj = JSON.parse(line);
            console.log("Type:", obj.type);
            console.log("Content:\n", obj.content ? obj.content.substring(0, 3000) : "No text content");
            
            // Check tool calls
            const toolCalls = obj.tool_calls || [];
            toolCalls.forEach(tc => {
                console.log(`\nTool Call: ${tc.name}`);
                console.log("Arguments CodeContent:\n", tc.arguments ? tc.arguments.CodeContent : "No arguments");
            });
        }
    }
}

run().catch(console.error);
