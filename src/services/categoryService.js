import api from './api';

const categoryService = {
  getAllCategories: async () => {
    const response = await api.get('/categories/');
    return response.data;
  },

  getCategoryById: async (categoryId) => {
    const response = await api.get(`/categories/${categoryId}`);
    return response.data;
  },

  createCategory: async (categoryData) => {
    const response = await api.post('/categories/', categoryData);
    return response.data;
  },

  updateCategory: async (categoryId, categoryData) => {
    const response = await api.put(`/categories/${categoryId}`, categoryData);
    return response.data;
  },

  deleteCategory: async (categoryId) => {
    const response = await api.delete(`/categories/${categoryId}`);
    return response.data;
  }
};

export default categoryService;
