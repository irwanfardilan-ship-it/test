# AzurLize Team - Telegram Mini Web App Recruitment System
> Enterprise Recruitment Management Platform for AzurLize Team Developers Guild.

Sistem Manajemen Rekrutmen Internal kelas enterprise yang dirancang khusus sebagai **Telegram Mini Web App** dengan UI premium (Glassmorphic, responsive, smooth animations) serta arsitektur backend yang aman dan andal.

---

## 🗺️ Diagram Arsitektur Sistem

```
┌────────────────────────────────────────────────────────────────────────┐
│                        TELEGRAM MINI WEB APP                           │
├────────────────────────────────────────────────────────────────────────┤
│                     React 19 + Framer Motion                           │
│                                │                                       │
│    (1) Kirim WebApp.initData   │  (4) Respon Token & Profil            │
│        via Header/Auth POST    ▼                                       │
│ ┌────────────────────────────────────────────────────────────────────┐ │
│ │                        EXPRESS BACKEND CORE                        │ │
│ ├────────────────────────────────────────────────────────────────────┤ │
│ │  - Autentikasi JWT & Guard Peran (Admin/Recruiter/Member)          │ │
│ │  - Verifikasi Kriptografis HMAC-SHA256 (Telegram Signature Hash)   │ │
│ └──────────────────────────────┬─────────────────────────────────────┘ │
│                                │                                       │
│          (2) Query / Simpan    ▼                                       │
│ ┌────────────────────────────────────────────────────────────────────┐ │
│ │                         DATABASE ENGINE                            │ │
│ ├────────────────────────────────────────────────────────────────────┤ │
│ │  Dual-Mode: Local DB (database.json) <──> Cloud Firestore (Prod)   │ │
│ └────────────────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 📂 Struktur Proyek (Clean Architecture)

Sistem ini disusun mengikuti prinsip Clean Architecture yang modular, modularisasi folder, dan mudah dipelihara:

```
├── database.json          # Persistent Local Database (Fallback)
├── server.ts              # Express Backend Core (API & Vite SSR Middleware)
├── package.json           # Dependensi Proyek & Script Otomasi Build
├── metadata.json          # Meta data & Perizinan iFrame AI Studio
├── src/                   # Kode Frontend React 19
│   ├── App.tsx            # Root State Controller (State-Routing View)
│   ├── index.css          # Desain Sistem Tailwind v4 & Custom Utility Styles
│   ├── store.ts           # State Management Utama (Zustand & Cache API)
│   ├── types.ts           # Deklarasi Type-Safety TypeScript Global
│   ├── components/        # Presentational & Interactive Components
│   │   ├── Splash.tsx     # Fullscreen Glassmorphic Splash Screen
│   │   ├── Simulator.tsx  # Floating Sandbox Tester Console Panel
│   │   ├── ApplyForm.tsx  # Formulir Pendaftaran Lamaran Kerja Dinamis
│   │   ├── PendingView.tsx# Halaman Persetujuan Tertunda (Waiting Room)
│   │   ├── BannedView.tsx # Halaman Akun Diblokir Permanen (Warning)
│   │   ├── RejectedView.tsx# Halaman Lamaran Belum Disetujui (Re-apply)
│   │   └── SuspendedView.tsx# Halaman Akun Ditangguhkan Sementara
│   └── pages/
│       └── DashboardView.tsx # Enterprise SaaS Workspace Dashboard (Admin/Recruiter/Member)
```

---

## 🚀 Cara Menjalankan Secara Lokal

### Prasyarat
- **Node.js** v18 atau lebih baru.
- **npm** atau **yarn**.

### Langkah-Langkah

1. **Clone repositori** dan masuk ke direktori proyek.
2. **Instal seluruh dependensi**:
   ```bash
   npm install
   ```
3. **Konfigurasi Environment**:
   Salin file `.env.example` menjadi `.env`:
   ```bash
   cp .env.example .env
   ```
   Isi variabel sesuai kebutuhan (lihat bagian Konfigurasi di bawah).

4. **Jalankan dalam Mode Pengembangan (Full-Stack)**:
   ```bash
   npm run dev
   ```
   Server backend Express dan frontend Vite akan berjalan bersama di port **3000** (`http://localhost:3000`).

5. **Build untuk Produksi**:
   ```bash
   npm run build
   ```
   Frontend akan dikompilasi ke folder `dist/` dan backend akan di-bundle menjadi berkas tunggal `dist/server.cjs` menggunakan esbuild.

6. **Jalankan dalam Mode Produksi**:
   ```bash
   npm run start
   ```

---

## ⚙️ Mengatur Environment Variables (`.env`)

Buat file `.env` di direktori utama dan isi variabel berikut untuk produksi:

```env
# Kunci rahasia untuk enkripsi token otorisasi JWT
JWT_SECRET="ganti-dengan-rahasia-jwt-pilihan-anda"

# Token Bot Telegram dari BotFather (Wajib untuk validasi data asli Telegram)
TELEGRAM_BOT_TOKEN="123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ"

# Kredensial Akun Layanan Firebase Admin SDK (Format stringified JSON)
# Jika dikosongkan, sistem akan otomatis beralih menggunakan Local DB (database.json) secara mandiri.
FIREBASE_SERVICE_ACCOUNT='{"type":"service_account","project_id":"..."}'
```

---

## 🤖 Cara Membuat Bot Telegram & Menghubungkan ke Mini App

