import axios from 'axios';
import { API_BASE_URL } from './constants';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export type AuthErrorCode =
  | 'OTP_INVALID'
  | 'OTP_EXPIRED'
  | 'OTP_MAX_ATTEMPTS'
  | 'DEVICE_LIMIT_REACHED'
  | 'TOKEN_INVALID';

export interface DeviceSummary {
  id: string;
  // Fingerprint hash — what free-slot's {deviceId} body actually needs.
  // Falls back to `id` for safety against backend responses that predate
  // this field, though that fallback will still 400 server-side.
  deviceId?: string;
  deviceName: string;
  platform: string;
  lastActiveAt: string | null;
}

export interface DeviceLimitReachedPayload {
  code: 'DEVICE_LIMIT_REACHED';
  message: string;
  devices: DeviceSummary[];
  deviceManagementToken: string;
}

/**
 * Thrown by every function in this module on a non-2xx response.
 * `code`/`data` are only present when the backend sent a structured error
 * body — network failures etc. just carry `message`.
 */
export class ApiError extends Error {
  code?: AuthErrorCode;
  statusCode?: number;
  data?: unknown;

  constructor(message: string, opts?: { code?: AuthErrorCode; statusCode?: number; data?: unknown }) {
    super(message);
    this.name = 'ApiError';
    this.code = opts?.code;
    this.statusCode = opts?.statusCode;
    this.data = opts?.data;
  }

  /** Narrows `data` to the 409 device-limit payload when code matches. */
  asDeviceLimitReached(): DeviceLimitReachedPayload | null {
    return this.code === 'DEVICE_LIMIT_REACHED' ? (this.data as DeviceLimitReachedPayload) : null;
  }

  /**
   * otp-request's "no account for this email" response is a plain
   * BadRequestException — no `code` field (verified against
   * auth.service.ts requestOTP()). Match on status + message text instead.
   * Backend improvement for later: give this its own AuthErrorCode.
   */
  isEmailNotFound(): boolean {
    return this.statusCode === 400 && /email not found/i.test(this.message);
  }
}

function toApiError(error: unknown): ApiError {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string | string[]; code?: AuthErrorCode } | undefined;

    if (data && typeof data === 'object') {
      const message = Array.isArray(data.message)
        ? data.message.join(', ')
        : data.message || 'Something went wrong. Please try again.';

      return new ApiError(message, {
        code: data.code,
        statusCode: error.response?.status,
        data,
      });
    }

    return new ApiError(error.message || 'Network error. Please check your connection.');
  }

  return new ApiError(error instanceof Error ? error.message : 'Unexpected error.');
}

export interface OtpRequestResult {
  success: boolean;
  message: string;
  expiresIn: number; // seconds the code stays valid (600 = 10 min)
  canResendIn: number; // seconds before a resend is allowed (60)
}

export async function requestOtp(email: string): Promise<OtpRequestResult> {
  try {
    const { data } = await api.post<OtpRequestResult>('/auth/otp-request', { email });
    return data;
  } catch (error) {
    throw toApiError(error);
  }
}

export interface RequestSignupResult {
  success: boolean;
  message: string;
  expiresIn: number; // seconds the verification link stays valid (900 = 15 min)
}

/**
 * Netflix-style signup: the backend emails a verification LINK (not a code)
 * pointing at this app's own /verify-email (FRONTEND_URL). `returnTo` is
 * validated server-side and stored against the token -- not embedded in the
 * emailed link -- so /verify-email never has to trust a client-supplied
 * query param for where to send the user afterward (see verifySignupToken).
 */
export async function requestSignup(email: string, returnTo?: string | null): Promise<RequestSignupResult> {
  try {
    const { data } = await api.post<RequestSignupResult>('/auth/request-signup', {
      email,
      ...(returnTo ? { returnTo } : {}),
    });
    return data;
  } catch (error) {
    throw toApiError(error);
  }
}

export interface AuthUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  emailVerified: boolean;
  isPremium: boolean;
  subscriptionStatus: string;
  role: string;
}

export interface LoginResult {
  success: true;
  message: string;
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  retryLogin?: boolean;
  devices?: DeviceSummary[];
}

/**
 * NOTE: the wire field is `otp`, not `code` — verified directly against
 * services/authorization-server/src/auth/dto/otp-verify.dto.ts. There is
 * also no `purpose` field on this endpoint (only otp-request has one); the
 * ValidationPipe there runs with forbidNonWhitelisted, so sending one would
 * itself produce a 400.
 */
export async function verifyOtp(email: string, otp: string): Promise<LoginResult> {
  try {
    const { data } = await api.post<LoginResult>('/auth/otp-verify', { email, otp });
    return data;
  } catch (error) {
    throw toApiError(error);
  }
}

export async function freeDeviceSlot(deviceManagementToken: string, deviceId: string): Promise<LoginResult> {
  try {
    const { data } = await api.post<LoginResult>(
      '/auth/devices/free-slot',
      { deviceId },
      { headers: { Authorization: `Bearer ${deviceManagementToken}` } },
    );
    return data;
  } catch (error) {
    throw toApiError(error);
  }
}

export interface VerifySignupTokenResult extends LoginResult {
  // The origin the user started signup from (e.g. https://patientzero.houselevi.com),
  // resolved and validated server-side against the houselevi.com allowlist when
  // /auth/request-signup was first called. Null if none was supplied or it didn't
  // pass validation, in which case callers should fall back to the default web app.
  returnTo: string | null;
}

export async function verifySignupToken(token: string): Promise<VerifySignupTokenResult> {
  try {
    const { data } = await api.post<VerifySignupTokenResult>('/auth/verify-token', { token });
    return data;
  } catch (error) {
    throw toApiError(error);
  }
}

export default api;
