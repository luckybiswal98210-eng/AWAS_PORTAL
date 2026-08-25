/**
 * Universal Database Adapter for MongoDB Atlas / Serverless DB & Real-time Live Store
 */

const STORAGE_APPLICATIONS_KEY = 'awas_india_applications_live';
const STORAGE_USERS_KEY = 'awas_india_users_live';
const STORAGE_CURRENT_USER_KEY = 'awas_india_current_user';
const STORAGE_TRAININGS_KEY = 'awas_india_trainings_live';
const STORAGE_EMAILS_KEY = 'awas_india_emails_live';
const STORAGE_AUDIO_KEY = 'awas_india_audio_announcement_live';

const DEFAULT_AUDIO_ANNOUNCEMENT = {
  id: 'announcement_2026_08_25',
  title: 'Official AWAS Yojana Audio Announcement / आवास योजना आधिकारिक घोषणा',
  english_audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
  hindi_audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
  english_file_name: 'awas_announcement_english_latest.mp3',
  hindi_file_name: 'awas_announcement_hindi_latest.mp3',
  is_enabled: true,
  autoplay: false,
  published_at: new Date().toISOString(),
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};

export const isMongoConfigured = () => {
  return !!import.meta.env.VITE_MONGODB_API_URL;
};

export const dbService = {
  // Get all applications (Empty by default for fresh data, or returns live list)
  getApplications: async () => {
    if (isMongoConfigured()) {
      try {
        const res = await fetch(`${import.meta.env.VITE_MONGODB_API_URL}/api/applications`);
        if (res.ok) return await res.json();
      } catch (e) {
        console.warn('MongoDB endpoint unavailable, using live local store', e);
      }
    }

    const saved = localStorage.getItem(STORAGE_APPLICATIONS_KEY);
    return saved ? JSON.parse(saved) : [];
  },

  // Save new beneficiary application
  saveApplication: async (applicationData) => {
    if (isMongoConfigured()) {
      try {
        const res = await fetch(`${import.meta.env.VITE_MONGODB_API_URL}/api/applications`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(applicationData)
        });
        if (res.ok) return await res.json();
      } catch (e) {
        console.warn('MongoDB save failed, using live local store', e);
      }
    }

    const existing = await dbService.getApplications();
    const newRecord = {
      ...applicationData,
      id: 'app_' + Date.now(),
      created_at: new Date().toISOString().split('T')[0],
      application_date: applicationData.application_date || new Date().toISOString().split('T')[0],
      status: applicationData.status || 'Active'
    };
    existing.unshift(newRecord);
    localStorage.setItem(STORAGE_APPLICATIONS_KEY, JSON.stringify(existing));

    // Also auto-add applicant to user list if not exists
    if (applicationData.applicant_full_name) {
      await dbService.saveUser({
        full_name: applicationData.applicant_full_name,
        email: applicationData.email_address || 'N/A',
        mobile: applicationData.mobile_number || 'N/A',
        state: applicationData.present_address?.state || 'Odisha',
        role: 'user'
      });
    }

    return newRecord;
  },

  // Get all registered users
  getUsers: async () => {
    if (isMongoConfigured()) {
      try {
        const res = await fetch(`${import.meta.env.VITE_MONGODB_API_URL}/api/users`);
        if (res.ok) return await res.json();
      } catch (e) {
        console.warn('MongoDB endpoint unavailable, using live local store', e);
      }
    }

    const saved = localStorage.getItem(STORAGE_USERS_KEY);
    return saved ? JSON.parse(saved) : [];
  },

  // Save registered user profile
  saveUser: async (userData) => {
    const users = await dbService.getUsers();
    const exists = users.find(u => u.email === userData.email && userData.email !== 'N/A');
    if (!exists) {
      const newUser = {
        id: 'usr_' + Date.now(),
        full_name: userData.full_name || userData.fullName || 'New User',
        email: userData.email || 'N/A',
        state: userData.state || 'Odisha',
        created_at: new Date().toISOString().split('T')[0],
        is_blocked: false,
        role: userData.role || 'user'
      };
      users.unshift(newUser);
      localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(users));
      return newUser;
    }
    return exists;
  },

  // Toggle user block/unblock status
  toggleUserBlock: async (userId) => {
    const users = await dbService.getUsers();
    const index = users.findIndex(u => u.id === userId);
    if (index !== -1) {
      users[index].is_blocked = !users[index].is_blocked;
      localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(users));
      return users[index];
    }
    return null;
  },

  // Update application status & schedule training
  scheduleTraining: async (formNo, trainingData) => {
    const apps = await dbService.getApplications();
    const index = apps.findIndex(a => a.form_no === formNo || a.id === formNo);
    if (index !== -1) {
      apps[index].status = 'Training Scheduled';
      apps[index].training = trainingData;
      localStorage.setItem(STORAGE_APPLICATIONS_KEY, JSON.stringify(apps));
      return apps[index];
    }
    return null;
  },

  // Log email notification
  logEmailNotification: async (formNo, emailData) => {
    const saved = localStorage.getItem(STORAGE_EMAILS_KEY);
    const emails = saved ? JSON.parse(saved) : [];
    const newLog = {
      id: 'email_' + Date.now(),
      form_no: formNo,
      ...emailData,
      sent_at: new Date().toLocaleString()
    };
    emails.unshift(newLog);
    localStorage.setItem(STORAGE_EMAILS_KEY, JSON.stringify(emails));
    return newLog;
  },

  // -------------------------------------------------------------
  // AUDIO ANNOUNCEMENT MANAGEMENT
  // -------------------------------------------------------------
  getAudioAnnouncement: async () => {
    try {
      const saved = localStorage.getItem(STORAGE_AUDIO_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
      localStorage.setItem(STORAGE_AUDIO_KEY, JSON.stringify(DEFAULT_AUDIO_ANNOUNCEMENT));
      return DEFAULT_AUDIO_ANNOUNCEMENT;
    } catch (e) {
      return DEFAULT_AUDIO_ANNOUNCEMENT;
    }
  },

  saveAudioAnnouncement: async (announcementData, adminUser) => {
    try {
      const existing = await dbService.getAudioAnnouncement();
      const updated = {
        ...existing,
        ...announcementData,
        updated_at: new Date().toISOString(),
        published_at: announcementData.published_at || new Date().toISOString()
      };
      localStorage.setItem(STORAGE_AUDIO_KEY, JSON.stringify(updated));

      // Broadcast storage event so open tabs/listeners update immediately
      window.dispatchEvent(new Event('awas_audio_updated'));
      return updated;
    } catch (e) {
      console.error('Failed to save audio announcement:', e);
      throw e;
    }
  },

  toggleAudioStatus: async (isEnabled) => {
    const current = await dbService.getAudioAnnouncement();
    const updated = {
      ...current,
      is_enabled: isEnabled,
      updated_at: new Date().toISOString()
    };
    localStorage.setItem(STORAGE_AUDIO_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event('awas_audio_updated'));
    return updated;
  },

  resetAudioAnnouncement: async () => {
    localStorage.setItem(STORAGE_AUDIO_KEY, JSON.stringify(DEFAULT_AUDIO_ANNOUNCEMENT));
    window.dispatchEvent(new Event('awas_audio_updated'));
    return DEFAULT_AUDIO_ANNOUNCEMENT;
  },

  // Clear all data to start fresh with 0 records
  clearAllData: () => {
    localStorage.removeItem(STORAGE_APPLICATIONS_KEY);
    localStorage.removeItem(STORAGE_USERS_KEY);
    localStorage.removeItem(STORAGE_TRAININGS_KEY);
    localStorage.removeItem(STORAGE_EMAILS_KEY);
    // keep default audio intact
    localStorage.setItem(STORAGE_AUDIO_KEY, JSON.stringify(DEFAULT_AUDIO_ANNOUNCEMENT));
    window.dispatchEvent(new Event('awas_audio_updated'));
  },

  // Auth User Session
  getCurrentUser: () => {
    try {
      const u = localStorage.getItem(STORAGE_CURRENT_USER_KEY);
      return u ? JSON.parse(u) : null;
    } catch (e) {
      return null;
    }
  },

  setCurrentUser: (user) => {
    if (user) {
      localStorage.setItem(STORAGE_CURRENT_USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_CURRENT_USER_KEY);
    }
  }
};
