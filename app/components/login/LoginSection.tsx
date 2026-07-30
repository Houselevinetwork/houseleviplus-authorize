'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { EmailStep } from './steps/EmailStep';
import { OtpStep } from './steps/OtpStep';
import { DeviceLimitStep } from './steps/DeviceLimitStep';
import { SignupSentStep } from './steps/SignupSentStep';
import {
  requestOtp,
  verifyOtp,
  freeDeviceSlot,
  requestSignup,
  ApiError,
  type LoginResult,
  type DeviceSummary,
} from '@/lib/api';

type Step = 'email' | 'otp' | 'device-limit' | 'signup-sent';

const webAppUrl = process.env.NEXT_PUBLIC_WEB_APP_URL || 'https://houselevi.com';

// Callers (e.g. gopremium) that redirect here to log in can pass ?returnTo=
// so the user lands back where they came from instead of the default web
// app. Only ever redirect to a *.houselevi.com origin -- never to whatever
// an attacker put in the query string.
function resolveAllowedReturnToOrigin(candidate: string | null): string | null {
  if (!candidate) return null;

  let url: URL;
  try {
    url = new URL(candidate);
  } catch {
    return null;
  }

  if (url.protocol !== 'https:') return null;

  const hostname = url.hostname.toLowerCase();
  const isHouseLeviHost = hostname === 'houselevi.com' || hostname.endsWith('.houselevi.com');
  if (!isHouseLeviHost) return null;

  return url.origin;
}

// Backend doesn't give a resend cooldown for request-signup (its real limit
// is "max 3 emails/hour", enforced server-side) — this is just a client-side
// guard against accidental double-clicks.
const SIGNUP_RESEND_COOLDOWN_SECONDS = 60;

function friendlyOtpError(err: ApiError): string {
  switch (err.code) {
    case 'OTP_INVALID':
      return "That code isn't right. Please check and try again.";
    case 'OTP_EXPIRED':
      return 'This code has expired. Request a new one below.';
    case 'OTP_MAX_ATTEMPTS':
      return 'Too many incorrect attempts. Please request a new code.';
    default:
      return err.message;
  }
}

export function LoginSection() {
  const searchParams = useSearchParams();
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendCountdown, setResendCountdown] = useState(0);
  // Validity hint for whatever the backend just sent — an OTP code (600s)
  // or a signup verification link (900s). Only one step shows this at a time.
  const [codeExpiresIn, setCodeExpiresIn] = useState<number | undefined>(undefined);
  const [deviceLimitDevices, setDeviceLimitDevices] = useState<DeviceSummary[]>([]);
  const [deviceManagementToken, setDeviceManagementToken] = useState<string | null>(null);

  useEffect(() => {
    if (resendCountdown <= 0) return;
    const timer = setTimeout(() => setResendCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCountdown]);

  const completeLogin = (data: LoginResult) => {
    // The backend already set an HttpOnly session cookie (scoped to
    // .houselevi.com) on this response — that's what actually authenticates
    // the user going forward. We deliberately do NOT persist accessToken/
    // refreshToken/user to localStorage: this component redirects away
    // immediately, so there's nothing here that needs to survive past this
    // request, and a JS-readable store is exactly what an XSS payload would
    // read first.
    const returnTo = resolveAllowedReturnToOrigin(searchParams.get('returnTo'));
    const redirectBase = returnTo || webAppUrl;
    window.location.href = `${redirectBase}/auth/callback?code=${data.accessToken}`;
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const result = await requestOtp(email);
      setStep('otp');
      setOtp('');
      setResendCountdown(result.canResendIn || 60);
      setCodeExpiresIn(result.expiresIn || 600);
    } catch (err) {
      if (err instanceof ApiError && err.isEmailNotFound()) {
        // Netflix-style routing: no account for this email yet, so silently
        // switch to the signup path instead of dead-ending on an error.
        try {
          const signupResult = await requestSignup(email);
          setStep('signup-sent');
          setResendCountdown(SIGNUP_RESEND_COOLDOWN_SECONDS);
          setCodeExpiresIn(signupResult.expiresIn || 900);
        } catch (signupErr) {
          setError(
            signupErr instanceof ApiError ? signupErr.message : 'Something went wrong. Please try again.',
          );
        }
        return;
      }
      setError(err instanceof ApiError ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const result = await verifyOtp(email, otp);
      completeLogin(result);
    } catch (err) {
      if (err instanceof ApiError) {
        const deviceLimit = err.asDeviceLimitReached();
        if (deviceLimit) {
          setDeviceLimitDevices(deviceLimit.devices);
          setDeviceManagementToken(deviceLimit.deviceManagementToken);
          setStep('device-limit');
          return;
        }
        setError(friendlyOtpError(err));
      } else {
        setError('Verification failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setError(null);
    setLoading(true);

    try {
      const result = await requestOtp(email);
      setResendCountdown(result.canResendIn || 60);
      setCodeExpiresIn(result.expiresIn || 600);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to resend code.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendSignup = async () => {
    setError(null);
    setLoading(true);

    try {
      const result = await requestSignup(email);
      setResendCountdown(SIGNUP_RESEND_COOLDOWN_SECONDS);
      setCodeExpiresIn(result.expiresIn || 900);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to resend verification email.');
    } finally {
      setLoading(false);
    }
  };

  const handleFreeSlot = async (deviceId: string) => {
    if (!deviceManagementToken) return;

    setError(null);
    setLoading(true);

    try {
      const result = await freeDeviceSlot(deviceManagementToken, deviceId);
      completeLogin(result);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to sign out that device. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const backToEmail = () => {
    setStep('email');
    setOtp('');
    setError(null);
    setDeviceLimitDevices([]);
    setDeviceManagementToken(null);
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
          {step === 'email' && (
            <EmailStep
              email={email}
              loading={loading}
              error={error}
              onEmailChange={setEmail}
              onSubmit={handleEmailSubmit}
            />
          )}

          {step === 'otp' && (
            <OtpStep
              email={email}
              otp={otp}
              loading={loading}
              error={error}
              countdown={resendCountdown}
              expiresInSeconds={codeExpiresIn}
              onOtpChange={setOtp}
              onSubmit={handleOtpSubmit}
              onResend={handleResendOtp}
              onBack={backToEmail}
            />
          )}

          {step === 'signup-sent' && (
            <SignupSentStep
              email={email}
              loading={loading}
              error={error}
              expiresInSeconds={codeExpiresIn}
              canResendIn={resendCountdown}
              onResend={handleResendSignup}
              onBack={backToEmail}
            />
          )}

          {step === 'device-limit' && (
            <DeviceLimitStep
              devices={deviceLimitDevices}
              loading={loading}
              error={error}
              onSelectDevice={handleFreeSlot}
              onBack={backToEmail}
            />
          )}
        </div>
      </div>
    </div>
  );
}
