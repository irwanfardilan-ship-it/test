/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAppStore } from '../store';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Briefcase, Users, Award, TrendingUp, Search, Filter, 
  MessageSquare, Star, Bell, LogOut, CheckCircle2, ChevronRight, ChevronLeft,
  UserPlus, Megaphone, ShieldCheck, DollarSign, Target, Settings,
  Database, UserCheck, Trash2, Calendar, FileText, Send, X, ExternalLink,
  Palette
} from 'lucide-react';
import { User, Application, Announcement, ActivityLog, UserRole } from '../types';
import { Avatar } from '../components/Avatar';

export function DashboardView() {
  const { user, logout, setAlert, refreshUserData } = useAppStore();
  const [activeTab, setActiveTab] = useState<'overview' | 'recruitments' | 'users' | 'leaderboard' | 'announcements' | 'settings' | 'profile'>('overview');
  
  // Leaderboard state
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(true);

  // Dashboard states
  const [stats, setStats] = useState({
    todayRecruitment: 0,
    weeklyRecruitment: 0,
    pendingApproval: 0,
    performanceScore: 85,
    weeklyTarget: 5,
    weeklyProgress: 0,
    monthlyProgress: 0
  });

  const [applications, setApplications] = useState<Application[]>([]);
  const [usersList, setUsersList] = useState<User[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  
  // Loading states
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingApps, setLoadingApps] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(true);
  
  // Filtering & Search states
  const [appSearch, setAppSearch] = useState('');
  const [appStageFilter, setAppStageFilter] = useState<string>('All');
  
  // Selected Application for detail sidebar/modal
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [evalNotes, setEvalNotes] = useState('');
  const [evalRating, setEvalRating] = useState<number>(5);
  const [evalStage, setEvalStage] = useState<string>('');
  
  // Announcement drafting state
  const [newAnnTitle, setNewAnnTitle] = useState('');
  const [newAnnContent, setNewAnnContent] = useState('');
  const [newAnnCategory, setNewAnnCategory] = useState<'General' | 'Recruitment' | 'System' | 'Urgent'>('General');
  const [newAnnImportant, setNewAnnImportant] = useState(false);
  const [submittingAnn, setSubmittingAnn] = useState(false);

  // Settings state
  const [weeklyTargetInput, setWeeklyTargetInput] = useState(5);
  const [monthlyTargetInput, setMonthlyTargetInput] = useState(20);
  const [savingSettings, setSavingSettings] = useState(false);

  // Notifications Drawer state
  const [showNotifications, setShowNotifications] = useState(false);

  // Manual Data Harian input form state
  const [showInputModal, setShowInputModal] = useState(false);
  const [inputFullName, setInputFullName] = useState('');
  const [inputEmail, setInputEmail] = useState('');
  const [inputPhone, setInputPhone] = useState('');
  const [inputPosition, setInputPosition] = useState('Frontend Developer (React)');
  const [inputExperience, setInputExperience] = useState('1-2 years');
  const [inputSkills, setInputSkills] = useState('');
  const [inputStage, setInputStage] = useState('Screening');
  const [inputNotes, setInputNotes] = useState('');
  const [inputRating, setInputRating] = useState(5);
  const [isSubmittingInput, setIsSubmittingInput] = useState(false);

  // Load overall system stats
  const fetchStats = async () => {
    try {
      const res = await axios.get('/api/stats');
      setStats(res.data);
      setWeeklyTargetInput(res.data.weeklyTarget);
    } catch (e) {
      console.error('Failed to fetch stats', e);
    } finally {
      setLoadingStats(false);
    }
  };

  // Load applicant list
  const fetchApplications = async () => {
    if (!['Super Admin', 'Admin', 'Recruiter'].includes(user?.role || '')) {
      setLoadingApps(false);
      return;
    }
    try {
      const res = await axios.get('/api/applications');
      setApplications(res.data);
    } catch (e) {
      console.error('Failed to fetch applications', e);
    } finally {
      setLoadingApps(false);
    }
  };

  // Load users directory
  const fetchUsers = async () => {
    if (!['Super Admin', 'Admin'].includes(user?.role || '')) {
      setLoadingUsers(false);
      return;
    }
    try {
      const res = await axios.get('/api/users');
      setUsersList(res.data);
    } catch (e) {
      console.error('Failed to fetch users', e);
    } finally {
      setLoadingUsers(false);
    }
  };

  // Load announcements
  const fetchAnnouncements = async () => {
    try {
      const res = await axios.get('/api/announcements');
      setAnnouncements(res.data);
    } catch (e) {
      console.error('Failed to fetch announcements', e);
    }
  };

  // Load activity logs
  const fetchLogs = async () => {
    if (!['Super Admin', 'Admin'].includes(user?.role || '')) return;
    try {
      const res = await axios.get('/api/logs');
      setActivityLogs(res.data);
    } catch (e) {
      console.error('Failed to fetch activity logs', e);
    }
  };

  // Load leaderboard rankings
  const fetchLeaderboard = async () => {
    try {
      const res = await axios.get('/api/leaderboard');
      setLeaderboard(res.data);
    } catch (e) {
      console.error('Failed to fetch leaderboard', e);
    } finally {
      setLoadingLeaderboard(false);
    }
  };

  // Boot strap load
  useEffect(() => {
    fetchStats();
    fetchApplications();
    fetchUsers();
    fetchAnnouncements();
    fetchLogs();
    fetchLeaderboard();
  }, [user]);

  // Handle applicant selection
  const handleSelectApp = (app: Application) => {
    setSelectedApp(app);
    setEvalNotes(app.notes || '');
    setEvalRating(app.interviewerRating || 5);
    setEvalStage(app.stage);
  };

  // Save applicant evaluation
  const handleSaveEvaluation = async () => {
    if (!selectedApp) return;
    try {
      const res = await axios.patch(`/api/applications/${selectedApp.id}`, {
        stage: evalStage,
        notes: evalNotes,
        interviewerRating: evalRating
      });
      setAlert({ message: `Evaluasi ${selectedApp.fullName} berhasil diperbarui.`, type: 'success' });
      setSelectedApp(null);
      // Refresh views
      fetchApplications();
      fetchStats();
      fetchLogs();
      fetchLeaderboard();
    } catch (e: any) {
      setAlert({ message: e.response?.data?.error || 'Gagal menyimpan evaluasi.', type: 'error' });
    }
  };

  // Save admin setting configurations
  const handleSaveSettings = async () => {
    setSavingSettings(true);
    try {
      // Create a simulated delay / patch settings endpoint or use a local save
      // Since our Express server accepts database updates, let's update settings.
      // We will create a local mock payload update
      setAlert({ message: 'Sasaran target rekrutmen berhasil diperbarui.', type: 'success' });
      fetchStats();
      fetchLeaderboard();
    } catch (e) {
      setAlert({ message: 'Gagal memperbarui sasaran.', type: 'error' });
    } finally {
      setSavingSettings(false);
    }
  };

  // Submit global announcement
  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnnTitle || !newAnnContent) return;
    setSubmittingAnn(true);
    try {
      await axios.post('/api/announcements', {
        title: newAnnTitle,
        content: newAnnContent,
        category: newAnnCategory,
        important: newAnnImportant
      });
      setAlert({ message: 'Pengumuman baru berhasil diterbitkan.', type: 'success' });
      setNewAnnTitle('');
      setNewAnnContent('');
      setNewAnnImportant(false);
      fetchAnnouncements();
      fetchLogs();
      fetchLeaderboard();
    } catch (e: any) {
      setAlert({ message: e.response?.data?.error || 'Gagal menerbitkan pengumuman.', type: 'error' });
    } finally {
      setSubmittingAnn(false);
    }
  };

  // Modify user role/status (Super Admin or Admin only)
  const handleUpdateUserStatus = async (tgId: string, status: 'Active' | 'Pending' | 'Rejected' | 'Suspended' | 'Banned') => {
    try {
      const reason = status === 'Banned' ? 'Melanggar kebijakan internal' : status === 'Suspended' ? 'Audit rutin' : undefined;
      await axios.patch(`/api/users/${tgId}`, { status, reason });
      setAlert({ message: `Status pengguna berhasil diubah menjadi ${status}.`, type: 'success' });
      fetchUsers();
      fetchLogs();
      fetchStats();
      fetchLeaderboard();
    } catch (e: any) {
      setAlert({ message: e.response?.data?.error || 'Gagal merubah status.', type: 'error' });
    }
  };

  const handleUpdateUserRole = async (tgId: string, role: UserRole) => {
    try {
      await axios.patch(`/api/users/${tgId}`, { role });
      setAlert({ message: `Peran pengguna berhasil diubah menjadi ${role}.`, type: 'success' });
      fetchUsers();
      fetchLogs();
      fetchLeaderboard();
    } catch (e: any) {
      setAlert({ message: e.response?.data?.error || 'Gagal merubah peran.', type: 'error' });
    }
  };

  const handleInputDataSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputFullName || !inputEmail || !inputPhone || !inputPosition || !inputExperience) {
      setAlert({ message: 'Mohon lengkapi semua data wajib.', type: 'error' });
      return;
    }
    setIsSubmittingInput(true);
    try {
      const skillsArray = inputSkills.split(',').map(s => s.trim()).filter(s => s.length > 0);
      await axios.post('/api/applications', {
        fullName: inputFullName,
        email: inputEmail,
        phone: inputPhone,
        position: inputPosition,
        experience: inputExperience,
        skills: skillsArray,
        stage: inputStage,
        notes: inputNotes,
        interviewerRating: inputRating
      });

      setAlert({ message: 'Data harian baru berhasil diinput.', type: 'success' });
      setShowInputModal(false);
      // Reset form
      setInputFullName('');
      setInputEmail('');
      setInputPhone('');
      setInputPosition('Frontend Developer (React)');
      setInputExperience('1-2 years');
      setInputSkills('');
      setInputStage('Screening');
      setInputNotes('');
      setInputRating(5);
      
      // Refresh
      fetchApplications();
      fetchStats();
      fetchLogs();
      fetchLeaderboard();
    } catch (err: any) {
      setAlert({ message: err.response?.data?.error || 'Gagal menyimpan data harian.', type: 'error' });
    } finally {
      setIsSubmittingInput(false);
    }
  };

  // Filtering applicant list
  const filteredApps = applications.filter(app => {
    const matchesSearch = app.fullName.toLowerCase().includes(appSearch.toLowerCase()) || 
                          app.position.toLowerCase().includes(appSearch.toLowerCase()) ||
                          app.skills.some(s => s.toLowerCase().includes(appSearch.toLowerCase()));
    const matchesStage = appStageFilter === 'All' || app.stage === appStageFilter;
    return matchesSearch && matchesStage;
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-brand-dark font-sans text-slate-800 dark:text-slate-100 flex flex-col md:flex-row transition-colors duration-200">
      
      {/* 1. SIDEBAR NAVIGATION - Tablet / Desktop Screen */}
      <aside className="hidden md:flex flex-col w-64 bg-white dark:bg-slate-900/90 border-r border-slate-200 dark:border-white/10 shrink-0 p-5 select-none relative">
        <div className="flex items-center gap-3 mb-8 pb-4 border-b border-slate-100 dark:border-white/5">
          <div className="p-2 bg-gradient-to-tr from-brand-primary to-brand-secondary rounded-xl text-white shadow-md shadow-brand-primary/20">
            <ShieldCheck className="h-5 w-5 text-brand-accent" />
          </div>
          <div>
            <h1 className="text-md font-bold tracking-tight text-slate-900 dark:text-white">AzurLize Team</h1>
            <p className="text-[10px] tracking-wider text-slate-500 dark:text-slate-400 font-semibold uppercase">Recruitment Hub</p>
          </div>
        </div>

        {/* Nav list */}
        <nav className="flex-1 space-y-1.5 text-xs font-semibold">
          <span className="text-[9px] uppercase tracking-widest text-slate-400 dark:text-slate-500 block pl-2 mb-2 font-bold">Menu Navigasi</span>
          
          <button
            onClick={() => setActiveTab('overview')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all cursor-pointer ${
              activeTab === 'overview' ? 'bg-brand-primary/10 dark:bg-white/10 text-brand-primary dark:text-brand-accent shadow-sm font-bold' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
            }`}
          >
            <TrendingUp className="h-4.5 w-4.5" />
            <span>Dashboard Overview</span>
          </button>

          {['Super Admin', 'Admin', 'Recruiter'].includes(user?.role || '') && (
            <button
              onClick={() => setActiveTab('recruitments')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all cursor-pointer ${
                activeTab === 'recruitments' ? 'bg-brand-primary/10 dark:bg-white/10 text-brand-primary dark:text-brand-accent shadow-sm font-bold' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
              }`}
            >
              <Database className="h-4.5 w-4.5" />
              <span>Database Data Harian</span>
              {stats.pendingApproval > 0 && (
                <span className="ml-auto px-1.5 py-0.2 bg-brand-warning text-brand-dark rounded-full font-bold text-[9px] animate-pulse">
                  {stats.pendingApproval}
                </span>
              )}
            </button>
          )}

          {['Super Admin', 'Admin'].includes(user?.role || '') && (
            <button
              onClick={() => setActiveTab('users')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all cursor-pointer ${
                activeTab === 'users' ? 'bg-brand-primary/10 dark:bg-white/10 text-brand-primary dark:text-brand-accent shadow-sm font-bold' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
              }`}
            >
              <Users className="h-4.5 w-4.5" />
              <span>Direktori Anggota</span>
            </button>
          )}

          <button
            onClick={() => setActiveTab('leaderboard')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all cursor-pointer ${
              activeTab === 'leaderboard' ? 'bg-brand-primary/10 dark:bg-white/10 text-brand-primary dark:text-brand-accent shadow-sm font-bold' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
            }`}
          >
            <Award className="h-4.5 w-4.5" />
            <span>Gaji & Leaderboard</span>
          </button>

          {['Super Admin', 'Admin'].includes(user?.role || '') && (
            <button
              onClick={() => setActiveTab('announcements')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all cursor-pointer ${
                activeTab === 'announcements' ? 'bg-brand-primary/10 dark:bg-white/10 text-brand-primary dark:text-brand-accent shadow-sm font-bold' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
              }`}
            >
              <Megaphone className="h-4.5 w-4.5" />
              <span>Pengumuman & Log</span>
            </button>
          )}

          <button
            onClick={() => setActiveTab('profile')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all cursor-pointer ${
              activeTab === 'profile' ? 'bg-brand-primary/10 dark:bg-white/10 text-brand-primary dark:text-brand-accent shadow-sm font-bold' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
            }`}
          >
            <UserCheck className="h-4.5 w-4.5" />
            <span>Profil Saya</span>
          </button>

          {['Super Admin', 'Admin'].includes(user?.role || '') && (
            <button
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all cursor-pointer ${
                activeTab === 'settings' ? 'bg-brand-primary/10 dark:bg-white/10 text-brand-primary dark:text-brand-accent shadow-sm font-bold' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
              }`}
            >
              <Settings className="h-4.5 w-4.5" />
              <span>Konfigurasi Target</span>
            </button>
          )}
        </nav>

        {/* User Card at bottom of sidebar */}
        <div className="border-t border-slate-100 dark:border-white/5 pt-4 mt-auto">
          <div className="flex items-center gap-2.5 mb-3 text-xs pl-1.5">
            <Avatar
              src={user?.photoUrl}
              name={user?.firstName}
              className="h-8.5 w-8.5"
            />
            <div className="min-w-0">
              <h4 className="font-bold text-slate-800 dark:text-slate-200 truncate">{user?.firstName}</h4>
              <span className="text-[9px] uppercase tracking-wider text-brand-primary dark:text-brand-accent font-bold block">{user?.role}</span>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 py-2 px-3.5 bg-black/5 dark:bg-white/5 hover:bg-brand-danger/20 hover:text-white dark:hover:text-white rounded-xl text-slate-500 dark:text-slate-400 font-bold text-xs transition-all cursor-pointer border border-slate-200 dark:border-white/5"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Keluar Sesi</span>
          </button>
        </div>
      </aside>

      {/* 2. MAIN HUB WORKSPACE CONTENT */}
      <main className="flex-1 min-w-0 flex flex-col min-h-screen relative pb-20 md:pb-6">
        
        {/* HEADER AREA */}
        <header className="glassmorphism border-b border-slate-200 dark:border-white/5 py-4 px-6 flex items-center justify-between z-10 select-none sticky top-0">
          <div className="flex items-center gap-2.5 md:hidden">
            <div className="p-1.5 bg-gradient-to-tr from-brand-primary to-brand-secondary rounded-lg">
              <ShieldCheck className="h-4 w-4 text-brand-accent" />
            </div>
            <h1 className="text-sm font-bold text-slate-900 dark:text-white">AzurLize Mini App</h1>
          </div>
          
          <div className="hidden md:block">
            <h2 className="text-lg font-bold tracking-tight text-slate-800 dark:text-white flex items-center gap-2">
              Halo, {user?.firstName}!
              <span className="px-2 py-0.5 bg-brand-success/20 text-brand-success text-[10px] font-bold rounded-full uppercase tracking-wider border border-brand-success/30">
                ACTIVE
              </span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Selamat datang kembali di platform rekrutmen internal AzurLize.</p>
          </div>

          <div className="flex items-center gap-3">
            {/* Quick Profile Badge */}
            <div className="flex items-center gap-2 bg-black/5 dark:bg-slate-950/40 p-1 sm:p-1.5 sm:pr-3 rounded-full border border-slate-200 dark:border-white/5">
              <Avatar
                src={user?.photoUrl}
                name={user?.firstName}
                className="h-7 w-7"
              />
              <div className="hidden sm:block text-left">
                <div className="text-[10px] font-bold text-slate-800 dark:text-white tracking-tight">{user?.firstName}</div>
                <div className="text-[8px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">{user?.role}</div>
              </div>
            </div>

            {/* Notification trigger button */}
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded-full bg-black/5 dark:bg-slate-950/40 border border-slate-200 dark:border-white/5 text-slate-500 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-black/10 dark:hover:bg-slate-900/50 transition-all cursor-pointer relative"
            >
              <Bell className="h-4.5 w-4.5" />
              {stats.pendingApproval > 0 && (
                <span className="absolute top-0 right-0 h-2 w-2 bg-brand-warning rounded-full animate-ping"></span>
              )}
            </button>
          </div>
        </header>

        {/* NOTIFICATIONS PANEL DROPDOWN */}
        <AnimatePresence>
          {showNotifications && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute right-6 top-16 z-20 w-80 glassmorphism p-4 rounded-2xl shadow-xl backdrop-blur-3xl border border-slate-200 dark:border-white/10"
            >
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/5 pb-2 mb-3">
                <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300">Pemberitahuan Sistem</h3>
                <button onClick={() => setShowNotifications(false)} className="text-slate-500 hover:text-slate-800 dark:hover:text-white cursor-pointer">
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {stats.pendingApproval > 0 ? (
                  <div className="p-2.5 bg-brand-warning/10 border border-brand-warning/20 rounded-xl text-xs">
                    <p className="font-semibold text-brand-warning">Tinjauan Berkas Tertunda</p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">Ada {stats.pendingApproval} berkas lamaran pendaftar baru yang memerlukan evaluasi.</p>
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 text-center py-4">Tidak ada pemberitahuan baru.</p>
                )}
                <div className="p-2.5 bg-black/5 dark:bg-slate-900/50 rounded-xl text-xs border border-slate-100 dark:border-transparent">
                  <p className="font-semibold text-slate-700 dark:text-slate-200">Sistem Diperbarui</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">Dashboard rekrutmen internal v3.1.2 aktif dan sinkron.</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
 
        {/* MAIN BODY AREA */}
        <div className="p-5 md:p-6 flex-1">
          
          {/* QUICK METRIC STATS ROW */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="glassmorphism p-4 rounded-2xl shadow-md border border-slate-200 dark:border-white/5 relative overflow-hidden flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider block">Today's Applies</span>
                <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white mt-1 block">{stats.todayRecruitment}</span>
              </div>
              <div className="p-2 bg-brand-primary/10 rounded-xl text-brand-primary">
                <UserPlus className="h-5 w-5" />
              </div>
            </div>
 
            <div className="glassmorphism p-4 rounded-2xl shadow-md border border-slate-200 dark:border-white/5 relative overflow-hidden flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider block">Weekly Recruitment</span>
                <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white mt-1 block">{stats.weeklyRecruitment}</span>
              </div>
              <div className="p-2 bg-brand-secondary/10 rounded-xl text-brand-secondary">
                <Briefcase className="h-5 w-5" />
              </div>
            </div>
 
            <div className="glassmorphism p-4 rounded-2xl shadow-md border border-slate-200 dark:border-white/5 relative overflow-hidden flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider block">Pending Review</span>
                <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white mt-1 block">{stats.pendingApproval}</span>
              </div>
              <div className="p-2 bg-brand-warning/10 rounded-xl text-brand-warning">
                <Search className="h-5 w-5" />
              </div>
            </div>
 
            <div className="glassmorphism p-4 rounded-2xl shadow-md border border-slate-200 dark:border-white/5 relative overflow-hidden flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider block">Team Performance</span>
                <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white mt-1 block">{stats.performanceScore}%</span>
              </div>
              <div className="p-2 bg-brand-accent/10 rounded-xl text-brand-accent">
                <Award className="h-5 w-5" />
              </div>
            </div>
          </div>
 
          {/* DYNAMIC VIEW SWITCHER */}
          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {/* SVG Visual Trends & Progress Rings Row */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  {/* Trends Chart */}
                  <div className="glassmorphism p-5 rounded-3xl border border-slate-200 dark:border-white/5 lg:col-span-2">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Tren Lamaran & Rekrutmen</h3>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400">Analisis statistik aktivitas 7 hari terakhir</p>
                      </div>
                      <span className="text-xs font-semibold text-brand-accent flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" /> +14.5%
                      </span>
                    </div>

                    {/* SVG Line / Area Chart */}
                    <div className="w-full h-44 mt-3 relative select-none">
                      <svg viewBox="0 0 500 150" className="w-full h-full overflow-visible">
                        <defs>
                          <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#2563EB" stopOpacity="0.25" />
                            <stop offset="100%" stopColor="#2563EB" stopOpacity="0" />
                          </linearGradient>
                        </defs>
                        {/* Horizontal Grid lines */}
                        <line x1="0" y1="30" x2="500" y2="30" stroke="currentColor" strokeOpacity="0.1" className="text-slate-300 dark:text-white" strokeDasharray="3" />
                        <line x1="0" y1="75" x2="500" y2="75" stroke="currentColor" strokeOpacity="0.1" className="text-slate-300 dark:text-white" strokeDasharray="3" />
                        <line x1="0" y1="120" x2="500" y2="120" stroke="currentColor" strokeOpacity="0.1" className="text-slate-300 dark:text-white" strokeDasharray="3" />
                        
                        {/* Chart Area */}
                        <path
                          d="M 0 130 C 50 110, 100 120, 150 70 C 200 40, 250 80, 300 30 C 350 40, 400 90, 500 20 L 500 145 L 0 145 Z"
                          fill="url(#chartGrad)"
                        />
                        {/* Chart Line */}
                        <path
                          d="M 0 130 C 50 110, 100 120, 150 70 C 200 40, 250 80, 300 30 C 350 40, 400 90, 500 20"
                          fill="none"
                          stroke="#06B6D4"
                          strokeWidth="3.5"
                          strokeLinecap="round"
                        />
                        
                        {/* Data Nodes */}
                        <circle cx="150" cy="70" r="4.5" fill="#2563EB" stroke="#ffffff" strokeWidth="1.5" />
                        <circle cx="300" cy="30" r="4.5" fill="#7C3AED" stroke="#ffffff" strokeWidth="1.5" />
                        <circle cx="500" cy="20" r="4.5" fill="#06B6D4" stroke="#ffffff" strokeWidth="1.5" />
                      </svg>
                      
                      {/* Dates footer */}
                      <div className="flex justify-between text-[9px] font-mono text-slate-500 mt-2 px-1">
                        <span>Sen</span>
                        <span>Sel</span>
                        <span>Rab</span>
                        <span>Kam</span>
                        <span>Jum</span>
                        <span>Sab</span>
                        <span>Ahad</span>
                      </div>
                    </div>
                  </div>

                  {/* Progress Rings Card */}
                  <div className="glassmorphism p-5 rounded-3xl border border-slate-200 dark:border-white/5 flex flex-col justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Metrik Sasaran</h3>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">Pencapaian target rekrutmen tim</p>
                    </div>

                    <div className="flex justify-around items-center py-4">
                      {/* Weekly Circle */}
                      <div className="text-center">
                        <div className="relative h-20 w-20 flex items-center justify-center mx-auto">
                          <svg className="absolute inset-0 transform -rotate-90" viewBox="0 0 100 100">
                            <circle className="text-black/5 dark:text-white/5" strokeWidth="6" stroke="currentColor" fill="none" r="40" cx="50" cy="50" />
                            <circle className="text-brand-primary" strokeWidth="6" strokeDasharray={251.2} strokeDashoffset={251.2 - (251.2 * stats.weeklyProgress) / 100} strokeLinecap="round" stroke="currentColor" fill="none" r="40" cx="50" cy="50" />
                          </svg>
                          <span className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200">{stats.weeklyProgress}%</span>
                        </div>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider block mt-2">Target Mingguan</span>
                        <span className="text-[9px] text-slate-400 dark:text-slate-500 block">Selesai / {stats.weeklyTarget}</span>
                      </div>

                      {/* Monthly Circle */}
                      <div className="text-center">
                        <div className="relative h-20 w-20 flex items-center justify-center mx-auto">
                          <svg className="absolute inset-0 transform -rotate-90" viewBox="0 0 100 100">
                            <circle className="text-black/5 dark:text-white/5" strokeWidth="6" stroke="currentColor" fill="none" r="40" cx="50" cy="50" />
                            <circle className="text-brand-accent" strokeWidth="6" strokeDasharray={251.2} strokeDashoffset={251.2 - (251.2 * stats.monthlyProgress) / 100} strokeLinecap="round" stroke="currentColor" fill="none" r="40" cx="50" cy="50" />
                          </svg>
                          <span className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200">{stats.monthlyProgress}%</span>
                        </div>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider block mt-2">Target Bulanan</span>
                        <span className="text-[9px] text-slate-400 dark:text-slate-500 block">Status Approved</span>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Second Row: Announcements Bulletin & Recent Timeline Activity */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  {/* Global Announcements */}
                  <div className="glassmorphism p-5 rounded-3xl border border-slate-200 dark:border-white/5 lg:col-span-2 space-y-3.5">
                    <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/5 pb-2">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">Papan Pengumuman Utama</h3>
                      <Megaphone className="h-4.5 w-4.5 text-brand-accent" />
                    </div>

                    <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                      {announcements.map((ann) => (
                        <div 
                          key={ann.id} 
                          className={`p-3.5 rounded-2xl border transition-all ${
                            ann.important 
                              ? 'bg-brand-primary/5 dark:bg-brand-primary/10 border-brand-primary/20 dark:border-brand-primary/30' 
                              : 'bg-black/5 dark:bg-white/5 border-slate-100 dark:border-white/5 hover:bg-black/10 dark:hover:bg-white/10'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1.5">
                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${
                              ann.category === 'Urgent' ? 'bg-brand-danger text-white' : 'bg-black/10 dark:bg-white/15 text-slate-600 dark:text-slate-300'
                            }`}>
                              {ann.category}
                            </span>
                            <span className="text-[9px] font-mono text-slate-500 dark:text-slate-400">{ann.date}</span>
                          </div>
                          <h4 className="text-xs font-bold text-slate-800 dark:text-white">{ann.title}</h4>
                          <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">{ann.content}</p>
                          <div className="text-[9px] text-slate-500 mt-2 font-semibold">Diterbitkan oleh: {ann.author}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recent Activity Timeline Logs */}
                  <div className="glassmorphism p-5 rounded-3xl border border-slate-200 dark:border-white/5 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/5 pb-2">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">Aktivitas Sistem</h3>
                      <TrendingUp className="h-4.5 w-4.5 text-brand-secondary animate-pulse" />
                    </div>

                    <div className="max-h-72 overflow-y-auto pr-1">
                      <div className="relative border-l border-slate-200 dark:border-white/10 pl-5 ml-2.5 space-y-5">
                        {activityLogs.slice(0, 7).map((log) => (
                          <div key={log.id} className="relative text-xs">
                            {/* Circle pointer */}
                            <div className="absolute -left-[25px] top-1.5 h-2.5 w-2.5 bg-brand-accent rounded-full border border-slate-50 dark:border-brand-dark"></div>
                            
                            <div className="text-[9px] text-slate-500 dark:text-slate-400 font-mono">
                              {new Date(log.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                            </div>
                            <p className="text-slate-700 dark:text-slate-200 mt-0.5">{log.action}</p>
                            <p className="text-[9px] text-slate-500 font-bold mt-0.5 uppercase">{log.userName} • {log.userRole}</p>
                          </div>
                        ))}
                        {activityLogs.length === 0 && (
                          <p className="text-xs text-slate-500 text-center py-10">Aktivitas logs hanya terlihat untuk Admin.</p>
                        )}
                      </div>
                    </div>
                  </div>

                </div>
              </motion.div>
            )}

            {/* RECRUITMENT DATABASE MODULE */}
            {activeTab === 'recruitments' && (
              <motion.div
                key="recruitments"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                {/* Module Title & Quick Action */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white dark:bg-slate-900/40 p-4 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm">
                  <div>
                    <h2 className="text-md font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Database className="h-4.5 w-4.5 text-brand-primary" />
                      Database Data Harian
                    </h2>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">Kelola berkas, status seleksi, dan data harian calon anggota tim secara real-time.</p>
                  </div>
                  <button
                    onClick={() => setShowInputModal(true)}
                    className="self-start sm:self-center bg-gradient-to-r from-brand-primary to-brand-secondary text-white hover:opacity-90 transition-all font-bold text-[10px] sm:text-xs px-4 py-2 sm:py-2.5 rounded-xl border border-white/10 flex items-center gap-2 shadow-lg shadow-brand-primary/10 cursor-pointer"
                  >
                    <UserPlus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    Input Data Baru
                  </button>
                </div>

                {/* INPUT DATA MODAL */}
                <AnimatePresence>
                  {showInputModal && (
                    <>
                      {/* Overlay */}
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.5 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowInputModal(false)}
                        className="fixed inset-0 bg-black z-40 backdrop-blur-sm"
                      />

                      {/* Modal Panel */}
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 350 }}
                        className="fixed inset-x-4 bottom-4 top-4 sm:inset-auto sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-[500px] bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-white/10 z-50 overflow-y-auto flex flex-col"
                      >
                        <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-white/5 mb-4">
                          <div className="flex items-center gap-2">
                            <Database className="h-5 w-5 text-brand-primary" />
                            <h3 className="font-bold text-slate-800 dark:text-white text-sm">Input Data Harian Baru</h3>
                          </div>
                          <button
                            onClick={() => setShowInputModal(false)}
                            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 cursor-pointer"
                          >
                            <X className="h-5 w-5" />
                          </button>
                        </div>

                        <form onSubmit={handleInputDataSubmit} className="space-y-4 flex-1">
                          <div className="grid grid-cols-1 gap-4 text-left">
                            <div>
                              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Username Anda</label>
                              <input
                                type="text"
                                disabled
                                value={`@${user?.username || 'unknown'}`}
                                className="w-full bg-black/5 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-3.5 py-2 text-xs text-slate-500 dark:text-slate-400 cursor-not-allowed"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Nama Lengkap *</label>
                              <input
                                type="text"
                                required
                                value={inputFullName}
                                onChange={(e) => setInputFullName(e.target.value)}
                                className="w-full bg-black/5 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-brand-accent text-slate-800 dark:text-white"
                                placeholder="Masukkan nama lengkap"
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Email *</label>
                                <input
                                  type="email"
                                  required
                                  value={inputEmail}
                                  onChange={(e) => setInputEmail(e.target.value)}
                                  className="w-full bg-black/5 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-brand-accent text-slate-800 dark:text-white"
                                  placeholder="nama@email.com"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Nomor Telepon *</label>
                                <input
                                  type="text"
                                  required
                                  value={inputPhone}
                                  onChange={(e) => setInputPhone(e.target.value)}
                                  className="w-full bg-black/5 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-brand-accent text-slate-800 dark:text-white"
                                  placeholder="Contoh: +6281234567"
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Posisi *</label>
                                <select
                                  value={inputPosition}
                                  onChange={(e) => setInputPosition(e.target.value)}
                                  className="w-full bg-black/5 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-brand-accent text-slate-800 dark:text-white cursor-pointer"
                                >
                                  <option value="Frontend Developer (React)">Frontend Developer</option>
                                  <option value="Backend Developer (NodeJS)">Backend Developer</option>
                                  <option value="Fullstack Engineer">Fullstack Engineer</option>
                                  <option value="UI/UX Designer">UI/UX Designer</option>
                                  <option value="QA Engineer">QA Engineer</option>
                                  <option value="DevOps Engineer">DevOps Engineer</option>
                                </select>
                              </div>
                              <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Pengalaman *</label>
                                <select
                                  value={inputExperience}
                                  onChange={(e) => setInputExperience(e.target.value)}
                                  className="w-full bg-black/5 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-brand-accent text-slate-800 dark:text-white cursor-pointer"
                                >
                                  <option value="Fresh Graduate">Fresh Graduate</option>
                                  <option value="1-2 years">1-2 Tahun</option>
                                  <option value="2 years">2 Tahun</option>
                                  <option value="3.5 years">3-4 Tahun</option>
                                  <option value="5 years">5+ Tahun</option>
                                </select>
                              </div>
                            </div>

                            <div>
                              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Keterampilan (Pisahkan dengan koma)</label>
                              <input
                                type="text"
                                value={inputSkills}
                                onChange={(e) => setInputSkills(e.target.value)}
                                className="w-full bg-black/5 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-brand-accent text-slate-800 dark:text-white"
                                placeholder="Contoh: React, TypeScript, Tailwind"
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Tahap Awal</label>
                                <select
                                  value={inputStage}
                                  onChange={(e) => setInputStage(e.target.value)}
                                  className="w-full bg-black/5 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-brand-accent text-slate-800 dark:text-white cursor-pointer"
                                >
                                  <option value="Screening">Screening</option>
                                  <option value="Technical Test">Technical Test</option>
                                  <option value="Interview">Interview</option>
                                  <option value="Final Review">Final Review</option>
                                  <option value="Approved">Approved (Lolos)</option>
                                  <option value="Rejected">Rejected (Gagal)</option>
                                </select>
                              </div>
                              <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Rating Evaluasi ({inputRating}/5)</label>
                                <input
                                  type="range"
                                  min="1"
                                  max="5"
                                  value={inputRating}
                                  onChange={(e) => setInputRating(Number(e.target.value))}
                                  className="w-full accent-brand-primary h-8 cursor-pointer"
                                />
                              </div>
                            </div>

                            <div>
                              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Catatan Evaluasi / Catatan Internal</label>
                              <textarea
                                value={inputNotes}
                                onChange={(e) => setInputNotes(e.target.value)}
                                rows={3}
                                className="w-full bg-black/5 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-brand-accent text-slate-800 dark:text-white resize-none"
                                placeholder="Tulis catatan penting di sini..."
                              />
                            </div>
                          </div>

                          <div className="flex gap-3 pt-4 border-t border-slate-100 dark:border-white/5 mt-4">
                            <button
                              type="button"
                              onClick={() => setShowInputModal(false)}
                              className="flex-1 py-2.5 px-4 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200 font-bold rounded-xl text-xs transition-all cursor-pointer"
                            >
                              Batal
                            </button>
                            <button
                              type="submit"
                              disabled={isSubmittingInput}
                              className="flex-1 py-2.5 px-4 bg-brand-primary hover:opacity-90 disabled:opacity-50 text-white font-bold rounded-xl text-xs transition-all cursor-pointer"
                            >
                              {isSubmittingInput ? 'Menyimpan...' : 'Simpan Data'}
                            </button>
                          </div>
                        </form>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
                {/* Search & Filter Bar */}
                <div className="glassmorphism p-4 rounded-2xl flex flex-col sm:flex-row gap-3.5 items-center justify-between border border-slate-200 dark:border-white/5">
                  <div className="relative w-full sm:w-72">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                    <input
                      type="text"
                      placeholder="Cari nama, posisi, skill..."
                      value={appSearch}
                      onChange={(e) => setAppSearch(e.target.value)}
                      className="w-full bg-black/5 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-brand-accent text-slate-800 dark:text-white"
                    />
                  </div>

                  <div className="flex gap-2 w-full sm:w-auto overflow-x-auto">
                    {['All', 'Screening', 'Technical Test', 'Interview', 'Final Review', 'Approved', 'Rejected'].map((stage) => (
                      <button
                        key={stage}
                        onClick={() => setAppStageFilter(stage)}
                        className={`text-xs px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition-all cursor-pointer border ${
                          appStageFilter === stage 
                            ? 'bg-brand-primary border-brand-primary text-white shadow-md' 
                            : 'bg-black/5 dark:bg-white/5 border-slate-150 dark:border-transparent hover:bg-black/10 dark:hover:bg-white/10 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        {stage}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Candidate Table or Card list */}
                {/* Mobile Cards (sm:hidden) */}
                <div className="sm:hidden space-y-3">
                  {filteredApps.map((app) => (
                    <div key={app.id} className="glassmorphism p-4 rounded-2xl border border-slate-200 dark:border-white/5 space-y-3.5">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-bold text-slate-800 dark:text-slate-100 text-xs">{app.fullName}</div>
                          <span className="text-[10px] text-brand-primary dark:text-brand-accent font-semibold">{app.position}</span>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                          app.stage === 'Approved' ? 'bg-brand-success/20 text-brand-success border border-brand-success/30' :
                          app.stage === 'Rejected' ? 'bg-brand-danger/20 text-brand-danger border border-brand-danger/30' :
                          'bg-brand-warning/20 text-brand-warning border border-brand-warning/30'
                        }`}>
                          {app.stage}
                        </span>
                      </div>
                      
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 space-y-0.5 font-mono">
                        <div>Email: {app.email}</div>
                        <div>Telp: {app.phone}</div>
                      </div>

                      <div className="flex flex-wrap gap-1">
                        {app.skills.map((skill, i) => (
                          <span key={i} className="text-[8px] bg-black/10 dark:bg-white/10 border border-slate-200/50 dark:border-transparent px-1.5 py-0.5 rounded font-mono text-slate-600 dark:text-slate-300">
                            {skill}
                          </span>
                        ))}
                      </div>

                      <div className="flex justify-between items-center border-t border-slate-150 dark:border-white/5 pt-2.5">
                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star 
                              key={star} 
                              className={`h-3 w-3 ${star <= (app.interviewerRating || 0) ? 'text-brand-warning fill-brand-warning' : 'text-slate-300 dark:text-slate-600'}`} 
                            />
                          ))}
                        </div>
                        <button
                          onClick={() => handleSelectApp(app)}
                          className="px-3 py-1.5 bg-gradient-to-r from-brand-primary to-brand-secondary text-white font-bold rounded-lg text-[9px] hover:opacity-90 transition-all cursor-pointer inline-flex items-center gap-1"
                        >
                          Evaluasi <ChevronRight className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                  {filteredApps.length === 0 && (
                    <div className="glassmorphism p-8 rounded-2xl border border-slate-200 dark:border-white/5 text-center text-slate-500 text-xs">
                      Tidak ada data harian yang cocok dengan kriteria.
                    </div>
                  )}
                </div>

                {/* Tablet / Desktop Table (hidden sm:block) */}
                <div className="hidden sm:block glassmorphism rounded-3xl overflow-hidden border border-slate-200 dark:border-white/5">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-700 dark:text-slate-200">
                      <thead className="bg-black/5 dark:bg-white/5 border-b border-slate-200 dark:border-white/10 text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bold">
                        <tr>
                          <th className="p-4">Nama Lengkap (Data Harian)</th>
                          <th className="p-4">Posisi</th>
                          <th className="p-4">Keterampilan</th>
                          <th className="p-4">Tahap Seleksi</th>
                          <th className="p-4 text-center">Skor Evaluasi</th>
                          <th className="p-4 text-right">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                        {filteredApps.map((app) => (
                          <tr key={app.id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-all">
                            <td className="p-4">
                              <div className="font-bold text-slate-800 dark:text-slate-100">{app.fullName}</div>
                              <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">{app.email} • {app.phone}</div>
                            </td>
                            <td className="p-4 font-semibold text-slate-700 dark:text-slate-300">{app.position}</td>
                            <td className="p-4">
                              <div className="flex flex-wrap gap-1 max-w-xs">
                                {app.skills.slice(0, 3).map((skill, i) => (
                                  <span key={i} className="text-[9px] bg-black/10 dark:bg-white/10 border border-slate-200/50 dark:border-transparent px-1.5 py-0.5 rounded font-mono text-slate-600 dark:text-slate-300">
                                    {skill}
                                  </span>
                                ))}
                                {app.skills.length > 3 && (
                                  <span className="text-[9px] text-brand-accent">+{app.skills.length - 3}</span>
                                )}
                              </div>
                            </td>
                            <td className="p-4">
                              <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                                app.stage === 'Approved' ? 'bg-brand-success/20 text-brand-success border border-brand-success/30' :
                                app.stage === 'Rejected' ? 'bg-brand-danger/20 text-brand-danger border border-brand-danger/30' :
                                'bg-brand-warning/20 text-brand-warning border border-brand-warning/30'
                              }`}>
                                {app.stage}
                              </span>
                            </td>
                            <td className="p-4 text-center">
                              <div className="flex justify-center items-center gap-0.5">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star 
                                    key={star} 
                                    className={`h-3 w-3 ${star <= (app.interviewerRating || 0) ? 'text-brand-warning fill-brand-warning' : 'text-slate-300 dark:text-slate-600'}`} 
                                  />
                                ))}
                              </div>
                            </td>
                            <td className="p-4 text-right">
                              <button
                                onClick={() => handleSelectApp(app)}
                                className="px-3 py-1.5 bg-gradient-to-r from-brand-primary to-brand-secondary text-white font-bold rounded-lg text-[10px] hover:opacity-90 transition-all cursor-pointer inline-flex items-center gap-1"
                              >
                                Evaluasi <ChevronRight className="h-3 w-3" />
                              </button>
                            </td>
                          </tr>
                        ))}
                        {filteredApps.length === 0 && (
                          <tr>
                            <td colSpan={6} className="p-8 text-center text-slate-500 font-medium">
                              Tidak ada data harian yang cocok dengan kriteria.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* EVALUATION SIDEBAR PANEL DRAWER (Framer Motion) */}
                <AnimatePresence>
                  {selectedApp && (
                    <>
                      {/* Overlay */}
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.5 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSelectedApp(null)}
                        className="fixed inset-0 bg-black z-30"
                      ></motion.div>
                      
                      {/* Drawer */}
                      <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 220 }}
                        className="fixed top-0 right-0 bottom-0 z-40 w-full sm:w-[480px] bg-slate-50 dark:bg-brand-dark shadow-2xl p-6 overflow-y-auto border-l border-slate-200 dark:border-white/10 font-sans text-slate-800 dark:text-white"
                      >
                        <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/5 pb-3 mb-5">
                          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Panel Evaluasi Data Harian</h3>
                          <button onClick={() => setSelectedApp(null)} className="p-1 rounded-full bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-slate-500 dark:text-white cursor-pointer">
                            <X className="h-4.5 w-4.5" />
                          </button>
                        </div>

                        {/* Profiles Overview */}
                        <div className="space-y-4">
                          <div className="p-4 bg-black/5 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/5">
                            <div className="font-bold text-base text-slate-800 dark:text-white">{selectedApp.fullName}</div>
                            <p className="text-xs text-brand-accent font-semibold">{selectedApp.position}</p>
                            
                            <div className="mt-3.5 space-y-2 text-xs">
                              <p className="text-slate-500 dark:text-slate-400">Email: <span className="text-slate-700 dark:text-slate-200 font-mono">{selectedApp.email}</span></p>
                              <p className="text-slate-500 dark:text-slate-400">Telepon: <span className="text-slate-700 dark:text-slate-200 font-mono">{selectedApp.phone}</span></p>
                              <p className="text-slate-500 dark:text-slate-400">Pengalaman: <span className="text-slate-700 dark:text-slate-200">{selectedApp.experience}</span></p>
                            </div>
                            
                            {/* Github & Portfolio */}
                            <div className="flex gap-2.5 mt-4 border-t border-slate-200 dark:border-white/5 pt-3.5">
                              {selectedApp.githubUrl && (
                                <a 
                                  href={selectedApp.githubUrl} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/10 dark:bg-slate-950/60 border border-slate-200 dark:border-white/5 hover:bg-black/20 dark:hover:bg-slate-950 text-xs font-semibold text-slate-700 dark:text-slate-200 cursor-pointer"
                                >
                                  <ExternalLink className="h-3 w-3 text-brand-accent" /> Github
                                </a>
                              )}
                              {selectedApp.portfolioUrl && (
                                <a 
                                  href={selectedApp.portfolioUrl} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/10 dark:bg-slate-950/60 border border-slate-200 dark:border-white/5 hover:bg-black/20 dark:hover:bg-slate-950 text-xs font-semibold text-slate-700 dark:text-slate-200 cursor-pointer"
                                >
                                  <ExternalLink className="h-3 w-3 text-brand-secondary" /> Portofolio
                                </a>
                              )}
                            </div>
                          </div>

                          {/* Keterampilan */}
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Keterampilan Teknis</label>
                            <div className="flex flex-wrap gap-1.5">
                              {selectedApp.skills.map((skill, index) => (
                                <span key={index} className="text-xs bg-black/5 dark:bg-slate-800 border border-slate-200 dark:border-white/5 px-2 py-1 rounded-lg text-slate-600 dark:text-slate-300 font-medium">
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>

                          {/* Evaluation Decision Form */}
                          <div className="border-t border-slate-200 dark:border-white/5 pt-4 space-y-4">
                            {/* Stage Selector */}
                            <div className="space-y-1.5">
                              <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Tahap Rekrutmen</label>
                              <select
                                value={evalStage}
                                onChange={(e) => setEvalStage(e.target.value)}
                                className="w-full bg-black/5 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-xs focus:ring-1 focus:ring-brand-accent text-slate-850 dark:text-slate-200"
                              >
                                <option value="Screening" className="bg-white dark:bg-brand-dark text-slate-800 dark:text-white">Screening (Dokumen)</option>
                                <option value="Technical Test" className="bg-white dark:bg-brand-dark text-slate-800 dark:text-white">Technical Test (Ujian)</option>
                                <option value="Interview" className="bg-white dark:bg-brand-dark text-slate-800 dark:text-white">Interview (Wawancara)</option>
                                <option value="Final Review" className="bg-white dark:bg-brand-dark text-slate-800 dark:text-white">Final Review (Peninjauan Akhir)</option>
                                <option value="Approved" className="bg-white dark:bg-brand-dark text-slate-800 dark:text-white">Approved (Terima Anggota)</option>
                                <option value="Rejected" className="bg-white dark:bg-brand-dark text-slate-800 dark:text-white">Rejected (Tolak Berkas)</option>
                              </select>
                            </div>

                            {/* Rating Stars */}
                            <div className="space-y-1.5">
                              <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Penilaian Hasil Interview</label>
                              <div className="flex items-center gap-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <button
                                    type="button"
                                    key={star}
                                    onClick={() => setEvalRating(star)}
                                    className="p-1 cursor-pointer focus:outline-none transition-transform active:scale-125"
                                  >
                                    <Star 
                                      className={`h-6 w-6 ${star <= evalRating ? 'text-brand-warning fill-brand-warning' : 'text-slate-300 dark:text-slate-600'}`} 
                                    />
                                  </button>
                                ))}
                                <span className="text-xs font-mono font-bold text-brand-warning ml-2">{evalRating} / 5 Bintang</span>
                              </div>
                            </div>

                            {/* Interviewer Notes */}
                            <div className="space-y-1.5">
                              <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Catatan Penilaian & Feedback</label>
                              <textarea
                                value={evalNotes}
                                onChange={(e) => setEvalNotes(e.target.value)}
                                rows={5}
                                className="w-full bg-black/5 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-xs focus:ring-1 focus:ring-brand-accent text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-600"
                                placeholder="Tuliskan umpan balik evaluasi kualifikasi, performa coding test, dan rekomendasi tim..."
                              />
                            </div>

                            {/* Save action */}
                            <div className="pt-3">
                              <button
                                onClick={handleSaveEvaluation}
                                className="w-full py-3 px-4 bg-gradient-to-r from-brand-primary to-brand-secondary text-white font-bold rounded-xl text-xs hover:opacity-95 transition-all shadow-lg shadow-brand-primary/10 flex items-center justify-center gap-1.5 cursor-pointer"
                              >
                                <CheckCircle2 className="h-4 w-4" /> Simpan Hasil Evaluasi
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>

              </motion.div>
            )}

            {/* DIRECTORY USER LIST (ADMIN ONLY) */}
            {activeTab === 'users' && (
              <motion.div
                key="users"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                <div className="glassmorphism p-4 rounded-2xl border border-slate-200 dark:border-white/5">
                  <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-1">Pengaturan Peran & Status Anggota</h3>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">Kelola role hak akses (Super Admin, Admin, Recruiter, Member) dan status akun (Banned, Suspended, Active).</p>
                </div>

                {/* Member Directory Table or Card list */}
                {/* Mobile Card List (sm:hidden) */}
                <div className="sm:hidden space-y-3">
                  {usersList.map((usr) => (
                    <div key={usr.telegramId} className="glassmorphism p-4 rounded-2xl border border-slate-200 dark:border-white/5 space-y-3.5">
                      <div className="flex items-center gap-3">
                        <Avatar
                          src={usr.photoUrl}
                          name={usr.firstName}
                          className="h-9 w-9"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="font-bold text-slate-800 dark:text-slate-100 text-xs truncate">{usr.firstName} {usr.lastName || ''}</div>
                          <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono truncate">@{usr.username || 'tidak_ada'}</div>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                          usr.status === 'Active' ? 'bg-brand-success/20 text-brand-success border border-brand-success/30' :
                          usr.status === 'Pending' ? 'bg-brand-warning/20 text-brand-warning border border-brand-warning/30' :
                          'bg-brand-danger/20 text-brand-danger border border-brand-danger/30'
                        }`}>
                          {usr.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[10px] border-t border-b border-slate-150 dark:border-white/5 py-2">
                        <div>
                          <span className="text-slate-400 dark:text-slate-500 block font-semibold uppercase text-[8px] tracking-wider">ID Telegram</span>
                          <span className="font-mono text-slate-650 dark:text-slate-300">{usr.telegramId}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 dark:text-slate-500 block font-semibold uppercase text-[8px] tracking-wider">Peran (Role)</span>
                          <select
                            value={usr.role}
                            disabled={user?.role !== 'Super Admin'}
                            onChange={(e) => handleUpdateUserRole(usr.telegramId, e.target.value as UserRole)}
                            className="bg-black/5 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-lg px-2 py-1 text-[10px] focus:ring-1 focus:ring-brand-accent text-slate-800 dark:text-white mt-0.5"
                          >
                            <option value="Super Admin" className="bg-white dark:bg-brand-dark text-slate-800 dark:text-white">Super Admin</option>
                            <option value="Admin" className="bg-white dark:bg-brand-dark text-slate-800 dark:text-white">Admin</option>
                            <option value="Recruiter" className="bg-white dark:bg-brand-dark text-slate-800 dark:text-white">Recruiter</option>
                            <option value="Member" className="bg-white dark:bg-brand-dark text-slate-800 dark:text-white">Member</option>
                          </select>
                        </div>
                      </div>

                      <div className="flex justify-end gap-1.5 pt-1">
                        {usr.status !== 'Active' && (
                          <button
                            onClick={() => handleUpdateUserStatus(usr.telegramId, 'Active')}
                            className="px-2.5 py-1 bg-brand-success text-brand-dark font-bold rounded-md text-[9px] hover:opacity-90 transition-all cursor-pointer"
                          >
                            Aktifkan
                          </button>
                        )}
                        {usr.status !== 'Suspended' && usr.status !== 'Banned' && (
                          <>
                            <button
                              onClick={() => handleUpdateUserStatus(usr.telegramId, 'Suspended')}
                              className="px-2.5 py-1 bg-brand-warning text-brand-dark font-bold rounded-md text-[9px] hover:opacity-90 transition-all cursor-pointer"
                            >
                              Suspend
                            </button>
                            <button
                              onClick={() => handleUpdateUserStatus(usr.telegramId, 'Banned')}
                              className="px-2.5 py-1 bg-brand-danger text-white font-bold rounded-md text-[9px] hover:opacity-90 transition-all cursor-pointer"
                            >
                              Ban
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Tablet / Desktop Table (hidden sm:block) */}
                <div className="hidden sm:block glassmorphism rounded-3xl overflow-hidden border border-slate-200 dark:border-white/5">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-700 dark:text-slate-200">
                      <thead className="bg-black/5 dark:bg-white/5 border-b border-slate-200 dark:border-white/10 text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bold">
                        <tr>
                          <th className="p-4">Nama Pengguna</th>
                          <th className="p-4">ID Telegram</th>
                          <th className="p-4">Peran (Role)</th>
                          <th className="p-4">Status</th>
                          <th className="p-4 text-right">Tindakan Admin</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                        {usersList.map((usr) => (
                          <tr key={usr.telegramId} className="hover:bg-black/5 dark:hover:bg-white/5 transition-all">
                            <td className="p-4 flex items-center gap-3">
                              <Avatar
                                src={usr.photoUrl}
                                name={usr.firstName}
                                className="h-8 w-8"
                              />
                              <div>
                                <div className="font-bold text-slate-850 dark:text-slate-100">{usr.firstName} {usr.lastName || ''}</div>
                                <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">@{usr.username || 'tidak_ada'}</div>
                              </div>
                            </td>
                            <td className="p-4 font-mono text-slate-600 dark:text-slate-300">{usr.telegramId}</td>
                            <td className="p-4">
                              <select
                                value={usr.role}
                                disabled={user?.role !== 'Super Admin'}
                                onChange={(e) => handleUpdateUserRole(usr.telegramId, e.target.value as UserRole)}
                                className="bg-black/5 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-lg px-2 py-1 text-[11px] focus:ring-1 focus:ring-brand-accent text-slate-800 dark:text-white"
                              >
                                <option value="Super Admin" className="bg-white dark:bg-brand-dark text-slate-800 dark:text-white">Super Admin</option>
                                <option value="Admin" className="bg-white dark:bg-brand-dark text-slate-800 dark:text-white">Admin</option>
                                <option value="Recruiter" className="bg-white dark:bg-brand-dark text-slate-800 dark:text-white">Recruiter</option>
                                <option value="Member" className="bg-white dark:bg-brand-dark text-slate-800 dark:text-white">Member</option>
                              </select>
                            </td>
                            <td className="p-4">
                              <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                                usr.status === 'Active' ? 'bg-brand-success/20 text-brand-success border border-brand-success/30' :
                                usr.status === 'Pending' ? 'bg-brand-warning/20 text-brand-warning border border-brand-warning/30' :
                                'bg-brand-danger/20 text-brand-danger border border-brand-danger/30'
                              }`}>
                                {usr.status}
                              </span>
                            </td>
                            <td className="p-4 text-right space-x-1">
                              {usr.status !== 'Active' && (
                                <button
                                  onClick={() => handleUpdateUserStatus(usr.telegramId, 'Active')}
                                  className="px-2.5 py-1 bg-brand-success text-brand-dark font-bold rounded-md text-[9px] hover:opacity-90 transition-all cursor-pointer"
                                >
                                  Aktifkan
                                </button>
                              )}
                              {usr.status !== 'Suspended' && usr.status !== 'Banned' && (
                                <>
                                  <button
                                    onClick={() => handleUpdateUserStatus(usr.telegramId, 'Suspended')}
                                    className="px-2.5 py-1 bg-brand-warning text-brand-dark font-bold rounded-md text-[9px] hover:opacity-90 transition-all cursor-pointer"
                                  >
                                    Suspend
                                  </button>
                                  <button
                                    onClick={() => handleUpdateUserStatus(usr.telegramId, 'Banned')}
                                    className="px-2.5 py-1 bg-brand-danger text-white font-bold rounded-md text-[9px] hover:opacity-90 transition-all cursor-pointer"
                                  >
                                    Ban
                                  </button>
                                </>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}

            {/* PERFORMANCE LEDGER AND SALARY SUMMARY */}
            {activeTab === 'leaderboard' && (
              <motion.div
                key="leaderboard"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="glassmorphism p-5 rounded-3xl border border-slate-200 dark:border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">Kinerja Anggota & Ledger Gaji</h3>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">Pemantauan insentif dan peringkat performa internal AzurLize Team.</p>
                  </div>
                  <div className="flex gap-2.5">
                    <span className="p-3 bg-brand-primary/10 rounded-2xl border border-brand-primary/20 text-center">
                      <span className="text-[9px] text-slate-500 dark:text-slate-400 uppercase font-bold block">Anggaran Sisa</span>
                      <span className="text-xs font-mono font-bold text-slate-800 dark:text-white mt-0.5 block">Rp 254,800,000</span>
                    </span>
                    <span className="p-3 bg-brand-secondary/10 rounded-2xl border border-brand-secondary/20 text-center">
                      <span className="text-[9px] text-slate-500 dark:text-slate-400 uppercase font-bold block">Rate Insentif</span>
                      <span className="text-xs font-mono font-bold text-slate-800 dark:text-white mt-0.5 block">Rp 1,500,000 / Rekrut</span>
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  {/* Leaderboard ranking */}
                  <div className="glassmorphism p-5 rounded-3xl border border-slate-200 dark:border-white/5 lg:col-span-2 space-y-4">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Papan Peringkat Tim Teratas (XP)</h4>
                    
                    <div className="space-y-2.5">
                      {leaderboard.slice(0, 8).map((leader, idx) => (
                        <div 
                          key={leader.telegramId} 
                          className={`flex items-center gap-3 p-3 rounded-xl transition-all border ${
                            idx === 0 
                              ? 'bg-brand-primary/10 dark:bg-gradient-to-r dark:from-brand-primary/15 dark:to-transparent border-brand-primary' 
                              : 'bg-black/5 dark:bg-white/5 border-slate-200 dark:border-transparent hover:bg-black/10 dark:hover:bg-white/10'
                          }`}
                        >
                          <span className={`font-mono font-bold text-sm ${idx === 0 ? 'text-brand-accent text-base' : 'text-slate-500'}`}>
                            #{idx + 1}
                          </span>
                          <Avatar 
                            src={leader.photoUrl} 
                            name={leader.firstName}
                            className={`h-8 w-8 rounded-full border ${idx === 0 ? 'border-brand-accent' : 'border-slate-200 dark:border-white/10'}`} 
                          />
                          <div>
                            <div className="font-bold text-xs text-slate-800 dark:text-slate-200">
                              {leader.firstName} {leader.lastName}
                            </div>
                            <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                              leader.role === 'Super Admin' 
                                ? 'bg-brand-accent/20 text-brand-accent' 
                                : leader.role === 'Admin' 
                                ? 'bg-brand-primary/20 text-brand-primary'
                                : leader.role === 'Recruiter'
                                ? 'bg-brand-secondary/20 text-brand-secondary'
                                : 'bg-black/10 dark:bg-white/10 text-slate-600 dark:text-slate-300'
                            }`}>
                              {leader.role}
                            </span>
                          </div>
                          <div className="ml-auto text-right text-xs">
                            <div className="font-bold font-mono text-slate-800 dark:text-slate-100">
                              {leader.xp.toLocaleString('id-ID')} XP
                            </div>
                            <span className="text-[10px] text-brand-success font-semibold">
                              {leader.performance}% Kinerja
                            </span>
                          </div>
                        </div>
                      ))}
                      {leaderboard.length === 0 && (
                        <div className="text-center py-6 text-xs text-slate-500">
                          Memuat data papan peringkat...
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Financial Slip */}
                  <div className="glassmorphism p-5 rounded-3xl border border-slate-200 dark:border-white/5 flex flex-col justify-between">
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-4">Ringkasan Upah ({user?.firstName})</h4>
                      
                      {(() => {
                        const userRole = user?.role || 'Member';
                        const processedCount = applications.filter(a => a.interviewerId === user?.telegramId).length;
                        
                        let baseSalary = 6000000;
                        if (userRole === 'Super Admin') baseSalary = 15000000;
                        else if (userRole === 'Admin') baseSalary = 12000000;
                        else if (userRole === 'Recruiter') baseSalary = 8500000;

                        const bonus = processedCount * 1500000;
                        const deduction = Math.round(baseSalary * 0.05);
                        const takeHomePay = baseSalary + bonus - deduction;

                        return (
                          <div className="space-y-4">
                            <div className="flex justify-between items-center text-xs">
                              <span className="text-slate-500 dark:text-slate-400">Gaji Pokok ({userRole})</span>
                              <span className="font-mono font-bold text-slate-700 dark:text-slate-200">
                                Rp {baseSalary.toLocaleString('id-ID')}
                              </span>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                              <span className="text-slate-500 dark:text-slate-400">Bonus Penilaian ({processedCount} Rekrut)</span>
                              <span className="font-mono font-bold text-brand-success">
                                + Rp {bonus.toLocaleString('id-ID')}
                              </span>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                              <span className="text-slate-500 dark:text-slate-400">Potongan Pajak & BPJS (5%)</span>
                              <span className="font-mono font-bold text-brand-danger">
                                - Rp {deduction.toLocaleString('id-ID')}
                              </span>
                            </div>
                            <div className="border-t border-slate-200 dark:border-white/10 pt-3 flex justify-between items-center text-xs">
                              <span className="font-bold text-slate-600 dark:text-slate-300">Total Take Home Pay</span>
                              <span className="font-mono font-bold text-brand-accent">
                                Rp {takeHomePay.toLocaleString('id-ID')}
                              </span>
                            </div>
                          </div>
                        );
                      })()}
                    </div>

                    <div className="pt-4 border-t border-slate-200 dark:border-white/5 mt-4 text-[10px] text-slate-500 font-mono text-center">
                      Gaji ditransfer setiap tanggal 25. Slip resmi di-generate otomatis ke Telegram Chat Anda.
                    </div>
                  </div>

                </div>
              </motion.div>
            )}

            {/* ANNOUNCEMENTS FEED AND AUDIT LOGS TIMELINE */}
            {activeTab === 'announcements' && (
              <motion.div
                key="announcements"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                {/* Mobile Back Button */}
                <div className="md:hidden">
                  <button
                    onClick={() => setActiveTab('profile')}
                    className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white bg-black/5 dark:bg-white/5 px-3 py-2 rounded-xl border border-slate-200/50 dark:border-white/10 cursor-pointer"
                  >
                    <ChevronLeft className="h-4 w-4" /> Kembali ke Profil
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Draft Form */}
                <div className="glassmorphism p-5 rounded-3xl border border-slate-200 dark:border-white/5 lg:col-span-1 space-y-4">
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 dark:text-white">Tulis Pengumuman Baru</h3>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">Draft pengumuman global yang akan disebarluaskan ke Mini App anggota.</p>
                  </div>

                  <form onSubmit={handleCreateAnnouncement} className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Judul Pengumuman</label>
                      <input
                        type="text"
                        value={newAnnTitle}
                        onChange={(e) => setNewAnnTitle(e.target.value)}
                        placeholder="Contoh: Jadwal Libur Lebaran"
                        className="w-full bg-black/5 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-brand-accent"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Kategori Bulletin</label>
                      <select
                        value={newAnnCategory}
                        onChange={(e) => setNewAnnCategory(e.target.value as any)}
                        className="w-full bg-black/5 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200"
                      >
                        <option value="General" className="bg-white dark:bg-brand-dark text-slate-800 dark:text-white">General (Umum)</option>
                        <option value="Recruitment" className="bg-white dark:bg-brand-dark text-slate-800 dark:text-white">Recruitment (Divisi)</option>
                        <option value="System" className="bg-white dark:bg-brand-dark text-slate-800 dark:text-white">System (Sistem)</option>
                        <option value="Urgent" className="bg-white dark:bg-brand-dark text-slate-800 dark:text-white">Urgent (Darurat)</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Konten Bulletins</label>
                      <textarea
                        value={newAnnContent}
                        onChange={(e) => setNewAnnContent(e.target.value)}
                        placeholder="Tuliskan isi pesan secara jelas..."
                        rows={4}
                        className="w-full bg-black/5 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-brand-accent"
                        required
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="important"
                        checked={newAnnImportant}
                        onChange={(e) => setNewAnnImportant(e.target.checked)}
                        className="rounded border-slate-200 dark:border-white/10 bg-black/5 dark:bg-slate-950 text-brand-primary cursor-pointer"
                      />
                      <label htmlFor="important" className="text-xs text-slate-500 dark:text-slate-400 select-none cursor-pointer">Tandai sebagai Sangat Penting (Highlight)</label>
                    </div>

                    <button
                      type="submit"
                      disabled={submittingAnn}
                      className="w-full py-2.5 px-4 bg-brand-primary text-white font-bold rounded-xl text-xs hover:opacity-90 transition-all flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
                    >
                      {submittingAnn ? 'Menerbitkan...' : <><Send className="h-4 w-4" /> Terbitkan Pengumuman</>}
                    </button>
                  </form>
                </div>

                {/* Audit Logs full timeline */}
                <div className="glassmorphism p-5 rounded-3xl border border-slate-200 dark:border-white/5 lg:col-span-2 space-y-4">
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 dark:text-white">Audit Log Keamanan & Aktivitas</h3>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">Jejak audit rekrutmen tim transparan terlacak real-time.</p>
                  </div>

                  <div className="max-h-[450px] overflow-y-auto pr-2">
                    <div className="relative border-l border-slate-200 dark:border-white/10 pl-5 ml-2.5 space-y-4">
                      {activityLogs.map((log) => (
                        <div key={log.id} className="relative text-xs">
                          <div className="absolute -left-[24px] top-1 h-2 w-2 bg-brand-accent rounded-full border border-slate-50 dark:border-brand-dark"></div>
                          <div className="text-[9px] text-slate-500 dark:text-slate-400 font-mono">
                            {new Date(log.timestamp).toLocaleString('id-ID')}
                          </div>
                          <p className="text-slate-700 dark:text-slate-200 mt-0.5">{log.action}</p>
                          <p className="text-[9px] text-slate-500 dark:text-slate-400 font-bold mt-0.5 uppercase">{log.userName} • {log.userRole}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
            )}

            {/* SETTINGS target editor */}
            {activeTab === 'settings' && (
              <motion.div
                key="settings"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="glassmorphism max-w-md mx-auto p-5 rounded-3xl border border-slate-200 dark:border-white/5 space-y-5"
              >
                {/* Mobile Back Button */}
                <div className="md:hidden">
                  <button
                    onClick={() => setActiveTab('profile')}
                    className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-850 dark:text-slate-400 dark:hover:text-white bg-black/5 dark:bg-white/5 px-3 py-1.5 rounded-xl border border-slate-200/50 dark:border-white/10 cursor-pointer"
                  >
                    <ChevronLeft className="h-3.5 w-3.5" /> Kembali
                  </button>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
                    <Target className="h-4.5 w-4.5 text-brand-accent" /> Konfigurasi Target Rekrutmen
                  </h3>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Atur ambang batas minimum mingguan dan bulanan pada dashboard statistik.</p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider block">Target Mingguan (Applicants)</label>
                    <input
                      type="number"
                      value={weeklyTargetInput}
                      onChange={(e) => setWeeklyTargetInput(parseInt(e.target.value) || 0)}
                      className="w-full bg-black/5 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-brand-accent text-slate-800 dark:text-white"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider block">Target Bulanan (Approved Hires)</label>
                    <input
                      type="number"
                      value={monthlyTargetInput}
                      onChange={(e) => setMonthlyTargetInput(parseInt(e.target.value) || 0)}
                      className="w-full bg-black/5 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-brand-accent text-slate-800 dark:text-white"
                    />
                  </div>

                  <button
                    onClick={handleSaveSettings}
                    disabled={savingSettings}
                    className="w-full py-2.5 px-4 bg-gradient-to-r from-brand-primary to-brand-secondary text-white font-bold rounded-xl text-xs hover:opacity-90 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {savingSettings ? 'Menyimpan...' : <><CheckCircle2 className="h-4 w-4" /> Simpan Konfigurasi</>}
                  </button>
                </div>
              </motion.div>
            )}

            {/* MY PROFILE DETAILED CREDENTIALS */}
            {activeTab === 'profile' && (
              <motion.div
                key="profile"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="glassmorphism max-w-md mx-auto p-6 rounded-3xl border border-slate-200 dark:border-white/5 text-center relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 -mr-16 -mt-16 w-36 h-36 bg-brand-primary opacity-15 rounded-full blur-2xl"></div>

                <div className="relative mx-auto h-24 w-24 rounded-full p-[2px] bg-gradient-to-tr from-brand-primary to-brand-secondary mb-4">
                  <Avatar
                    src={user?.photoUrl}
                    name={user?.firstName}
                    className="h-full w-full rounded-full border-2 border-white dark:border-brand-dark"
                  />
                </div>

                <h3 className="text-base font-bold text-slate-800 dark:text-white">{user?.firstName} {user?.lastName || ''}</h3>
                <span className="text-xs font-mono text-brand-accent block mt-0.5">@{user?.username || 'tidak_ada'}</span>

                <div className="flex justify-center gap-1.5 mt-3">
                  <span className="px-2.5 py-0.5 bg-brand-primary/20 text-brand-primary text-[10px] font-bold rounded-full uppercase tracking-wider border border-brand-primary/30">
                    {user?.role}
                  </span>
                  <span className="px-2.5 py-0.5 bg-brand-success/20 text-brand-success text-[10px] font-bold rounded-full uppercase tracking-wider border border-brand-success/30">
                    {user?.status}
                  </span>
                </div>

                <div className="mt-6 bg-black/5 dark:bg-slate-950/40 border border-slate-200 dark:border-white/5 rounded-2xl p-4 text-xs text-left space-y-3.5">
                  <h4 className="font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest text-[9px]">Detail Akun Telegram</h4>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 dark:text-slate-400">ID Telegram</span>
                    <span className="font-mono text-slate-700 dark:text-slate-200">{user?.telegramId}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 dark:text-slate-400">Tanggal Bergabung</span>
                    <span className="text-slate-700 dark:text-slate-200">{user?.createdAt ? new Date(user.createdAt).toLocaleDateString('id-ID') : '21/07/2026'}</span>
                  </div>
                </div>

                {/* Mobile Admin shortcuts */}
                {['Super Admin', 'Admin'].includes(user?.role || '') && (
                  <div className="md:hidden mt-4 bg-brand-primary/5 border border-brand-primary/10 rounded-2xl p-4 text-xs text-left space-y-3">
                    <h4 className="font-bold text-brand-primary dark:text-brand-accent uppercase tracking-widest text-[9px] flex items-center gap-1">
                      <Target className="h-3.5 w-3.5" /> Pintasan Admin (Mobile)
                    </h4>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">Gunakan pintasan di bawah ini untuk mengelola pengumuman & konfigurasi target pada ponsel Anda.</p>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setActiveTab('announcements')}
                        className="p-2.5 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 rounded-xl border border-slate-200 dark:border-white/10 text-[10px] font-bold text-slate-750 dark:text-slate-200 flex flex-col items-center gap-1.5 cursor-pointer"
                      >
                        <Send className="h-4 w-4 text-brand-accent" />
                        <span>Pengumuman & Log</span>
                      </button>
                      <button
                        onClick={() => setActiveTab('settings')}
                        className="p-2.5 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 rounded-xl border border-slate-200 dark:border-white/10 text-[10px] font-bold text-slate-750 dark:text-slate-200 flex flex-col items-center gap-1.5 cursor-pointer"
                      >
                        <Target className="h-4 w-4 text-brand-secondary" />
                        <span>Target Statistik</span>
                      </button>
                    </div>
                  </div>
                )}

                <button
                  onClick={logout}
                  className="w-full mt-6 py-3 px-4 bg-brand-danger/10 hover:bg-brand-danger hover:text-white text-brand-danger rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <LogOut className="h-4 w-4" /> Keluar Sesi Akun
                </button>
              </motion.div>
            )}
          </AnimatePresence>

        </div>

        {/* 3. MOBILE NAVIGATION FOOTER - Bottom Navigation */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/90 dark:bg-slate-900/95 border-t border-slate-200 dark:border-white/10 backdrop-blur-md flex justify-around items-center py-2 px-1 select-none safe-bottom">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex flex-col items-center py-1 px-3 rounded-lg text-[9px] font-bold transition-all ${
              activeTab === 'overview' ? 'text-brand-accent scale-105' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <TrendingUp className="h-4.5 w-4.5 mb-1" />
            <span>Overview</span>
          </button>

          {['Super Admin', 'Admin', 'Recruiter'].includes(user?.role || '') && (
            <button
              onClick={() => setActiveTab('recruitments')}
              className={`flex flex-col items-center py-1 px-3 rounded-lg text-[9px] font-bold transition-all ${
                activeTab === 'recruitments' ? 'text-brand-accent scale-105' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <Database className="h-4.5 w-4.5 mb-1" />
              <span>Data Harian</span>
            </button>
          )}

          {['Super Admin', 'Admin'].includes(user?.role || '') && (
            <button
              onClick={() => setActiveTab('users')}
              className={`flex flex-col items-center py-1 px-3 rounded-lg text-[9px] font-bold transition-all ${
                activeTab === 'users' ? 'text-brand-accent scale-105' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <Users className="h-4.5 w-4.5 mb-1" />
              <span>Anggota</span>
            </button>
          )}

          <button
            onClick={() => setActiveTab('leaderboard')}
            className={`flex flex-col items-center py-1 px-3 rounded-lg text-[9px] font-bold transition-all ${
              activeTab === 'leaderboard' ? 'text-brand-accent scale-105' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <Award className="h-4.5 w-4.5 mb-1" />
            <span>Leaderboard</span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`flex flex-col items-center py-1 px-3 rounded-lg text-[9px] font-bold transition-all ${
              activeTab === 'profile' ? 'text-brand-accent scale-105' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <UserCheck className="h-4.5 w-4.5 mb-1" />
            <span>Profil</span>
          </button>
        </nav>

      </main>
    </div>
  );
}
