import axiosClient from './axiosClient';

const communityApi = {
  // Posts
  getPosts: (params) => axiosClient.get('/posts', { params }),
  createPost: (data) => axiosClient.post('/posts', data),
  toggleLikePost: (id) => axiosClient.post(`/posts/${id}/like`),
  deletePost: (id) => axiosClient.delete(`/posts/${id}`),
  getPostComments: (postId) => axiosClient.get(`/posts/${postId}/comments`),
  addPostComment: (postId, data) => axiosClient.post(`/posts/${postId}/comments`, data),
  deletePostComment: (commentId) => axiosClient.delete(`/posts/comments/${commentId}`),

  // Reviews
  getAllReviews: (params) => axiosClient.get('/reviews', { params }),
  deleteReview: (id) => axiosClient.delete(`/reviews/${id}`),
};

export default communityApi;
