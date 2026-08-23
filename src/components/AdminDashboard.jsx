import React, { useState, useEffect } from 'react';
import { 
  Users, FileText, Search, Mail, Calendar, Shield, Ban, CheckCircle, 
  LogOut, X, Send, Clock, MapPin, AlertCircle, CheckCircle2 
} from 'lucide-react';
import { dbService } from '../lib/db';

// Mock Initial Seed Data matching Screenshot 2 & 3
const INITIAL_APPLIED_USERS = [
  { id: '1', applicant_full_name: 'RABI SABAR', email_address: 'rabisabar612@gmail.com', mobile_number: '9348936582', present_address: { state: 'Odisha', district: 'GAJAPATI', postOffice: 'LALUSAHI', villageTown: 'S. GHORANI' }, form_no: 'AWI-2026-931031', application_date: '2026-08-14', status: 'Inactive' },
  { id: '2', applicant_full_name: 'SUNIL KUMAR MANDAL', email_address: 'N/A', mobile_number: '9438540172', present_address: { state: 'Odisha', district: 'GAJAPATI', postOffice: 'NUAGADA', villageTown: 'TUNDERI' }, form_no: 'AWI-2026-627910', application_date: '2026-08-06', status: 'Active' },
  { id: '3', applicant_full_name: 'Madan Mohan bishoyi', email_address: 'mandanmohanbishoyi5@gmail.com', mobile_number: '7606995676', present_address: { state: 'Odisha', district: 'GANJAM', postOffice: 'BALIPADA', villageTown: 'BALIPADA' }, form_no: 'AWI-2026-740478', application_date: '2026-08-03', status: 'Inactive' },
  { id: '4', applicant_full_name: 'Raja pradhan', email_address: 'rajapradhan3444@gmail.com', mobile_number: '7854005943', present_address: { state: 'Odisha', district: 'GANJAM', postOffice: 'BADAPUR', villageTown: 'DESARI' }, form_no: 'AWI-2026-673353', application_date: '2026-08-03', status: 'Active' },
  { id: '5', applicant_full_name: 'Sameer kumar Sahu', email_address: 'sameerkumarsahu813@gmail.com', mobile_number: '7008286053', present_address: { state: 'Odisha', district: 'GANJAM', postOffice: 'POLASARA', villageTown: 'SARADHAPUR' }, form_no: 'AWI-2026-793515', application_date: '2026-08-03', status: 'Active' },
  { id: '6', applicant_full_name: 'Chinmayi swain', email_address: 'chinmayeswain3@gmail.com', mobile_number: '7815084598', present_address: { state: 'Odisha', district: 'Ganjam', postOffice: 'Goutami', villageTown: 'Goutami' }, form_no: 'AWI-2026-910276', application_date: '2026-08-03', status: 'Active' },
  { id: '7', applicant_full_name: 'BALABHADRA BEHERA', email_address: 'beherabalabhadra09@gmail.com', mobile_number: '5878695878', present_address: { state: 'Odisha', district: 'angul', postOffice: 'N/A', villageTown: 'BHUSHAN STEEL PLANT MERAMANDALI TOWNSHIP' }, form_no: 'AWI-2026-179728', application_date: '2026-08-03', status: 'Active' },
  { id: '8', applicant_full_name: 'Machhi Gunjia', email_address: 'lachhugunjia1@gmail.com', mobile_number: '7848928784', present_address: { state: 'Odisha', district: 'Koraput', postOffice: 'Peta', villageTown: 'Badapeta' }, form_no: 'AWI-2026-601421', application_date: '2026-07-31', status: 'Active' },
  { id: '9', applicant_full_name: 'ELEPAS GOMANGO', email_address: 'gomangoelepas1994@gmail.com', mobile_number: '8895899028', present_address: { state: 'Odisha', district: 'GAJAPATI', postOffice: 'BADA KALAKOTE', villageTown: 'DHEPA' }, form_no: 'AWI-2026-482220', application_date: '2026-07-30', status: 'Inactive' },
  { id: '10', applicant_full_name: 'YAMINI KANTA BISHOYI', email_address: 'ykbishoyi2017@gmail.com', mobile_number: '8249892838', present_address: { state: 'Odisha', district: 'GAJAPATI', postOffice: 'BADA GOSANI', villageTown: 'KAITADA' }, form_no: 'AWI-2026-434763', application_date: '2026-07-30', status: 'Active' }
];

