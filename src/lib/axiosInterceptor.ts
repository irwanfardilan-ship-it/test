import axios from 'axios';
import { 
  collection, doc, getDoc, getDocs, setDoc, updateDoc, 
  query, where, orderBy, limit 
} from 'firebase/firestore';
import { db } from './firebase';

export const isDirectFirebaseMode = () => {
  return (
    window.location.hostname.endsWith('.github.io') || 
    localStorage.getItem('direct_firebase') === 'true'
  );
};

// Helper to parse config data regardless of format
const parseData = (data: any) => {
  if (!data) return {};
  if (typeof data === 'string') {
    try {
      return JSON.parse(data);
    } catch (e) {
      return {};
    }
  }
  return data;
};

const handleDirectFirebaseRequest = async (config: any): Promise<any> => {
  const url = config.url || '';
  const method = (config.method || 'GET').toUpperCase();
  const data = parseData(config.data);

  console.log(`[Direct Firebase Adapter] Intercepted ${method} ${url}`, data);

  // 1. POST /api/auth/telegram-manual
  if (url === '/api/auth/telegram-manual' && method === 'POST') {
    const username = (data.username || '').trim();
    const firstName = (data.firstName || '').trim();
    const lastName = (data.lastName || '').trim();

    if (!username || !firstName) {
      throw { status: 400, message: 'Username dan Nama Depan wajib diisi.' };
    }

    const telegramId = `manual_${username.toLowerCase()}`;
    const userRef = doc(db, 'users', telegramId);
    const userSnap = await getDoc(userRef);
    let userDoc: any;

    if (userSnap.exists()) {
      userDoc = userSnap.data();
    } else {
      const role = (username.toLowerCase() === 'irwanfardilan' || username.toLowerCase() === 'admin') 
        ? 'Super Admin' 
        : 'Recruiter';

      userDoc = {
        telegramId,
        username,
        firstName,
        lastName,
        role,
        status: 'Active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      await setDoc(userRef, userDoc);
    }

    localStorage.setItem('direct_firebase_user_id', telegramId);
    return { token: `direct_firebase_token_${telegramId}`, user: userDoc };
  }

  // 2. POST /api/auth/telegram
  if (url === '/api/auth/telegram' && method === 'POST') {
    let telegramId = 'tg_guest';
    let username = 'guest';
    let firstName = 'Guest';
    let lastName = '';

    try {
      const params = new URLSearchParams(data.initData);
      const userStr = params.get('user');
      if (userStr) {
        const parsedUser = JSON.parse(userStr);
        telegramId = String(parsedUser.id);
        username = parsedUser.username || '';
        firstName = parsedUser.first_name || '';
        lastName = parsedUser.last_name || '';
      }
    } catch (e) {
      console.error('Error parsing initData in direct firebase mode:', e);
    }

    const userRef = doc(db, 'users', telegramId);
    const userSnap = await getDoc(userRef);
    let userDoc: any;

    if (userSnap.exists()) {
      userDoc = userSnap.data();
    } else {
      const role = (username.toLowerCase() === 'irwanfardilan' || username.toLowerCase() === 'admin') 
        ? 'Super Admin' 
        : 'Recruiter';

      userDoc = {
        telegramId,
        username,
        firstName,
        lastName,
        role,
        status: 'Active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      await setDoc(userRef, userDoc);
    }

    localStorage.setItem('direct_firebase_user_id', telegramId);
    return { token: `direct_firebase_token_${telegramId}`, user: userDoc };
  }

  // 3. GET /api/me
  if (url === '/api/me' && method === 'GET') {
    const telegramId = localStorage.getItem('direct_firebase_user_id') || 'manual_admin';
    const userRef = doc(db, 'users', telegramId);
    const userSnap = await getDoc(userRef);

    let userData: any;
    if (userSnap.exists()) {
      userData = userSnap.data();
    } else {
      // Auto-create standard fallback user if not found to prevent lock out
      userData = {
        telegramId,
        username: 'admin',
        firstName: 'Irwan Fardilan',
        lastName: '',
        role: 'Super Admin',
        status: 'Active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      await setDoc(userRef, userData);
    }

    // Fetch recruitment application associated with this user
    const appsQuery = query(collection(db, 'applications'), where('telegramId', '==', telegramId));
    const appsSnap = await getDocs(appsQuery);
    let appData: any = null;
    if (!appsSnap.empty) {
      appData = appsSnap.docs[0].data();
    }

    return { user: userData, application: appData };
  }

  // 4. GET /api/stats
  if (url === '/api/stats' && method === 'GET') {
    const appsSnap = await getDocs(collection(db, 'applications'));
    const apps = appsSnap.docs.map(d => d.data());

    const todayStr = new Date().toDateString();
    const todayApplies = apps.filter(app => {
      if (!app.appliedAt) return false;
      return new Date(app.appliedAt).toDateString() === todayStr;
    }).length;

    const weeklyApplies = apps.filter(app => {
      if (!app.appliedAt) return false;
      const diffTime = Math.abs(new Date().getTime() - new Date(app.appliedAt).getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 7;
    }).length;

    const pendingApproval = apps.filter(app => 
      ['Screening', 'Technical Test', 'Interview', 'Final Review'].includes(app.stage)
    ).length;

    const weeklyTarget = 5;
    const approvedThisWeek = apps.filter(app => {
      if (app.stage !== 'Approved') return false;
      const dateToUse = app.updatedAt || app.appliedAt;
      if (!dateToUse) return false;
      const diffTime = Math.abs(new Date().getTime() - new Date(dateToUse).getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 7;
    }).length;

    const weeklyProgress = Math.min(100, Math.round((approvedThisWeek / weeklyTarget) * 100)) || 0;
    const monthlyProgress = Math.min(100, Math.round((apps.filter(app => app.stage === 'Approved').length / 20) * 100)) || 0;

    return {
      todayRecruitment: todayApplies,
      weeklyRecruitment: weeklyApplies,
      pendingApproval,
      performanceScore: 85,
      weeklyTarget,
      weeklyProgress,
      monthlyProgress
    };
  }

  // 5. GET /api/applications
  if (url === '/api/applications' && method === 'GET') {
    const snap = await getDocs(collection(db, 'applications'));
    return snap.docs.map(doc => doc.data());
  }

  // 6. POST /api/register
  if (url === '/api/register' && method === 'POST') {
    const telegramId = localStorage.getItem('direct_firebase_user_id') || 'manual_admin';
    const appRef = doc(db, 'applications', telegramId);
    const appDoc = {
      id: telegramId,
      telegramId,
      fullName: data.fullName,
      email: data.email,
      phone: data.phone,
      position: data.position,
      experience: '1-2 years',
      skills: [data.uid9kucing || '9kucing'],
      uid9kucing: data.uid9kucing || '',
      stage: 'Screening',
      appliedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      notes: '',
      interviewerRating: 5
    };
    await setDoc(appRef, appDoc);

    const logId = `log_${Date.now()}`;
    await setDoc(doc(db, 'logs', logId), {
      id: logId,
      userId: telegramId,
      userName: data.fullName,
      userRole: 'Recruiter',
      action: `Mengirimkan formulir pendaftaran posisi ${data.position}`,
      timestamp: new Date().toISOString()
    });

    return { success: true, application: appDoc };
  }

  // 7. POST /api/applications
  if (url === '/api/applications' && method === 'POST') {
    const id = `app_${Date.now()}`;
    const currentUserTelegramId = localStorage.getItem('direct_firebase_user_id') || 'manual_admin';
    const appRef = doc(db, 'applications', id);

    const appDoc = {
      id,
      telegramId: `manual_applicant_${Date.now()}`,
      fullName: data.fullName,
      email: data.email,
      phone: data.phone,
      position: data.position,
      experience: data.experience || '1-2 years',
      skills: data.skills || [],
      stage: data.stage || 'Screening',
      appliedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      notes: data.notes || '',
      interviewerRating: data.interviewerRating || 5,
      interviewerId: currentUserTelegramId
    };
    await setDoc(appRef, appDoc);

    const logId = `log_${Date.now()}`;
    await setDoc(doc(db, 'logs', logId), {
      id: logId,
      userId: currentUserTelegramId,
      userName: 'Admin/Recruiter',
      action: `Memasukkan data pendaftar baru: ${data.fullName}`,
      timestamp: new Date().toISOString()
    });

    return { success: true, application: appDoc };
  }

  // 8. GET /api/users
  if (url === '/api/users' && method === 'GET') {
    const snap = await getDocs(collection(db, 'users'));
    return snap.docs.map(doc => doc.data());
  }

  // 9. GET /api/announcements
  if (url === '/api/announcements' && method === 'GET') {
    const snap = await getDocs(collection(db, 'announcements'));
    const list = snap.docs.map(doc => doc.data());
    return list.sort((a: any, b: any) => (b.id || '').localeCompare(a.id || ''));
  }

  // 10. GET /api/logs
  if (url === '/api/logs' && method === 'GET') {
    const snap = await getDocs(collection(db, 'logs'));
    const list = snap.docs.map(doc => doc.data());
    return list.sort((a: any, b: any) => (b.timestamp || '').localeCompare(a.timestamp || ''));
  }

  // 11. GET /api/leaderboard
  if (url === '/api/leaderboard' && method === 'GET') {
    const usersSnap = await getDocs(collection(db, 'users'));
    const appsSnap = await getDocs(collection(db, 'applications'));

    const applicants = appsSnap.docs.map(d => d.data());
    const list: any[] = [];

    usersSnap.forEach(uDoc => {
      const userData = uDoc.data();
      const handled = applicants.filter(app => app.interviewerId === userData.telegramId);
      const approved = handled.filter(app => app.stage === 'Approved').length;

      const weeklyCount = handled.filter(app => {
        if (!app.appliedAt) return false;
        const diffTime = Math.abs(new Date().getTime() - new Date(app.appliedAt).getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= 7;
      }).length;

      list.push({
        telegramId: userData.telegramId,
        username: userData.username,
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: userData.role,
        photoUrl: userData.photoUrl,
        processedCount: handled.length,
        approvedCount: approved,
        weeklyCount: weeklyCount,
        salary: approved * 150000 + (handled.length - approved) * 50000,
        streak: weeklyCount >= 3 ? 3 : weeklyCount
      });
    });

    return list.sort((a, b) => b.approvedCount - a.approvedCount);
  }

  // 12. PATCH /api/applications/:id
  if (url.startsWith('/api/applications/') && method === 'PATCH') {
    const id = url.split('/').pop() || '';
    const appRef = doc(db, 'applications', id);

    const updateData: any = {
      updatedAt: new Date().toISOString()
    };
    if (data.stage !== undefined) updateData.stage = data.stage;
    if (data.notes !== undefined) updateData.notes = data.notes;
    if (data.interviewerRating !== undefined) updateData.interviewerRating = data.interviewerRating;

    await updateDoc(appRef, updateData);

    const logId = `log_${Date.now()}`;
    const currentUserTelegramId = localStorage.getItem('direct_firebase_user_id') || 'manual_admin';
    await setDoc(doc(db, 'logs', logId), {
      id: logId,
      userId: currentUserTelegramId,
      userName: 'Admin/Recruiter',
      action: `Memperbarui status berkas lamaran ID ${id} menjadi ${data.stage}`,
      timestamp: new Date().toISOString()
    });

    return { success: true };
  }

  // 13. PATCH /api/users/:id
  if (url.startsWith('/api/users/') && method === 'PATCH') {
    const id = url.split('/').pop() || '';
    const userRef = doc(db, 'users', id);

    const updateData: any = {
      updatedAt: new Date().toISOString()
    };
    if (data.status !== undefined) updateData.status = data.status;
    if (data.role !== undefined) updateData.role = data.role;

    await updateDoc(userRef, updateData);
    return { success: true };
  }

  // 14. POST /api/announcements
  if (url === '/api/announcements' && method === 'POST') {
    const id = `ann_${Date.now()}`;
    const annRef = doc(db, 'announcements', id);

    const annDoc = {
      id,
      title: data.title,
      content: data.content,
      category: data.category,
      important: data.important || false,
      author: 'Admin',
      date: new Date().toLocaleDateString('id-ID')
    };
    await setDoc(annRef, annDoc);

    const logId = `log_${Date.now()}`;
    const currentUserTelegramId = localStorage.getItem('direct_firebase_user_id') || 'manual_admin';
    await setDoc(doc(db, 'logs', logId), {
      id: logId,
      userId: currentUserTelegramId,
      userName: 'Admin',
      action: `Menerbitkan pengumuman baru: ${data.title}`,
      timestamp: new Date().toISOString()
    });

    return { success: true, announcement: annDoc };
  }

  throw { status: 404, message: `Route ${method} ${url} tidak ditemukan.` };
};

// Initialize Axios Request Interceptor for dynamic mock adapter redirection
axios.interceptors.request.use(
  (config) => {
    if (isDirectFirebaseMode() && config.url?.startsWith('/api')) {
      config.adapter = async (cfg: any) => {
        try {
          const resData = await handleDirectFirebaseRequest(cfg);
          return {
            data: resData,
            status: 200,
            statusText: 'OK',
            headers: {},
            config: cfg,
          };
        } catch (err: any) {
          console.error('[Direct Firebase Adapter Error]', err);
          throw {
            response: {
              data: { error: err.message || 'Direct Firebase Operation Failed' },
              status: err.status || 500,
              statusText: 'Error',
              headers: {},
              config: cfg,
            },
          };
        }
      };
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
