import React, { useState } from 'react';
import { AWASLogo } from './AWASLogo';
import { ArrowRight, CheckCircle2, AlertCircle, Shield, User, Lock, Mail } from 'lucide-react';
import { firebaseAuthHelper } from '../lib/firebase';
import { dbService } from '../lib/db';

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi (NCT)', 'Jammu & Kashmir', 'Ladakh', 'Puducherry'
];

export const AuthScreen = ({ 
  viewMode = 'login', // 'login' | 'register' | 'admin'
  onNavigate, 
  onLoginSuccess,
  onAdminLoginSuccess 
}) => {
  // mode: 'userLogin' | 'adminLogin' | 'register'
  const [authMode, setAuthMode] = useState(
    viewMode === 'register' ? 'register' : viewMode === 'admin' ? 'adminLogin' : 'userLogin'
  );
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    state: '',
    password: '',
    confirmPassword: '',
    rememberMe: false,
    agreeTerms: false
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    setError('');
  };

  const handleModeSwitch = (mode) => {
    setAuthMode(mode);
    setError('');
    setSuccessMsg('');
    setShowPassword(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      if (authMode === 'register') {
        // Register logic
        if (!formData.fullName.trim()) throw new Error('Please enter your full name');
        if (!formData.email.trim()) throw new Error('Please enter your email address');
        if (!formData.state) throw new Error('Please select your state');
        if (formData.password.length < 6) throw new Error('Password must be at least 6 characters');
        if (formData.password !== formData.confirmPassword) throw new Error('Passwords do not match');
        if (!formData.agreeTerms) throw new Error('You must agree to the Terms & Conditions');

        const result = await firebaseAuthHelper.signUp(
          formData.email,
          formData.password,
          formData.fullName,
          formData.state
        );

        const newUser = {
          id: result.user?.uid || 'usr_' + Date.now(),
          email: formData.email,
          full_name: formData.fullName,
          state: formData.state,
          role: 'user'
        };

        dbService.setCurrentUser(newUser);
        setSuccessMsg('Account created successfully! Redirecting...');
        setTimeout(() => {
          if (onLoginSuccess) onLoginSuccess(newUser);
        }, 600);

      } else if (authMode === 'adminLogin') {
        // Admin Sign In logic
        if (!formData.email.trim()) throw new Error('Please enter admin email address');
        if (!formData.password) throw new Error('Please enter admin password');

        const result = await firebaseAuthHelper.signIn(formData.email, formData.password);

        const adminUser = {
          id: result.user?.uid || 'admin_1',
          email: formData.email,
          full_name: 'Administrator',
          role: 'admin'
        };

        dbService.setCurrentUser(adminUser);
        if (onAdminLoginSuccess) {
          onAdminLoginSuccess(adminUser);
        } else if (onNavigate) {
          onNavigate('adminDashboard');
        }

      } else {
        // Beneficiary User Sign In logic
        if (!formData.email.trim()) throw new Error('Please enter your registered email address');
        if (!formData.password) throw new Error('Please enter your password');

        const result = await firebaseAuthHelper.signIn(formData.email, formData.password);

        const loggedInUser = {
          id: result.user?.uid || 'usr_' + Date.now(),
          email: formData.email,
          full_name: result.user?.displayName || formData.email.split('@')[0].toUpperCase(),
          state: 'Odisha',
          role: 'user'
        };

        dbService.setCurrentUser(loggedInUser);
        if (onLoginSuccess) onLoginSuccess(loggedInUser);
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center py-10 px-4">
      
      {/* Main Container Card (Exact matching Screenshot 1) */}
      <div className="w-full max-w-[440px] bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 transition-all duration-300">
        
        {/* Upside Navigation Tabs: User Login | Admin Login */}
        <div className="flex border-b border-blue-900/20 bg-[#142A55] text-xs font-bold text-white">
          <button
            type="button"
            onClick={() => handleModeSwitch('userLogin')}
            className={`flex-1 py-3 px-4 flex items-center justify-center gap-2 transition-all ${
              authMode === 'userLogin' || authMode === 'register'
                ? 'bg-[#19376D] text-white border-b-2 border-amber-400 font-extrabold'
                : 'text-blue-200 hover:text-white hover:bg-[#19376D]/60'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Beneficiary Login</span>
          </button>
          <button
            type="button"
            onClick={() => handleModeSwitch('adminLogin')}
            className={`flex-1 py-3 px-4 flex items-center justify-center gap-2 transition-all ${
              authMode === 'adminLogin'
                ? 'bg-[#19376D] text-white border-b-2 border-amber-400 font-extrabold'
                : 'text-blue-200 hover:text-white hover:bg-[#19376D]/60'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Admin Login</span>
          </button>
        </div>

        {/* Top Header Box (Exact Royal Blue matching Screenshot) */}
        <div className="bg-[#19376D] text-white pt-6 pb-6 px-6 text-center flex flex-col items-center">
          
          {/* Circular Logo Emblem in center */}
          <div className="bg-white rounded-full p-1 shadow-md mb-3">
            <AWASLogo size="large" />
          </div>

          <h2 className="text-xs font-semibold tracking-wider text-blue-200 uppercase">
            AWAS INDIA / आवास इंडिया
          </h2>

          <h3 className="text-xl font-extrabold mt-1 text-white">
            {authMode === 'register' 
              ? 'Create Account' 
              : authMode === 'adminLogin' 
              ? 'Admin Sign In' 
              : 'Welcome Back'}
          </h3>

          <p className="text-xs text-blue-200 mt-1">
            {authMode === 'register'
              ? 'Register to access AWAS Yojana portal'
              : authMode === 'adminLogin'
              ? 'Secure Administrative Access Portal'
              : 'Sign in to your AWAS Yojana account'}
          </p>
        </div>

        {/* Form Body */}
        <div className="p-6 sm:p-8 space-y-5">
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-xs rounded-md p-3 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
              <span className="font-medium">{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-md p-3 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
              <span className="font-medium">{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* FULL NAME (Only for Register) */}
            {authMode === 'register' && (
              <div>
                <label className="block text-xs font-bold tracking-wider text-slate-700 uppercase mb-1">
                  FULL NAME <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  className="awas-input"
                  required
                />
              </div>
            )}

            {/* EMAIL ADDRESS */}
            <div>
              <label className="block text-xs font-bold tracking-wider text-slate-700 uppercase mb-1">
                EMAIL ADDRESS <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder={
                  authMode === 'register' 
                    ? 'Enter your email address' 
                    : authMode === 'adminLogin'
                    ? 'admin@awasindia.com'
                    : 'Enter registered email address'
                }
                className="awas-input text-sm"
                required
              />
            </div>

            {/* STATE (Only for Register) */}
            {authMode === 'register' && (
              <div>
                <label className="block text-xs font-bold tracking-wider text-slate-700 uppercase mb-1">
                  STATE <span className="text-red-500">*</span>
                </label>
                <select
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  className="awas-select text-sm"
                  required
                >
                  <option value="">Select your state</option>
                  {INDIAN_STATES.map((st) => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
              </div>
            )}

            {/* PASSWORD */}
            <div>
              <label className="block text-xs font-bold tracking-wider text-slate-700 uppercase mb-1">
                PASSWORD <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder={
                    authMode === 'register' 
                      ? 'Minimum 6 characters' 
                      : 'Enter your password'
                  }
                  className="awas-input text-sm pr-14"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 hover:text-slate-700"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            {/* CONFIRM PASSWORD (Only for Register) */}
            {authMode === 'register' && (
              <div>
                <label className="block text-xs font-bold tracking-wider text-slate-700 uppercase mb-1">
                  CONFIRM PASSWORD <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Re-enter password"
                    className="awas-input text-sm pr-14"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 hover:text-slate-700"
                  >
                    {showConfirmPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>
            )}

            {/* Remember Me / Forgot Password (Sign In Only) */}
            {authMode !== 'register' && (
              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-slate-600">
                  <input
                    type="checkbox"
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onChange={handleChange}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                  />
                  <span>Remember me</span>
                </label>
                <a 
                  href="#forgot" 
                  onClick={(e) => { e.preventDefault(); alert('Password reset instructions sent to your email.'); }} 
                  className="text-blue-600 font-semibold hover:underline"
                >
                  Forgot Password?
                </a>
              </div>
            )}

            {/* Agree Terms Checkbox (Register Only) */}
            {authMode === 'register' && (
              <div className="pt-1">
                <label className="flex items-start gap-2 cursor-pointer text-xs text-slate-600">
                  <input
                    type="checkbox"
                    name="agreeTerms"
                    checked={formData.agreeTerms}
                    onChange={handleChange}
                    className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    required
                  />
                  <span>
                    I agree to the{' '}
                    <a href="#terms" onClick={(e) => e.preventDefault()} className="text-blue-600 hover:underline">
                      Terms & Conditions
                    </a>{' '}
                    and{' '}
                    <a href="#privacy" onClick={(e) => e.preventDefault()} className="text-blue-600 hover:underline">
                      Privacy Policy
                    </a>
                  </span>
                </label>
              </div>
            )}

            {/* Submit Action Button (Exact Royal Blue matching Screenshot) */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#1A3875] hover:bg-[#132B5B] text-white py-3 text-sm rounded-lg font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? (
                  <span>Authenticating...</span>
                ) : (
                  <>
                    <span>
                      {authMode === 'register' 
                        ? 'Create Account' 
                        : authMode === 'adminLogin' 
                        ? 'Admin Sign In' 
                        : 'Sign In'}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>

          </form>

          {/* Bottom Navigation Links & Options */}
          <div className="text-center text-xs text-slate-600 pt-2 space-y-3">
            
            {/* User Register vs Sign In Toggle */}
            {authMode === 'userLogin' && (
              <div>
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => handleModeSwitch('register')}
                  className="text-blue-600 font-bold hover:underline cursor-pointer"
                >
                  Register Now
                </button>
              </div>
            )}

            {authMode === 'register' && (
              <div>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => handleModeSwitch('userLogin')}
                  className="text-blue-600 font-bold hover:underline cursor-pointer"
                >
                  Sign In
                </button>
              </div>
            )}

            {/* Downside Option: Admin Login / User Login Switcher */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-center">
              {authMode === 'adminLogin' ? (
                <button
                  type="button"
                  onClick={() => handleModeSwitch('userLogin')}
                  className="text-xs text-blue-700 hover:text-blue-900 font-semibold inline-flex items-center gap-1.5 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-md transition"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>← Back to Beneficiary User Login</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => handleModeSwitch('adminLogin')}
                  className="text-xs text-slate-600 hover:text-slate-900 font-semibold inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-md border border-slate-200 transition"
                >
                  <Shield className="w-3.5 h-3.5 text-blue-700" />
                  <span>Officer / Staff Portal? <strong>Admin Login →</strong></span>
                </button>
              )}
            </div>

          </div>

        </div>
      </div>

      {/* Footer Caption */}
      <div className="text-center text-xs text-slate-400 mt-4">
        © Awas India | AWAS Yojana Portal
      </div>

    </div>
  );
};
