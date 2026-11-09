import api from './api';

const userService = {
  getAllUsers: async () => {
    const response = await api.get('/users/');
    return response.data;
  },

  deleteUser: async (userId) => {
    const response = await api.delete(`/users/${userId}`);
    return response.data;
  },

  createUser: async (userData) => {
    const response = await api.post('/users/', userData);
    return response.data;
  },

  getUserById: async (userId) => {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  },

  updateUser: async (userId, userData) => {
    const response = await api.put(`/users/${userId}`, userData);
    return response.data;
  },

  // Feature 2 & 6: Follow / Unfollow and Counts
  toggleFollow: async (authorId) => {
    const response = await api.post(`/users/${authorId}/follow`);
    return response.data;
  },

  getFollowStatus: async (authorId) => {
    const response = await api.get(`/users/${authorId}/follow-status`);
    return response.data;
  },

  getFollowers: async (userId) => {
    const response = await api.get(`/users/${userId}/followers`);
    return response.data;
  },

  getFollowing: async (userId) => {
    const response = await api.get(`/users/${userId}/following`);
    return response.data;
  },

  // Feature 3: Subscribe to Authors
  toggleSubscribe: async (authorId) => {
    const response = await api.post(`/users/${authorId}/subscribe`);
    return response.data;
  },

  getSubscribeStatus: async (authorId) => {
    const response = await api.get(`/users/${authorId}/subscribe-status`);
    return response.data;
  },

  getMySubscriptions: async () => {
    const response = await api.get('/users/subscriptions/my-subscriptions');
    return response.data;
  }
};

export default userService;
