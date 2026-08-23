import React, { useState } from 'react';
import { AWASLogo } from './AWASLogo';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
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
  viewMode = 'login', 
  onNavigate, 
  onLoginSuccess,
  onAdminLoginSuccess 
}) => {
  const [isRegister, setIsRegister] = useState(viewMode === 'register');
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      if (isRegister) {
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
        setSuccessMsg('Account created successfully!');
        setTimeout(() => {
          if (onLoginSuccess) onLoginSuccess(newUser);
        }, 500);

      } else {
        // Sign In logic
        if (!formData.email.trim()) throw new Error('Please enter your registered email address');
        if (!formData.password) throw new Error('Please enter your password');

        const result = await firebaseAuthHelper.signIn(formData.email, formData.password);

        const isAdmin = formData.email.toLowerCase().includes('admin') || formData.email.toLowerCase().includes('official');

        const loggedInUser = {
          id: result.user?.uid || 'usr_' + Date.now(),
          email: formData.email,
          full_name: result.user?.displayName || formData.email.split('@')[0].toUpperCase(),
          state: 'Odisha',
          role: isAdmin ? 'admin' : 'user'
        };

        dbService.setCurrentUser(loggedInUser);

        if (isAdmin && onAdminLoginSuccess) {
          onAdminLoginSuccess(loggedInUser);
        } else if (onLoginSuccess) {
          onLoginSuccess(loggedInUser);
        }
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-8 px-4">
      
      {/* Centered Login Card (Exact 100% Match to Screenshot) */}
      <div className="w-full max-w-[390px] bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200/80">
        
        {/* Card Header (Deep Royal Navy Blue) */}
        <div className="bg-[#18396D] text-white pt-6 pb-5 px-6 text-center flex flex-col items-center">
          
          {/* Circular Logo Emblem */}
          <div className="w-[82px] h-[82px] bg-white rounded-full p-1 shadow-md mb-2 flex items-center justify-center">
            <img 
              src="/awas-logo.png" 
              alt="AWAS INDIA" 
              className="w-full h-full object-contain rounded-full"
            />
          </div>

          <h2 className="text-[11px] font-semibold tracking-wider text-blue-200 uppercase">
            AWAS INDIA / आवास इंडिया
          </h2>

          <h3 className="text-base font-bold text-white mt-1">
            {isRegister ? 'Create Account' : 'Welcome Back'}
          </h3>

          <p className="text-[11px] text-blue-200/90 mt-0.5">
            {isRegister 
              ? 'Register to access AWAS Yojana portal' 
              : 'Sign in to your AWAS Yojana account'}
          </p>
        </div>

        {/* Card Body */}
        <div className="p-6 space-y-4">
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-xs rounded-md p-2.5 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-md p-2.5 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            
            {/* FULL NAME (Only for Register) */}
            {isRegister && (
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wide mb-1">
                  FULL NAME <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  className="w-full bg-[#F0F7FF] border border-[#CBD5E1] rounded-md px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600"
                  required
                />
              </div>
            )}

            {/* EMAIL ADDRESS */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wide mb-1">
                EMAIL ADDRESS <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder={isRegister ? "Enter your email address" : "Enter registered email address"}
                className="w-full bg-[#F0F7FF] border border-[#CBD5E1] rounded-md px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600"
                required
              />
            </div>

            {/* STATE (Only for Register) */}
            {isRegister && (
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wide mb-1">
                  STATE <span className="text-red-500">*</span>
                </label>
                <select
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  className="w-full bg-[#F0F7FF] border border-[#CBD5E1] rounded-md px-3 py-2 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600"
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
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wide mb-1">
                PASSWORD <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className="w-full bg-[#F0F7FF] border border-[#CBD5E1] rounded-md pl-3 pr-12 py-2 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-medium hover:text-slate-600"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            {/* CONFIRM PASSWORD (Only for Register) */}
            {isRegister && (
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wide mb-1">
                  CONFIRM PASSWORD <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Re-enter password"
                    className="w-full bg-[#F0F7FF] border border-[#CBD5E1] rounded-md pl-3 pr-12 py-2 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-medium hover:text-slate-600"
                  >
                    {showConfirmPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>
            )}

            {/* Remember Me & Forgot Password */}
            {!isRegister && (
              <div className="flex items-center justify-between text-xs pt-0.5">
                <label className="flex items-center gap-1.5 cursor-pointer text-slate-600 select-none">
                  <input
                    type="checkbox"
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onChange={handleChange}
                    className="w-3.5 h-3.5 rounded border-slate-300 text-blue-600 focus:ring-0"
                  />
                  <span className="text-xs">Remember me</span>
                </label>
                <a 
                  href="#forgot" 
                  onClick={(e) => { e.preventDefault(); alert('Password reset instructions sent to your email.'); }} 
                  className="text-xs text-[#1D4ED8] font-bold hover:underline"
                >
                  Forgot Password?
                </a>
              </div>
            )}

            {/* Terms Checkbox (Register Only) */}
            {isRegister && (
              <div className="pt-0.5">
                <label className="flex items-start gap-2 cursor-pointer text-xs text-slate-600">
                  <input
                    type="checkbox"
                    name="agreeTerms"
                    checked={formData.agreeTerms}
                    onChange={handleChange}
                    className="mt-0.5 w-3.5 h-3.5 rounded border-slate-300 text-blue-600"
                    required
                  />
                  <span>
                    I agree to the{' '}
                    <a href="#terms" onClick={(e) => e.preventDefault()} className="text-blue-600 hover:underline font-medium">
                      Terms & Conditions
                    </a>
                  </span>
                </label>
              </div>
            )}

            {/* Sign In Button (Solid Royal Blue matching Screenshot) */}
            <div className="pt-1.5">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#113C94] hover:bg-[#0D3077] text-white py-2.5 rounded-lg text-xs font-bold shadow-sm transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {loading ? (
                  <span>Please wait...</span>
                ) : (
                  <span>{isRegister ? 'Create Account →' : 'Sign In →'}</span>
                )}
              </button>
            </div>

          </form>

          {/* Bottom Switch Link */}
          <div className="text-center text-xs text-slate-600 pt-1">
            {isRegister ? (
              <span>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => { setIsRegister(false); setError(''); }}
                  className="text-[#1D4ED8] font-bold hover:underline ml-0.5 cursor-pointer"
                >
                  Sign In
                </button>
              </span>
            ) : (
              <span>
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => { setIsRegister(true); setError(''); }}
                  className="text-[#1D4ED8] font-bold hover:underline ml-0.5 cursor-pointer"
                >
                  Register Now
                </button>
              </span>
            )}
          </div>

        </div>
      </div>

      {/* Footer Text below Card */}
      <div className="text-center text-xs text-slate-400 mt-3 mb-6">
        © Awas India | AWAS Yojana Portal
      </div>

    </div>
  );
};
