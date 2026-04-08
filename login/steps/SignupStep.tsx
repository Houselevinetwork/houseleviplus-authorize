'use client';

interface SignupStepProps {
  email: string;
  loading: boolean;
  error: string | null;
  emailSent: boolean;
  onSignup: () => void;
  onBackToEmail: () => void;
}

export function SignupStep({
  email,
  loading,
  error,
  emailSent,
  onSignup,
  onBackToEmail,
}: SignupStepProps) {
  return (
    <>
      <div className="login-heading">
        {!emailSent ? (
          <>
            <h1>Join the story.</h1>
            <p>Create your House Levi+ account.</p>
          </>
        ) : (
          <>
            <h1>Email on its way.</h1>
            <p>Check your inbox to finish signing up.</p>
          </>
        )}
      </div>

      {error && <div className="login-error">{error}</div>}

      {!emailSent ? (
        <div className="login-form">
          <p className="login-hint center">
            We'll send a verification link to <strong>{email}</strong>
          </p>
          <button
            className="btn-primary"
            onClick={onSignup}
            disabled={loading}
            type="button"
          >
            {loading ? 'Sending…' : 'Send Verification Email'}
          </button>
          <button className="btn-ghost" onClick={onBackToEmail} type="button">
            ← Use a different email
          </button>
        </div>
      ) : (
        <div className="login-form">
          <div className="login-success-icon">✓</div>
          <p className="login-hint center">Verification link sent to:</p>
          <p className="login-email-display">{email}</p>
          <p className="login-hint center small">
            Click the link in the email to finish creating your account.
            Expires in 15 minutes.
          </p>
          <button className="btn-ghost" onClick={onBackToEmail} type="button">
            ← Back to login
          </button>
        </div>
      )}
    </>
  );
}