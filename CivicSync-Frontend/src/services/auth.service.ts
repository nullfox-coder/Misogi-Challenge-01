import axios from 'axios';
import type { LoginCredentials, RegisterCredentials, AuthResponse } from '../types/auth';

const API_URL = 'http://localhost:3000/api';

export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  const response = await axios.post<AuthResponse>(`${API_URL}/auth/login`, credentials);
  return response.data;
};

export const register = async (credentials: RegisterCredentials): Promise<AuthResponse> => {
  const response = await axios.post<AuthResponse>(`${API_URL}/auth/register`, credentials);
  return response.data;
}; 