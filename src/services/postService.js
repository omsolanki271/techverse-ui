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
    const response = await api.get('/posts/search', { params: { keyword, ...params } });
    return response.data;
  },

  deletePost: async (postId) => {
    const response = await api.delete(`/posts/${postId}`);
    return response.data;
  },

  uploadPostImage: async (postId, file) => {
    const formData = new FormData();
    formData.append('image', file);
    const response = await api.post(`/posts/image/upload/${postId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getPostImage: (postId) => {
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081/api';
    return `${baseUrl}/posts/image/${postId}`;
  },

  // Feature 1 & 7: Likes
  toggleLike: async (postId) => {
    const response = await api.post(`/posts/${postId}/like`);
    return response.data;
  },

  getLikeStatus: async (postId) => {
    const response = await api.get(`/posts/${postId}/like-status`);
    return response.data;
  },

  // Feature 4 & 8: Bookmarks
  toggleBookmark: async (postId) => {
    const response = await api.post(`/posts/${postId}/bookmark`);
    return response.data;
  },

  getBookmarkStatus: async (postId) => {
    const response = await api.get(`/posts/${postId}/bookmark-status`);
    return response.data;
  },

  getMyBookmarks: async (params = {}) => {
    const response = await api.get('/posts/bookmarks/my-bookmarks', { params });
    return response.data;
  },

  // Feature 5: Share counter
  incrementShare: async (postId) => {
    const response = await api.post(`/posts/${postId}/share`);
    return response.data;
  },

  // Feature 9 & 10: Draft functionality
  publishPost: async (postId) => {
    const response = await api.put(`/posts/${postId}/publish`);
    return response.data;
  },

  getMyDrafts: async (params = {}) => {
    const response = await api.get('/posts/drafts/my-drafts', { params });
    return response.data;
  },

  getUserPostCounts: async (userId) => {
    const response = await api.get(`/posts/user/${userId}/counts`);
    return response.data;
  }
};

export default postService;
