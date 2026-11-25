import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || '/api';

const axiosClient = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // Gửi kèm HttpOnly Cookie (Refresh Token)
  headers: {
    'Content-Type': 'application/json',
  },
});

// Tự động đính kèm Access Token vào mỗi request gửi đi
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Tự động làm mới Access Token khi bị hết hạn (401 TOKEN_EXPIRED)
axiosClient.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;
    const errorCode = error.response?.data?.code;

    if (status === 401 && errorCode === 'TOKEN_EXPIRED' && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const storedRefreshToken = localStorage.getItem('refreshToken');
        const res = await axios.post(
          `${BASE_URL}/auth/refresh-token`,
          storedRefreshToken ? { refreshToken: storedRefreshToken } : {},
          { withCredentials: true }
        );

        const { accessToken, refreshToken } = res.data.data;
        localStorage.setItem('accessToken', accessToken);
        if (refreshToken) {
          localStorage.setItem('refreshToken', refreshToken);
        }

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return axiosClient(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.dispatchEvent(new Event('auth:logout'));
        return Promise.reject(refreshError);
      }
    }

    const message = error.response?.data?.message || error.message || 'Có lỗi xảy ra';
    return Promise.reject({ ...error, message });
  }
);

export default axiosClient;
