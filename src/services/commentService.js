import { delay, getDb, setDb } from './mockDb';

const commentService = {
  createComment: async (userId, postId, commentData) => {
    await delay(400);
    const comments = getDb('comments');
    
    // Get user details
    const users = getDb('users');
    const user = users.find(u => u.id === userId || u.userId === userId) || { name: 'Anonymous' };
    
    const newComment = {
      commentId: `com_${Date.now()}`,
      content: commentData.content,
      postId,
      user: {
        id: user.id || user.userId,
        name: user.name,
        username: user.username
      },
      addedDate: new Date().toISOString()
    };
    
    comments.push(newComment);
    setDb('comments', comments);
    return newComment;
  },

  getCommentsByPost: async (postId) => {
    await delay(300);
    const comments = getDb('comments').filter(c => c.postId === postId);
    // Sort descending by date
    return comments.sort((a, b) => new Date(b.addedDate).getTime() - new Date(a.addedDate).getTime());
  },

  getAllComments: async () => {
    await delay(500);
    const comments = getDb('comments');
    return comments.sort((a, b) => new Date(b.addedDate).getTime() - new Date(a.addedDate).getTime());
  },

  deleteComment: async (commentId) => {
    await delay(400);
    const comments = getDb('comments');
    setDb('comments', comments.filter(c => c.commentId !== commentId));
    return { success: true };
  }
};

export default commentService;
