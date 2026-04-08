'use client';

interface EmailStepProps {
  email: string;
  loading: boolean;
  error: string | null;
  onEmailChange: (email: string) => void;
  onEmailSubmit: (e: React.FormEvent) => void;
}

export function EmailStep({
  email,
  loading,
  error,
  onEmailChange,
  onEmailSubmit,
}: EmailStepProps) {
  return (
    <>
      <div className="login-heading">
        <h1>Welcome back.</h1>
        <p>Sign in to continue watching.</p>
      </div>

      {error && <div className="login-error">{error}</div>}

      <form onSubmit={onEmailSubmit} className="login-form">
        <div className="login-field">
          <label>Email address</label>
          <input
            type="email"
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
            placeholder="you@example.com"
            required
            autoFocus
          />
        </div>
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Please wait…' : 'Continue'}
        </button>
        <p className="login-terms">
          By continuing you agree to our{' '}
          <a href="/terms" target="_blank" rel="noopener noreferrer">
            Terms
          </a>
          {' & '}
          <a href="/privacy" target="_blank" rel="noopener noreferrer">
            Privacy Policy
          </a>
        </p>
      </form>
    </>
  );
}