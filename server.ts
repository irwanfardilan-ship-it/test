/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { createServer as createViteServer } from 'vite';
import { db } from './server/db';
import { FirestoreApplicationRepository } from './server/infrastructure/database/FirestoreApplicationRepository';
import { FirestoreLogRepository } from './server/infrastructure/database/FirestoreLogRepository';
import { FirestoreAnnouncementRepository } from './server/infrastructure/database/FirestoreAnnouncementRepository';
import { User, Application, UserRole, UserStatus } from './src/types';

// Clean Architecture Module Imports
import { FirestoreUserRepository } from './server/infrastructure/database/FirestoreUserRepository';
import { TelegramSecurityService } from './server/infrastructure/security/TelegramSecurityService';
import { JwtTokenProvider } from './server/infrastructure/security/JwtTokenProvider';
import { AuthenticateUserUseCase } from './server/core/usecases/AuthenticateUserUseCase';
import { ConnectTelegramManualUseCase } from './server/core/usecases/ConnectTelegramManualUseCase';
import { AuthController as CleanAuthController } from './server/presentation/controllers/AuthController';

const app = express();
const PORT = 3000;

// Trust reverse proxy for rate limiter to function correctly
app.set('trust proxy', 1);
const JWT_SECRET = process.env.JWT_SECRET || 'azurlize-recruitment-secret-jwt-key-2026';
const BOT_TOKEN = process.env.BOT_TOKEN || '';

// Clean Architecture Dependency Injection
const cleanUserRepository = new FirestoreUserRepository();
const cleanTelegramVerifier = new TelegramSecurityService(BOT_TOKEN);
const cleanJwtService = new JwtTokenProvider(JWT_SECRET, '7d');
const cleanAuthenticateUseCase = new AuthenticateUserUseCase(
  cleanUserRepository,
  cleanTelegramVerifier,
  cleanJwtService,
  !!BOT_TOKEN
);
const cleanConnectManualUseCase = new ConnectTelegramManualUseCase(
  cleanUserRepository,
  cleanJwtService
);
const firestoreAppRepo = new FirestoreApplicationRepository();
const firestoreLogRepo = new FirestoreLogRepository();
const firestoreAnnRepo = new FirestoreAnnouncementRepository();

const cleanAuthController = new CleanAuthController(
  cleanAuthenticateUseCase,
  cleanConnectManualUseCase
);

// Middlewares
app.use(cors({ origin: true, credentials: true }));

// Express body parser
app.use(express.json());

// Content Security Policy setup via helmet to allow unsplash images, vite websockets, etc.
app.use(helmet({
  contentSecurityPolicy: false, // Turn off strict CSP in iframe dev environment to allow hot-reloading and iframe previews
  crossOriginEmbedderPolicy: false,
}));

// Rate limiter: 300 requests per 15 minutes per IP
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Terlalu banyak permintaan dari IP ini, silakan coba lagi nanti.' }
});
app.use('/api/', apiLimiter);

// Verification Helper
function verifyTelegramHash(initData: string, botToken: string): boolean {
  if (!initData || !botToken) return false;
  try {
    const urlParams = new URLSearchParams(initData);
    const hash = urlParams.get('hash');
    if (!hash) return false;

    // Filter out hash and sort
    const keys = Array.from(urlParams.keys()).filter(k => k !== 'hash').sort();
    const dataCheckString = keys.map(k => `${k}=${urlParams.get(k)}`).join('\n');

    // Calculate HMAC-SHA256
    const secretKey = crypto.createHmac('sha256', 'WebAppData').update(botToken).digest();
    const hmac = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');

    return hmac === hash;
  } catch (e) {
    console.error('Error verifying Telegram hash:', e);
    return false;
  }
}

// Typings for authorized request
interface AuthRequest extends Request {
  user?: {
    telegramId: string;
    username?: string;
    role: UserRole;
    status: UserStatus;
  };
}

// Authentication Middleware
function authenticateToken(req: AuthRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ error: 'Token otentikasi diperlukan.' });
    return;
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      res.status(403).json({ error: 'Token kadaluwarsa atau tidak valid.' });
      return;
    }
    req.user = user as AuthRequest['user'];
    next();
  });
}

// Role Middleware Guard
function requireRoles(roles: UserRole[]) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Tidak diotorisasi.' });
      return;
    }
    if (!roles.includes(req.user.role)) {
      res.status(403).json({ error: 'Akses ditolak. Peran Anda tidak memiliki izin untuk tindakan ini.' });
      return;
    }
    next();
  };
}

/// API ROUTE: Telegram Authentication
app.post('/api/auth/telegram', cleanAuthController.handleTelegramAuth);
app.post('/api/auth/telegram-manual', cleanAuthController.handleTelegramManual);

