export const COLORS = {
  BLACK: '#140D0E',
  WHITE: '#FFFFFF',
  RED: '#B33828',
  GREY_96: '#F5F5F5',
  GREY_60: '#999999',
  GREY_56: '#8F8F8F',
} as const;

export const API_BASE_URL = process.env.NEXT_PUBLIC_AUTH_API_URL || 'http://localhost:4000';

// Fail loud rather than silently ship a login page that posts credentials
// over plaintext HTTP. Local dev (NODE_ENV=development) is exempt since
// localhost has no TLS.
if (process.env.NODE_ENV === 'production' && !API_BASE_URL.startsWith('https://')) {
  throw new Error(
    `NEXT_PUBLIC_AUTH_API_URL must be an https:// URL in production (got: "${API_BASE_URL}")`,
  );
}
