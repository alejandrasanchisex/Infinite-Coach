const fs = require('fs');
const https = require('https');
const path = require('path');

const images = {
    "bagel-pavo-pro.jpg": "A sliced whole wheat bagel filled with sliced turkey breast and light cream cheese, on a pure white marble table, top-down view, professional food photography, minimalist, bright",
    "hummus-toast-pro.jpg": "A slice of toasted whole wheat bread generously spread with hummus, topped with sliced hard-boiled egg and sprinkled with paprika, on a pure white marble table, top-down view, professional food photography, minimalist",
    "muffins-huevo-pro.jpg": "Three healthy baked egg muffins containing minced turkey, chopped vegetables, and sweet potato, placed on a white ceramic plate over a pure white marble table, top-down view, professional food photography, breakfast",
    "bowl-antiox-pro.jpg": "A bowl of natural yogurt topped with fresh raspberries and pumpkin seeds, on a pure white marble table, top-down view, professional food photography, bright, clean, minimalist",
    "sandwich-atun-pro.jpg": "A sandwich made with whole wheat bread, filled with natural canned tuna and light mayonnaise, cut in half, placed on a pure white marble table, top-down view, professional food photography",
    "copa-requeson-miel-pro.jpg": "A glass cup filled with layers of cottage cheese, drizzled with honey, and topped with crushed pistachios, resting on a pure white marble table, top-down view, professional food photography",
    "smoothie-verde-pro.jpg": "A vibrant green smoothie bowl made with spinach, green apple, vanilla protein, and topped with chia seeds, served in a clean white bowl on a pure white marble table, top-down view, professional food photography",
    "pasta-bolonesa-real-pro.jpg": "A plate of whole wheat pasta topped with a rich minced beef and tomato bolognese sauce, NO MEATBALLS, garnished with herbs, on a pure white marble table, top-down view, professional food photography",
    "salmon-quinoa-pro.jpg": "A beautifully plated dish with a piece of grilled salmon resting on a bed of fluffy quinoa, accompanied by steamed asparagus, on a pure white marble table, top-down view, professional food photography",
    "ensalada-garbanzos-real-pro.jpg": "A fresh chickpea salad with tuna and olives, served in a white bowl on a pure white marble table, top-down view, professional food photography, bright and clean",
    "pollo-batata-real-pro.jpg": "Grilled chicken breast sliced, served with roasted sweet potato cubes, drizzled with olive oil, on a pure white marble table, top-down view, professional food photography"
};

const baseUrl = "https://image.pollinations.ai/prompt/";
const outputDir = path.join(__dirname, "public", "img");

async function downloadImage(filename, prompt) {
    return new Promise((resolve, reject) => {
        const encodedPrompt = encodeURIComponent(prompt);
        const url = `${baseUrl}${encodedPrompt}?width=800&height=800&nologo=true`;
        const filepath = path.join(outputDir, filename);
        
        console.log(`Downloading ${filename}...`);
        
        https.get(url, (res) => {
            if (res.statusCode === 301 || res.statusCode === 302) {
                https.get(res.headers.location, (redirectRes) => {
                    const fileStream = fs.createWriteStream(filepath);
                    redirectRes.pipe(fileStream);
                    fileStream.on('finish', () => {
                        fileStream.close();
                        console.log(`Success: ${filename}`);
                        resolve();
                    });
                }).on('error', reject);
            } else {
                const fileStream = fs.createWriteStream(filepath);
                res.pipe(fileStream);
                fileStream.on('finish', () => {
                    fileStream.close();
                    console.log(`Success: ${filename}`);
                    resolve();
                });
            }
        }).on('error', reject);
    });
}

async function run() {
    for (const [filename, prompt] of Object.entries(images)) {
        try {
            await downloadImage(filename, prompt);
        } catch (e) {
            console.error(`Failed to download ${filename}:`, e);
        }
    }
    console.log("Done.");
}

run();