// API ROUTE: Get Profile
app.get('/api/me', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ error: 'Tidak diotorisasi.' });
    return;
  }
  try {
    const userEntity = await cleanUserRepository.getById(req.user.telegramId);
    if (!userEntity) {
      res.status(404).json({ error: 'Pengguna tidak ditemukan.' });
      return;
    }

    const user = userEntity.toJSON();
    const application = await firestoreAppRepo.getByTelegramId(req.user.telegramId);
    res.json({ user, application });
  } catch (err: any) {
    console.error('Error fetching user profile in /api/me:', err);
    res.status(500).json({ error: 'Gagal memuat profil pengguna.' });
  }
});

// API ROUTE: Submit Recruitment Application (Self Register)
app.post('/api/register', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ error: 'Tidak diotorisasi.' });
    return;
  }

  const { fullName, email, phone, position, experience, portfolioUrl, githubUrl, skills, uid9kucing } = req.body;

  if (!fullName || !email || !phone || !position) {
    res.status(400).json({ error: 'Mohon isi semua data wajib pendaftaran.' });
    return;
  }

  // Save Application
  const appId = 'app-' + Date.now();
  const newApp: Application = {
    id: appId,
    telegramId: req.user.telegramId,
    fullName,
    email,
    phone,
    position,
    experience: experience || 'Not specified',
    portfolioUrl: portfolioUrl || '',
    githubUrl: githubUrl || '',
    skills: Array.isArray(skills) ? skills : [],
    stage: 'Screening',
    appliedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    notes: uid9kucing ? `UID 9kucing: ${uid9kucing}` : ''
  };

  await firestoreAppRepo.save(newApp);

  // Update user status to Pending (or reset if previously Rejected but applying again)
  const userEntity = await cleanUserRepository.getById(req.user.telegramId);
  if (userEntity) {
    userEntity.updateStatus('Pending');
    await cleanUserRepository.save(userEntity);

    await firestoreLogRepo.save({
      userId: userEntity.telegramId,
      userName: `${userEntity.firstName} ${userEntity.lastName || ''}`.trim(),
      userRole: userEntity.role,
      action: `Mengajukan lamaran baru untuk posisi ${position}`,
      targetId: appId,
      targetName: fullName
    });
  }

  res.json({ message: 'Lamaran Anda berhasil diajukan.', application: newApp });
});

// API ROUTE: Get All Applications (Recruiters & Admins)
app.get('/api/applications', authenticateToken, requireRoles(['Super Admin', 'Admin', 'Recruiter']), async (req: AuthRequest, res: Response): Promise<void> => {
  const applications = await firestoreAppRepo.getAll();
  res.json(applications);
});

// API ROUTE: Get Application Details
app.get('/api/applications/:id', authenticateToken, requireRoles(['Super Admin', 'Admin', 'Recruiter']), async (req: AuthRequest, res: Response): Promise<void> => {
  const application = await firestoreAppRepo.getById(req.params.id);
  if (!application) {
    res.status(404).json({ error: 'Lamaran tidak ditemukan.' });
    return;
  }
  res.json(application);
});

// API ROUTE: Create a New Application/Data Harian (Recruiters & Admins)
app.post('/api/applications', authenticateToken, requireRoles(['Super Admin', 'Admin', 'Recruiter']), async (req: AuthRequest, res: Response): Promise<void> => {
  const { fullName, email, phone, position, experience, skills, stage, notes, interviewerRating } = req.body;

  if (!fullName || !email || !phone || !position || !experience) {
    res.status(400).json({ error: 'Mohon isi semua data wajib.' });
    return;
  }

  const appId = 'app-' + Date.now();
  const operatorEntity = await cleanUserRepository.getById(req.user!.telegramId);
  const operator = operatorEntity ? operatorEntity.toJSON() : null;
  if (!operator) {
    res.status(404).json({ error: 'Operator tidak ditemukan.' });
    return;
  }

  const newApp: Application = {
    id: appId,
    telegramId: 'manual-' + Date.now(),
    fullName,
    email,
    phone,
    position,
    experience,
    skills: Array.isArray(skills) ? skills : [],
    stage: stage || 'Screening',
    appliedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    notes: notes || '',
    interviewerRating: interviewerRating || 5,
    interviewerId: operator.telegramId,
    interviewerName: `${operator.firstName} ${operator.lastName || ''}`.trim()
  };

  await firestoreAppRepo.save(newApp);

  await firestoreLogRepo.save({
    userId: operator.telegramId,
    userName: `${operator.firstName} ${operator.lastName || ''}`.trim(),
    userRole: operator.role,
    action: `Input Data Harian baru: ${fullName} untuk posisi ${position}`,
    targetId: appId,
    targetName: fullName
  });

  res.json({ message: 'Data Harian berhasil diinput.', application: newApp });
});

