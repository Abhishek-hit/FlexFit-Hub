import apiClient from './axiosClient';

export const authApi = {
  registerOwner: (payload) => apiClient.post('/auth/register/owner', payload),
  registerMember: (payload) => apiClient.post('/auth/register/member', payload),
  login: (payload) => apiClient.post('/auth/login', payload),
  sendOtp: (payload) => apiClient.post('/auth/otp/send', payload),
  verifyOtp: (payload) => apiClient.post('/auth/otp/verify', payload),
  forgotPassword: (payload) => apiClient.post('/auth/forgot-password', payload),
  resetPassword: (payload) => apiClient.post('/auth/reset-password', payload),
};
