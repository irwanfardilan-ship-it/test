import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';

let firestore: admin.firestore.Firestore | null = null;
let useLocalDb = true;

const PROJECT_ID = process.env.FIREBASE_PROJECT_ID || 'azurlize-dashboard-team';
const FIRESTORE_DATABASE_ID = 'ai-studio-azurlizeteam-5be438f7-79ff-4921-92f0-184de94d4966';

try {
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: `https://${PROJECT_ID}.firebaseio.com`
    });
    firestore = admin.firestore();
    if (FIRESTORE_DATABASE_ID) {
      firestore = admin.firestore(FIRESTORE_DATABASE_ID);
    }
    useLocalDb = false;
    console.log('[Database] Initialized Firestore via service account.');
  } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS || process.env.K_SERVICE) {
    admin.initializeApp({
      projectId: PROJECT_ID
    });
    firestore = admin.firestore();
    if (FIRESTORE_DATABASE_ID) {
      firestore = admin.firestore(FIRESTORE_DATABASE_ID);
    }
    useLocalDb = false;
    console.log('[Database] Initialized Firestore via Application Default Credentials.');
  } else {
    console.log('[Database] No Firestore credentials found. Running in Local DB (database.json) mode.');
  }
} catch (e) {
  console.error('[Database] Failed to initialize Firestore Admin SDK:', e);
  console.log('[Database] Falling back to Local DB (database.json) mode.');
}

const LOCAL_DB_PATH = path.join(process.cwd(), 'database.json');

function readLocalDb() {
  try {
    if (fs.existsSync(LOCAL_DB_PATH)) {
      const raw = fs.readFileSync(LOCAL_DB_PATH, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('[LocalDB] Error reading database.json:', e);
  }
  return { users: {}, applications: {}, announcements: [], logs: [], settings: { weeklyTarget: 5, monthlyTarget: 20 } };
}

function writeLocalDb(data: any) {
  try {
    fs.writeFileSync(LOCAL_DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch (e) {
    console.error('[LocalDB] Error writing database.json:', e);
  }
}

export const db = {
  // --- USERS ---
  async getUserById(telegramId: string): Promise<any | null> {
    if (!useLocalDb && firestore) {
      const doc = await firestore.collection('users').doc(telegramId).get();
      return doc.exists ? doc.data() : null;
    } else {
      const local = readLocalDb();
      return local.users[telegramId] || null;
    }
  },

  async saveUser(user: any): Promise<void> {
    if (!useLocalDb && firestore) {
      await firestore.collection('users').doc(user.telegramId).set(user, { merge: true });
    } else {
      const local = readLocalDb();
      local.users[user.telegramId] = user;
      writeLocalDb(local);
    }
  },

  async getAllUsers(): Promise<any[]> {
    if (!useLocalDb && firestore) {
      const snapshot = await firestore.collection('users').get();
      const list: any[] = [];
      snapshot.forEach(doc => {
        list.push(doc.data());
      });
      return list;
    } else {
      const local = readLocalDb();
      return Object.values(local.users);
    }
  },

  // --- APPLICATIONS ---
  async getApplicationById(id: string): Promise<any | null> {
    if (!useLocalDb && firestore) {
      const doc = await firestore.collection('applications').doc(id).get();
      return doc.exists ? doc.data() : null;
    } else {
      const local = readLocalDb();
      return local.applications[id] || null;
    }
  },

  async getApplicationByTelegramId(telegramId: string): Promise<any | null> {
    if (!useLocalDb && firestore) {
      const snapshot = await firestore.collection('applications').where('telegramId', '==', telegramId).limit(1).get();
      if (!snapshot.empty) {
        return snapshot.docs[0].data();
      }
      return null;
    } else {
      const local = readLocalDb();
      const match = Object.values(local.applications).find((app: any) => app.telegramId === telegramId);
      return match || null;
    }
  },

  async saveApplication(app: any): Promise<void> {
    if (!useLocalDb && firestore) {
      await firestore.collection('applications').doc(app.id).set(app, { merge: true });
    } else {
      const local = readLocalDb();
      local.applications[app.id] = app;
      writeLocalDb(local);
    }
  },

  async getAllApplications(): Promise<any[]> {
    if (!useLocalDb && firestore) {
      const snapshot = await firestore.collection('applications').get();
      const list: any[] = [];
      snapshot.forEach(doc => {
        list.push(doc.data());
      });
      return list;
    } else {
      const local = readLocalDb();
      return Object.values(local.applications);
    }
  },

  // --- ANNOUNCEMENTS ---
  async getAllAnnouncements(): Promise<any[]> {
    if (!useLocalDb && firestore) {
      const snapshot = await firestore.collection('announcements').orderBy('date', 'desc').get().catch(async () => {
        // Fallback if index not yet generated
        return await firestore!.collection('announcements').get();
      });
      const list: any[] = [];
      snapshot.forEach(doc => {
        list.push(doc.data());
      });
      return list;
    } else {
      const local = readLocalDb();
      return local.announcements || [];
    }
  },

  async saveAnnouncement(ann: any): Promise<any> {
    const id = ann.id || 'ann-' + Date.now();
    const completeAnn = {
      ...ann,
      id,
      date: ann.date || new Date().toLocaleDateString('id-ID')
    };

    if (!useLocalDb && firestore) {
      await firestore.collection('announcements').doc(id).set(completeAnn);
    } else {
      const local = readLocalDb();
      if (!local.announcements) local.announcements = [];
      local.announcements.unshift(completeAnn);
      writeLocalDb(local);
    }
    return completeAnn;
  },

  // --- LOGS ---
  async getAllLogs(): Promise<any[]> {
    if (!useLocalDb && firestore) {
      const snapshot = await firestore.collection('logs').orderBy('timestamp', 'desc').limit(100).get().catch(async () => {
        return await firestore!.collection('logs').get();
      });
      const list: any[] = [];
      snapshot.forEach(doc => {
        list.push(doc.data());
      });
      return list;
    } else {
      const local = readLocalDb();
      return local.logs || [];
    }
  },

  async saveLog(log: any): Promise<any> {
    const id = log.id || 'log-' + Date.now();
    const completeLog = {
      ...log,
      id,
      timestamp: log.timestamp || new Date().toISOString()
    };

    if (!useLocalDb && firestore) {
      await firestore.collection('logs').doc(id).set(completeLog);
    } else {
      const local = readLocalDb();
      if (!local.logs) local.logs = [];
      local.logs.unshift(completeLog);
      writeLocalDb(local);
    }
    return completeLog;
  }
};
