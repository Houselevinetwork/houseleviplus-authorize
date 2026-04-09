'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export function LoginSection() {
  const searchParams = useSearchParams();
  const state = searchParams.get('state') || '';
  const nonce = searchParams.get('nonce') || '';

  const [step, setStep] = useState<'email' | 'otp' | 'signup'>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);
  const [emailExists, setEmailExists] = useState<boolean | null>(null);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const authServerUrl = process.env.NEXT_PUBLIC_AUTHORIZE_SERVER_URL || 'https://api.houselevi.com';
  const webAppUrl = process.env.NEXT_PUBLIC_WEB_APP_URL || 'https://houselevi.com';

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const url = `${authServerUrl}/auth/check-email`;

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Something went wrong');
        return;
      }

      if (data.action === 'signup' || !data.exists) {
        setEmailExists(false);
        setStep('signup');
        return;
      }

      if (data.action === 'login' || data.exists) {
        setEmailExists(true);

        const otpUrl = `${authServerUrl}/auth/otp-request`;
        const otpResponse = await fetch(otpUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, purpose: 'login' }),
        });

        const otpData = await otpResponse.json();

        if (!otpResponse.ok) {
          setError(otpData.error || 'Failed to send OTP');
          return;
        }

        setStep('otp');
        setCountdown(otpData.canResendIn || 60);
        return;
      }
    } catch (err: any) {
      setError(err.message || 'Failed to check email');
    } finally {
      setLoading(false);
    }
  };

  const handleSignupRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const url = `${authServerUrl}/auth/request-signup`;

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to send verification email');
        return;
      }

      setError(null);
      alert('Verification email sent! Check your inbox to complete signup.');

      window.location.href = '/';
    } catch (err: any) {
      setError(err.message || 'Failed to request verification');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const url = `${authServerUrl}/auth/otp-verify`;

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Invalid code');
        return;
      }

      if (data.accessToken) {
        localStorage.setItem('token', data.accessToken);
      }
      if (data.refreshToken) {
        localStorage.setItem('refreshToken', data.refreshToken);
      }
      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
      }

      const redirectUrl = `${webAppUrl}/auth/callback?code=${data.accessToken}`;
      window.location.href = redirectUrl;
    } catch (err: any) {
      setError(err.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setError(null);
    setLoading(true);

    try {
      const url = `${authServerUrl}/auth/otp-request`;

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, purpose: 'login' }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to resend code');
        return;
      }

      setCountdown(data.canResendIn || 60);
    } catch (err: any) {
      setError(err.message || 'Failed to resend code');
    } finally {
      setLoading(false);
    }
  };

  const backToEmail = () => {
    setStep('email');
    setOtp('');
    setEmailExists(null);
    setError(null);
  };

  return (
    <div className="login-root">
      <button
        className="login-logo"
        onClick={() => (window.location.href = '/')}
        type="button"
        aria-label="Home"
      >
        HOUSE LEVI<span>+</span>
      </button>

      <div className="login-form-wrap">
        <div>
          {/* STEP 1: Email Entry */}
          {step === 'email' && (
            <div className="login-form">
              <h2 className="login-title">Sign in to House Levi+</h2>
              <p className="login-subtitle">
                Enter your email to get started
              </p>

              {error && <div className="login-error">{error}</div>}

              <form onSubmit={handleEmailSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                <div className="login-field" style={{ marginBottom: '20px' }}>
                  <label htmlFor="email">Email Address</label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || !email}
                  className="btn-primary"
                >
                  {loading ? 'Checking...' : 'Continue'}
                </button>
              </form>

              <p className="login-help-text">
                We'll check if you have an account and send the appropriate verification method.
              </p>
            </div>
          )}

          {/* STEP 2: OTP for Existing Users */}
          {step === 'otp' && (
            <div className="login-form">
              <h2 className="login-title">Enter Verification Code</h2>
              <p className="login-subtitle">
                We sent a 6-digit code to <strong>{email}</strong>
              </p>

              {error && <div className="login-error">{error}</div>}

              <form onSubmit={handleOtpSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                <div className="login-field" style={{ marginBottom: '20px' }}>
                  <label htmlFor="otp">Verification Code</label>
                  <input
                    id="otp"
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="000000"
                    maxLength={6}
                    inputMode="numeric"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || otp.length !== 6}
                  className="btn-primary"
                >
                  {loading ? 'Verifying...' : 'Verify'}
                </button>

                <div style={{ display: 'flex', gap: '16px', marginTop: '20px', justifyContent: 'center' }}>
                  <button
                    type="button"
                    onClick={handleResendOTP}
                    disabled={loading || countdown > 0}
                    className="btn-text-black"
                  >
                    {countdown > 0 ? `Resend code in ${countdown}s` : 'Resend code'}
                  </button>

                  <button
                    type="button"
                    onClick={backToEmail}
                    className="btn-text-black"
                  >
                    Use Different Email
                  </button>
                </div>
              </form>

              <p className="login-help-text">
                Didn't receive the code? Check your spam folder or request a new one.
              </p>
            </div>
          )}

          {/* STEP 3: Signup for New Users */}
          {step === 'signup' && (
            <div className="login-form">
              <h2 className="login-title">Create Your Account</h2>
              <p className="login-subtitle">
                We'll send you a verification link to complete signup
              </p>

              {error && <div className="login-error">{error}</div>}

              <form onSubmit={handleSignupRequest} style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                <div className="login-field" style={{ marginBottom: '20px' }}>
                  <label htmlFor="signup-email">Email</label>
                  <input
                    id="signup-email"
                    type="email"
                    value={email}
                    readOnly
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary"
                >
                  {loading ? 'Sending...' : 'Send Verification Link'}
                </button>

                <div style={{ display: 'flex', gap: '16px', marginTop: '20px', justifyContent: 'center' }}>
                  <button
                    type="button"
                    onClick={backToEmail}
                    className="btn-text-black"
                  >
                    Use Different Email
                  </button>
                </div>
              </form>

              <p className="login-help-text">
                You'll receive an email with a link to finish creating your account.
                The link expires in 15 minutes.
              </p>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .btn-text-black {
          background: none;
          border: none;
          color: #000000;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          padding: 0;
          text-decoration: underline;
          transition: color 0.3s ease;
        }

        .btn-text-black:hover {
          color: #333333;
        }

        .btn-text-black:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}