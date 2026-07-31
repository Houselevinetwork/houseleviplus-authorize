import { Suspense } from 'react';
import { VerifyEmailSection } from '../components/verify-email/VerifyEmailSection';

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: '#ffffff' }} />}>
      <VerifyEmailSection />
    </Suspense>
  );
}
