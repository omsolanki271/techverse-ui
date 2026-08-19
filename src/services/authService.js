import api from './api';

const authService = {
  login: async (username, password) => {
    try {
      const response = await api.post('/auth/login', {
        email: username,
        password: password
      });
      return response.data; // Expected to return { token, user: {...} }
    } catch (error) {
      throw error;
    }
  },

  register: async (userData) => {
    try {
      // Backend UserDto requires 'about' field, but the frontend Register UI might not have it.
      if (!userData.about) {
        userData.about = 'I am a new user on TechVerse.';
      }
      const response = await api.post('/users/', userData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default authService;
