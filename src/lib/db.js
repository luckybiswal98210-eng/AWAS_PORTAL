/**
 * Universal Database Adapter for MongoDB Atlas / Serverless DB & Fallback Store
 */

const STORAGE_APPLICATIONS_KEY = 'awas_india_applications_mongodb';
const STORAGE_USERS_KEY = 'awas_india_all_users_mongodb';
const STORAGE_CURRENT_USER_KEY = 'awas_india_current_user';

// Initial Seed Data matching Admin Screenshots
const SEED_APPLICATIONS = [
  { id: '1', form_no: 'AWI-2026-931031', applicant_full_name: 'RABI SABAR', email_address: 'rabisabar612@gmail.com', mobile_number: '9348936582', present_address: { state: 'Odisha', district: 'GAJAPATI', postOffice: 'LALUSAHI', villageTown: 'S. GHORANI' }, application_date: '2026-08-14', status: 'Inactive' },
  { id: '2', form_no: 'AWI-2026-627910', applicant_full_name: 'SUNIL KUMAR MANDAL', email_address: 'N/A', mobile_number: '9438540172', present_address: { state: 'Odisha', district: 'GAJAPATI', postOffice: 'NUAGADA', villageTown: 'TUNDERI' }, application_date: '2026-08-06', status: 'Active' },
  { id: '3', form_no: 'AWI-2026-740478', applicant_full_name: 'Madan Mohan bishoyi', email_address: 'mandanmohanbishoyi5@gmail.com', mobile_number: '7606995676', present_address: { state: 'Odisha', district: 'GANJAM', postOffice: 'BALIPADA', villageTown: 'BALIPADA' }, application_date: '2026-08-03', status: 'Inactive' },
  { id: '4', form_no: 'AWI-2026-673353', applicant_full_name: 'Raja pradhan', email_address: 'rajapradhan3444@gmail.com', mobile_number: '7854005943', present_address: { state: 'Odisha', district: 'GANJAM', postOffice: 'BADAPUR', villageTown: 'DESARI' }, application_date: '2026-08-03', status: 'Active' },
  { id: '5', form_no: 'AWI-2026-793515', applicant_full_name: 'Sameer kumar Sahu', email_address: 'sameerkumarsahu813@gmail.com', mobile_number: '7008286053', present_address: { state: 'Odisha', district: 'GANJAM', postOffice: 'POLASARA', villageTown: 'SARADHAPUR' }, application_date: '2026-08-03', status: 'Active' },
  { id: '6', form_no: 'AWI-2026-910276', applicant_full_name: 'Chinmayi swain', email_address: 'chinmayeswain3@gmail.com', mobile_number: '7815084598', present_address: { state: 'Odisha', district: 'Ganjam', postOffice: 'Goutami', villageTown: 'Goutami' }, application_date: '2026-08-03', status: 'Active' },
  { id: '7', form_no: 'AWI-2026-179728', applicant_full_name: 'BALABHADRA BEHERA', email_address: 'beherabalabhadra09@gmail.com', mobile_number: '5878695878', present_address: { state: 'Odisha', district: 'angul', postOffice: 'N/A', villageTown: 'BHUSHAN STEEL PLANT MERAMANDALI TOWNSHIP' }, application_date: '2026-08-03', status: 'Active' },
  { id: '8', form_no: 'AWI-2026-601421', applicant_full_name: 'Machhi Gunjia', email_address: 'lachhugunjia1@gmail.com', mobile_number: '7848928784', present_address: { state: 'Odisha', district: 'Koraput', postOffice: 'Peta', villageTown: 'Badapeta' }, application_date: '2026-07-31', status: 'Active' },
  { id: '9', form_no: 'AWI-2026-482220', applicant_full_name: 'ELEPAS GOMANGO', email_address: 'gomangoelepas1994@gmail.com', mobile_number: '8895899028', present_address: { state: 'Odisha', district: 'GAJAPATI', postOffice: 'BADA KALAKOTE', villageTown: 'DHEPA' }, application_date: '2026-07-30', status: 'Inactive' },
  { id: '10', form_no: 'AWI-2026-434763', applicant_full_name: 'YAMINI KANTA BISHOYI', email_address: 'ykbishoyi2017@gmail.com', mobile_number: '8249892838', present_address: { state: 'Odisha', district: 'GAJAPATI', postOffice: 'BADA GOSANI', villageTown: 'KAITADA' }, application_date: '2026-07-30', status: 'Active' }
];

