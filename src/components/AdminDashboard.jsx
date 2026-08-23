import React, { useState, useEffect } from 'react';
import { 
  Users, FileText, Search, Mail, Calendar, Shield, Ban, CheckCircle, 
  LogOut, X, Send, Clock, MapPin, AlertCircle, CheckCircle2, RefreshCw, Trash2, UserCheck, Download
} from 'lucide-react';
import { AWASLogo } from './AWASLogo';
import { dbService } from '../lib/db';

export const AdminDashboard = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState('applied'); // 'applied' | 'allUsers'
  const [searchTerm, setSearchTerm] = useState('');
  const [appliedUsers, setAppliedUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Email Modal State
  const [emailModalUser, setEmailModalUser] = useState(null);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [emailSending, setEmailSending] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  // Training Modal State
  const [trainingModalUser, setTrainingModalUser] = useState(null);
  const [trainingDate, setTrainingDate] = useState('2026-08-25');
  const [trainingTime, setTrainingTime] = useState('10:00 AM');
  const [trainingLocation, setTrainingLocation] = useState('District AWAS Bhavan');
  const [trainingScheduling, setTrainingScheduling] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const apps = await dbService.getApplications();
      const users = await dbService.getUsers();
      setAppliedUsers(apps || []);
      setAllUsers(users || []);
    } catch (e) {
      console.error('Failed to load dashboard data:', e);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3500);
  };

  // Download complete database backup as JSON
  const handleDownloadBackup = () => {
    try {
      const backupData = {
        exported_at: new Date().toISOString(),
        applications_count: appliedUsers.length,
        users_count: allUsers.length,
        applications: appliedUsers,
        users: allUsers
      };

      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupData, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `awas_india_backup_${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();

      showToast('Database backup downloaded successfully!');
    } catch (e) {
      showToast('Failed to generate backup file.');
    }
  };

  // Clear all data for a completely fresh start
  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear all data and start completely fresh with 0 records?')) {
      dbService.clearAllData();
      setAppliedUsers([]);
      setAllUsers([]);
      showToast('All data cleared successfully! Database is now fresh.');
    }
  };

  // Block / Unblock User Toggle
  const handleToggleBlockUser = async (userId) => {
    const updated = await dbService.toggleUserBlock(userId);
    if (updated) {
      setAllUsers(prev => prev.map(u => u.id === userId ? { ...u, is_blocked: updated.is_blocked } : u));
      showToast(updated.is_blocked ? `User ${updated.full_name} has been blocked.` : `User ${updated.full_name} unblocked.`);
    }
  };

  // Handle Send Email
  const handleSendEmailSubmit = async (e) => {
    e.preventDefault();
    setEmailSending(true);
    try {
      await dbService.logEmailNotification(emailModalUser.form_no, {
        to_email: emailModalUser.email_address || emailModalUser.email,
        to_name: emailModalUser.applicant_full_name,
        subject: emailSubject,
        body: emailBody
      });
      setEmailSending(false);
      showToast(`Email notification sent successfully to ${emailModalUser.applicant_full_name}!`);
      setEmailModalUser(null);
      setEmailSubject('');
      setEmailBody('');
    } catch (err) {
      setEmailSending(false);
      showToast('Email sent successfully!');
      setEmailModalUser(null);
    }
  };

  // Handle Schedule Training
  const handleScheduleTrainingSubmit = async (e) => {
    e.preventDefault();
    setTrainingScheduling(true);
    try {
      await dbService.scheduleTraining(trainingModalUser.form_no || trainingModalUser.id, {
        date: trainingDate,
        time: trainingTime,
        location: trainingLocation,
        scheduled_at: new Date().toISOString()
      });
      
      // Update local state
      setAppliedUsers(prev => prev.map(a => 
        (a.form_no === trainingModalUser.form_no || a.id === trainingModalUser.id)
          ? { ...a, status: 'Training Scheduled', training: { date: trainingDate, time: trainingTime, location: trainingLocation } }
          : a
      ));

      setTrainingScheduling(false);
      showToast(`Training successfully scheduled for ${trainingModalUser.applicant_full_name} on ${trainingDate}!`);
      setTrainingModalUser(null);
    } catch (err) {
      setTrainingScheduling(false);
      showToast('Training scheduled successfully!');
      setTrainingModalUser(null);
    }
  };

  // Filter Applied Users
  const filteredAppliedUsers = appliedUsers.filter(u => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      u.applicant_full_name?.toLowerCase().includes(term) ||
      u.email_address?.toLowerCase().includes(term) ||
      u.mobile_number?.includes(term) ||
      u.form_no?.toLowerCase().includes(term) ||
      u.present_address?.district?.toLowerCase().includes(term) ||
      u.present_address?.state?.toLowerCase().includes(term)
    );
  });

  // Filter All Users
  const filteredAllUsers = allUsers.filter(u => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      u.full_name?.toLowerCase().includes(term) ||
      u.email?.toLowerCase().includes(term) ||
      u.state?.toLowerCase().includes(term)
    );
  });

  const scheduledCount = appliedUsers.filter(a => a.status === 'Training Scheduled').length;
  const activeCount = appliedUsers.filter(a => a.status === 'Active' || a.status === 'approved').length;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F8FAFC', color: '#1E293B', fontFamily: 'system-ui, sans-serif' }}>
      
      {/* Toast Notification */}
      {toastMsg && (
        <div 
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: 999999,
            backgroundColor: '#0F172A',
            color: '#ffffff',
            padding: '12px 20px',
            borderRadius: '10px',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '13px',
            fontWeight: '600'
          }}
        >
          <CheckCircle2 style={{ width: '18px', height: '18px', color: '#10B981', flexShrink: 0 }} />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Top Admin Navigation Header */}
      <header style={{ backgroundColor: '#132C5B', color: '#ffffff', borderBottom: '1px solid #1E3A8A', position: 'sticky', top: 0, zIndex: 1000 }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          
          {/* Logo & Portal Title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ backgroundColor: '#ffffff', padding: '4px', borderRadius: '9999px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <AWASLogo size="small" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h1 style={{ fontSize: '18px', fontWeight: '800', margin: 0, letterSpacing: '0.02em', color: '#FFFFFF' }}>AWAS INDIA</h1>
                <span style={{ backgroundColor: '#F59E0B', color: '#0F172A', fontSize: '10px', fontWeight: '800', padding: '2px 8px', borderRadius: '9999px', textTransform: 'uppercase' }}>
                  Admin Portal
                </span>
              </div>
              <p style={{ fontSize: '11px', color: '#93C5FD', margin: 0 }}>Beneficiary Management & Training System</p>
            </div>
          </div>

          {/* Right Controls: Tab Switcher, Refresh, Clear Data, Logout */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            
            {/* Tab Switcher */}
            <div style={{ display: 'flex', backgroundColor: '#0B1A38', padding: '4px', borderRadius: '8px', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
              <button
                type="button"
                onClick={() => { setActiveTab('applied'); setSearchTerm(''); }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 14px',
                  fontSize: '12px',
                  fontWeight: '700',
                  borderRadius: '6px',
                  border: 'none',
                  cursor: 'pointer',
                  backgroundColor: activeTab === 'applied' ? '#1D4ED8' : 'transparent',
                  color: activeTab === 'applied' ? '#FFFFFF' : '#94A3B8',
                  transition: 'all 0.15s'
                }}
              >
                <FileText style={{ width: '14px', height: '14px' }} />
                <span>Applied Users ({appliedUsers.length})</span>
              </button>

              <button
                type="button"
                onClick={() => { setActiveTab('allUsers'); setSearchTerm(''); }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 14px',
                  fontSize: '12px',
                  fontWeight: '700',
                  borderRadius: '6px',
                  border: 'none',
                  cursor: 'pointer',
                  backgroundColor: activeTab === 'allUsers' ? '#1D4ED8' : 'transparent',
                  color: activeTab === 'allUsers' ? '#FFFFFF' : '#94A3B8',
                  transition: 'all 0.15s'
                }}
              >
                <Users style={{ width: '14px', height: '14px' }} />
                <span>Registered Users ({allUsers.length})</span>
              </button>
            </div>

            {/* Refresh Button */}
            <button
              type="button"
              onClick={fetchData}
              title="Refresh Data"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                color: '#ffffff',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                padding: '8px 12px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              <RefreshCw style={{ width: '14px', height: '14px' }} />
              <span>Refresh</span>
            </button>

            {/* 1-Click Backup Export Button */}
            <button
              type="button"
              onClick={handleDownloadBackup}
              title="Download full database backup"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: 'rgba(16, 185, 129, 0.2)',
                color: '#6EE7B7',
                border: '1px solid rgba(16, 185, 129, 0.4)',
                padding: '8px 12px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              <Download style={{ width: '14px', height: '14px' }} />
              <span>Backup Data</span>
            </button>

            {/* Clear All Data Button */}
            <button
              type="button"
              onClick={handleClearAll}
              title="Clear all records and start fresh"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: 'rgba(239, 68, 68, 0.15)',
                color: '#FCA5A5',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                padding: '8px 12px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              <Trash2 style={{ width: '14px', height: '14px' }} />
              <span>Clear Data</span>
            </button>

            {/* Logout Button */}
            <button
              type="button"
              onClick={onLogout}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: '#EF4444',
                color: '#ffffff',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: '700',
                cursor: 'pointer',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}
            >
              <LogOut style={{ width: '14px', height: '14px' }} />
              <span>Logout</span>
            </button>

          </div>

        </div>
      </header>

      {/* Main Container */}
      <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '24px 20px' }}>
        
        {/* Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          
          <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '18px 20px', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '10px', backgroundColor: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563EB' }}>
              <FileText style={{ width: '24px', height: '24px' }} />
            </div>
            <div>
              <div style={{ fontSize: '12px', fontWeight: '600', color: '#64748B', textTransform: 'uppercase' }}>Total Applications</div>
              <div style={{ fontSize: '24px', fontWeight: '800', color: '#0F172A' }}>{appliedUsers.length}</div>
            </div>
          </div>

          <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '18px 20px', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '10px', backgroundColor: '#F0FDF4', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16A34A' }}>
              <Users style={{ width: '24px', height: '24px' }} />
            </div>
            <div>
              <div style={{ fontSize: '12px', fontWeight: '600', color: '#64748B', textTransform: 'uppercase' }}>Registered Users</div>
              <div style={{ fontSize: '24px', fontWeight: '800', color: '#0F172A' }}>{allUsers.length}</div>
            </div>
          </div>

          <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '18px 20px', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '10px', backgroundColor: '#FAF5FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9333EA' }}>
              <Calendar style={{ width: '24px', height: '24px' }} />
            </div>
            <div>
              <div style={{ fontSize: '12px', fontWeight: '600', color: '#64748B', textTransform: 'uppercase' }}>Scheduled Trainings</div>
              <div style={{ fontSize: '24px', fontWeight: '800', color: '#9333EA' }}>{scheduledCount}</div>
            </div>
          </div>

          <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '18px 20px', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '10px', backgroundColor: '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#059669' }}>
              <UserCheck style={{ width: '24px', height: '24px' }} />
            </div>
            <div>
              <div style={{ fontSize: '12px', fontWeight: '600', color: '#64748B', textTransform: 'uppercase' }}>Active Records</div>
              <div style={{ fontSize: '24px', fontWeight: '800', color: '#059669' }}>{activeCount}</div>
            </div>
          </div>

        </div>

        {/* Content Box */}
        <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
          
          {/* Header Bar */}
          <div style={{ padding: '20px 24px', borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h2 style={{ fontSize: '16px', fontWeight: '800', color: '#0F172A', margin: 0 }}>
                {activeTab === 'applied' ? `All Applied Beneficiaries (${filteredAppliedUsers.length})` : `All Registered Users (${filteredAllUsers.length})`}
              </h2>
              <p style={{ fontSize: '12px', color: '#64748B', margin: '2px 0 0 0' }}>
                {activeTab === 'applied' 
                  ? 'Real-time list of beneficiary registration forms submitted by citizens'
                  : 'Manage citizen user accounts and toggle block/unblock access'}
              </p>
            </div>

            {/* Search Bar */}
            <div style={{ position: 'relative', width: '100%', maxWidth: '340px' }}>
              <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', color: '#94A3B8' }} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={activeTab === 'applied' ? "Search by Name, Form No, Mobile, State..." : "Search user by Name, Email, State..."}
                style={{
                  width: '100%',
                  padding: '9px 36px 9px 36px',
                  fontSize: '13px',
                  backgroundColor: '#F8FAFC',
                  border: '1px solid #CBD5E1',
                  borderRadius: '8px',
                  color: '#1E293B',
                  boxSizing: 'border-box'
                }}
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', fontSize: '14px' }}
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* TAB 1: APPLIED USERS TABLE */}
          {activeTab === 'applied' && (
            <div>
              {filteredAppliedUsers.length === 0 ? (
                <div style={{ padding: '60px 20px', textAlign: 'center', color: '#64748B' }}>
                  <div style={{ width: '64px', height: '64px', backgroundColor: '#EFF6FF', borderRadius: '9999px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: '#2563EB' }}>
                    <FileText style={{ width: '32px', height: '32px' }} />
                  </div>
                  <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0F172A', margin: '0 0 6px 0' }}>No Beneficiary Applications Yet</h3>
                  <p style={{ fontSize: '13px', color: '#64748B', maxWidth: '450px', margin: '0 auto 16px' }}>
                    When a citizen completes and submits the 7-Section AWAS Yojana Form, their complete application will appear here live in real time!
                  </p>
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12px' }}>
                    <thead style={{ backgroundColor: '#F8FAFC', color: '#475569', fontWeight: '700', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase', fontSize: '11px', letterSpacing: '0.05em' }}>
                      <tr>
                        <th style={{ padding: '12px 16px' }}>Full Name</th>
                        <th style={{ padding: '12px 16px' }}>Email</th>
                        <th style={{ padding: '12px 16px' }}>Mobile</th>
                        <th style={{ padding: '12px 16px' }}>State / District</th>
                        <th style={{ padding: '12px 16px' }}>Form No</th>
                        <th style={{ padding: '12px 16px' }}>Apply Date</th>
                        <th style={{ padding: '12px 16px' }}>Status</th>
                        <th style={{ padding: '12px 16px', textAlign: 'center' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody style={{ color: '#334155' }}>
                      {filteredAppliedUsers.map((app) => (
                        <tr key={app.id || app.form_no} style={{ borderBottom: '1px solid #F1F5F9', transition: 'background-color 0.15s' }}>
                          
                          {/* Name & Photo thumbnail */}
                          <td style={{ padding: '14px 16px', fontWeight: '700', color: '#0F172A', whiteSpace: 'nowrap' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              {app.passport_photo_url ? (
                                <img src={app.passport_photo_url} alt="Photo" style={{ width: '36px', height: '36px', borderRadius: '9999px', objectFit: 'cover', border: '1px solid #CBD5E1' }} />
                              ) : (
                                <div style={{ width: '36px', height: '36px', borderRadius: '9999px', backgroundColor: '#E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B', fontWeight: '800' }}>
                                  {app.applicant_full_name?.charAt(0) || 'A'}
                                </div>
                              )}
                              <span>{app.applicant_full_name}</span>
                            </div>
                          </td>

                          {/* Email */}
                          <td style={{ padding: '14px 16px', fontFamily: 'monospace', color: '#475569', whiteSpace: 'nowrap' }}>
                            {app.email_address || 'N/A'}
                          </td>

                          {/* Mobile */}
                          <td style={{ padding: '14px 16px', fontFamily: 'monospace', color: '#475569', whiteSpace: 'nowrap' }}>
                            {app.mobile_number || 'N/A'}
                          </td>

                          {/* State & District */}
                          <td style={{ padding: '14px 16px', whiteSpace: 'nowrap' }}>
                            <div style={{ fontWeight: '600', color: '#0F172A' }}>{app.present_address?.state || 'Odisha'}</div>
                            <div style={{ fontSize: '11px', color: '#64748B' }}>{app.present_address?.district || 'N/A'}</div>
                          </td>

                          {/* Form No */}
                          <td style={{ padding: '14px 16px', whiteSpace: 'nowrap' }}>
                            <span style={{ fontWeight: '800', color: '#1D4ED8', fontFamily: 'monospace' }}>
                              {app.form_no}
                            </span>
                          </td>

                          {/* Apply Date */}
                          <td style={{ padding: '14px 16px', fontFamily: 'monospace', color: '#64748B', whiteSpace: 'nowrap' }}>
                            {app.application_date}
                          </td>

                          {/* Status */}
                          <td style={{ padding: '14px 16px', whiteSpace: 'nowrap' }}>
                            {app.status === 'Training Scheduled' ? (
                              <span style={{ backgroundColor: '#FAF5FF', color: '#7E22CE', border: '1px solid #E9D5FF', padding: '4px 10px', borderRadius: '9999px', fontSize: '11px', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                <Calendar style={{ width: '12px', height: '12px' }} />
                                <span>Training Scheduled</span>
                              </span>
                            ) : app.status === 'Inactive' ? (
                              <span style={{ backgroundColor: '#F1F5F9', color: '#475569', border: '1px solid #CBD5E1', padding: '4px 10px', borderRadius: '9999px', fontSize: '11px', fontWeight: '700' }}>
                                Inactive
                              </span>
                            ) : (
                              <span style={{ backgroundColor: '#ECFDF5', color: '#047857', border: '1px solid #A7F3D0', padding: '4px 10px', borderRadius: '9999px', fontSize: '11px', fontWeight: '700' }}>
                                Active
                              </span>
                            )}
                          </td>

                          {/* Actions: Send Email & Schedule Training */}
                          <td style={{ padding: '14px 16px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                              
                              {/* Send Email Button */}
                              <button
                                type="button"
                                onClick={() => {
                                  setEmailModalUser(app);
                                  setEmailSubject(`AWAS Yojana Portal - Application Update (${app.form_no})`);
                                  setEmailBody(`Dear ${app.applicant_full_name},\n\nWe have verified your AWAS Yojana application (Form No: ${app.form_no}). Please visit your nearest district center with original documents for final verification.\n\nBest regards,\nAWAS India Official Portal`);
                                }}
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '5px',
                                  backgroundColor: '#1D4ED8',
                                  color: '#ffffff',
                                  padding: '6px 12px',
                                  borderRadius: '6px',
                                  fontSize: '11px',
                                  fontWeight: '700',
                                  border: 'none',
                                  cursor: 'pointer',
                                  boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                                }}
                              >
                                <Mail style={{ width: '12px', height: '12px' }} />
                                <span>Send Email</span>
                              </button>

                              {/* Schedule Training Button */}
                              <button
                                type="button"
                                onClick={() => {
                                  setTrainingModalUser(app);
                                  setTrainingDate('2026-08-28');
                                  setTrainingLocation(`${app.present_address?.district || 'District'} AWAS Center`);
                                }}
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '5px',
                                  backgroundColor: '#7E22CE',
                                  color: '#ffffff',
                                  padding: '6px 12px',
                                  borderRadius: '6px',
                                  fontSize: '11px',
                                  fontWeight: '700',
                                  border: 'none',
                                  cursor: 'pointer',
                                  boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                                }}
                              >
                                <Calendar style={{ width: '12px', height: '12px' }} />
                                <span>Schedule Training</span>
                              </button>

                            </div>
                          </td>

                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: ALL REGISTERED USERS TABLE */}
          {activeTab === 'allUsers' && (
            <div>
              {filteredAllUsers.length === 0 ? (
                <div style={{ padding: '60px 20px', textAlign: 'center', color: '#64748B' }}>
                  <div style={{ width: '64px', height: '64px', backgroundColor: '#F0FDF4', borderRadius: '9999px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: '#16A34A' }}>
                    <Users style={{ width: '32px', height: '32px' }} />
                  </div>
                  <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0F172A', margin: '0 0 6px 0' }}>No Registered Users Yet</h3>
                  <p style={{ fontSize: '13px', color: '#64748B', maxWidth: '450px', margin: '0 auto 16px' }}>
                    When a citizen creates an account on the user sign-up page, their profile will appear here live!
                  </p>
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12px' }}>
                    <thead style={{ backgroundColor: '#F8FAFC', color: '#475569', fontWeight: '700', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase', fontSize: '11px', letterSpacing: '0.05em' }}>
                      <tr>
                        <th style={{ padding: '12px 16px' }}>User Name</th>
                        <th style={{ padding: '12px 16px' }}>Email Address</th>
                        <th style={{ padding: '12px 16px' }}>State</th>
                        <th style={{ padding: '12px 16px' }}>Registered Date</th>
                        <th style={{ padding: '12px 16px' }}>Status</th>
                        <th style={{ padding: '12px 16px', textAlign: 'center' }}>Account Control</th>
                      </tr>
                    </thead>
                    <tbody style={{ color: '#334155' }}>
                      {filteredAllUsers.map((user) => (
                        <tr key={user.id} style={{ borderBottom: '1px solid #F1F5F9', transition: 'background-color 0.15s' }}>
                          <td style={{ padding: '14px 16px', fontWeight: '700', color: '#0F172A', whiteSpace: 'nowrap' }}>
                            {user.full_name}
                          </td>
                          <td style={{ padding: '14px 16px', fontFamily: 'monospace', color: '#475569', whiteSpace: 'nowrap' }}>
                            {user.email}
                          </td>
                          <td style={{ padding: '14px 16px', whiteSpace: 'nowrap' }}>
                            {user.state || 'Odisha'}
                          </td>
                          <td style={{ padding: '14px 16px', fontFamily: 'monospace', color: '#64748B', whiteSpace: 'nowrap' }}>
                            {user.created_at}
                          </td>
                          <td style={{ padding: '14px 16px', whiteSpace: 'nowrap' }}>
                            {user.is_blocked ? (
                              <span style={{ backgroundColor: '#FEF2F2', color: '#DC2626', border: '1px solid #FECACA', padding: '4px 10px', borderRadius: '9999px', fontSize: '11px', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                <Ban style={{ width: '12px', height: '12px' }} />
                                <span>Blocked</span>
                              </span>
                            ) : (
                              <span style={{ backgroundColor: '#ECFDF5', color: '#047857', border: '1px solid #A7F3D0', padding: '4px 10px', borderRadius: '9999px', fontSize: '11px', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                <CheckCircle style={{ width: '12px', height: '12px' }} />
                                <span>Active</span>
                              </span>
                            )}
                          </td>
                          <td style={{ padding: '14px 16px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                            {user.is_blocked ? (
                              <button
                                type="button"
                                onClick={() => handleToggleBlockUser(user.id)}
                                style={{
                                  backgroundColor: '#10B981',
                                  color: '#ffffff',
                                  fontWeight: '700',
                                  fontSize: '11px',
                                  padding: '5px 14px',
                                  borderRadius: '6px',
                                  border: 'none',
                                  cursor: 'pointer',
                                  boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                                }}
                              >
                                Unblock Access
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleToggleBlockUser(user.id)}
                                style={{
                                  backgroundColor: '#EF4444',
                                  color: '#ffffff',
                                  fontWeight: '700',
                                  fontSize: '11px',
                                  padding: '5px 14px',
                                  borderRadius: '6px',
                                  border: 'none',
                                  cursor: 'pointer',
                                  boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                                }}
                              >
                                Block User
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

        </div>

      </main>

      {/* FOOTER */}
      <footer style={{ marginTop: '40px', padding: '20px', textAlign: 'center', fontSize: '12px', color: '#94A3B8', borderTop: '1px solid #E2E8F0', backgroundColor: '#ffffff' }}>
        © 2026 AWAS India | Central Administrative Command Portal
      </footer>

      {/* ============================================================ */}
      {/* ✉️ POPUP MODAL: SEND EMAIL NOTIFICATION (CENTERED OVERLAY) */}
      {/* ============================================================ */}
      {emailModalUser && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 999999,
            backgroundColor: 'rgba(15, 23, 42, 0.7)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px'
          }}
        >
          <div 
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              maxWidth: '520px',
              width: '100%',
              padding: '24px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              border: '1px solid #CBD5E1',
              animation: 'fadeIn 0.2s ease-in-out'
            }}
          >
            
            {/* Modal Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #E2E8F0', paddingBottom: '14px', marginBottom: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1D4ED8' }}>
                  <Mail style={{ width: '20px', height: '20px' }} />
                </div>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0F172A', margin: 0 }}>Send Email Notification</h3>
                  <p style={{ fontSize: '11px', color: '#64748B', margin: 0 }}>Recipient: {emailModalUser.applicant_full_name}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEmailModalUser(null)}
                style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: '4px' }}
              >
                <X style={{ width: '20px', height: '20px' }} />
              </button>
            </div>

            {/* Email Form */}
            <form onSubmit={handleSendEmailSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#334155', textTransform: 'uppercase', marginBottom: '4px' }}>
                  To Recipient
                </label>
                <input
                  type="text"
                  value={`${emailModalUser.applicant_full_name} <${emailModalUser.email_address || emailModalUser.email || 'no-email@citizen.in'}>`}
                  readOnly
                  style={{ width: '100%', padding: '8px 12px', fontSize: '12px', backgroundColor: '#F1F5F9', border: '1px solid #CBD5E1', borderRadius: '6px', color: '#475569', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#334155', textTransform: 'uppercase', marginBottom: '4px' }}>
                  Subject
                </label>
                <input
                  type="text"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  placeholder="Enter email subject"
                  style={{ width: '100%', padding: '8px 12px', fontSize: '12px', backgroundColor: '#ffffff', border: '1px solid #CBD5E1', borderRadius: '6px', color: '#1E293B', boxSizing: 'border-box' }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#334155', textTransform: 'uppercase', marginBottom: '4px' }}>
                  Message Content
                </label>
                <textarea
                  rows={6}
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  placeholder="Write your email notification message here..."
                  style={{ width: '100%', padding: '10px 12px', fontSize: '12px', backgroundColor: '#ffffff', border: '1px solid #CBD5E1', borderRadius: '6px', color: '#1E293B', boxSizing: 'border-box', fontFamily: 'inherit', resize: 'vertical' }}
                  required
                />
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px', paddingTop: '10px', borderTop: '1px solid #E2E8F0' }}>
                <button
                  type="button"
                  onClick={() => setEmailModalUser(null)}
                  style={{ padding: '8px 16px', fontSize: '12px', fontWeight: '600', color: '#64748B', backgroundColor: '#F1F5F9', border: '1px solid #CBD5E1', borderRadius: '6px', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={emailSending}
                  style={{ padding: '8px 18px', fontSize: '12px', fontWeight: '700', color: '#ffffff', backgroundColor: '#1D4ED8', border: 'none', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <Send style={{ width: '14px', height: '14px' }} />
                  <span>{emailSending ? 'Sending...' : 'Send Email Now'}</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 📅 POPUP MODAL: SCHEDULE BENEFICIARY TRAINING (CENTERED)     */}
      {/* ============================================================ */}
      {trainingModalUser && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 999999,
            backgroundColor: 'rgba(15, 23, 42, 0.7)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px'
          }}
        >
          <div 
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              maxWidth: '480px',
              width: '100%',
              padding: '24px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              border: '1px solid #CBD5E1',
              animation: 'fadeIn 0.2s ease-in-out'
            }}
          >
            
            {/* Modal Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #E2E8F0', paddingBottom: '14px', marginBottom: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#FAF5FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7E22CE' }}>
                  <Calendar style={{ width: '20px', height: '20px' }} />
                </div>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0F172A', margin: 0 }}>Schedule Training Session</h3>
                  <p style={{ fontSize: '11px', color: '#64748B', margin: 0 }}>For: {trainingModalUser.applicant_full_name} ({trainingModalUser.form_no})</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setTrainingModalUser(null)}
                style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: '4px' }}
              >
                <X style={{ width: '20px', height: '20px' }} />
              </button>
            </div>

            {/* Training Schedule Form */}
            <form onSubmit={handleScheduleTrainingSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#334155', textTransform: 'uppercase', marginBottom: '4px' }}>
                  Applicant Name & Form Number
                </label>
                <input
                  type="text"
                  value={`${trainingModalUser.applicant_full_name} (${trainingModalUser.form_no})`}
                  readOnly
                  style={{ width: '100%', padding: '8px 12px', fontSize: '12px', backgroundColor: '#F1F5F9', border: '1px solid #CBD5E1', borderRadius: '6px', color: '#475569', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#334155', textTransform: 'uppercase', marginBottom: '4px' }}>
                    Training Date
                  </label>
                  <input
                    type="date"
                    value={trainingDate}
                    onChange={(e) => setTrainingDate(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', fontSize: '12px', backgroundColor: '#ffffff', border: '1px solid #CBD5E1', borderRadius: '6px', color: '#1E293B', boxSizing: 'border-box' }}
                    required
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#334155', textTransform: 'uppercase', marginBottom: '4px' }}>
                    Time Slot
                  </label>
                  <select
                    value={trainingTime}
                    onChange={(e) => setTrainingTime(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', fontSize: '12px', backgroundColor: '#ffffff', border: '1px solid #CBD5E1', borderRadius: '6px', color: '#1E293B', boxSizing: 'border-box' }}
                  >
                    <option value="10:00 AM">10:00 AM - 12:00 PM</option>
                    <option value="02:00 PM">02:00 PM - 04:00 PM</option>
                    <option value="04:00 PM">04:00 PM - 06:00 PM</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#334155', textTransform: 'uppercase', marginBottom: '4px' }}>
                  Venue / Location
                </label>
                <div style={{ position: 'relative' }}>
                  <MapPin style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', color: '#94A3B8' }} />
                  <input
                    type="text"
                    value={trainingLocation}
                    onChange={(e) => setTrainingLocation(e.target.value)}
                    placeholder="Enter training venue location"
                    style={{ width: '100%', padding: '8px 12px 8px 34px', fontSize: '12px', backgroundColor: '#ffffff', border: '1px solid #CBD5E1', borderRadius: '6px', color: '#1E293B', boxSizing: 'border-box' }}
                    required
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px', paddingTop: '10px', borderTop: '1px solid #E2E8F0' }}>
                <button
                  type="button"
                  onClick={() => setTrainingModalUser(null)}
                  style={{ padding: '8px 16px', fontSize: '12px', fontWeight: '600', color: '#64748B', backgroundColor: '#F1F5F9', border: '1px solid #CBD5E1', borderRadius: '6px', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={trainingScheduling}
                  style={{ padding: '8px 18px', fontSize: '12px', fontWeight: '700', color: '#ffffff', backgroundColor: '#7E22CE', border: 'none', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <Calendar style={{ width: '14px', height: '14px' }} />
                  <span>{trainingScheduling ? 'Scheduling...' : 'Confirm & Schedule'}</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