const INITIAL_ALL_USERS = [
  { id: 'u1', full_name: 'xyz', email: 'ewdhjbk@g.ail.com', state: 'Assam', created_at: '2026-08-19', is_blocked: false },
  { id: 'u2', full_name: 'Sahidul Miah', email: 'sahidulmiahs411@gmail.com', state: 'West Bengal', created_at: '2026-08-18', is_blocked: false },
  { id: 'u3', full_name: 'Umakanta Behera', email: 'umakanta.behera87@gmail.com', state: 'Odisha', created_at: '2026-08-18', is_blocked: false },
  { id: 'u4', full_name: 'Bharat Sabar', email: 'sabarsandeep41@gmail.com', state: 'Odisha', created_at: '2026-08-18', is_blocked: false },
  { id: 'u5', full_name: 'RABI SABAR', email: 'rabisabar612@gmail.com', state: 'Odisha', created_at: '2026-08-14', is_blocked: true },
  { id: 'u6', full_name: 'Bikram keshori panda', email: 'rajapanda326@gmail.com', state: 'Odisha', created_at: '2026-08-11', is_blocked: false },
  { id: 'u7', full_name: 'MADAN MOHAN BISHOYI', email: 'madanmohanbishoyi61@gmail.com', state: 'Odisha', created_at: '2026-08-05', is_blocked: true },
  { id: 'u8', full_name: 'RAJENDRA MAJHI', email: 'Majhir532@gmail.com', state: 'Odisha', created_at: '2026-08-04', is_blocked: false }
];

