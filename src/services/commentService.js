import api from './api';

const commentService = {
  createComment: async (arg1, arg2, arg3) => {
    // Supports createComment(postId, commentData) and createComment(userId, postId, commentData)
    let postId = arg1;
    let commentData = arg2;
    if (arg3 !== undefined) {
      postId = arg2;
      commentData = arg3;
    }
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
