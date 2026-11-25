import axiosClient from './axiosClient';

const userApi = {
  getAll: (params) => axiosClient.get('/users', { params }),
  update: (id, data) => axiosClient.put(`/users/${id}`, data),
  delete: (id) => axiosClient.delete(`/users/${id}`),
};

export default userApi;
