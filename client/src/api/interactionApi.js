import axiosClient from './axiosClient';

const interactionApi = {
  // Reviews
  getReviewsByGame: (gameId, params) => axiosClient.get(`/reviews/game/${gameId}`, { params }),
  addReview: (gameId, data) => axiosClient.post(`/reviews/game/${gameId}`, data),

  // Wishlist
  getWishlist: () => axiosClient.get('/wishlist'),
  toggleWishlist: (gameId) => axiosClient.post(`/wishlist/toggle/${gameId}`),

  // Leaderboard
  getGlobalLeaderboard: () => axiosClient.get('/leaderboards/global'),
  getGameLeaderboard: (gameId) => axiosClient.get(`/leaderboards/game/${gameId}`),
};

export default interactionApi;
