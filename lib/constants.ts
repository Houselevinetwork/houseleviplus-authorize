export const COLORS = {
  BLACK: '#140D0E',
  WHITE: '#FFFFFF',
  RED: '#B33828',
  GREY_96: '#F5F5F5',
  GREY_60: '#999999',
  GREY_56: '#8F8F8F',
} as const;

export const API_BASE_URL = process.env.NEXT_PUBLIC_AUTHORIZE_SERVER_URL || 'http://localhost:3002';
