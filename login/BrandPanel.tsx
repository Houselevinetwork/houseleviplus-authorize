'use client';

interface BrandPanelProps {
  variant?: 'default' | 'carousel';
}

export function BrandPanel({ variant = 'default' }: BrandPanelProps) {
  const isCarousel = variant === 'carousel';

  return (
    <div
      className={`login-brand-section ${
        isCarousel ? 'login-brand-section-carousel' : ''
      }`}
    >
      {/* Left: Text */}
      <div className="login-brand-text">
        <span className="login-brand-eyebrow">House Levi+</span>

        {isCarousel ? (
          <h3>When destiny calls, answer.</h3>
        ) : (
          <>
            <h2>
              When destiny
              <br />
              calls, answer.
            </h2>
            <div className="login-brand-grid">
              <div className="login-brand-card login-brand-card--tall" />
              <div className="login-brand-card" />
              <div className="login-brand-card" />
            </div>
          </>
        )}

        <p>
          Premium entertainment, African stories, and culture — streaming
          everywhere you are.
        </p>

        <div className="login-brand-tag">
          <div className="login-brand-dot" />
          Stream · Download · Experience
        </div>
      </div>

      {/* Right: Floating image panel */}
      <div className="login-brand-image-panel">
        {/* 
          When you have a brand image, replace this div's background 
          in CSS with an img tag like:
          <img src="/your-brand-image.jpg" alt="House Levi+" />
        */}
      </div>
    </div>
  );
}