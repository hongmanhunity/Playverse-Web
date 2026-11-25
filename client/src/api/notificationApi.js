import axiosClient from './axiosClient';

const notificationApi = {
  getAll: () => axiosClient.get('/notifications'),
  create: (data) => axiosClient.post('/notifications', data),
  delete: (id) => axiosClient.delete(`/notifications/${id}`),
};

export default notificationApi;