// API ROUTE: Patch Application Stage & Notes (Recruiters & Admins)
app.patch('/api/applications/:id', authenticateToken, requireRoles(['Super Admin', 'Admin', 'Recruiter']), async (req: AuthRequest, res: Response): Promise<void> => {
  const appToUpdate = await firestoreAppRepo.getById(req.params.id);
  if (!appToUpdate) {
    res.status(404).json({ error: 'Lamaran tidak ditemukan.' });
    return;
  }

  const { stage, notes, interviewerRating } = req.body;
  const operatorEntity = await cleanUserRepository.getById(req.user!.telegramId);
  const operator = operatorEntity ? operatorEntity.toJSON() : null;
  if (!operator) {
    res.status(404).json({ error: 'Operator tidak ditemukan.' });
    return;
  }

  if (stage) if(appToUpdate) appToUpdate.stage = stage;
  if (notes !== undefined) if(appToUpdate) appToUpdate.notes = notes;
  if (interviewerRating !== undefined) if(appToUpdate) appToUpdate.interviewerRating = interviewerRating;
  
  if(appToUpdate) appToUpdate.interviewerId = operator.telegramId;
  if(appToUpdate) appToUpdate.interviewerName = `${operator.firstName} ${operator.lastName || ''}`.trim();
  if(appToUpdate) appToUpdate.updatedAt = new Date().toISOString();

  await firestoreAppRepo.save(appToUpdate);

  // Auto sync user status based on Recruitment Stage decision
  if (stage === 'Approved') {
    const targetUserEntity = await cleanUserRepository.getById(appToUpdate.telegramId);
    if (targetUserEntity) {
      targetUserEntity.updateStatus('Active');
      await cleanUserRepository.save(targetUserEntity);
    }
  } else if (stage === 'Rejected') {
    const targetUserEntity = await cleanUserRepository.getById(appToUpdate.telegramId);
    if (targetUserEntity) {
      targetUserEntity.updateStatus('Rejected', 'Hasil evaluasi teknis belum sesuai.');
      await cleanUserRepository.save(targetUserEntity);
    }
  }

  await firestoreLogRepo.save({
    userId: operator.telegramId,
    userName: `${operator.firstName} ${operator.lastName || ''}`.trim(),
    userRole: operator.role,
    action: `Memperbarui tahap lamaran ${appToUpdate.fullName} menjadi ${stage}`,
    targetId: appToUpdate.id,
    targetName: appToUpdate.fullName
  });

  res.json(appToUpdate);
});

// API ROUTE: Get All Users (Admins only)
app.get('/api/users', authenticateToken, requireRoles(['Super Admin', 'Admin']), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const users = await cleanUserRepository.getAll();
    res.json(users.map(u => u.toJSON()));
  } catch (err) {
    res.status(500).json({ error: 'Gagal mengambil data pengguna.' });
  }
});

// API ROUTE: Patch User Status / Role (Admins and Super Admins)
app.patch('/api/users/:telegramId', authenticateToken, requireRoles(['Super Admin', 'Admin']), async (req: AuthRequest, res: Response): Promise<void> => {
  const targetId = req.params.telegramId;
  const targetUserEntity = await cleanUserRepository.getById(targetId);
  if (!targetUserEntity) {
    res.status(404).json({ error: 'Pengguna tidak ditemukan.' });
    return;
  }

  const { status, role, reason } = req.body;
  const operatorEntity = await cleanUserRepository.getById(req.user!.telegramId);
  const operator = operatorEntity ? operatorEntity.toJSON() : null;
  if (!operator) {
    res.status(404).json({ error: 'Operator tidak ditemukan.' });
    return;
  }

  // Only Super Admin can change Roles
  if (role && role !== targetUserEntity.role) {
    if (operator.role !== 'Super Admin') {
      res.status(403).json({ error: 'Hanya Super Admin yang dapat mengubah peran (role) pengguna.' });
      return;
    }
    targetUserEntity.updateRole(role);
    await cleanUserRepository.save(targetUserEntity);
    
    await firestoreLogRepo.save({
      userId: operator.telegramId,
      userName: `${operator.firstName} ${operator.lastName || ''}`.trim(),
      userRole: operator.role,
      action: `Mengubah peran ${targetUserEntity.firstName} menjadi ${role}`,
      targetId: targetUserEntity.telegramId,
      targetName: targetUserEntity.firstName
    });
  }

  // Change Status
  if (status && status !== targetUserEntity.status) {
    targetUserEntity.updateStatus(status, reason);
    await cleanUserRepository.save(targetUserEntity);

    await firestoreLogRepo.save({
      userId: operator.telegramId,
      userName: `${operator.firstName} ${operator.lastName || ''}`.trim(),
      userRole: operator.role,
      action: `Mengubah status ${targetUserEntity.firstName} menjadi ${status}`,
      targetId: targetUserEntity.telegramId,
      targetName: targetUserEntity.firstName
    });
  }

  res.json(targetUserEntity.toJSON());
});

