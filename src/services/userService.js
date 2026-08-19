import api from './api';

const userService = {
  getAllUsers: async () => {
    const response = await api.get('/users/');
    return response.data;
  },

  deleteUser: async (userId) => {
    const response = await api.delete(`/users/${userId}`);
    return response.data;
  }
};

export default userService;
