import axiosClient from './axiosClient';

const bannerApi = {
  getAll: () => axiosClient.get('/banners'),
  create: (data) => axiosClient.post('/banners', data),
  update: (id, data) => axiosClient.put(`/banners/${id}`, data),
  delete: (id) => axiosClient.delete(`/banners/${id}`),
};

export default bannerApi;