// API ROUTE: Get Dashboard Statistics (All active users)
app.get('/api/stats', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  const apps = await firestoreAppRepo.getAll();
  const settings = { weeklyTarget: 5, monthlyTarget: 20 };

  // Calculate statistics
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);

  const todayCount = apps.filter(a => new Date(a.appliedAt) >= todayStart).length;
  const weeklyCount = apps.filter(a => new Date(a.appliedAt) >= weekAgo).length;
  const pendingCount = apps.filter(a => a.stage === 'Screening' || a.stage === 'Technical Test' || a.stage === 'Interview' || a.stage === 'Final Review').length;
  
  // High scores performance average
  const ratedApps = apps.filter(a => a.interviewerRating !== undefined && a.interviewerRating > 0);
  const avgRating = ratedApps.length > 0 
    ? ratedApps.reduce((acc, curr) => acc + (curr.interviewerRating || 0), 0) / ratedApps.length 
    : 4.2; // default high performance

  const performanceScore = Math.round((avgRating / 5) * 100);
  
  // Progress Ring Calculations
  const weeklyProgress = Math.min(100, Math.round((weeklyCount / settings.weeklyTarget) * 100));
  const monthlyProgress = Math.min(100, Math.round((apps.filter(a => a.stage === 'Approved').length / settings.monthlyTarget) * 100));

  res.json({
    todayRecruitment: todayCount,
    weeklyRecruitment: weeklyCount,
    pendingApproval: pendingCount,
    performanceScore,
    weeklyTarget: settings.weeklyTarget,
    weeklyProgress,
    monthlyProgress
  });
});

// API ROUTE: Get Dynamic Leaderboard
app.get('/api/leaderboard', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const users = await cleanUserRepository.getAll();
    const apps = await firestoreAppRepo.getAll();
    
    const leaderboard = users.map(userObj => {
      const u = userObj.toJSON();
      // Count applications processed by this user
      const processedCount = apps.filter(a => a.interviewerId === u.telegramId).length;
      
      // Calculate XP and performance
      const xp = (processedCount * 1500) + (u.role === 'Super Admin' ? 5000 : u.role === 'Admin' ? 3000 : u.role === 'Recruiter' ? 2000 : 500);
      const performance = Math.min(100, 85 + (processedCount > 0 ? Math.min(10, processedCount * 1.5) : 0) + (u.role === 'Super Admin' ? 4 : u.role === 'Admin' ? 2 : 0));
      
      return {
        telegramId: u.telegramId,
        username: u.username,
        firstName: u.firstName,
        lastName: u.lastName || '',
        photoUrl: u.photoUrl,
        role: u.role,
        xp,
        performance: parseFloat(performance.toFixed(1))
      };
    });

    // Sort by XP descending
    leaderboard.sort((a, b) => b.xp - a.xp);

    res.json(leaderboard);
  } catch (err) {
    console.error('Failed to generate leaderboard:', err);
    res.status(500).json({ error: 'Gagal memuat papan peringkat.' });
  }
});

// API ROUTE: Get Announcements (all authorized)
app.get('/api/announcements', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  res.json(await firestoreAnnRepo.getAll());
});

// API ROUTE: Create Announcement (Admins)
app.post('/api/announcements', authenticateToken, requireRoles(['Super Admin', 'Admin']), async (req: AuthRequest, res: Response): Promise<void> => {
  const { title, content, category, important } = req.body;
  if (!title || !content || !category) {
    res.status(400).json({ error: 'Harap isi judul, konten, dan kategori pengumuman.' });
    return;
  }

  const operatorEntity = await cleanUserRepository.getById(req.user!.telegramId);
  const operator = operatorEntity ? operatorEntity.toJSON() : null;
  if(!operator) { res.status(404).json({error: 'Operator not found'}); return; }
  const newAnn = await firestoreAnnRepo.save({
    title,
    content,
    category,
    author: `${operator.firstName} ${operator.lastName || ''}`.trim(),
    important: !!important
  });

  await firestoreLogRepo.save({
    userId: operator.telegramId,
    userName: `${operator.firstName} ${operator.lastName || ''}`.trim(),
    userRole: operator.role,
    action: `Membuat pengumuman baru: "${title}"`
  });

  res.json(newAnn);
});

// API ROUTE: Get Activity Logs (Admins and Super Admins)
app.get('/api/logs', authenticateToken, requireRoles(['Super Admin', 'Admin']), async (req: AuthRequest, res: Response): Promise<void> => {
  res.json(await firestoreLogRepo.getAll());
});

// Start dev server middleware or serve production assets
async function start() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    // SPA catch-all routing
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[AzurLize App] Server is running on http://localhost:${PORT}`);
  });
}

start();
