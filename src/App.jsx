import React, { useState, useEffect } from 'react';
import { Header, Footer } from './components/HeaderFooter';
import { AudioAnnouncementPlayer } from './components/AudioAnnouncementPlayer';
import { AuthScreen } from './components/AuthScreen';
import { BeneficiaryForm } from './components/BeneficiaryForm';
import { ApplicationSuccess } from './components/ApplicationSuccess';
import { StatusTracker } from './components/StatusTracker';
import { AdminAuth } from './components/AdminAuth';
import { AdminDashboard } from './components/AdminDashboard';
import { firebaseAuthHelper, isFirebaseConfigured, auth } from './lib/firebase';
import { dbService } from './lib/db';
import { onAuthStateChanged } from 'firebase/auth';

export default function App() {
  const [currentView, setCurrentView] = useState('login'); // 'login' | 'register' | 'form' | 'success' | 'status' | 'adminAuth' | 'adminDashboard'
  const [currentUser, setCurrentUser] = useState(null);
  const [activeApplication, setActiveApplication] = useState(null);

  // Check auth on mount
  useEffect(() => {
    if (isFirebaseConfigured()) {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (user) {
          const u = {
            id: user.uid,
            email: user.email,
            full_name: user.displayName || user.email?.split('@')[0],
            role: user.email?.includes('admin') ? 'admin' : 'user'
          };
          setCurrentUser(u);
          dbService.setCurrentUser(u);
        } else {
          setCurrentUser(null);
          dbService.setCurrentUser(null);
        }
      });
      return () => unsubscribe();
    } else {
      // Check local user session
      const localUser = dbService.getCurrentUser();
      if (localUser) {
        setCurrentUser(localUser);
      }
    }
  }, []);

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    setCurrentView('form');
  };

  const handleAdminLoginSuccess = (user) => {
    setCurrentUser(user);
    setCurrentView('adminDashboard');
  };

  const handleLogout = async () => {
    await firebaseAuthHelper.logout();
    dbService.setCurrentUser(null);
    setCurrentUser(null);
    setCurrentView('login');
  };

  const handleFormSubmitSuccess = (appData) => {
    setActiveApplication(appData);
    setCurrentView('success');
  };

  const handleViewApplication = (appData) => {
    setActiveApplication(appData);
    setCurrentView('success');
  };

  // If in admin dashboard, render standard Admin Layout
  if (currentView === 'adminDashboard') {
    return (
      <AdminDashboard
        onLogout={handleLogout}
      />
    );
  }

  const isAuthView = currentView === 'login' || currentView === 'register' || currentView === 'adminAuth';

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#F1F5F9] text-slate-800">
      
      {/* User-Side Audio Announcement Bar (Prominently at Top) */}
      <AudioAnnouncementPlayer />

      {/* Top Header - Shown on Form, Status, and Success Views */}
      {!isAuthView && (
        <Header
          currentUser={currentUser}
          currentView={currentView}
          onNavigate={(view) => setCurrentView(view)}
          onLogout={handleLogout}
        />
      )}

      {/* Main View Router */}
      <main className="flex-grow flex flex-col justify-center">
        {currentView === 'login' && (
          <AuthScreen
            viewMode="login"
            onNavigate={(view) => setCurrentView(view)}
            onLoginSuccess={handleLoginSuccess}
            onAdminLoginSuccess={handleAdminLoginSuccess}
          />
        )}

        {currentView === 'register' && (
          <AuthScreen
            viewMode="register"
            onNavigate={(view) => setCurrentView(view)}
            onLoginSuccess={handleLoginSuccess}
            onAdminLoginSuccess={handleAdminLoginSuccess}
          />
        )}

        {currentView === 'form' && (
          <BeneficiaryForm
            currentUser={currentUser}
            onSubmitSuccess={handleFormSubmitSuccess}
          />
        )}

        {currentView === 'success' && (
          <ApplicationSuccess
            application={activeApplication}
            onBackToForm={() => setCurrentView('form')}
            onNavigate={(view) => setCurrentView(view)}
          />
        )}

        {currentView === 'status' && (
          <StatusTracker
            currentUser={currentUser}
            onViewApplication={handleViewApplication}
          />
        )}

        {currentView === 'adminAuth' && (
          <AdminAuth
            onAdminLoginSuccess={handleAdminLoginSuccess}
            onNavigate={(view) => setCurrentView(view)}
          />
        )}
      </main>

      {/* Bottom Footer */}
      <Footer />

    </div>
  );
}
