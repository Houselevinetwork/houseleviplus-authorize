'use client';

import { useState, useEffect } from 'react';
import { EmailStep } from './steps/EmailStep';
import { OtpStep } from './steps/OtpStep';
import { DeviceLimitStep } from './steps/DeviceLimitStep';
import { requestOtp, verifyOtp, freeDeviceSlot, ApiError, type LoginResult, type DeviceSummary } from '@/lib/api';

type Step = 'email' | 'otp' | 'device-limit';

const webAppUrl = process.env.NEXT_PUBLIC_WEB_APP_URL || 'https://houselevi.com';

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
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendCountdown, setResendCountdown] = useState(0);
  const [otpExpiresIn, setOtpExpiresIn] = useState<number | undefined>(undefined);
  const [deviceLimitDevices, setDeviceLimitDevices] = useState<DeviceSummary[]>([]);
  const [deviceManagementToken, setDeviceManagementToken] = useState<string | null>(null);

  useEffect(() => {
    if (resendCountdown <= 0) return;
    const timer = setTimeout(() => setResendCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCountdown]);

  const completeLogin = (data: LoginResult) => {
    localStorage.setItem('token', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    localStorage.setItem('user', JSON.stringify(data.user));

    window.location.href = `${webAppUrl}/auth/callback?code=${data.accessToken}`;
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
      setOtpExpiresIn(result.expiresIn || 600);
    } catch (err) {
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
      setOtpExpiresIn(result.expiresIn || 600);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to resend code.');
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
              expiresInSeconds={otpExpiresIn}
              onOtpChange={setOtp}
              onSubmit={handleOtpSubmit}
              onResend={handleResendOtp}
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
