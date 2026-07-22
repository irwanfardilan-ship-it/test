import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

let firestore: Firestore;

const PROJECT_ID = process.env.FIREBASE_PROJECT_ID || 'azurlize-dashboard-team';
const FIRESTORE_DATABASE_ID = 'ai-studio-azurlizeteam-5be438f7-79ff-4921-92f0-184de94d4966';

try {
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    if (getApps().length === 0) {
      initializeApp({
        credential: cert(serviceAccount),
        databaseURL: `https://${PROJECT_ID}.firebaseio.com`
      });
    }
    firestore = FIRESTORE_DATABASE_ID ? getFirestore(FIRESTORE_DATABASE_ID) : getFirestore();
    console.log('[Database] Initialized Firestore via service account.');
  } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS || process.env.K_SERVICE) {
    if (getApps().length === 0) {
      initializeApp({
        projectId: PROJECT_ID
      });
    }
    firestore = FIRESTORE_DATABASE_ID ? getFirestore(FIRESTORE_DATABASE_ID) : getFirestore();
    console.log('[Database] Initialized Firestore via Application Default Credentials.');
  } else {
    throw new Error('No valid Firebase credentials found.');
  }
} catch (e) {
  console.error('[Database] Failed to initialize Firestore Admin SDK:', e);
  throw e;
}

export const db = {
  // --- USERS ---
  async getUserById(telegramId: string): Promise<any | null> {
    try {
      const doc = await firestore.collection('users').doc(telegramId).get();
      return doc.exists ? doc.data() : null;
    } catch (err) {
      console.error('[Database] Firestore error in getUserById:', err);
      throw err;
    }
  },

  async saveUser(user: any): Promise<void> {
    try {
      await firestore.collection('users').doc(user.telegramId).set(user, { merge: true });
    } catch (err) {
      console.error('[Database] Firestore error in saveUser:', err);
      throw err;
    }
  },

  async getAllUsers(): Promise<any[]> {
    try {
      const snapshot = await firestore.collection('users').get();
      const list: any[] = [];
      snapshot.forEach(doc => {
        list.push(doc.data());
      });
      return list;
    } catch (err) {
      console.error('[Database] Firestore error in getAllUsers:', err);
      throw err;
    }
  },

  // --- APPLICATIONS ---
  async getApplicationById(id: string): Promise<any | null> {
    try {
      const doc = await firestore.collection('applications').doc(id).get();
      return doc.exists ? doc.data() : null;
    } catch (err) {
      console.error('[Database] Firestore error in getApplicationById:', err);
      throw err;
    }
  },

  async getApplicationByTelegramId(telegramId: string): Promise<any | null> {
    try {
      const snapshot = await firestore.collection('applications').where('telegramId', '==', telegramId).limit(1).get();
      if (!snapshot.empty) {
        return snapshot.docs[0].data();
      }
      return null;
    } catch (err) {
      console.error('[Database] Firestore error in getApplicationByTelegramId:', err);
      throw err;
    }
  },

  async saveApplication(app: any): Promise<void> {
    try {
      await firestore.collection('applications').doc(app.id).set(app, { merge: true });
    } catch (err) {
      console.error('[Database] Firestore error in saveApplication:', err);
      throw err;
    }
  },

  async getAllApplications(): Promise<any[]> {
    try {
      const snapshot = await firestore.collection('applications').get();
      const list: any[] = [];
      snapshot.forEach(doc => {
        list.push(doc.data());
      });
      return list;
    } catch (err) {
      console.error('[Database] Firestore error in getAllApplications:', err);
      throw err;
    }
  },

  // --- ANNOUNCEMENTS ---
  async getAllAnnouncements(): Promise<any[]> {
    try {
      const snapshot = await firestore.collection('announcements').orderBy('date', 'desc').get().catch(async () => {
        // Fallback if index not yet generated
        return await firestore.collection('announcements').get();
      });
      const list: any[] = [];
      snapshot.forEach(doc => {
        list.push(doc.data());
      });
      return list;
    } catch (err) {
      console.error('[Database] Firestore error in getAllAnnouncements:', err);
      throw err;
    }
  },

  async saveAnnouncement(ann: any): Promise<any> {
    const id = ann.id || 'ann-' + Date.now();
    const completeAnn = {
      ...ann,
      id,
      date: ann.date || new Date().toLocaleDateString('id-ID')
    };
    try {
      await firestore.collection('announcements').doc(id).set(completeAnn);
      return completeAnn;
    } catch (err) {
      console.error('[Database] Firestore error in saveAnnouncement:', err);
      throw err;
    }
  },

  // --- LOGS ---
  async getAllLogs(): Promise<any[]> {
    try {
      const snapshot = await firestore.collection('logs').orderBy('timestamp', 'desc').limit(100).get().catch(async () => {
        return await firestore.collection('logs').get();
      });
      const list: any[] = [];
      snapshot.forEach(doc => {
        list.push(doc.data());
      });
      return list;
    } catch (err) {
      console.error('[Database] Firestore error in getAllLogs:', err);
      throw err;
    }
  },

  async saveLog(log: any): Promise<any> {
    const id = log.id || 'log-' + Date.now();
    const completeLog = {
      ...log,
      id,
      timestamp: log.timestamp || new Date().toISOString()
    };
    try {
      await firestore.collection('logs').doc(id).set(completeLog);
      return completeLog;
    } catch (err) {
      console.error('[Database] Firestore error in saveLog:', err);
      throw err;
    }
  }
};
