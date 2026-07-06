'use client';

interface SignupSentStepProps {
  email: string;
  loading: boolean;
  error: string | null;
  /** Seconds the verification link stays valid (900 = 15 min); shown as a hint. */
  expiresInSeconds?: number;
  /** Seconds before a resend is allowed. */
  canResendIn: number;
  onResend: () => void;
  onBack: () => void;
}

export function SignupSentStep({
  email,
  loading,
  error,
  expiresInSeconds,
  canResendIn,
  onResend,
  onBack,
}: SignupSentStepProps) {
  return (
    <>
      <div className="login-heading">
        <h1>Welcome! Let&apos;s create your account</h1>
        <p>
          We&apos;ve sent a link to <strong>{email}</strong> to verify your email and finish signing up.
        </p>
        {typeof expiresInSeconds === 'number' && (
          <p className="login-hint">This link is valid for {Math.round(expiresInSeconds / 60)} minutes.</p>
        )}
      </div>

      {error && <div className="login-error">{error}</div>}

      <p className="login-hint">
        Click the link in that email to create your account. You can close this tab once you do.
      </p>

      <div className="login-links">
        <button type="button" className="btn-text" onClick={onResend} disabled={canResendIn > 0 || loading}>
          {canResendIn > 0 ? `Resend link in ${canResendIn}s` : 'Resend link'}
        </button>
        <button type="button" className="btn-text" onClick={onBack} disabled={loading}>
          Use different email
        </button>
      </div>
    </>
  );
}
