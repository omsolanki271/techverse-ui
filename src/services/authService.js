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
    const payload = {
      ...userData,
      about: userData.about || 'I am a new user on TechVerse.',
    };
    const response = await api.post('/users/', payload);
    return response.data;
  }
};

export default authService;