export const AdminDashboard = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState('applied'); // 'applied' | 'allUsers'
  const [searchTerm, setSearchTerm] = useState('');
  const [appliedUsers, setAppliedUsers] = useState(INITIAL_APPLIED_USERS);
  const [allUsers, setAllUsers] = useState(INITIAL_ALL_USERS);

  // Email Modal State
  const [emailModalUser, setEmailModalUser] = useState(null);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [emailSending, setEmailSending] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  // Training Modal State
  const [trainingModalUser, setTrainingModalUser] = useState(null);
  const [trainingDate, setTrainingDate] = useState('');
  const [trainingTime, setTrainingTime] = useState('10:00 AM');
  const [trainingLocation, setTrainingLocation] = useState('District AWAS Bhavan');
  const [trainingScheduling, setTrainingScheduling] = useState(false);

  // Fetch real applications from database on mount if available
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const apps = await dbService.getApplications();
      const users = await dbService.getUsers();
      if (apps && apps.length > 0) setAppliedUsers(apps);
      if (users && users.length > 0) setAllUsers(users);
    } catch (e) {
      console.error(e);
    }
  };

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  // Block / Unblock User Toggle
  const handleToggleBlockUser = (userId) => {
    setAllUsers(prev => prev.map(u => {
      if (u.id === userId) {
        const newStatus = !u.is_blocked;
        showToast(newStatus ? `User ${u.full_name} has been blocked.` : `User ${u.full_name} unblocked.`);
        return { ...u, is_blocked: newStatus };
      }
      return u;
    }));
  };

  // Handle Send Email
  const handleSendEmailSubmit = (e) => {
    e.preventDefault();
    setEmailSending(true);
    setTimeout(() => {
      setEmailSending(false);
      setEmailModalUser(null);
      showToast(`Email sent successfully to ${emailModalUser.applicant_full_name}!`);
      setEmailSubject('');
      setEmailBody('');
    }, 1000);
  };

  // Handle Schedule Training
  const handleScheduleTrainingSubmit = (e) => {
    e.preventDefault();
    setTrainingScheduling(true);
    setTimeout(() => {
      setTrainingScheduling(false);
      setTrainingModalUser(null);
      showToast(`Training scheduled for ${trainingModalUser.applicant_full_name} on ${trainingDate}!`);
    }, 1000);
  };

  // Filtering Applied Users
  const filteredApplied = appliedUsers.filter(u => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      u.applicant_full_name?.toLowerCase().includes(term) ||
      u.email_address?.toLowerCase().includes(term) ||
      u.mobile_number?.includes(term) ||
      u.present_address?.state?.toLowerCase().includes(term) ||
      u.present_address?.district?.toLowerCase().includes(term) ||
      u.form_no?.toLowerCase().includes(term)
    );
  });

  // Filtering All Users
  const filteredAllUsers = allUsers.filter(u => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      u.full_name?.toLowerCase().includes(term) ||
      u.email?.toLowerCase().includes(term) ||
      u.state?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="min-h-screen bg-slate-50 flex text-slate-800">
      
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-3 rounded-lg shadow-xl flex items-center gap-2 border border-slate-700">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* LEFT SIDEBAR (Matching Admin Screenshots 2 & 3) */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between p-4 shrink-0 hidden md:flex">
        <div className="space-y-6">
          
          {/* Sidebar Brand Header */}
          <div className="px-3 pt-2">
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Awas India
            </h1>
            <p className="text-[11px] text-slate-400 font-semibold uppercase mt-0.5">Admin Management</p>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1 text-sm font-semibold">
            <button
              onClick={() => { setActiveTab('applied'); setSearchTerm(''); }}
              className={`w-full text-left px-3 py-2.5 rounded-lg flex items-center justify-between transition ${
                activeTab === 'applied'
                  ? 'bg-slate-100 text-blue-900 font-bold'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span>All Applied Users</span>
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                {appliedUsers.length}
              </span>
            </button>

            <button
              onClick={() => { setActiveTab('allUsers'); setSearchTerm(''); }}
              className={`w-full text-left px-3 py-2.5 rounded-lg flex items-center justify-between transition ${
                activeTab === 'allUsers'
                  ? 'bg-slate-100 text-blue-900 font-bold'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span>All Users</span>
              <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                {allUsers.length}
              </span>
            </button>
          </nav>

        </div>

        {/* Sidebar Footer Logout */}
        <div className="pt-4 border-t border-slate-200">
          <button
            onClick={onLogout}
            className="w-full text-left px-3 py-2 rounded-lg text-xs font-bold text-red-600 hover:bg-red-50 flex items-center gap-2 transition"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Header Bar matching Screenshot */}
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold text-slate-900">Dashboard</h2>
          </div>

          <div className="flex items-center gap-3">
            <div className="md:hidden flex items-center gap-2">
              <button
                onClick={() => setActiveTab('applied')}
                className={`text-xs font-bold px-3 py-1.5 rounded ${activeTab === 'applied' ? 'bg-blue-600 text-white' : 'bg-slate-100'}`}
              >
                Applied ({appliedUsers.length})
              </button>
              <button
                onClick={() => setActiveTab('allUsers')}
                className={`text-xs font-bold px-3 py-1.5 rounded ${activeTab === 'allUsers' ? 'bg-blue-600 text-white' : 'bg-slate-100'}`}
              >
                Users ({allUsers.length})
              </button>
            </div>
            
            <button
              onClick={onLogout}
              className="text-xs text-slate-500 hover:text-red-600 font-semibold underline"
            >
              Logout
            </button>
          </div>
        </header>

        {/* Main Body */}
        <main className="p-6 overflow-x-auto space-y-6">
          
          {/* TAB 1: ALL APPLIED USERS (Screenshot 2) */}
          {activeTab === 'applied' && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              
              {/* Table Top Bar */}
              <div className="p-5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4">
                <h3 className="text-base font-extrabold text-slate-900">
                  All Applied Users ({filteredApplied.length})
                </h3>

                {/* Search Bar matching Screenshot 2 */}
                <div className="relative w-full sm:w-72">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by Name, Email, Mobile, State, Di..."
                    className="awas-input text-xs py-2 pr-8"
                  />
                  {searchTerm && (
                    <button onClick={() => setSearchTerm('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs">
                      ×
                    </button>
                  )}
                </div>
              </div>

              {/* Applied Users Table matching Screenshot 2 */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Full Name</th>
                      <th className="py-3 px-4">Email</th>
                      <th className="py-3 px-4">Mobile</th>
                      <th className="py-3 px-4">State</th>
                      <th className="py-3 px-4">District</th>
                      <th className="py-3 px-4">Post Office</th>
                      <th className="py-3 px-4">Village/Town</th>
                      <th className="py-3 px-4">Form No</th>
                      <th className="py-3 px-4">Apply Date</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                    {filteredApplied.map((row) => (
                      <tr key={row.id || row.form_no} className="hover:bg-slate-50/80 transition">
                        <td className="py-3.5 px-4 font-bold text-slate-900 uppercase whitespace-nowrap">{row.applicant_full_name}</td>
                        <td className="py-3.5 px-4 font-mono text-slate-600 whitespace-nowrap">{row.email_address}</td>
                        <td className="py-3.5 px-4 font-mono text-slate-700 whitespace-nowrap">{row.mobile_number}</td>
                        <td className="py-3.5 px-4 whitespace-nowrap">{row.present_address?.state || 'Odisha'}</td>
                        <td className="py-3.5 px-4 uppercase whitespace-nowrap">{row.present_address?.district || 'GAJAPATI'}</td>
                        <td className="py-3.5 px-4 uppercase whitespace-nowrap">{row.present_address?.postOffice || 'N/A'}</td>
                        <td className="py-3.5 px-4 whitespace-nowrap">{row.present_address?.villageTown || 'N/A'}</td>
                        <td className="py-3.5 px-4 font-mono text-blue-700 font-bold whitespace-nowrap">{row.form_no}</td>
                        <td className="py-3.5 px-4 font-mono text-slate-600 whitespace-nowrap">{row.application_date}</td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          {row.status === 'Active' ? (
                            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-200">
                              Active
                            </span>
                          ) : (
                            <span className="bg-slate-200 text-slate-700 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-slate-300">
                              Inactive
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap text-center">
                          <div className="flex flex-col items-center gap-1.5 justify-center">
                            
                            {/* Send Email Action Button matching Screenshot 2 */}
                            <button
                              onClick={() => {
                                setEmailModalUser(row);
                                setEmailSubject(`AWAS Yojana Portal - Application ${row.form_no}`);
                                setEmailBody(`Dear ${row.applicant_full_name},\n\nWe have received your application (${row.form_no}) for the AWAS Yojana scheme.\n\nBest regards,\nAWAS India Portal`);
                              }}
                              className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] px-3.5 py-1 rounded-full shadow-sm transition min-w-[110px]"
                            >
                              Send Email
                            </button>

                            {/* Schedule Training Action Button matching Screenshot 2 */}
                            <button
                              onClick={() => {
                                setTrainingModalUser(row);
                                setTrainingDate('2026-08-25');
                              }}
                              className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-[11px] px-3.5 py-1 rounded-full shadow-sm transition min-w-[110px]"
                            >
                              Schedule Training
                            </button>

                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

            </div>
          )}

          {/* TAB 2: ALL USERS (Screenshot 3) */}
          {activeTab === 'allUsers' && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              
              {/* Table Top Bar matching Screenshot 3 */}
              <div className="p-5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4">
                <h3 className="text-base font-extrabold text-slate-900">
                  All Users ({filteredAllUsers.length})
                </h3>

                {/* Search Bar matching Screenshot 3 */}
                <div className="relative w-full sm:w-72">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search blocked users..."
                    className="awas-input text-xs py-2 pr-8"
                  />
                  {searchTerm && (
                    <button onClick={() => setSearchTerm('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs">
                      ×
                    </button>
                  )}
                </div>
              </div>

              {/* All Users Table matching Screenshot 3 */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Full Name</th>
                      <th className="py-3 px-4">Email</th>
                      <th className="py-3 px-4">State</th>
                      <th className="py-3 px-4">Apply Date</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                    {filteredAllUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-slate-50/80 transition">
                        <td className="py-3.5 px-4 font-bold text-slate-900 whitespace-nowrap">{user.full_name}</td>
                        <td className="py-3.5 px-4 font-mono text-slate-600 whitespace-nowrap">{user.email}</td>
                        <td className="py-3.5 px-4 whitespace-nowrap">{user.state || 'Odisha'}</td>
                        <td className="py-3.5 px-4 font-mono text-slate-600 whitespace-nowrap">{user.created_at}</td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          {user.is_blocked ? (
                            <span className="bg-red-100 text-red-700 text-[11px] font-bold px-3 py-1 rounded-full border border-red-200 inline-block">
                              Blocked
                            </span>
                          ) : (
                            <span className="bg-emerald-100 text-emerald-800 text-[11px] font-bold px-3 py-1 rounded-full border border-emerald-200 inline-block">
                              Active
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap text-center">
                          {user.is_blocked ? (
                            /* Unblock Button matching Screenshot 3 */
                            <button
                              onClick={() => handleToggleBlockUser(user.id)}
                              className="bg-[#10B981] hover:bg-emerald-600 text-white font-bold text-[11px] px-4 py-1 rounded-md shadow-sm transition min-w-[70px]"
                            >
                              Unblock
                            </button>
                          ) : (
                            /* Block Button matching Screenshot 3 */
                            <button
                              onClick={() => handleToggleBlockUser(user.id)}
                              className="bg-[#EF4444] hover:bg-red-600 text-white font-bold text-[11px] px-4 py-1 rounded-md shadow-sm transition min-w-[70px]"
                            >
                              Block
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

            </div>
          )}

        </main>

        {/* Footer */}
        <footer className="mt-auto py-3 text-center text-xs text-slate-400 border-t border-slate-200 bg-white">
          © 2026 Awas India
        </footer>

      </div>

      {/* SEND EMAIL MODAL */}
      {emailModalUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 space-y-4 border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h4 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                <Mail className="w-5 h-5 text-blue-600" />
                <span>Send Email Notification</span>
              </h4>
              <button onClick={() => setEmailModalUser(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSendEmailSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">To</label>
                <input
                  type="text"
                  value={`${emailModalUser.applicant_full_name} (${emailModalUser.email_address})`}
                  readOnly
                  className="awas-input bg-slate-100 font-semibold text-slate-700"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Subject</label>
                <input
                  type="text"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  className="awas-input"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Message Content</label>
                <textarea
                  rows={5}
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  className="awas-input font-sans text-xs leading-relaxed"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEmailModalUser(null)}
                  className="btn-outline py-2 px-4 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={emailSending}
                  className="btn-primary py-2 px-5 text-xs bg-blue-600 hover:bg-blue-700"
                >
                  {emailSending ? 'Sending...' : 'Send Email Now'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SCHEDULE TRAINING MODAL */}
      {trainingModalUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 space-y-4 border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h4 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                <Calendar className="w-5 h-5 text-purple-600" />
                <span>Schedule Beneficiary Training</span>
              </h4>
              <button onClick={() => setTrainingModalUser(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleScheduleTrainingSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Applicant Name</label>
                <input
                  type="text"
                  value={`${trainingModalUser.applicant_full_name} (${trainingModalUser.form_no})`}
                  readOnly
                  className="awas-input bg-slate-100 font-semibold text-slate-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Training Date</label>
                  <input
                    type="date"
                    value={trainingDate}
                    onChange={(e) => setTrainingDate(e.target.value)}
                    className="awas-input"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Time</label>
                  <input
                    type="text"
                    value={trainingTime}
                    onChange={(e) => setTrainingTime(e.target.value)}
                    placeholder="10:00 AM"
                    className="awas-input"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Location / Training Venue</label>
                <input
                  type="text"
                  value={trainingLocation}
                  onChange={(e) => setTrainingLocation(e.target.value)}
                  placeholder="Enter training venue address"
                  className="awas-input"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setTrainingModalUser(null)}
                  className="btn-outline py-2 px-4 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={trainingScheduling}
                  className="btn-primary py-2 px-5 text-xs bg-purple-600 hover:bg-purple-700"
                >
                  {trainingScheduling ? 'Scheduling...' : 'Confirm Schedule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
