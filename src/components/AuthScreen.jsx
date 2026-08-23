import React, { useState } from 'react';
import { AWASLogo } from './AWASLogo';
import { ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
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

export const AuthScreen = ({ viewMode = 'login', onNavigate, onLoginSuccess }) => {
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
        setSuccessMsg('Account created successfully! Welcome to AWAS India Portal.');
        setTimeout(() => {
          onLoginSuccess(newUser);
        }, 800);

      } else {
        // Sign In logic
        if (!formData.email.trim()) throw new Error('Please enter your registered email address');
        if (!formData.password) throw new Error('Please enter your password');

        const result = await firebaseAuthHelper.signIn(formData.email, formData.password);

        const loggedInUser = {
          id: result.user?.uid || 'usr_' + Date.now(),
          email: formData.email,
          full_name: result.user?.displayName || formData.email.split('@')[0].toUpperCase(),
          state: 'Odisha',
          role: formData.email.includes('admin') ? 'admin' : 'user'
        };

        dbService.setCurrentUser(loggedInUser);
        onLoginSuccess(loggedInUser);
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center py-10 px-4">
      {/* Container Card */}
      <div className="w-full max-w-md bg-white rounded-xl shadow-xl overflow-hidden border border-slate-200">
        
        {/* Header Card Box (Exact Blue matching Screenshot) */}
        <div className="bg-brand-navy text-white pt-8 pb-6 px-6 text-center flex flex-col items-center">
          <AWASLogo size="medium" className="mb-3" />
          <h2 className="text-xs font-semibold tracking-wider text-blue-200 uppercase">
            AWAS INDIA / आवास इंडिया
          </h2>
          <h3 className="text-xl font-extrabold mt-1 text-white">
            {isRegister ? 'Create Account' : 'Welcome Back'}
          </h3>
          <p className="text-xs text-blue-200 mt-1">
            {isRegister ? 'Register to access AWAS Yojana portal' : 'Sign in to your AWAS Yojana account'}
          </p>
        </div>

        {/* Card Body */}
        <div className="p-6 sm:p-8">
          
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-md p-3 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0-5" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-md p-3 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 mt-0-5" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* FULL NAME (Only for Register) */}
            {isRegister && (
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
                placeholder={isRegister ? 'Enter your email address' : 'Enter registered email address'}
                className="awas-input"
                required
              />
            </div>

            {/* STATE (Only for Register) */}
            {isRegister && (
              <div>
                <label className="block text-xs font-bold tracking-wider text-slate-700 uppercase mb-1">
                  STATE <span className="text-red-500">*</span>
                </label>
                <select
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  className="awas-select"
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
                  placeholder={isRegister ? 'Minimum 6 characters' : 'Enter your password'}
                  className="awas-input"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1-2 text-xs font-semibold text-slate-500 hover:text-blue-600 px-2 py-1"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            {/* CONFIRM PASSWORD (Only for Register) */}
            {isRegister && (
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
                    className="awas-input"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-2 top-1-2 text-xs font-semibold text-slate-500 hover:text-blue-600 px-2 py-1"
                  >
                    {showConfirmPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>
            )}

            {/* Remember Me / Forgot Password (Sign In Only) */}
            {!isRegister && (
              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-slate-600">
                  <input
                    type="checkbox"
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onChange={handleChange}
                    className="rounded border-slate-300 text-blue-600"
                  />
                  <span>Remember me</span>
                </label>
                <a 
                  href="#forgot" 
                  onClick={(e) => { e.preventDefault(); alert('Password reset link sent to your registered email!'); }} 
                  className="text-blue-600 font-medium hover:underline"
                >
                  Forgot Password?
                </a>
              </div>
            )}

            {/* Agree Terms Checkbox (Register Only) */}
            {isRegister && (
              <div className="pt-1">
                <label className="flex items-start gap-2 cursor-pointer text-xs text-slate-600">
                  <input
                    type="checkbox"
                    name="agreeTerms"
                    checked={formData.agreeTerms}
                    onChange={handleChange}
                    className="mt-0-5 rounded border-slate-300 text-blue-600"
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

            {/* Submit Action Button (Exact Blue matching Screenshot) */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary py-2-5 text-sm rounded-md font-bold shadow-md hover:shadow-lg transition-all"
              >
                {loading ? (
                  <span>Authenticating...</span>
                ) : (
                  <>
                    <span>{isRegister ? 'Create Account' : 'Sign In'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>

          </form>

          {/* Toggle link below button */}
          <div className="mt-6 text-center text-xs text-slate-600 pt-4 border-t border-slate-100 space-y-3">
            <div>
              {isRegister ? (
                <span>
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => { setIsRegister(false); setError(''); }}
                    className="text-blue-600 font-bold hover:underline"
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
                    className="text-blue-600 font-bold hover:underline"
                  >
                    Register Now
                  </button>
                </span>
              )}
            </div>

            {/* Officer / Admin Portal Direct Link */}
            <div className="pt-2 border-t border-dashed border-slate-200">
              <button
                type="button"
                onClick={() => onNavigate('adminAuth')}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-md border border-slate-300 transition"
              >
                <span>Officer / Admin Portal Login</span>
                <span>→</span>
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Footer Caption */}
      <div className="text-center text-xs text-slate-500 mt-4">
        © Awas India | AWAS Yojana Portal
      </div>
    </div>
  );
};
