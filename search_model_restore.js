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
    console.log("Searching transcript for restore scripts or client lists...");
    for await (const line of rl) {
        lineIndex++;
        const obj = JSON.parse(line);
        
        if (obj.type === 'PLANNER_RESPONSE') {
            const content = obj.content || "";
            const toolCalls = obj.tool_calls || [];
            
            // Check if tool calls write a javascript file containing client names
            toolCalls.forEach(tc => {
                if (tc.name === 'write_to_file') {
                    const args = tc.arguments || {};
                    const fileContent = args.CodeContent || "";
                    if (fileContent.includes('Amalia') || fileContent.includes('Sdenka') || fileContent.includes('Desi')) {
                        console.log(`\nLine ${lineIndex}: Tool write_to_file to ${args.TargetFile}`);
                        console.log(fileContent.substring(0, 1000));
                        console.log("-----------------------------------------");
                    }
                }
            });
        }
    }
}

run().catch(console.error);
