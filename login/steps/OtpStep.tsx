'use client';

interface OtpStepProps {
  otp: string;
  email: string;
  loading: boolean;
  error: string | null;
  countdown: number;
  onOtpChange: (otp: string) => void;
  onOtpSubmit: (e: React.FormEvent) => void;
  onResendOTP: () => void;
  onBackToEmail: () => void;
}

export function OtpStep({
  otp,
  email,
  loading,
  error,
  countdown,
  onOtpChange,
  onOtpSubmit,
  onResendOTP,
  onBackToEmail,
}: OtpStepProps) {
  return (
    <>
      <div className="login-heading">
        <h1>Check your email.</h1>
        <p>Enter the 6-digit code we sent you.</p>
      </div>

      {error && <div className="login-error">{error}</div>}

      <form onSubmit={onOtpSubmit} className="login-form">
        <div className="login-field">
          <label>Verification code</label>
          <input
            type="text"
            value={otp}
            onChange={(e) =>
              onOtpChange(e.target.value.replace(/\D/g, '').slice(0, 6))
            }
            placeholder="— — — — — —"
            required
            autoFocus
            maxLength={6}
            className="otp-input"
          />
          <span className="login-hint">
            We sent a 6-digit code to <strong>{email}</strong>
          </span>
        </div>
        <button
          type="submit"
          className="btn-primary"
          disabled={loading || otp.length !== 6}
        >
          {loading ? 'Verifying…' : 'Verify & Sign In'}
        </button>
        <div className="login-actions">
          <button
            type="button"
            className="btn-ghost"
            onClick={onResendOTP}
            disabled={countdown > 0}
          >
            {countdown > 0 ? `Resend in ${countdown}s` : 'Resend code'}
          </button>
          <button type="button" className="btn-ghost" onClick={onBackToEmail}>
            ← Back
          </button>
        </div>
      </form>
    </>
  );
}