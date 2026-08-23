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

        await dbService.saveUser(newUser);
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
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px 16px' }}>
      
      {/* Centered Login Card (Exact 100% Match to Screenshot 1) */}
      <div 
        style={{
          width: '100%',
          maxWidth: '390px',
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
          overflow: 'hidden',
          border: '1px solid rgba(226, 232, 240, 0.9)'
        }}
      >
        
        {/* Card Header (Deep Royal Navy Blue #18396D) */}
        <div 
          style={{
            backgroundColor: '#18396D',
            color: '#ffffff',
            paddingTop: '24px',
            paddingBottom: '20px',
            paddingLeft: '24px',
            paddingRight: '24px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}
        >
          
          {/* Circular Logo Emblem */}
          <div 
            style={{
              width: '84px',
              height: '84px',
              backgroundColor: '#ffffff',
              borderRadius: '9999px',
              padding: '2px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              marginBottom: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <AWASLogo size="large" />
          </div>

          <h2 style={{ fontSize: '11px', fontWeight: '600', letterSpacing: '0.05em', color: '#BFDBFE', textTransform: 'uppercase', margin: '0' }}>
            AWAS INDIA / आवास इंडिया
          </h2>

          <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#ffffff', marginTop: '4px', marginBottom: '0' }}>
            {isRegister ? 'Create Account' : 'Welcome Back'}
          </h3>

          <p style={{ fontSize: '11px', color: 'rgba(191, 219, 254, 0.9)', marginTop: '2px', marginBottom: '0' }}>
            {isRegister 
              ? 'Register to access AWAS Yojana portal' 
              : 'Sign in to your AWAS Yojana account'}
          </p>
        </div>

        {/* Card Body */}
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {error && (
            <div style={{ backgroundColor: '#FEF2F2', border: '1px solid #FECACA', color: '#B91C1C', fontSize: '12px', borderRadius: '6px', padding: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertCircle style={{ width: '16px', height: '16px', flexShrink: 0, color: '#DC2626' }} />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div style={{ backgroundColor: '#ECFDF5', border: '1px solid #A7F3D0', color: '#047857', fontSize: '12px', borderRadius: '6px', padding: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle2 style={{ width: '16px', height: '16px', flexShrink: 0, color: '#059669' }} />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            
            {/* FULL NAME (Only for Register) */}
            {isRegister && (
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#334155', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
                  FULL NAME <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  style={{
                    width: '100%',
                    backgroundColor: '#F0F7FF',
                    border: '1px solid #CBD5E1',
                    borderRadius: '6px',
                    padding: '8px 12px',
                    fontSize: '12px',
                    color: '#1E293B',
                    boxSizing: 'border-box'
                  }}
                  required
                />
              </div>
            )}

            {/* EMAIL ADDRESS */}
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#334155', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
                EMAIL ADDRESS <span style={{ color: '#EF4444' }}>*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder={isRegister ? "Enter your email address" : "Enter registered email address"}
                style={{
                  width: '100%',
                  backgroundColor: '#F0F7FF',
                  border: '1px solid #CBD5E1',
                  borderRadius: '6px',
                  padding: '8px 12px',
                  fontSize: '12px',
                  color: '#1E293B',
                  boxSizing: 'border-box'
                }}
                required
              />
            </div>

            {/* STATE (Only for Register) */}
            {isRegister && (
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#334155', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
                  STATE <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <select
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    backgroundColor: '#F0F7FF',
                    border: '1px solid #CBD5E1',
                    borderRadius: '6px',
                    padding: '8px 12px',
                    fontSize: '12px',
                    color: '#1E293B',
                    boxSizing: 'border-box'
                  }}
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
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#334155', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
                PASSWORD <span style={{ color: '#EF4444' }}>*</span>
              </label>
              <div style={{ position: 'relative', width: '100%' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  style={{
                    width: '100%',
                    backgroundColor: '#F0F7FF',
                    border: '1px solid #CBD5E1',
                    borderRadius: '6px',
                    padding: '8px 48px 8px 12px',
                    fontSize: '12px',
                    color: '#1E293B',
                    boxSizing: 'border-box'
                  }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    fontSize: '12px',
                    color: '#94A3B8',
                    fontWeight: '500',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            {/* CONFIRM PASSWORD (Only for Register) */}
            {isRegister && (
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#334155', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
                  CONFIRM PASSWORD <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <div style={{ position: 'relative', width: '100%' }}>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Re-enter password"
                    style={{
                      width: '100%',
                      backgroundColor: '#F0F7FF',
                      border: '1px solid #CBD5E1',
                      borderRadius: '6px',
                      padding: '8px 48px 8px 12px',
                      fontSize: '12px',
                      color: '#1E293B',
                      boxSizing: 'border-box'
                    }}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      fontSize: '12px',
                      color: '#94A3B8',
                      fontWeight: '500',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    {showConfirmPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>
            )}

            {/* Remember Me & Forgot Password */}
            {!isRegister && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px', paddingTop: '2px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', color: '#475569', userSelect: 'none' }}>
                  <input
                    type="checkbox"
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onChange={handleChange}
                    style={{ width: '14px', height: '14px', borderRadius: '3px', accentColor: '#1D4ED8', cursor: 'pointer' }}
                  />
                  <span>Remember me</span>
                </label>
                <a 
                  href="#forgot" 
                  onClick={(e) => { e.preventDefault(); alert('Password reset instructions sent to your email.'); }} 
                  style={{ fontSize: '12px', color: '#1D4ED8', fontWeight: '700', textDecoration: 'none' }}
                >
                  Forgot Password?
                </a>
              </div>
            )}

            {/* Terms Checkbox (Register Only) */}
            {isRegister && (
              <div style={{ paddingTop: '2px' }}>
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', cursor: 'pointer', fontSize: '12px', color: '#475569' }}>
                  <input
                    type="checkbox"
                    name="agreeTerms"
                    checked={formData.agreeTerms}
                    onChange={handleChange}
                    style={{ marginTop: '2px', width: '14px', height: '14px', accentColor: '#1D4ED8', cursor: 'pointer' }}
                    required
                  />
                  <span>
                    I agree to the{' '}
                    <a href="#terms" onClick={(e) => e.preventDefault()} style={{ color: '#1D4ED8', textDecoration: 'underline', fontWeight: '500' }}>
                      Terms & Conditions
                    </a>
                  </span>
                </label>
              </div>
            )}

            {/* Sign In Button (Solid Royal Blue matching Screenshot) */}
            <div style={{ paddingTop: '4px' }}>
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  backgroundColor: '#113C94',
                  color: '#ffffff',
                  padding: '10px 16px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: '700',
                  border: 'none',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  transition: 'background-color 0.2s'
                }}
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
          <div style={{ textAlign: 'center', fontSize: '12px', color: '#475569', paddingTop: '4px' }}>
            {isRegister ? (
              <span>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => { setIsRegister(false); setError(''); }}
                  style={{ color: '#1D4ED8', fontWeight: '700', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'none' }}
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
                  style={{ color: '#1D4ED8', fontWeight: '700', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'none' }}
                >
                  Register Now
                </button>
              </span>
            )}
          </div>

          {/* Downside Option: Officer / Admin Login */}
          <div style={{ textAlign: 'center', paddingTop: '10px', marginTop: '4px', borderTop: '1px solid #F1F5F9' }}>
            <button
              type="button"
              onClick={() => {
                if (onNavigate) onNavigate('adminAuth');
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: '6px',
                padding: '6px 14px',
                fontSize: '11px',
                fontWeight: '600',
                color: '#475569',
                cursor: 'pointer',
                transition: 'all 0.15s'
              }}
            >
              <span>Official / Staff?</span>
              <strong style={{ color: '#1E40AF' }}>Admin Login →</strong>
            </button>
          </div>

        </div>
      </div>

      {/* Footer Text below Card */}
      <div style={{ textAlign: 'center', fontSize: '12px', color: '#94A3B8', marginTop: '12px', marginBottom: '24px' }}>
        © Awas India | AWAS Yojana Portal
      </div>

    </div>
  );
};
