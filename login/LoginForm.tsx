'use client';

import { EmailStep } from './steps/EmailStep';
import { OtpStep } from './steps/OtpStep';
import { SignupStep } from './steps/SignupStep';

interface LoginFormProps {
  step: string;
  email: string;
  otp: string;
  loading: boolean;
  error: string | null;
  countdown: number;
  emailSent: boolean;
  userName: string;
  subscriptionStatus: 'free' | 'premium' | 'guest';
  onEmailChange: (email: string) => void;
  onOtpChange: (otp: string) => void;
  onEmailSubmit: (e: React.FormEvent) => void;
  onOtpSubmit: (e: React.FormEvent) => void;
  onSignup: () => void;
  onResendOTP: () => void;
  onBackToEmail: () => void;
}

export function LoginForm(props: LoginFormProps) {
  const handleLogoClick = () => {
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  };

  return (
    <div className="login-left">
      <div className="login-form-wrap">
        <button
          className="login-logo"
          onClick={handleLogoClick}
          type="button"
        >
          HOUSE LEVI<span>+</span>
        </button>

        {props.step === 'email' && <EmailStep {...props} />}
        {props.step === 'otp' && <OtpStep {...props} />}
        {props.step === 'signup' && <SignupStep {...props} />}
      </div>
    </div>
  );
}