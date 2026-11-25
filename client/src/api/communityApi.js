import axiosClient from './axiosClient';

const communityApi = {
  // Posts
  getPosts: (params) => axiosClient.get('/posts', { params }),
  deletePost: (id) => axiosClient.delete(`/posts/${id}`),
  getPostComments: (postId) => axiosClient.get(`/posts/${postId}/comments`),
  deletePostComment: (commentId) => axiosClient.delete(`/posts/comments/${commentId}`),

  // Reviews
  getAllReviews: (params) => axiosClient.get('/reviews', { params }),
  deleteReview: (id) => axiosClient.delete(`/reviews/${id}`),
};

export default communityApi;
