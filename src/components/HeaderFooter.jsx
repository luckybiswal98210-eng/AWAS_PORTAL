import React from 'react';
import { AWASLogo } from './AWASLogo';
import { Phone, Mail, Clock, Database, LogOut, ShieldCheck } from 'lucide-react';
import { isFirebaseConfigured } from '../lib/firebase';

export const Header = ({ currentUser, onNavigate, onLogout, currentView }) => {
  const isConfigured = isFirebaseConfigured();

  return (
    <header className="no-print bg-brand-navy text-white shadow-md border-b border-blue-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
        
        {/* Brand Logo & Name */}
        <div 
          onClick={() => onNavigate(currentUser ? 'form' : 'login')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="bg-white p-1 rounded-full shadow-inner group-hover:scale-105 transition-transform">
            <AWASLogo size="small" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-lg tracking-wide text-white">AWAS INDIA</h1>
              <span className="text-xs bg-amber-500 text-slate-950 font-bold px-2 py-0.5 rounded-full uppercase">
                Official Portal
              </span>
            </div>
            <p className="text-xs text-blue-200 font-medium">आवास इंडिया — Beneficiary Registration Scheme</p>
          </div>
        </div>

        {/* Navigation & User State */}
        <div className="flex items-center gap-3 text-xs sm:text-sm">
          {!isConfigured && (
            <div className="hidden md:flex items-center gap-1.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2.5 py-1 rounded text-[11px]">
              <Database className="w-3.5 h-3.5" />
              <span>Vercel + Firebase + MongoDB Ready</span>
            </div>
          )}

          {currentUser ? (
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex flex-col items-end">
                <span className="font-bold text-white text-xs">{currentUser.full_name || currentUser.email}</span>
                <span className="text-[10px] text-blue-200 capitalize">{currentUser.role || 'Beneficiary User'}</span>
              </div>
              <button
                onClick={() => onNavigate('form')}
                className={`px-3 py-1.5 rounded text-xs font-semibold transition ${
                  currentView === 'form' 
                    ? 'bg-blue-600 text-white shadow' 
                    : 'bg-blue-900/60 text-blue-200 hover:bg-blue-800'
                }`}
              >
                Registration Form
              </button>
              <button
                onClick={() => onNavigate('status')}
                className={`px-3 py-1.5 rounded text-xs font-semibold transition ${
                  currentView === 'status' 
                    ? 'bg-blue-600 text-white shadow' 
                    : 'bg-blue-900/60 text-blue-200 hover:bg-blue-800'
                }`}
              >
                Track Status
              </button>
              <button
                onClick={() => onNavigate('adminDashboard')}
                className={`px-3 py-1.5 rounded text-xs font-semibold transition ${
                  currentView === 'adminDashboard' 
                    ? 'bg-purple-600 text-white shadow' 
                    : 'bg-purple-900/60 text-purple-200 hover:bg-purple-800'
                }`}
              >
                Admin Panel
              </button>
              <button
                onClick={onLogout}
                className="flex items-center gap-1 bg-red-600/80 hover:bg-red-600 text-white px-2.5 py-1.5 rounded text-xs font-semibold transition"
                title="Sign Out"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onNavigate('login')}
                className={`px-3.5 py-1.5 rounded text-xs font-semibold transition ${
                  currentView === 'login' 
                    ? 'bg-white text-blue-900 font-bold shadow' 
                    : 'text-blue-100 hover:bg-blue-800'
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => onNavigate('register')}
                className={`px-3.5 py-1.5 rounded text-xs font-semibold transition ${
                  currentView === 'register' 
                    ? 'bg-amber-500 text-slate-950 font-bold shadow' 
                    : 'bg-blue-600 hover:bg-blue-500 text-white'
                }`}
              >
                Register Now
              </button>
              <button
                onClick={() => onNavigate('adminAuth')}
                className={`px-3.5 py-1.5 rounded text-xs font-semibold transition border border-purple-400/40 flex items-center gap-1 ${
                  currentView === 'adminAuth' || currentView === 'adminDashboard'
                    ? 'bg-purple-600 text-white font-bold shadow' 
                    : 'bg-purple-950/60 hover:bg-purple-900 text-purple-200'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-purple-300" />
                <span>Admin Login</span>
              </button>
            </div>
          )}
        </div>

      </div>
    </header>
  );
};

export const Footer = () => {
  return (
    <footer className="no-print bg-brand-navy text-white mt-12 border-t border-blue-900">
      {/* Main Footer Info */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Left Col: Brand info */}
        <div className="flex items-start gap-4">
          <div className="bg-white p-2 rounded-full shadow-md shrink-0">
            <AWASLogo size="small" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm tracking-wide text-white uppercase">AWAS INDIA</h3>
            <p className="font-bold text-xs text-blue-200">AWAS Yojana Portal</p>
            <p className="text-xs text-blue-300 mt-2 max-w-sm leading-relaxed">
              आवास इंडिया — Pan India beneficiary registration portal for AWAS Yojana scheme.
            </p>
          </div>
        </div>

        {/* Right Col: Contact Us */}
        <div>
          <h4 className="font-extrabold text-xs tracking-wider text-blue-200 uppercase mb-3 border-b border-blue-800/80 pb-1">
            CONTACT US
          </h4>
          <div className="space-y-2 text-xs text-blue-100">
            <div className="flex items-center gap-2.5">
              <Phone className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Helpline: <strong className="text-white">1800-XXX-XXXX</strong></span>
            </div>
            <div className="flex items-center gap-2.5">
              <Mail className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Email: <a href="mailto:official@awasindia.com" className="text-blue-200 hover:underline">official@awasindia.com</a></span>
            </div>
            <div className="flex items-center gap-2.5">
              <Clock className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Mon – Sat: <strong className="text-white">9:00 AM – 6:00 PM</strong></span>
            </div>
          </div>
        </div>

      </div>

      {/* Bottom Copyright Strip matching Screenshot */}
      <div className="bg-slate-900 text-blue-300 text-[11px] py-3 px-4 border-t border-blue-900/60">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
          <div>© 2026 Awas India. All rights reserved.</div>
          <div className="flex items-center gap-4">
            <a href="#portal" className="hover:underline">AWAS Yojana Portal</a>
            <span>|</span>
            <a href="#programme" className="hover:underline">Pan India Programme</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
