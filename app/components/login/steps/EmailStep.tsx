'use client';

interface EmailStepProps {
  email: string;
  loading: boolean;
  error: string | null;
  onEmailChange: (email: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function EmailStep({
  email,
  loading,
  error,
  onEmailChange,
  onSubmit,
}: EmailStepProps) {
  return (
    <>
      {/* Pitch - CENTERED */}
      <div className="landing-pitch">
        <h1 className="landing-title">
          Unlimited <span className="highlight-gold">Entertainment</span>
        </h1>
        <p className="landing-subtitle">
          Access exclusive theatre, shows, films & lifestyle experiences
        </p>
      </div>

      {/* NO PRICING SECTION - REMOVED */}

      {error && <div className="login-error">{error}</div>}

      {/* Email Form */}
      <form onSubmit={onSubmit} className="login-form login-form--landing">
        <div className="login-field">
          <label htmlFor="email">Enter your email to get started</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
            placeholder="you@example.com"
            required
            autoFocus
            disabled={loading}
          />
        </div>
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Please wait…' : 'Get Started'}
        </button>
        <p className="login-terms">
          By continuing you agree to our{' '}
          <a href="/terms" target="_blank" rel="noopener noreferrer">
            Terms
          </a>{' '}
          &{' '}
          <a href="/privacy" target="_blank" rel="noopener noreferrer">
            Privacy Policy
          </a>
        </p>
      </form>
    </>
  );
}