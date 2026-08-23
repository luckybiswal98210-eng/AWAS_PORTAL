import React, { useState } from 'react';
import { Eye, EyeOff, Lock, Mail, AlertCircle, ShieldCheck } from 'lucide-react';
import { AWASLogo } from './AWASLogo';
import { firebaseAuthHelper } from '../lib/firebase';
import { dbService } from '../lib/db';

export const AdminAuth = ({ onAdminLoginSuccess, onNavigate }) => {
  const [email, setEmail] = useState('admin@awasindia.com');
  const [password, setPassword] = useState('Admin@123');
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
        full_name: 'Administrator',
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
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px 16px' }}>
      
      {/* Admin Sign In Card matching Screenshot */}
      <div 
        style={{
          width: '100%',
          maxWidth: '400px',
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
          border: '1px solid rgba(226, 232, 240, 0.9)',
          padding: '32px 28px',
          boxSizing: 'border-box'
        }}
      >
        
        {/* Header */}
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '24px' }}>
          <div style={{ width: '64px', height: '64px', backgroundColor: '#ffffff', borderRadius: '9999px', padding: '2px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', marginBottom: '8px', border: '1px solid #E2E8F0' }}>
            <AWASLogo size="medium" />
          </div>
          <h1 style={{ fontSize: '22px', fontWeight: '800', color: '#0F172A', letterSpacing: '-0.02em', margin: '0' }}>
            Awas India
          </h1>
          <p style={{ fontSize: '13px', color: '#64748B', fontWeight: '500', marginTop: '4px', margin: '0' }}>
            Sign in to your admin account
          </p>
        </div>

        {/* Demo Credentials Box */}
        <div style={{ backgroundColor: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '8px', padding: '10px 12px', marginBottom: '18px', fontSize: '11px', color: '#166534' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontWeight: '700', marginBottom: '3px' }}>
            <ShieldCheck style={{ width: '14px', height: '14px', color: '#16A34A' }} />
            <span>Admin Demo Credentials:</span>
          </div>
          <div>ID / Email: <strong style={{ color: '#0F172A' }}>admin@awasindia.com</strong></div>
          <div>Password: <strong style={{ color: '#0F172A' }}>Admin@123</strong></div>
        </div>

        {error && (
          <div style={{ backgroundColor: '#FEF2F2', border: '1px solid #FECACA', color: '#B91C1C', fontSize: '12px', borderRadius: '6px', padding: '10px', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <AlertCircle style={{ width: '16px', height: '16px', flexShrink: 0, color: '#DC2626' }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Email Field */}
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#334155', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@awasindia.com"
              style={{
                width: '100%',
                backgroundColor: '#F8FAFC',
                border: '1px solid #CBD5E1',
                borderRadius: '8px',
                padding: '10px 12px',
                fontSize: '13px',
                color: '#1E293B',
                boxSizing: 'border-box'
              }}
              required
            />
          </div>

          {/* Password Field */}
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#334155', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
              Password
            </label>
            <div style={{ position: 'relative', width: '100%' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                style={{
                  width: '100%',
                  backgroundColor: '#F8FAFC',
                  border: '1px solid #CBD5E1',
                  borderRadius: '8px',
                  padding: '10px 48px 10px 12px',
                  fontSize: '13px',
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
                  color: '#64748B',
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

          {/* Submit Button */}
          <div style={{ paddingTop: '4px' }}>
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                backgroundColor: '#111827',
                color: '#ffffff',
                fontWeight: '700',
                padding: '12px 16px',
                borderRadius: '10px',
                fontSize: '14px',
                border: 'none',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </div>

        </form>

        {/* Back to user login */}
        {onNavigate && (
          <div style={{ textAlign: 'center', paddingTop: '16px', marginTop: '16px', borderTop: '1px solid #F1F5F9' }}>
            <button
              type="button"
              onClick={() => onNavigate('login')}
              style={{
                fontSize: '12px',
                fontWeight: '600',
                color: '#1D4ED8',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                textDecoration: 'none'
              }}
            >
              ← Back to Beneficiary User Login
            </button>
          </div>
        )}

        <div style={{ textAlign: 'center', fontSize: '11px', color: '#94A3B8', marginTop: '12px' }}>
          AWAS India Secure Administrator Access
        </div>

      </div>
    </div>
  );
};
