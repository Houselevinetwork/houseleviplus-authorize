'use client';

import { useState } from 'react';
import { useAuth } from '@houselevi/auth';
import { useAuthContext } from '@houselevi/auth';
import { HeroCarousel } from './HeroCarousel';
import { BrandPanel } from './BrandPanel';
import { useHeroCarousel } from '../../lib/hooks/useHeroCarousel';
import './login-section.css';
import './greeting-step.css';

type SubscriptionStatus = 'free' | 'premium' | 'guest';

// ─── Right Panel (shared across all states) ────────────────────────────────
function RightPanel({
  heroItems,
  currentSlide,
  setCurrentSlide,
  heroLoading,
}: {
  heroItems: any[];
  currentSlide: number;
  setCurrentSlide: (n: number) => void;
  heroLoading: boolean;
}) {
  return (
    <div className="login-right">
      <div className="login-right-inner">
        {!heroLoading && heroItems.length > 0 ? (
          <>
            <HeroCarousel
              items={heroItems}
              currentSlide={currentSlide}
              onSlideChange={setCurrentSlide}
            />
            <BrandPanel variant="carousel" />
          </>
        ) : (
          <BrandPanel variant="default" />
        )}
      </div>
    </div>
  );
}

// ─── Logo ──────────────────────────────────────────────────────────────────
function Logo() {
  return (
    <button
      className="login-logo"
      onClick={() => (window.location.href = '/')}
      type="button"
    >
      HOUSE LEVI<span>+</span>
    </button>
  );
}

