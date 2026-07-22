require('dotenv/config');
const { initializeApp, getApps, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

async function test() {
  try {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    initializeApp({
        credential: cert(serviceAccount),
        databaseURL: `https://azurlize-dashboard-team.firebaseio.com`
    });
    const db = getFirestore('ai-studio-azurlizeteam-5be438f7-79ff-4921-92f0-184de94d4966');
    const snapshot = await db.collection('users').get();
    console.log("Found users in Firestore:", snapshot.size);
  } catch (err) {
    console.error("Error:", err);
  }
}
test();
