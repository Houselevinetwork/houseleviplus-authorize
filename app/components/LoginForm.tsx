// ═══════════════════════════════════════════════════════════════════════════════
// FIXED: LoginForm.tsx with corrected template string
// This fixes the unicode escape error
// ═══════════════════════════════════════════════════════════════════════════════

'use client';

import { useState } from 'react';
import { login } from '@/lib/api';
import { validateEmail, validatePassword } from '@/lib/validation';
import { useSearchParams } from 'next/navigation';

export default function LoginForm() {
  const searchParams = useSearchParams();
  const state = searchParams.get('state') || '';
  const nonce = searchParams.get('nonce') || '';

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState('login');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    const emailError = validateEmail(formData.email);
    if (emailError) newErrors.email = emailError;
    const passwordError = validatePassword(formData.password);
    if (passwordError) newErrors.password = passwordError;
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError('');
    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await login({
        email: formData.email,
        password: formData.password,
        state,
        nonce,
      });

      if (response.success) {
        // FIX: Properly construct the URL
        const authServerUrl = process.env.NEXT_PUBLIC_AUTHORIZE_SERVER_URL || 'http://localhost:3002';
        const consentUrl = `${authServerUrl}/oauth/consent?state=${state}&code=${response.code}`;
        window.location.href = consentUrl;
      } else {
        setServerError(response.error || 'Login failed');
      }
    } catch {
      setServerError('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[440px] px-8">
      <div className="space-y-8">
        <div className="text-center pb-0.5">
          <h1 
            className="text-[26px] font-bold text-dw-black" 
            style={{ lineHeight: '1.1', letterSpacing: '-0.78px' }}
          >
            Your Account
          </h1>
        </div>

        <div className="w-full">
          <div className="flex border-b border-gray-300">
            <button
              onClick={() => setActiveTab('login')}
              className={`tab ${activeTab === 'login' ? 'active' : ''}`}
            >
              Log In
            </button>
            <button
              onClick={() => setActiveTab('signup')}
              className={`tab ${activeTab === 'signup' ? 'active' : ''}`}
            >
              Sign Up
            </button>
          </div>
        </div>

        {serverError && <div className="alert alert-error">{serverError}</div>}

        {activeTab === 'login' && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label 
                htmlFor="email" 
                className="block mb-2 text-lg font-semibold text-dw-black" 
                style={{ letterSpacing: '-0.36px' }}
              >
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="yours@example.com"
                style={{ color: formData.email ? '#140D0E' : '#8F8F8F' }}
              />
              {errors.email && <span className="text-red-600 text-sm mt-1 block">{errors.email}</span>}
            </div>

            <div>
              <label 
                htmlFor="password" 
                className="block mb-2 text-lg font-semibold text-dw-black" 
                style={{ letterSpacing: '-0.36px' }}
              >
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="your password"
                  style={{ color: formData.password ? '#140D0E' : '#8F8F8F', paddingRight: '56px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="password-toggle"
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
              {errors.password && <span className="text-red-600 text-sm mt-1 block">{errors.password}</span>}
            </div>

            <div className="flex justify-end">
              <a 
                href="/forgot-password" 
                className="text-xs font-bold text-dw-grey-60 hover:text-dw-black" 
                style={{ letterSpacing: '-0.30px' }}
              >
                Don't remember your password?
              </a>
            </div>

            <div className="flex justify-center pt-3">
              <button type="submit" disabled={loading} className="btn-login">
                {loading ? <span className="spinner"></span> : 'LOG IN'}
              </button>
            </div>
          </form>
        )}

        <div className="text-center">
          <p className="text-sm text-dw-grey-56" style={{ letterSpacing: '-0.30px' }}>
            New to HouseLevi?{' '}
            <a 
              href="/signup" 
              className="text-dw-black font-bold hover:text-dw-red" 
              style={{ letterSpacing: '-0.30px' }}
            >
              Sign up free
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}