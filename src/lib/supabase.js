import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-supabase-project.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

export const isSupabaseConfigured = () => {
  return (
    import.meta.env.VITE_SUPABASE_URL &&
    import.meta.env.VITE_SUPABASE_ANON_KEY &&
    !import.meta.env.VITE_SUPABASE_URL.includes('your-supabase-project')
  );
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Local fallback store for seamless interactive demo when API key is not yet set
const MOCK_STORAGE_KEY = 'awas_india_applications_db';
const MOCK_USER_KEY = 'awas_india_current_user';

export const mockDb = {
  getApplications: () => {
    try {
      const data = localStorage.getItem(MOCK_STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  },
  saveApplication: (appData) => {
    const existing = mockDb.getApplications();
    const newApp = {
      ...appData,
      id: 'app_' + Date.now(),
      created_at: new Date().toISOString(),
      status: appData.status || 'pending'
    };
    existing.unshift(newApp);
    localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(existing));
    return newApp;
  },
  updateApplicationStatus: (id, status, remarks = '') => {
    const apps = mockDb.getApplications();
    const index = apps.findIndex(a => a.id === id || a.form_no === id);
    if (index !== -1) {
      apps[index].status = status;
      apps[index].admin_remarks = remarks;
      apps[index].updated_at = new Date().toISOString();
      localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(apps));
      return apps[index];
    }
    return null;
  },
  getCurrentUser: () => {
    try {
      const u = localStorage.getItem(MOCK_USER_KEY);
      return u ? JSON.parse(u) : null;
    } catch (e) {
      return null;
    }
  },
  setCurrentUser: (user) => {
    if (user) {
      localStorage.setItem(MOCK_USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(MOCK_USER_KEY);
    }
  }
};
