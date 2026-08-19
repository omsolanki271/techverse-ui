import api from './api';

const commentService = {
  createComment: async (userId, postId, commentData) => {
    // Note: API maps to POST /api/comments/post/{postId}
    const response = await api.post(`/comments/post/${postId}`, commentData);
    return response.data;
  },

  getCommentsByPost: async (postId) => {
    const response = await api.get(`/comments/post/${postId}`);
    return response.data;
  },

  getAllComments: async () => {
    const response = await api.get('/comments/');
    return response.data;
  },

  deleteComment: async (commentId) => {
    const response = await api.delete(`/comments/${commentId}`);
    return response.data;
  }
};

export default commentService;
