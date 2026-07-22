// Konfigurasi Aplikasi (Mudah diedit langsung di GitHub)
// Pengaturan ini akan ditimpa jika menggunakan variabel environment (.env)

window.APP_CONFIG = {
  // 1. Pengaturan Bot Telegram
  BOT_USERNAME: "azurlize_recruitment_bot",
  
  // 2. URL API Backend (Isi dengan URL Cloud Run atau server backend jika frontend di-host di GitHub Pages)
  // Contoh: "https://backend-api.run.app"
  // Biarkan kosong "" jika frontend dan backend digabung dalam satu server.
  API_URL: "",

  // 3. Konfigurasi Firebase (Digunakan oleh frontend)
  FIREBASE: {
    apiKey: "",
    authDomain: "",
    projectId: "",
    storageBucket: "",
    messagingSenderId: "",
    appId: "",
    measurementId: ""
  }
};
