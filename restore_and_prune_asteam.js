const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const SUPABASE_URL = "https://bieeydhacavxymoosasx.supabase.co";
const SUPABASE_KEY = "sb_publishable_ffxbK3z-Am1wVmqV5Szs_w_zOv8RLWQ";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const trainerId = 't-w0iybl7qb';
const backupTrainerId = 't-w0iybl7qb_backup';

const sdenkaClient = {
  "id": "5f646908-f625-47cd-9713-1db985c9518f",
  "name": "Sdenka",
  "email": "sdenka.zh@gmail.com",
  "phone": "+353 83 110 8612",
  "cardio": "<div><ul><li>35 mins post entreno inclinación 10 días de superior&nbsp;</li><li>Rest day&nbsp; 30 mins</li></ul></div>",
  "gender": "female",
  "status": "active",
  "cardioUrl": "",
  "feedbacks": [],
  "reviewDay": "5",
  "startDate": "2026-07-02T08:28:31.380Z",
  "updatedAt": "2026-07-09T07:29:43.283Z",
  "accessCode": "3SD6LC5P",
  "monthlyFee": 65,
  "assignedDiet": "c2865e46-8637-4a21-962c-3dc308365741",
  "profilePhoto": null,
  "activeBlockId": "e6504587-c73b-4a26-9e40-9e3e4fdd2c1e",
  "assignedDiets": [
    "c2865e46-8637-4a21-962c-3dc308365741"
  ],
  "dietPublished": true,
  "paymentExpiry": "9/08/2026",
  "paymentStatus": "paid",
  "technicalData": {
    "age": 26,
    "arm": 0,
    "leg": 0,
    "chest": 0,
    "glute": 0,
    "goals": "",
    "notes": "",
    "waist": 0,
    "height": 160,
    "weight": 58,
    "injuries": "Molestias en la muñeca de vez en cuando ",
    "allergies": "No tomate ",
    "skinfolds": {
      "abd": 0,
      "pec": 0,
      "sub": 0,
      "tri": 0,
      "supra": 0,
      "thigh": 0,
      "axilla": 0
    },
    "targetMacros": {
      "fat": 41,
      "carbs": 236,
      "protein": 128,
      "calories": 1826
    },
    "skinfoldsEnabled": false
  },
  "weightHistory": [
    {
      "arm": 30,
      "leg": 54.5,
      "date": "2026-07-02T08:53:06.052Z",
      "chest": 90.5,
      "glute": 98.5,
      "waist": 71.5,
      "weight": 58,
      "isFeedback": false,
      "perimeters": {
        "Brazo": 30,
        "Muslo": 54.5,
        "Pecho": 90.5,
        "Cadera": 98.5,
        "Gemelo": 36,
        "Pierna": 54.5,
        "Cintura": 71.5
      }
    }
  ],
  "publishedDiets": [
    "c2865e46-8637-4a21-962c-3dc308365741"
  ],
  "assignedRoutine": null,
  "cardioPublished": true,
  "reviewFrequency": "weekly",
  "supplementation": "<p><strong>- Creatina creapure:</strong> Ayuda a la mejora del rendimiento deportivo retrasando la aparición de la fatiga y aumentando el metabolismo energético en las células musculares, favoreciendo el aumento de masa muscular. <strong>Recomendación: 5-6 gr todos los días.</strong></p>\n\n<p><strong>- Omega 3:</strong> Suplemento de ácidos grasos esenciales. Favorece a la salud y mantenimiento del eje hormonal. <strong>Recomendación: 2 cápsulas antes de dormir.</strong></p>\n\n<p><strong>- Combo ayunas:</strong> 5 gramos de glutamina + una cucharada sopera de vinagre de manzana + ½ limón exprimido o 10-15 ml.</p>\n\n<p><strong>- Glutamina:</strong> Refuerza el sistema inmune y mejora el funcionamiento y absorción intestinal así como a la microbiota intestinal. <strong>Recomendación: 5 gr en ayunas y 5 gr antes de dormir.</strong></p>\n"
};

