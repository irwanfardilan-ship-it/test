require('dotenv/config');
const { initializeApp, getApps, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const fs = require('fs');

async function test() {
  try {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    initializeApp({
        credential: cert(serviceAccount),
        databaseURL: `https://azurlize-dashboard-team.firebaseio.com`
    });
    const db = getFirestore('ai-studio-azurlizeteam-5be438f7-79ff-4921-92f0-184de94d4966');
    const local = JSON.parse(fs.readFileSync('database.json', 'utf8'));
    
    let count = 0;
    for (const key of Object.keys(local.users)) {
       await db.collection('users').doc(key).set(local.users[key], { merge: true });
       count++;
    }
    console.log(`Migrated ${count} users.`);
    
    count = 0;
    for (const key of Object.keys(local.applications)) {
       await db.collection('applications').doc(key).set(local.applications[key], { merge: true });
       count++;
    }
    console.log(`Migrated ${count} applications.`);
  } catch (err) {
    console.error("Error:", err);
  }
}
test();