1. **Dapatkan Token Bot Telegram**:
   - Cari Bot **@BotFather** di Telegram.
   - Kirim perintah `/newbot`.
   - Masukkan nama bot Anda (contoh: `AzurLize Recruitment Bot`).
   - Masukkan username bot Anda (contoh: `azurlize_recruitment_bot`).
   - Simpan **HTTP API Token** yang diberikan oleh BotFather dan isi ke variabel `TELEGRAM_BOT_TOKEN` di `.env` Anda.

2. **Membuat Telegram Mini Web App**:
   - Kirim perintah `/newapp` ke **@BotFather**.
   - Pilih bot yang baru Anda buat (`@azurlize_recruitment_bot`).
   - Masukkan Judul Mini App (contoh: `AzurLize Hub`).
   - Masukkan Deskripsi singkat Mini App Anda.
   - Unggah gambar ikon Mini App (640x360 piksel).
   - Masukkan **Web App URL**:
     - Untuk lokal: `https://localhost:3000/` (atau gunakan alat tunneling seperti `ngrok` untuk mengekspos port 3000 Anda ke HTTPS publik agar bisa diuji langsung di Telegram).
     - Untuk produksi: Masukkan URL deploy Render Anda (misal: `https://azurlize-recruitment.onrender.com/`).
   - Tentukan short name Mini App Anda (contoh: `recruitment`).
   - BotFather akan memberikan tautan Mini App Anda (contoh: `t.me/azurlize_recruitment_bot/recruitment`).

---

## 🔥 Cara Konfigurasi Firebase (Firestore)

Aplikasi ini mendukung sinkronisasi data instan ke **Google Cloud Firestore**.

1. Buka **[Firebase Console](https://console.firebase.google.com/)** dan buat proyek baru bernama `AzurLize Recruitment`.
2. Masuk ke tab **Build** -> **Firestore Database** dan klik **Create Database**. Pilih mode produksi atau pengujian dan pilih wilayah terdekat (misal: `asia-southeast1` untuk Indonesia).
3. Buat Koleksi Firestore berikut:
   - `users` (Menampung kredensial Telegram, peran, dan status).
   - `applications` (Menampung berkas lamaran rekrutmen kerja).
   - `announcements` (Menampung bulletin pengumuman internal).
   - `logs` (Menampung jejak audit audit-log aktivitas admin).
4. **Unduh Service Account JSON**:
   - Buka **Project Settings** (Ikon gerigi di kiri atas) -> **Service Accounts**.
   - Klik **Generate New Private Key** untuk mengunduh berkas `.json`.
   - Ubah isi berkas `.json` tersebut menjadi satu baris string dan isi ke variabel `FIREBASE_SERVICE_ACCOUNT` di `.env`.

---

## 🚀 Panduan Deployment Produksi

### 1. Backend & Server Node.js (Deploy ke Render)
1. Buat akun di **[Render](https://render.com/)**.
2. Klik **New +** -> **Web Service**.
3. Hubungkan akun GitHub Anda dan pilih repositori proyek ini.
4. Konfigurasikan detail Layanan Web:
   - **Environment**: `Node`
   - **Build Command**: `npm run build`
   - **Start Command**: `npm run start`
5. Buka bagian **Advanced** dan tambahkan variabel lingkungan Anda (`JWT_SECRET`, `TELEGRAM_BOT_TOKEN`, `FIREBASE_SERVICE_ACCOUNT`).
6. Klik **Deploy Web Service**. Render akan membuat container HTTPS gratis untuk Anda.

### 2. Deployment Frontend Saja (GitHub Pages)
Untuk pengiriman pipeline CI/CD otomatis ketika melakukan push ke branch `main`, tambahkan berkas alur kerja GitHub Actions `.github/workflows/deploy.yml` dengan langkah berikut:

```yaml
name: Deploy Frontend to GitHub Pages

on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Code
        uses: actions/checkout@v3

      - name: Install Node.js
        uses: actions/setup-node@v3
        with:
          node-version: 18

      - name: Install & Build
        run: |
          npm install
          npm run build

      - name: Deploy to GitHub Pages
        uses: JamesIves/github-pages-deploy-action@v4
        with:
          folder: dist
          branch: gh-pages
```

---

## 🔒 Fitur Keamanan Backend

Backend diimplementasikan dengan standar keamanan tingkat tinggi:
- **JWT Authorization Guards**: Seluruh API krusial dilindungi token JWT yang ditandatangani secara kriptografis.
- **Verifikasi HMAC-SHA256**: Autentikasi Telegram diverifikasi langsung menggunakan `BOT_TOKEN` dan salt `WebAppData` sehingga tidak dapat dipalsukan oleh frontend.
- **Helmet Security Middleware**: Melindungi aplikasi dari serangan injeksi XSS, clickjacking, dan pencurian MIME.
- **API Rate Limiting**: Membatasi serangan brute-force dengan membatasi IP maksimal 300 permintaan per 15 menit.
- **Role Permission Middleware**: Memisahkan izin operasional dengan ketat. Hanya `Super Admin` yang dapat merubah struktur peran, dan hanya `Admin/Recruiter` yang dapat mengubah status seleksi atau mengakses data log audit.

---

AzurLize Team Recruitment Platform dirancang dengan penuh dedikasi oleh Google AI Studio. Nikmati pengalaman rekrutmen premium kelas dunia!
