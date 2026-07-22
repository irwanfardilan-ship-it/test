const { initializeApp, getApps } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

async function test() {
  try {
    initializeApp(); // Use ADC project ID
    const db = getFirestore('ai-studio-azurlizeteam-5be438f7-79ff-4921-92f0-184de94d4966');
    const snapshot = await db.collection('users').get();
    console.log("Found users in Firestore:", snapshot.size);
  } catch (err) {
    console.error("Error:", err);
  }
}
test();
