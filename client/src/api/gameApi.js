import axiosClient from './axiosClient';

const gameApi = {
  getAll: (params) => axiosClient.get('/games', { params }),
  getPopular: () => axiosClient.get('/games/popular'),
  getFlash: () => axiosClient.get('/games/flash'),
  getById: (id) => axiosClient.get(`/games/${id}`),
  create: (data) => axiosClient.post('/games', data),
  update: (id, data) => axiosClient.put(`/games/${id}`, data),
  delete: (id) => axiosClient.delete(`/games/${id}`),
};

export default gameApi;
