import api from './api';

const postService = {
  createPost: async (categoryId, postData) => {
    // API maps to POST /api/posts/category/{categoryId}/posts
    const response = await api.post(`/posts/category/${categoryId}/posts`, postData);
    return response.data;
  },

  updatePost: async (postId, postData) => {
    const response = await api.put(`/posts/${postId}`, postData);
    return response.data;
  },

  getAllPosts: async (params = {}) => {
    // API maps to GET /api/posts/
    // It accepts pageNumber, pageSize, sortBy, sortDirection as params
    const response = await api.get('/posts/', { params });
    return response.data;
  },

  getPostById: async (postId) => {
    const response = await api.get(`/posts/${postId}`);
    return response.data;
  },

  getPostsByUser: async (userId, params = {}) => {
    const response = await api.get(`/posts/user/${userId}/posts`, { params });
    return response.data;
  },

  getPostsByCategory: async (categoryId, params = {}) => {
    const response = await api.get(`/posts/category/${categoryId}/posts`, { params });
    return response.data;
  },

  searchPosts: async (keyword, params = {}) => {
    // API maps to GET /api/posts/search?keyword=...
    // The backend endpoint returns a List<PostDto>, not a paginated PostResponse.
    const response = await api.get('/posts/search', { params: { keyword, ...params } });
    return response.data;
  },

  deletePost: async (postId) => {
    const response = await api.delete(`/posts/${postId}`);
    return response.data;
  },

  getPostImage: (postId) => {
    // Return the URL directly using the base URL
    // We assume VITE_API_BASE_URL is something like "http://localhost:8081/api"
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081/api';
    return `${baseUrl}/posts/image/${postId}`;
  }
};

export default postService;
