import axiosClient from './axiosClient';

const authApi = {
  register: (data) => axiosClient.post('/auth/register', data),
  verifyRegisterOtp: (data) => axiosClient.post('/auth/verify-register-otp', data),
  resendRegisterOtp: (data) => axiosClient.post('/auth/resend-register-otp', data),
  login: (data) => axiosClient.post('/auth/login', data),
  logout: (refreshToken) => axiosClient.post('/auth/logout', { refreshToken }),
  getProfile: () => axiosClient.get('/auth/me'),
  updateProfile: (data) => axiosClient.put('/auth/profile', data),
  changePassword: (data) => axiosClient.put('/auth/change-password', data),
  forgotPassword: (data) => axiosClient.post('/auth/forgot-password', data),
  resetPassword: (data) => axiosClient.post('/auth/reset-password', data),
};

export default authApi;
