'use client';

import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { verifySignupToken, ApiError } from '@/lib/api';

const webAppUrl = process.env.NEXT_PUBLIC_WEB_APP_URL || 'https://houselevi.com';

type Status = 'verifying' | 'failed';

export function VerifyEmailSection() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<Status>('verifying');
  const [error, setError] = useState('');
  // Effects run twice under React Strict Mode in dev; the token is single-use
  // server-side, so a duplicate call would otherwise surface a spurious error.
  const requested = useRef(false);

  useEffect(() => {
    if (requested.current) return;
    requested.current = true;

    const token = searchParams.get('token');
    if (!token) {
      setStatus('failed');
      setError('This link is missing its verification code. Please check your email and try again.');
      return;
    }

    verifySignupToken(token)
      .then((result) => {
        // returnTo was resolved and validated server-side when the signup
        // email was requested -- this page never reads returnTo from its own
        // query string, so it can't be redirected anywhere the backend didn't
        // already approve.
        const redirectBase = result.returnTo || webAppUrl;
        window.location.href = `${redirectBase}/auth/callback?code=${result.accessToken}`;
      })
      .catch((err) => {
        setStatus('failed');
        setError(
          err instanceof ApiError
            ? err.message
            : 'Something went wrong verifying your email. Please try again.',
        );
      });
  }, [searchParams]);

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
          <div className="login-heading">
            <h1>{status === 'verifying' ? 'Verifying your email…' : "Couldn't verify your email"}</h1>
            <p>
              {status === 'verifying'
                ? "Hang on while we finish setting up your account."
                : 'This can happen if the link expired or was already used.'}
            </p>
          </div>

          {error && <div className="login-error">{error}</div>}

          {status === 'failed' && (
            <div className="login-links">
              <a className="btn-text" href="/login">
                Back to sign in
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
