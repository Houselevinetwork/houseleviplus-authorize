import axios from 'axios';
import { API_BASE_URL } from './constants';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface LoginRequest {
  email: string;
  password: string;
  state: string;
  nonce: string;
}

export interface LoginResponse {
  success: boolean;
  code?: string;
  state?: string;
  error?: string;
}

export async function login(data: LoginRequest): Promise<LoginResponse> {
  try {
    const response = await api.post('/auth/login', data);
    return response.data;
  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data?.message || error.message || 'Login failed',
    };
  }
}

export default api;
