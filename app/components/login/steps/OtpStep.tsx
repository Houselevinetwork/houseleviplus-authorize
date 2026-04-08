'use client';

interface OtpStepProps {
  email: string;
  otp: string;
  loading: boolean;
  error: string | null;
  countdown: number;
  onOtpChange: (otp: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onResend: () => void;
  onBack: () => void;
}

export function OtpStep({
  email,
  otp,
  loading,
  error,
  countdown,
  onOtpChange,
  onSubmit,
  onResend,
  onBack,
}: OtpStepProps) {
  return (
    <>
      <div className="login-heading">
        <h1>Check your email</h1>
        <p>
          We sent a code to <strong>{email}</strong>
        </p>
      </div>

      {error && <div className="login-error">{error}</div>}

      <form onSubmit={onSubmit} className="login-form">
        <div className="login-field">
          <label htmlFor="otp">Enter your code</label>
          <input
            type="text"
            id="otp"
            value={otp}
            onChange={(e) =>
              onOtpChange(
                e.target.value
                  .replace(/[^0-9]/g, '')
                  .slice(0, 6)
              )
            }
            placeholder="000000"
            maxLength={6}
            required
            autoFocus
            disabled={loading}
            inputMode="numeric"
          />
        </div>
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Verifying…' : 'Confirm'}
        </button>

        <div className="login-links">
          <button
            type="button"
            className="btn-text"
            onClick={onResend}
            disabled={countdown > 0 || loading}
          >
            {countdown > 0 ? `Resend code in ${countdown}s` : 'Resend code'}
          </button>
          <button
            type="button"
            className="btn-text"
            onClick={onBack}
            disabled={loading}
          >
            Use different email
          </button>
        </div>
      </form>
    </>
  );
}