const SEED_USERS = [
  { id: 'u1', full_name: 'xyz', email: 'ewdhjbk@g.ail.com', state: 'Assam', created_at: '2026-08-19', is_blocked: false },
  { id: 'u2', full_name: 'Sahidul Miah', email: 'sahidulmiahs411@gmail.com', state: 'West Bengal', created_at: '2026-08-18', is_blocked: false },
  { id: 'u3', full_name: 'Umakanta Behera', email: 'umakanta.behera87@gmail.com', state: 'Odisha', created_at: '2026-08-18', is_blocked: false },
  { id: 'u4', full_name: 'Bharat Sabar', email: 'sabarsandeep41@gmail.com', state: 'Odisha', created_at: '2026-08-18', is_blocked: false },
  { id: 'u5', full_name: 'RABI SABAR', email: 'rabisabar612@gmail.com', state: 'Odisha', created_at: '2026-08-14', is_blocked: true },
  { id: 'u6', full_name: 'Bikram keshori panda', email: 'rajapanda326@gmail.com', state: 'Odisha', created_at: '2026-08-11', is_blocked: false },
  { id: 'u7', full_name: 'MADAN MOHAN BISHOYI', email: 'madanmohanbishoyi61@gmail.com', state: 'Odisha', created_at: '2026-08-05', is_blocked: true },
  { id: 'u8', full_name: 'RAJENDRA MAJHI', email: 'Majhir532@gmail.com', state: 'Odisha', created_at: '2026-08-04', is_blocked: false }
];

export const isMongoConfigured = () => {
  return !!import.meta.env.VITE_MONGODB_API_URL;
};

export const dbService = {
  // Get all applications
  getApplications: async () => {
    if (isMongoConfigured()) {
      try {
        const res = await fetch(`${import.meta.env.VITE_MONGODB_API_URL}/api/applications`);
        if (res.ok) return await res.json();
      } catch (e) {
        console.warn('MongoDB endpoint unavailable, using local store', e);
      }
    }

    // Local / Dev Fallback Store
    const saved = localStorage.getItem(STORAGE_APPLICATIONS_KEY);
    if (!saved) {
      localStorage.setItem(STORAGE_APPLICATIONS_KEY, JSON.stringify(SEED_APPLICATIONS));
      return SEED_APPLICATIONS;
    }
    return JSON.parse(saved);
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
        console.warn('MongoDB save failed, using local store', e);
      }
    }

    const existing = await dbService.getApplications();
    const newRecord = {
      ...applicationData,
      id: 'app_' + Date.now(),
      created_at: new Date().toISOString(),
      status: applicationData.status || 'Active'
    };
    existing.unshift(newRecord);
    localStorage.setItem(STORAGE_APPLICATIONS_KEY, JSON.stringify(existing));
    return newRecord;
  },

  // Get all registered users
  getUsers: async () => {
    if (isMongoConfigured()) {
      try {
        const res = await fetch(`${import.meta.env.VITE_MONGODB_API_URL}/api/users`);
        if (res.ok) return await res.json();
      } catch (e) {
        console.warn('MongoDB endpoint unavailable, using local store', e);
      }
    }

    const saved = localStorage.getItem(STORAGE_USERS_KEY);
    if (!saved) {
      localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(SEED_USERS));
      return SEED_USERS;
    }
    return JSON.parse(saved);
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
