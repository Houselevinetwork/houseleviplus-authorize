'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface GreetingStepProps {
  userName: string;
  subscriptionStatus: 'free' | 'premium' | 'guest';
}

export function GreetingStep({ userName, subscriptionStatus }: GreetingStepProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (subscriptionStatus === 'premium') {
      const timer = setTimeout(() => {
        setIsLoading(true);
        setTimeout(() => router.push('/home'), 1200);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [subscriptionStatus, router]);

  if (subscriptionStatus === 'premium') {
    return (
      <>
        <div className="greeting-container">
          <div className="greeting-success">
            <div className="greeting-checkmark">✓</div>
            <h1 className="greeting-title">Welcome to the HL Fold, {userName}!</h1>
            <p className="greeting-subtitle">Your unlimited entertainment awaits</p>
          </div>

          {isLoading && (
            <div className="greeting-loading">
              <div className="greeting-spinner"></div>
              <p>Unlocking your world…</p>
            </div>
          )}
        </div>
      </>
    );
  }

  // FREE PLAN - Subscription pitch
  return (
    <>
      <div className="greeting-container">
        <div className="greeting-welcome">
          <h1 className="greeting-title">Hi {userName}!</h1>
          <p className="greeting-subtitle">One step left to join the HL Fold</p>
        </div>

        <div className="greeting-pitch">
          <div className="pitch-highlight">
            <p className="pitch-main">
              Unlimited <span className="highlight-gold">Theatre • TV Shows • Films</span>
            </p>
            <p className="pitch-secondary">
              Plus exclusive <span className="highlight-gold">HL+ Lifestyle & Travel</span> experiences
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

          <div className="pitch-benefits">
            <div className="benefit-item">
              <span className="benefit-check">✓</span>
              <span className="benefit-text">Premium content in 4K</span>
            </div>
            <div className="benefit-item">
              <span className="benefit-check">✓</span>
              <span className="benefit-text">Download & watch offline</span>
            </div>
            <div className="benefit-item">
              <span className="benefit-check">✓</span>
              <span className="benefit-text">Ad-free experience</span>
            </div>
            <div className="benefit-item">
              <span className="benefit-check">✓</span>
              <span className="benefit-text">Exclusive HL+ member perks</span>
            </div>
          </div>
        </div>

        <div className="greeting-actions">
          <button 
            className="btn-primary btn-join-fold"
            onClick={() => router.push('/choose-plan')}
          >
            Join the HL Fold
          </button>
          <button 
            className="btn-explore"
            onClick={() => router.push('/home')}
          >
            Explore Free Content
          </button>
        </div>
      </div>
    </>
  );
}