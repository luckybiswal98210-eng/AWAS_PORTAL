import React, { useState } from 'react';
import { Eye, EyeOff, Lock, Mail, AlertCircle } from 'lucide-react';
import { firebaseAuthHelper } from '../lib/firebase';
import { dbService } from '../lib/db';

export const AdminAuth = ({ onAdminLoginSuccess, onNavigate }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email.trim()) return setError('Please enter admin email');
    if (!password) return setError('Please enter password');

    setLoading(true);

    try {
      const result = await firebaseAuthHelper.signIn(email, password);
      
      const adminUser = {
        id: result.user?.uid || 'admin_1',
        email: email,
        full_name: 'System Administrator',
        role: 'admin'
      };

      dbService.setCurrentUser(adminUser);
      onAdminLoginSuccess(adminUser);
    } catch (err) {
      setError(err.message || 'Invalid admin credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center py-12 px-4">
      {/* Admin Sign In Card matching Screenshot */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-slate-200 p-8 sm:p-10 space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Awas India
          </h1>
          <p className="text-sm text-slate-500 font-medium">
            Sign in to your account
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-xs rounded-md p-3 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0-5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* Email Field */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1-5">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="awas-input text-sm py-2-5"
              required
            />
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1-5">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="awas-input text-sm py-2-5 pr-16"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1-2 text-xs font-semibold text-slate-500 hover:text-slate-900"
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#111827] hover:bg-slate-900 text-white font-bold py-3 px-4 rounded-xl text-sm transition-colors shadow"
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </div>

        </form>

        {/* Back to user login */}
        {onNavigate && (
          <div className="text-center pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => onNavigate('login')}
              className="text-xs font-semibold text-blue-600 hover:underline"
            >
              ← Back to User Login / Register
            </button>
          </div>
        )}

        <div className="text-center text-xs text-slate-400">
          AWAS India Secure Administrator Access
        </div>

      </div>
    </div>
  );
};
