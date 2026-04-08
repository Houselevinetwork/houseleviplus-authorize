import { Suspense } from 'react';
import { LoginSection } from '../components/login/LoginSection';

export default function LoginPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: '#0f1923' }} />}>
      <LoginSection />
    </Suspense>
  );
}