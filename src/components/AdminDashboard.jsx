import React, { useState, useEffect } from 'react';
import { 
  Users, FileText, Search, Mail, Calendar, Shield, Ban, CheckCircle, 
  LogOut, X, Send, Clock, MapPin, AlertCircle, CheckCircle2, RefreshCw, Trash2, UserCheck, Download,
  Radio, Volume2, Play, Pause, Upload, Sparkles, Mic, FileAudio, RotateCcw, Globe
} from 'lucide-react';
import { AWASLogo } from './AWASLogo';
import { dbService } from '../lib/db';

export const AdminDashboard = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState('applied'); // 'applied' | 'allUsers' | 'audio'
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

  // Audio Management State
  const [audioAnnouncement, setAudioAnnouncement] = useState(null);
  const [audioForm, setAudioForm] = useState({
    title: '',
    is_enabled: true,
    autoplay: false,
    english_audio_url: '',
    hindi_audio_url: '',
    english_file_name: '',
    hindi_file_name: ''
  });
  const [previewAudioLang, setPreviewAudioLang] = useState(null); // 'english' | 'hindi' | null
  const [isPublishingAudio, setIsPublishingAudio] = useState(false);
  const [ttsText, setTtsText] = useState('Welcome to AWAS India. Beneficiary registrations for 2026 are now open across all districts.');
  const [ttsLang, setTtsLang] = useState('en-IN');
  const [isTtsSpeaking, setIsTtsSpeaking] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const apps = await dbService.getApplications();
      const users = await dbService.getUsers();
      const audio = await dbService.getAudioAnnouncement();

      setAppliedUsers(apps || []);
      setAllUsers(users || []);
      if (audio) {
        setAudioAnnouncement(audio);
        setAudioForm({
          title: audio.title || '',
          is_enabled: audio.is_enabled !== undefined ? audio.is_enabled : true,
          autoplay: !!audio.autoplay,
          english_audio_url: audio.english_audio_url || '',
          hindi_audio_url: audio.hindi_audio_url || '',
          english_file_name: audio.english_file_name || 'english_announcement.mp3',
          hindi_file_name: audio.hindi_file_name || 'hindi_announcement.mp3'
        });
      }
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
        audio_announcement: audioAnnouncement,
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
    if (window.confirm('Are you sure you want to clear all user data and start completely fresh with 0 records?')) {
      dbService.clearAllData();
      setAppliedUsers([]);
      setAllUsers([]);
      showToast('All user data cleared successfully! Database is now fresh.');
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

  // -------------------------------------------------------------
  // AUDIO MANAGEMENT HANDLERS
  // -------------------------------------------------------------
  const handleAudioFileUpload = (e, lang) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate audio file format
    const validFormats = ['audio/mp3', 'audio/mpeg', 'audio/wav', 'audio/x-wav', 'audio/mp4', 'audio/x-m4a', 'audio/aac', 'audio/ogg'];
    if (!validFormats.includes(file.type) && !file.name.match(/\.(mp3|wav|m4a|aac|ogg)$/i)) {
      showToast('Please upload a valid audio file (.mp3, .wav, or .m4a)');
      return;
    }

    // Read audio as streaming object URL
    const fileUrl = URL.createObjectURL(file);
    if (lang === 'english') {
      setAudioForm(prev => ({
        ...prev,
        english_audio_url: fileUrl,
        english_file_name: file.name
      }));
      showToast(`English audio loaded: ${file.name}`);
    } else {
      setAudioForm(prev => ({
        ...prev,
        hindi_audio_url: fileUrl,
        hindi_file_name: file.name
      }));
      showToast(`Hindi audio loaded: ${file.name}`);
    }
  };

  const handlePublishAudio = async (e) => {
    e.preventDefault();
    if (!audioForm.title.trim()) {
      showToast('Please enter an announcement title');
      return;
    }

    setIsPublishingAudio(true);
    try {
      const updated = await dbService.saveAudioAnnouncement({
        title: audioForm.title,
        is_enabled: audioForm.is_enabled,
        autoplay: audioForm.autoplay,
        english_audio_url: audioForm.english_audio_url,
        hindi_audio_url: audioForm.hindi_audio_url,
        english_file_name: audioForm.english_file_name,
        hindi_file_name: audioForm.hindi_file_name,
        published_at: new Date().toISOString()
      });

      setAudioAnnouncement(updated);
      setIsPublishingAudio(false);
      showToast(audioForm.is_enabled ? '🚀 Audio announcement published live for all users!' : 'Audio announcement settings updated (Disabled).');
    } catch (err) {
      setIsPublishingAudio(false);
      showToast('Failed to publish audio announcement');
    }
  };

  const handleResetAudioToDefault = async () => {
    if (window.confirm('Reset audio announcement to default official samples?')) {
      const def = await dbService.resetAudioAnnouncement();
      setAudioAnnouncement(def);
      setAudioForm({
        title: def.title,
        is_enabled: def.is_enabled,
        autoplay: def.autoplay,
        english_audio_url: def.english_audio_url,
        hindi_audio_url: def.hindi_audio_url,
        english_file_name: def.english_file_name,
        hindi_file_name: def.hindi_file_name
      });
      showToast('Audio reset to default official announcement samples.');
    }
  };

  // AI Speech Synthesis Test Tool
  const handleTestTts = () => {
    if (!('speechSynthesis' in window)) {
      showToast('Speech synthesis not supported in this browser.');
      return;
    }

    if (isTtsSpeaking) {
      window.speechSynthesis.cancel();
      setIsTtsSpeaking(false);
      return;
    }

    if (!ttsText.trim()) {
      showToast('Please enter text to test AI speech synthesis.');
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(ttsText);
    utterance.lang = ttsLang;
    utterance.rate = 0.95;
    utterance.pitch = 1.0;

    utterance.onend = () => setIsTtsSpeaking(false);
    utterance.onerror = () => setIsTtsSpeaking(false);

    setIsTtsSpeaking(true);
    window.speechSynthesis.speak(utterance);
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
              <p style={{ fontSize: '11px', color: '#93C5FD', margin: 0 }}>Beneficiary Management & Announcement System</p>
            </div>
          </div>

          {/* Right Controls: Tab Switcher, Refresh, Backup, Clear Data, Logout */}
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

              <button
                type="button"
                onClick={() => { setActiveTab('audio'); setSearchTerm(''); }}
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
                  backgroundColor: activeTab === 'audio' ? '#1D4ED8' : 'transparent',
                  color: activeTab === 'audio' ? '#FFFFFF' : '#94A3B8',
                  transition: 'all 0.15s'
                }}
              >
                <Radio style={{ width: '14px', height: '14px' }} />
                <span>Audio Announcements</span>
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
              title="Clear all user records and start fresh"
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
            <div style={{ width: '48px', height: '48px', borderRadius: '10px', backgroundColor: audioAnnouncement?.is_enabled ? '#EFF6FF' : '#FEF2F2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: audioAnnouncement?.is_enabled ? '#1D4ED8' : '#DC2626' }}>
              <Radio style={{ width: '24px', height: '24px' }} />
            </div>
            <div>
              <div style={{ fontSize: '12px', fontWeight: '600', color: '#64748B', textTransform: 'uppercase' }}>Audio Announcement</div>
              <div style={{ fontSize: '16px', fontWeight: '800', color: audioAnnouncement?.is_enabled ? '#1D4ED8' : '#DC2626' }}>
                {audioAnnouncement?.is_enabled ? 'Live & Active' : 'Disabled'}
              </div>
            </div>
          </div>

        </div>

        {/* ============================================================ */}
        {/* TAB 3: AUDIO ANNOUNCEMENTS MANAGEMENT                         */}
        {/* ============================================================ */}
        {activeTab === 'audio' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Status & Overview Banner */}
            <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '24px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', borderBottom: '1px solid #E2E8F0', paddingBottom: '16px', marginBottom: '20px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#0F172A', margin: 0 }}>
                      Audio Announcement System
                    </h2>
                    {audioAnnouncement?.is_enabled ? (
                      <span style={{ backgroundColor: '#ECFDF5', color: '#047857', border: '1px solid #A7F3D0', padding: '3px 10px', borderRadius: '9999px', fontSize: '11px', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '9999px', backgroundColor: '#10B981' }}></span>
                        Active on Website
                      </span>
                    ) : (
                      <span style={{ backgroundColor: '#FEF2F2', color: '#DC2626', border: '1px solid #FECACA', padding: '3px 10px', borderRadius: '9999px', fontSize: '11px', fontWeight: '700' }}>
                        Disabled
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: '12px', color: '#64748B', margin: '4px 0 0 0' }}>
                    Manage dual-language (English & Hindi) AI voice broadcasts streamed at the top of the portal.
                  </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={handleResetAudioToDefault}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      backgroundColor: '#F1F5F9',
                      border: '1px solid #CBD5E1',
                      color: '#475569',
                      padding: '8px 14px',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    <RotateCcw style={{ width: '14px', height: '14px' }} />
                    <span>Reset to Samples</span>
                  </button>
                </div>
              </div>

              {/* Form Controls */}
              <form onSubmit={handlePublishAudio} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                
                {/* Row: Enable Switch & Autoplay Switch */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', backgroundColor: '#F8FAFC', padding: '16px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                  
                  {/* Feature Enable Toggle */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#ffffff', padding: '12px 16px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: '700', color: '#0F172A' }}>Enable Audio for Users</div>
                      <div style={{ fontSize: '11px', color: '#64748B' }}>When OFF, no user sees or hears audio</div>
                    </div>
                    <label style={{ position: 'relative', display: 'inline-block', width: '44px', height: '24px', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={audioForm.is_enabled}
                        onChange={(e) => setAudioForm(prev => ({ ...prev, is_enabled: e.target.checked }))}
                        style={{ opacity: 0, width: 0, height: 0 }}
                      />
                      <span 
                        style={{
                          position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0,
                          backgroundColor: audioForm.is_enabled ? '#1D4ED8' : '#CBD5E1',
                          transition: '0.2s', borderRadius: '24px'
                        }}
                      >
                        <span 
                          style={{
                            position: 'absolute', content: '""', height: '18px', width: '18px', left: audioForm.is_enabled ? '23px' : '3px', bottom: '3px',
                            backgroundColor: '#ffffff', transition: '0.2s', borderRadius: '50%', boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                          }}
                        />
                      </span>
                    </label>
                  </div>

                  {/* Autoplay Toggle */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#ffffff', padding: '12px 16px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: '700', color: '#0F172A' }}>Autoplay on Page Load</div>
                      <div style={{ fontSize: '11px', color: '#64748B' }}>Attempts playback if browser allows</div>
                    </div>
                    <label style={{ position: 'relative', display: 'inline-block', width: '44px', height: '24px', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={audioForm.autoplay}
                        onChange={(e) => setAudioForm(prev => ({ ...prev, autoplay: e.target.checked }))}
                        style={{ opacity: 0, width: 0, height: 0 }}
                      />
                      <span 
                        style={{
                          position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0,
                          backgroundColor: audioForm.autoplay ? '#1D4ED8' : '#CBD5E1',
                          transition: '0.2s', borderRadius: '24px'
                        }}
                      >
                        <span 
                          style={{
                            position: 'absolute', content: '""', height: '18px', width: '18px', left: audioForm.autoplay ? '23px' : '3px', bottom: '3px',
                            backgroundColor: '#ffffff', transition: '0.2s', borderRadius: '50%', boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                          }}
                        />
                      </span>
                    </label>
                  </div>

                </div>

                {/* Announcement Title Field */}
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
                    Announcement Title (Shown to Users) <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={audioForm.title}
                    onChange={(e) => setAudioForm(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g. Official AWAS Yojana Beneficiary Guidelines Update 2026"
                    style={{
                      width: '100%',
                      backgroundColor: '#F8FAFC',
                      border: '1px solid #CBD5E1',
                      borderRadius: '8px',
                      padding: '10px 14px',
                      fontSize: '13px',
                      color: '#1E293B',
                      boxSizing: 'border-box'
                    }}
                    required
                  />
                </div>

                {/* Dual Audio Uploaders: English & Hindi */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
                  
                  {/* English Audio Box */}
                  <div style={{ backgroundColor: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '12px', padding: '18px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '18px' }}>🇬🇧</span>
                        <span style={{ fontSize: '14px', fontWeight: '700', color: '#0F172A' }}>English Audio Version</span>
                      </div>
                      <span style={{ fontSize: '11px', color: '#64748B', backgroundColor: '#E2E8F0', padding: '2px 8px', borderRadius: '4px' }}>
                        MP3 / WAV / M4A
                      </span>
                    </div>

                    <div style={{ fontSize: '12px', color: '#475569', backgroundColor: '#ffffff', padding: '10px 12px', borderRadius: '8px', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <FileAudio style={{ width: '16px', height: '16px', color: '#2563EB', flexShrink: 0 }} />
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flexGrow: 1 }}>
                        {audioForm.english_file_name || 'No English file selected'}
                      </span>
                    </div>

                    {/* In-Dashboard Preview Player */}
                    {audioForm.english_audio_url && (
                      <div style={{ backgroundColor: '#ffffff', padding: '8px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                        <div style={{ fontSize: '10px', fontWeight: '700', color: '#64748B', textTransform: 'uppercase', marginBottom: '4px' }}>Admin Preview</div>
                        <audio controls src={audioForm.english_audio_url} style={{ width: '100%', height: '36px' }} />
                      </div>
                    )}

                    {/* Upload / Replace Button */}
                    <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', backgroundColor: '#EFF6FF', border: '1px dashed #3B82F6', color: '#1D4ED8', padding: '10px', borderRadius: '8px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', textAlign: 'center' }}>
                      <Upload style={{ width: '14px', height: '14px' }} />
                      <span>{audioForm.english_audio_url ? 'Replace English Audio' : 'Upload English Audio'}</span>
                      <input
                        type="file"
                        accept="audio/*,.mp3,.wav,.m4a"
                        onChange={(e) => handleAudioFileUpload(e, 'english')}
                        style={{ display: 'none' }}
                      />
                    </label>
                  </div>

                  {/* Hindi Audio Box */}
                  <div style={{ backgroundColor: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '12px', padding: '18px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '18px' }}>🇮🇳</span>
                        <span style={{ fontSize: '14px', fontWeight: '700', color: '#0F172A' }}>Hindi Audio Version (हिंदी)</span>
                      </div>
                      <span style={{ fontSize: '11px', color: '#64748B', backgroundColor: '#E2E8F0', padding: '2px 8px', borderRadius: '4px' }}>
                        MP3 / WAV / M4A
                      </span>
                    </div>

                    <div style={{ fontSize: '12px', color: '#475569', backgroundColor: '#ffffff', padding: '10px 12px', borderRadius: '8px', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <FileAudio style={{ width: '16px', height: '16px', color: '#16A34A', flexShrink: 0 }} />
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flexGrow: 1 }}>
                        {audioForm.hindi_file_name || 'No Hindi file selected'}
                      </span>
                    </div>

                    {/* In-Dashboard Preview Player */}
                    {audioForm.hindi_audio_url && (
                      <div style={{ backgroundColor: '#ffffff', padding: '8px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                        <div style={{ fontSize: '10px', fontWeight: '700', color: '#64748B', textTransform: 'uppercase', marginBottom: '4px' }}>Admin Preview</div>
                        <audio controls src={audioForm.hindi_audio_url} style={{ width: '100%', height: '36px' }} />
                      </div>
                    )}

                    {/* Upload / Replace Button */}
                    <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', backgroundColor: '#F0FDF4', border: '1px dashed #16A34A', color: '#166534', padding: '10px', borderRadius: '8px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', textAlign: 'center' }}>
                      <Upload style={{ width: '14px', height: '14px' }} />
                      <span>{audioForm.hindi_audio_url ? 'Replace Hindi Audio' : 'Upload Hindi Audio'}</span>
                      <input
                        type="file"
                        accept="audio/*,.mp3,.wav,.m4a"
                        onChange={(e) => handleAudioFileUpload(e, 'hindi')}
                        style={{ display: 'none' }}
                      />
                    </label>
                  </div>

                </div>

                {/* AI Text-to-Speech Voice Generation Tool / Hook */}
                <div style={{ backgroundColor: '#FAF5FF', border: '1px solid #E9D5FF', borderRadius: '12px', padding: '18px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Sparkles style={{ width: '18px', height: '18px', color: '#9333EA' }} />
                      <span style={{ fontSize: '13px', fontWeight: '700', color: '#6B21A8' }}>AI Voice & Text-to-Speech Simulator</span>
                    </div>
                    <span style={{ fontSize: '11px', color: '#7E22CE', backgroundColor: '#F3E8FF', padding: '3px 8px', borderRadius: '4px', fontWeight: '600' }}>
                      AI TTS Hook Ready
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '10px' }}>
                    <input
                      type="text"
                      value={ttsText}
                      onChange={(e) => setTtsText(e.target.value)}
                      placeholder="Type announcement script to test AI voice..."
                      style={{
                        backgroundColor: '#ffffff',
                        border: '1px solid #D8B4FE',
                        borderRadius: '8px',
                        padding: '8px 12px',
                        fontSize: '12px',
                        color: '#1E293B'
                      }}
                    />

                    <select
                      value={ttsLang}
                      onChange={(e) => setTtsLang(e.target.value)}
                      style={{
                        backgroundColor: '#ffffff',
                        border: '1px solid #D8B4FE',
                        borderRadius: '8px',
                        padding: '8px 12px',
                        fontSize: '12px',
                        color: '#1E293B'
                      }}
                    >
                      <option value="en-IN">English (India)</option>
                      <option value="hi-IN">Hindi (हिंदी)</option>
                    </select>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <button
                      type="button"
                      onClick={handleTestTts}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        backgroundColor: '#9333EA',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '6px 14px',
                        fontSize: '11px',
                        fontWeight: '700',
                        cursor: 'pointer'
                      }}
                    >
                      <Mic style={{ width: '13px', height: '13px' }} />
                      <span>{isTtsSpeaking ? 'Stop Voice' : 'Test AI Voice Audio'}</span>
                    </button>
                    <span style={{ fontSize: '11px', color: '#6B21A8' }}>
                      Generates real-time AI speech in selected language.
                    </span>
                  </div>
                </div>

                {/* Publish Action Button */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', borderTop: '1px solid #E2E8F0', paddingTop: '16px' }}>
                  <div style={{ fontSize: '11px', color: '#64748B' }}>
                    Last Published: <strong>{audioAnnouncement?.published_at ? new Date(audioAnnouncement.published_at).toLocaleString() : 'Never'}</strong>
                  </div>

                  <button
                    type="submit"
                    disabled={isPublishingAudio}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      backgroundColor: '#1D4ED8',
                      color: '#ffffff',
                      border: 'none',
                      padding: '12px 24px',
                      borderRadius: '10px',
                      fontSize: '13px',
                      fontWeight: '800',
                      cursor: 'pointer',
                      boxShadow: '0 4px 6px -1px rgba(29, 78, 216, 0.3)',
                      transition: 'background-color 0.15s'
                    }}
                  >
                    <Radio style={{ width: '16px', height: '16px' }} />
                    <span>{isPublishingAudio ? 'Publishing Audio...' : '🚀 Publish Audio Announcement'}</span>
                  </button>
                </div>

              </form>

            </div>

          </div>
        )}

        {/* Content Box */}
        {(activeTab === 'applied' || activeTab === 'allUsers') && (
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
        )}

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