export function LoginSection() {
  const {
    step,
    email,
    otp,
    loading,
    error,
    handleEmailSubmit,
    handleOTPSubmit,
    handleSignupRequest,
    handleResendOTP,
    backToEmail,
    setEmail,
    setOtp,
  } = useAuth();

  const { isAuthenticated, user, isLoading: authLoading } = useAuthContext();
  const [emailSent, setEmailSent] = useState(false);
  const { heroItems, currentSlide, setCurrentSlide, loading: heroLoading } =
    useHeroCarousel();

  const handleSignup = async () => {
    await handleSignupRequest();
    setEmailSent(true);
  };

  const subscriptionStatus: SubscriptionStatus = !isAuthenticated
    ? 'guest'
    : user?.isPremium && user?.subscriptionStatus === 'ACTIVE'
      ? 'premium'
      : 'free';

  const rightPanel = (
    <RightPanel
      heroItems={heroItems}
      currentSlide={currentSlide}
      setCurrentSlide={setCurrentSlide}
      heroLoading={heroLoading}
    />
  );

  // ── Loading ──────────────────────────────────────────────────────────────
  if (authLoading) {
    return (
      <div className="login-root">
        <div className="login-left">
          <div className="login-form-wrap">
            <Logo />
            <div className="login-loading">Loading...</div>
          </div>
        </div>
        {rightPanel}
      </div>
    );
  }

  // ── STATE 3: Premium user ────────────────────────────────────────────────
  if (isAuthenticated && user && subscriptionStatus === 'premium') {
    const userFirstName = user.firstName || email.split('@')[0];
    return (
      <div className="login-root">
        <div className="login-left">
          <div className="login-form-wrap">
            <Logo />
            <div className="greeting-container">
              <div className="greeting-success">
                <div className="greeting-checkmark">✓</div>
                <h1 className="greeting-title">
                  Welcome to the HL Fold, {userFirstName}!
                </h1>
                <p className="greeting-subtitle">
                  Your unlimited entertainment awaits
                </p>
              </div>
            </div>
            <button
              className="btn-primary"
              onClick={() => (window.location.href = '/entertainment')}
              style={{ marginTop: '24px' }}
            >
              Start Watching
            </button>
          </div>
        </div>
        {rightPanel}
      </div>
    );
  }

  // ── STATE 2: Logged in, free user ────────────────────────────────────────
  if (isAuthenticated && user && subscriptionStatus === 'free') {
    const userFirstName = user.firstName || email.split('@')[0];
    return (
      <div className="login-root">
        <div className="login-left">
          <div className="login-form-wrap">
            <Logo />
            <div className="greeting-container">
              <div className="greeting-welcome">
                <h1 className="greeting-title">Hi {userFirstName}!</h1>
                <p className="greeting-subtitle">
                  One step left to join the HL Fold
                </p>
              </div>

              <div className="greeting-pitch">
                <div className="pitch-highlight">
                  <p className="pitch-main">
                    Unlimited{' '}
                    <span className="highlight-gold">
                      Theatre • TV Shows • Films
                    </span>
                  </p>
                  <p className="pitch-secondary">
                    Plus exclusive{' '}
                    <span className="highlight-gold">
                      HL+ Lifestyle & Travel
                    </span>{' '}
                    experiences
                  </p>
                </div>

                <div className="pitch-pricing">
                  <p className="pricing-lead">Join the HL Fold from</p>
                  <div className="pricing-amount">
                    <span className="currency">Ksh</span>
                    <span className="amount">299</span>
                    <span className="period">/month</span>
                  </div>
                  <p className="pricing-note">Cancel anytime. No commitment.</p>
                </div>


              </div>

              <div className="greeting-actions">
                <button
                  className="btn-primary btn-join-fold"
                  onClick={() => (window.location.href = '/choose-plan')}
                >
                  Join the HL Fold
                </button>
                <button
                  className="btn-explore"
                  onClick={() => (window.location.href = '/entertainment')}
                >
                  Explore Free Content
                </button>
              </div>
            </div>
          </div>
        </div>
        {rightPanel}
      </div>
    );
  }

  // ── STATE 1: Logged out — Netflix-style landing with inline email ─────────
  // OTP step — show otp input if we're past email submission
  if (step === 'otp') {
    return (
      <div className="login-root">
        <div className="login-left">
          <div className="login-form-wrap">
            <Logo />
            <div className="login-heading">
              <h1>Check your email.</h1>
              <p>We sent a code to <strong>{email}</strong></p>
            </div>
            {error && <div className="login-error">{error}</div>}
            <form onSubmit={handleOTPSubmit} className="login-form">
              <div className="login-field">
                <label>Enter your code</label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="······"
                  autoFocus
                  required
                />
              </div>
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Verifying…' : 'Confirm'}
              </button>
              <div className="login-links">
                <button
                  type="button"
                  className="btn-text"
                  onClick={handleResendOTP}
                  disabled={loading}
                >
                  Resend code
                </button>
                <button
                  type="button"
                  className="btn-text"
                  onClick={backToEmail}
                >
                  Use a different email
                </button>
              </div>
            </form>
          </div>
        </div>
        {rightPanel}
      </div>
    );
  }

  // signup step
  if (step === 'signup') {
    return (
      <div className="login-root">
        <div className="login-left">
          <div className="login-form-wrap">
            <Logo />
            <div className="login-heading">
              <h1>New here?</h1>
              <p>Create your HL+ account to get started.</p>
            </div>
            {error && <div className="login-error">{error}</div>}
            <div className="login-form">
              <button
                className="btn-primary"
                onClick={handleSignup}
                disabled={loading}
              >
                {loading ? 'Creating account…' : 'Create Account'}
              </button>
              <button
                type="button"
                className="btn-text"
                onClick={backToEmail}
              >
                Back
              </button>
            </div>
          </div>
        </div>
        {rightPanel}
      </div>
    );
  }

  // Default: logged-out landing page (email step embedded in pitch)
  return (
    <div className="login-root login-root--landing">
      <div className="login-left login-left--landing">
        <div className="login-form-wrap">
          <Logo />

          {/* Pitch always visible for logged-out users */}
          <div className="landing-pitch">
            <h1 className="landing-title">
              Unlimited <span className="highlight-gold">Theatre • TV Shows • Films</span>
            </h1>
            <p className="landing-subtitle">
              Plus exclusive{' '}
              <span className="highlight-gold">HL+ Lifestyle & Travel</span>{' '}
              experiences
            </p>
          </div>

          {/* Pricing above email input */}
          <div className="landing-pricing">
            <p className="pricing-lead">
              Join the HL Fold from <strong>Ksh 299/month</strong>
            </p>
            <p className="pricing-note">Cancel anytime. No commitment.</p>
          </div>

          {/* Email input inline */}
          {error && <div className="login-error">{error}</div>}
          <form onSubmit={handleEmailSubmit} className="login-form login-form--landing">
            <div className="login-field">
              <label>Enter your email to get started</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                autoFocus
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
        </div>
      </div>
      {rightPanel}
    </div>
  );
}