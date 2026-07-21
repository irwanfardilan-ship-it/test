/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'Super Admin' | 'Admin' | 'Recruiter' | 'Member';

export type UserStatus = 'Active' | 'Pending' | 'Rejected' | 'Suspended' | 'Banned';

export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
}

export interface User {
  telegramId: string;
  username?: string;
  firstName: string;
  lastName?: string;
  photoUrl?: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
  reason?: string; // Reason for blocked, suspended, rejected
}

export type RecruitmentStage = 
  | 'Screening' 
  | 'Technical Test' 
  | 'Interview' 
  | 'Final Review' 
  | 'Approved' 
  | 'Rejected';

export interface Application {
  id: string;
  telegramId: string;
  fullName: string;
  email: string;
  phone: string;
  position: string;
  experience: string; // e.g., '1-3 years', '3+ years'
  portfolioUrl?: string;
  githubUrl?: string;
  skills: string[];
  stage: RecruitmentStage;
  appliedAt: string;
  updatedAt: string;
  notes?: string;
  interviewerRating?: number; // 1-5 stars
  interviewerId?: string;
  interviewerName?: string;
}

export interface RecruitmentStats {
  todayRecruitment: number;
  weeklyRecruitment: number;
  pendingApproval: number;
  performanceScore: number; // 0-100
  weeklyTarget: number;
  monthlyProgress: number; // percentage
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  category: 'General' | 'Recruitment' | 'System' | 'Urgent';
  author: string;
  date: string;
  important: boolean;
}

export interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  targetId?: string;
  targetName?: string;
  timestamp: string;
}