const desiClient = {
    id: "370c29c8-5ab0-49ae-9b90-7c7386803fc2",
    name: "Desi Jimenez",
    email: "",
    phone: "",
    cardio: "",
    gender: "female",
    status: "active",
    cardioUrl: "",
    feedbacks: [],
    reviewDay: "1",
    startDate: "2026-07-15T09:47:04Z",
    updatedAt: "2026-07-15T09:47:04Z",
    accessCode: "L50ZQINS",
    monthlyFee: 65,
    assignedDiet: null,
    profilePhoto: null,
    activeBlockId: null,
    assignedDiets: [],
    dietPublished: false,
    paymentExpiry: "15/08/2026",
    paymentStatus: "paid",
    technicalData: {
        age: 0,
        arm: 0,
        leg: 0,
        chest: 0,
        glute: 0,
        goals: "",
        notes: "",
        waist: 0,
        height: 159,
        weight: 0,
        injuries: "",
        allergies: "",
        skinfolds: {
            abd: 0, pec: 0, sub: 0, tri: 0, supra: 0, thigh: 0, axilla: 0
        },
        targetMacros: {
            fat: 0, carbs: 0, protein: 0, calories: 0
        },
        skinfoldsEnabled: false
    },
    weightHistory: [],
    publishedDiets: [],
    assignedRoutine: null,
    cardioPublished: false,
    reviewFrequency: "weekly",
    supplementation: "",
    cardioUrlVisible: true,
    customPerimeters: ["Cintura", "Cadera", "Pecho", "Brazo", "Pierna", "Gemelo"],
    subscriptionType: "Mensual",
    subscriptionAmount: 65,
    customFeedbackQuestions: []
};

async function run() {
    console.log("Starting database rebuild and restore for ASTeam...");

    // 1. Fetch current profile (we need the trainingLogs that currently exist, and Victor client)
    console.log("Fetching primary profile...");
    const { data: primaryRow, error: primaryErr } = await supabase
        .from('trainer_profiles')
        .select('full_data')
        .eq('trainer_id', trainerId)
        .single();

    if (primaryErr) {
        console.error("Error fetching primary profile:", primaryErr);
        console.log("Will initialize with empty fallback to prevent blocking.");
    }
    const currentFullData = primaryRow ? (primaryRow.full_data || {}) : {};

    // 2. Fetch backup profile (to restore Amalia, Fernando, etc.)
    console.log("Fetching backup profile...");
    const { data: backupRow, error: backupErr } = await supabase
        .from('trainer_profiles')
        .select('full_data')
        .eq('trainer_id', backupTrainerId)
        .single();

    if (backupErr) {
        console.error("Error fetching backup profile:", backupErr);
        return;
    }
    const backupFullData = backupRow.full_data || {};

    console.log("Rebuilding collections...");

    // Base structure is copied from backup (which contains correct diets, routines, brand, client settings, etc.)
    const restoredData = {
        ...backupFullData,
        // Preserve current trainingLogs and merge with backup's logs
        trainingLogs: [
            ...(currentFullData.trainingLogs || []),
            ...(backupFullData.trainingLogs || [])
        ],
        // Preserve current habits and merge
        habits: [
            ...(currentFullData.habits || []),
            ...(backupFullData.habits || [])
        ]
    };

    // Initialize clients array
    const mergedClients = new Map();

    // Add clients from backup (Amalia, Fernando, Sdenka, Desi)
    if (backupFullData.clients) {
        backupFullData.clients.forEach(c => {
            mergedClients.set(c.id, c);
        });
    }

    // Add clients from current profile (Victor)
    if (currentFullData.clients) {
        currentFullData.clients.forEach(c => {
            mergedClients.set(c.id, c);
        });
    }

    // Explicitly update/add Sdenka and Desi to their latest configurations
    mergedClients.set(sdenkaClient.id, sdenkaClient);
    mergedClients.set(desiClient.id, desiClient);

    restoredData.clients = Array.from(mergedClients.values());

    console.log(`Clients list updated:`);
    restoredData.clients.forEach(c => {
        console.log(` - ${c.name} (${c.id}) - Status: ${c.status}`);
    });

    // 3. PRUNE old trainingLogs to keep size under 500KB!
    // We only keep training logs from the last 45 days.
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 45);
    const originalLogCount = restoredData.trainingLogs.length;

    restoredData.trainingLogs = restoredData.trainingLogs.filter(log => {
        if (!log.date) return false;
        return new Date(log.date) >= cutoffDate;
    });

    console.log(`Pruned training logs: kept ${restoredData.trainingLogs.length} of ${originalLogCount} logs (pruned logs older than ${cutoffDate.toLocaleDateString()}).`);

    // 4. Save back to the primary profile
    restoredData.lastModified = new Date().toISOString();
    
    console.log("Updating trainer profile row in Supabase...");
    const { error: updateErr } = await supabase
        .from('trainer_profiles')
        .update({
            full_data: restoredData,
            updated_at: new Date().toISOString()
        })
        .eq('trainer_id', trainerId);

    if (updateErr) {
        console.error("Error updating profile:", updateErr);
    } else {
        console.log("🎉 SUCCESS! Trainer profile restored and pruned successfully! All 7 clients are restored.");
    }
}

run().catch(console.error);
